import { AxeBuilder } from "@axe-core/playwright";
import type { Page } from "playwright";

import { WCAG_TAGS } from "./a11y.constants.ts";
import type { AxeIssue, AxeRun } from "./a11y.types.ts";
import { clip } from "./a11y.utils.ts";

/** axe-core on the page: WCAG A/AA violations, best-practice hints and incomplete (manual review) checks. */
export async function runAxe(page: Page, scenario: string): Promise<AxeRun> {
  const result = await new AxeBuilder({ page }).withTags([...WCAG_TAGS, "best-practice"]).analyze();
  const toIssue = (r: (typeof result.violations)[number]): AxeIssue => ({
    id: r.id,
    impact: r.impact ?? null,
    help: r.help,
    helpUrl: r.helpUrl,
    wcag: r.tags.filter((t) => t.startsWith("wcag")),
    nodes: r.nodes.slice(0, 15).map((n) => ({
      target: n.target.join(" "),
      html: clip(n.html, 300),
      summary: clip(n.failureSummary ?? "", 500),
    })),
  });
  const isWcag = (r: { tags: string[] }): boolean => r.tags.some((t) => WCAG_TAGS.includes(t));
  return {
    scenario,
    violations: result.violations.filter(isWcag).map(toIssue),
    bestPractice: result.violations.filter((r) => !isWcag(r)).map(toIssue),
    incomplete: result.incomplete.filter(isWcag).map(toIssue),
  };
}
