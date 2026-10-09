import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App.tsx";
import "./styles/app.css";

const root = document.getElementById("root");
if (!root) throw new Error('Missing <div id="root"> in index.html');

createRoot(root).render(
  <StrictMode>
    <App assetBase="/assets" />
  </StrictMode>
);
