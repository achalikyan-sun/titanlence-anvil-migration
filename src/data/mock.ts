// Mock-only seed data. Everything lives in memory and resets on refresh.

export type Kpi = {
  id: string;
  title: string;
  value: string;
  period: string;
  delta?: { pct: string; direction: "up" | "down"; prior: string; priorPeriod: string };
  trend?: number[];
  source: string;
};

export const KPIS: Kpi[] = [
  {
    id: "k1",
    title: "Excellent Query Performance",
    value: "23.97%",
    period: "Jul 2026",
    delta: { pct: "282.90%", direction: "up", prior: "(6.26%)", priorPeriod: "Jun 2026" },
    trend: [8, 14, 12, 12, 13, 12, 13, 14],
    source: "AI and BI System Liveboard",
  },
  {
    id: "k2",
    title: "Liveboard Impressions",
    value: "3.72K",
    period: "Jul 2026",
    delta: { pct: "40.93%", direction: "down", prior: "(6.3K)", priorPeriod: "Jun 2026" },
    trend: [10, 11, 14, 12, 13, 12, 12, 12],
    source: "AI and BI System Liveboard",
  },
  { id: "k3", title: "Annual Active Users", value: "0", period: "", source: "AI and BI System Liveboard" },
  { id: "k4", title: "Weekly Active Users", value: "38", period: "", source: "AI and BI System Liveboard" },
  { id: "k5", title: "Quarterly Active Users", value: "132", period: "", source: "AI and BI System Liveboard" },
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
];
const OWNERS = ["ServiceTitan", "Alex Kablanian", "marodemo"];
const BADGES: Dashboard["badge"][] = ["Built-In", "Created by Me", "Shared with Me"];
const DESC =
  "Daily operations snapshot — revenue, conversion, utilization. Track the numbers your team checks every morning.";

export const DASHBOARDS: Dashboard[] = Array.from({ length: 80 }, (_, i) => ({
  id: `dash-${String(i + 1).padStart(3, "0")}`,
  name: i < NAMES.length ? NAMES[i] : `${NAMES[i % NAMES.length]} ${Math.floor(i / NAMES.length) + 1}`,
  description: DESC,
  tabs: 3 + (i % 6),
  modules: 4 + (i % 9),
  badge: BADGES[i % 3],
  owner: OWNERS[i % 3],
  openedAgo: i < 6 ? `${i + 1} day${i ? "s" : ""} ago` : `${Math.floor(i / 4) + 1} weeks ago`,
  openedRank: i,
  bookmarked: true, // all 80 start bookmarked, matching the "1 - 6 of 80 items" in the design
}));
