/**
 * Accessibility audit in real Chromium: `yarn a11y`.
 *
 * For every view (light + dark, phone + desktop width) it records:
 *   - axe-core results for WCAG 2.0 / 2.1, levels A and AA (plus best-practice hints)
 *   - what an emulated screen reader (Guidepup Virtual Screen Reader) announces, top to bottom
 *   - the Tab order, with each stop's focus style, size and position
 *   - horizontal overflow at 320 px wide (WCAG 1.4.10 Reflow)
 * plus the image viewer: opened, zoomed, Tab containment and focus return on Escape.
 *
 * Output goes to a11y-report/ (gitignored): summary.md, axe.json, sr/*.txt, tab/*.txt.
 * Exits with code 1 when axe finds WCAG A/AA violations.
 */
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { AxeBuilder } from "@axe-core/playwright";
import type { Virtual } from "@guidepup/virtual-screen-reader";
import { chromium, type Browser, type Page } from "playwright";
import { createServer } from "vite";

import { VIEWS, type View } from "#shared/lib/routes.ts";

declare global {
  interface Window {
    __vsr?: Virtual;
  }
}

const OUT = "a11y-report";
const WCAG_TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"];
const VIEWPORTS = {
  phone: { width: 390, height: 844 },
  desktop: { width: 1280, height: 800 },
} as const;
type ViewportName = keyof typeof VIEWPORTS;
type Theme = "light" | "dark";
const THEMES: readonly Theme[] = ["light", "dark"];
const LIGHTBOX_VIEW: View = "case-automotive";
const MAX_SR_STEPS = 2500;
const MAX_TAB_STOPS = 250;

interface AxeNode {
  target: string;
  html: string;
  summary: string;
}
interface AxeIssue {
  id: string;
  impact: string | null;
  help: string;
  helpUrl: string;
  wcag: string[];
  nodes: AxeNode[];
}
interface AxeRun {
  scenario: string;
  violations: AxeIssue[];
  bestPractice: AxeIssue[];
  incomplete: AxeIssue[];
}
interface TabStop {
  index: number;
  tag: string;
  role: string | null;
  name: string;
  href: string | null;
  focusStyle: string;
  visibleIndicator: boolean;
  rect: { x: number; y: number; w: number; h: number };
  inDialog: boolean;
}

const require = createRequire(import.meta.url);
const vsrBundlePath = require.resolve("@guidepup/virtual-screen-reader/browser.js");

const clip = (text: string, max: number): string => (text.length > max ? text.slice(0, max) + "…" : text);
const urlFor = (base: string, view: View): string => (view === "work" ? base : base + "#" + view);

