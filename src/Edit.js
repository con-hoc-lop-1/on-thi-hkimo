import React, { useEffect, useState } from "react";
import { loadAllQuestions } from "./utils";
import { FIGURE_METADATA, renderFigure } from "./figure";

function FigureEditor({ figure, onChange }) {
  // Use a ref to store the initial figure to avoid re-initializing state on every render
  const [localFigure, setLocalFigure] = useState(figure || {});

  // Update local state when figure prop changes (e.g. after a save or switching questions)
  useEffect(() => {
    setLocalFigure(figure || {});
  }, [JSON.stringify(figure)]);

  const handleRendererChange = (e) => {
    const renderer = e.target.value;
    const newFigure =
      renderer === "NONE" ? {} : { renderer, params: localFigure.params || {} };
    setLocalFigure(newFigure);
    onChange(newFigure);
  };

  const handleParamChange = (name, value, type) => {
    let finalValue = value;
    if (type === "number") {
      finalValue = value === "" ? 0 : Number(value);
    } else if (type === "array") {
      try {
        finalValue = JSON.parse(value);
      } catch (e) {
        // Keep as string while editing
        finalValue = value;
      }
    }

    const newFigure = {
      ...localFigure,
      params: {
        ...(localFigure.params || {}),
        [name]: finalValue,
      },
    };
    setLocalFigure(newFigure);
    // Only call onChange if it's valid JSON for array types
    if (type === "array") {
      try {
        JSON.parse(value);
        onChange(newFigure);
      } catch (e) {
        // Don't sync yet
      }
    } else {
      onChange(newFigure);
    }
  };

  const currentRenderer = localFigure.renderer || "NONE";
  const metadata = FIGURE_METADATA[currentRenderer];

  return (
    <div className="figure-editor border rounded p-2 bg-white">
      <div className="mb-2">
        <label className="form-label small fw-bold">Renderer</label>
        <select
          className="form-select form-select-sm"
          value={currentRenderer}
          onChange={handleRendererChange}
        >
          <option value="NONE">NONE</option>
          {Object.keys(FIGURE_METADATA).map((key) => (
            <option key={key} value={key}>
              {key}
            </option>
          ))}
        </select>
      </div>

      {metadata && (
        <div className="params-editor mt-2">
          {Object.entries(metadata).map(([name, type]) => {
            const val = localFigure.params?.[name];
            const displayVal =
              type === "array"
                ? typeof val === "string"
                  ? val
                  : JSON.stringify(val)
                : (val ?? "");

            return (
              <div key={name} className="mb-2">
                <label className="form-label small mb-1">{name}</label>
                {type === "array" ? (
                  <textarea
                    className="form-control form-control-sm"
                    rows={3}
                    value={displayVal}
                    onChange={(e) =>
                      handleParamChange(name, e.target.value, type)
                    }
                  />
                ) : type === "number" ? (
                  <input
                    type="number"
                    className="form-control form-control-sm"
                    value={displayVal}
                    onChange={(e) =>
                      handleParamChange(name, e.target.value, type)
                    }
                  />
                ) : (
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    value={displayVal}
                    onChange={(e) =>
                      handleParamChange(name, e.target.value, type)
                    }
                  />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Edit({ dataType = "preliminary" }) {
  const listQuestionFiles = [
    // "arithmetic",
    "combinatorics",
    // "geometry",
    // "logic-thinking",
    // "number-theory",
  ];

  const [questions, setQuestions] = useState([]);
  const [copied, setCopied] = useState(0);
  const [saved, setSaved] = useState([]);
  const [tmpStem, setTmpStem] = useState(false);
  const [tmpEnStem, setTmpEnStem] = useState(false);
  const [tmpViStem, setTmpViStem] = useState(false);
  const [tmpFull, setTmpFull] = useState(false);

  const removeSaved = (id) => {
    setSaved((prev) => prev.filter((savedId) => savedId !== id));
  };
  const [tmpChoice, setTmpChoice] = useState(false);
  const [tmpFigure, setTmpFigure] = useState(false);
  const [tmpAnswer, setTmpAnswer] = useState(false);

  useEffect(() => {
    if (questions.length > 0) {
      setTmpEnStem(false);
      setTmpViStem(false);
      setTmpStem(false);
      setTmpFigure(false);
      setTmpChoice(false);
      setTmpAnswer(false);
      setTmpFull(false);
    }
  }, [questions.length]);

  const reloadAll = async () => {
    const all = await loadAllQuestions(
      listQuestionFiles,
      5000,
      false,
      dataType
    );
    setQuestions(all);
  };
  const cleanStem = (str) => {
    if (typeof str !== "string") return str;
    let cleaned = str.trim();
    // Remove leading number like "1. ", "12. "
    cleaned = cleaned.replace(/^\d{1,2}\.\s*/, "");
    return cleaned.trim();
  };

  // Debug editors: update stem.en and choices[i].en
  const handleStemChange = (qIndex, newStem) => {
    setQuestions((prev) => {
      const next = [...prev];
      const q = next[qIndex] || {};
      try {
        // Parse the newStem string to JSON
        let stemObj = JSON.parse(newStem);
        if (stemObj.en) stemObj.en = cleanStem(stemObj.en);
        if (stemObj.vi) stemObj.vi = cleanStem(stemObj.vi);
        next[qIndex] = { ...q, stem: stemObj };
      } catch (e) {
        // If parsing fails, store as is
        next[qIndex] = { ...q, stem: cleanStem(newStem) };
      }
      setTmpStem(false);
      removeSaved(next[qIndex]?.id);
      return next;
    });
  };
  const handleStemLanguageChange = (language, qIndex, newStem) => {
    setQuestions((prev) => {
      const next = [...prev];
      try {
        let val = JSON.parse(newStem);
        next[qIndex].stem[language] = cleanStem(val);
      } catch (e) {
        next[qIndex].stem[language] = cleanStem(newStem);
      }
      if (language === "en") setTmpEnStem(false);
      if (language === "vi") setTmpViStem(false);
      removeSaved(next[qIndex]?.id);
      return next;
    });
  };

  const handleFigureChange = (qIndex, newFigure) => {
    setQuestions((prev) => {
      const next = [...prev];
      const q = next[qIndex] || {};
      try {
        // Parse the newFigure string to JSON
        const figureObj =
          typeof newFigure === "string" ? JSON.parse(newFigure) : newFigure;
        next[qIndex] = { ...q, figure: figureObj };
      } catch (e) {
        // If parsing fails, store as is
        next[qIndex] = { ...q, figure: newFigure };
      }
      setTmpFigure(false);
      removeSaved(next[qIndex]?.id);
      return next;
    });
  };

  const handleChoiceChange = (qIndex, newChoice) => {
    setQuestions((prev) => {
      const next = [...prev];
      const q = next[qIndex] || {};
      try {
        // Parse the newChoice string to JSON
        const choiceObj = JSON.parse(newChoice);
        next[qIndex] = { ...q, choices: choiceObj };
      } catch (e) {
        // If parsing fails, store as is
        next[qIndex] = { ...q, choices: newChoice };
      }
      setTmpChoice(false);
      removeSaved(next[qIndex]?.id);
      return next;
    });
  };

  const handleAnswerChange = (qIndex, newAnswer) => {
    setQuestions((prev) => {
      const next = [...prev];
      const q = next[qIndex] || {};
      const answerObj = { type: "single", key: newAnswer.toUpperCase() };
      next[qIndex] = { ...q, answer: answerObj };
      setTmpAnswer(false);
      removeSaved(next[qIndex]?.id);
      return next;
    });
  };

  const handleChoiceTextChange = (qIndex, choiceIndex, newEn) => {
    setQuestions((prev) => {
      const next = [...prev];
      const q = next[qIndex];
      if (!q) return prev;
      const choices = (q.choices || []).map((c, i) =>
        i === choiceIndex ? { ...c, en: newEn } : c
      );
      next[qIndex] = { ...q, choices };
      removeSaved(q.id);
      return next;
    });
  };
  const handleFullChange = (qIndex, newValue) => {
    setQuestions((prev) => {
      const next = [...prev];
      const currentQuestion = next[qIndex] || {};
      try {
        // Parse the newValue string to JSON
        let updatedQuestion = JSON.parse(newValue);

        // Clean stem if present
        if (updatedQuestion.stem) {
          if (updatedQuestion.stem.en)
            updatedQuestion.stem.en = cleanStem(updatedQuestion.stem.en);
          if (updatedQuestion.stem.vi)
            updatedQuestion.stem.vi = cleanStem(updatedQuestion.stem.vi);
        }

        // Add default stem if missing
        if (!updatedQuestion.stem) {
          updatedQuestion.stem = {};
        }

        // Add default type if missing
        if (!updatedQuestion.type) {
          updatedQuestion.type = currentQuestion.type;
        }

        // Add empty figure object if missing
        if (!updatedQuestion.figure) {
          updatedQuestion.figure = {};
        }

        // Add current id if missing
        if (!updatedQuestion.id) {
          updatedQuestion.id = currentQuestion.id;
        }

        next[qIndex] = updatedQuestion;
      } catch (e) {
        console.error("Invalid JSON:", e);
        return prev;
      }
      setTmpFull(false);
      removeSaved(next[qIndex]?.id);
      return next;
    });
  };

  const copyQuestion = (q) => {
    try {
      const txt = JSON.stringify(q, null, 2);
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(txt).then(() => {
          setCopied(q.id);
        });
      } else {
        // Fallback
        const ta = document.createElement("textarea");
        ta.value = txt;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
        setCopied(q.id);
      }
    } catch (e) {
      console.error(e);
      alert("Không thể chép nội dung câu hỏi");
    }
  };

  // DELETE: xóa câu hỏi khỏi tệp JSON
  const deleteQuestion = async (q) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa câu hỏi ID: ${q.id}?`)) {
      return;
    }
    try {
      // Xác định file theo loại câu hỏi
      const typeToFile = {
        Arithmetic: "arithmetic.json",
        Combinatorics: "combinatorics.json",
        Geometry: "geometry.json",
        "Logic Thinking": "logic-thinking.json",
        "Logic-Thinking": "logic-thinking.json",
        Logic: "logic-thinking.json",
        "Number Theory": "number-theory.json",
        "Number-Theory": "number-theory.json",
      };
      const fileName =
        typeToFile[q.type] ||
        `${String(q.type || "")
          .toLowerCase()
          .replace(/\s+/g, "-")}.json`;

      const params =
        typeof window !== "undefined"
          ? new URLSearchParams(window.location.search)
          : null;
      const isDebug =
        params &&
        (params.get("debug") === "1" || params.get("debug") === "true");
      const isLocalhost =
        typeof window !== "undefined" &&
        (window.location.hostname === "localhost" ||
          window.location.hostname === "127.0.0.1");
      const useApi = isDebug && isLocalhost;
      const basePath = useApi
        ? `http://localhost:4500/api/database/${dataType}`
        : `/on-thi-hkimo/database/${dataType}`;
      const res = await fetch(
        `${basePath}/${fileName}` + (useApi ? `?v=${Date.now()}` : ""),
        useApi ? { cache: "no-store" } : undefined
      );
      if (!res.ok) throw new Error(`Không thể tải ${fileName}`);
      const arr = await res.json();
      if (!Array.isArray(arr))
        throw new Error("Định dạng tệp không hợp lệ (không phải mảng)");

      // Lọc bỏ câu hỏi
      const updated = arr.filter((item) => item && item.id !== q.id);

      const text = JSON.stringify(updated, null, 2);

      // Ghi lại tệp
      try {
        if (isDebug && isLocalhost) {
          const resp = await fetch(
            `http://localhost:4500/api/save/${dataType}/${fileName}`,
            {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
                "X-Auth-Token": "hkimo-local-dev",
              },
              body: text,
            }
          );
          if (resp.ok) {
            // Refetch
            const all = await loadAllQuestions(
              listQuestionFiles,
              5000,
              false,
              dataType
            );
            setQuestions(all);
            return;
          }
        }
      } catch (e) {
        console.warn("Local save API không khả dụng", e);
      }

      if (window.showSaveFilePicker) {
        const handle = await window.showSaveFilePicker({
          suggestedName: fileName,
          types: [
            {
              description: "JSON File",
              accept: { "application/json": [".json"] },
            },
          ],
        });
        const writable = await handle.createWritable();
        await writable.write(text);
        await writable.close();
        // Refetch
        const all = await loadAllQuestions(
          listQuestionFiles,
          5000,
          false,
          dataType
        );
        setQuestions(all);
        alert("Đã cập nhật tệp sau khi xóa.");
      } else {
        const blob = new Blob([text], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = fileName;
        a.click();
        alert("Trình duyệt không hỗ trợ ghi đè, tệp mới đã được tải xuống.");
      }
    } catch (e) {
      console.error(e);
      alert("Lỗi khi xóa câu hỏi: " + e.message);
    }
  };

  // SAVE: ghi đè tệp JSON
  // Ưu tiên gọi API cục bộ khi debug+localhost để ghi trực tiếp không cần hộp thoại.
  // Fallback: File System Access API hoặc tải xuống.
  const saveQuestion = async (q) => {
    try {
      // Xác định file theo loại câu hỏi
      const typeToFile = {
        Arithmetic: "arithmetic.json",
        Combinatorics: "combinatorics.json",
        Geometry: "geometry.json",
        "Logic Thinking": "logic-thinking.json",
        "Logic-Thinking": "logic-thinking.json",
        Logic: "logic-thinking.json",
        "Number Theory": "number-theory.json",
        "Number-Theory": "number-theory.json",
      };
      const fileName =
        typeToFile[q.type] ||
        `${String(q.type || "")
          .toLowerCase()
          .replace(/\s+/g, "-")}.json`;

      // Đọc toàn bộ danh mục hiện tại
      // Chọn nguồn dữ liệu: trong debug+localhost thì dùng API shadow để tránh reload trang
      const params =
        typeof window !== "undefined"
          ? new URLSearchParams(window.location.search)
          : null;
      const isDebug =
        params &&
        (params.get("debug") === "1" || params.get("debug") === "true");
      const isLocalhost =
        typeof window !== "undefined" &&
        (window.location.hostname === "localhost" ||
          window.location.hostname === "127.0.0.1");
      const useApi = isDebug && isLocalhost;
      const basePath = useApi
        ? `http://localhost:4500/api/database/${dataType}`
        : `/on-thi-hkimo/database/${dataType}`;
      const res = await fetch(
        `${basePath}/${fileName}` + (useApi ? `?v=${Date.now()}` : ""),
        useApi ? { cache: "no-store" } : undefined
      );
      if (!res.ok) throw new Error(`Không thể tải ${fileName}`);
      const arr = await res.json();
      if (!Array.isArray(arr))
        throw new Error("Định dạng tệp không hợp lệ (không phải mảng)");

      // Tạo bản sao đã làm sạch (loại bỏ các field tạm thời)
      const sanitizeQuestion = (src) => {
        const clone = JSON.parse(JSON.stringify(src));
        delete clone.userAnswer;
        return clone;
      };
      const cleaned = sanitizeQuestion(q);

      // Thay thế theo id (nếu không thấy thì thêm vào cuối)
      let found = false;
      const updated = arr.map((item) => {
        if (item && item.id === cleaned.id) {
          found = true;
          return cleaned;
        }
        return item;
      });
      if (!found) {
        updated.push(cleaned);
      }

      const text = JSON.stringify(updated, null, 2);

      // Ưu tiên: nếu đang debug và chạy trên localhost, gọi API SAVE trực tiếp
      try {
        if (isDebug && isLocalhost) {
          const resp = await fetch(
            `http://localhost:4500/api/save/${dataType}/${fileName}`,
            {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
                "X-Auth-Token": "hkimo-local-dev",
              },
              body: text,
            }
          );
          if (resp.ok) {
            // Sau khi SAVE thành công, refetch toàn bộ câu hỏi (không reload trang)
            const all = await loadAllQuestions(
              listQuestionFiles,
              5000,
              false,
              dataType
            );
            setQuestions(all);
            setSaved((prev) => [...prev, q.id]);
            return;
          } else {
            console.warn("Local save API trả về lỗi", await resp.text());
          }
        }
      } catch (e) {
        console.warn(
          "Local save API không khả dụng, fallback sang các cách khác.",
          e
        );
      }

      // Nếu trình duyệt hỗ trợ File System Access API → cho phép ghi đè trực tiếp theo file người dùng chọn
      if (window.showSaveFilePicker) {
        const handle = await window.showSaveFilePicker({
          suggestedName: fileName,
          types: [
            {
              description: "JSON files",
              accept: { "application/json": [".json"] },
            },
          ],
        });
        const writable = await handle.createWritable();
        await writable.write(text);
        await writable.close();
        alert(`SAVED nội dung vào tệp: ${handle.name}`);
        return;
      }

      // Fallback: tải xuống file đã cập nhật
      const blob = new Blob([text], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      alert("Đã tạo file JSON đã cập nhật (tải xuống).");
    } catch (err) {
      console.error(err);
      alert("Không thể SAVE. Chi tiết trong console.");
    }
  };

  useEffect(() => {
    if (copied) {
      const timeout = setTimeout(() => {
        setCopied(0);
      }, 3000);
      return () => clearTimeout(timeout);
    }
  }, [copied]);

  useEffect(() => {
    loadAllQuestions(listQuestionFiles, 5000, false, dataType).then(
      setQuestions
    );
  }, [dataType]);

  // 📄 Chế độ giấy trắc nghiệm
  return (
    <div className="container-fluid mt-4 paper-mode">
      <div className="d-flex justify-content-between align-items-center m-3">
        <h3 className="m-0">{dataType.toUpperCase()} - EDIT MODE</h3>
        <div className="d-flex gap-2">
          <button
            type="button"
            className="btn btn-sm btn-outline-secondary"
            onClick={reloadAll}
          >
            REFRESH
          </button>
        </div>
      </div>
      {questions.map((q, qi) => (
        <div
          key={qi}
          className="mb-3 border rounded p-3 bg-light paper-question"
        >
          <div className="mb-2">
            <div className="question-title d-flex justify-content-between align-items-center mb-2">
              <strong>
                Question {qi + 1}
                {q.id && (
                  <span className="badge bg-secondary ms-2">ID: {q.id}</span>
                )}
              </strong>
              <span className="ms-2">{dataType.toUpperCase()} - EDIT MODE</span>
              <div className="d-flex gap-2">
                <button
                  type="button"
                  className={`btn ${copied === q.id ? "btn-warning" : "btn-outline-primary"}`}
                  onClick={() => copyQuestion(q)}
                  title="Chép JSON câu hỏi"
                >
                  {copied === q.id ? "COPIED" : "COPY"}
                </button>
              </div>
            </div>
            <div className="row">
              <div className="col-9">
                <div className="question-edit-mode">
                  <div className="question-item mb-2">
                    <div className="row">
                      <div className="col-8">
                        <div className="row">
                          <div className="col-12">
                            <label className="form-label">Stem EN</label>
                            <textarea
                              className="form-control"
                              rows={2}
                              onFocus={(e) => e.target.select()}
                              onBlur={(e) =>
                                handleStemLanguageChange(
                                  "en",
                                  qi,
                                  e.target.value
                                )
                              }
                              value={tmpEnStem ? tmpEnStem : q.stem.en}
                              onChange={(e) => {
                                setTmpEnStem(e.target.value);
                              }}
                            />{" "}
                          </div>
                        </div>
                        <div className="row mt-3">
                          <div className="col-12">
                            <label className="form-label">Stem VI</label>
                            <textarea
                              className="form-control"
                              rows={2}
                              onFocus={(e) => e.target.select()}
                              onBlur={(e) =>
                                handleStemLanguageChange(
                                  "vi",
                                  qi,
                                  e.target.value
                                )
                              }
                              value={tmpViStem ? tmpViStem : q.stem.vi}
                              onChange={(e) => {
                                setTmpViStem(e.target.value);
                              }}
                            />{" "}
                          </div>
                        </div>
                      </div>
                      <div className="col-4">
                        <textarea
                          className="form-control"
                          rows={8}
                          onFocus={(e) => e.target.select()}
                          onBlur={(e) => handleStemChange(qi, e.target.value)}
                          value={tmpStem ? tmpStem : JSON.stringify(q.stem)}
                          onChange={(e) => {
                            setTmpStem(e.target.value);
                          }}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="question-item mb-2">
                    <label className="form-label">Figure</label>
                    <div className="row">
                      <div className="col-4">
                        <div className="figure-container">
                          {renderFigure(q)}
                        </div>
                      </div>
                      <div className="col-8">
                        <div className="figure-container">
                          <FigureEditor
                            key={qi}
                            figure={q.figure}
                            onChange={(newFigure) =>
                              handleFigureChange(qi, newFigure)
                            }
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="question-item mb-2">
                    <label className="form-label">Choice</label>
                    <div className="row">
                      <div className="col-8">
                        <div className="row">
                          {q.choices.map((choice, i) => {
                            const isRightAnswer =
                              q.answer && q.answer.key === choice.id;
                            const rightStyle = isRightAnswer
                              ? { backgroundColor: "#e6ffed" }
                              : {};
                            return (
                              <div
                                className="col-6 mb-2 p-2"
                                key={i}
                                style={rightStyle}
                              >
                                <div className="d-flex align-items-center">
                                  <b style={{ color: "gray", width: 24 }}>
                                    {choice.id}.
                                  </b>
                                  <input
                                    type="text"
                                    className="form-control ms-2"
                                    value={choice.en || ""}
                                    onChange={(e) =>
                                      handleChoiceTextChange(
                                        qi,
                                        i,
                                        e.target.value
                                      )
                                    }
                                  />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                      <div className="col-4">
                        <textarea
                          className="form-control"
                          rows={4}
                          onFocus={(e) => e.target.select()}
                          value={
                            tmpChoice ? tmpChoice : JSON.stringify(q.choices)
                          }
                          onChange={(e) => {
                            setTmpChoice(e.target.value);
                          }}
                          onBlur={(e) => handleChoiceChange(qi, e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="question-item mb-2">
                    <label className="form-label">Answer</label>
                    <div className="row">
                      <div className="col-6">
                        <div className="answer-item border rounded me-2 ms-2 mb-1 p-2 bg-light">
                          <span className="top-left">Correct answer:</span>
                          <strong>{q.answer ? q.answer.key : ""}</strong>
                        </div>
                      </div>
                      <div className="col-6">
                        <textarea
                          className="form-control"
                          rows={2}
                          onFocus={(e) => e.target.select()}
                          value={tmpAnswer ? tmpAnswer : q.answer.key}
                          onChange={(e) => {
                            setTmpAnswer(e.target.value);
                          }}
                          onBlur={(e) => handleAnswerChange(qi, e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-3">
                <div className="question-item mb-2">
                  <label
                    className="form-label"
                    style={{
                      background: "#ddd",
                      borderRadius: "5px",
                      padding: "0 10px",
                    }}
                  >
                    Full
                  </label>
                  <textarea
                    className="form-control"
                    rows={31}
                    onFocus={(e) => e.target.select()}
                    onBlur={(e) => handleFullChange(qi, e.target.value)}
                    value={tmpFull ? tmpFull : JSON.stringify(q)}
                    onChange={(e) => {
                      setTmpFull(e.target.value);
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="mt-2 d-flex">
            <button
              type="button"
              className={`btn ${saved.includes(q.id) ? "btn-warning" : "btn-outline-success"} me-2`}
              onClick={() => saveQuestion(q)}
              title="SAVE JSON câu hỏi"
              style={{ flex: 1 }}
            >
              {saved.includes(q.id) ? "SAVED" : "SAVE"}
            </button>
            <button
              type="button"
              className="btn btn-outline-danger"
              onClick={() => deleteQuestion(q)}
              title="DELETE câu hỏi"
            >
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

export default Edit;
