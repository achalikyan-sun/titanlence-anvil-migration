---
name: anvil2-code-prototyping
description: Build, review, and hand off code prototypes that use only real Anvil2 components in their correct states, flagging any missing component instead of inventing one. Use when a designer or engineer asks to prototype a screen or flow in code (Cursor, Claude Code, Claude), set up a prototype branch, write a prototype CLAUDE.md, share a prototype on GitHub Pages, sync a prototype into production, or run design QA between prototype and QA environment.
---

# Anvil2 Code Prototyping

Build prototypes in code with real Anvil2 components, keep them in the repo where engineering builds the product, and sync them into production. This skill covers the hard rules, the component workflow, the 10-step handoff process, and lessons collected from ServiceTitan designers and engineers.

## 1. Hard rules (never break these)

1. **Anvil2 components only.** Every UI element must be a real Anvil2 component, token, or layout primitive. No Tailwind, no shadcn/ui, no inline hex colors, no legacy `@servicetitan/design-system` or `@servicetitan/table`.
2. **Never invent components.** Do not hand-roll a lookalike (custom card, custom tabs, custom status pill) and do not wrap raw HTML to imitate an Anvil component. If a needed component does not exist in Anvil2, **stop and flag it** (see section 3). Do not silently substitute a different component either, unless the user approves.
3. **Use the right states for each component.** Before using a component, confirm which states it supports and apply the correct one for the situation (see section 4). Never fake a state with custom CSS.
4. **Look up before you write.** Never guess a component's API, props, or usage. Query the Anvil tooling first (section 2).
5. **Anvil2 layout primitives over hand-rolled CSS.** Prefer `Flex`, `Card`, `Page` and similar over custom CSS. Avoid heavy custom CSS and mock components for Anvil2.
6. **Wrap the whole app in `AnvilProvider`.** Many Anvil2 components break without it.

## 2. Look-up workflow for every UI need

For each UI need (a table, a filter bar, an empty state, a confirmation dialog):

1. Describe the need in plain words, naming no component, and ask the tooling which component fits.
2. Fetch guidance for the chosen component: usage, accessibility, content guidance, and do/don't list.
3. Check the component's supported states and props.
4. Build it using only documented props and tokens.
5. Validate the usage against the tooling before finishing.

Tools to use (names vary by session; use whichever is available):

| Purpose | Tool |
|---|---|
| Find the right component for a use case | `find_component_for_use_case` (or `proto_pick_components` in Anvil2 Proto) |
| List what exists | `list_components` |
| How to use a component | `get_component_guidance`, `get_component_usage_guidelines` |
| Do and don't rules | `list_component_do_donts` |
| Tokens and foundations | `get_design_tokens`, `get_token_guidance`, `get_foundation_guidance` |
| Page-level patterns (filters, layouts) | `get_pattern_guidance` |
| Copy for what you chose | `get_content_guidance` |
| Accessibility | `get_accessibility_guidelines` |
| Check your work | `validate_component_usage` |
| Older versions | `get_migration_guidance` |
| Older CLAUDE.md files | `search_anvil2` MCP tool, same purpose |

Questions about Anvil2 go to the `#ask-designsystem` Slack channel.

## 3. When a component is missing: flag it, do not invent

If no Anvil2 component covers the need:

1. Stop building that part. Leave a clearly marked placeholder (an Anvil2 `Card` or `Text` saying "Missing component: <name>" is acceptable only as a temporary marker, and say so).
2. Tell the user in this format:

```
MISSING ANVIL2 COMPONENT
Need: <what the UI needs to do>
Where: <screen / area>
Closest Anvil2 options considered: <component A, component B, and why each does not fit>
Suggested next step: <ask in #ask-designsystem / request a component / user picks a closest option>
```

3. Do not continue with a custom replacement until the user decides.
4. Collect all flags and list them together at the end of the task under "Gaps in Anvil2".

## 4. Component states: use the right one

Do not assume a state exists. Read the component's guidance and confirm. Then check this list for every component you place:

- **Interaction states:** default, hover, focus (keyboard), active/pressed, disabled.
- **Data states:** loading, empty, error, success, partial or missing data (for example a missing file or no placeholder value).
- **Form states:** required, optional, invalid with message, valid, read-only, disabled, with helper text.
- **Selection states:** selected, unselected, indeterminate, expanded, collapsed, current/active item (nav, tabs, steps).
- **Overlay states:** open, closed, dismissible, blocking, with confirm or destructive action.
- **Edit states:** view mode, edit mode, unsaved changes, saving, saved.

Rules:
- Use the component's own prop or variant for the state. Never recolor or restyle to imitate one.
- Realistic prototypes include empty states, edit states, and edge cases, not just the happy path.
- Check for known bad defaults, for example an empty Select showing a clear icon, incorrect padding, or an unrequested extra link button.
- If the state you need is not supported, flag it as a missing component state using the format in section 3.

## 5. Common Anvil2 prototype pitfalls (from Proto beta feedback)

Watch for these when generating or reviewing output:

