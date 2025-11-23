// pages/DiaryWrite.jsx
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { getGlobalDir, getGlobalDate } from "./global";



function DiaryWrite() {
  const [date, setDate] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [dirHandle, setDirHandle] = useState(null);
  const [emotion, setEmotion] = useState("");

  // 받은 directory를 전역변수에 넣었다. 이래도 되려나? 나중에 뭐 배우면 그 때 바꾸지 뭐 허허
  useEffect(() => {
    (async () => {
      
      if(getGlobalDir() != null){
        setDirHandle(getGlobalDir());
        console.log(`폴더를 불러왔다 그 이름은: ${dirHandle}`);
        console.log(`아니면 혹시 ${getGlobalDir()}`);
        // 이상하다 dirHandle은 아직도 null인데 getGlobalDir()은 아직 
      } else {
        console.log(`폴더 null인데? (diaryWrite)`);
      }
      if(getGlobalDate() != null) setDate(getGlobalDate());
      

      loadFromFile(false);
      
      

    })();
  }, []);

  // ✅ 폴더 선택 (최초 1회)
  const selectFolder = async () => {
    try {
      const handle = await window.showDirectoryPicker();
      setDirHandle(handle);
      localStorage.setItem("diaryDirHandle", "true");
      const granted = await handle.requestPermission({ mode: "readwrite" });
      console.log("Permission:", granted);
      alert("폴더가 선택되었습니다. 이후에는 자동 복원됩니다!");
    } catch (err) {
      console.error(err);
      alert("폴더 선택이 취소되었습니다.");
    }
  };

  const getFileName = () => `${date || "my-diary"}.txt`;

  const saveToFile = async () => {
    if (!date || !title || !content) {
      alert("날짜, 제목, 내용을 모두 입력해주세요.");
      return;
    }

    try {
      if (!dirHandle) {
        alert("먼저 폴더를 선택해주세요!");
        return;
      }

      const perm = await dirHandle.requestPermission({ mode: "readwrite" });
      if (perm !== "granted") {
        alert("폴더 접근 권한이 필요합니다!");
        return;
      }

      const fileHandle = await dirHandle.getFileHandle(getFileName(), {
        create: true,
      });
      const writable = await fileHandle.createWritable();
      const data = `날짜: ${date}\n제목: ${title}\n내용:\n${content}`;
      await writable.write(data);
      await writable.close();
      


      alert(`${getFileName()} 파일로 저장되었습니다!`);
    } catch (err) {
      console.error(err);
      alert("파일 저장 중 오류가 발생했습니다.");
    }
  };

  const loadFromFile = async (notInit) => {

    let dirHandleInit;
    let fileInit;

    if(notInit){ 
      dirHandleInit = dirHandle;
      fileInit = getFileName();
    } else {
      dirHandleInit = getGlobalDir();
      fileInit = `${getGlobalDate() || "my-diary"}.txt`;
    }
    try {
      if (!dirHandleInit) {
        alert("먼저 폴더를 선택해주세요!");
        return;
      }

      const fileHandle = await dirHandleInit.getFileHandle(fileInit);
      const file = await fileHandle.getFile();
      const text = await file.text();

      const [dateLine, titleLine, ...contentLines] = text.split("\n");
      setDate(dateLine.replace("날짜: ", ""));
      setTitle(titleLine.replace("제목: ", ""));
      setContent(contentLines.join("\n").replace("내용:", "").trim());

      alert(`${fileInit} 파일이 불러와졌습니다.`);
    } catch (err) {
      console.error(err);
      alert("파일을 찾을 수 없습니다. 해당 날짜의 일기가 없는 것 같습니다.");
    }
  };

  // Analyze Emotion, gemini-2.5
  const analyzingEmotion= async() => {

    const prompt = `글에 있어 어떤 감정이 들어있는지 파악해줘\n
    형식은 다음과 같이 써줘\n
    (감정): (숫자)%\n
    파악해야 할 글은 다음과 같아:
    "${content}"`;
    const output = emotion;

    setEmotion("Loading...");

    const API_KEY = ""; // <-- Put your free API key here

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`;

    const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            contents: [{ role: "user", parts: [{ text: prompt }] }]
        })
    });

    const data = await response.json();

    if (data.candidates && data.candidates[0]) {
        setEmotion(data.candidates[0].content.parts[0].text);
    } else {
        setEmotion("Error:\n" + JSON.stringify(data, null, 2));
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white shadow rounded-xl p-6">
      <h2 className="text-xl font-bold mb-4">✏️ 일기 작성</h2>

      <label className="block mb-2">날짜 {dirHandle && (
        <a>(폴더 선택 완료)</a>
      )}</label>
      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        className="border p-2 w-full mb-4 rounded"
      />

      <label className="block mb-2">제목</label>
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="제목을 입력하세요"
        className="border p-2 w-full mb-4 rounded"
      />

      <label className="block mb-2">내용</label>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="오늘 있었던 일을 적어보세요..."
        className="border p-2 w-full h-40 mb-4 rounded"
      />

      <div className="flex flex-wrap gap-3">
        <button
          onClick={selectFolder}
          className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
        >
          📁 폴더 선택
        </button>
        <button
          onClick={saveToFile}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          💾 저장하기 ({getFileName()})
        </button>
        <button
          onClick={loadFromFile}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          📂 불러오기
        </button>
        <button
          onClick={analyzingEmotion}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          🤖 감정 분석
        </button>

        


      </div>
      {emotion && (
        <div className="border-t pt-4 whitespace-pre-wrap">
          <h3 className="font-bold text-lg mb-2">📖 감정 내용</h3>
          <p>{emotion}</p>
        </div>
      )}
    </div>
  );
}

export default DiaryWrite;
