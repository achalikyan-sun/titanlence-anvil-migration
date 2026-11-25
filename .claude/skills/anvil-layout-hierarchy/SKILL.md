---
name: anvil-layout-hierarchy
description: Build or review page and section layouts with clear visual hierarchy using the Anvil2 design system (Page, Layout, Flex, Grid, Card, Divider, Text, spacing tokens). Use whenever the user asks to lay out a page, screen, dashboard, form, detail view or drawer, fix a layout that feels flat, cluttered or "off", decide spacing or grouping, choose between Card, Divider and whitespace, or asks how to make something easier to scan, even if they never say "hierarchy" or "Anvil".
---

# Anvil layout and visual hierarchy

Visual hierarchy answers one question for the user: "what do I look at first, what belongs together, and what can I ignore?" Anvil answers it with a small set of tools used in a deliberate order: structure, grouping, type, then color. Reaching for a heavier tool (Card, Divider, color) before a lighter one (spacing, type size) is the most common way layouts get cluttered and flat, so work from light to heavy and stop as soon as the hierarchy reads clearly.

## Workflow

1. **Rank the content.** Before touching components, list what is on the screen and assign each item a level: 1 (the thing the page exists for, plus its single primary action), 2 (supporting sections), 3 (metadata, help, secondary actions). Most pages have one level-1 focus, a handful of level-2 sections, and many level-3 items.
2. **Pick the page structure** (see "Structure").
3. **Group with headings and whitespace first** (see "Grouping" and "Spacing").
4. **Escalate only if the grouping is still unclear:** Divider for dense lists and tables of related rows, Card only for the narrow cases below.
5. **Set typography to match the ranking** (see "Typography").
6. **Spend emphasis (color, size, weight) sparingly** (see "Emphasis").
7. **Run the checklist** at the bottom, then fix and re-check.

When the Anvil MCP tools are connected (`get_component_usage_guidelines`, `get_design_tokens`, `validate_component_usage`), use them to confirm component rules and token names rather than relying on this file, because the design system evolves. This file is the working summary, not the source of truth.

## Structure: which layout tool for which job

| Need | Use | Why |
| --- | --- | --- |
| Whole-page shell, header, sidebar, sticky footer, side panel | `Page` with `Page.Header`, `Page.Content`, `Page.Footer`, `Page.Panel` | Gives every ServiceTitan page the same frame. Any page header must be `Page.Header`. |
| The page's overall columns | `Layout` + `Layout.Item` (12-column, responsive) | Place it as the first child of `Page.Content`. |
| Stack or align siblings on one axis inside a section | `Flex` with `gap` | One-dimensional: toolbars, label + value, button groups. |
| Rows and columns together inside a section or card | `Grid` with `templateColumns` | Two-dimensional: form columns, metric matrices. |
| Tabular data | `DataTable` | Never rebuild tables with Flex or Grid. |

Rules that keep structure honest:

- Put even a lone table or Alert inside a `Layout.Item span={12}` so its edges line up with the Page Header on wide screens.
- Don't use `Layout` inside another container such as a Card. Use `Grid` or `Flex` there.
- Default to the fixed-width Layout (1280px max). It limits line length and works for dashboards, forms, detail and list pages. Go `fluid` only when the primary content genuinely needs more than 1280px (wide table, scheduling board, map). Density alone is not a reason. When fluid, set `fluid` on both `Page.Header`'s `layout` prop and the `Layout` so the edges align.
- Gutter `variant` on Layout: `default` for balanced pages, `narrow` for dense or mobile-leaning layouts (it also helps cohesive grouping), `wide` for text-heavy or spacious pages.
- Keep DOM order equal to reading order. `order`, `gridColumn` and `gridRow` only change visual position, so screen readers and keyboard users still follow the source. A layout that only makes sense after reordering has a hierarchy problem.
- Keep the page's primary and secondary actions in `Page.Header`. Don't repeat the primary CTA inside the content. Put persistent key actions (Save, Submit) in the sticky `Page.Footer`.

Example, a page with sections and no Cards:

```tsx
<Layout>
  <Layout.Item span={12}>
    <Flex direction="column" gap="6">
      <Flex direction="column" gap="2">
        <Text variant="headline" el="h2">Customer</Text>
        <Text>Sophia Rodriguez</Text>
      </Flex>
      <Flex direction="column" gap="2">
        <Text variant="headline" el="h2">Job details</Text>
        <Text>Water heater diagnostic, July 12, 2025, at 3:00 pm.</Text>
      </Flex>
    </Flex>
  </Layout.Item>
</Layout>
```

## Grouping: Card vs Divider vs whitespace

The default way to separate content is a section heading plus spacing. Anvil's own guidance is that most page content does not need a Card, and that extra Cards add borders and padding that flatten hierarchy.

**Whitespace and headings (default).** Introduce each section with a headline `Text` and separate sections with `gap`. Inside a Page, section headings start at `h2` because `Page.Header` already renders the `h1`.

**Divider (second step).** Use it to reinforce grouping in dense UIs and lists where whitespace alone isn't enough. Don't use it as decoration inside content that is already grouped, and don't put one between every row (the Anvil "Don't" example is a checkbox group with a Divider between each option). To make sections inside one Card, set `padding="0"`, add Dividers, and give each child its own padding.

**Card (last resort).** Use a Card for a self-contained group that needs its own surface:

- Peer tiles of equal weight, such as KPI tiles. One Card per tile, never one Card around the row (for four per row, use `Layout.Item span={3}` each).
- A chart, with its title inside the Card.
- An isolated group that has no section heading above it.

Don't use a Card for headed page sections, whole content areas or a `Layout.Item`, a lone DataTable (it has its own border), or inside another Card. If a Card needs to be clickable, use `InteractiveCard`. When unsure whether something needs a Card, leave it out.

Other containers worth knowing: `Details` for non-critical supplementary info in tight space, `Page.Panel` for content beside the main content (instead of a column of Cards), `EditCard` for grouped settings with an edit state.

## Spacing

Spacing is the strongest grouping signal, so use it to express relationships: things that belong together sit closer than things that don't.

**Token scale.** Anvil spacing tokens are primitives only (no semantic tier), used directly. In `gap`, `rowGap`, `columnGap` and utility classes the step number maps to rem in 0.25rem increments:

| Step | Value | Step | Value |
| --- | --- | --- | --- |
| `half` | 2px (0.125rem) | `5` | 20px |
| `1` | 4px (0.25rem) | `6` | 24px |
| `2` | 8px (0.5rem) | `8` | 32px |
| `3` | 12px | `12` | 48px |
| `4` | 16px | `13`, `14` | 52px, 56px |

CSS custom properties follow `var(--a2-size-4)` (docs examples also show `var(--size-4)`), so confirm which your codebase uses. Never hardcode pixel values when a token exists. `Divider`'s `spacing` prop accepts `"0" | "half" | "1" | "2" | "3" | "4" | "5" | "6" | "8" | "12"`.

**Applying it.** Use a proximity ladder where each level out is clearly larger than the one inside it. The values below are starting points drawn from Anvil's own examples (headline + body at `2`, sections and form fields at `6`, buttons at `3`), plus a heuristic of my own for the largest gap; keep them consistent within a product area:

| Relationship | Suggested gap |
| --- | --- |
| Heading to its body, label to value | `2` |
| Items in a tight cluster (button group, inline actions) | `3` |
| Related items in a list or stack | `3` to `4` |
| Sibling sections, or fields in a form | `6` |
| Major page regions (heuristic, not from the docs) | `8` |

Divider spacing (my suggestion, the docs only give the available values): around `2` to `3` for list rows, larger when interactive elements sit near the divider, because touch targets need room (WCAG 2.2 target size minimums). Inside a Form, spacing follows the Forms pattern.

If two gaps in the same view look almost identical but mean different things, the grouping will read as accidental. Make the difference obvious or make them the same.

## Typography

Typography is how you rank within a group. Anvil supports a limited set of sizes on purpose: too many sizes at once spoils a layout.

