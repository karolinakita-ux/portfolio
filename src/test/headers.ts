import { readFileSync } from "node:fs";
import { join } from "node:path";

/** A rule in public/_headers: a path, then its indented "Name: value" lines. */
export interface HeaderRule {
  path: string;
  headers: string[];
}

/** The rules of public/_headers (Netlify), comments left out. */
export function headerRules(): HeaderRule[] {
  const text = readFileSync(join(process.cwd(), "public", "_headers"), "utf8");
  const rules: HeaderRule[] = [];
  for (const line of text.split("\n")) {
    if (!line.trim() || line.startsWith("#")) continue;
    if (/^\s/.test(line)) rules.at(-1)?.headers.push(line.trim());
    else rules.push({ path: line.trim(), headers: [] });
  }
  return rules;
}

const matches = (pattern: string, path: string): boolean =>
  pattern.endsWith("*") ? path.startsWith(pattern.slice(0, -1)) : pattern === path;

/** Every header Netlify sends with a path, from all the rules that match it. */
export const headersFor = (path: string): string[] =>
  headerRules()
    .filter((rule) => matches(rule.path, path))
    .flatMap((rule) => rule.headers);