- Page's Layout defaults to fluid; check width is right for the content.
- `Card` is overused; use it only where a card is the right container.
- Charts are skipped unless you ask for them; request them when data needs them.
- Using a header as a link is not a common ServiceTitan pattern.
- Multipage sidenav can break NextJS (being fixed).
- Layout not used for Page Content is a known gap.
- Iterating on a design may not refresh content automatically.
- Missing trend indicators and other small entities in dashboards.
- Placeholder values and content must come from Anvil specs, not invention.

## 6. The 10-step handoff process

Based on Lance Gutin's AI Guild talk and his Subcontractor Management example. Four phases.

### Phase A: Set up
1. **Get repo access** where engineering builds the feature (for example the MFE repo). Needs an engineer.
2. **Create a dedicated prototype branch**, for example `subcontractors-prototype`. Ask Claude Code or Cursor to create it. The prototype lives next to real code without contributing production code.
3. **Get engineering to enable GitHub Pages** on that branch. Needs an engineer. Pages may sit behind GitHub SSO and be served from a separate `gh-pages` branch. Consider a `build-info.json` with commit, tree hash, and build time so a deployed bundle can be traced.
4. **Write a CLAUDE.md / AGENTS.md** (see section 7).

### Phase B: Build and share
5. **Build iteratively with Cursor and Claude**, one Figma screen at a time, in backlog order.
6. **Commit, push, and deploy to GitHub Pages regularly.** Standing rule: every push is followed by a redeploy.
7. **Share the Pages link** with stakeholders, PMs, and engineering for feedback.

### Phase C: Sync to production
8. **Engineering transforms prototype code into production code.** Ideally automated by a sync skill that watches prototype changes and pulls them into the production branch. This is why the prototype code is not shipped as is.

### Phase D: Close the gaps
9. **Compare the prototype to the QA environment** and send gap docs to engineering (the designer used Grok Bot for this).
10. **Open PRs for style changes** to the real codebase and **tickets for follow-on work**.

Result in the example: the released experience was very close to the prototype.

Who does what: steps 1 and 3 need an engineer. Step 8 is engineering. Steps 9 and 10 are the designer.

## 7. Prototype CLAUDE.md / AGENTS.md template rules

Include these in the prototype's rules file.

**Purpose:** a private, mock-only, throwaway prototype for stakeholder demos. Visual and interaction fidelity to Figma is the goal. Production correctness is not.

**Lightweight rules:**
- Seed/mock data only. All state in memory. No real APIs, no persistence, no real tenants, no backend. A refresh resets to seed data.
- No unit tests, no lint or format gate (fix only real TypeScript errors), no CI, publishing, or dependency-closure checks. Optional exception: a tiny opt-in Playwright smoke rig under `e2e/`.
- Minimal dependencies (Anvil2, router, state, React).
- If a task adds process overhead, take the smaller path that still renders real Anvil2 components correctly.

**Anvil2 rules:**
- Search the Anvil2 MCP before using or guessing any component API.
- Anvil2 components and tokens only (section 1).
- `AnvilProvider` at the root, provided by the app shell.
- Version isolation: the prototype may run a newer Anvil2 than production MFEs. Do not remove the scoped override that keeps production on its pinned version. Revisit both together when production moves.

**Six-rule summary to paste in:**
1. Real Anvil2 components and tokens only.
2. Search the Anvil2 MCP before guessing any component API.
3. Build one Figma screen at a time, in backlog order, directory first.
4. Mock everything in memory.
5. Stay lightweight.
6. Do not touch the app shell; build screens as routes inside it.

**Build loop per screen:** read the design (reference only), search Anvil2 for real components, build it as a route, wire mock data, check against Figma.

**Where other rules can live:** a Figma workflow rule (file key, screen backlog with node ids), a domain-context rule (personas, PRD requirements, non-goals, mock data conventions), a deploy rule (GitHub Pages runbook), and an optional testing rule.

## 8. Prototype conventions

- Plain React app in the monorepo, not an MFE: no `withMicroservice`, BFF, module federation, or publishing.
- **Hash router**, so it can be hosted statically without server rewrites.
- App shell, navigation, and layout are defined separately; each screen is a route that mounts inside the shell. For a shell, a self-contained `NAV_SHELL.md` recipe can add the product's top and left nav to any code prototype (collapsed only; set the selected state).
- **Shareable drawer and overlay states:** every drawer or overlay has a stable slug in the URL, for example `#/subcontractors/sub-001?state=add-document`, kept in sync both ways. Plain page states omit the query param. Give each new drawer a unique slug.
- **Dev server:** run exactly one per scope. Reuse an existing one. The first bundle is slow (a few minutes). `EADDRINUSE` means another server owns the port; reuse or kill it, do not restart.
- **Testing without slowing the build:** do not run Playwright inline. Commit small checkpoints; testing runs asynchronously. Stop only if the queue reports a FAIL.
- Keep an index screen listing all states so the prototype itself can serve as a reference.

## 9. Sync and design QA

