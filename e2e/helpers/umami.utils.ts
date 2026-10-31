/**
 * Visitor statistics in real browsers (analytics.e2e.ts, analytics-links.e2e.ts). The production build is served as
 * https://karolina.kita.company: page.route answers those requests from the local preview server. The real Umami
 * script comes from cloud.umami.is (these specs need the internet), and every call to Umami's collector is caught
 * here, so nothing reaches the Umami account.
 */
import { mkdir, readFile, rename, rm, stat, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { expect, type Locator, type Page, type Request } from "@playwright/test";

import { UMAMI } from "#shared/lib/analytics/analytics.constants.ts";

import { COLLECTOR_CORS, CONSENT_BOX, LIVE_SITE, TRACKER_COPY, UMAMI_COLLECTOR } from "./helpers.constants.ts";
import type { LiveSiteOptions, UmamiCall } from "./helpers.types.ts";
import { waitForApp } from "./page.utils.ts";

/** Umami requests the page makes from now on (the script, the collector), by URL. */
export function umamiRequests(page: Page): string[] {
  const urls: string[] = [];
  page.on("request", (request: Request) => {
    if (request.url().includes("umami.is")) urls.push(request.url());
  });
  return urls;
}

/** A reload or a closed page can drop a request still in flight (an image preload, a last report): nothing to answer. */
const unlessGone = (error: unknown) => {
  if (!String(error).includes("disposed")) throw error;
};

/** The last copy of the tracker and its age, or null. */
async function savedTracker(): Promise<{ source: string; minutes: number } | null> {
  try {
    const { mtimeMs } = await stat(TRACKER_COPY.file);
    return { source: await readFile(TRACKER_COPY.file, "utf8"), minutes: Math.round((Date.now() - mtimeMs) / 60_000) };
  } catch {
    return null; // no copy yet
  }
}

async function downloadTracker(): Promise<string> {
  const response = await fetch(UMAMI.script);
  if (!response.ok) throw new Error(`cloud.umami.is answered ${String(response.status)} for the Umami script`);
  const source = await response.text();
  // Written whole under another name, then renamed: another worker never reads half a file.
  const part = `${TRACKER_COPY.file}.${String(process.pid)}`;
  await mkdir(dirname(TRACKER_COPY.file), { recursive: true });
  await writeFile(part, source);
  await rename(part, TRACKER_COPY.file).catch(() => rm(part, { force: true })); // another worker's copy is there
  return source;
}

async function fetchTracker(): Promise<string> {
  const saved = await savedTracker();
  if (saved && saved.minutes < TRACKER_COPY.maxAgeMinutes) return saved.source;
  try {
    return await downloadTracker();
  } catch (error) {
    if (!saved) throw error;
    console.warn(`${String(error)}: serving the copy from ${String(saved.minutes)} minutes ago`);
    return saved.source;
  }
}

let liveTracker: Promise<string> | undefined;

/**
 * The live tracker script, served to every page from a copy fetched at most once an hour (TRACKER_COPY), shared by
 * workers and runs; when a new fetch is refused, the last copy. A request per test, or per worker that Playwright
 * restarts after a failed test, trips the bot check in front of cloud.umami.is: it then answers 403 with a challenge
 * for about ten minutes, to browsers and Node alike.
 */
function trackerSource(): Promise<string> {
  liveTracker ??= fetchTracker();
  return liveTracker;
}

/**
 * Serves the local build as the live site and opens `path` there; returns what the tracker sends (every call to the
 * collector, in the order they arrive) and every Umami request. The routes stay for later views and reloads.
 */
export async function openAsLiveSite(
  page: Page,
  baseURL: string | undefined,
  path: string,
  { referer }: LiveSiteOptions = {},
) {
  if (!baseURL) throw new Error("baseURL is not set (playwright.config.ts)");
  await page.route(LIVE_SITE + "/**", async (route) => {
    const { pathname, search } = new URL(route.request().url());
    const response = await page.context().request.get(baseURL + pathname + search);
    await route.fulfill({ response }).catch(unlessGone);
  });
  // The page still requests the script from its address (the request log and allowStatistics see it).
  await page.route(UMAMI.script, async (route) => {
    const answer = await trackerSource().then(
      (body) => ({ status: 200, contentType: "text/javascript", body }),
      (error: unknown) => ({ status: 503, contentType: "text/plain", body: String(error) }),
    );
    await route.fulfill(answer).catch(unlessGone);
  });
  const sent: UmamiCall[] = [];
  await page.route(UMAMI_COLLECTOR, async (route) => {
    if (route.request().method() === "POST") sent.push(route.request().postDataJSON() as UmamiCall);
    const answer = { status: 200, headers: COLLECTOR_CORS, contentType: "application/json", body: "{}" };
    await route.fulfill(answer).catch(unlessGone);
  });
  const requests = umamiRequests(page);
  await page.goto(LIVE_SITE + path, { referer });
  await waitForApp(page);
  return { sent, requests };
}

export const consentBox = (page: Page): Locator => page.getByRole("region", { name: CONSENT_BOX });

/**
 * Answers "Allow statistics" and waits for the real script: in the consent box, or `within` another part of the page
 * (the switch in the privacy page's main content).
 */
export async function allowStatistics(page: Page, within: Locator = consentBox(page)): Promise<void> {
  const script = page.waitForResponse(UMAMI.script);
  await within.getByRole("button", { name: "Allow statistics" }).click();
  expect((await script).ok(), "the Umami script loads from cloud.umami.is (needs the internet)").toBe(true);
}

/** Answers "No, thanks" in the consent box. */
export async function declineStatistics(page: Page): Promise<void> {
  await consentBox(page).getByRole("button", { name: "No, thanks" }).click();
  await expect(consentBox(page)).toHaveCount(0);
}

/** Pageviews: events without a name. */
export const pageviews = (sent: readonly UmamiCall[]) =>
  sent.filter((call) => call.type === "event" && call.payload.name === undefined);

/** Named events, as their payloads. */
export const named = (sent: readonly UmamiCall[]) => sent.flatMap((call) => (call.payload.name ? [call.payload] : []));

/** Named events with this name. */
export const eventsNamed = (sent: readonly UmamiCall[], name: string) =>
  named(sent).flatMap((payload) => (payload.name === name ? [payload] : []));

export const ofType = (sent: readonly UmamiCall[], type: UmamiCall["type"]) =>
  sent.filter((call) => call.type === type);
