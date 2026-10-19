import { readdirSync, readFileSync } from "node:fs";
import { dirname, join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

/**
 * Motion tokens guard: every duration and easing in the app resolves to the motion tokens in
 * tokens.css (--motion-duration-fast|medium|slow, --motion-easing-standard), mostly through the
 * Tailwind theme in app.css (duration-fast|medium|slow, ease-standard). It scans every .ts, .tsx
 * and .css file under src (except tokens.css, where the values live, and tests) and fails,
 * naming file and line, on:
 *   - raw Tailwind time utilities: duration-150, delay-75, and arbitrary values duration-[…],
 *     delay-[…], ease-[…] (also in their (--var) form);
 *   - Tailwind's built-in easings: ease-linear, ease-in, ease-out, ease-in-out;
 *   - an easing function written out: cubic-bezier( or steps(;
 *   - in CSS: a time (120ms, 0.3s) or an easing keyword (ease-out, linear) in a transition,
 *     animation, duration, delay or easing declaration;
 *   - in TS / TSX: a numeric `duration:` option (Web Animations API): read the token at runtime;
 *   - a duration-* / ease-* utility that app.css's theme does not define.
 * The fixture tables at the end run the same scanner on good and bad snippets, so the guard
 * cannot pass by matching nothing.
 */

// Resolved with node:path: the jsdom test environment's global URL mis-resolves file: URLs on Windows.
const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const read = (path: string) => readFileSync(join(ROOT, path), "utf8");

/** CSS with its comments blanked out (newlines kept, so line numbers still match). */
const stripCssComments = (css: string) => css.replace(/\/\*[\s\S]*?\*\//g, (comment) => comment.replace(/[^\n]/g, " "));

/** "animation:   x\n    240ms" → "animation: x 240ms": how declarations are compared. */
const normalize = (property: string, value: string) => `${property}: ${value}`.replace(/\s+/g, " ").trim();

/** The files to scan, by repo-relative path with forward slashes ("src/shared/ui/Button/Button.styles.ts"). */
const SOURCES = readdirSync(join(ROOT, "src"), { recursive: true, withFileTypes: true })
  .filter((entry) => entry.isFile())
  .map((entry) => relative(ROOT, join(entry.parentPath, entry.name)).split(sep).join("/"))
  .filter((path) => /\.(?:tsx?|css)$/.test(path) && !/\.test\.|^src\/styles\/tokens\.css$/.test(path))
  .map((path) => ({ path, source: read(path) }));

/** Motion token values as tokens.css declares them (once, the same in light and dark). */
const MOTION_TOKENS = new Map(
  [...stripCssComments(read("src/styles/tokens.css")).matchAll(/--(motion-[a-z0-9-]+)\s*:\s*([^;]+);/g)].map(
    ([, name = "", value = ""]) => [name, value.trim()],
  ),
);
const token = (name: string) => MOTION_TOKENS.get(name) ?? `<no --${name} in tokens.css>`;

/** Every custom property the Tailwind theme declares (theme.css), by name. */
const APP_CSS = stripCssComments(read("src/styles/theme.css"));
const APP_VARS = new Map(
  [...APP_CSS.matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)].map(([, name = "", value = ""]) => [name, value.trim()]),
);

interface Theme {
  duration: ReadonlySet<string>;
  ease: ReadonlySet<string>;
}
const themeNames = (pattern: RegExp) => new Set([...APP_CSS.matchAll(pattern)].map(([, name = ""]) => name));
/** Time utilities the theme defines: duration-fast|medium|slow (--transition-duration-*), ease-standard (--ease-*). */
const THEME: Theme = {
  duration: themeNames(/--transition-duration-([a-z][\w-]*)\s*:/g),
  ease: themeNames(/--ease-([a-z][\w-]*)\s*:/g),
};

/** The ::backdrop fade, with the token values written out (see ALLOWED). */
const BACKDROP_ANIMATION = `animation: backdrop-in ${token("motion-duration-medium")} ${token("motion-easing-standard")}`;

/**
 * The only literal timings allowed: exact declarations (whitespace collapsed) in one file.
 * Matching the whole declaration rather than a marker comment means a copy in another rule or
 * file, or any change to the values, is still reported.
 */
const ALLOWED: ReadonlyArray<{ file: string; declaration: string }> = [
  // The image viewer's backdrop fade. ::backdrop does not reliably inherit custom properties, so
  // lightbox.css writes out motionDurationMedium and motionEasingStandard. The expected text is built
  // from tokens.css: when a token changes, the lightbox.css line has to change with it.
  { file: "src/styles/lightbox.css", declaration: BACKDROP_ANIMATION },
  // The prefers-reduced-motion reset: a near-zero override that switches motion off, not a design value.
  { file: "src/styles/motion.css", declaration: "animation-duration: 0.01ms !important" },
  { file: "src/styles/motion.css", declaration: "transition-duration: 0.01ms !important" },
];

const RULES = {
  rawUtility: "raw Tailwind time utility: use duration-fast|medium|slow",
  builtinEase: "Tailwind's own easing: use ease-standard",
  notInTheme: "not defined in the theme (theme.css)",
  easingFunction: "easing function written out: use var(--motion-easing-standard)",
  cssTime: "time written out: use var(--motion-duration-…)",
  cssKeyword: "CSS easing keyword: use var(--motion-easing-standard)",
  numericDuration: "numeric duration option: read the motion token at runtime",
} as const;

// Tailwind utilities, in class names (TS / TSX) and in @apply (CSS). (?<![\w-]) lets a variant
// prefix through (motion-safe:duration-150) but not a longer name (--transition-duration-fast).
/** duration-150, delay-75, duration-[400ms], delay-(--wait), ease-[cubic-bezier(…)]. */
const RAW_UTILITY = /(?<![\w-])(?:(?:duration|delay)-\d[\d.]*|(?:duration|delay|ease)-(?:\[[^\]\s]*\]|\([^)\s]*\)))/g;
/** Tailwind's built-in easings. */
const BUILTIN_EASE = /(?<![\w-])ease-(?:linear|in-out|in|out)(?![\w-])/g;
/** Named time utilities, checked against the theme (duration-fast, ease-standard). */
const NAMED_UTILITY = /(?<![\w-])(duration|ease)-([a-z][a-z0-9-]*)(?![\w-])/g;
/** Names Tailwind defines itself: `initial` (back to the default, which is a token) and the easings BUILTIN_EASE reports. */
const TAILWIND_NAMES: Theme = {
  duration: new Set(["initial"]),
  ease: new Set(["initial", "linear", "in", "out", "in-out"]),
};

