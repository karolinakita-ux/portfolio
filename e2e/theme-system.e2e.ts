/**
 * The site follows the system light / dark setting (prefers-color-scheme) until the visitor picks
 * a theme: at first paint (the inline script in index.html, before the app runs), after React has
 * taken over, and live when the system setting changes. A pick is stored and wins, also over later
 * system changes and after a reload. With storage blocked the site falls back to the system setting
 * without page errors. The prerendered theme switch shows (and announces) the applied theme from its
 * first frame, and nothing moves when the app takes over. A pick passed from www.kita.company
 * (?theme=) becomes the stored pick and leaves the address before the app runs.
 */
import { expect, test, type Page } from "@playwright/test";

import { VIEW, VIEW_PATHS } from "#shared/lib/routes/routes.constants.ts";

import { summariseAnimations } from "./helpers/animations.utils.ts";
import { activeKeys } from "./helpers/geometry.utils.ts";
import { CANVAS, SELECTOR, THEME_LABEL, THEME_STORAGE_KEY, THEMES } from "./helpers/helpers.constants.ts";
import type { Theme } from "./helpers/helpers.types.ts";
import {
  appRan,
  blockScriptFiles,
  holdScriptFiles,
  nextFrames,
  openView,
  prepare,
  themeButton,
  waitForApp,
} from "./helpers/page.utils.ts";
import { finishSampling, pillLog } from "./helpers/sampling.utils.ts";

const PATH = VIEW_PATHS[VIEW.about];
/** The dev server sends an empty page: no prerendered theme switch before the app runs. */
const DEV = process.env.E2E_DEV === "1";

const opposite = (theme: Theme): Theme => (theme === "dark" ? "light" : "dark");

/** "#1a1a1a" → "rgb(26, 26, 26)": how every engine serialises an opaque computed colour. */
const rgb = (hex: string): string => {
  const value = parseInt(hex.slice(1), 16);
  return `rgb(${(value >> 16) & 255}, ${(value >> 8) & 255}, ${value & 255})`;
};

/** The theme as <html> carries it: the dark class and color-scheme (all the inline script sets). */
async function expectDocumentTheme(page: Page, theme: Theme): Promise<void> {
  const html = page.locator("html");
  if (theme === "dark") await expect(html).toHaveClass(/\bdark\b/);
  else await expect(html).not.toHaveClass(/\bdark\b/);
  await expect(html).toHaveCSS("color-scheme", theme);
}

/** The theme as the app shows it: <html>, the page background and the pressed toggle button. */
async function expectAppTheme(page: Page, theme: Theme): Promise<void> {
  await expectDocumentTheme(page, theme);
  await expect(page.locator("body")).toHaveCSS("background-color", rgb(CANVAS[theme]));
  await expect(themeButton(page, theme)).toHaveAttribute("aria-pressed", "true");
  await expect(themeButton(page, opposite(theme))).toHaveAttribute("aria-pressed", "false");
}

/** The prerendered theme switch before the app runs: the theme's button pressed and its pill the one shown. */
async function expectSwitchBeforeApp(page: Page, theme: Theme): Promise<void> {
  if (DEV) return;
  await expect(themeButton(page, theme)).toHaveAttribute("aria-pressed", "true");
  await expect(themeButton(page, opposite(theme))).toHaveAttribute("aria-pressed", "false");
  await expect(page.locator(`${SELECTOR.themeGroup} [data-pill="${theme}"]`)).toHaveCSS("opacity", "1");
  await expect(page.locator(`${SELECTOR.themeGroup} [data-pill="${opposite(theme)}"]`)).toHaveCSS("opacity", "0");
}

/** The stored pick, null when there is none, "(blocked)" when storage throws. */
async function storedTheme(page: Page): Promise<string | null> {
  return page.evaluate((key) => {
    try {
      return localStorage.getItem(key);
    } catch {
      return "(blocked)";
    }
  }, THEME_STORAGE_KEY);
}

/** The dark class on <html> right now (no waiting). */
async function documentIsDark(page: Page): Promise<boolean> {
  return page.evaluate(() => document.documentElement.classList.contains("dark"));
}

/** Switches the emulated system setting and waits until the page sees it, plus a few frames for the app. */
async function setSystem(page: Page, theme: Theme): Promise<void> {
  await page.emulateMedia({ colorScheme: theme });
  await page.waitForFunction((dark) => matchMedia("(prefers-color-scheme: dark)").matches === dark, theme === "dark");
  await nextFrames(page, 5);
}

