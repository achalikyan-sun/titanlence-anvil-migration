import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Button,
  Card,
  Chip,
  Divider,
  Flex,
  Layout,
  Link,
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
import { IconAdd, IconChevronDown, IconChevronUp, IconGrid, IconList, IconMore, IconMoreVertical } from "../icons";
import { DASHBOARDS, KPIS, METRICS, type Dashboard } from "../data/mock";
import { KPI_TILE_SPANS, KpiCard } from "../components/KpiCard";
import { MAX_WATCHLIST_CARDS, type KpiPeriod } from "../lib/kpi";
import { AddToWatchlistDialog, ExportDialog, ScheduleDialog, ShareDialog } from "./Dialogs";
import "./Watchlist.css";

// Overlay states are kept in the URL: ?state=add-metrics | share | schedule | export  (&id=<dashboard id>)
// Page states: ?state=empty-watchlist | loading

const SORTS = [
  { id: "recent", label: "Recently Opened" },
  { id: "name", label: "Name (A-Z)" },
];
const OWNERS = [...new Set(DASHBOARDS.map((d) => d.owner))].map((o) => ({ id: o, label: o }));
// Anvil2 Layout spans. Below 768px the Layout has 4 columns, from 768px it has 12.
// A page section (and a dashboard in list view) spans the full row at every breakpoint.
const SECTION_SPANS = { xs: 4, md: 12 } as const;
// Dashboard cards in grid view: 1 per row below 640px, 2 from sm and md, 3 from lg (never more than 3).
const DASHBOARD_GRID_SPANS = { xs: 4, sm: 2, md: 6, lg: 4, xl: 4, xxl: 4 } as const;

