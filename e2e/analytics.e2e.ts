/**
 * Visitor statistics (src/shared/lib/analytics.utils.ts) in real browsers.
 *
 * The production build is served as https://karolina.kita.company: page.route answers those requests
 * from the local preview server. The real Umami script loads from cloud.umami.is (this spec needs the
 * internet), and every call to Umami's collector is caught here, so nothing reaches the Umami account.
 * Checks: what is sent and when, no hash in addresses, no cookies or stored keys, and no script at all
 * on any other host or for a visitor with Global Privacy Control.
 */
import { expect, test, type Page, type Request } from "@playwright/test";

import { EVENT, UMAMI } from "#shared/lib/analytics.utils.ts";

import { THEME_STORAGE_KEY, themeButton, waitForApp } from "./helpers.ts";

const SITE = "https://" + UMAMI.host;
const COLLECTOR = "https://gateway.umami.is/**";

/** One call to Umami's collector, as the tracker posts it. */
interface Sent {
  type: string;
  payload: {
    website: string;
    hostname: string;
    url: string;
    title: string;
    referrer?: string;
    name?: string;
    data?: Record<string, string>;
  };
}

/** The collector answers cross-origin calls, including the browser's preflight. */
const CORS = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "POST, OPTIONS",
  "access-control-allow-headers": "*",
};

/** Serves the local build as the live site and records what the tracker sends. */
async function openAsLiveSite(page: Page, baseURL: string | undefined, path: string): Promise<Sent[]> {
  if (!baseURL) throw new Error("baseURL is not set (playwright.config.ts)");
  await page.route(SITE + "/**", async (route) => {
    const { pathname, search } = new URL(route.request().url());
    const response = await page.context().request.get(baseURL + pathname + search);
    await route.fulfill({ response });
  });
  const sent: Sent[] = [];
  await page.route(COLLECTOR, async (route) => {
    if (route.request().method() === "POST") sent.push(route.request().postDataJSON() as Sent);
    await route.fulfill({ status: 200, headers: CORS, contentType: "application/json", body: "{}" });
  });

  const script = page.waitForResponse(UMAMI.script);
  await page.goto(SITE + path);
  expect((await script).ok(), "the Umami script loads from cloud.umami.is (needs the internet)").toBe(true);
  await waitForApp(page);
  return sent;
}

const pageviews = (sent: readonly Sent[]) => sent.filter((call) => call.payload.name === undefined);
const named = (sent: readonly Sent[]) => sent.flatMap((call) => (call.payload.name ? [call.payload] : []));

/** Umami requests the page made, by URL. */
function umamiRequests(page: Page): string[] {
  const urls: string[] = [];
  page.on("request", (request: Request) => {
    if (request.url().includes("umami.is")) urls.push(request.url());
  });
  return urls;
}

test("counts pages and clicks on the live site, without the hash, and stores nothing", async ({
  page,
  context,
  baseURL,
}) => {
  const sent = await openAsLiveSite(page, baseURL, "/about?ref=e2e-test#faq");

  // The first page and its tag, with the query but without the hash.
  await expect.poll(() => sent.length).toBe(2);
  const [landing, tag] = sent;
  expect(landing?.payload).toMatchObject({
    website: UMAMI.websiteId,
    hostname: UMAMI.host,
    url: SITE + "/about?ref=e2e-test",
    title: "About - Karolina Kita",
  });
  expect(landing?.payload.name).toBeUndefined();
  expect(tag?.payload).toMatchObject({
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

  // No hash in any address sent, no cookies, nothing stored.
  for (const call of sent) expect(call.payload.url).not.toContain("#");
  expect(await context.cookies()).toEqual([]);
  const storage = () =>
    page.evaluate(() => ({ local: Object.keys(localStorage), session: Object.keys(sessionStorage) }));
  expect(await storage()).toEqual({ local: [], session: [] });

  // Picking a theme is counted and stores only the theme choice.
  await themeButton(page, "dark").click();
  await expect.poll(() => named(sent).at(-1)).toMatchObject({ name: EVENT.themeSwitch, data: { theme: "dark" } });
  expect(await storage()).toEqual({ local: [THEME_STORAGE_KEY], session: [] });
});

test("loads nothing on any other host (local preview, branch deploys)", async ({ page }) => {
  const requests = umamiRequests(page);
  await page.goto("/about?ref=e2e-test");
  await waitForApp(page);
  await page.locator("#faq").getByRole("button").first().click();
  await page.waitForTimeout(500);
  expect(requests).toEqual([]);
  await expect(page.locator(`script[src="${UMAMI.script}"]`)).toHaveCount(0);
});

test("loads nothing for a visitor with Global Privacy Control", async ({ page, baseURL }) => {
  await page.addInitScript(() => {
    Object.defineProperty(Navigator.prototype, "globalPrivacyControl", { get: () => true, configurable: true });
  });
  const requests = umamiRequests(page);
  if (!baseURL) throw new Error("baseURL is not set (playwright.config.ts)");
  await page.route(SITE + "/**", async (route) => {
    const { pathname, search } = new URL(route.request().url());
    await route.fulfill({ response: await page.context().request.get(baseURL + pathname + search) });
  });
  await page.goto(SITE + "/");
  await waitForApp(page);
  await page.waitForTimeout(500);
  expect(requests).toEqual([]);
  await expect(page.locator(`script[src="${UMAMI.script}"]`)).toHaveCount(0);
});
