import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { Socket } from "./Context/Socket.tsx";
import { WebRTC } from "./Context/WebRTC.tsx";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Socket>
      <WebRTC>
        <App />
      </WebRTC>
    </Socket>
  </React.StrictMode>,
);
