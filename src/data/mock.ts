// Mock-only seed data. Everything lives in memory and resets on refresh.

import type { KpiSeed } from "../lib/kpi";

// Watchlist tiles. Values come from the production reference ("Total Jobs Completed" etc.).
// Deltas are derived from value + prior in lib/kpi.ts, never typed in here.
export const KPIS: KpiSeed[] = [
  {
    id: "k1",
    title: "Total Jobs Completed",
    info: "Jobs marked completed in the selected period.",
    format: "count",
    defaultPeriod: "month",
    source: { name: "Operations Dashboard", dashboardId: "dash-001" },
    base: { value: 0, prior: 58, trend: [12, 14, 13, 15, 18, 26, 31, 22, 0] },
  },
  {
    id: "k2",
    title: "Excellent Query Performance",
    format: "percent",
    defaultPeriod: "month",
    source: { name: "AI and BI System Liveboard", dashboardId: "dash-011" },
    base: { value: 23.97, prior: 6.26, trend: [8, 14, 12, 12, 13, 12, 13, 14, 24] },
  },
  {
    id: "k3",
    title: "Liveboard Impressions",
    format: "count",
    defaultPeriod: "month",
    source: { name: "AI and BI System Liveboard", dashboardId: "dash-011" },
    base: { value: 3720, prior: 6300, trend: [10, 11, 14, 12, 13, 12, 12, 12, 9] },
  },
  {
    id: "k4",
    title: "Callback Rate",
    info: "Share of jobs that needed a return visit. Lower is better.",
    format: "percent",
    defaultPeriod: "week",
    goodDirection: "down", // fewer callbacks is good, so a drop is green
    source: { name: "Operations Dashboard", dashboardId: "dash-001" },
    base: { value: 4.2, prior: 5.1, trend: [6, 5.8, 5.5, 5.1, 4.9, 4.6, 4.4, 4.2] },
  },
  {
    id: "k5",
    title: "Weekly Active Users",
    format: "count",
    defaultPeriod: "week",
    source: { name: "AI and BI System Liveboard", dashboardId: "dash-011" },
    base: { value: 38, prior: 38 }, // same as last period: the neutral state (flat arrow, 0%)
  },
  {
    id: "k6",
    title: "Annual Active Users",
    format: "count",
    defaultPeriod: "year",
    source: { name: "AI and BI System Liveboard", dashboardId: "dash-011" },
    base: { value: null }, // no data
  },
];

// Every shape the card has to survive. Rendered on #/kpi-cards. `label` names the case here in the code and is not shown on the page.
export const KPI_EDGE_CASES: { label: string; seed: KpiSeed; state?: "ready" | "loading" | "error" }[] = [
  { label: "Positive (up is good)", seed: KPIS[1] },
  { label: "Negative (down is bad), zero value", seed: KPIS[0] },
  { label: "Positive (down is good)", seed: KPIS[3] },
  {
    label: "No prior, no trend",
    seed: { id: "e12", title: "Weekly Active Users", format: "count", defaultPeriod: "week", source: { name: "AI and BI System Liveboard", dashboardId: "dash-011" }, base: { value: 38 } },
  },
  { label: "No data (null)", seed: KPIS[5] },
  {
    label: "Very long title",
    seed: { id: "e1", title: "Average Revenue Per Completed Job Across All Business Units, Service Lines and Membership Tiers", format: "currency", defaultPeriod: "month", source: { name: "Executive Dashboard: Projects", dashboardId: "dash-007" }, base: { value: 1234.5, prior: 1100, trend: [1, 2, 3, 2, 4] } },
  },
  {
    label: "Very long value",
    seed: { id: "e2", title: "Lifetime Revenue", format: "currency", defaultPeriod: "month", source: { name: "Revenue Overview", dashboardId: "dash-002" }, base: { value: 98765432100, prior: 91000000000, trend: [1, 3, 2, 5, 8] } },
  },
  {
    label: "Negative value",
    seed: { id: "e3", title: "Net Cash Flow", format: "currency", defaultPeriod: "month", source: { name: "Revenue Overview", dashboardId: "dash-002" }, base: { value: -12400, prior: 8200, trend: [5, 3, 1, -2, -4] } },
  },
  {
    label: "Prior is 0 (New)",
    seed: { id: "e4", title: "New Memberships", format: "count", defaultPeriod: "month", source: { name: "Membership Health", dashboardId: "dash-009" }, base: { value: 14, prior: 0, trend: [0, 0, 2, 5, 14] } },
  },
  {
    label: "Neutral (no change)",
    seed: { id: "e5", title: "Open Estimates", format: "count", defaultPeriod: "month", source: { name: "Revenue Overview", dashboardId: "dash-002" }, base: { value: 120, prior: 120, trend: [118, 120, 119, 121, 120] } },
  },
  {
    label: "Huge % change",
    seed: { id: "e6", title: "Web Leads", format: "count", defaultPeriod: "month", source: { name: "Marketing ROI", dashboardId: "dash-006" }, base: { value: 52000, prior: 40, trend: [1, 2, 9, 40, 52] } },
  },
  {
    label: "Flat trend",
    seed: { id: "e7", title: "Technician Count", format: "count", defaultPeriod: "month", source: { name: "Technician Performance", dashboardId: "dash-003" }, base: { value: 42, prior: 40, trend: [42, 42, 42, 42, 42] } },
  },
  {
    label: "Trend with NaN / too few points",
    seed: { id: "e8", title: "Booked Jobs", format: "count", defaultPeriod: "month", source: { name: "Call Booking Funnel", dashboardId: "dash-005" }, base: { value: 310, prior: 280, trend: [Number.NaN, 5, Number.NaN] } },
  },
  {
    label: "No source (footer hidden)",
    seed: { id: "e9", title: "Average Ticket", format: "currency", defaultPeriod: "month", base: { value: 412, prior: 398, trend: [390, 395, 398, 402, 412] } },
  },
  {
    label: "Very long source name (link truncates)",
    seed: { id: "e11", title: "Open Estimates", format: "count", defaultPeriod: "month", source: { name: "Residential Plumbing Sales Pipeline and Estimate Follow-up Executive Liveboard", dashboardId: "dash-001" }, base: { value: 88, prior: 80 } },
  },
  { label: "Loading", seed: KPIS[1], state: "loading" },
  { label: "Error", seed: KPIS[1], state: "error" },
];

