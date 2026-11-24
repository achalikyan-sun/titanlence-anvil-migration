import { useState, type ReactNode } from "react";
import { Button, Chip, Divider, Flex, Icon, SearchField, Text, ThemeProvider } from "@servicetitan/anvil2";
import { core } from "@servicetitan/anvil2/token";
import type { Svg } from "@servicetitan/anvil2";

import Analytics from "@servicetitan/anvil2/assets/icons/st/gnav_analytics_inactive.svg";
import Dashboard from "@servicetitan/anvil2/assets/icons/st/gnav_dashboard_inactive.svg";
import Messages from "@servicetitan/anvil2/assets/icons/st/gnav_messages_inactive.svg";
import Agreements from "@servicetitan/anvil2/assets/icons/st/gnav_agreements_inactive.svg";
import Projects from "@servicetitan/anvil2/assets/icons/st/gnav_projects_inactive.svg";
import Calls from "@servicetitan/anvil2/assets/icons/st/gnav_calls_inactive.svg";
import Schedule from "@servicetitan/anvil2/assets/icons/st/gnav_schedule_inactive.svg";
import Dispatch from "@servicetitan/anvil2/assets/icons/st/gnav_dispatch_inactive.svg";
import Accounting from "@servicetitan/anvil2/assets/icons/st/gnav_accounting_inactive.svg";
import Inventory from "@servicetitan/anvil2/assets/icons/st/gnav_inventory_inactive.svg";
import FollowUp from "@servicetitan/anvil2/assets/icons/st/gnav_follow_up_inactive.svg";
import Reports from "@servicetitan/anvil2/assets/icons/st/gnav_reports_inactive.svg";
import Pricebook from "@servicetitan/anvil2/assets/icons/st/gnav_pricebook_inactive.svg";
import VirtualAgent from "@servicetitan/anvil2/assets/icons/st/virtual_agent.svg";
import CommandCenter from "@servicetitan/anvil2/assets/icons/st/gnav_command_center_inactive.svg";
import Automations from "@servicetitan/anvil2/assets/icons/st/gnav_automations_inactive.svg";
import Marketing from "@servicetitan/anvil2/assets/icons/st/gnav_marketing_inactive.svg";
import Customer from "@servicetitan/anvil2/assets/icons/st/customer.svg";
import FleetPro from "@servicetitan/anvil2/assets/icons/st/gnav_fleet_pro_inactive.svg";
import FieldPro from "@servicetitan/anvil2/assets/icons/st/gnav_field_pro_inactive.svg";
import ProductionQueue from "@servicetitan/anvil2/assets/icons/st/gnav_production_work_queue_inactive.svg";
import InsuranceQueue from "@servicetitan/anvil2/assets/icons/st/gnav_insurance_work_queue_inactive.svg";
import MenuCollapse from "@servicetitan/anvil2/assets/icons/st/gnav_menu_collapse.svg";
import MenuExpand from "@servicetitan/anvil2/assets/icons/st/gnav_menu_expand.svg";
import UnfoldMore from "@servicetitan/anvil2/assets/icons/material/round/unfold_more.svg";
import ChevronDown from "@servicetitan/anvil2/assets/icons/material/round/keyboard_arrow_down.svg";
import ChevronUp from "@servicetitan/anvil2/assets/icons/material/round/keyboard_arrow_up.svg";
import ManageSearch from "@servicetitan/anvil2/assets/icons/material/round/manage_search.svg";
import Help from "@servicetitan/anvil2/assets/icons/material/round/help.svg";
import Storefront from "@servicetitan/anvil2/assets/icons/material/round/storefront.svg";
import SettingsIcon from "@servicetitan/anvil2/assets/icons/material/round/settings.svg";
import AccountCircle from "@servicetitan/anvil2/assets/icons/material/round/account_circle.svg";
import AtlasLogo from "@servicetitan/anvil2/assets/icons/st/atlas_logo.svg";

// Global navigation shell: top bar + left nav, laid out from the Figma "Overview" frame.
// There is no global-nav component in Anvil2, so both are composed from Anvil2 primitives
// (Button, SearchField, Chip, Divider, Icon, Text) on the dark theme.

type NavItem = { label: string; icon: Svg; children?: string[] };

const NAV: (NavItem | "divider")[] = [
  { label: "Analytics", icon: Analytics, children: ["Overview", "Dashboards", "Intelligence Center", "Schedules"] },
  { label: "Dashboard", icon: Dashboard },
  { label: "Messages", icon: Messages },
  "divider",
  { label: "Agreements", icon: Agreements },
  { label: "Projects", icon: Projects },
  { label: "Job Booking", icon: Calls, children: [] },
  { label: "Schedule", icon: Schedule, children: [] },
  { label: "Dispatch", icon: Dispatch, children: [] },
  { label: "Accounting", icon: Accounting, children: [] },
  { label: "Procurement", icon: Inventory, children: [] },
  { label: "Follow Up", icon: FollowUp, children: [] },
  { label: "Reports", icon: Reports, children: [] },
  { label: "Items and Pricing", icon: Pricebook, children: [] },
  { label: "Virtual Agents", icon: VirtualAgent, children: [] },
  { label: "Command Center", icon: CommandCenter, children: [] },
  { label: "Automations", icon: Automations },
  { label: "Marketing", icon: Marketing, children: [] },
  { label: "CRM", icon: Customer, children: [] },
  { label: "Fleet Pro", icon: FleetPro },
  { label: "Field Pro", icon: FieldPro, children: [] },
  { label: "Production Queue", icon: ProductionQueue },
  { label: "Insurance Queue", icon: InsuranceQueue },
];

