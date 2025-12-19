import React from "react";
import ReactDOM from "react-dom/client";
import { Router } from "wouter";
import App from "./App.tsx";
import "./index.css";

const base = (import.meta.env.BASE_URL || "/").replace(/\/$/, "");

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Router base={base === "" ? "/" : base}>
      <App />
    </Router>
  </React.StrictMode>,
)
