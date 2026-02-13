// ================== FIGURE RENDERERS (JS version) ==================

import { useRef } from "react";

function SvgIcon({ kind, size = 48, className = "" }) {
  const s = size,
    r = s / 2,
    stroke = 2;
  const common = { fill: "none", stroke: "currentColor", strokeWidth: stroke };
  switch (kind) {
    case "●":
      return (
        <svg
          width={s}
          height={s}
          viewBox={`0 0 ${s} ${s}`}
          className={className}
          aria-label={kind}
          role="img"
        >
          <circle cx={r} cy={r} r={r - stroke} {...common} />
        </svg>
      );
    case "■":
      return (
        <svg
          width={s}
          height={s}
          viewBox={`0 0 ${s} ${s}`}
          className={className}
          aria-label={kind}
          role="img"
        >
          <rect
            x={stroke}
            y={stroke}
            width={s - 2 * stroke}
            height={s - 2 * stroke}
            rx="6"
            {...common}
          />
        </svg>
      );
    case "▲":
      return (
        <svg
          width={s}
          height={s}
          viewBox={`0 0 ${s} ${s}`}
          className={className}
          aria-label={kind}
          role="img"
        >
          <polygon
            points={`${r},${stroke} ${s - stroke},${s - stroke} ${stroke},${s - stroke}`}
            {...common}
          />
        </svg>
      );
    case "◆":
      return (
        <svg
          width={s}
          height={s}
          viewBox={`0 0 ${s} ${s}`}
          className={className}
          aria-label={kind}
          role="img"
        >
          <polygon
            points={`${r},${stroke} ${s - stroke},${r} ${r},${s - stroke} ${stroke},${r}`}
            {...common}
          />
        </svg>
      );
    case "⊕":
      return (
        <svg
          width={s}
          height={s}
          viewBox={`0 0 ${s} ${s}`}
          className={className}
          aria-label={kind}
          role="img"
        >
          <circle cx={r} cy={r} r={r - stroke} {...common} />
          <line
            x1={r}
            y1={stroke * 1.2}
            x2={r}
            y2={s - stroke * 1.2}
            {...common}
          />
          <line
            x1={stroke * 1.2}
            y1={r}
            x2={s - stroke * 1.2}
            y2={r}
            {...common}
          />
        </svg>
      );
    default:
      return (
        <div
          className={`d-inline-flex align-items-center justify-content-center figure-item ${className}`}
          style={{ width: s, height: s, fontSize: s * 0.6 }}
        >
          {kind}
        </div>
      );
  }
}
// Q2/Q20: ma trận biểu tượng
function SymbolPattern({ grid }) {
  const cols = grid?.[0]?.length || 0;
  return (
    <div className="border rounded p-3 bg-white">
      <div
        className="d-grid"
        style={{
          gridTemplateColumns: `repeat(${cols}, minmax(30px, 42px))`,
          gap: 6,
        }}
      >
        {grid.flatMap((row, i) =>
          row.map((cell, j) => (
            <div
              key={`${i}-${j}`}
              className="d-flex align-items-center justify-content-center border rounded figure-item"
              style={{ aspectRatio: "1 / 1", minWidth: 30 }}
            >
              {cell === "?" ? (
                <span className="fw-bold">?</span>
              ) : (
                <SvgIcon kind={cell} size={30} />
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// Q5: nhóm lặp một symbol
function GroupRepeats({ symbol, groups }) {
  return (
    <div className="border rounded p-3 bg-white">
      {groups.map((g, idx) => (
        <div key={idx} className="d-flex align-items-center mb-2">
          <span className="text-muted me-2" style={{ width: 28 }}>
            #{idx + 1}
          </span>
          <div className="d-flex flex-wrap gap-2">
            {g === "?" ? (
              <div
                className="border rounded d-flex align-items-center justify-content-center figure-item"
                style={{ width: 40, height: 40 }}
              >
                ?
              </div>
            ) : (
              Array.from({ length: g }).map((_, k) => (
                <SvgIcon key={k} kind={symbol} size={28} />
              ))
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
function GroupRepeatsGrid({ symbol, groups }) {
  return (
    <div className="d-flex gap-3">
      {groups.map((group, idx) => (
        <div
          key={idx}
          className="border rounded p-2 bg-white d-flex flex-column align-items-center"
        >
          <div className="text-muted mb-1">#{idx + 1}</div>

          {/* Case: dấu ? */}
          {group === "?" ? (
            <div
              className="border rounded d-flex align-items-center justify-content-center"
              style={{ width: 48, height: 48 }}
            >
              ?
            </div>
          ) : (
            <div
              className="d-grid"
              style={{
                gridTemplateColumns: `repeat(${group.length}, 1fr)`,
                gap: 6,
              }}
            >
              {group.flat().map((cell, i) => (
                <div
                  key={i}
                  className="border rounded d-flex align-items-center justify-content-center"
                  style={{ width: 40, height: 40 }}
                >
                  {cell ? <SvgIcon kind={symbol} size={24} /> : null}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// Q11: hai “thùng” để so sánh/move cho bằng
function GridSquareTables({ data = [[]] }) {
  if (!Array.isArray(data) || data.length === 0) return null;

  return (
    <table
      className="mx-auto border-collapse"
      style={{ borderSpacing: 0, borderCollapse: "collapse" }}
    >
      <tbody>
        {data.map((row, i) => (
          <tr key={i}>
            {row.map((cell, j) => (
              <td
                key={j}
                style={{
                  width: 30,
                  height: 30,
                  border: cell ? "1px solid black" : "none",
                  padding: 0,
                }}
              />
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
function TwoBins({ left, right, symbol = "●", labels = ["Left", "Right"] }) {
  return (
    <div className="d-flex gap-3">
      {[left, right].map((n, i) => (
        <div key={i} className="rounded border p-3" style={{ minWidth: 180 }}>
          <div className="mb-2 text-center fw-medium">{labels[i]}</div>
          <div className="d-flex flex-wrap gap-2" style={{ maxWidth: 150 }}>
            {Array.from({ length: n }).map((_, k) => (
              <SvgIcon
                className="figure-item"
                key={k}
                kind={symbol}
                size={28}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// Q17: khối lập phương isometric đơn giản
function IsoCubes({ layout = [], unit = 18 }) {
  const u = unit;
  const h = u; // chiều cao khối theo trục z

  const depth = layout.length;
  const rows = layout[0]?.length || 0;
  const cols = layout[0]?.[0]?.length || 0;

  // bảng màu cho từng tầng
  const palette = [
    "#f28b82",
    "#fbbc04",
    "#34a853",
    "#4285f4",
    "#9c27b0",
    "#ff6d00",
  ];

  const items = [];
  for (let z = 0; z < depth; z++) {
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        if (layout[z][i][j]) {
          const cx = (j - i) * u;
          const cy = (j + i) * (u * 0.5) - z * h;
          items.push({ cx, cy, i, j, z });
        }
      }
    }
  }

  // tính khung bao
  let minX = Infinity,
    minY = Infinity,
    maxX = -Infinity,
    maxY = -Infinity;
  items.forEach(({ cx, cy }) => {
    minX = Math.min(minX, cx - u);
    maxX = Math.max(maxX, cx + u);
    minY = Math.min(minY, cy - u / 2);
    maxY = Math.max(maxY, cy + u / 2 + h);
  });
  const margin = 8;
  const W = (maxX - minX || 0) + margin * 2;
  const H = (maxY - minY || 0) + margin * 2;

  // vẽ 1 khối với màu dựa vào tầng z
  function Cube({ cx, cy, z }) {
    const tx = cx - minX + margin;
    const ty = cy - minY + margin;
    const base = palette[z % palette.length];
    const top = shadeColor(base, 40);
    const left = shadeColor(base, -10);
    const right = shadeColor(base, -30);

    const topPts = `0,${-u / 2} ${u},0 0,${u / 2} ${-u},0`;
    const leftPts = `${-u},0 0,${u / 2} 0,${u / 2 + h} ${-u},${h}`;
    const rightPts = `0,${u / 2} ${u},0 ${u},${h} 0,${u / 2 + h}`;

    return (
      <g transform={`translate(${tx},${ty})`}>
        <polygon points={topPts} fill={top} stroke="#000" />
        <polygon points={leftPts} fill={left} stroke="#000" />
        <polygon points={rightPts} fill={right} stroke="#000" />
      </g>
    );
  }

  // hàm pha màu sáng/tối
  function shadeColor(color, percent) {
    const num = parseInt(color.replace("#", ""), 16);
    let r = (num >> 16) + percent;
    let g = ((num >> 8) & 0x00ff) + percent;
    let b = (num & 0x0000ff) + percent;
    r = Math.max(Math.min(255, r), 0);
    g = Math.max(Math.min(255, g), 0);
    b = Math.max(Math.min(255, b), 0);
    return `rgb(${r},${g},${b})`;
  }

  // vẽ xa → gần
  items.sort((a, b) => a.i + a.j + a.z - (b.i + b.j + b.z));

  return (
    <svg
      width={W}
      height={H}
      viewBox={`0 0 ${W} ${H}`}
      className="bg-white border rounded"
    >
      {items.map((p, idx) => (
        <Cube key={idx} {...p} />
      ))}
    </svg>
  );
}

function RegularPolygon({
  sides = 6,
  size = 280,
  radiusJitter = 0.6,
  minEdge = 12,
}) {
  const cx = size / 2;
  const cy = size / 2;
  const baseR = size / 2 - 6;

  const pointsRef = useRef(null);

  if (!pointsRef.current) {
    const step = (2 * Math.PI) / sides;
    const pts = [];

    for (let i = 0; i < sides; i++) {
      const angle = -Math.PI / 2 + i * step;
      const rr = baseR * (0.3 + Math.random() * radiusJitter);
      let x = cx + rr * Math.cos(angle);
      let y = cy + rr * Math.sin(angle);
      pts.push({ x, y });
    }

    for (let i = 0; i < pts.length; i++) {
      const j = (i + 1) % pts.length;
      const dx = pts[j].x - pts[i].x;
      const dy = pts[j].y - pts[i].y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < minEdge) {
        const factor = minEdge / (dist + 0.001);
        pts[j].x = cx + (pts[j].x - cx) * factor;
        pts[j].y = cy + (pts[j].y - cy) * factor;
      }
    }

    pointsRef.current = pts;
  }

  const points = pointsRef.current;
  const ptsStr = points.map((p) => `${p.x},${p.y}`).join(" ");

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className="rounded border bg-white"
    >
      <polygon
        points={ptsStr}
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
      />
      {points.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={3} fill="black" stroke="none" />
      ))}
    </svg>
  );
}

// Q19: chồng khối (hỏi phần tử trên cùng)
function StackPattern({ stacks }) {
  return (
    <div className="d-flex gap-3">
      {stacks.map((stack, i) => (
        <div key={i} className="d-flex flex-column align-items-center">
          <div
            className="border rounded d-flex flex-column align-items-center justify-content-start p-2 gap-2"
            style={{ height: "auto", width: 112 }}
          >
            {stack[0] === "?" ? (
              <span className="fs-3 mt-auto">?</span>
            ) : (
              stack.map((s, k) => <SvgIcon key={k} kind={s} size={32} />)
            )}
          </div>
          <div className="mt-2 text-muted">Fig {i + 1}</div>
        </div>
      ))}
    </div>
  );
}
// ======= COLUMN ADDITION (A + A + A = BA) =======
function ColumnAddition({
  terms = ["A", "A", "A"],
  result = "BA",
  plusIndex = null,
  fontSize = 28,
}) {
  // Nếu không chỉ định, mặc định đặt dấu + trước hạng tử cuối
  const pIndex = plusIndex == null ? terms.length - 1 : plusIndex;

  // Tính độ rộng cột lớn nhất để canh phải
  const maxLen = Math.max(result.length, ...terms.map((t) => String(t).length));
  const padLeft = (s, n) => String(s).padStart(n, " ");

  const Row = ({ text, isPlus }) => (
    <div
      className="d-flex justify-content-end align-items-center"
      style={{ gap: 8 }}
    >
      <div
        style={{
          width: fontSize * 0.9,
          textAlign: "center",
          opacity: isPlus ? 1 : 0,
        }}
      >
        +
      </div>
      <pre
        className="m-0"
        style={{
          fontFamily:
            "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
          fontSize,
          lineHeight: 1.2,
        }}
      >
        {padLeft(text, maxLen)}
      </pre>
    </div>
  );

  return (
    <div className="d-inline-block p-3">
      {/* Các hạng tử */}
      {terms.map((t, i) => (
        <Row key={i} text={t} isPlus={i === pIndex} />
      ))}

      {/* Gạch ngang */}
      <div
        className="d-flex justify-content-end align-items-center"
        style={{ gap: 8, marginTop: 4 }}
      >
        <div style={{ width: fontSize * 0.9 }} />
        <div
          style={{
            width: `${fontSize * 0.65 * maxLen}px`,
            borderBottom: "2px solid currentColor",
          }}
        />
      </div>

      {/* Kết quả */}
      <Row text={result} isPlus={false} />
    </div>
  );
}
function TableFigure({ data = [] }) {
  if (!Array.isArray(data) || data.length === 0) {
    return <div />;
  }

  // Tìm số cột lớn nhất trong tất cả các hàng
  const maxCols = Math.max(...data.map((row) => row.length));

  return (
    <table className="table table-bordered text-center align-middle w-auto mx-auto">
      <tbody>
        {data.map((row, i) => (
          <tr key={i}>
            {row.map((cell, j) => (
              <td
                key={j}
                colSpan={Math.floor(maxCols / row.length)}
                style={{ minWidth: 40, padding: "6px 12px" }}
              >
                {cell}
              </td>
            ))}
            {/* Nếu row.length không chia hết maxCols thì cho ô cuối cùng colSpan lớn hơn để lấp */}
            {row.length < maxCols &&
              row.length * Math.floor(maxCols / row.length) < maxCols && (
                <td
                  colSpan={
                    maxCols - row.length * Math.floor(maxCols / row.length)
                  }
                />
              )}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
function GroupMatrices({ data = [] }) {
  if (!Array.isArray(data) || data.length === 0) return null;

  return (
    <div className="d-flex flex-wrap gap-4 justify-content-center">
      {data.map((grid, gi) => (
        <div key={gi} className="text-center">
          <table
            className="mx-auto border-collapse"
            style={{ borderSpacing: 0, borderCollapse: "collapse" }}
          >
            <tbody>
              {grid.map((row, i) => (
                <tr key={i}>
                  {row.map((cell, j) => (
                    <td
                      key={j}
                      style={{
                        width: 28,
                        height: 28,
                        border: "1px solid black",
                        textAlign: "center",
                        verticalAlign: "middle",
                        fontSize: 16,
                        fontFamily: "monospace",
                      }}
                    >
                      {cell || ""}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          <div className="mt-1 text-muted small">Group {gi + 1}</div>
        </div>
      ))}
    </div>
  );
}
// Q21: cân thăng bằng (balances)
function Balances({ balances = [] }) {
  return (
    <div className="d-flex flex-wrap gap-4 justify-content-center">
      {balances.map((pair, idx) => (
        <div key={idx} className="d-flex flex-column align-items-center">
          {/* Thanh ngang cân */}
          <div
            className="d-flex justify-content-between align-items-end"
            style={{
              minWidth: 200,
              borderBottom: "3px solid black",
              position: "relative",
            }}
          >
            <div className="d-flex gap-1">
              {pair[0].map((item, i) => (
                <span key={i} style={{ fontSize: 24 }}>
                  {item}
                </span>
              ))}
            </div>
            <div className="d-flex gap-1">
              {pair[1].map((item, i) => (
                <span key={i} style={{ fontSize: 24 }}>
                  {item}
                </span>
              ))}
            </div>
          </div>
          {/* Trụ dọc */}
          <div
            style={{
              width: 0,
              height: 24,
              borderLeft: "3px solid black",
            }}
          />
        </div>
      ))}
    </div>
  );
}
// Qxx: Square with 8 points and connecting lines
function SquareConnect({ data = [] }) {
  // Tọa độ 8 điểm (1 ở giữa cạnh trên, rồi đi vòng)
  const points = [
    [50, 0], // 1 top middle
    [100, 0], // 2 top right
    [100, 50], // 3 right middle
    [100, 100], // 4 bottom right
    [50, 100], // 5 bottom middle
    [0, 100], // 6 bottom left
    [0, 50], // 7 left middle
    [0, 0], // 8 top left
  ];

  return (
    <div className="d-flex flex-wrap gap-4 justify-content-center">
      {data.map((pair, idx) => (
        <svg
          key={idx}
          width={120}
          height={120}
          viewBox="0 0 100 100"
          className="border rounded bg-white"
        >
          {/* vẽ khung vuông */}
          <rect
            x={0}
            y={0}
            width={100}
            height={100}
            stroke="black"
            fill="none"
          />
          {/* vẽ các điểm */}
          {points.map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r={3} fill="black">
              <title>{i + 1}</title>
            </circle>
          ))}
          {/* vẽ đường nối */}
          {Array.isArray(pair) && pair.length === 2 ? (
            <line
              x1={points[pair[0] - 1][0]}
              y1={points[pair[0] - 1][1]}
              x2={points[pair[1] - 1][0]}
              y2={points[pair[1] - 1][1]}
              stroke="red"
              strokeWidth={2}
            />
          ) : (
            <text x={40} y={55} fontSize={20} fill="red">
              ?
            </text>
          )}
        </svg>
      ))}
    </div>
  );
}
function CharGrid({ data = [[]] }) {
  return (
    <table
      className="mx-auto text-center"
      style={{ borderCollapse: "collapse" }}
    >
      <tbody>
        {data.map((row, i) => (
          <tr key={i}>
            {row.map((cell, j) => (
              <td key={j} style={{ width: 28, height: 28, padding: 2 }}>
                {cell || ""}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
// Qxx: Hình gồm nhiều đoạn thẳng
function LineSegments({ points = [], segments = [] }) {
  return (
    <svg width={200} height={200} viewBox="0 0 100 100" className="mx-auto">
      {/* Vẽ đoạn thẳng */}
      {segments.map(([a, b], idx) => (
        <line
          key={idx}
          x1={points[a][0]}
          y1={points[a][1]}
          x2={points[b][0]}
          y2={points[b][1]}
          stroke="black"
          strokeWidth={2}
        />
      ))}
      {/* Vẽ điểm */}
      {points.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={3} fill="red">
          <title>{i}</title>
        </circle>
      ))}
    </svg>
  );
}
// Qxx: Vẽ nhiều hình tròn
function MultiCircles({ circles = [] }) {
  return (
    <svg width={200} height={200} viewBox="0 0 200 200" className="mx-auto">
      {circles.map((c, idx) => (
        <circle
          key={idx}
          cx={c.cx}
          cy={c.cy}
          r={c.r}
          stroke="black"
          strokeWidth={2}
          fill="none"
        />
      ))}
    </svg>
  );
}
// Qxx: Chuỗi hạt (⚪⚫ hoặc emoji)
function GeometryOverlapFigure({ shapes }) {
  const shapeToSvg = {
    circle: <circle cx="0" cy="0" r="25" stroke="black" fill="none" />,
    square: (
      <rect x="-25" y="-25" width="50" height="50" stroke="black" fill="none" />
    ),
    triangle: (
      <polygon points="0,-30 26,15 -26,15" stroke="black" fill="none" />
    ),
    hexagon: (
      <polygon
        points="25,0 12.5,22 -12.5,22 -25,0 -12.5,-22 12.5,-22"
        stroke="black"
        fill="none"
      />
    ),
    dot: <circle cx="0" cy="0" r="8" fill="black" />,
  };

  const spacing = 30; // khoảng cách để chồng lấn vừa phải

  return (
    <svg
      viewBox={`-20 -40 ${shapes.length * spacing + 60} 100`}
      width={300}
      height={120}
    >
      {shapes.map((s, i) => (
        <g key={i} transform={`translate(${i * spacing}, 0)`}>
          {shapeToSvg[s]}
        </g>
      ))}
    </svg>
  );
}
function TextFigure({ content }) {
  return (
    <div className="text-center">
      <p className="fs-3">{content}</p>
    </div>
  );
}
function SvgFigure({ svg }) {
  if (!svg) return null;
  return (
    <div
      className="d-flex justify-content-center"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}

// Thêm vào registry
const FIGURES = {
  symbolPattern: (p) => <SymbolPattern {...p} />,
  groupRepeats: (p) => <GroupRepeats {...p} />,
  GroupRepeatsGrid: (p) => <GroupRepeatsGrid {...p} />,
  twoBins: (p) => <TwoBins {...p} />,
  gridSquareTables: (p) => <GridSquareTables {...p} />,
  isoCubes: (p) => <IsoCubes {...p} />,
  regularPolygon: (p) => <RegularPolygon {...p} />,
  stackPattern: (p) => <StackPattern {...p} />,
  columnAddition: (p) => <ColumnAddition {...p} />,
  table: (p) => <TableFigure {...p} />,
  groupMatrices: (p) => <GroupMatrices {...p} />,
  balances: (p) => <Balances {...p} />,
  squareConnect: (p) => <SquareConnect {...p} />,
  charGrid: (p) => <CharGrid {...p} />,
  lineSegments: (p) => <LineSegments {...p} />,
  multiCircles: (p) => <MultiCircles {...p} />,
  geometryOverlapFigure: (p) => <GeometryOverlapFigure {...p} />,
  text: (p) => <TextFigure {...p} />,
  svg: (p) => <SvgFigure {...p} />,
};

// Hàm hiển thị figure theo schema dữ liệu
export function renderFigure(q) {
  if (q.figure && q.figure.renderer) {
    const { renderer, params = {} } = q.figure;
    const Comp = FIGURES[renderer];
    if (Comp) return <div className="mt-3">{Comp(params)}</div>;
    return (
      <div className="alert alert-secondary my-3">
        Chưa hỗ trợ renderer: <code>{renderer}</code>
      </div>
    );
  }
}
