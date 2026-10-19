import { writeFile } from "node:fs/promises";

import { OUT } from "./a11y.constants.ts";
import type { AxeIssue, AxeRun, RuleSummary } from "./a11y.types.ts";

/** Writes axe.json and summary.md, prints the summary; returns whether axe found WCAG A/AA violations. */
export async function writeReport(axeRuns: readonly AxeRun[], notes: readonly string[]): Promise<boolean> {
  await writeFile(`${OUT}/axe.json`, JSON.stringify(axeRuns, null, 2));
  const byRule = new Map<string, RuleSummary>();
  for (const run of axeRuns) {
    for (const v of run.violations) {
      const entry = byRule.get(v.id) ?? { help: v.help, impact: v.impact, wcag: v.wcag, scenarios: [], nodes: 0 };
      entry.scenarios.push(run.scenario);
      entry.nodes += v.nodes.length;
      byRule.set(v.id, entry);
    }
  }
  const countOf = (pick: (r: AxeRun) => AxeIssue[]): number => axeRuns.reduce((n, r) => n + pick(r).length, 0);
  const lines = [
    "# Accessibility audit",
    "",
    `Scenarios scanned with axe: ${axeRuns.length}. WCAG A/AA violations: ${countOf((r) => r.violations)} (rule x scenario).`,
    `Best-practice hints: ${countOf((r) => r.bestPractice)}. Needs manual review (incomplete): ${countOf((r) => r.incomplete)}.`,
    "",
    "## WCAG violations by rule",
    "",
    ...(byRule.size
      ? [...byRule].map(
          ([id, e]) =>
            `- **${id}** (${e.impact ?? "n/a"}; ${e.wcag.join(", ")}): ${e.help}. ${e.nodes} node(s) in ${e.scenarios.length} scenario(s): ${e.scenarios.join("; ")}`,
        )
      : ["None."]),
    "",
    "## Other checks",
    "",
    ...(notes.length ? notes.map((n) => `- ${n}`) : ["- No Tab, reflow or image viewer problems detected."]),
    "",
    "Details: axe.json (all runs, incl. best-practice and incomplete), sr/*.txt (screen reader transcripts), tab/*.txt (Tab order).",
    "",
  ];
  await writeFile(`${OUT}/summary.md`, lines.join("\n"));
  console.log(`\n\n${lines.join("\n")}`);
  return byRule.size > 0;
}
