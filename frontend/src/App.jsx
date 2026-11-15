import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./components/HomePage";
import DetectionDashboard from "./components/DetectionDashboard";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/detections" element={<DetectionDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