const EASING_FUNCTION = /(?:cubic-bezier|steps)\(/g;
/** A CSS declaration, property and value. A value may span lines (Prettier wraps long lists). */
const CSS_DECLARATION = /(?<![\w-])(-{0,2}[a-z][\w-]*)\s*:\s*([^;{}]*)/g;
/** Properties that set motion: transition*, animation*, --animate-*, --ease-*, --default-transition-*. */
const MOTION_PROPERTY = /transition|animat|duration|delay|ease/;
const CSS_TIME = /(?<![\w.-])\d*\.?\d+m?s(?![\w-])/g;
const CSS_EASING_KEYWORD = /(?<![\w-])(?:ease(?:-in-out|-in|-out)?|linear|step-start|step-end)(?![\w-])/g;
/** { duration: 300 } or "duration": 300, as passed to element.animate(). setTimeout delays are not matched. */
const NUMERIC_DURATION = /(?<![\w$])duration["']?\s*:\s*\d[\d._]*/g;

interface Finding {
  line: number;
  match: string;
  rule: string;
}

/** Every motion value in one file that does not come from a motion token. */
function scan(path: string, source: string, theme: Theme): Finding[] {
  const isCss = path.endsWith(".css");
  const code = isCss ? stripCssComments(source) : source;
  const findings: Finding[] = [];
  const report = (rule: string, match: string, index: number) =>
    findings.push({ line: code.slice(0, index).split("\n").length, match, rule });

  for (const m of code.matchAll(RAW_UTILITY)) report(RULES.rawUtility, m[0], m.index);
  for (const m of code.matchAll(BUILTIN_EASE)) report(RULES.builtinEase, m[0], m.index);
  for (const m of code.matchAll(NAMED_UTILITY)) {
    const kind = m[1] === "ease" ? "ease" : "duration";
    const name = m[2] ?? "";
    if (!theme[kind].has(name) && !TAILWIND_NAMES[kind].has(name)) report(RULES.notInTheme, m[0], m.index);
  }

  if (!isCss) {
    for (const m of code.matchAll(EASING_FUNCTION)) report(RULES.easingFunction, m[0], m.index);
    for (const m of code.matchAll(NUMERIC_DURATION)) report(RULES.numericDuration, m[0], m.index);
    return findings;
  }

  for (const m of code.matchAll(CSS_DECLARATION)) {
    const [whole, property = "", value = ""] = m;
    if (ALLOWED.some((entry) => entry.file === path && entry.declaration === normalize(property, value))) continue;
    const valueStart = m.index + whole.length - value.length;
    for (const v of value.matchAll(EASING_FUNCTION)) report(RULES.easingFunction, v[0], valueStart + v.index);
    if (!MOTION_PROPERTY.test(property)) continue;
    for (const v of value.matchAll(CSS_TIME)) report(RULES.cssTime, v[0], valueStart + v.index);
    for (const v of value.matchAll(CSS_EASING_KEYWORD)) report(RULES.cssKeyword, v[0], valueStart + v.index);
  }
  return findings;
}

describe("motion tokens", () => {
  it("scans the app's styles and components, not the token definitions", () => {
    const paths = SOURCES.map((file) => file.path);
    expect(paths).toContain("src/styles/app.css");
    expect(paths).toContain("src/shared/ui/Button/Button.styles.ts");
    expect(paths).not.toContain("src/styles/tokens.css");
  });

  it("times every transition and animation with the motion tokens", () => {
    const findings = SOURCES.flatMap(({ path, source }) =>
      scan(path, source, THEME).map((f) => `${path}:${f.line}  ${f.match}  (${f.rule})`),
    );
    expect(findings).toEqual([]);
  });

  it("maps the theme's durations and easings to the motion tokens of the same name", () => {
    expect([...THEME.duration].sort()).toEqual(["fast", "medium", "slow"]);
    expect([...THEME.ease]).toEqual(["standard"]);
    for (const name of THEME.duration) {
      expect(APP_VARS.get(`--transition-duration-${name}`)).toBe(`var(--motion-duration-${name})`);
    }
    for (const name of THEME.ease) expect(APP_VARS.get(`--ease-${name}`)).toBe(`var(--motion-easing-${name})`);
    // A bare transition-colors (no duration or easing utility) gets these.
    expect(APP_VARS.get("--default-transition-duration")).toBe("var(--motion-duration-fast)");
    expect(APP_VARS.get("--default-transition-timing-function")).toBe("var(--motion-easing-standard)");
  });

  it("uses only motion tokens that tokens.css declares", () => {
    const used = new Set(
      SOURCES.flatMap(({ source }) => [...source.matchAll(/--(motion-[a-z0-9-]+)/g)].map(([, name = ""]) => name)),
    );
    expect(used.size).toBeGreaterThan(0);
    expect([...used].filter((name) => !MOTION_TOKENS.has(name))).toEqual([]);
  });

  it("keeps each allowed literal in place, the ::backdrop one equal to the tokens", () => {
    for (const { file, declaration } of ALLOWED) {
      const declarations = [...stripCssComments(read(file)).matchAll(CSS_DECLARATION)].map(
        ([, property = "", value = ""]) => normalize(property, value),
      );
      expect(declarations, `${file}: ${declaration}`).toContain(declaration);
    }
  });
});

/** Snippets the scanner must report, with the match it reports: [match, file, snippet]. */
const BAD: ReadonlyArray<[match: string, file: string, snippet: string]> = [
  ["duration-150", "src/shared/ui/Button.tsx", `"transition-colors duration-150"`],
  ["delay-75", "src/shared/ui/Button.tsx", `"motion-safe:delay-75"`],
  ["duration-[400ms]", "src/shared/ui/Button.tsx", `"duration-[400ms]"`],
  ["delay-(--wait)", "src/shared/ui/Button.tsx", `"delay-(--wait)"`],
  ["ease-[cubic-bezier(0.4,0,0.2,1)]", "src/shared/ui/Button.tsx", `"ease-[cubic-bezier(0.4,0,0.2,1)]"`],
  ["ease-out", "src/shared/ui/Button.tsx", `"hover:ease-out"`],
  ["ease-in", "src/shared/ui/Button.tsx", `"ease-in"`],
  ["ease-in-out", "src/shared/ui/Button.tsx", `"ease-in-out"`],
  ["ease-linear", "src/shared/ui/Button.tsx", `"ease-linear"`],
  ["duration-snappy", "src/shared/ui/Button.tsx", `"duration-snappy"`],
  ["ease-bouncy", "src/shared/ui/Button.tsx", `"ease-bouncy"`],
  ["duration: 300", "src/shared/hooks/useFade.ts", `el.animate(frames, { duration: 300 });`],
  ["cubic-bezier(", "src/shared/hooks/useFade.ts", `el.animate(frames, { easing: "cubic-bezier(0.2, 0, 0, 1)" });`],
  ["120ms", "src/styles/app.css", `.a { transition: opacity 120ms; }`],
  ["0.3s", "src/styles/app.css", `.a {\n  transition:\n    opacity var(--motion-duration-fast),\n    scale 0.3s;\n}`],
  [
    "cubic-bezier(",
    "src/styles/app.css",
    `--animate-x: x var(--motion-duration-medium) cubic-bezier(0.2, 0, 0, 1) both;`,
  ],
  ["ease-in-out", "src/styles/app.css", `.a { transition-timing-function: ease-in-out; }`],
  ["linear", "src/styles/app.css", `.a { animation: spin var(--motion-duration-slow) linear infinite; }`],
  ["duration-200", "src/styles/app.css", `.a { @apply transition-colors duration-200; }`],
  // The allowed literals pass only where they are allowed, and only with the token values.
  ["0.01ms", "src/styles/print.css", `.a { transition-duration: 0.01ms !important; }`],
  ["200ms", "src/styles/lightbox.css", `.kb-lightbox[open]::backdrop { animation: backdrop-in 200ms ease; }`],
];

/** Snippets the scanner must leave alone: [file, snippet]. */
const GOOD: ReadonlyArray<[file: string, snippet: string]> = [
  ["src/shared/ui/Button.tsx", `"transition-colors duration-fast ease-standard"`],
  ["src/shared/ui/Button.tsx", `"motion-safe:duration-medium group-hover:duration-slow ease-initial"`],
  ["src/app/useHistoryRoute.ts", `timer = window.setTimeout(save, 2000);`],
  ["src/app/useHistoryRoute.ts", `const SCROLL_SAVE_DELAY = 300; // ms after scrolling stops`],
  ["src/shared/hooks/useFade.ts", `interface Options { duration: number }`],
  ["src/shared/hooks/useFade.ts", `el.animate(frames, { duration: cssMs("--motion-duration-medium") });`],
  ["src/styles/app.css", `/* was duration-150 ease-out: 240ms cubic-bezier(0.2, 0, 0, 1) */`],
  [
    "src/styles/theme.css",
    `--transition-duration-*: initial;\n--transition-duration-fast: var(--motion-duration-fast);`,
  ],
  ["src/styles/theme.css", `--ease-*: initial;\n--ease-standard: var(--motion-easing-standard);`],
  [
    "src/styles/app.css",
    `--animate-view-in: view-in var(--motion-duration-medium) var(--motion-easing-standard) both;`,
  ],
  ["src/styles/app.css", `.a { transform: translateY(8px); background-image: linear-gradient(red, blue); }`],
  [
    "src/styles/motion.css",
    `@media (prefers-reduced-motion: reduce) { * { transition-duration: 0.01ms !important; } }`,
  ],
  ["src/styles/lightbox.css", `.kb-lightbox[open]::backdrop {\n  ${BACKDROP_ANIMATION};\n}`],
];

describe("motion tokens scanner", () => {
  it.each(BAD)("flags %s (%s)", (match, file, snippet) => {
    expect(scan(file, snippet, THEME).map((f) => f.match)).toContain(match);
  });

  it.each(GOOD)("allows %s: %s", (file, snippet) => {
    expect(scan(file, snippet, THEME)).toEqual([]);
  });

  it("reports the line of the match", () => {
    const css = ".a {\n  /* 1s */\n  transition:\n    opacity var(--motion-duration-fast),\n    scale 1s;\n}";
    expect(scan("src/styles/app.css", css, THEME)).toEqual([{ line: 5, match: "1s", rule: RULES.cssTime }]);
    expect(scan("src/shared/ui/Button.tsx", 'const a = "p-md";\nconst b = "duration-300";', THEME)).toEqual([
      { line: 2, match: "duration-300", rule: RULES.rawUtility },
    ]);
  });
});
