import type { ReactNode } from "react";

export interface LangProps {
  lang: string;
  /** span (default): a phrase inside a sentence; p: a whole paragraph. */
  as?: "span" | "p";
  children: ReactNode;
}