- **Headlines by role.** Page title: `large` (inside Page this is `Page.Header`). Section title: default (`medium`), with `small` reserved for the deepest sub-labels. Dialog title: `medium`. Drawer title: `large`, `medium` or `small`. Popover title: `small`. Omit `size` on ordinary section headings so they read as titles.
- **Body by role.** Paragraph: `large` is the recommended size, `medium` (the default) with caution. Table cell: `small`. A single standout value (metric): `large`. Helper text and metadata: `small` or `medium`.
- **Siblings share a size.** Items at the same level use the same size and style, so size differences always mean rank differences.
- **Deviating.** For more contrast between headline and body, size the headline up one step or the body down one step. Never size body up, because body at headline size erases the hierarchy.
- **Heading levels are semantic.** The `el` prop (`h2`, `h3`) follows document structure and is independent of visual `size`. Don't skip levels to get a look.
- **Eyebrow** (`variant="eyebrow"`) is uppercase, semibold and subdued: use it for a small label above a value, as in a metric tile.
- **Subdued** text de-emphasizes notes and disclaimers. Don't put subdued text on `background-color-strongest`, because it fails AA contrast (3.27:1).
- Bold and italic are for emphasis inside running text only. Don't use them to fake headings.

## Emphasis

- **Defaults first.** Use each component's default size. Diverge only for a real UX reason: `small` for dense data tables and dashboards, `large` only for high-impact cases like empty states and onboarding. Standard in-app actions stay default size. Because most things are default, the few exceptions stand out.
- **One primary action per view** (`appearance="primary"`). Secondary actions use the default appearance, tertiary use `ghost`, destructive use the danger appearances.
- **Color emphasis ramp.** High emphasis uses the 500 to 600 ramp, medium 200 to 400, low 100. The blue ramp marks primary and interactive things, neutrals form the page, and red is for critical errors and destructive actions only (use yellow for lower-priority warnings). Use color functionally (status, action, feedback) and sparingly; decorative color is the kind you could swap for another hue without changing meaning.
- **Status color groups** are standardized: green for complete or success, cyan for in progress or scheduled, yellow or orange for warnings or hold, red for errors, blue for highlight or recommended.
- **Contrast.** Text must meet at least 4.5:1. Icons may be 3:1 but avoid that for icon-only UIs and small icons.
- Anvil's stated principle for color: users should be efficiently guided to the most important aspect of every page. If three elements are shouting, none of them is.

## Forms and dense screens

- Forms default to one column. Use two columns only when space allows and the fields are logically related. Inside a Dialog, field width follows the Dialog's width.
- Suggested form rhythm from Anvil's examples: `Grid gap="6"` between fields, `Flex gap="3"` between buttons, with extra top margin (size 6) before the actions. Actions go at the bottom, left-aligned on a normal page, right-aligned in a Dialog, Drawer or sticky footer.
- Rank form help by preference: Label, then Hint, then Description, then More info, with placeholder last. Keep help to 1 to 2 lines. Put essential information where it's always visible, never in a tooltip.
- Titles should say what the form is for ("Agreement Details"), not "General Info".
- Dense lists and tables: `small` size, `narrow` gutters, and Dividers when rows need to read as groups. Dense does not mean fluid width.

## Review checklist

Run this on any layout you build or are asked to review, and report findings as specific fixes.

1. **Squint test.** Blur your eyes (or imagine it): can you still pick out the page title, the primary action and the section breaks? If everything has equal weight, the hierarchy is flat.
2. **One focal point.** Is there exactly one primary action and one dominant element?
3. **Proximity.** Are gaps inside groups clearly smaller than gaps between groups? Do spacing steps come from tokens?
4. **Container diet.** Any Card around a headed section, a whole content area, a lone DataTable, or inside another Card? Any Divider that whitespace could replace? Remove them.
5. **Type ranking.** Do sizes follow the role tables, siblings match, headings follow `h2`, `h3` order, and no body text is larger than its headline?
6. **Color spend.** Is color doing a job (status, action, feedback), and is any single view using more than a couple of emphasis colors? Do text pairs pass contrast?
7. **Alignment and edges.** Does full-width content sit in a 12-column `Layout.Item`? If fluid, do header and layout both set `fluid`?
8. **Reading order.** Does DOM order match visual order?
9. **Responsive.** Does it hold at narrow widths (Layout items stack, Flex and Grid use `sm`/`md`/`lg` props where direction or tracks should change)?
10. **Defaults.** Are there component size overrides without a UX reason?

## Output format when reviewing

Give the verdict in one line, then the problems ordered by how much they hurt hierarchy, each with the fix in Anvil terms (component, prop, token). Don't restate rules that are already satisfied.
