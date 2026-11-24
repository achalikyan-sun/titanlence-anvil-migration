import { Button, Card, Divider, Flex, Grid, Icon, LinkButton, OverflowText, SelectMenuSync, SkeletonRectangle, Text, Tooltip } from "@servicetitan/anvil2";
import { Chart, type EChartsOption } from "@servicetitan/anvil2-charts-kit";
import "@servicetitan/anvil2-charts-kit/styles.css";
import { core } from "@servicetitan/anvil2/token";
import { IconArrowDown, IconArrowUp, IconChevronDown, IconInfo, IconTrendingFlat } from "../icons";
import {
  PERIOD_MENU,
  cleanTrend,
  formatValue,
  periodLabels,
  resolveDelta,
  snapshotFor,
  type KpiDelta,
  type KpiPeriod,
  type KpiSeed,
} from "../lib/kpi";

/*
 * KpiCard: one watchlist tile. Anatomy, spacing and type come from the Figma "Scorecard" component.
 * Spacing uses Anvil2 size steps (1 step = 4px), type uses Anvil2 Text variants.
 *
 *   Card ................ padding 16px (medium), 12px radius, subdued 1px border (Card defaults)
 *   Header .............. gap 8px     title: bold 16/24 (+ info icon 16px, + period menu on the right)
 *   (24px between header and body)
 *   Body ................ gap 4px
 *     Value ............. bold 24/36
 *     Period label ...... "Nov 2026", body small 14/21
 *     Comparison ........ "↑ 1.27% vs ($742.83K) Oct 2026", body small 14/21, one line
 *
 * The comparison has three states: positive (success), negative (danger), neutral (subdued). The arrow
 * and the percent take the state color. The prior value is bold, in parentheses.
 *
 * Strict rules so no data shape can break the layout:
 *  1. Fixed anatomy. A region with no data is hidden but its row keeps its height (header,
 *     period label, comparison), so every tile has its value, period label and comparison at the same
 *     offsets.
 *  2. Title: at most 2 lines, then ellipsis. The header always reserves two lines, so one-line and
 *     two-line titles start their value at the same height. It shrinks (minWidth 0) and can never
 *     push the period menu or info icon out of the card. Full text is the native tooltip and name.
 *  3. Value: one line, compact format (3.72K, $1.23B), never shrinks or
 *     wraps. Zero is data and prints "0". null / NaN / Infinity print an en dash.
 *  4. Period label and comparison: one line each, then ellipsis, no long sentences. Labels come from
 *     the selected period (Nov 2026 / Oct 2026, Q4 2026 / Q3 2026, ...). The percent is derived from
 *     value and prior (lib/kpi.ts), never typed. Missing value: "No data for this period". Missing
 *     prior: "Nothing to compare yet". Prior of 0: "New". Equal: neutral "0%". Color follows
 *     goodDirection, the arrow follows the direction of change.
 *  5. Sparkline (optional, showTrend, off by default for now): sits beside the value only (36px
 *     high), so the comparison keeps the full card width. 3+ finite points or the slot stays empty.
 *     Non-finite points are dropped. A flat series draws a flat line. No axes, legend or tooltip.
 *  6. Period menu: fixed option list, search off, disabled while loading or errored.
 *  7. States: ready, loading (skeleton, same height), error (message + retry, menu disabled).
 *  8. Footer: the source dashboard is a LinkButton that opens it. 16px above and 16px below the link,
 *     under a full-width divider. Plain subdued text when there is no dashboard to open.
 *  9. Width: the grid gives each tile at least TILE_MIN_WIDTH. Only the sparkline slot has a fixed width.
 */

export const TILE_MIN_WIDTH = "16rem";
const MIN_HEIGHT = "12.5rem";
const CONTENT_PADDING = "1rem"; // 16px, Anvil size step 4
const SPARKLINE_WIDTH = "6rem";
const HEADER_HEIGHT = "3rem"; // two title lines, reserved even for one-line titles
const ROW_HEIGHT = "1.3125rem"; // 21px, one line of body small
const SPARKLINE_HEIGHT = 36; // equals the 24/36 value line

export type KpiCardState = "ready" | "loading" | "error";