export type Metric = { id: string; name: string; category: string; certified: boolean };

export const METRICS: Metric[] = [
  { id: "m1", name: "Avg Days to Invoice by Business Unit", category: "Accounting", certified: true },
  { id: "m2", name: "Total Revenue", category: "Financial", certified: true },
  { id: "m3", name: "Gross Margin %", category: "Financial", certified: true },
  { id: "m4", name: "Job Conversation Rate", category: "Operations", certified: true },
  { id: "m5", name: "Open Estimates", category: "Operations", certified: false },
  { id: "m6", name: "Technician Utilization", category: "Operations", certified: true },
  { id: "m7", name: "Outstanding AR", category: "Accounting", certified: true },
  { id: "m8", name: "New Bookings $", category: "General", certified: false },
  { id: "m9", name: "Membership Renewals", category: "General", certified: true },
  { id: "m10", name: "Callback Rate", category: "Operations", certified: true },
  { id: "m11", name: "Average Ticket", category: "Financial", certified: true },
  { id: "m12", name: "Booked Jobs", category: "General", certified: false },
];

export type Dashboard = {
  id: string;
  name: string;
  description: string;
  tabs: number;
  modules: number;
  badge: "Built-In" | "Created by Me" | "Shared with Me";
  owner: string;
  openedAgo: string;
  openedRank: number; // lower = opened more recently
  bookmarked: boolean;
};

const NAMES = [
  "Operations Dashboard",
  "Revenue Overview",
  "Technician Performance",
  "Service Agreement Financial Details",
  "Call Booking Funnel",
  "Marketing ROI",
  "Executive Dashboard: Projects",
  "Accounts Receivable Aging",
  "Membership Health",
  "Dispatch Efficiency",
  "AI and BI System Liveboard",
];
const OWNERS = ["ServiceTitan", "Alex Kablanian", "marodemo"];
const BADGES: Dashboard["badge"][] = ["Built-In", "Created by Me", "Shared with Me"];
const DESC =
  "Daily operations snapshot — revenue, conversion, utilization. Track the numbers your team checks every morning.";

// Opened order is scrambled (37 is coprime with 80, so every rank is used once) so "Recently Opened"
// shows different dashboards from "Bookmarked", which lists in id order.
const openedRank = (i: number) => (i * 37 + 5) % 80;

export const DASHBOARDS: Dashboard[] = Array.from({ length: 80 }, (_, i) => {
  const rank = openedRank(i);
  return {
    id: `dash-${String(i + 1).padStart(3, "0")}`,
    name: i < NAMES.length ? NAMES[i] : `${NAMES[i % NAMES.length]} ${Math.floor(i / NAMES.length) + 1}`,
    description: DESC,
    tabs: 3 + (i % 6),
    modules: 4 + (i % 9),
    badge: BADGES[i % 3],
    owner: OWNERS[i % 3],
    openedAgo: rank < 6 ? `${rank + 1} day${rank ? "s" : ""} ago` : `${Math.floor(rank / 4) + 1} weeks ago`,
    openedRank: rank,
    bookmarked: true, // all 80 start bookmarked, matching the "1 - 6 of 80 items" in the design
  };
});
