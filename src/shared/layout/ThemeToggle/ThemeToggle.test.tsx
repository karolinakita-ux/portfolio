import { readFileSync } from "node:fs";
import { join } from "node:path";
import { render, screen } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { describe, expect, it, onTestFinished, vi } from "vitest";

import { THEME_STORAGE_KEY } from "#shared/hooks/theme/theme.constants.ts";
import type { Theme } from "#shared/hooks/theme/theme.types.ts";
import { mockMatchMedia } from "#test/matchMedia.ts";

import { ThemeToggle } from "./ThemeToggle.tsx";

const button = (theme: Theme) => screen.getByRole("button", { name: theme === "light" ? "Light theme" : "Dark theme" });
const pressed = () => ({
  light: button("light").getAttribute("aria-pressed"),
  dark: button("dark").getAttribute("aria-pressed"),
});
/** The class of the button, its pill and its icon. */
const looks = (theme: Theme) => {
  const control = button(theme);
  return [control, control.querySelector("[data-pill]"), control.querySelector("svg")].map((element) =>
    element?.getAttribute("class"),
  );
};

describe("ThemeToggle", () => {
  it("marks each button with its theme for the inline script in index.html", () => {
    render(<ThemeToggle theme="light" onChange={vi.fn()} />);
    expect(button("light")).toHaveAttribute("data-theme-option", "light");
    expect(button("dark")).toHaveAttribute("data-theme-option", "dark");
  });

  it("styles the pressed look from aria-pressed: a new theme changes only that attribute", () => {
    const { rerender } = render(<ThemeToggle theme="light" onChange={vi.fn()} />);
    const before = { light: looks("light"), dark: looks("dark") };
    expect(pressed()).toEqual({ light: "true", dark: "false" });

    rerender(<ThemeToggle theme="dark" onChange={vi.fn()} />);
    expect(pressed()).toEqual({ light: "false", dark: "true" });
    expect({ light: looks("light"), dark: looks("dark") }).toEqual(before);

    const pill = button("dark").querySelector("[data-pill]");
    expect(button("dark")).toHaveClass("group/theme", "aria-pressed:text-text-on-accent");
    expect(pill).toHaveClass("opacity-0", "group-aria-pressed/theme:opacity-100");
    // The filled icon keeps the state visible without the yellow marker (WCAG 1.4.11).
    expect(button("dark").querySelector("svg")).toHaveClass("group-aria-pressed/theme:fill-current");
  });
});

/** index.html's inline theme script, which runs in <head> before the browser parses the page. */
const inlineScript = (() => {
  const html = new DOMParser().parseFromString(readFileSync(join(process.cwd(), "index.html"), "utf8"), "text/html");
  const script = html.head.querySelector("script:not([type])")?.textContent;
  if (!script) throw new Error("no inline script in the <head> of index.html");
  return script;
})();

/**
 * Runs the inline script, then adds the switch as the prerendered HTML carries it (built with Light pressed), the
 * way the parser adds the page after the script. A microtask later is when mutation observers have run: before the
 * browser paints.
 */
async function loadPrerenderedSwitch(): Promise<void> {
  // eslint-disable-next-line @typescript-eslint/no-implied-eval -- runs index.html's own script, as the browser does
  const run = new Function(inlineScript) as () => void;
  run();
  document.body.insertAdjacentHTML("beforeend", renderToString(<ThemeToggle theme="light" onChange={vi.fn()} />));
  onTestFinished(() => {
    document.body.replaceChildren();
  });
  await Promise.resolve();
}

describe("the prerendered switch before the app runs (inline script in index.html)", () => {
  it("presses Dark when the stored pick is dark", async () => {
    mockMatchMedia(false);
    window.localStorage.setItem(THEME_STORAGE_KEY, "dark");
    await loadPrerenderedSwitch();
    expect(document.documentElement).toHaveClass("dark");
    expect(pressed()).toEqual({ light: "false", dark: "true" });
  });

  it("presses Dark when nothing is stored and the system setting is dark", async () => {
    mockMatchMedia(true);
    await loadPrerenderedSwitch();
    expect(pressed()).toEqual({ light: "false", dark: "true" });
  });

  it("leaves Light pressed for a stored light pick, over a dark system setting", async () => {
    mockMatchMedia(true);
    window.localStorage.setItem(THEME_STORAGE_KEY, "light");
    await loadPrerenderedSwitch();
    expect(document.documentElement).not.toHaveClass("dark");
    expect(pressed()).toEqual({ light: "true", dark: "false" });
  });

  it("follows the system setting when storage is blocked", async () => {
    mockMatchMedia(true);
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new DOMException("The operation is insecure.", "SecurityError");
    });
    await loadPrerenderedSwitch();
    expect(pressed()).toEqual({ light: "false", dark: "true" });
  });

  it("stops watching once it has pressed the switch: the app's own render is left alone", async () => {
    mockMatchMedia(false);
    window.localStorage.setItem(THEME_STORAGE_KEY, "dark");
    await loadPrerenderedSwitch();
    document.body.replaceChildren();

    render(<ThemeToggle theme="light" onChange={vi.fn()} />);
    await Promise.resolve();
    expect(pressed()).toEqual({ light: "true", dark: "false" });
  });
});
