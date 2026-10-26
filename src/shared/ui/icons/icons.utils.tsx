import { createElement } from "react";

import { styles } from "./icons.styles.ts";
import type { IconComponent, IconNode, IconProps } from "./icons.types.ts";

/** An icon component from Lucide-style SVG nodes, with the lucide-react prop API. */
export function createIcon(name: string, nodes: readonly IconNode[]): IconComponent {
  const Icon = ({ size = 24, strokeWidth = 2, color = "currentColor", className, ...props }: IconProps) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      focusable="false"
      // Decorative unless named: the text next to an icon says what it means.
      aria-hidden={props["aria-label"] === undefined ? true : undefined}
      className={styles.root(name, className)}
      {...props}
    >
      {/* eslint-disable-next-line @eslint-react/no-array-index-key -- fixed SVG path list */}
      {nodes.map(([tag, attrs], index) => createElement(tag, { key: index, ...attrs }))}
    </svg>
  );
  Icon.displayName = name;
  return Icon;
}
