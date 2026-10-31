/**
 * Tagged links in the visitor statistics, in real browsers (docs/analytics.md, Tagged links). A visit opened from a
 * link with ?ref= or UTM parameters (a job application's /cv?ref=acme, a profile's ?ref=linkedin-profile, the CV
 * PDF's ?utm_medium=cv-pdf, a copied section link) reaches Umami with its tag, and only once the visitor allows
 * statistics, on whichever page that happens. The local build is served as the live site with the real tracker, and
 * every request it makes is caught (helpers/umami.utils.ts): the pageviews' addresses and referrers, link-ref, the
 * session data's ref, and the first page's referrer on every call about that page, time on it included. Before
 * consent, after a no, and with Do Not Track or Global Privacy Control, the script never loads and nothing goes, also
 * while the visitor browses.
 */
import { expect, test, type Page } from "@playwright/test";

import { CV_PDF_ATTRIBUTE } from "#features/cv/cv.constants.ts";
import { EVENT, UMAMI } from "#shared/lib/analytics/analytics.constants.ts";
import { VIEW, VIEW_PATHS } from "#shared/lib/routes/routes.constants.ts";

import { LIVE_SITE } from "./helpers/helpers.constants.ts";
import type { UmamiCall } from "./helpers/helpers.types.ts";
import { navLink, waitForApp } from "./helpers/page.utils.ts";
import {
  allowStatistics,
  consentBox,
  declineStatistics,
  eventsNamed,
  ofType,
  openAsLiveSite,
  pageviews,
} from "./helpers/umami.utils.ts";

interface Pageview {
  url: string;
  referrer: string | undefined;
}

interface LinkRef {
  url: string;
  data: Record<string, string> | undefined;
}

/** What reached Umami about where the visit came from. */
interface Tagged {
  /** Each pageview's address and referrer. */
  pageviews: Pageview[];
  /** Each link-ref event's page and properties. */
  linkRefs: LinkRef[];
  /** Each session data call's ref; null when it has none. */
  sessionRefs: Array<string | null>;
}

const tagged = (sent: readonly UmamiCall[]): Tagged => ({
  pageviews: pageviews(sent).map(({ payload }) => ({ url: payload.url, referrer: payload.referrer })),
  linkRefs: eventsNamed(sent, EVENT.linkRef).map(({ url, data }) => ({ url, data })),
  sessionRefs: ofType(sent, "identify").map(({ payload }) => payload.data?.ref ?? null),
});

/** Long enough for a call sent twice to arrive: the tracker posts each one at once. */
const SETTLE_MS = 600;

/** Waits until Umami got exactly this, then a little longer, and checks that nothing more came. */
async function expectSent(page: Page, calls: () => readonly UmamiCall[], expected: Tagged): Promise<void> {
  await expect.poll(() => tagged(calls())).toEqual(expected);
  await page.waitForTimeout(SETTLE_MS);
  expect(tagged(calls())).toEqual(expected);
}

/** The first page of a visit and its tag: one pageview, link-ref once (only with a tag), the session data once. */
const firstPage = (url: string, ref: string | null, referrer = ""): Tagged => ({
  pageviews: [{ url, referrer }],
  linkRefs: ref === null ? [] : [{ url, data: { ref } }],
  sessionRefs: [ref],
});

/** Every call carries its page's address with exactly this query (the tag and UTM, as kept) and no hash. */
function expectQueryEverywhere(sent: readonly UmamiCall[], query: string): void {
  expect(sent.length).toBeGreaterThan(0);
  for (const { type, payload } of sent) {
    const url = new URL(payload.url);
    expect(url.search + url.hash, `${type} ${payload.name ?? ""} at ${payload.url}`).toBe(query);
  }
}

/**
 * Every call about this page carries the referrer its pageview had, time on page included: that one goes when the
 * visitor moves on, after the address changed, when the tracker's own referrer names the page itself.
 */
