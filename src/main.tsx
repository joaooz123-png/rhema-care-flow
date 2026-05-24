import { createRoot } from "react-dom/client";
import '@/i18n';
import App from "./App.tsx";
import "./index.css";
import { startLoopDetectorAuto } from "./lib/loopDetectorAutoStart";

try {
  startLoopDetectorAuto();
} catch (error) {
  console.warn("Loop detector failed to start; continuing app boot.", error);
}

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Root element #root not found");
}

createRoot(rootElement).render(<App />);
