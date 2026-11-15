import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import AppOld from "./App-v1.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
    {/* <AppOld /> */}
  </StrictMode>,
);
