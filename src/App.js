import React, { useState } from "react";
import Exam from "./Exam";
import "bootstrap/dist/css/bootstrap.min.css";
import "./styles/App.css";
import Edit from "./Edit";

function App() {
  const params = new URLSearchParams(window.location.search);
  const isDebug = params.get("debug") === "1" || params.get("debug") === "true";

  const [name, setName] = useState(
    localStorage.getItem("hkimo-user-name") || ""
  );
  const [isStarted, setIsStarted] = useState(false);
  const [paperMode, setPaperMode] = useState(isDebug);
  const [history, setHistory] = useState(
    JSON.parse(localStorage.getItem("hkimo-history") || "[]")
  );
  const [showVi, setShowVi] = useState(
    JSON.parse(localStorage.getItem("hkimo-show-vi") || "false")
  );
  const [dataType, setDataType] = useState(
    localStorage.getItem("hkimo-data-type") || "preliminary"
  );
  const showHomeVi = dataType === "preliminary";

  const handleStart = () => {
    if (!name.trim()) return alert("Vui lòng nhập tên");
    localStorage.setItem("hkimo-user-name", name.trim());
    setIsStarted(true);
  };

  const handleFinish = (result, isStarted = false) => {
    if (result) {
      const newHistory = [result, ...history].slice(0, 10);
      setHistory(newHistory);
      localStorage.setItem("hkimo-history", JSON.stringify(newHistory));
    }
    if (!isStarted) setIsStarted(false);
  };
  if (isStarted)
    return isDebug ? (
      <Edit dataType={dataType} />
    ) : (
      <Exam
        name={name}
        paperMode={paperMode}
        onFinish={handleFinish}
        dataType={dataType}
      />
    );

  return (
    <div className="container py-5" style={{ maxWidth: 700 }}>
      <h1 className="text-center mb-4">HKIMO 1</h1>
      <div className="mb-3">
        <label className="form-label">
          Round {showHomeVi && <i>(Vòng thi)</i>}:
        </label>
        <select
          className="form-select"
          value={dataType}
          onChange={(e) => {
            const val = e.target.value;
            setDataType(val);
            localStorage.setItem("hkimo-data-type", val);
            if (val === "heat") {
              // Khi chọn HEAT thì ẩn ngôn ngữ và chỉ English
              setShowVi(false);
              localStorage.setItem("hkimo-show-vi", JSON.stringify(false));
            }
          }}
        >
          <option value="preliminary">
            Preliminary {showHomeVi && <>(Vòng loại)</>}
          </option>
          <option value="heat">Heat {showHomeVi && <>(Quốc gia)</>}</option>
        </select>
      </div>
      <div className="mb-3">
        <label className="form-label">
          Your name {showHomeVi && <i>(Nhập tên học sinh)</i>}:
        </label>
        <input
          type="text"
          className="form-control"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      {dataType === "preliminary" && (
        <div className="mb-3">
          <label className="form-label">
            Question language {showHomeVi && <i>(Tùy chọn đề bài)</i>}:
          </label>
          <div className="form-check">
            <input
              className="form-check-input"
              type="checkbox"
              disabled={true}
              id="showEn"
              checked={true}
            />
            <label className="form-check-label" htmlFor="showVi">
              English
            </label>
          </div>
          <div className="form-check mb-3">
            <input
              className="form-check-input"
              type="checkbox"
              id="showVi"
              checked={showVi}
              onChange={(e) => {
                setShowVi(e.target.checked);
                localStorage.setItem(
                  "hkimo-show-vi",
                  JSON.stringify(e.target.checked)
                );
              }}
            />
            <label className="form-check-label" htmlFor="showVi">
              Tiếng Việt
            </label>
          </div>
        </div>
      )}
      <hr />
      <div className="mb-4">
        <div className="form-check">
          <input
            className="form-check-input"
            type="checkbox"
            id="paperMode"
            checked={paperMode}
            disabled={isDebug}
            onChange={(e) => setPaperMode(e.target.checked)}
          />
          <label className="form-check-label" htmlFor="paperMode">
            Test with paper {showHomeVi && <i>(Làm bằng giấy trắc nghiệm)</i>}{" "}
            {isDebug && (
              <span className="text-muted">— forced ON in debug</span>
            )}
          </label>
        </div>
      </div>
      <button className="btn btn-primary w-100" onClick={handleStart}>
        {isDebug
          ? "EDIT"
          : paperMode
            ? `PRINT${showHomeVi ? " (IN RA GIẤY)" : ""}`
            : `STARTING TEST${showHomeVi ? " (LÀM BÀI)" : ""}`}
      </button>

      {history.length > 0 && (
        <div className="mt-4">
          <h5>History {showHomeVi && <i>(Lịch sử làm bài)</i>}</h5>
          <table className="table table-bordered text-center">
            <thead>
              <tr>
                <th>
                  Name
                  <br />
                  {showHomeVi && <i>(Tên thí sinh)</i>}
                </th>
                <th>
                  Corrects / Total
                  <br />
                  {showHomeVi && <i>(Số câu đúng)</i>}
                </th>
                <th>
                  Points
                  <br />
                  {showHomeVi && <i>(Điểm)</i>}
                </th>
                <th>
                  Testing time
                  <br />
                  {showHomeVi && <i>(Thời gian làm bài)</i>}
                </th>
                <th>
                  Timestamp
                  <br />
                  {showHomeVi && <i>(Ngày giờ)</i>}
                </th>
              </tr>
            </thead>
            <tbody>
              {history.map((h, i) => (
                <tr key={i}>
                  <td>{h.name}</td>
                  <td>
                    {h.correct} / {h.total}
                  </td>
                  <td>{h.score} / 100</td>
                  <td>{h.spent}</td>
                  <td>{h.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default App;
