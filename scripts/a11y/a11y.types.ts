import type { Virtual } from "@guidepup/virtual-screen-reader";
import type { Browser } from "playwright";

import type { VIEWPORTS } from "./a11y.constants.ts";

declare global {
  interface Window {
    __vsr?: Virtual;
  }
}

export type ViewportName = keyof typeof VIEWPORTS;
export type Theme = "light" | "dark";

export interface AxeNode {
  target: string;
  html: string;
  summary: string;
}

export interface AxeIssue {
  id: string;
  impact: string | null;
  help: string;
  helpUrl: string;
  wcag: string[];
  nodes: AxeNode[];
}

export interface AxeRun {
  scenario: string;
  /** The axe that ran, e.g. "axe-core 4.14.0": the copy @axe-core/playwright bundles, not the repo's axe-core. */
  engine: string;
  violations: AxeIssue[];
  bestPractice: AxeIssue[];
  incomplete: AxeIssue[];
}

export interface TabStop {
  index: number;
  tag: string;
  role: string | null;
  name: string;
  href: string | null;
  focusStyle: string;
  visibleIndicator: boolean;
  rect: { x: number; y: number; w: number; h: number };
  inDialog: boolean;
  /** Share of the element's on-screen area that is not covered by other content (0 = hidden, WCAG 2.4.11). */
  shown: number;
  /** What covers it, when anything does. */
  coveredBy: string | null;
}

export interface ReflowResult {
  pageScrolls: boolean;
  offenders: string[];
}

/** What every check phase shares: the browser, the dev server URL, and where results go. */
export interface AuditContext {
  browser: Browser;
  base: string;
  vsrBundle: string;
  axeRuns: AxeRun[];
  notes: string[];
}

/** One WCAG rule's violations across scenarios, for the summary. */
export interface RuleSummary {
  help: string;
  impact: string | null;
  wcag: string[];
  scenarios: string[];
  nodes: number;
}