// Cards shown while the watchlist is collapsed. Anything beyond this sits behind "See more".
const COLLAPSED_CARDS = 4;

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
  // Refresh reloads only the watchlist tiles: skeletons for a moment, then fresh data. The rest of the page stays put.
  const [refreshing, setRefreshing] = useState(false);
  useEffect(() => {
    if (!refreshing) return;
    const t = setTimeout(() => setRefreshing(false), 700);
    return () => clearTimeout(t);
  }, [refreshing]);
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), state === "loading" ? 60_000 : 700);
    return () => clearTimeout(t);
  }, [state]);

  // Page search
  const [query, setQuery] = useState("");
  const [submitted, setSubmitted] = useState("");

  // Watchlist
  const [watchlist, setWatchlist] = useState<string[]>([]);
  const [expanded, setExpanded] = useState(false);
  const [periods, setPeriods] = useState<Record<string, KpiPeriod>>({});
  const tiles = state === "empty-watchlist" ? [] : KPIS.slice(0, MAX_WATCHLIST_CARDS);

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
  // "See more" only exists when there is something more to show.
  const hasMore = tiles.length > COLLAPSED_CARDS;
  const shownTiles = expanded || !hasMore ? tiles : tiles.slice(0, COLLAPSED_CARDS);

  // Dashboard search width = one dashboard card in grid view. Measured from the first card so it
  // follows the Anvil Layout breakpoints. List view keeps the last grid width.
  const panelRef = useRef<HTMLDivElement>(null);
  const [cardWidth, setCardWidth] = useState<number>();
  useEffect(() => {
    const panel = panelRef.current;
    if (!panel || view !== "grid") return;
    const measure = () => {
      const card = panel.querySelector('[data-anv="card"]');
      if (card) setCardWidth(Math.round(card.getBoundingClientRect().width));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(panel);
    return () => ro.disconnect();
  });

  // Shared content of both dashboard tabs. Rendered inside the active Tab.Panel only.
  const dashboardPanel = (
    <Flex
      ref={panelRef}
      direction="column"
      gap="6"
      className="dashboard-panel"
      style={{ "--dashboard-card-width": cardWidth ? `${cardWidth}px` : undefined } as CSSProperties}
    >
      <FilterBar
        size="medium"
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
        <Layout>
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <Layout.Item key={i} {...DASHBOARD_GRID_SPANS}>
              <SkeletonRectangle height="170px" />
            </Layout.Item>
          ))}
        </Layout>
      ) : pageItems.length === 0 ? (
        <Flex direction="column" alignItems="center" gap="4">
          <Flex direction="column" alignItems="center">
            <EmptyStateNoSearchResults aria-hidden="true" height={160} />
            <Text variant="headline" el="h3" size="small">
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
        <Layout>
          {pageItems.map((d) => (
            <Layout.Item key={d.id} {...(view === "grid" ? DASHBOARD_GRID_SPANS : SECTION_SPANS)}>
              <DashboardCard
                d={d}
                onOpen={() => navigate(`/dashboards/${d.id}`)}
                onBookmark={() => toggleBookmark(d)}
                onAction={(a) => setState(a, d.id)}
                onDuplicate={() => toast.info({ title: "Dashboard duplicated", message: `A copy of ${d.name} was created.` })}
              />
            </Layout.Item>
          ))}
        </Layout>
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
  );

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
        {/* variant="wide": wider gaps between page sections than between the cards inside them. */}
        <Layout variant="wide">
          <Layout.Item {...SECTION_SPANS}>
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
                  <Card flexDirection="column" gap="6">
                    {/* Two result groups: 8px inside a group, 24px between groups. h2 because nothing sits between it and the page h1. */}
                    <Flex direction="column" gap="2">
                      <Text variant="headline" el="h2" size="small">
                        Dashboards
                      </Text>
                      {results.dashboards.length === 0 && <Text subdued>No dashboards match.</Text>}
                      {results.dashboards.map((d) => (
                        <Link key={d.id} href={`#/dashboards/${d.id}`} ghost alignSelf="flex-start">
                          {d.name}
                        </Link>
                      ))}
                    </Flex>
                    <Flex direction="column" gap="2">
                      <Text variant="headline" el="h2" size="small">
                        Metrics
                      </Text>
                      {results.metrics.length === 0 && <Text subdued>No metrics match.</Text>}
                      {results.metrics.map((m) => (
                        <Text key={m.id}>
                          {m.name} · {m.category}
                        </Text>
                      ))}
                    </Flex>
                  </Card>
                )}
              </Flex>
          </Layout.Item>
          <Layout.Item {...SECTION_SPANS}>
              {/* Watchlist */}
              <Flex direction="column" gap="3">
                <Flex alignItems="center" gap="2">
                  <Text variant="headline" el="h2" noMargin>
                    Watchlist
                  </Text>
                  <Menu icon={IconMoreVertical} aria-label="Watchlist actions" appearance="ghost" size="small">
                    <Menu.Item label="Edit" onClick={() => setState("add-metrics")} />
                    <Menu.Item label="Refresh" onClick={() => setRefreshing(true)} />
                  </Menu>
                </Flex>
                {loading || refreshing ? (
                  <Layout>
                    {[0, 1, 2, 3].map((i) => (
                      <Layout.Item key={i} {...KPI_TILE_SPANS}>
                        <SkeletonRectangle height="12.5rem" />
                      </Layout.Item>
                    ))}
                  </Layout>
                ) : tiles.length === 0 ? (
                  <Flex direction="column" alignItems="center" gap="4">
                    <Flex direction="column" alignItems="center">
                      <EmptyStateFirstUse aria-hidden="true" height={160} />
                      <Text variant="headline" el="h3" size="small">
                        Watch the numbers you check every day
                      </Text>
                      <Text subdued>{`Pick up to ${MAX_WATCHLIST_CARDS} metrics and see each one against the period before.`}</Text>
                    </Flex>
                    <Button appearance="primary" icon={{ before: IconAdd }} onClick={() => setState("add-metrics")}>
                      Add metrics
                    </Button>
                  </Flex>
                ) : (
                  <Flex direction="column" gap="3">
                    {/* Nested Layout for the tile row. Its breakpoints follow the page Layout's width. */}
                    <Layout>
                      {shownTiles.map((k) => (
                        <Layout.Item key={k.id} {...KPI_TILE_SPANS}>
                          <KpiCard
                            seed={k}
                            onOpenSource={(id) => navigate(`/dashboards/${id}`)}
                            period={periods[k.id] ?? k.defaultPeriod}
                            onPeriodChange={(p) => setPeriods((all) => ({ ...all, [k.id]: p }))}
                          />
                        </Layout.Item>
                      ))}
                    </Layout>
                    {/* Right-aligned, directly under the cards. Collapsed: "See more". Expanded: "See less".
                        No button at all when every card already fits. */}
                    {hasMore && (
                      <Flex justifyContent="end">
                        <Button
                          appearance="ghost"
                          icon={{ after: expanded ? IconChevronUp : IconChevronDown }}
                          aria-expanded={expanded}
                          onClick={() => setExpanded((e) => !e)}
                        >
                          {expanded ? "See less" : "See more"}
                        </Button>
                      </Flex>
                    )}
                  </Flex>
                )}
              </Flex>
          </Layout.Item>
          <Layout.Item {...SECTION_SPANS}>
              {/* Dashboards */}
              <Flex direction="column" gap="3">
                <Text variant="headline" el="h2" noMargin>
                  Dashboards
                </Text>
                {/* Anvil Tab: one Tab.Button per Tab.Panel, and everything that changes between tabs lives inside the panel. */}
                <Tab index={tab} onIndexChange={setTab} flexDirection="column" gap="3">
                  <Flex alignItems="center" justifyContent="space-between" gap="3">
                    <Tab.List>
                      <Tab.Button id="tab-recent" controls="panel-recent">
                        Recently Opened <Chip size="small" label={loading ? "–" : String(recent.length)} />
                      </Tab.Button>
                      <Tab.Button id="tab-bookmarked" controls="panel-bookmarked">
                        Bookmarked <Chip size="small" label={loading ? "–" : String(bookmarked.length)} />
                      </Tab.Button>
                    </Tab.List>
                    <SegmentedControl selected={view} onChange={(v) => setView(v as "grid" | "list")} name="view">
                      <SegmentedControl.Segment value="grid" icon={IconGrid} aria-label="Grid view" />
                      <SegmentedControl.Segment value="list" icon={IconList} aria-label="List view" />
                    </SegmentedControl>
                  </Flex>
                  <Tab.Panel id="panel-recent">{tab === 0 && dashboardPanel}</Tab.Panel>
                  <Tab.Panel id="panel-bookmarked">{tab === 1 && dashboardPanel}</Tab.Panel>
                </Tab>
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
      <Text subdued size="small">{d.description}</Text>
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
