import React, { useEffect, useState } from "react";
import "./DiaryApp.css";

export default function DiaryApp() {
  const STORAGE_KEY = "react-diary-entries-v1";

  const [entries, setEntries] = useState([]);
  const [filter, setFilter] = useState("");
  const [selectedId, setSelectedId] = useState(null);
  const [form, setForm] = useState({ date: todayISO(), title: "", body: "" });
  const [fileHandle, setFileHandle] = useState(null);

  // 초기 로드
  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        setEntries(JSON.parse(raw));
      } catch (e) {
        console.error("데이터 불러오기 실패:", e);
      }
    }
  }, []);

  // entries 변경 시 localStorage에 저장
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  }, [entries]);

  // 새 일기
  function createEntry() {
    if (!form.title.trim() && !form.body.trim()) return;
    const id = Date.now().toString();
    const newEntry = {
      id,
      date: form.date,
      title: form.title,
      body: form.body,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setEntries([newEntry, ...entries]);
    setForm({ date: todayISO(), title: "", body: "" });
    setSelectedId(id);
  }

  // 저장 (수정 포함)
  function saveEntry() {
    if (!selectedId) return createEntry();
    setEntries((prev) =>
      prev.map((e) =>
        e.id === selectedId
          ? { ...e, date: form.date, title: form.title, body: form.body, updatedAt: new Date().toISOString() }
          : e
      )
    );
  }

  // 파일로 저장하기 (File System Access API)
  async function saveToFile() {
    try {
      let handle = fileHandle;
      if (!handle) {
        handle = await window.showSaveFilePicker({
          suggestedName: "my-diary.json",
          types: [
            {
              description: "Diary JSON File",
              accept: { "application/json": [".json"] },
            },
          ],
        });
        setFileHandle(handle);
      }
      const writable = await handle.createWritable();
      await writable.write(JSON.stringify(entries, null, 2));
      await writable.close();
      alert("로컬 파일에 저장 완료 ✅");
    } catch (err) {
      if (err.name !== "AbortError") {
        console.error("파일 저장 실패:", err);
        alert("파일 저장 중 오류가 발생했습니다.");
      }
    }
  }

  // 파일에서 불러오기 (File System Access API)
  async function loadFromFile() {
    try {
      const [handle] = await window.showOpenFilePicker({
        types: [
          {
            description: "Diary JSON File",
            accept: { "application/json": [".json"] },
          },
        ],
      });
      const file = await handle.getFile();
      const text = await file.text();
      const data = JSON.parse(text);
      if (!Array.isArray(data)) throw new Error("올바르지 않은 형식입니다.");
      setEntries(data);
      setFileHandle(handle);
      alert("로컬 파일 불러오기 완료 ✅");
    } catch (err) {
      if (err.name !== "AbortError") {
        console.error("파일 불러오기 실패:", err);
        alert("파일을 불러오는 중 오류가 발생했습니다.");
      }
    }
  }

  function editEntry(id) {
    const e = entries.find((x) => x.id === id);
    if (!e) return;
    setSelectedId(id);
    setForm({ date: e.date, title: e.title, body: e.body });
  }

  function deleteEntry(id) {
    if (!window.confirm("정말 삭제하시겠어요?")) return;
    setEntries((prev) => prev.filter((e) => e.id !== id));
    if (selectedId === id) {
      setSelectedId(null);
      setForm({ date: todayISO(), title: "", body: "" });
    }
  }

  function newBlank() {
    setSelectedId(null);
    setForm({ date: todayISO(), title: "", body: "" });
  }

  const filtered = entries.filter((e) => {
    const q = filter.toLowerCase();
    return (
      e.title.toLowerCase().includes(q) ||
      e.body.toLowerCase().includes(q) ||
      e.date.includes(q)
    );
  });

  return (
    <div className="container">
      <header className="header">
        <h1>나의 일기</h1>
        <div className="buttons">
          <button onClick={saveToFile}>💾 로컬 저장</button>
          <button onClick={loadFromFile}>📂 로컬 불러오기</button>
          <button onClick={newBlank}>새 일기</button>
          <button onClick={() => localStorage.clear() || setEntries([])}>초기화</button>
        </div>
      </header>

      <div className="layout">
        {/* 작성 폼 */}
        <section className="editor">
          <div className="row">
            <input
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
            />
            <input
              type="text"
              placeholder="제목 (선택)"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
            <button onClick={saveEntry}>저장</button>
          </div>
          <textarea
            rows={10}
            placeholder="오늘의 일기를 써보세요..."
            value={form.body}
            onChange={(e) => setForm({ ...form, body: e.target.value })}
          />
          <div className="info">글자수: {form.body.length}자</div>
        </section>

        {/* 목록 */}
        <aside className="sidebar">
          <input
            className="search"
            placeholder="검색 (제목/본문/날짜)"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
          <div className="list">
            {filtered.length === 0 ? (
              <p className="empty">일기가 없습니다.</p>
            ) : (
              filtered.map((e) => (
                <div
                  key={e.id}
                  className={`entry ${selectedId === e.id ? "active" : ""}`}
                  onClick={() => editEntry(e.id)}
                >
                  <div className="title">{e.title || "(무제)"}</div>
                  <div className="date">{e.date}</div>
                  <button
                    className="delete"
                    onClick={(ev) => {
                      ev.stopPropagation();
                      deleteEntry(e.id);
                    }}
                  >
                    삭제
                  </button>
                </div>
              ))
            )}
          </div>
        </aside>
      </div>

      <footer className="footer">
        간단한 로컬 일기 앱 — 데이터는 브라우저와 파일로 저장됩니다.
      </footer>
    </div>
  );
}

// --- 유틸 ---
function todayISO() {
  const d = new Date();
  const off = d.getTimezoneOffset();
  const nd = new Date(d.getTime() - off * 60 * 1000);
  return nd.toISOString().slice(0, 10);
}
