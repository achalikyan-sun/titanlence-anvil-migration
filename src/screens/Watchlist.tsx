import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Button,
  Card,
  Chip,
  Divider,
  Flex,
  Grid,
  Layout,
  Menu,
  Page,
  Pagination,
  SearchField,
  SegmentedControl,
  SkeletonRectangle,
  Tab,
  Text,
  toast,
} from "@servicetitan/anvil2";
import { FilterBar, InteractiveCard } from "@servicetitan/anvil2/beta";
import { EmptyStateFirstUse, EmptyStateNoSearchResults } from "@servicetitan/anvil2-illustrations";
import { IconAdd, IconChevronLeft, IconChevronRight, IconEdit, IconGrid, IconList, IconMore } from "../icons";
import { DASHBOARDS, KPIS, METRICS, type Dashboard } from "../data/mock";
import { KpiCard, TILE_MIN_WIDTH } from "../components/KpiCard";
import type { KpiPeriod } from "../lib/kpi";
import { AddToWatchlistDialog, ExportDialog, ScheduleDialog, ShareDialog } from "./Dialogs";

// Overlay states are kept in the URL: ?state=add-metrics | share | schedule | export  (&id=<dashboard id>)
// Page states: ?state=empty-watchlist | loading

const SORTS = [
  { id: "recent", label: "Recently Opened" },
  { id: "name", label: "Name (A-Z)" },
];
const OWNERS = [...new Set(DASHBOARDS.map((d) => d.owner))].map((o) => ({ id: o, label: o }));
const VISIBLE_TILES = 4;

