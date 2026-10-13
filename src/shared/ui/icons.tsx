import { createElement, type ComponentType, type SVGProps } from "react";
import { cn } from "#shared/lib/ui.utils.ts";

/**
 * Icons - Lucide geometry with the lucide-react prop API
 * (size, strokeWidth, color, className). Drawn locally so the bundle carries
 * only the icons the site uses. To switch to the package later:
 *   yarn add lucide-react
 *   import { Sun, Moon, … } from "lucide-react";
 * (LinkedIn and Figma are brand icons that newer lucide-react releases may no longer ship.)
 */
export interface IconProps extends Omit<SVGProps<SVGSVGElement>, "ref"> {
  size?: number | string;
  strokeWidth?: number | string;
  color?: string;
}

export type IconComponent = ComponentType<IconProps>;

type IconNode = readonly [
  tag: "circle" | "line" | "path" | "polyline" | "rect",
  attrs: Record<string, string | number>,
];

function createIcon(name: string, nodes: readonly IconNode[]): IconComponent {
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
      className={cn("lucide", "lucide-" + name, className)}
      {...props}
    >
      {nodes.map(([tag, attrs], index) => createElement(tag, { key: index, ...attrs }))}
    </svg>
  );
  Icon.displayName = name;
  return Icon;
}

export const Sun = createIcon("sun", [
  ["circle", { cx: 12, cy: 12, r: 4 }],
  ["path", { d: "M12 2v2" }],
  ["path", { d: "M12 20v2" }],
  ["path", { d: "m4.93 4.93 1.41 1.41" }],
  ["path", { d: "m17.66 17.66 1.41 1.41" }],
  ["path", { d: "M2 12h2" }],
  ["path", { d: "M20 12h2" }],
  ["path", { d: "m6.34 17.66-1.41 1.41" }],
  ["path", { d: "m19.07 4.93-1.41 1.41" }],
]);
export const Moon = createIcon("moon", [["path", { d: "M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" }]]);
export const ArrowRight = createIcon("arrow-right", [
  ["path", { d: "M5 12h14" }],
  ["path", { d: "m12 5 7 7-7 7" }],
]);
export const ArrowLeft = createIcon("arrow-left", [
  ["path", { d: "m12 19-7-7 7-7" }],
  ["path", { d: "M19 12H5" }],
]);
export const ArrowDown = createIcon("arrow-down", [
  ["path", { d: "M12 5v14" }],
  ["path", { d: "m19 12-7 7-7-7" }],
]);
export const ArrowUp = createIcon("arrow-up", [
  ["path", { d: "m5 12 7-7 7 7" }],
  ["path", { d: "M12 19V5" }],
]);
export const ArrowUpRight = createIcon("arrow-up-right", [
  ["path", { d: "M7 7h10v10" }],
  ["path", { d: "M7 17 17 7" }],
]);
export const Check = createIcon("check", [["path", { d: "M20 6 9 17l-5-5" }]]);
export const ChevronRight = createIcon("chevron-right", [["path", { d: "m9 18 6-6-6-6" }]]);
export const ChevronLeft = createIcon("chevron-left", [["path", { d: "m15 18-6-6 6-6" }]]);
export const ChevronDown = createIcon("chevron-down", [["path", { d: "m6 9 6 6 6-6" }]]);
export const Copy = createIcon("copy", [
  ["rect", { width: 14, height: 14, x: 8, y: 8, rx: 2, ry: 2 }],
  ["path", { d: "M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" }],
]);
export const ExternalLink = createIcon("external-link", [
  ["path", { d: "M15 3h6v6" }],
  ["path", { d: "M10 14 21 3" }],
  ["path", { d: "M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" }],
]);
export const Figma = createIcon("figma", [
  ["path", { d: "M5 5.5A3.5 3.5 0 0 1 8.5 2H12v7H8.5A3.5 3.5 0 0 1 5 5.5z" }],
  ["path", { d: "M12 2h3.5a3.5 3.5 0 1 1 0 7H12V2z" }],
  ["path", { d: "M12 12.5a3.5 3.5 0 1 1 7 0 3.5 3.5 0 1 1-7 0z" }],
  ["path", { d: "M5 19.5A3.5 3.5 0 0 1 8.5 16H12v3.5a3.5 3.5 0 1 1-7 0z" }],
  ["path", { d: "M5 12.5A3.5 3.5 0 0 1 8.5 9H12v7H8.5A3.5 3.5 0 0 1 5 12.5z" }],
]);
export const House = createIcon("house", [
  ["path", { d: "M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8" }],
  [
    "path",
    {
      d: "M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z",
    },
  ],
]);
export const ImageOff = createIcon("image-off", [
  ["line", { x1: 2, x2: 22, y1: 2, y2: 22 }],
  ["path", { d: "M10.41 10.41a2 2 0 1 1-2.83-2.83" }],
  ["line", { x1: 13.5, x2: 6, y1: 13.5, y2: 21 }],
  ["line", { x1: 18, x2: 21, y1: 12, y2: 15 }],
  ["path", { d: "M3.59 3.59A1.99 1.99 0 0 0 3 5v14a2 2 0 0 0 2 2h14c.55 0 1.052-.22 1.41-.59" }],
  ["path", { d: "M21 15V5a2 2 0 0 0-2-2H9" }],
]);
export const Linkedin = createIcon("linkedin", [
  ["path", { d: "M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" }],
  ["rect", { width: 4, height: 12, x: 2, y: 9 }],
  ["circle", { cx: 4, cy: 4, r: 2 }],
]);
export const Mail = createIcon("mail", [
  ["rect", { width: 20, height: 16, x: 2, y: 4, rx: 2 }],
  ["path", { d: "m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" }],
]);
export const Maximize2 = createIcon("maximize-2", [
  ["polyline", { points: "15 3 21 3 21 9" }],
  ["polyline", { points: "9 21 3 21 3 15" }],
  ["line", { x1: 21, x2: 14, y1: 3, y2: 10 }],
  ["line", { x1: 3, x2: 10, y1: 21, y2: 14 }],
]);
export const Quote = createIcon("quote", [
  [
    "path",
    {
      d: "M16 3a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2 1 1 0 0 1 1 1v1a2 2 0 0 1-2 2 1 1 0 0 0-1 1v2a1 1 0 0 0 1 1 6 6 0 0 0 6-6V5a2 2 0 0 0-2-2z",
    },
  ],
  [
    "path",
    {
      d: "M5 3a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2 1 1 0 0 1 1 1v1a2 2 0 0 1-2 2 1 1 0 0 0-1 1v2a1 1 0 0 0 1 1 6 6 0 0 0 6-6V5a2 2 0 0 0-2-2z",
    },
  ],
]);
export const X = createIcon("x", [
  ["path", { d: "M18 6 6 18" }],
  ["path", { d: "m6 6 12 12" }],
]);
export const ZoomIn = createIcon("zoom-in", [
  ["circle", { cx: 11, cy: 11, r: 8 }],
  ["line", { x1: 21, x2: 16.65, y1: 21, y2: 16.65 }],
  ["line", { x1: 11, x2: 11, y1: 8, y2: 14 }],
  ["line", { x1: 8, x2: 14, y1: 11, y2: 11 }],
]);
export const ZoomOut = createIcon("zoom-out", [
  ["circle", { cx: 11, cy: 11, r: 8 }],
  ["line", { x1: 21, x2: 16.65, y1: 21, y2: 16.65 }],
  ["line", { x1: 8, x2: 14, y1: 11, y2: 11 }],
]);
