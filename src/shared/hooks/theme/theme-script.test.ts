import { readFileSync } from "node:fs";
import { join } from "node:path";
import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { mockMatchMedia } from "#test/match-media.ts";

import { THEME_STORAGE_KEY } from "./theme.constants.ts";
import { useTheme } from "./useTheme.ts";

/** The theme script in index.html: it runs in <head>, before the first paint and long before the app. */
const SCRIPT = /<script>\s*(\(function \(\) \{\s*var theme = null;[\s\S]*?\}\)\(\);)\s*<\/script>/.exec(
  readFileSync(join(process.cwd(), "index.html"), "utf8"),
)?.[1];

const html = () => document.documentElement;
const stored = () => window.localStorage.getItem(THEME_STORAGE_KEY);
const address = () => window.location.pathname + window.location.search + window.location.hash;

/** Opens `url` with the system setting `system` and runs the script, as the browser does when it parses <head>. */
function open(url: string, system: "light" | "dark" = "light") {
  mockMatchMedia(system === "dark");
  window.history.replaceState({ kbId: "entry-1" }, "", url);
  const length = window.history.length;
  const replaceState = vi.spyOn(window.history, "replaceState");
  if (SCRIPT === undefined) throw new Error("index.html has no theme script");
  // eslint-disable-next-line @typescript-eslint/no-implied-eval -- runs the page's own inline script, as the browser does
  (new Function(SCRIPT) as () => void)();
  return { length, replaceState };
}

describe("the theme script in index.html: a pick passed from www.kita.company (?theme=)", () => {
  it("makes ?theme=dark the stored pick, shows it, and takes it out of the address", () => {
    const { length, replaceState } = open("/?ref=kita-company&theme=dark");
    expect(html()).toHaveClass("dark");
    expect(html()).toHaveStyle({ colorScheme: "dark" });
    expect(stored()).toBe("dark");
    expect(address()).toBe("/?ref=kita-company");
    expect(replaceState).toHaveBeenCalledOnce();
    expect(window.history.length, "no new history entry").toBe(length);
    expect(window.history.state, "the entry's state is kept").toEqual({ kbId: "entry-1" });
  });

  it("makes ?theme=light win over a stored dark pick and a dark system setting", () => {
    window.localStorage.setItem(THEME_STORAGE_KEY, "dark");
    open("/?ref=kita-company&theme=light", "dark");
    expect(html()).not.toHaveClass("dark");
    expect(html()).toHaveStyle({ colorScheme: "light" });
    expect(stored()).toBe("light");
    expect(address()).toBe("/?ref=kita-company");
  });

  it.each(["blue", "", "DARK", "dark "])(
    "ignores ?theme=%j: nothing stored, the system setting, gone from the address",
    (value) => {
      open(`/?ref=kita-company&theme=${encodeURIComponent(value)}`, "dark");
      expect(html()).toHaveClass("dark");
      expect(stored()).toBeNull();
      expect(address()).toBe("/?ref=kita-company");
    },
  );

  it("keeps a stored pick when the passed value is not a theme", () => {
    window.localStorage.setItem(THEME_STORAGE_KEY, "light");
    open("/?theme=sepia", "dark");
    expect(html()).not.toHaveClass("dark");
    expect(stored()).toBe("light");
    expect(address()).toBe("/");
  });

  it("keeps the rest of the address: the path, the other parameters in their order, the hash", () => {
    open("/about?ref=kita-company&theme=dark&utm_medium=section-link#career");
    expect(address()).toBe("/about?ref=kita-company&utm_medium=section-link#career");
    expect(stored()).toBe("dark");
  });

  it("leaves no empty query when the theme was the only parameter", () => {
    open("/cv?theme=dark");
    expect(address()).toBe("/cv");
  });

  it("removes every theme parameter, using the first", () => {
    open("/?theme=dark&ref=kita-company&theme=light");
    expect(stored()).toBe("dark");
    expect(address()).toBe("/?ref=kita-company");
  });

  it("does not touch the address or the history without a theme parameter", () => {
    const { replaceState } = open("/about?ref=acme&themes=dark#career");
    expect(replaceState).not.toHaveBeenCalled();
    expect(address()).toBe("/about?ref=acme&themes=dark#career");
    expect(stored()).toBeNull();
  });

  it("with storage blocked: follows the system setting, takes the parameter out, throws nothing", () => {
    const blocked = () => {
      throw new DOMException("The operation is insecure.", "SecurityError");
    };
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(blocked);
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(blocked);
    open("/?ref=kita-company&theme=dark", "light");
    expect(html()).not.toHaveClass("dark");
    expect(address()).toBe("/?ref=kita-company");
  });

  it("leaves the app in agreement: useTheme starts from the passed pick and keeps it over system changes", () => {
    open("/?ref=kita-company&theme=dark", "light");
    const system = mockMatchMedia(false);
    const { result } = renderHook(() => useTheme());
    expect(result.current[0]).toBe("dark");
    system.change(true);
    system.change(false);
    expect(result.current[0]).toBe("dark");
    expect(html()).toHaveClass("dark");
  });
});
