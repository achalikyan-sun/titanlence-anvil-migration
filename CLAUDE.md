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

## Build loop per screen

Read the design (reference only), look up real components via the MCP, build it as a route, wire mock data, check it in the browser.

## End of every task

Report: what was built, components and states used, "Gaps in Anvil2" (or "No gaps"), anything unverified, one next step.