export function GlobalNavTop() {
  return (
    <Flex
      alignItems="center"
      justifyContent="space-between"
      gap="4"
      style={{ height: "48px", padding: "0 0.5rem 0 0.8rem", borderBottom: `1px solid ${core.semantic.BorderColorSubdued.value}` }}
    >
      <Flex alignItems="center" gap="1" style={{ flex: "1 1 0" }}>
        <img src="./st-symbol.svg" alt="" height={28} />
        <img src="./st-wordmark.svg" alt="ServiceTitan" height={14} />
      </Flex>
      <Flex alignItems="center" gap="2" style={{ flex: "1 1 0", maxWidth: "32rem" }}>
        <div style={{ flex: 1 }}>
          <SearchField aria-label="Search" placeholder="Search" />
        </div>
        <Chip size="small" label="CTRL + /" />
      </Flex>
      <Flex alignItems="center" justifyContent="end" gap="1" style={{ flex: "1 1 0" }}>
        <Button appearance="ghost" icon={AtlasLogo} aria-label="Atlas" />
        <Button appearance="ghost" icon={ManageSearch} aria-label="Search history" />
        <Button appearance="ghost" icon={Help} aria-label="Help" />
        <Button appearance="ghost" icon={Storefront} aria-label="Marketplace" />
        <Button appearance="ghost" icon={SettingsIcon} aria-label="Settings" />
        <Button appearance="ghost" icon={{ before: AccountCircle }} aria-label="Account">
          <Icon svg={ChevronDown} size="small" />
        </Button>
      </Flex>
    </Flex>
  );
}

export function GlobalNavLeft({ active = "Overview" }: { active?: string }) {
  const [collapsed, setCollapsed] = useState(false);
  const [open, setOpen] = useState<string[]>(["Analytics"]);
  const toggle = (label: string) => setOpen((o) => (o.includes(label) ? o.filter((x) => x !== label) : [...o, label]));

  return (
    <ThemeProvider mode="dark">
      <Flex
        direction="column"
        style={{
          width: collapsed ? "64px" : "220px",
          flex: "0 0 auto",
          background: core.semantic.BackgroundColorInverted.value,
          color: core.semantic.ForegroundColorDefault.value,
        }}
      >
        <Flex direction="column" gap="1" style={{ flex: 1, overflowY: "auto", padding: "1rem 0.5rem 0" }}>
          {!collapsed && (
            <Flex alignItems="center" gap="2" style={{ paddingBottom: "1rem" }}>
              <div style={{ flex: "1 1 0", minWidth: 0 }}>
                <SearchField aria-label="Go to" size="small" placeholder="Go to..." />
              </div>
              <Button size="small" icon={UnfoldMore} aria-label="Switch business unit" />
              <Chip size="small" label="⌘ K" />
            </Flex>
          )}
          {NAV.map((item, i) =>
            item === "divider" ? (
              <Divider key={i} />
            ) : (
              <NavRow key={item.label} item={item} collapsed={collapsed} open={open.includes(item.label)} onToggle={() => toggle(item.label)}>
                {item.children?.map((child) => (
                  <Button
                    key={child}
                    appearance={child === active ? "primary" : "ghost"}
                    size="small"
                    aria-current={child === active ? "page" : undefined}
                    style={{ width: "100%", justifyContent: "flex-start", paddingInlineStart: "1.75rem" }}
                  >
                    {child}
                  </Button>
                ))}
              </NavRow>
            ),
          )}
        </Flex>
        <Flex style={{ padding: "0.5rem 0.875rem", borderTop: `1px solid ${core.semantic.BorderColorDefault.value}` }}>
          <Button appearance="ghost" size="small" icon={collapsed ? MenuExpand : MenuCollapse} aria-label={collapsed ? "Expand navigation" : "Collapse navigation"} onClick={() => setCollapsed((c) => !c)} />
        </Flex>
      </Flex>
    </ThemeProvider>
  );
}

function NavRow(props: { item: NavItem; collapsed: boolean; open: boolean; onToggle: () => void; children: ReactNode }) {
  const { item, collapsed, open } = props;
  const expandable = item.children !== undefined;
  return (
    <Flex direction="column">
      {collapsed ? (
        <Button appearance="ghost" icon={item.icon} aria-label={item.label} />
      ) : (
        <Button
          appearance="ghost"
          size="small"
          icon={{ before: item.icon }}
          aria-expanded={expandable ? open : undefined}
          onClick={expandable ? props.onToggle : undefined}
          style={{ width: "100%", justifyContent: "space-between" }}
        >
          <Flex alignItems="center" justifyContent="space-between" style={{ width: "100%" }}>
            <Text>{item.label}</Text>
            {expandable && <Icon svg={open ? ChevronUp : ChevronDown} size="small" />}
          </Flex>
        </Button>
      )}
      {!collapsed && open && props.children}
    </Flex>
  );
}
