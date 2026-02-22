import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import AppRouter from "./app/router";
import { initializeTheme } from "./lib/theme";
import "./index.css";

initializeTheme();

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AppRouter />
  </StrictMode>,
);
