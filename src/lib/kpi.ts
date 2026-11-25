// KPI card data contract and calculation rules.
//
// The card never receives hand-typed deltas. It receives a value and a prior value, and every
// number shown on the card (percent change, absolute change, direction) is derived here so
// the same inputs always render the same card.

// The most cards a watchlist can hold. One limit for the tiles, the metric picker and the empty-state copy.
export const MAX_WATCHLIST_CARDS = 5;

export type KpiPeriod = "day" | "week" | "month" | "quarter" | "year";
export type KpiFormat = "count" | "percent" | "currency";

// Period menu. Each tile starts on its own defaultPeriod and the menu changes it from there.
export const PERIOD_MENU = [
  { id: "day", label: "Day" },
  { id: "week", label: "Week" },
  { id: "month", label: "Month" },
  { id: "quarter", label: "Quarter" },
  { id: "year", label: "Year" },
] as const;

// The prototype's "today". Period labels are derived from it so they stay consistent with the data.
export const REF_DATE = new Date(2026, 10, 24); // 24 Nov 2026

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// Compact labels shown on the card: "Nov 2026" for the current window, "Oct 2026" for the one before.
export function periodLabels(period: KpiPeriod, ref: Date = REF_DATE): { current: string; prior: string } {
  const y = ref.getFullYear();
  const m = ref.getMonth();
  const day = (d: Date) => `${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
  const addDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
  switch (period) {
    case "day":
      return { current: day(ref), prior: day(addDays(ref, -1)) };
    case "week": {
      const start = addDays(ref, -ref.getDay()); // week starts Sunday
      return { current: `Wk of ${MONTHS[start.getMonth()]} ${start.getDate()}`, prior: `Wk of ${MONTHS[addDays(start, -7).getMonth()]} ${addDays(start, -7).getDate()}` };
    }
    case "month":
      return { current: `${MONTHS[m]} ${y}`, prior: `${MONTHS[(m + 11) % 12]} ${m === 0 ? y - 1 : y}` };
    case "quarter": {
      const q = Math.floor(m / 3) + 1;
      return { current: `Q${q} ${y}`, prior: q === 1 ? `Q4 ${y - 1}` : `Q${q - 1} ${y}` };
    }
    case "year":
      return { current: `${y}`, prior: `${y - 1}` };
  }
}

export type KpiSnapshot = {
  value: number | null; // null / NaN / Infinity = no data
  prior?: number | null; // value for the comparison window; null / undefined = nothing to compare
  trend?: number[]; // oldest to newest
};

export type KpiSeed = {
  id: string;
  title: string;
  format: KpiFormat;
  defaultPeriod: KpiPeriod;
  // Where the number comes from. Always a link: a name never exists without the dashboard it opens.
  source?: { name: string; dashboardId: string };
  // Which direction of change is good. Most metrics: "up". Cost or error-rate metrics: "down".
  goodDirection?: "up" | "down";
  // Help text for the info icon in the header. Icon hidden when absent.
  info?: string;
  // The snapshot for defaultPeriod. Other periods derive from it unless given in overrides.
  base: KpiSnapshot;
  overrides?: Partial<Record<KpiPeriod, KpiSnapshot>>;
};

const isNum = (n: unknown): n is number => typeof n === "number" && Number.isFinite(n);

const SCALE: Record<KpiPeriod, number> = { day: 0.04, week: 0.25, month: 1, quarter: 3, year: 12 };

export function snapshotFor(seed: KpiSeed, period: KpiPeriod): KpiSnapshot {
  const explicit = seed.overrides?.[period];
  if (explicit) return explicit;
  if (period === seed.defaultPeriod) return seed.base;
  // Percent metrics don't scale with the window. Counts and currency do, relative to the base period.
  const k = seed.format === "percent" ? 1 : SCALE[period] / SCALE[seed.defaultPeriod];
  const m = seed.base;
  const scale = (n: number | null | undefined) => (isNum(n) ? (seed.format === "count" ? Math.round(n * k) : Math.round(n * k * 100) / 100) : n);
  return { value: scale(m.value) ?? null, prior: scale(m.prior), trend: m.trend };
}

// ---- formatting -----------------------------------------------------------------------------

const MINUS = "−"; // typographic minus, matches the production card

const compact = new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 2 });
const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", notation: "compact", maximumFractionDigits: 2 });
const plain = new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 });

export function formatValue(value: number | null | undefined, format: KpiFormat): string {
  if (!isNum(value)) return "–"; // en dash = no data. Zero is real data and prints as 0.
  const neg = value < 0 ? MINUS : "";
  const abs = Math.abs(value);
  if (format === "percent") return `${neg}${plain.format(abs)}%`;
  if (format === "currency") return `${neg}${money.format(abs)}`;
  return `${neg}${compact.format(abs)}`;
}

// ---- delta ----------------------------------------------------------------------------------
//
// Three visual states, from the Scorecard component: positive, negative, neutral.
//   positive: success color, icon follows the direction of change
//   negative: danger color
//   neutral:  subdued color, flat icon (no change)
// "Positive" means good, not up. For a metric where down is good, a drop is positive.

export type KpiDelta =
  | { kind: "none" } // nothing to compare: the comparison line says so instead
  | { kind: "delta"; tone: "positive" | "negative" | "neutral"; direction: "up" | "down" | "flat"; percent: string };

export function resolveDelta(snap: KpiSnapshot, format: KpiFormat, goodDirection: "up" | "down" = "up"): KpiDelta {
  void format;
  const { value, prior } = snap;
  if (!isNum(value) || !isNum(prior)) return { kind: "none" };
  const diff = value - prior;
  if (diff === 0) return { kind: "delta", tone: "neutral", direction: "flat", percent: "0%" };
  const direction = diff > 0 ? "up" : "down";
  const tone = direction === goodDirection ? "positive" : "negative";
  // Prior of 0 makes a percent infinite. Say "New" instead of a number.
  if (prior === 0) return { kind: "delta", tone, direction, percent: "New" };
  const pct = (Math.abs(diff) / Math.abs(prior)) * 100;
  // Direction is carried by the arrow, so the percent has no sign.
  return { kind: "delta", tone, direction, percent: `${pct >= 1000 ? compact.format(pct) : plain.format(pct)}%` };
}

// ---- sparkline ------------------------------------------------------------------------------

export const MIN_TREND_POINTS = 3;

// Drop non-finite points. Fewer than MIN_TREND_POINTS left = no sparkline at all.
export function cleanTrend(trend: number[] | undefined): number[] | null {
  const pts = (trend ?? []).filter(isNum);
  return pts.length >= MIN_TREND_POINTS ? pts : null;
}
