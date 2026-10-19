import type { AnchorHTMLAttributes, ReactNode } from "react";

export interface TextLinkProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "target" | "rel"> {
  href: string;
  /** Opens in a new tab: adds target, rel and the screen reader note. */
  external?: boolean;
  children: ReactNode;
}
