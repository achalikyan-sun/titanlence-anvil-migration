import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Layout, Page, Text } from "@servicetitan/anvil2";
import { KPI_TILE_SPANS, KpiCard } from "../components/KpiCard";
import { KPI_EDGE_CASES } from "../data/mock";
import type { KpiPeriod } from "../lib/kpi";

// Reference screen: every state the KPI card has to survive, at the real tile width and at
// the narrowest width the grid allows. Open it at #/kpi-cards.
export function KpiCards() {
  const navigate = useNavigate();
  const [periods, setPeriods] = useState<Record<string, KpiPeriod>>({});
  return (
    <Page>
      <Page.Header title="KPI card states" description={<Text>Every data shape the watchlist tile must handle without breaking its layout.</Text>} />
      <Page.Content>
        {/* One Layout.Item per card, straight in the page Layout. */}
        <Layout>
          {KPI_EDGE_CASES.map((c, i) => (
            <Layout.Item key={i} {...KPI_TILE_SPANS}>
              <KpiCard
                seed={c.seed}
                state={c.state}
                period={periods[c.seed.id + i] ?? c.seed.defaultPeriod}
                onPeriodChange={(p) => setPeriods((all) => ({ ...all, [c.seed.id + i]: p }))}
                onRetry={() => undefined}
                onOpenSource={(id) => navigate(`/dashboards/${id}`)}
              />
            </Layout.Item>
          ))}
        </Layout>
      </Page.Content>
    </Page>
  );
}
