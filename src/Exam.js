import React, { useEffect, useState } from "react";
import { formatTime, loadAllQuestions } from "./utils";
import { renderFigure } from "./figure";

function Exam({ name, onFinish, paperMode, dataType = "preliminary" }) {
  const [questions, setQuestions] = useState([]);
  const [index, setIndex] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(
    (dataType === "preliminary" ? 60 : 90) * 60
  );
  const [finished, setFinished] = useState(false);
  const [reviewMode, setReviewMode] = useState(false);
  const [result, setResult] = useState(null);
  const [startTime] = useState(Date.now());
  const [startDate] = useState(new Date().toLocaleString());
  const showVi = (function () {
    const saved = JSON.parse(localStorage.getItem("hkimo-show-vi") || "false");
    return dataType === "preliminary" ? saved : false;
  })();

  useEffect(() => {
    loadAllQuestions(
      [
        "arithmetic",
        "combinatorics",
        "geometry",
        "logic-thinking",
        "number-theory",
      ],
      5,
      true,
      dataType
    ).then(setQuestions);
    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [dataType]);

  useEffect(() => {
    document.title = `${name} - HKIMO ${dataType.toUpperCase()} (${startDate})`;
  }, [startDate]);

  const handleAnswer = (val) => {
    const updated = [...questions];
    updated[index] = { ...updated[index], userAnswer: val };
    setQuestions(updated);
  };
  const handleSubmit = () => {
    const unanswered = questions.filter(
      (q) => !q.userAnswer || q.userAnswer === ""
    ).length;
    if (unanswered > 0) {
      const confirmSubmit = window.confirm(
        `⚠️ Còn ${unanswered} câu chưa chọn đáp án. Bạn có chắc muốn nộp bài không?`
      );
      if (!confirmSubmit) return;
    }

    const correctCount = questions.filter(
      (q) => q.answer && q.answer.key === q.userAnswer
    ).length;
    const score = correctCount * 4;
    const spentSeconds = Math.floor((Date.now() - startTime) / 1000);

    const historyItem = {
      name,
      correct: correctCount,
      total: questions.length,
      score,
      spent: formatTime(spentSeconds),
      time: new Date().toLocaleString(),
    };

    setResult(historyItem);
    onFinish(historyItem, true);
    setFinished(true);
  };

  // 📄 Chế độ giấy trắc nghiệm
  if (paperMode) {
    return (
      <div className="container-fluid mt-4 paper-mode">
        <h3 className="m-3">
          {name} - HKIMO {dataType.toUpperCase()} ({startDate})
        </h3>
        {questions.map((q, qi) => (
          <div
            key={qi}
            className="mb-3 border rounded p-3 bg-light paper-question"
          >
            <div className="mb-2">
              <div className="question-title d-flex justify-content-between align-items-center">
                <strong>
                  Question {qi + 1}
                  {showVi && <i> (Câu {qi + 1})</i>}:{" "}
                </strong>
                <span className="ms-2">
                  {dataType.toUpperCase()}-{q.id}
                </span>
              </div>

              <div dangerouslySetInnerHTML={{ __html: q.stem.en }} />
              {showVi && (
                <div
                  style={{ fontStyle: "italic" }}
                  dangerouslySetInnerHTML={{ __html: q.stem.vi }}
                />
              )}
              <div className="figure-container">{renderFigure(q)}</div>
            </div>
            <div className="mt-2">
              <div className="row">
                {q.choices.map((choice, i) => {
                  return (
                    <div className="col-12 col-md-3 mb-2" key={i}>
                      <label className="form-check-label">
                        <b style={{ color: "gray" }}>{choice.id}.</b>{" "}
                        {choice.en}
                      </label>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ))}

        {/* Trang riêng cho đáp án */}
        <div className="answer-sheet">
          <div className="blank-page">
            <div className="info-box">
              <h4 className="mb-3">
                {name} - HKIMO TEST ({startDate})
              </h4>
              <table className="table table-bordered">
                <tbody>
                  <tr>
                    <td>Full name:</td>
                    <td>DOB:</td>
                  </tr>
                  <tr>
                    <td>School name:</td>
                    <td>Class:</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="question-grid">
              {[...Array(25)].map((_, i) => (
                <div className="question" key={i}>
                  <div>{i + 1}</div>
                  <div className="choices">
                    <div className="choice">
                      A<div className="box"></div>
                    </div>
                    <div className="choice">
                      B<div className="box"></div>
                    </div>
                    <div className="choice">
                      C<div className="box"></div>
                    </div>
                    <div className="choice">
                      D<div className="box"></div>
                    </div>
                    <div className="choice">
                      E<div className="box"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <hr />
          <h3 className="mt-2">
            Answer <i>(Đáp án)</i>
          </h3>
          <h6>
            {name} - HKIMO TEST ({startDate})
          </h6>
          <div className="answer-grid">
            {questions.map((q, qi) => (
              <div
                key={qi}
                className="answer-item border rounded me-2 ms-2 mb-1 p-2 bg-light"
              >
                <span className="top-left">{qi + 1}</span>
                <strong>{q.answer ? q.answer.key : ""}</strong>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // 📄 Trang kết quả online
  if (finished && result && !reviewMode) {
    return (
      <div className="container mt-5 text-center">
        <h3>Kết quả</h3>
        <p>
          ✅ Correct {showVi && <i>(Đúng)</i>}: <b>{result.correct}</b> /{" "}
          {result.total}
        </p>
        <p>
          ❌ Incorrect {showVi && <i>(Sai)</i>}:{" "}
          <b>{result.total - result.correct}</b>
        </p>
        <p>
          🎯 Points {showVi && <i>(Điểm)</i>}: <b>{result.score}</b> / 100
        </p>
        <p>
          ⏱️ Testing time {showVi && <i>(Thời gian làm)</i>}: {result.spent}
        </p>
        <div className="mt-4">
          <button
            className="btn btn-primary me-3"
            onClick={() => setReviewMode(true)}
          >
            Review your test {showVi && <i>(Xem lại bài)</i>}
          </button>
          <button className="btn btn-success" onClick={() => onFinish(null)}>
            Go home {showVi && <i>(Về trang chủ)</i>}
          </button>
        </div>
      </div>
    );
  }

  if (finished && reviewMode) {
    return (
      <div className="container mt-5 question review">
        <h3 className="mb-4">
          Review your test {showVi && <i>(Xem lại bài)</i>}
        </h3>
        {questions.map((q, qi) => {
          const isCorrect = q.answer && q.answer.key === q.userAnswer;
          return (
            <div key={qi} className="mb-4 border rounded p-3 bg-light">
              <div className="mb-2 d-flex justify-content-between align-items-center">
                <div>
                  <strong>
                    Question {qi + 1} {showVi && <i>(Câu {qi + 1})</i>}:{" "}
                  </strong>
                </div>
              </div>
              <div dangerouslySetInnerHTML={{ __html: q.stem.en }} />
              {showVi && (
                <div
                  style={{ fontStyle: "italic" }}
                  dangerouslySetInnerHTML={{ __html: q.stem.vi }}
                />
              )}
              {renderFigure(q)}
              <div className="mt-2">
                {q.choices &&
                  q.choices.map((choice, i) => {
                    const chosen = q.userAnswer === choice.id;
                    const isRightAnswer =
                      q.answer && q.answer.key === choice.id;

                    let answeredAttr = {};
                    let labelClass = "form-check-label";

                    if (chosen && isCorrect) {
                      answeredAttr = { answered: "true" };
                      labelClass += " text-success fw-bold";
                    } else if (chosen && !isCorrect) {
                      answeredAttr = { answered: "false" };
                      labelClass += " text-danger fw-bold";
                    } else if (!chosen && !isCorrect && isRightAnswer) {
                      labelClass += " text-success fw-bold";
                    }

                    return (
                      <div
                        className={`form-check p-2 rounded ${isRightAnswer ? "answer-right" : ""}`}
                        key={i}
                      >
                        <input
                          type="radio"
                          disabled
                          className="form-check-input"
                          checked={chosen}
                          readOnly
                        />
                        <label
                          {...answeredAttr}
                          className={labelClass + " me-2"}
                        >
                          <span>{choice.id}.</span>
                          <span className="form-check-label"> {choice.en}</span>
                        </label>
                      </div>
                    );
                  })}
              </div>
            </div>
          );
        })}
        <button
          className="btn btn-success mt-3 mb-5"
          onClick={() => onFinish(null)}
        >
          Go home {showVi && <i>(Về trang chủ)</i>}
        </button>
      </div>
    );
  }

  // 📄 Giao diện làm bài online
  const q = questions[index];
  return questions.length === 0 ? (
    <p>Loading...</p>
  ) : (
    <div className="container mt-5 question">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4 className="m-0">
          🧠 <strong>{q.type}</strong>
        </h4>
        <div className="d-flex justify-content-between">
          <span className="badge bg-warning text-dark me-2 fs-5">
            ⏰ {formatTime(secondsLeft)}
          </span>
          <button className="btn btn-danger" onClick={handleSubmit}>
            Finish Test {showVi && <i>(Nộp bài)</i>}
          </button>
        </div>
      </div>

      <div className="mb-2 d-flex justify-content-between align-items-center">
        <div>
          <strong>
            Question {index + 1} {showVi && <i>(Câu {index + 1})</i>}:{" "}
          </strong>
        </div>
      </div>
      <div className="border rounded p-3 bg-light mb-3">
        <div dangerouslySetInnerHTML={{ __html: q.stem.en }} />
        {showVi && (
          <div
            style={{ fontStyle: "italic" }}
            dangerouslySetInnerHTML={{ __html: q.stem.vi }}
          />
        )}
        {renderFigure(q)}
      </div>

      <div className="mb-4">
        {q.choices && q.choices.length > 0 ? (
          <div>
            {q.choices.map((choice, i) => {
              return (
                <div className="form-check p-2 rounded" key={i}>
                  <input
                    name={`q-${q.id}`}
                    type="radio"
                    id={`q-${q.id}-choice-${i}`}
                    className="form-check-input"
                    value={choice.id}
                    checked={q.userAnswer === choice.id}
                    onChange={() => handleAnswer(choice.id)}
                  />
                  <label
                    htmlFor={`q-${q.id}-choice-${i}`}
                    className="ms-1 me-2"
                  >
                    <span className="form-check-label">{choice.id}.</span>
                    <span className="form-check-label">{choice.en}</span>
                  </label>
                </div>
              );
            })}
          </div>
        ) : (
          <input
            type="text"
            className="form-control"
            placeholder="Nhập đáp án"
            value={q.userAnswer}
            onChange={(e) => handleAnswer(e.target.value)}
          />
        )}
      </div>
      <div className="d-flex justify-content-between mb-3">
        <button
          className="btn btn-secondary btn-lg"
          disabled={index === 0}
          onClick={() => setIndex((i) => i - 1)}
        >
          ◀ Back {showVi && <i>(Trước)</i>}
        </button>
        <button
          className="btn btn-primary btn-lg"
          disabled={index === questions.length - 1}
          onClick={() => setIndex((i) => i + 1)}
        >
          Next ▶ {showVi && <i>(Tiếp)</i>}
        </button>
      </div>
    </div>
  );
}

export default Exam;
