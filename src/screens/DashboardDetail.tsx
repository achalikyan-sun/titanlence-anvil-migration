import { useNavigate, useParams } from "react-router-dom";
import { Page, Text } from "@servicetitan/anvil2";
import { DASHBOARDS } from "../data/mock";

// S1-37: click-through target. Separate screen, stubbed for now.
export function DashboardDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const d = DASHBOARDS.find((x) => x.id === id);
  return (
    <Page>
      <Page.Header
        title={d?.name ?? "Dashboard not found"}
        breadcrumbs={[
          { href: "#/", children: "Analytics", onClick: (e: { preventDefault: () => void }) => { e.preventDefault(); navigate("/"); } },
          { href: "#", children: d?.name ?? "Dashboard" },
        ]}
        description={<Text>Dashboard detail is a separate screen and is not built yet.</Text>}
      />
      <Page.Content>
        <Text>Placeholder: {d?.modules} modules across {d?.tabs} tabs.</Text>
      </Page.Content>
    </Page>
  );
}
