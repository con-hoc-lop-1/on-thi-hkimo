// Local save server for direct file overwrite in debug mode
// Usage: npm run save-server

const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 4500;
const AUTH_TOKEN = process.env.SAVE_TOKEN || "hkimo-local-dev";

app.use(cors({ origin: [/^http:\/\/localhost:\d+$/] }));
app.use(express.json({ limit: "5mb" }));

const WHITELIST_DATA_TYPES = new Set(["preliminary", "heat"]);
const WHITELIST_FILES = new Set([
  "arithmetic.json",
  "combinatorics.json",
  "geometry.json",
  "logic-thinking.json",
  "number-theory.json",
]);

// Use a shadow database folder so editing does not touch CRA-watched public files
const SHADOW_ROOT = path.resolve(__dirname, "..", "cache", ".shadow-database");

function getPublicPath(dataType, file) {
  if (!WHITELIST_DATA_TYPES.has(dataType)) return null;
  if (!WHITELIST_FILES.has(file)) return null;
  const target = path.resolve(
    __dirname,
    "..",
    "public",
    "database",
    dataType,
    file
  );
  const dbRoot = path.resolve(__dirname, "..", "public", "database");
  if (!target.startsWith(dbRoot)) return null;
  return target;
}

function getShadowPath(dataType, file) {
  if (!WHITELIST_DATA_TYPES.has(dataType)) return null;
  if (!WHITELIST_FILES.has(file)) return null;
  const target = path.resolve(SHADOW_ROOT, dataType, file);
  const root = path.resolve(SHADOW_ROOT);
  if (!target.startsWith(root)) return null;
  return target;
}

function ensureDir(p) {
  const dir = path.dirname(p);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

// Serve database from shadow first, fallback to public on first use
app.get("/api/database/:dataType/:file", (req, res) => {
  try {
    const { dataType, file } = req.params;
    const shadowPath = getShadowPath(dataType, file);
    const publicPath = getPublicPath(dataType, file);
    if (!shadowPath || !publicPath) return res.status(400).send("Invalid path");

    let srcPath = fs.existsSync(shadowPath) ? shadowPath : publicPath;
    if (!fs.existsSync(srcPath)) return res.status(404).send("Not found");

    // If shadow not exist, initialize it from public (first time only)
    if (srcPath === publicPath) {
      try {
        ensureDir(shadowPath);
        fs.copyFileSync(publicPath, shadowPath);
      } catch (e) {
        // ignore copy error; we still respond with public content
      }
    }

    const text = fs.readFileSync(srcPath, "utf8");
    const json = JSON.parse(text);
    if (!Array.isArray(json))
      return res.status(500).send("Invalid data format");
    res.json(json);
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal error");
  }
});

// Save to shadow only to avoid CRA full reload
app.put("/api/save/:dataType/:file", async (req, res) => {
  try {
    const token = req.header("X-Auth-Token");
    if (token !== AUTH_TOKEN) {
      return res.status(401).send("Unauthorized");
    }

    const { dataType, file } = req.params;
    const targetPath = getShadowPath(dataType, file);
    if (!targetPath) return res.status(400).send("Invalid path");

    // Validate body: must be an array of objects (questions)
    const bodyText = JSON.stringify(req.body);
    let data;
    try {
      data = JSON.parse(bodyText);
    } catch (e) {
      return res.status(400).send("Body must be valid JSON");
    }
    if (!Array.isArray(data)) {
      return res.status(400).send("Body must be an array");
    }

    // Create backup in shadow if exists
    if (fs.existsSync(targetPath)) {
      const ts = new Date().toISOString().replace(/[:.]/g, "-");
      const backupPath = targetPath.replace(/\.json$/i, `.${ts}.bak.json`);
      try {
        fs.copyFileSync(targetPath, backupPath);
      } catch (e) {
        console.warn("Cannot create backup:", e);
      }
    } else {
      ensureDir(targetPath);
    }

    // Write pretty JSON
    const text = JSON.stringify(data, null, 2) + "\n";
    fs.writeFileSync(targetPath, text, "utf8");

    res.json({ ok: true, path: targetPath });
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal error");
  }
});

app.listen(PORT, () => {
  console.log(`Save server listening on http://localhost:${PORT}`);
});
