import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

/**
 * The named animations (the animate-* utilities, docs/motion.md). theme.css resets Tailwind's own (spin, ping and
 * pulse loop forever, bounce too until hover ends) and defines each one the site uses. Every one ends within 5 s
 * (WCAG 2.2.2), and an entrance fills backwards only: once it ends, the element is its own state again, with no
 * transform left behind (a transform makes a stacking context and a containing block for fixed children).
 * motion-tokens.test.ts reports any other animate-* utility and anything infinite; e2e/motion-a11y.e2e.ts and
 * e2e/motion-details.e2e.ts check the browsers' side.
 */
// Resolved with node:path: the jsdom test environment's global URL mis-resolves file: URLs on Windows.
const dir = dirname(fileURLToPath(import.meta.url));
const read = (file: string) => readFileSync(join(dir, file), "utf8").replace(/\/\*[\s\S]*?\*\//g, "");
const THEME = read("theme.css");

/** Motion token values (tokens.css), by name: "motion-duration-medium" → "240ms". */
const TOKENS = new Map(
  [...read("tokens.css").matchAll(/--(motion-[a-z0-9-]+)\s*:\s*([^;]+);/g)].map(([, name = "", value = ""]) => [
    name,
    value.trim(),
  ]),
);

/** Each --animate-<name> in the theme, its value with whitespace collapsed. */
const ANIMATIONS = new Map(
  [...THEME.matchAll(/--animate-([a-z][\w-]*)\s*:\s*([^;]+);/g)].map(([, name = "", value = ""]) => [
    name,
    value.replace(/\s+/g, " ").trim(),
  ]),
);

/** "var(--motion-duration-medium)" or "2s" → milliseconds (NaN when it is neither). */
function toMs(time: string): number {
  const token = /^var\(--(motion-[a-z0-9-]+)\)$/.exec(time)?.[1];
  const value = token === undefined ? time : (TOKENS.get(token) ?? "");
  const match = /^([\d.]+)(ms|s)$/.exec(value);
  return match ? Number(match[1]) * (match[2] === "s" ? 1000 : 1) : Number.NaN;
}

interface Animation {
  keyframes: string;
  duration: string;
  easing: string;
  /** Iteration count: 1 unless given; Infinity for `infinite`. */
  iterations: number;
  fill: string;
}

/** "<keyframes> <duration> <easing> [<count>] [<fill>]", the order theme.css writes them in. */
function parse(value: string): Animation {
  const [keyframes = "", duration = "", easing = "", ...rest] = value.split(" ");
  const count = rest.find((part) => /^(?:\d+|infinite)$/.test(part));
  return {
    keyframes,
    duration,
    easing,
    iterations: count === undefined ? 1 : count === "infinite" ? Infinity : Number(count),
    fill: rest.find((part) => /^(?:none|forwards|backwards|both)$/.test(part)) ?? "none",
  };
}

/** Entrances: something appears (a new view, a dialog, the copied-email bubble, the next image). */
const ENTRANCES = ["view-in", "slide-in-next", "slide-in-prev"];

describe("named animations (theme.css)", () => {
  it("resets Tailwind's own, so only the site's compile", () => {
    expect(THEME).toMatch(/--animate-\*\s*:\s*initial\s*;/);
    expect([...ANIMATIONS.keys()].sort()).toEqual([...ENTRANCES, "skeleton-pulse"].sort());
  });

  it("times each with the motion tokens and the standard easing, the skeleton's slow breath aside", () => {
    for (const [name, value] of ANIMATIONS) expect(parse(value).easing, name).toBe("var(--motion-easing-standard)");
    for (const name of ENTRANCES) {
      expect(parse(ANIMATIONS.get(name) ?? "").duration, name).toMatch(
        /^var\(--motion-duration-(?:fast|medium|slow)\)$/,
      );
    }
  });

  it("ends each within 5 seconds: a finite count of a known duration (WCAG 2.2.2)", () => {
    for (const [name, value] of ANIMATIONS) {
      const { duration, iterations } = parse(value);
      const total = toMs(duration) * iterations;
      expect(Number.isFinite(total), `${name}: ${value}`).toBe(true);
      expect(total, `${name}: ${value}`).toBeLessThanOrEqual(5000);
    }
  });

  it("fills entrances backwards only: once they end, the element keeps no transform or opacity of theirs", () => {
    for (const name of ENTRANCES) {
      const value = ANIMATIONS.get(name) ?? "";
      expect(parse(value), name).toMatchObject({ keyframes: name, iterations: 1, fill: "backwards" });
    }
  });

  it("pulses the loading skeleton twice, 2 s each, from its own state to half opacity and back", () => {
    expect(ANIMATIONS.get("skeleton-pulse")).toBe("skeleton-pulse 2s var(--motion-easing-standard) 2");
    expect(THEME).toMatch(/@keyframes skeleton-pulse\s*\{\s*50%\s*\{\s*opacity:\s*0\.5;\s*\}\s*\}/);
  });

  it("defines the keyframes each animation names", () => {
    for (const [name, value] of ANIMATIONS) {
      expect(THEME, name).toContain(`@keyframes ${parse(value).keyframes} {`);
    }
  });
});
