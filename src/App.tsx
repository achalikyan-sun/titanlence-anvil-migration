import { Route, Routes } from "react-router-dom";
import { Flex, Toaster } from "@servicetitan/anvil2";
import { GlobalNavLeft, GlobalNavTop } from "./shell/GlobalNav";
import { Watchlist } from "./screens/Watchlist";
import { DashboardDetail } from "./screens/DashboardDetail";
import { KpiCards } from "./screens/KpiCards";

// App shell: global top nav + global left nav. Screens are routes inside the content area.
export function App() {
  return (
    <Flex direction="column" style={{ height: "100dvh" }}>
      <GlobalNavTop />
      <Flex style={{ flex: 1, minHeight: 0 }}>
        <GlobalNavLeft />
        <div style={{ flex: 1, minWidth: 0, overflowY: "auto" }}>
          <Routes>
            <Route path="/" element={<Watchlist />} />
            <Route path="/kpi-cards" element={<KpiCards />} />
            <Route path="/dashboards/:id" element={<DashboardDetail />} />
          </Routes>
        </div>
      </Flex>
      <Toaster id="prototype-toaster" />
    </Flex>
  );
}
