/**
 * Visitor statistics (src/shared/lib/analytics/) in real browsers.
 *
 * The production build is served as https://karolina.kita.company: page.route answers those requests
 * from the local preview server. The real Umami script loads from cloud.umami.is (this spec needs the
 * internet), and every call to Umami's collector is caught here, so nothing reaches the Umami account.
 * Checks: nothing loads before consent (the consent box), what is sent and when after it, no hash in
 * addresses, no cookies, only the choice and the theme stored, and no box and no script on any other
 * host or for a visitor with Global Privacy Control.
 */
import { AxeBuilder } from "@axe-core/playwright";
import { expect, test, type Page, type Request } from "@playwright/test";

import { EVENT, STATISTICS_CHOICE_KEY, UMAMI } from "#shared/lib/analytics/analytics.constants.ts";

import { THEME_STORAGE_KEY } from "./helpers/helpers.constants.ts";
import { themeButton, waitForApp } from "./helpers/page.utils.ts";

const SITE = "https://" + UMAMI.host;
const COLLECTOR = "https://gateway.umami.is/**";
const CONSENT_BOX = "Can I count your visit?";

/** One call to Umami's collector, as the tracker posts it: an event or pageview, session data, a speed report. */
interface Sent {
  type: "event" | "identify" | "performance";
  payload: {
    website: string;
    hostname: string;
    url: string;
    title: string;
    referrer?: string;
    /** The site's version (data-tag). */
    tag?: string;
    name?: string;
    data?: Record<string, string>;
    ttfb?: number;
    lcp?: number;
    duration?: number;
  };
}

/** The collector answers cross-origin calls, including the browser's preflight. */
const CORS = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "POST, OPTIONS",
  "access-control-allow-headers": "*",
};

/** Umami requests the page makes from now on, by URL. */
function umamiRequests(page: Page): string[] {
  const urls: string[] = [];
  page.on("request", (request: Request) => {
    if (request.url().includes("umami.is")) urls.push(request.url());
  });
  return urls;
}

/** Serves the local build as the live site; returns what the tracker sends and every Umami request. */
async function openAsLiveSite(page: Page, baseURL: string | undefined, path: string) {
  if (!baseURL) throw new Error("baseURL is not set (playwright.config.ts)");
  await page.route(SITE + "/**", async (route) => {
    const { pathname, search } = new URL(route.request().url());
    const response = await page.context().request.get(baseURL + pathname + search);
    // A reload can drop a request still in flight (a background image preload): nothing left to answer.
    await route.fulfill({ response }).catch((error: unknown) => {
      if (!String(error).includes("disposed")) throw error;
    });
  });
  const sent: Sent[] = [];
  await page.route(COLLECTOR, async (route) => {
    if (route.request().method() === "POST") sent.push(route.request().postDataJSON() as Sent);
    await route.fulfill({ status: 200, headers: CORS, contentType: "application/json", body: "{}" });
  });
  const requests = umamiRequests(page);
  await page.goto(SITE + path);
  await waitForApp(page);
  return { sent, requests };
}

const consentBox = (page: Page) => page.getByRole("region", { name: CONSENT_BOX });

/** Answers "Allow statistics" in the consent box and waits for the real script. */
async function allowStatistics(page: Page): Promise<void> {
  const script = page.waitForResponse(UMAMI.script);
  await consentBox(page).getByRole("button", { name: "Allow statistics" }).click();
  expect((await script).ok(), "the Umami script loads from cloud.umami.is (needs the internet)").toBe(true);
}

const pageviews = (sent: readonly Sent[]) =>
  sent.filter((call) => call.type === "event" && call.payload.name === undefined);
const named = (sent: readonly Sent[]) => sent.flatMap((call) => (call.payload.name ? [call.payload] : []));
const ofType = (sent: readonly Sent[], type: Sent["type"]) => sent.filter((call) => call.type === type);
const storage = (page: Page) =>
  page.evaluate(() => ({ local: Object.keys(localStorage).sort(), session: Object.keys(sessionStorage) }));

