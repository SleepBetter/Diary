// pages/DiaryList.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getGlobalDir, setGlobalDir, getGlobalDate, setGlobalDate} from "./global";

function DiaryList() {
  const [selectedDate, setSelectedDate] = useState("");
  const [content, setContent] = useState("");
  const [dirHandle, setDirHandle] = useState(null);

  useEffect(() => {
    (async () => {
      if (await navigator.storage.persisted() === false) {
        await navigator.storage.persist();
        console.log("권한 부여 안됨");
      } else{
        console.log("권한 부여 됨");
      }

      // 바뀔때 마다 저장된 데이터 불러오기
      if(getGlobalDir() != null) setDirHandle(getGlobalDir());
      if(getGlobalDate() != null) setSelectedDate(getGlobalDate());
      console.log(dirHandle);


    })();
  }, []);

  const selectFolder = async () => {
    if (await navigator.storage.persisted() === false) {
        await navigator.storage.persist();
        console.log("권한 부여 안됨");
      } else{
        console.log("권한 부여 됨");
      }
    try {
      const handle = await window.showDirectoryPicker();
      const granted = await handle.requestPermission({ mode: "readwrite" });
      if (granted !== "granted") throw new Error("권한 거부됨");
      setDirHandle(handle);
      localStorage.setItem("diaryDirHandle", "true");
      
      alert("폴더가 선택되었습니다! 자동 복원됩니다.");
      console.log(handle);
      alert(granted);
    } catch (err) {
      console.error(err);
      alert("폴더 선택이 취소되었습니다.");
    }
  };

  const getFileName = () => `${selectedDate || "my-diary"}.txt`;

  const openDiary = async () => {
    if (!selectedDate) {
      alert("날짜를 선택해주세요!");
      return;
    }

    try {
      if (!dirHandle) {
        alert("먼저 폴더를 선택해주세요!");
        return;
      }

      const fileHandle = await dirHandle.getFileHandle(getFileName());
      const file = await fileHandle.getFile();
      const text = await file.text();
      setContent(text);
      alert(`${getFileName()} 파일을 불러왔습니다.`);
    } catch (err) {
      console.error(err);
      alert("해당 날짜의 일기 파일을 찾을 수 없습니다.");
    }
  };

  const listFiles = async () => {
    if (!dirHandle) {
      alert("먼저 폴더를 선택해주세요!");
      return;
    }

    const files = [];
    for await (const [name, handle] of dirHandle.entries()) {
      if (handle.kind === "file" && name.endsWith(".txt")) {
        files.push(name);
      }
    }
    alert("현재 폴더의 일기 목록:\n" + files.join("\n"));
  };

  const navigate = useNavigate();


  const goToDiaryWrite = () => {
    const id = 42;
    
    setGlobalDir(dirHandle);
    setGlobalDate(selectedDate);
    console.log(`지금 바로 세팅 되었다: ${dirHandle}`);
    navigate(`/write`, {state: dirHandle});
  }

  return (
    <div className="max-w-2xl mx-auto bg-white shadow rounded-xl p-6">
      <h2 className="text-xl font-bold mb-4">📅 일기 목록 보기</h2>

      <div className="flex flex-col gap-3 mb-4">
        <button
          onClick={selectFolder}
          className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
        >
          📁 폴더 선택
        </button>
        <button
          onClick={listFiles}
          className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
        >
          📜 폴더 내 일기 목록 보기
        </button>
      </div>

      <label className="block mb-2">
        날짜 선택      {dirHandle && (
        <a>(폴더 선택 완료)</a>
      )}
        </label>

      <input
        type="date"
        value={selectedDate}
        onChange={(e) => setSelectedDate(e.target.value)}
        className="border p-2 w-full mb-4 rounded"
      />

      <button
        onClick={openDiary}
        className="bg-blue-500 text-white mr-3 px-4 py-2 rounded hover:bg-blue-600 mb-4"
      >
        📂 {getFileName()} 불러오기
      </button>

      <button 
        onClick={goToDiaryWrite}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 mb-4"
        
      >
        DiaryWrite로 가기🥵
      </button>

      {content && (
        <div className="border-t pt-4 whitespace-pre-wrap">
          <h3 className="font-bold text-lg mb-2">📖 일기 내용</h3>
          <p>{content}</p>
        </div>
      )}
    </div>
  );
}

export default DiaryList;