**Sync skill behavior (`sync-subcontractor-ui`):**
- The prototype is the UX contract; production is the implementation.
- Sources trusted in order: live published prototype, prototype source branch, the Figma nodes in the prototype's rules file, a configurable comparison base (PR hygiene only).
- Drift detection uses git blob hashes per surface; only changed surfaces are re-audited. Each change gets a disposition: `APPLIED`, `ADAPTED`, `REJECTED`, `UNAVAILABLE`, or `NO_PRODUCTION_IMPACT`.
- Never apply a prototype change blindly. Keep production architecture, APIs, accessibility, pagination, auth, and error handling.
- **Alignment matrix**, one result per row: `ALIGNED`, `ISSUE`, `OUT OF SCOPE`, `UNAVAILABLE`, `UNVERIFIED`. `UNVERIFIED` blocks publishing.
- Verification: package tests, lint, TypeScript build, screenshot comparison at 1600x1000 and 1024x768. A person or separate visual-review agent must open every pair. No visual validation, no PR. Never create a Jira ticket or PR without the user's authorization.
- Two PR types: one for Existing Components, and one per new component or surface. Each branches independently from the comparison base.
- The sync owns visual and interaction alignment only; a separate backend sync skill owns API integration.

**Gap docs:** grouped by severity with checkboxes and a complexity tag. Low is copy, CSS, or one-file edits with a "Where to edit" line. Medium is multi-file frontend logic. High is backend, API, data, or new features.

## 10. What engineering and other designers say

- **Engineering (Tif Pun):** prototype code is a good demo but not production-ready. The structure is oversimplified (a handful of components), state is a single global store, it does not connect to the backend and makes assumptions about the FE/BE contract, and early versions mocked Anvil2 components or used heavy custom CSS. Value lies in demoing and quick internal feedback, and in comprehensive Figma that covers happy paths, edge cases, and messy data.
- **Derek Watson:** Storybook with Chromatic can give shareable prototype links and in-UI comments; Storybook MCP is in early access. He also raised concerns about relying on JSON rendering for prototyping.
- **Ian Erickson:** "point the developers at your prototype in GitHub." Claude can read the code and design log and infer how it should work. Toolkits are shared via internal GitHub Pages.
- **Brian Clark:** prototype to settle requirements, then recreate the approved experience as hi-fi Figma for handoff. Uses Claude Design only to concept.
- **Declan Van Welie:** the Claude plus Figma connector produces hi-fi mocks with correct, unbroken Anvil2 instances and tokens. Useful for customer-call mockups.
- **Source of truth (DMS team):** the Figma file may be old; the Claude prototype should align with the ticket and be the most current. Agree on a single source of truth per feature.
- **Ashot Gyulzatyan principles:** replace briefs with prototypes; start in code, refine in design; watch for product drift; AI generates, humans judge; treat the design system as infrastructure.
- **Open question:** what is the reference when no Figma file exists? Options so far: the prototype's index screen, screenshotting every state into Figma (rough), or a web-to-Figma plugin (unexplored).

## 11. Tool and plugin reference

**Anvil / design system**
- **Anvil2 Proto:** the Anvil team's tool that builds prototypes from real production React components via the Anvil MCP orchestrator (JEV classifier, Do/Don't table). Works in Claude or ChatGPT. Use only when the user invokes it by name.
- **Anvil2 MCP / `anvil-labs` tools:** component lookup, guidance, tokens, validation.
- **Figma Code Connect for Anvil2:** live links between Figma components and code.
- **Anvil2 Figma library:** formerly "v3", now just "Anvil2". Component-level tokens, props matched to code.
- **Data Table plugin 2.0 (Figma):** guided flow whose "Show code" step outputs a typed DataTable starter.
- **AI Kit (formerly Carto):** design framework for the Atlas experience only. "Carto" is now the Anvil2 theme styled like AI Kit.
- **`anvil2-prototype-starter` repo:** starter project for Anvil2 prototypes with Claude Code. Not yet reviewed in detail.

**Build and share**
- Claude / Claude Code and Cursor for building; GitHub Pages for hosting; Playwright smoke rig (`e2e/`) for optional tests.
- **ServiceTitan Product Design plugin:** community-owned plugin on the Claude Marketplace with designer skills.
- **Claude Design:** fast for concepts but approximates Anvil2 and does not use the real code. The standalone site closes **Dec 14, 2026**; public links stop working and chats and comments do not carry over. Export the project archive and rebuild as an artifact in Claude before then. A console snippet that downloads a page's HTML and CSS can help it match production look.
- **Figma Make:** can link the team's Figma file and export code.
- **Builder.io, Lovable:** evaluated; not needed for the Anvil workflow.
- **Storybook and Chromatic:** shareable prototypes with comments.

## 12. Output checklist

At the end of every task, report briefly:

1. What was built or changed, and where it lives.
2. Anvil2 components used and the states applied.
3. **Gaps in Anvil2:** every missing component or state, in the section 3 format. If none, say "No gaps".
4. Anything unverified (for example states not checked against guidance).
5. One natural next step.

Never claim a prototype is aligned or complete when any gap is still flagged.