test("asks before loading anything, and a decline sticks across reloads", async ({ page, baseURL }) => {
  const { sent, requests } = await openAsLiveSite(page, baseURL, "/about?ref=e2e-test");
  await expect(consentBox(page)).toBeVisible();
  await page.waitForTimeout(500);
  expect(requests, "no request to Umami before consent").toEqual([]);

  const axe = await new AxeBuilder({ page }).include("section[aria-labelledby]:has(> p)").analyze();
  expect(axe.violations.map((v) => v.id)).toEqual([]);

  await consentBox(page).getByRole("button", { name: "No, thanks" }).click();
  await expect(consentBox(page)).toHaveCount(0);
  expect(await storage(page)).toEqual({ local: [STATISTICS_CHOICE_KEY], session: [] });
  expect(await page.evaluate((key) => localStorage.getItem(key), STATISTICS_CHOICE_KEY)).toBe("off");

  await page.reload();
  await waitForApp(page);
  await page.waitForTimeout(500);
  await expect(consentBox(page)).toHaveCount(0);
  expect(requests).toEqual([]);
  expect(sent).toEqual([]);
});

test("counts pages and clicks after consent, without the hash, and stores only the choices", async ({
  page,
  context,
  baseURL,
}) => {
  const { sent } = await openAsLiveSite(page, baseURL, "/about?ref=e2e-test&fbclid=IwAR0e2e#faq");
  await allowStatistics(page);
  await expect(consentBox(page)).toHaveCount(0);

  // The page the visitor is on and its tag, with the tag but without the click id and the hash.
  await expect.poll(() => [pageviews(sent).length, named(sent).length]).toEqual([1, 1]);
  const [landing] = pageviews(sent);
  const [tag] = named(sent);
  expect(landing?.payload).toMatchObject({
    website: UMAMI.websiteId,
    hostname: UMAMI.host,
    url: SITE + "/about?ref=e2e-test",
    title: "About - Karolina Kita",
  });
  expect(landing?.payload.name).toBeUndefined();
  expect(tag).toMatchObject({
    name: EVENT.linkRef,
    data: { ref: "e2e-test" },
    url: SITE + "/about?ref=e2e-test",
  });

  // A FAQ question opens: one event on this page.
  await page.locator("#faq").getByRole("button").first().click();
  await expect.poll(() => named(sent).map((payload) => payload.name)).toEqual([EVENT.linkRef, EVENT.faqOpen]);

  // Scrolling moves the hash (useSectionHash) but is not a new page.
  await page.mouse.wheel(0, -4000);
  await page.mouse.wheel(0, 2000);
  await page.waitForTimeout(800);
  expect(pageviews(sent)).toHaveLength(1);

  // A new view, then Back: one pageview each; the query stays, the referrer is the page before.
  await page.locator('nav[aria-label="Primary"]').getByRole("link", { name: "Work", exact: true }).click();
  await expect.poll(() => pageviews(sent).length).toBe(2);
  expect(pageviews(sent)[1]?.payload).toMatchObject({
    url: SITE + "/?ref=e2e-test",
    title: "Karolina Kita - Senior Product Designer",
    referrer: "/about?ref=e2e-test",
  });
  await page.goBack();
  await expect.poll(() => pageviews(sent).length).toBe(3);
  expect(pageviews(sent)[2]?.payload).toMatchObject({ url: SITE + "/about?ref=e2e-test", referrer: "/?ref=e2e-test" });

  // No hash or click id in any address sent, no cookies, only the statistics choice stored.
  for (const call of sent) expect(call.payload.url).not.toMatch(/#|fbclid/);
  expect(await context.cookies()).toEqual([]);
  expect(await storage(page)).toEqual({ local: [STATISTICS_CHOICE_KEY], session: [] });

  // Picking a theme is counted and stores only the theme choice besides it.
  await themeButton(page, "dark").click();
  await expect.poll(() => named(sent).at(-1)).toMatchObject({ name: EVENT.themeSwitch, data: { theme: "dark" } });
  expect(await storage(page)).toEqual({ local: [STATISTICS_CHOICE_KEY, THEME_STORAGE_KEY].sort(), session: [] });
});

test("stops at once when switched off on the privacy page, and does not load after a reload", async ({
  page,
  baseURL,
}) => {
  const { sent, requests } = await openAsLiveSite(page, baseURL, "/privacy");
  await allowStatistics(page);
  await expect.poll(() => [pageviews(sent).length, ofType(sent, "identify").length]).toEqual([1, 1]);

  await page.getByRole("button", { name: "Switch statistics off" }).click();
  await expect(page.getByRole("status").filter({ hasText: "Statistics are off" })).toBeVisible();
  expect(await page.evaluate((key) => localStorage.getItem(key), STATISTICS_CHOICE_KEY)).toBe("off");
  const before = sent.length;

  // A new view, a click and a hidden tab (when the tracker's own speed report goes): nothing more is sent.
  await page.locator('nav[aria-label="Primary"]').getByRole("link", { name: "About", exact: true }).click();
  await page.locator("#faq").getByRole("button").first().click();
  await page.evaluate(() => {
    Object.defineProperty(document, "visibilityState", { value: "hidden", configurable: true });
    document.dispatchEvent(new Event("visibilitychange"));
  });
  await page.waitForTimeout(800);
  expect(sent).toHaveLength(before);
  expect(ofType(sent, "performance")).toEqual([]);

  // After a reload the script is not even requested, and nobody asks again.
  requests.length = 0;
  await page.reload();
  await waitForApp(page);
  await page.waitForTimeout(500);
  expect(requests).toEqual([]);
  await expect(consentBox(page)).toHaveCount(0);
});

test("neither asks nor loads on any other host (local preview, Netlify's own addresses)", async ({ page }) => {
  const requests = umamiRequests(page);
  await page.goto("/about?ref=e2e-test");
  await waitForApp(page);
  await page.locator("#faq").getByRole("button").first().click();
  await page.waitForTimeout(500);
  expect(requests).toEqual([]);
  await expect(consentBox(page)).toHaveCount(0);
  await expect(page.locator(`script[src="${UMAMI.script}"]`)).toHaveCount(0);
});

test("neither asks nor loads for a visitor with Global Privacy Control", async ({ page, baseURL }) => {
  await page.addInitScript(() => {
    Object.defineProperty(Navigator.prototype, "globalPrivacyControl", { get: () => true, configurable: true });
  });
  const { requests } = await openAsLiveSite(page, baseURL, "/");
  await page.waitForTimeout(500);
  expect(requests).toEqual([]);
  await expect(consentBox(page)).toHaveCount(0);
  await expect(page.locator(`script[src="${UMAMI.script}"]`)).toHaveCount(0);
});

/** The data of the named events sent so far, by name. */
const eventsNamed = (sent: readonly Sent[], name: string) =>
  named(sent).flatMap((payload) => (payload.name === name ? [payload] : []));

test("measures time on page and clicks on things that do nothing, as a mouse", async ({ page, baseURL }) => {
  const { sent } = await openAsLiveSite(page, baseURL, "/about");
  await allowStatistics(page);
  await expect.poll(() => pageviews(sent).length).toBe(1);

  // The portrait does nothing when clicked: one dead click, with what, where and the input.
  const portrait = page.locator("#philosophy img");
  await portrait.scrollIntoViewIfNeeded();
  await portrait.click();
  const alt = await portrait.getAttribute("alt");
  await expect
    .poll(() => eventsNamed(sent, EVENT.deadClick).map((payload) => payload.data))
    .toEqual([{ element: "image", area: "philosophy", label: alt, input: "mouse" }]);

  // Three quick clicks on it: a new burst, so one more dead click and one rage click.
  await page.waitForTimeout(1000);
  await portrait.click({ clickCount: 3 });
  await expect.poll(() => eventsNamed(sent, EVENT.rageClick).length).toBe(1);
  expect(eventsNamed(sent, EVENT.deadClick)).toHaveLength(2);

  // Links and buttons are not dead clicks; a new view sends the time spent on the one before.
  await page.locator('nav[aria-label="Primary"]').getByRole("link", { name: "Work", exact: true }).click();
  await expect.poll(() => eventsNamed(sent, EVENT.timeOnPage).length).toBe(1);
  const [about] = eventsNamed(sent, EVENT.timeOnPage);
  expect(about).toMatchObject({ url: SITE + "/about", title: "About - Karolina Kita" });
  expect(about?.data).toMatchObject({ time: "under 10 s", section: "philosophy" });
  expect(Number(about?.data?.seconds)).toBeGreaterThanOrEqual(1);
  expect(eventsNamed(sent, EVENT.deadClick)).toHaveLength(2);

  // Hiding the tab (another tab, another app) ends the stretch on this page too.
  await page.mouse.move(10, 300);
  await page.waitForTimeout(1200);
  await page.evaluate(() => {
    Object.defineProperty(document, "visibilityState", { value: "hidden", configurable: true });
    document.dispatchEvent(new Event("visibilitychange"));
  });
  await expect.poll(() => eventsNamed(sent, EVENT.timeOnPage).length).toBe(2);
  expect(eventsNamed(sent, EVENT.timeOnPage)[1]).toMatchObject({ url: SITE + "/" });
});

test("tells a tap on a touch screen from a mouse click", async ({ browser, baseURL }) => {
  const context = await browser.newContext({ hasTouch: true, viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  const { sent } = await openAsLiveSite(page, baseURL, "/about");
  await allowStatistics(page);

  const portrait = page.locator("#philosophy img");
  await portrait.scrollIntoViewIfNeeded();
  await portrait.tap();
  await expect.poll(() => eventsNamed(sent, EVENT.deadClick).map((payload) => payload.data?.input)).toEqual(["touch"]);

  await page.locator("#faq").getByRole("button").first().tap();
  await expect.poll(() => eventsNamed(sent, EVENT.faqOpen).map((payload) => payload.data?.input)).toEqual(["touch"]);
  await context.close();
});

test("sends the session data once, and one speed report per page, none while reading", async ({ page, baseURL }) => {
  const { sent } = await openAsLiveSite(page, baseURL, "/about");
  await allowStatistics(page);
  await expect.poll(() => ofType(sent, "identify").length).toBe(1);
  // Desktop Chrome and Firefox have 1 pixel per CSS pixel, Desktop Safari 2.
  const ratio = await page.evaluate(() => window.devicePixelRatio);
  const [session] = ofType(sent, "identify");
  // The site's version is the tag of every call, and one of the session properties as well.
  expect(session?.payload.tag).toMatch(/^\d+\.\d+\.\d+$/);
  expect(session?.payload.data).toMatchObject({
    viewport: "1280px or wider",
    pixelRatio: ratio >= 1.75 ? "2x" : "1x",
    themeSource: "system",
    inApp: "none",
    version: session?.payload.tag,
  });

  // Reading moves the hash (useSectionHash): not a new page, so the tracker's speed report waits.
  await page.mouse.wheel(0, 1500);
  await page.mouse.wheel(0, 1500);
  await expect.poll(() => new URL(page.url()).hash).not.toBe("");
  await page.waitForTimeout(500);
  expect(ofType(sent, "performance")).toEqual([]);

  // A new view sends the report of the page left, with its load metrics: the browser loaded that page.
  await page.locator('nav[aria-label="Primary"]').getByRole("link", { name: "Work", exact: true }).click();
  await expect.poll(() => ofType(sent, "performance").length).toBe(1);
  const [about] = ofType(sent, "performance");
  expect(about?.payload).toMatchObject({ url: SITE + "/about", title: "About - Karolina Kita" });
  expect(about?.payload.ttfb).toEqual(expect.any(Number));

  // Hiding the tab sends the next one's, without load metrics: that page did not load.
  await page.evaluate(() => {
    Object.defineProperty(document, "visibilityState", { value: "hidden", configurable: true });
    document.dispatchEvent(new Event("visibilitychange"));
  });
  await expect.poll(() => ofType(sent, "performance").length).toBe(2);
  const work = ofType(sent, "performance")[1]?.payload;
  expect(work).toMatchObject({ url: SITE + "/", title: "Karolina Kita - Senior Product Designer" });
  expect(work?.ttfb).toBeUndefined();
  expect(ofType(sent, "identify")).toHaveLength(1);
});

test("counts an address that matches no page, with the page shown instead", async ({ page, baseURL }) => {
  const { sent } = await openAsLiveSite(page, baseURL, "/old-link?utm_source=e2e-test");
  await allowStatistics(page);
  await expect
    .poll(() => eventsNamed(sent, EVENT.pageNotFound).map((payload) => payload.data))
    .toEqual([{ path: "/old-link" }]);
  expect(pageviews(sent).map((call) => call.payload.url)).toEqual([SITE + "/?utm_source=e2e-test"]);
});