export function Watchlist() {
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const state = params.get("state");
  const targetId = params.get("id");

  const setState = (next: string | null, id?: string) => {
    const p = new URLSearchParams(params);
    if (next) p.set("state", next);
    else p.delete("state");
    if (id) p.set("id", id);
    else p.delete("id");
    setParams(p);
  };

  // Loading: skeletons first, and tab counts show a dash rather than 0.
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), state === "loading" ? 60_000 : 700);
    return () => clearTimeout(t);
  }, [state]);

  // Page search
  const [query, setQuery] = useState("");
  const [submitted, setSubmitted] = useState("");

  // Watchlist
  const [watchlist, setWatchlist] = useState<string[]>([]);
  const [offset, setOffset] = useState(0);
  const [periods, setPeriods] = useState<Record<string, KpiPeriod>>({});
  const tiles = state === "empty-watchlist" ? [] : KPIS;

  // Dashboards
  const [dashboards, setDashboards] = useState<Dashboard[]>(DASHBOARDS);
  const [tab, setTab] = useState(0);
  const [view, setView] = useState<"grid" | "list">("grid");
  const [dashQuery, setDashQuery] = useState("");
  const [creators, setCreators] = useState<{ id: string | number; label: string }[]>([]);
  const [sort, setSort] = useState<(typeof SORTS)[number] | undefined>(undefined); // none = Recently Opened
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(6);

  const recent = useMemo(() => [...dashboards].sort((a, b) => a.openedRank - b.openedRank).slice(0, 6), [dashboards]);
  const bookmarked = useMemo(() => dashboards.filter((d) => d.bookmarked), [dashboards]);
  const base = tab === 0 ? recent : bookmarked;

  const visible = useMemo(() => {
    const owners = creators.map((c) => String(c.id));
    let out = base.filter(
      (d) =>
        (!dashQuery || d.name.toLowerCase().includes(dashQuery.toLowerCase())) &&
        (owners.length === 0 || owners.includes(d.owner)),
    );
    if (sort?.id === "name") out = [...out].sort((a, b) => a.name.localeCompare(b.name));
    return out;
  }, [base, dashQuery, creators, sort]);

  useEffect(() => setPage(1), [tab, dashQuery, creators, sort, perPage]);
  const pageItems = visible.slice((page - 1) * perPage, page * perPage);
  const filtersActive = dashQuery !== "" || creators.length > 0;

  const toggleBookmark = (d: Dashboard) => {
    setDashboards((all) => all.map((x) => (x.id === d.id ? { ...x, bookmarked: !x.bookmarked } : x)));
    if (d.bookmarked) toast.success({ title: "Bookmark removed", message: `${d.name} is no longer bookmarked.` });
    else toast.success({ title: "Bookmark added", message: `${d.name} is now bookmarked.` });
  };

  const results = useMemo(() => {
    if (!submitted) return null;
    const q = submitted.toLowerCase();
    return {
      dashboards: dashboards.filter((d) => d.name.toLowerCase().includes(q)).slice(0, 4),
      metrics: METRICS.filter((m) => m.name.toLowerCase().includes(q)).slice(0, 3),
    };
  }, [submitted, dashboards]);

  const targetDashboard = dashboards.find((d) => d.id === targetId);
  const maxOffset = Math.max(0, KPIS.length - VISIBLE_TILES);

  return (
    <Page>
      <Page.Header
        title="Good morning, Marcus."
        description={
          <Text>
            Analytics gives you a live view of your business — revenue, performance, trends, all in one place. Start by asking
            Atlas a question or exploring your dashboards.
          </Text>
        }
      />
      <Page.Content>
        <Layout>
          <Layout.Item span={12}>
            <Flex direction="column" gap="6">
              {/* Page search */}
              <Flex direction="column" gap="3">
                <SearchField
                  aria-label="Search"
                  placeholder="Ask Atlas to build a chart, calculate a metric, or compare techs..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      setSubmitted(query.trim());
                    }
                  }}
                  onClear={() => {
                    setQuery("");
                    setSubmitted("");
                  }}
                />
                {results && (
                  <Card flexDirection="column" gap="3">
                    <Text variant="headline" el="h3" size="small">
                      Dashboards
                    </Text>
                    {results.dashboards.length === 0 && <Text subdued>No dashboards match.</Text>}
                    {results.dashboards.map((d) => (
                      <Button key={d.id} appearance="ghost" onClick={() => navigate(`/dashboards/${d.id}`)}>
                        {d.name}
                      </Button>
                    ))}
                    <Text variant="headline" el="h3" size="small">
                      Metrics
                    </Text>
                    {results.metrics.length === 0 && <Text subdued>No metrics match.</Text>}
                    {results.metrics.map((m) => (
                      <Text key={m.id}>
                        {m.name} · {m.category}
                      </Text>
                    ))}
                  </Card>
                )}
              </Flex>

              {/* Watchlist */}
              <Flex direction="column" gap="3">
                <Flex alignItems="center" gap="2">
                  <Text variant="headline" el="h2" size="large">
                    Watchlist
                  </Text>
                  <Button icon={IconEdit} aria-label="Edit watchlist" appearance="ghost" size="small" onClick={() => setState("add-metrics")} />
                </Flex>
                {loading ? (
                  <Grid gap="4" templateColumns={`repeat(auto-fit, minmax(${TILE_MIN_WIDTH}, 1fr))`}>
                    {[0, 1, 2, 3].map((i) => (
                      <SkeletonRectangle key={i} height="12.5rem" />
                    ))}
                  </Grid>
                ) : tiles.length === 0 ? (
                  <Flex direction="column" alignItems="center" gap="4">
                    <Flex direction="column" alignItems="center">
                      <EmptyStateFirstUse aria-hidden="true" height={160} />
                      <Text variant="headline" el="h3">
                        Watch the numbers you check every day
                      </Text>
                      <Text subdued>Pick up to 10 metrics and see each one against the period before.</Text>
                    </Flex>
                    <Button appearance="primary" icon={{ before: IconAdd }} onClick={() => setState("add-metrics")}>
                      Add metrics
                    </Button>
                  </Flex>
                ) : (
                  <Flex alignItems="center" gap="2">
                    <Button icon={IconChevronLeft} aria-label="Previous metrics" appearance="ghost" disabled={offset === 0} onClick={() => setOffset((o) => Math.max(0, o - 1))} />
                    <Grid gap="4" flex="1" style={{ minWidth: 0 }} templateColumns={`repeat(auto-fit, minmax(${TILE_MIN_WIDTH}, 1fr))`}>
                      {KPIS.slice(offset, offset + VISIBLE_TILES).map((k) => (
                        <KpiCard
                          key={k.id}
                          seed={k}
                          onOpenSource={(id) => navigate(`/dashboards/${id}`)}
                          period={periods[k.id] ?? k.defaultPeriod}
                          onPeriodChange={(p) => setPeriods((all) => ({ ...all, [k.id]: p }))}
                        />
                      ))}
                    </Grid>
                    <Button icon={IconChevronRight} aria-label="Next metrics" appearance="ghost" disabled={offset >= maxOffset} onClick={() => setOffset((o) => Math.min(maxOffset, o + 1))} />
                  </Flex>
                )}
              </Flex>

              {/* Dashboards */}
              <Flex direction="column" gap="3">
                <Text variant="headline" el="h2" size="large">
                  Dashboards
                </Text>
                <Flex alignItems="center" justifyContent="space-between" gap="3">
                  <Tab index={tab} onIndexChange={setTab}>
                    <Tab.List>
                      <Tab.Button id="tab-recent" controls="panel-list">
                        Recently Opened <Chip size="small" label={loading ? "–" : String(recent.length)} />
                      </Tab.Button>
                      <Tab.Button id="tab-bookmarked" controls="panel-list">
                        Bookmarked <Chip size="small" label={loading ? "–" : String(bookmarked.length)} />
                      </Tab.Button>
                    </Tab.List>
                    <Tab.Panel id="panel-list">{null}</Tab.Panel>
                  </Tab>
                  <SegmentedControl selected={view} onChange={(v) => setView(v as "grid" | "list")} name="view">
                    <SegmentedControl.Segment value="grid" icon={IconGrid} aria-label="Grid view" />
                    <SegmentedControl.Segment value="list" icon={IconList} aria-label="List view" />
                  </SegmentedControl>
                </Flex>

                <FilterBar
                  associatedContent="dashboards"
                  filters={[
                    { id: "search", type: "search", label: "Search dashboards", placeholder: "Search dashboards", value: dashQuery },
                    { id: "creator", type: "multiSelect", label: "Created By", options: OWNERS, selectedOptions: creators },
                    { id: "sort", type: "singleSelect", label: "Sort By", options: SORTS, selectedOption: sort },
                  ]}
                  onFilterChange={(next) => {
                    for (const f of next) {
                      if (f.id === "search" && f.type === "search") setDashQuery(f.value ?? "");
                      if (f.id === "creator" && f.type === "multiSelect") setCreators(f.selectedOptions ?? []);
                      if (f.id === "sort" && f.type === "singleSelect") setSort(f.selectedOption as (typeof SORTS)[number] | undefined);
                    }
                  }}
                />

                {loading ? (
                  <Grid gap="4" templateColumns="repeat(3, minmax(0, 1fr))">
                    {[0, 1, 2, 3, 4, 5].map((i) => (
                      <SkeletonRectangle key={i} height="170px" />
                    ))}
                  </Grid>
                ) : pageItems.length === 0 ? (
                  <Flex direction="column" alignItems="center" gap="4">
                    <Flex direction="column" alignItems="center">
                      <EmptyStateNoSearchResults aria-hidden="true" height={160} />
                      <Text variant="headline" el="h3">
                        {filtersActive ? "No dashboards match these filters" : "Bookmark your dashboards"}
                      </Text>
                      <Text subdued>
                        {filtersActive
                          ? "Try another search or clear the filters."
                          : "Bookmarked dashboards will appear here for quick access."}
                      </Text>
                    </Flex>
                    {filtersActive && (
                      <Button
                        onClick={() => {
                          setDashQuery("");
                          setCreators([]);
                        }}
                      >
                        Clear filters
                      </Button>
                    )}
                  </Flex>
                ) : (
                  <Grid gap="4" templateColumns={view === "grid" ? "repeat(3, minmax(0, 1fr))" : "1fr"}>
                    {pageItems.map((d) => (
                      <DashboardCard
                        key={d.id}
                        d={d}
                        onOpen={() => navigate(`/dashboards/${d.id}`)}
                        onBookmark={() => toggleBookmark(d)}
                        onAction={(a) => setState(a, d.id)}
                        onDuplicate={() => toast.info({ title: "Dashboard duplicated", message: `A copy of ${d.name} was created.` })}
                      />
                    ))}
                  </Grid>
                )}

                {!loading && visible.length > perPage && (
                  <Pagination
                    page={page}
                    itemsPerPage={perPage}
                    itemsPerPageOptions={[6, 12, 24]}
                    totalItemCount={visible.length}
                    showCount
                    onPageChange={setPage}
                    onItemsPerPageChange={setPerPage}
                  />
                )}
              </Flex>
            </Flex>
          </Layout.Item>
        </Layout>
      </Page.Content>

      <AddToWatchlistDialog
        open={state === "add-metrics"}
        selected={watchlist}
        onClose={() => setState(null)}
        onSave={(ids) => {
          setWatchlist(ids);
          setState(null);
        }}
      />
      <ShareDialog open={state === "share"} name={targetDashboard?.name} onClose={() => setState(null)} />
      <ScheduleDialog open={state === "schedule"} name={targetDashboard?.name} onClose={() => setState(null)} />
      <ExportDialog open={state === "export"} name={targetDashboard?.name} onClose={() => setState(null)} />
    </Page>
  );
}