export function KpiCard(props: {
  seed: KpiSeed;
  period: KpiPeriod;
  onPeriodChange: (period: KpiPeriod) => void;
  state?: KpiCardState;
  onRetry?: () => void;
  // Charts are off everywhere for now (default false). Off = no sparkline slot, the value uses the full row.
  showTrend?: boolean;
  // Opens the dashboard named in the footer. Without it (or without seed.sourceDashboardId) the footer is plain text.
  onOpenSource?: (dashboardId: string) => void;
}) {
  const { seed, period, onPeriodChange, state = "ready", onRetry, showTrend = false, onOpenSource } = props;
  const snap = snapshotFor(seed, period);
  const hasValue = typeof snap.value === "number" && Number.isFinite(snap.value);
  const hasPrior = typeof snap.prior === "number" && Number.isFinite(snap.prior);
  const delta = resolveDelta(snap, seed.format, seed.goodDirection);
  const trend = showTrend ? cleanTrend(snap.trend) : null;
  const valueText = formatValue(snap.value, seed.format);

  const labels = periodLabels(period);

  return (
    <Card flexDirection="column" gap="0" padding="0" style={{ height: "100%", minHeight: MIN_HEIGHT }} aria-label={seed.title}>
      {/* Content: 16px padding on every side. The footer below is its own item with its own 16px. */}
      <Flex direction="column" gap="6" style={{ flex: "1 1 auto", minWidth: 0, padding: CONTENT_PADDING }}>
        {/* Header: title, info, period menu */}
        <Flex alignItems="start" justifyContent="space-between" gap="2" style={{ minHeight: HEADER_HEIGHT }}>
          <Flex alignItems="center" gap="2" style={{ flex: "1 1 0", minWidth: 0, minHeight: HEADER_HEIGHT }}>
            <OverflowText rows={2} style={{ minWidth: 0 }} title={seed.title}>
              <Text variant="headline" el="h3" size="small" noMargin>
                {seed.title}
              </Text>
            </OverflowText>
            {seed.info && (
              <Tooltip>
                <Tooltip.Trigger>
                  <Button appearance="ghost" size="xsmall" icon={IconInfo} aria-label={`About ${seed.title}`} />
                </Tooltip.Trigger>
                <Tooltip.Content>{seed.info}</Tooltip.Content>
              </Tooltip>
            )}
          </Flex>
          <div style={{ flex: "0 0 auto" }}>
            <PeriodMenu title={seed.title} period={period} defaultPeriod={seed.defaultPeriod} disabled={state !== "ready"} onChange={onPeriodChange} />
          </div>
        </Flex>

        {state === "loading" && <SkeletonRectangle height="6rem" />}

        {state === "error" && (
          <Flex direction="column" gap="2" alignItems="start" role="alert">
            <Text subdued size="small">
              We couldn&apos;t load this metric.
            </Text>
            <Button size="small" onClick={onRetry}>
              Try again
            </Button>
          </Flex>
        )}

        {state === "ready" && (
          <Flex direction="column" gap="1" style={{ minWidth: 0 }}>
            {/* Value row: value on the left, sparkline slot on the right. Same height as the value (36px). */}
            <Grid templateColumns={showTrend ? `minmax(0, 1fr) ${SPARKLINE_WIDTH}` : "minmax(0, 1fr)"} gap="2" alignItems="center">
              <OverflowText rows={1} title={valueText}>
                <Text size="xlarge">
                  <strong>{valueText}</strong>
                </Text>
              </OverflowText>
              {showTrend && (
                <div aria-hidden={trend ? undefined : true} style={{ height: SPARKLINE_HEIGHT, minWidth: 0 }}>
                  {trend && <Sparkline title={seed.title} trend={trend} />}
                </div>
              )}
            </Grid>
            {/* Period label, then the comparison. Compact, one line each, full card width. */}
            <div style={{ height: ROW_HEIGHT, display: "flex", alignItems: "center" }}>
              <OverflowText rows={1} title={labels.current}>
                <Text size="small">{labels.current}</Text>
              </OverflowText>
            </div>
            <div style={{ height: ROW_HEIGHT, display: "flex", alignItems: "center", minWidth: 0 }}>
              <ComparisonLine
                delta={delta}
                hasValue={hasValue}
                hasPrior={hasPrior}
                priorText={formatValue(snap.prior, seed.format)}
                priorLabel={labels.prior}
              />
            </div>
          </Flex>
        )}
      </Flex>

      {/* Footer: the dashboard or liveboard the number comes from. Full-width divider, then the link
          with 16px above and 16px below (and 16px at the sides). */}
      {seed.source && (
        <div>
          <Divider />
          <div style={{ padding: CONTENT_PADDING, minWidth: 0 }}>
            {seed.sourceDashboardId && onOpenSource ? (
              // One line, ellipsis. No OverflowText here: it adds 4px of its own padding, which would break the 16px.
              <LinkButton
                title={seed.source}
                onClick={() => onOpenSource(seed.sourceDashboardId!)}
                style={{ display: "block", maxWidth: "100%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
              >
                {seed.source}
              </LinkButton>
            ) : (
              <Text subdued size="small">
                {seed.source}
              </Text>
            )}
          </div>
        </div>
      )}
    </Card>
  );
}

const TONE_COLOR = {
  positive: core.semantic.StatusColorSuccess.value,
  negative: core.semantic.StatusColorDanger.value,
  neutral: core.semantic.ForegroundColorSubdued.value,
} as const;

// "↑ 1.27% vs ($742.83K) Oct 2026". Arrow and percent take the tone color, the prior value is bold.
function ComparisonLine(props: { delta: KpiDelta; hasValue: boolean; hasPrior: boolean; priorText: string; priorLabel: string }) {
  const { delta } = props;
  if (!props.hasValue)
    return (
      <Text subdued size="small">
        No data for this period
      </Text>
    );
  if (delta.kind === "none" || !props.hasPrior)
    return (
      <Text subdued size="small">
        Nothing to compare yet
      </Text>
    );
  const color = TONE_COLOR[delta.tone];
  const icon = delta.direction === "up" ? IconArrowUp : delta.direction === "down" ? IconArrowDown : IconTrendingFlat;
  const full = `${delta.percent} vs (${props.priorText}) ${props.priorLabel}`;
  return (
    <Flex alignItems="center" gap="1" style={{ minWidth: 0, width: "100%" }}>
      <span style={{ flex: "0 0 auto", display: "inline-flex" }}>
        <Icon svg={icon} size="small" color={color} />
      </span>
      <OverflowText rows={1} title={full} style={{ minWidth: 0 }}>
        <Text size="small">
          <span style={{ color }}>{delta.percent}</span> vs <strong>({props.priorText})</strong> {props.priorLabel}
        </Text>
      </OverflowText>
    </Flex>
  );
}

function PeriodMenu(props: { title: string; period: KpiPeriod; defaultPeriod: KpiPeriod; disabled: boolean; onChange: (p: KpiPeriod) => void }) {
  const options = PERIOD_MENU.map((o) => ({ id: o.id, label: o.label }));
  const selected = options.find((o) => o.id === props.period) ?? null;
  return (
    <SelectMenuSync
      label={`Period for ${props.title}`}
      options={options}
      value={selected}
      disableSearch
      popoverWidth="reference"
      onSelectedOptionChange={(o) => {
        if (!o) return;
        props.onChange(o.id === "default" ? props.defaultPeriod : (o.id as KpiPeriod));
      }}
      trigger={(triggerProps) => (
        <Button
          {...triggerProps}
          size="small"
          appearance="secondary"
          disabled={props.disabled}
          icon={{ after: IconChevronDown }}
          aria-label={`Period for ${props.title}: ${selected?.label ?? ""}`}
        >
          {selected?.label ?? "Period"}
        </Button>
      )}
    />
  );
}

function Sparkline({ title, trend }: { title: string; trend: number[] }) {
  const min = Math.min(...trend);
  const max = Math.max(...trend);
  const flat = min === max;
  const option: EChartsOption = {
    grid: { left: 0, right: 0, top: 2, bottom: 2 },
    xAxis: { type: "category", show: false, boundaryGap: false, data: trend.map((_, i) => i) },
    // A flat series would collapse the axis. Give it room so it draws a centered line.
    yAxis: { type: "value", show: false, min: flat ? min - 1 : "dataMin", max: flat ? max + 1 : "dataMax" },
    series: [{ type: "line", smooth: true, showSymbol: false, data: trend, areaStyle: {}, selectedMode: false }],
  };
  return <Chart option={option} height={SPARKLINE_HEIGHT} accessibilityLabel={`Trend for ${title}`} />;
}