for (const system of THEMES) {
  test.describe(`system setting ${system}`, () => {
    test.use({ colorScheme: system });

    test("first paint follows it, before the app runs", async ({ page }) => {
      await blockScriptFiles(page);
      await page.goto(PATH);
      expect(await appRan(page), "the app bundle is blocked").toBe(false);
      await expectDocumentTheme(page, system);
      await expectSwitchBeforeApp(page, system);
    });

    test("after React: the same theme, nothing stored; live system changes are followed", async ({ page }) => {
      await openView(page, PATH, { theme: null });
      await expectAppTheme(page, system);
      expect(await storedTheme(page), "stored pick").toBeNull();

      await setSystem(page, opposite(system));
      // Already switched once setSystem() returns: the window the "pick wins" test relies on is long enough.
      expect(await documentIsDark(page), "followed within five frames").toBe(opposite(system) === "dark");
      await expectAppTheme(page, opposite(system));
      await setSystem(page, system);
      expect(await documentIsDark(page), "followed within five frames").toBe(system === "dark");
      await expectAppTheme(page, system);
      expect(await storedTheme(page), "stored pick").toBeNull();
    });

    test("a pick is stored and wins, over later system changes and after a reload", async ({ page }) => {
      const pick = opposite(system);
      await openView(page, PATH, { theme: null });
      await themeButton(page, pick).click();
      await expectAppTheme(page, pick);
      expect(await storedTheme(page), "stored pick").toBe(pick);

      await test.step("system changes no longer switch the theme", async () => {
        await setSystem(page, pick);
        await setSystem(page, system);
        expect(await documentIsDark(page), "still the pick five frames after the change").toBe(pick === "dark");
        await expectAppTheme(page, pick);
      });

      await test.step("reload: the pick wins at first paint and after React", async () => {
        const unblock = await blockScriptFiles(page);
        await page.reload();
        expect(await appRan(page), "the app bundle is blocked").toBe(false);
        await expectDocumentTheme(page, pick);
        await expectSwitchBeforeApp(page, pick);
        await unblock();
        await page.reload();
        await waitForApp(page);
        await expectAppTheme(page, pick);
      });
    });

    test("storage blocked: follows the system, a pick still applies, no page errors", async ({ page }) => {
      const errors: string[] = [];
      page.on("pageerror", (error) => {
        errors.push(error.message);
      });
      await page.addInitScript(() => {
        Object.defineProperty(window, "localStorage", {
          get() {
            throw new DOMException("The operation is insecure.", "SecurityError");
          },
        });
      });
      await openView(page, PATH, { theme: null });
      expect(await storedTheme(page), "storage").toBe("(blocked)");
      await expectAppTheme(page, system);
      await themeButton(page, opposite(system)).click();
      await expectAppTheme(page, opposite(system));
      expect(errors, "page errors").toEqual([]);
    });
  });
}

for (const pick of THEMES) {
  test.describe(`${pick} picked (system ${opposite(pick)}), from the first frame through the app's takeover`, () => {
    test.use({ colorScheme: opposite(pick) });

    for (const { source, path, stored } of [
      { source: "stored", path: PATH, stored: pick },
      { source: "passed from www.kita.company", path: `${PATH}?ref=kita-company&theme=${pick}`, stored: null },
    ]) {
      test(`${source}: the switch shows and announces the pick in every frame, nothing moves`, async ({ page }) => {
        test.skip(DEV, "the dev server sends no prerendered HTML");
        const label = THEME_LABEL[pick];
        await prepare(page, { theme: stored });
        // Samples the theme pills in every frame from the start of the document (frames before the switch: no items).
        await page.addInitScript((selector) => {
          window.__kb?.startSampling(selector);
        }, SELECTOR.themePills);
        const release = await holdScriptFiles(page);
        await page.goto(path, { waitUntil: "commit" });
        await page.locator(SELECTOR.themeGroup).waitFor();
        await nextFrames(page, 5);
        expect(await appRan(page), "the app bundle is held").toBe(false);
        release();
        await waitForApp(page);
        // Longer than any animation, so one started by the takeover would be sampled and logged.
        await page.waitForTimeout(500);

        const frames = (await finishSampling(page, SELECTOR.themePills)).filter((frame) => frame.items.length > 0);
        expect(frames.length, "frames with the switch").toBeGreaterThan(5);
        expect(
          frames
            .filter((frame) => activeKeys(frame).join() !== label)
            .map((frame) => `${activeKeys(frame).join("+") || "none"} at ${String(Math.round(frame.t))}ms`),
          `frames that do not press ${label}`,
        ).toEqual([]);
        // Firefox runs frame callbacks before the stylesheet has loaded, when the pills are unstyled spans (both at
        // opacity 1): the opacity check counts the frames with the stylesheet applied (each pill covers its button).
        const styled = frames.filter((frame) =>
          frame.items.every((item) => item.control !== null && Math.abs(item.width - item.control.width) < 1),
        );
        expect(styled.length, "frames with the stylesheet applied").toBeGreaterThan(5);
        const wrong = styled.flatMap((frame) =>
          frame.items
            .filter((item) => item.opacity !== (item.key === label ? 1 : 0))
            .map((item) => `${item.key} ${String(item.opacity)} at ${String(Math.round(frame.t))}ms`),
        );
        expect(wrong, `only the ${label} pill shows, at full opacity`).toEqual([]);
        expect(summariseAnimations(frames), "pill animations in the sampled frames").toEqual([]);
        expect(await pillLog(page), "pill animations since the document started").toEqual([]);
        expect(await storedTheme(page), "stored pick").toBe(pick);
      });
    }
  });
}

