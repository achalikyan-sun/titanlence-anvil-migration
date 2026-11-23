import { Route, Routes } from "react-router-dom";
import { Toaster } from "@servicetitan/anvil2";
import { Overview } from "./screens/Overview";
import { DashboardDetail } from "./screens/DashboardDetail";

// App shell. Screens are routes inside this shell.
export function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Overview />} />
        <Route path="/dashboards/:id" element={<DashboardDetail />} />
      </Routes>
      <Toaster id="prototype-toaster" />
    </>
  );
}
