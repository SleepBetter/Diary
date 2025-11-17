// pages/DiaryWrite.jsx
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { getGlobalDir, getGlobalDate } from "./global";



function DiaryWrite() {
  const [date, setDate] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [dirHandle, setDirHandle] = useState(null);

  // 받은 directory를 전역변수에 넣었다. 이래도 되려나? 나중에 뭐 배우면 그 때 바꾸지 뭐 허허
  useEffect(() => {
    (async () => {
      
      if(getGlobalDir() != null){
        setDirHandle(getGlobalDir());
        console.log(`폴더를 불러왔다 그 이름은: ${dirHandle}`);
        console.log(`아니면 혹시 ${getGlobalDir()}`);
      } else {
        console.log(`폴더 null인데? (diaryWrite)`);
      }
      if(getGlobalDate() != null) setDate(getGlobalDate());
      
      


      

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

  const loadFromFile = async () => {
    try {
      if (!dirHandle) {
        alert("먼저 폴더를 선택해주세요!");
        return;
      }

      const fileHandle = await dirHandle.getFileHandle(getFileName());
      const file = await fileHandle.getFile();
      const text = await file.text();

      const [dateLine, titleLine, ...contentLines] = text.split("\n");
      setDate(dateLine.replace("날짜: ", ""));
      setTitle(titleLine.replace("제목: ", ""));
      setContent(contentLines.join("\n").replace("내용:", "").trim());

      alert(`${getFileName()} 파일이 불러와졌습니다.`);
    } catch (err) {
      console.error(err);
      alert("파일을 찾을 수 없습니다. 해당 날짜의 일기가 없는 것 같습니다.");
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
      </div>
    </div>
  );
}

export default DiaryWrite;
