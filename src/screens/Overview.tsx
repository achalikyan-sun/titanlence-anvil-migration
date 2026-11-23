import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Button,
  Card,
  Chip,
  Flex,
  Icon,
  Menu,
  MultiSelectFieldSync,
  Page,
  Pagination,
  SearchField,
  SegmentedControl,
  SelectFieldSync,
  SkeletonRectangle,
  Tab,
  Text,
  toast,
} from "@servicetitan/anvil2";
import { IconAdd, IconArrowDown, IconArrowUp, IconChevronLeft, IconChevronRight, IconGrid, IconList, IconMore, IconEdit } from "../icons";
import { DASHBOARDS, KPIS, METRICS, type Dashboard } from "../data/mock";
import { AddToWatchlistDialog, ExportDialog, ScheduleDialog, ShareDialog } from "./Dialogs";

// Slug-able overlay states: ?state=add-metrics | share | schedule | export  (&id=<dashboard id>)
// Page states: ?state=empty-watchlist | loading

const SORTS = [
  { id: "recent", label: "Recently Opened" },
  { id: "name", label: "Name (A-Z)" },
];

export function Overview() {
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
    setParams(p, { replace: false });
  };

  // ---- loading (S1-29 / S1-38): skeletons first, counts show a dash, never 0
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), state === "loading" ? 60_000 : 700);
    return () => clearTimeout(t);
  }, [state]);

  // ---- global search (S1-02..04)
  const [query, setQuery] = useState("");
  const [submitted, setSubmitted] = useState("");

  // ---- watchlist
  const [watchlist, setWatchlist] = useState<string[]>([]);
  const tiles = state === "empty-watchlist" ? [] : KPIS;

  // ---- dashboards
  const [dashboards, setDashboards] = useState<Dashboard[]>(DASHBOARDS);
  const [tab, setTab] = useState(0);
  const [view, setView] = useState<"grid" | "list">("grid");
  const [dashQuery, setDashQuery] = useState("");
  const [creators, setCreators] = useState<string[]>([]);
  const [sort, setSort] = useState("recent");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(6);

  const recent = useMemo(() => [...dashboards].sort((a, b) => a.openedRank - b.openedRank).slice(0, 6), [dashboards]);
  const bookmarked = useMemo(() => dashboards.filter((d) => d.bookmarked), [dashboards]);
  const base = tab === 0 ? recent : bookmarked;

  const visible = useMemo(() => {
    let out = base.filter(
      (d) =>
        (!dashQuery || d.name.toLowerCase().includes(dashQuery.toLowerCase())) &&
        (creators.length === 0 || creators.includes(d.owner)),
    );
    if (sort === "name") out = [...out].sort((a, b) => a.name.localeCompare(b.name));
    return out;
  }, [base, dashQuery, creators, sort]);

  useEffect(() => setPage(1), [tab, dashQuery, creators, sort, perPage]);
  const pageItems = visible.slice((page - 1) * perPage, page * perPage);
  const filtersActive = dashQuery !== "" || creators.length > 0;

  const toggleBookmark = (d: Dashboard) => {
    setDashboards((all) => all.map((x) => (x.id === d.id ? { ...x, bookmarked: !x.bookmarked } : x)));
    d.bookmarked
      ? toast.success({ title: "Bookmark removed", message: `${d.name} is no longer bookmarked.` })
      : toast.success({ title: "Bookmark added", message: `${d.name} is now bookmarked.` });
  };

  const openDashboard = (d: Dashboard) => navigate(`/dashboards/${d.id}`);

  // ---- global search results
  const results = useMemo(() => {
    if (!submitted) return null;
    const q = submitted.toLowerCase();
    return {
      dashboards: dashboards.filter((d) => d.name.toLowerCase().includes(q)).slice(0, 4),
      metrics: METRICS.filter((m) => m.name.toLowerCase().includes(q)).slice(0, 3),
    };
  }, [submitted, dashboards]);

  const targetDashboard = dashboards.find((d) => d.id === targetId);

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
        <Flex direction="column" gap="6">
          {/* Search (S1-02..04) */}
          <Flex direction="column" gap="3">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setSubmitted(query.trim());
              }}
            >
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
            </form>
            {results && (
              <Card>
                <Flex direction="column" gap="3">
                  <Text variant="headline" el="h3" size="small">
                    Dashboards
                  </Text>
                  {results.dashboards.length === 0 && <Text>No dashboards match.</Text>}
                  {results.dashboards.map((d) => (
                    <Button key={d.id} appearance="ghost" onClick={() => openDashboard(d)}>
                      {d.name}
                    </Button>
                  ))}
                  <Text variant="headline" el="h3" size="small">
                    Metrics
                  </Text>
                  {results.metrics.length === 0 && <Text>No metrics match.</Text>}
                  {results.metrics.map((m) => (
                    <Text key={m.id}>
                      {m.name} · {m.category}
                    </Text>
                  ))}
                </Flex>
              </Card>
            )}
          </Flex>

          {/* Watchlist (S1-06..10) */}
          <Flex direction="column" gap="3">
            <Flex alignItems="center" gap="2">
              <Text variant="headline" el="h2">
                Overview
              </Text>
              <Button icon={IconEdit} aria-label="Edit watchlist" appearance="ghost" size="small" onClick={() => setState("add-metrics")} />
            </Flex>
            {loading ? (
              <Flex gap="4">
                {[0, 1, 2].map((i) => (
                  <SkeletonRectangle key={i} height="200px" style={{ width: "260px" }} />
                ))}
              </Flex>
            ) : tiles.length === 0 ? (
              <Card>
                <Flex direction="column" alignItems="center" gap="3">
                  <Text variant="headline" el="h3" size="small">
                    Watch the numbers you check every day
                  </Text>
                  <Text>Pick up to 10 metrics and see each one against the period before.</Text>
                  <Button appearance="primary" icon={{ before: IconAdd }} onClick={() => setState("add-metrics")}>
                    Add metrics
                  </Button>
                </Flex>
              </Card>
            ) : (
              <KpiCarousel />
            )}
          </Flex>

          {/* Dashboards (S1-18..28) */}
          <Flex direction="column" gap="3">
            <Text variant="headline" el="h2">
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

            <Flex gap="3" alignItems="end" wrap="wrap">
              <SearchField
                aria-label="Search dashboards"
                placeholder="Search dashboards"
                value={dashQuery}
                onChange={(e) => setDashQuery(e.target.value)}
                onClear={() => setDashQuery("")}
              />
              <MultiSelectFieldSync
                label="Created By"
                hideLabel
                flexBasis="12rem"
                placeholder="Created By"
                options={[...new Set(DASHBOARDS.map((d) => d.owner))].map((o) => ({ id: o, label: o }))}
                value={creators.map((c) => ({ id: c, label: c }))}
                onSelectedOptionsChange={(opts) => setCreators(opts.map((o) => String(o.id)))}
              />
              <SelectFieldSync
                label="Sort By"
                hideLabel
                disableClearButton
                flexBasis="12rem"
                options={SORTS}
                value={SORTS.find((s) => s.id === sort) ?? null}
                onSelectedOptionChange={(o) => o && setSort(String(o.id))}
              />
            </Flex>

            {loading ? (
              <Flex gap="4" wrap="wrap">
                {[0, 1, 2, 3, 4, 5].map((i) => (
                  <SkeletonRectangle key={i} height="170px" style={{ width: "31%" }} />
                ))}
              </Flex>
            ) : pageItems.length === 0 ? (
              <Card>
                <Flex direction="column" alignItems="center" gap="3">
                  {filtersActive ? (
                    <>
                      <Text variant="headline" el="h3" size="small">
                        No results found
                      </Text>
                      <Button
                        onClick={() => {
                          setDashQuery("");
                          setCreators([]);
                        }}
                      >
                        Clear filters
                      </Button>
                    </>
                  ) : (
                    <Text variant="headline" el="h3" size="small">
                      No bookmarked dashboards yet
                    </Text>
                  )}
                </Flex>
              </Card>
            ) : (
              <div
                style={{
                  display: "grid",
                  gap: "1rem",
                  gridTemplateColumns: view === "grid" ? "repeat(3, minmax(0, 1fr))" : "1fr",
                }}
              >
                {pageItems.map((d) => (
                  <DashboardCard
                    key={d.id}
                    d={d}
                    onOpen={() => openDashboard(d)}
                    onBookmark={() => toggleBookmark(d)}
                    onAction={(a) => setState(a, d.id)}
                    onDuplicate={() => toast.info({ title: "Dashboard duplicated", message: `A copy of ${d.name} was created.` })}
                  />
                ))}
              </div>
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

function KpiCarousel() {
  const [offset, setOffset] = useState(0);
  const max = KPIS.length - 3;
  return (
    <Flex alignItems="center" gap="2">
      <Button icon={IconChevronLeft} aria-label="Previous metrics" appearance="ghost" disabled={offset === 0} onClick={() => setOffset((o) => Math.max(0, o - 1))} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "1rem", flex: 1 }}>
        {KPIS.slice(offset, offset + 3).map((k) => (
          <Card key={k.id}>
            <Flex direction="column" gap="2">
              <Text variant="headline" el="h3" size="small">
                {k.title}
              </Text>
              <Text variant="headline" el="h4" size="xlarge">
                {k.value}
              </Text>
              {k.period && <Text>{k.period}</Text>}
              {k.delta && (
                <Flex alignItems="center" gap="1">
                  <Icon svg={k.delta.direction === "up" ? IconArrowUp : IconArrowDown} />
                  <Text>
                    {k.delta.pct} vs {k.delta.prior} {k.delta.priorPeriod}
                  </Text>
                </Flex>
              )}
              <Text>{k.source}</Text>
            </Flex>
          </Card>
        ))}
      </div>
      <Button icon={IconChevronRight} aria-label="Next metrics" appearance="ghost" disabled={offset >= max} onClick={() => setOffset((o) => Math.min(max, o + 1))} />
    </Flex>
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
    <Card>
      <Flex direction="column" gap="2">
        <Flex justifyContent="space-between" alignItems="start">
          <Button appearance="ghost" onClick={props.onOpen}>
            {d.name}
          </Button>
          <Menu icon={IconMore} aria-label={`Actions for ${d.name}`} appearance="ghost" size="small">
            <Menu.Item label={d.bookmarked ? "Unbookmark" : "Bookmark"} onClick={props.onBookmark} />
            <Menu.Item label="Duplicate" onClick={props.onDuplicate} />
            <Menu.Item label="Share" onClick={() => props.onAction("share")} />
            <Menu.Item label="Export" onClick={() => props.onAction("export")} />
            <Menu.Item label="Schedule" onClick={() => props.onAction("schedule")} />
          </Menu>
        </Flex>
        <Text>{d.description}</Text>
        <Text>
          {d.tabs} Tabs · {d.modules} Modules
        </Text>
        <Flex justifyContent="space-between" alignItems="center">
          <Flex alignItems="center" gap="2">
            <Chip size="small" label={d.badge} />
            <Text>{d.owner}</Text>
          </Flex>
          <Text>{d.openedAgo}</Text>
        </Flex>
      </Flex>
    </Card>
  );
}
