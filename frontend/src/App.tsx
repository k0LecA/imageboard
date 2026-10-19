import { BrowserRouter, Routes, Route } from "react-router-dom";
import './App.css'
import Home from './pages/Home'
import Board from './pages/Board'
import Thread from './pages/Thread'
import ModAuth from './pages/ModAuth'
import ModDashboard from "./pages/ModDashboard";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/mod" element={<ModAuth />} />
        <Route path="/mod/dashboard" element={<ModDashboard />} />
        <Route path="/" element={<Home />} />
        <Route path="/:slug" element={<Board />} />
        <Route path="/:slug/:threadId" element={<Thread />}/>
      </Routes>
    </BrowserRouter>
  )
}

export default App
