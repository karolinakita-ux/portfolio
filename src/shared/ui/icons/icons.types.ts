import type { ComponentType, SVGProps } from "react";

export interface IconProps extends Omit<SVGProps<SVGSVGElement>, "ref"> {
  size?: number | string;
  strokeWidth?: number | string;
  color?: string;
}

export type IconComponent = ComponentType<IconProps>;

/** One SVG element of an icon: tag and attributes (Lucide geometry). */
export type IconNode = readonly [
  tag: "circle" | "line" | "path" | "polyline" | "rect",
  attrs: Record<string, string | number>,
];
