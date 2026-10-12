import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App.tsx";
import "./styles/app.css";

const root = document.getElementById("root");
if (!root) throw new Error('Missing <div id="root"> in index.html');

createRoot(root).render(
  <StrictMode>
    {/* Follows Vite's base: "/assets" on the site, "./assets" in a relative build (e.g. a claude.ai artifact). */}
    <App assetBase={import.meta.env.BASE_URL + "assets"} />
  </StrictMode>
);
