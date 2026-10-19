import { expect, type Locator, type Page, type Route } from "@playwright/test";

import { SELECTOR, THEME_LABEL, THEME_STORAGE_KEY } from "./helpers.constants.ts";
import type { PrepareOptions, Theme } from "./helpers.types.ts";
import { installToolkit } from "./toolkit.utils.ts";

/** Stores the theme (unless null) and installs the in-page toolkit; call before page.goto(). */
export async function prepare(
  page: Page,
  { theme = "light", removeViewTransitions = false }: PrepareOptions = {},
): Promise<void> {
  if (theme !== null) {
    await page.addInitScript(
      ({ key, value }) => {
        try {
          localStorage.setItem(key, value);
        } catch {
          /* storage blocked: the app falls back to the system setting */
        }
      },
      { key: THEME_STORAGE_KEY, value: theme },
    );
  }
  await page.addInitScript(installToolkit, { removeViewTransitions });
}

/**
 * Waits until React has replaced the prerendered HTML (its nodes carry a __reactFiber$ key),
 * the web fonts are in (they change the width of every label), and two frames have painted.
 */
export async function waitForApp(page: Page): Promise<void> {
  await page.waitForFunction(() => {
    const main = document.querySelector("main");
    return main !== null && Object.keys(main).some((key) => key.startsWith("__reactFiber$"));
  });
  await page.evaluate(async () => {
    await document.fonts.ready;
    for (let i = 0; i < 2; i++) await new Promise((resolve) => requestAnimationFrame(resolve));
  });
}

/** True once React has rendered over the page (its nodes carry a __reactFiber$ key). */
export async function appRan(page: Page): Promise<boolean> {
  return page.evaluate(() => {
    const main = document.querySelector("main");
    return main !== null && Object.keys(main).some((key) => key.startsWith("__reactFiber$"));
  });
}

/**
 * Aborts every script file the page requests (the app bundle: /static/*.js in the production
 * build, /src/main.tsx with E2E_DEV), so only the HTML and its inline scripts run. Returns the undo.
 */
export async function blockScriptFiles(page: Page): Promise<() => Promise<void>> {
  const handler = (route: Route) => (route.request().resourceType() === "script" ? route.abort() : route.fallback());
  await page.route("**/*", handler);
  return () => page.unroute("**/*", handler);
}

/** prepare() + goto + waitForApp(), and checks that a stored theme took (theme null: nothing to check). */
export async function openView(page: Page, path: string, options: PrepareOptions = {}): Promise<void> {
  await prepare(page, options);
  await page.goto(path);
  await waitForApp(page);
  const html = page.locator("html");
  if (options.theme === null) return;
  if (options.theme === "dark") await expect(html).toHaveClass(/\bdark\b/);
  else await expect(html).not.toHaveClass(/\bdark\b/);
}

/*
 * Test-side wrappers around the toolkit. Each evaluate callback repeats the window.__kb check:
 * it runs in the page, where nothing from this file exists.
 */

export async function nextFrames(page: Page, count = 1): Promise<void> {
  await page.evaluate(async (n) => {
    if (!window.__kb) throw new Error("e2e toolkit missing: call prepare(page) before page.goto()");
    await window.__kb.nextFrames(n);
  }, count);
}

export function navLink(page: Page, label: string): Locator {
  return page.locator(SELECTOR.primaryNav).getByRole("link", { name: label, exact: true });
}

export function themeButton(page: Page, theme: Theme): Locator {
  return page.locator(SELECTOR.themeGroup).getByRole("button", { name: THEME_LABEL[theme], exact: true });
}
