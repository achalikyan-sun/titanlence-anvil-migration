/// <reference types="vite/client" />

// Anvil2 SVG icons are imported as React components via SVGR.
declare module "@servicetitan/anvil2/assets/icons/*.svg" {
  import type { FunctionComponent, SVGProps } from "react";
  const Icon: FunctionComponent<SVGProps<SVGSVGElement>>;
  export default Icon;
}
