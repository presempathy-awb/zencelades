import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import AudioView from "../src/AudioView";
import "../src/style.css";
import "../src/viewport.css";
import "./studio.css";

const root = document.getElementById("root");
if (!root) throw new Error("Private studio root is missing");
createRoot(root).render(
  <StrictMode>
    <main className="private-studio">
      <header className="private-studio-header">
        <strong>Zencelades · Private asset studio</strong>
        <a href="https://zenceladus.com/">Return to the artwork ↗</a>
      </header>
      <AudioView />
    </main>
  </StrictMode>,
);
