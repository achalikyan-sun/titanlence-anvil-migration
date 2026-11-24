# titanlence-anvil-migration

Prototype: Analytics 3.0 rebuilt with real Anvil2 components.

This is a private, mock-only, throwaway prototype for stakeholder demos. Visual and interaction fidelity is the goal. Production correctness is not.

Follow the `anvil2-code-prototyping` skill in `.claude/skills/` for the full rules, look-up workflow, component states and output checklist.

## Rules

1. Real Anvil2 components and tokens only. No Tailwind, shadcn/ui, inline hex colors or legacy `@servicetitan/design-system`.
2. Search the Anvil2 MCP (`anvil-labs`) before using or guessing any component API. If a component is missing, flag it in the "MISSING ANVIL2 COMPONENT" format. Never invent a lookalike.
3. Build one screen at a time, in backlog order.
4. Mock everything in memory. Seed data only, no real APIs, no persistence, no backend. A refresh resets to seed data.
5. Stay lightweight. No unit tests, lint gate, CI or publishing. Fix real TypeScript errors only. If a task adds process overhead, take the smaller path that still renders real Anvil2 components correctly.
6. Do not touch the app shell. Build screens as routes inside it.

## Conventions

- Plain React + TypeScript app (Vite). `AnvilProvider` at the root, provided by the app shell.
- Hash router, so it can be hosted statically.
- Each drawer or overlay gets a stable URL slug, for example `#/page?state=add-item`.
- Run exactly one dev server. Reuse it if one is already running.
- Dependencies: Anvil2, router, state, React. Nothing else without asking.
- Icons come only from the Anvil icon assets: `@servicetitan/anvil2/assets/icons/material/round/*.svg` and `.../st/*.svg`, imported through `src/icons.ts`. No Lucide and no `@servicetitan/anvil2-icons`. Trend arrows are `arrow_upward`, `arrow_downward` and `trending_flat`.

## KPI card rules (watchlist tiles)

One component, `src/components/KpiCard.tsx`, fed by `src/lib/kpi.ts`. Do not build tiles any other way.

- Never type a delta. The percent comes from `value` and `prior` via `resolveDelta`. Equal = neutral "0%". Prior of 0 = "New".
- Fixed anatomy: header (title + period menu), value, period label, comparison, footer. No category or eyebrow text, titles only. Missing data hides a region's content but its row keeps its height, so tiles line up.
- No long sentences. Two short lines under the value: the period label (`Nov 2026`) and the comparison (`↑ 1.27% vs ($742.83K) Oct 2026`). Arrow and percent take the state color, the prior value is bold. Missing value: "No data for this period". Missing prior: "Nothing to compare yet".
- Title: 2 lines then ellipsis. Value: 1 line, compact format, never wraps. null / NaN = "–". Zero is data.
- Sparkline needs 3+ finite points, otherwise hidden. No axes, legend or tooltip. It is off everywhere for now: `showTrend` defaults to false. Pass `showTrend` to bring it back.
- Comparison color follows `goodDirection`, not arrow direction.
- Period menu items are fixed: Watchlist default, Day, Week, Month, Quarter, Year. Period and prior labels follow the selected period.
- States come from the Figma "Scorecard" file: positive (success), negative (danger), neutral (subdued, flat icon).
- Spacing (Anvil size steps, 1 = 4px): card padding 16, header to body 24 (`gap="6"`), body rows 4 (`gap="1"`).
- Type (measured in the browser against the Scorecard spec): title `headline` small, value `Text size="xlarge"` with `<strong>` (24/36), period label and comparison `Text size="small"` (14/21).
- Footer: the source dashboard or liveboard is an Anvil `LinkButton` that opens it (`sourceDashboardId`). The footer item has 16px above and 16px below the link, under a full-width divider. Anvil guidance prefers `Link` for navigation and `LinkButton` for actions, so revisit this if asked.
- Every state is shown on `#/kpi-cards`. Add a case there before changing the card.

## Build loop per screen

Read the design (reference only), look up real components via the MCP, build it as a route, wire mock data, check it in the browser.

## End of every task

Report: what was built, components and states used, "Gaps in Anvil2" (or "No gaps"), anything unverified, one next step.
