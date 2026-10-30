import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

/**
 * The scroll reveal on cards (`reveal-on-scroll` in utilities.css): a scroll-driven CSS animation that
 * may only run with motion allowed and where the browser supports view timelines, so anywhere
 * else the cards simply show. Print switches it off (print.css). The browsers' side (what a card
 * looks like at each scroll position) is checked in e2e/scroll-reveal.e2e.ts.
 */
// Resolved with node:path: the jsdom test environment's global URL mis-resolves file: URLs on Windows.
const read = (name: string) => readFileSync(join(dirname(fileURLToPath(import.meta.url)), name), "utf8");

interface Block {
  /** Selector or at-rule prelude, whitespace collapsed ("@media (prefers-reduced-motion: no-preference)"). */
  prelude: string;
  /** Declarations (and at-rule statements) directly inside, in order: [property, value]. */
  declarations: Array<[string, string]>;
  blocks: Block[];
}

const collapse = (text: string) => text.replace(/\s+/g, " ").trim();

/** A small CSS reader: nested blocks and their declarations, enough for the app stylesheet and print.css. */
function parse(css: string): Block {
  const root: Block = { prelude: "", declarations: [], blocks: [] };
  const stack = [root];
  const current = () => stack[stack.length - 1] ?? root;
  const addDeclaration = (text: string) => {
    const statement = collapse(text);
    if (!statement) return;
    const colon = statement.indexOf(":");
    current().declarations.push(
      colon < 0 ? [statement, ""] : [statement.slice(0, colon).trim(), statement.slice(colon + 1).trim()],
    );
  };
  let text = "";
  for (let i = 0; i < css.length; i++) {
    const char = css.charAt(i);
    if (char === "/" && css.charAt(i + 1) === "*") {
      const end = css.indexOf("*/", i + 2);
      i = end < 0 ? css.length : end + 1;
    } else if (char === '"' || char === "'") {
      const end = css.indexOf(char, i + 1);
      text += css.slice(i, end + 1);
      i = end;
    } else if (char === "{") {
      const block: Block = { prelude: collapse(text), declarations: [], blocks: [] };
      current().blocks.push(block);
      stack.push(block);
      text = "";
    } else if (char === ";") {
      addDeclaration(text);
      text = "";
    } else if (char === "}") {
      addDeclaration(text);
      text = "";
      stack.pop();
    } else {
      text += char;
    }
  }
  return root;
}

/** Every block with declarations, with the preludes of the blocks around it (outermost first). */
function rules(block: Block, path: readonly string[] = []): Array<{ path: string[]; block: Block }> {
  const here = block.declarations.length > 0 ? [{ path: [...path], block }] : [];
  return [...here, ...block.blocks.flatMap((child) => rules(child, [...path, child.prelude]))];
}

/** The app stylesheet: the partials app.css imports after tokens.css and print.css. */
const APP = parse(
  ["theme.css", "utilities.css", "base.css", "dialog.css", "lightbox.css", "motion.css"].map(read).join("\n"),
);
const PRINT = parse(read("print.css"));
const UTILITY = "@utility reveal-on-scroll";
/** Motion allowed, no forced colours, no contrast preference: a fading card never fights a contrast setting. */
const MOTION_ALLOWED =
  "@media (prefers-reduced-motion: no-preference) and (forced-colors: none) and (prefers-contrast: no-preference)";
const SUPPORTED = "@supports (animation-timeline: view())";

/** Rules that mention the reveal anywhere: in the path (selector, utility) or a declaration. */
const mentionsReveal = ({ path, block }: { path: string[]; block: Block }) =>
  path.some((prelude) => prelude.includes("reveal-on-scroll")) ||
  block.declarations.some(([, value]) => value.includes("reveal-on-scroll"));

describe("reveal-on-scroll (app stylesheet)", () => {
  const revealRules = rules(APP).filter(mentionsReveal);
  const utility = revealRules.filter(({ path }) => path[0] === UTILITY);

  it("declares its animation only with motion allowed, no contrast settings and view timelines supported", () => {
    expect(utility.map(({ path }) => path)).toEqual([[UTILITY, MOTION_ALLOWED, SUPPORTED]]);
    // Nothing applies outside those conditions: no declarations directly in the utility or the media query.
    const top = APP.blocks.filter((block) => block.prelude === UTILITY);
    expect(top).toHaveLength(1);
    expect(top[0]?.declarations).toEqual([]);
    expect(top[0]?.blocks.map((block) => block.prelude)).toEqual([MOTION_ALLOWED]);
    expect(top[0]?.blocks[0]?.declarations).toEqual([]);
    expect(top[0]?.blocks[0]?.blocks.map((block) => block.prelude)).toEqual([SUPPORTED]);
  });

  it("runs on the card's view timeline from its entry for spacing4xl, standard easing, no time values", () => {
    const declarations = utility[0]?.block.declarations;
    expect(declarations).toEqual([
      // Fill backwards: waits hidden below the viewport, lets go once revealed.
      ["animation", "reveal-on-scroll var(--motion-easing-standard) backwards"],
      // After the shorthand, which resets it.
      ["animation-timeline", "view()"],
      ["animation-range", "entry 0% entry var(--spacing-4xl)"],
    ]);
  });

  it("fades up by spacingMd from transparent to the card's own state", () => {
    const keyframes = APP.blocks.filter((block) => block.prelude === "@keyframes reveal-on-scroll");
    expect(keyframes).toHaveLength(1);
    expect(keyframes[0]?.blocks).toEqual([
      {
        prelude: "from",
        declarations: [
          ["opacity", "0"],
          ["translate", "0 var(--spacing-md)"],
        ],
        blocks: [],
      },
    ]);
  });

  it("uses spacing tokens the theme defines", () => {
    const theme = APP.blocks.find((block) => block.prelude === "@theme inline");
    // 16px and 96px at the browser's default text size (relative-units.test.ts).
    expect(theme?.declarations).toContainEqual(["--spacing-md", "1rem"]);
    expect(theme?.declarations).toContainEqual(["--spacing-4xl", "6rem"]);
  });

  it("is not animated from anywhere else in the app stylesheet", () => {
    expect(revealRules.filter(({ path }) => path[0] !== UTILITY).map(({ path }) => path)).toEqual([
      ["@keyframes reveal-on-scroll", "from"],
    ]);
  });
});

describe("reveal-on-scroll (print.css)", () => {
  it("is switched off in print, so no card is left faded out", () => {
    const printRules = rules(PRINT).filter(({ path }) => path[0] === "@media print");
    const reveal = printRules.filter(({ path }) =>
      (path.at(-1) ?? "")
        .split(",")
        .map((selector) => selector.trim())
        .includes(".reveal-on-scroll"),
    );
    expect(reveal).toHaveLength(1);
    expect(reveal[0]?.block.declarations).toContainEqual(["animation", "none !important"]);
  });
});