async function runAxe(page: Page, scenario: string): Promise<AxeRun> {
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

async function loadScreenReader(page: Page, bundle: string): Promise<void> {
  await page.route("**/__vsr.js", (route) => route.fulfill({ contentType: "text/javascript", body: bundle }));
  await page.addScriptTag({ type: "module", content: "import { virtual } from '/__vsr.js'; window.__vsr = virtual;" });
  await page.waitForFunction(() => window.__vsr !== undefined);
  // Real browsers with JavaScript on do not expose <noscript>; the emulated reader would read its raw HTML.
  await page.evaluate(() => document.querySelectorAll("noscript").forEach((node) => node.remove()));
}

/** Walks the emulated screen reader from the start of `selector` to its end; returns the spoken phrases. */
async function screenReaderTranscript(page: Page, selector: string): Promise<string[]> {
  return page.evaluate(
    async ({ selector, maxSteps }) => {
      const vsr = window.__vsr;
      const container = document.querySelector(selector);
      if (!vsr || !container) return ["(screen reader or container missing)"];
      await vsr.start({ container });
      // The reader wraps to the top after the last item: stop when the opening phrase comes round again.
      const opening = await vsr.lastSpokenPhrase();
      for (let step = 0; step < maxSteps; step++) {
        await vsr.next();
        if ((await vsr.lastSpokenPhrase()) === opening) break;
      }
      const log = (await vsr.spokenPhraseLog()).slice(0, -1);
      await vsr.stop();
      return log;
    },
    { selector, maxSteps: MAX_SR_STEPS },
  );
}

async function tabOrder(page: Page): Promise<TabStop[]> {
  // The app moves focus to <main> after a view loads (in an animation frame): let that settle first.
  await page.waitForTimeout(400);
  await page.evaluate(() => {
    (document.activeElement as HTMLElement | null)?.blur();
    window.scrollTo(0, 0);
  });
  const stops: TabStop[] = [];
  for (let index = 0; index < MAX_TAB_STOPS; index++) {
    await page.keyboard.press("Tab");
    const stop = await page.evaluate((index) => {
      const el = document.activeElement as HTMLElement | null;
      if (!el || el === document.body) return null;
      // Focused by script, not by Tab (e.g. <main tabindex="-1"> after navigation): not a Tab stop.
      if (el.getAttribute("tabindex") === "-1") return "skip" as const;
      if (el.dataset.a11yVisited) return "wrapped" as const;
      el.dataset.a11yVisited = "1";
      const style = getComputedStyle(el);
      const outline = style.outlineStyle !== "none" && parseFloat(style.outlineWidth) > 0;
      const shadow = style.boxShadow !== "none" && style.boxShadow !== "";
      const rect = el.getBoundingClientRect();
      const name = (el.getAttribute("aria-label") ?? el.textContent).replace(/\s+/g, " ").trim();
      return {
        index,
        tag: el.tagName.toLowerCase(),
        role: el.getAttribute("role"),
        name: name.length > 90 ? name.slice(0, 90) + "…" : name,
        href: el.getAttribute("href"),
        focusStyle: `outline: ${style.outlineStyle} ${style.outlineWidth} ${style.outlineColor}; box-shadow: ${style.boxShadow}`,
        visibleIndicator: outline || shadow,
        rect: { x: Math.round(rect.x), y: Math.round(rect.y), w: Math.round(rect.width), h: Math.round(rect.height) },
        inDialog: el.closest("dialog[open]") !== null,
      };
    }, index);
    if (stop === "wrapped") break;
    if (stop === "skip") continue;
    if (!stop) {
      if (index > 0) break; // focus left the page (back to the browser UI)
      continue;
    }
    stops.push(stop);
  }
  return stops;
}

/** Elements that stick out past the right edge at 320 px (WCAG 1.4.10). */
async function reflow(page: Page): Promise<{ pageScrolls: boolean; offenders: string[] }> {
  return page.evaluate(() => {
    const vw = document.documentElement.clientWidth;
    const pageScrolls = document.documentElement.scrollWidth > vw + 1;
    const offenders: string[] = [];
    for (const el of Array.from(document.body.querySelectorAll<HTMLElement>("*"))) {
      const rect = el.getBoundingClientRect();
      if (rect.width === 0 || rect.right <= vw + 1) continue;
      // Skip children of a container that scrolls on purpose (e.g. tables, code).
      let scrollParent = el.parentElement;
      let insideScroller = false;
      while (scrollParent && scrollParent !== document.body) {
        const ox = getComputedStyle(scrollParent).overflowX;
        if (ox === "auto" || ox === "scroll" || ox === "hidden" || ox === "clip") {
          insideScroller = true;
          break;
        }
        scrollParent = scrollParent.parentElement;
      }
      if (insideScroller) continue;
      const cls = typeof el.className === "string" ? el.className.slice(0, 80) : "";
      offenders.push(`${el.tagName.toLowerCase()}.${cls} right=${Math.round(rect.right)}px`);
      if (offenders.length >= 10) break;
    }
    return { pageScrolls, offenders };
  });
}

const formatTab = (stops: TabStop[]): string =>
  stops
    .map(
      (s) =>
        `${String(s.index + 1).padStart(3)}. <${s.tag}${s.role ? ` role=${s.role}` : ""}> "${s.name}"` +
        `${s.href ? ` href=${s.href}` : ""}${s.inDialog ? " [dialog]" : ""}` +
        ` @(${s.rect.x},${s.rect.y} ${s.rect.w}x${s.rect.h})` +
        `${s.visibleIndicator ? "" : "  !! NO VISIBLE FOCUS STYLE"}\n      ${s.focusStyle}`,
    )
    .join("\n");

async function newPage(browser: Browser, viewport: ViewportName | "reflow", theme: Theme): Promise<Page> {
  const size = viewport === "reflow" ? { width: 320, height: 640 } : VIEWPORTS[viewport];
  const context = await browser.newContext({ viewport: size, reducedMotion: "reduce", colorScheme: theme });
  await context.addInitScript((theme) => {
    try {
      localStorage.setItem("kb-theme", theme);
    } catch {
      /* storage blocked: the theme script falls back to colorScheme */
    }
  }, theme);
  return context.newPage();
}

async function openView(page: Page, base: string, view: View): Promise<void> {
  await page.goto(urlFor(base, view));
  await page.waitForLoadState("networkidle");
  await page.locator("main").first().waitFor();
  await page.evaluate(() => document.fonts.ready);
}

async function main(): Promise<void> {
  // Clear the contents, not the folder: Windows will not remove a folder that a shell or editor has open.
  for (const entry of ["sr", "tab", "axe.json", "summary.md"])
    await rm(`${OUT}/${entry}`, { recursive: true, force: true });
  await mkdir(`${OUT}/sr`, { recursive: true });
  await mkdir(`${OUT}/tab`, { recursive: true });
  const vsrBundle = await readFile(vsrBundlePath, "utf8");

  const server = await createServer({ logLevel: "error", server: { port: 5199, strictPort: false } });
  await server.listen();
  const base = server.resolvedUrls?.local[0];
  if (!base) throw new Error("Vite dev server did not report a URL");
  const browser = await chromium.launch();

  const axeRuns: AxeRun[] = [];
  const notes: string[] = [];

  try {
    // 1. axe on every view × theme × viewport
    for (const theme of THEMES) {
      for (const viewport of Object.keys(VIEWPORTS) as ViewportName[]) {
        const page = await newPage(browser, viewport, theme);
        for (const view of VIEWS) {
          await openView(page, base, view);
          axeRuns.push(await runAxe(page, `${view} | ${theme} | ${viewport}`));
          process.stdout.write(".");
        }
        await page.context().close();
      }
    }

    // 2. Emulated screen reader + Tab order (light theme, both widths)
    for (const viewport of Object.keys(VIEWPORTS) as ViewportName[]) {
      const page = await newPage(browser, viewport, "light");
      for (const view of VIEWS) {
        await openView(page, base, view);
        await loadScreenReader(page, vsrBundle);
        const transcript = await screenReaderTranscript(page, "body");
        await writeFile(`${OUT}/sr/${view}-${viewport}.txt`, transcript.join("\n") + "\n");
        await openView(page, base, view);
        const stops = await tabOrder(page);
        await writeFile(`${OUT}/tab/${view}-${viewport}.txt`, formatTab(stops) + "\n");
        const missing = stops.filter((s) => !s.visibleIndicator).length;
        if (missing) notes.push(`${view} (${viewport}): ${missing} Tab stop(s) without a detectable focus style`);
        process.stdout.write("+");
      }
      await page.context().close();
    }

    // 3. Reflow at 320 px
    const reflowPage = await newPage(browser, "reflow", "light");
    for (const view of VIEWS) {
      await openView(reflowPage, base, view);
      const r = await reflow(reflowPage);
      if (r.pageScrolls || r.offenders.length)
        notes.push(`Reflow 320px ${view}: page scrolls sideways=${r.pageScrolls}; ${r.offenders.join("; ")}`);
    }
    await reflowPage.context().close();

    // 4. Image viewer: open, axe, screen reader inside the dialog, Tab containment, zoom, Escape
    for (const viewport of Object.keys(VIEWPORTS) as ViewportName[]) {
      for (const theme of THEMES) {
        const page = await newPage(browser, viewport, theme);
        await openView(page, base, LIGHTBOX_VIEW);
        const trigger = page.getByRole("button", { name: /^View full size/ }).first();
        const triggerName = (await trigger.textContent())?.replace(/\s+/g, " ").trim() ?? "";
        await trigger.evaluate((el) => (el.dataset.a11yTrigger = "1"));
        await trigger.click();
        const dialog = page.locator("dialog[open]");
        await dialog.waitFor();
        await page.waitForTimeout(300);
        axeRuns.push(await runAxe(page, `lightbox open | ${theme} | ${viewport}`));

        if (theme === "light") {
          await loadScreenReader(page, vsrBundle);
          const transcript = await screenReaderTranscript(page, "dialog[open]");
          await writeFile(`${OUT}/sr/lightbox-${viewport}.txt`, transcript.join("\n") + "\n");
          const stops: TabStop[] = [];
          for (let i = 0; i < 40; i++) {
            await page.keyboard.press("Tab");
            // Focus on <body> means it went to the browser's own UI, which a native modal dialog allows.
            const inDialog = await page.evaluate(
              () =>
                !document.activeElement ||
                document.activeElement === document.body ||
                document.activeElement.closest("dialog[open]") !== null,
            );
            const name = await page.evaluate(() =>
              (document.activeElement?.getAttribute("aria-label") ?? document.activeElement?.textContent ?? "").trim(),
            );
            stops.push({
              index: i,
              tag: await page.evaluate(() => document.activeElement?.tagName.toLowerCase() ?? "none"),
              role: null,
              name: clip(name.replace(/\s+/g, " "), 90),
              href: null,
              focusStyle: "",
              visibleIndicator: true,
              rect: { x: 0, y: 0, w: 0, h: 0 },
              inDialog,
            });
          }
          const escaped = stops.filter((s) => !s.inDialog);
          await writeFile(
            `${OUT}/tab/lightbox-${viewport}.txt`,
            stops
              .map((s) => `${s.index + 1}. <${s.tag}> "${s.name}"${s.inDialog ? "" : "  !! OUTSIDE DIALOG"}`)
              .join("\n") + "\n",
          );
          if (escaped.length) notes.push(`Lightbox (${viewport}): Tab left the open dialog ${escaped.length} time(s)`);
        }

        if (viewport === "desktop") {
          const zoomIn = page.getByRole("button", { name: "Zoom in" });
          if (await zoomIn.isVisible()) {
            await zoomIn.click();
            await zoomIn.click();
            await page.waitForTimeout(300);
            axeRuns.push(await runAxe(page, `lightbox zoomed | ${theme} | ${viewport}`));
          } else notes.push(`Lightbox (${viewport}, ${theme}): no visible "Zoom in" button`);
        }

        await page.keyboard.press("Escape");
        await page.waitForTimeout(300);
        const focus = await page.evaluate(() => {
          const el = document.activeElement as HTMLElement | null;
          return {
            onTrigger: el?.dataset.a11yTrigger === "1",
            text: (el?.getAttribute("aria-label") ?? el?.textContent ?? "").replace(/\s+/g, " ").trim(),
          };
        });
        const stillOpen = await page.locator("dialog[open]").count();
        if (stillOpen) notes.push(`Lightbox (${viewport}, ${theme}): Escape did not close the dialog`);
        if (!focus.onTrigger)
          notes.push(
            `Lightbox (${viewport}, ${theme}): focus after Escape is on "${clip(focus.text, 80)}", not the trigger "${clip(triggerName, 80)}"`,
          );
        await page.context().close();
      }
    }
  } finally {
    await browser.close();
    await server.close();
  }

  // Report
  await writeFile(`${OUT}/axe.json`, JSON.stringify(axeRuns, null, 2));
  const byRule = new Map<
    string,
    { help: string; impact: string | null; wcag: string[]; scenarios: string[]; nodes: number }
  >();
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
  if (byRule.size) process.exitCode = 1;
}

await main();