function expectReferrerOnPage(sent: readonly UmamiCall[], url: string, referrer: string): void {
  const onPage = sent.filter(({ payload }) => payload.url === url);
  expect(eventsNamed(onPage, EVENT.timeOnPage), `time on ${url}`).toHaveLength(1);
  for (const { type, payload } of onPage) expect(payload.referrer, `${type} ${payload.name ?? ""}`).toBe(referrer);
}

/** Hides the tab, as switching to another tab or app does: time on page and the speed report would go now. */
const hideTab = (page: Page) =>
  page.evaluate(() => {
    Object.defineProperty(document, "visibilityState", { value: "hidden", configurable: true });
    document.dispatchEvent(new Event("visibilitychange"));
  });

/** A short visit: views from the menu, a FAQ question, scrolling, Back, and a hidden tab at the end. */
async function browse(page: Page): Promise<void> {
  await navLink(page, "About").click();
  await page.locator("#faq").getByRole("button").first().click();
  await page.mouse.wheel(0, 2000);
  await navLink(page, "Contact").click();
  await page.goBack();
  await hideTab(page);
  await page.waitForTimeout(800);
}

/** The tracker never came: no script tag and no window.umami. */
async function expectNoTracker(page: Page): Promise<void> {
  await expect(page.locator(`script[src="${UMAMI.script}"]`)).toHaveCount(0);
  expect(await page.evaluate(() => "umami" in window)).toBe(false);
}

const footerLink = (page: Page, name: string) => page.getByRole("contentinfo").getByRole("link", { name, exact: true });

/** The address a click in the menu opens: the view's path with the query kept (urlForView). */
const NEXT_PATH = { About: VIEW_PATHS[VIEW.about], Work: VIEW_PATHS[VIEW.work] } as const;

interface Landing {
  what: string;
  /** The link the visitor follows. */
  link: string;
  /** The first page's address as Umami gets it: the link tag and UTM parameters, no hash, no click id. */
  counted: string;
  /** The tag link-ref and the session data carry; null when the link has none. */
  ref: string | null;
  /** The view the visitor opens next from the menu. */
  next: keyof typeof NEXT_PATH;
  /** The page on another site the link was on (document.referrer), and the referrer Umami gets: without its query. */
  from?: { referer: string; referrer: string };
}

const LANDINGS: readonly Landing[] = [
  {
    what: "a tagged link on LinkedIn",
    link: "/?ref=linkedin-profile",
    counted: "/?ref=linkedin-profile",
    ref: "linkedin-profile",
    next: "About",
    from: { referer: "https://www.linkedin.com/feed/?trk=e2e-test", referrer: "https://www.linkedin.com/feed/" },
  },
  {
    what: "the CV PDF's portfolio link",
    link: "/?utm_medium=cv-pdf",
    counted: "/?utm_medium=cv-pdf",
    ref: null,
    next: "About",
  },
  {
    what: "a UTM link with a source",
    link: "/?utm_source=newsletter&utm_medium=email",
    counted: "/?utm_source=newsletter&utm_medium=email",
    ref: "newsletter",
    next: "About",
  },
  {
    what: "a copied section link",
    link: "/about?ref=section-link#career",
    counted: "/about?ref=section-link",
    ref: "section-link",
    next: "Work",
  },
  {
    what: "a section link that passes the copier's tag on",
    link: "/about?ref=acme&utm_medium=section-link#career",
    counted: "/about?ref=acme&utm_medium=section-link",
    ref: "acme",
    next: "Work",
  },
  {
    what: "a tagged link with click ids",
    link: "/?ref=x&fbclid=1&gclid=2",
    counted: "/?ref=x",
    ref: "x",
    next: "About",
  },
  { what: "the CV's old address", link: "/resume?ref=acme", counted: "/cv?ref=acme", ref: "acme", next: "About" },
];

