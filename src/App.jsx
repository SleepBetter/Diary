// App.jsx
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import DiaryWrite from "./pages/DiaryWrite";
import DiaryList from "./pages/DiaryList";

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100 text-gray-800">
        <nav className="bg-white shadow p-4 flex justify-between items-center">
          <h1 className="font-bold text-xl">📔 나의 일기장</h1>
          <div className="space-x-4">
            <Link to="/write" className="hover:text-blue-500">일기 작성</Link>
            <Link to="/" className="hover:text-blue-500">일기 목록</Link>
          </div>
        </nav>

        <div className="p-6">
          <Routes>
            <Route path="/" element={<DiaryList />} />
            <Route path="/write" element={<DiaryWrite />} />
            
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
