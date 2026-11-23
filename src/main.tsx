import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { HashRouter } from "react-router-dom";
import { AnvilProvider } from "@servicetitan/anvil2";
import "@servicetitan/anvil2/assets/css-utils/a2-utils.css";
import { App } from "./App";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AnvilProvider>
      <HashRouter>
        <App />
      </HashRouter>
    </AnvilProvider>
  </StrictMode>,
);