test.describe("before consent", () => {
  for (const link of ["/?ref=linkedin-profile", "/cv?ref=acme", "/?utm_medium=cv-pdf"]) {
    test(`${link}: no script and no request to Umami while the visitor browses, and the tag stays in the address`, async ({
      page,
      baseURL,
    }) => {
      const { sent, requests } = await openAsLiveSite(page, baseURL, link);
      await expect(consentBox(page)).toBeVisible();
      await browse(page);
      expect(new URL(page.url()).search).toBe(new URL(LIVE_SITE + link).search);
      await expect(consentBox(page)).toBeVisible();
      expect(requests).toEqual([]);
      expect(sent).toEqual([]);
      await expectNoTracker(page);
    });
  }
});

test.describe("allowed on the first page", () => {
  for (const { what, link, counted, ref, next, from } of LANDINGS) {
    test(`${what} (${link}): every call keeps the tag and the first page's referrer, link-ref and session data go once`, async ({
      page,
      baseURL,
    }) => {
      const { sent } = await openAsLiveSite(page, baseURL, link, { referer: from?.referer });
      // The other site's page reached the browser with its query; Umami gets it without (none for a typed link).
      expect(await page.evaluate(() => document.referrer)).toBe(from?.referer ?? "");
      await allowStatistics(page);
      const landing = firstPage(LIVE_SITE + counted, ref, from?.referrer);
      await expectSent(page, () => sent, landing);

      // The next view keeps the query in the address bar, so its pageview has the tag as well; no second link-ref.
      // expectSent has waited over half a second, so the time on the first page goes (a shorter stretch would not).
      await navLink(page, next).click();
      const { search } = new URL(LIVE_SITE + counted);
      await expectSent(page, () => sent, {
        ...landing,
        pageviews: [...landing.pageviews, { url: LIVE_SITE + NEXT_PATH[next] + search, referrer: counted }],
      });
      expectReferrerOnPage(sent, LIVE_SITE + counted, from?.referrer ?? "");
      expectQueryEverywhere(sent, search);
      expect(JSON.stringify(sent)).not.toMatch(/fbclid|gclid|#career/);
    });
  }
});

test.describe("allowed later", () => {
  test("landed on /cv?ref=acme, allowed in the consent box on About: About counts with the tag, /cv never", async ({
    page,
    baseURL,
  }) => {
    const { sent, requests } = await openAsLiveSite(page, baseURL, "/cv?ref=acme");
    await navLink(page, "About").click();
    await expect(page).toHaveURL(LIVE_SITE + "/about?ref=acme");
    expect(requests).toEqual([]);

    await allowStatistics(page);
    await expectSent(page, () => sent, firstPage(LIVE_SITE + "/about?ref=acme", "acme"));
    // Nothing about the page before consent: no time on /cv, no queued pageview.
    expect(sent.filter(({ payload }) => payload.url.includes("/cv"))).toEqual([]);
    expectQueryEverywhere(sent, "?ref=acme");
  });

  test("landed on /cv?ref=acme, allowed with the switch on /privacy: /privacy counts with the tag", async ({
    page,
    baseURL,
  }) => {
    const { sent, requests } = await openAsLiveSite(page, baseURL, "/cv?ref=acme");
    await navLink(page, "About").click();
    await footerLink(page, "Privacy").click();
    await expect(page).toHaveURL(LIVE_SITE + "/privacy?ref=acme");
    expect(requests).toEqual([]);

    await allowStatistics(page, page.getByRole("main"));
    await expect(consentBox(page)).toHaveCount(0);
    await expectSent(page, () => sent, firstPage(LIVE_SITE + "/privacy?ref=acme", "acme"));
    expectQueryEverywhere(sent, "?ref=acme");
  });

  test("a visitor who allowed earlier opens the CV PDF's link: the UTM report counts it, the company tag stays", async ({
    page,
    baseURL,
  }) => {
    const { sent } = await openAsLiveSite(page, baseURL, "/cv?ref=acme");
    await allowStatistics(page);
    await expectSent(page, () => sent, firstPage(LIVE_SITE + "/cv?ref=acme", "acme"));

    // The address the PDF's portfolio link opens (scripts/cv-pdf.ts puts this attribute's value in the PDF).
    const pdfLink = await page.locator(`a[${CV_PDF_ATTRIBUTE.href}]`).getAttribute(CV_PDF_ATTRIBUTE.href);
    expect(pdfLink).toBe(LIVE_SITE + "/?utm_medium=cv-pdf");
    const before = sent.length;
    await page.goto(pdfLink ?? "");
    await waitForApp(page);
    // A new page load with the stored yes: its pageview has the UTM, and neither link-ref nor a session ref goes,
    // so Umami keeps the session's ref "acme".
    await expectSent(page, () => sent.slice(before), firstPage(LIVE_SITE + "/?utm_medium=cv-pdf", null));
    expect(ofType(sent.slice(before), "identify")[0]?.payload.data).not.toHaveProperty("ref");
  });
});

test.describe("never allowed", () => {
  test("a no in the consent box: nothing loads or goes while the visitor browses, nor after a reload", async ({
    page,
    baseURL,
  }) => {
    const { sent, requests } = await openAsLiveSite(page, baseURL, "/?ref=linkedin-profile");
    await declineStatistics(page);
    await browse(page);
    await page.reload();
    await waitForApp(page);
    await navLink(page, "Work").click();
    await page.waitForTimeout(500);
    await expect(consentBox(page)).toHaveCount(0);
    expect(requests).toEqual([]);
    expect(sent).toEqual([]);
    await expectNoTracker(page);
  });

  const signals = [
    { name: "Do Not Track", property: "doNotTrack", value: "1" },
    { name: "Global Privacy Control", property: "globalPrivacyControl", value: true },
  ] as const;
  for (const { name, property, value } of signals) {
    test(`${name}: nobody is asked, nothing loads or goes, and /privacy says why`, async ({ page, baseURL }) => {
      await page.addInitScript(
        (signal) => {
          Object.defineProperty(Navigator.prototype, signal.property, { get: () => signal.value, configurable: true });
        },
        { property, value },
      );
      const { sent, requests } = await openAsLiveSite(page, baseURL, "/?ref=linkedin-profile");
      await browse(page);
      await footerLink(page, "Privacy").click();
      await expect(page.getByRole("main").getByText(/asks websites not to track you/)).toBeVisible();
      await expect(page.getByRole("button", { name: "Allow statistics" })).toHaveCount(0);
      await expect(consentBox(page)).toHaveCount(0);
      expect(requests).toEqual([]);
      expect(sent).toEqual([]);
      await expectNoTracker(page);
    });
  }
});

test("a tagged visitor who allowed and reloads: the new page load counts with the tag, link-ref once in each", async ({
  page,
  baseURL,
}) => {
  const { sent } = await openAsLiveSite(page, baseURL, "/?ref=linkedin-profile");
  await allowStatistics(page);
  await expectSent(page, () => sent, firstPage(LIVE_SITE + "/?ref=linkedin-profile", "linkedin-profile"));
  await navLink(page, "About").click();
  await expect.poll(() => pageviews(sent).length).toBe(2);

  const before = sent.length;
  await page.reload();
  await waitForApp(page);
  await expect(consentBox(page)).toHaveCount(0);
  const reloaded = firstPage(LIVE_SITE + "/about?ref=linkedin-profile", "linkedin-profile");
  await expectSent(page, () => sent.slice(before), reloaded);

  // Within this page load, a new view is one more pageview, not one more link-ref.
  await navLink(page, "Work").click();
  await expectSent(page, () => sent.slice(before), {
    ...reloaded,
    pageviews: [
      ...reloaded.pageviews,
      { url: LIVE_SITE + "/?ref=linkedin-profile", referrer: "/about?ref=linkedin-profile" },
    ],
  });
  expect(eventsNamed(sent, EVENT.linkRef)).toHaveLength(2);
  expectQueryEverywhere(sent, "?ref=linkedin-profile");
});