function DashboardCard(props: {
  d: Dashboard;
  onOpen: () => void;
  onBookmark: () => void;
  onAction: (a: "share" | "schedule" | "export") => void;
  onDuplicate: () => void;
}) {
  const { d } = props;
  return (
    <InteractiveCard
      wrapperProps={{ "aria-label": `${d.name} card` }}
      actionProps={{ "aria-label": `Open ${d.name}`, onClick: props.onOpen }}
      contentProps={{ padding: "medium", flexDirection: "column", gap: "2" }}
    >
      <Flex justifyContent="space-between" alignItems="start">
        <Text variant="headline" el="h3" size="small">
          {d.name}
        </Text>
        <Menu icon={IconMore} aria-label={`Actions for ${d.name}`} appearance="ghost" size="small">
          <Menu.Item label={d.bookmarked ? "Unbookmark" : "Bookmark"} onClick={props.onBookmark} />
          <Menu.Item label="Duplicate" onClick={props.onDuplicate} />
          <Menu.Item label="Share" onClick={() => props.onAction("share")} />
          <Menu.Item label="Export" onClick={() => props.onAction("export")} />
          <Menu.Item label="Schedule" onClick={() => props.onAction("schedule")} />
        </Menu>
      </Flex>
      <Text subdued>{d.description}</Text>
      <Text subdued size="small">
        {d.tabs} Tabs · {d.modules} Modules
      </Text>
      <Divider />
      <Flex justifyContent="space-between" alignItems="center">
        <Flex alignItems="center" gap="2">
          <Chip size="small" label={d.badge} />
          <Text size="small">{d.owner}</Text>
        </Flex>
        <Text subdued size="small">
          {d.openedAgo}
        </Text>
      </Flex>
    </InteractiveCard>
  );
}