/*
 * www.kita.company's link to the portfolio carries ?ref=kita-company and, once the visitor has picked a theme there,
 * &theme=light or &theme=dark: each site keeps its own localStorage. The theme script in index.html makes it the
 * stored pick and takes it out of the address before anything else runs (the statistics side:
 * analytics-links.e2e.ts).
 */
const KITA_COMPANY = "https://www.kita.company/";
const fromKitaCompany = (theme: string) => `${VIEW_PATHS[VIEW.work]}?ref=kita-company&theme=${theme}`;
/** Where every such link lands: the tag stays, the theme does not. */
const LANDED = `${VIEW_PATHS[VIEW.work]}?ref=kita-company`;

/** The address in the bar: path, query and hash. */
const address = (page: Page): string => {
  const { pathname, search, hash } = new URL(page.url());
  return pathname + search + hash;
};

/** Page errors and console errors (a hydration mismatch is one) from now on. */
function collectErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(`page error: ${error.message}`));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(`console error: ${message.text()}`);
  });
  return errors;
}

for (const system of THEMES) {
  const pick = opposite(system);
  test.describe(`a ${pick} pick passed from www.kita.company (system ${system})`, () => {
    test.use({ colorScheme: system });

    test("before the app runs: the pick shows from the first paint, is stored and leaves the address", async ({
      page,
    }) => {
      await blockScriptFiles(page);
      await page.goto(fromKitaCompany(pick));
      expect(await appRan(page), "the app bundle is blocked").toBe(false);
      await expectDocumentTheme(page, pick);
      await expectSwitchBeforeApp(page, pick);
      expect(await storedTheme(page), "stored pick").toBe(pick);
      expect(address(page)).toBe(LANDED);
    });

    test("followed from kita.company: the app keeps it, also after a reload; one history entry, Back returns", async ({
      page,
      baseURL,
    }) => {
      const errors = collectErrors(page);
      await prepare(page, { theme: null });
      // A stand-in for kita.company's page with its link, as the live site writes it after a pick; nothing goes out.
      await page.route(`${KITA_COMPANY}**`, (route) =>
        route.request().resourceType() === "document"
          ? route.fulfill({
              contentType: "text/html",
              body: `<!doctype html><title>Kita Company</title><a href="${baseURL ?? ""}${fromKitaCompany(pick)}">Karolina Kita</a>`,
            })
          : route.fulfill({ status: 204 }),
      );
      await page.goto(KITA_COMPANY);
      const entries = await page.evaluate(() => history.length);
      await page.getByRole("link", { name: "Karolina Kita" }).click();
      await waitForApp(page);
      await expectAppTheme(page, pick);
      expect(await storedTheme(page), "stored pick").toBe(pick);
      expect(address(page)).toBe(LANDED);
      expect(await page.evaluate(() => history.length), "history entries").toBe(entries + 1);

      await setSystem(page, pick);
      await setSystem(page, system);
      await expectAppTheme(page, pick);
      await page.reload();
      await waitForApp(page);
      await expectAppTheme(page, pick);
      expect(address(page)).toBe(LANDED);

      // Firefox's goBack() can return before the page changes (with or without the theme), so wait for the address.
      await page.goBack();
      await expect(page).toHaveURL(KITA_COMPANY);
      expect(errors).toEqual([]);
    });
  });
}

test.describe("a passed value that is not a theme, a stored pick, storage blocked (system dark)", () => {
  test.use({ colorScheme: "dark" });

  for (const value of ["blue", ""]) {
    test(`?theme=${value}: nothing stored or changed, gone from the address`, async ({ page }) => {
      await openView(page, fromKitaCompany(value), { theme: null });
      await expectAppTheme(page, "dark");
      expect(await storedTheme(page), "stored pick").toBeNull();
      expect(address(page)).toBe(LANDED);
    });
  }

  test("?theme=light wins over a stored dark pick and becomes the stored pick", async ({ page }) => {
    await prepare(page, { theme: "dark" });
    await page.goto(fromKitaCompany("light"));
    await waitForApp(page);
    await expectAppTheme(page, "light");
    expect(await storedTheme(page), "stored pick").toBe("light");
    expect(address(page)).toBe(LANDED);
  });

  test("storage blocked: the system setting, gone from the address, no page errors", async ({ page }) => {
    const errors = collectErrors(page);
    await page.addInitScript(() => {
      Object.defineProperty(window, "localStorage", {
        get() {
          throw new DOMException("The operation is insecure.", "SecurityError");
        },
      });
    });
    await openView(page, fromKitaCompany("light"), { theme: null });
    await expectAppTheme(page, "dark");
    expect(address(page)).toBe(LANDED);
    expect(errors).toEqual([]);
  });
});
