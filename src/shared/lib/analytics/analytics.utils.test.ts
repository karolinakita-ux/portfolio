import { fireEvent } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, expectTypeOf, it, vi } from "vitest";

import { EVENT, UMAMI } from "./analytics.constants.ts";
import type { AnalyticsEvent, AnalyticsSite, EventData, UmamiPayload } from "./analytics.types.ts";
import type * as Analytics from "./analytics.utils.ts";

/** The live site, as src/main.tsx describes it in a production build there. */
const LIVE: AnalyticsSite = { production: true, base: "/", hostname: "karolina.kita.company", privacy: {} };

/** What the tracker fills in before our helpers edit the payload (url and title as the tracker last saw them). */
const TRACKER_PAYLOAD: UmamiPayload = {
  website: "19c960f0-bad6-40f5-b5cb-75dca6dc292f",
  hostname: "karolina.kita.company",
  screen: "1280x800",
  language: "en-GB",
  title: "Landing page title",
  url: "https://karolina.kita.company/",
  referrer: "https://www.linkedin.com/",
};

/** The module keeps its state for the page's lifetime: each test gets a fresh copy. */
let analytics: typeof Analytics;

beforeEach(async () => {
  vi.resetModules();
  analytics = await import("./analytics.utils.ts");
});

afterEach(() => {
  analytics.stopAnalytics(); // its listeners stay on the document otherwise
  vi.useRealTimers();
  document.body.innerHTML = "";
  Reflect.deleteProperty(document, "visibilityState");
  for (const script of document.querySelectorAll("script")) script.remove();
  Reflect.deleteProperty(window, "umami");
  document.title = "";
});

const umamiScript = () => document.querySelector<HTMLScriptElement>(`script[src="${UMAMI.script}"]`);

/** Installs a fake window.umami and fires the script's load event; returns the payloads it was sent. */
const loadTracker = (): UmamiPayload[] => {
  const sent: UmamiPayload[] = [];
  window.umami = { track: (build) => sent.push(build(TRACKER_PAYLOAD)) };
  umamiScript()?.dispatchEvent(new Event("load"));
  return sent;
};

const go = (url: string, title = "Page") => {
  window.history.replaceState(null, "", url);
  document.title = title;
};

describe("analyticsAllowed", () => {
  it("allows only a production build at the site root on karolina.kita.company", () => {
    expect(analytics.analyticsAllowed(LIVE)).toBe(true);
    expect(analytics.analyticsAllowed({ ...LIVE, production: false })).toBe(false); // yarn dev
    expect(analytics.analyticsAllowed({ ...LIVE, base: "./" })).toBe(false); // the claude.ai artifact build
    expect(analytics.analyticsAllowed({ ...LIVE, hostname: "develop--karolina-kita.netlify.app" })).toBe(false);
    expect(analytics.analyticsAllowed({ ...LIVE, hostname: "localhost" })).toBe(false);
    expect(analytics.analyticsAllowed({ ...LIVE, hostname: "www.karolina.kita.company" })).toBe(false);
  });

  it("respects Do Not Track and Global Privacy Control", () => {
    expect(analytics.analyticsAllowed({ ...LIVE, privacy: { doNotTrack: "1" } })).toBe(false);
    expect(analytics.analyticsAllowed({ ...LIVE, privacy: { doNotTrack: "yes" } })).toBe(false);
    expect(analytics.analyticsAllowed({ ...LIVE, privacy: { globalPrivacyControl: true } })).toBe(false);
    expect(analytics.analyticsAllowed({ ...LIVE, privacy: { doNotTrack: "0", globalPrivacyControl: false } })).toBe(
      true,
    );
    expect(analytics.analyticsAllowed({ ...LIVE, privacy: { doNotTrack: null } })).toBe(true);
  });
});

describe("startAnalytics", () => {
  it("adds the Umami script once, with page tracking off and the domain, hash and Do Not Track guards", () => {
    expect(analytics.startAnalytics(LIVE)).toBe(true);
    expect(analytics.startAnalytics(LIVE)).toBe(true);
    expect(document.querySelectorAll("script")).toHaveLength(1);

    const script = umamiScript();
    expect(script?.parentElement).toBe(document.head);
    const attributes = Object.fromEntries(
      (script?.getAttributeNames() ?? []).map((name) => [name, script?.getAttribute(name)]),
    );
    expect(attributes).toEqual({
      src: "https://cloud.umami.is/script.js",
      "data-website-id": "19c960f0-bad6-40f5-b5cb-75dca6dc292f",
      "data-domains": "karolina.kita.company",
      "data-auto-track": "false",
      "data-exclude-hash": "true",
      "data-do-not-track": "true",
    });
  });

  it("tags every call with the site's version, so the dashboard can compare releases", () => {
    analytics.startAnalytics({ ...LIVE, release: "3.14.0" });
    expect(umamiScript()?.dataset.tag).toBe("3.14.0");
  });

  it("adds nothing off the live site or for a visitor who opted out", () => {
    expect(analytics.startAnalytics({ ...LIVE, base: "./" })).toBe(false);
    expect(analytics.startAnalytics({ ...LIVE, privacy: { globalPrivacyControl: true } })).toBe(false);
    expect(document.querySelector("script")).toBeNull();
  });
});

describe("trackPageview and track", () => {
  it("do nothing before startAnalytics, and never touch window.umami off the live site", () => {
    const track = vi.fn();
    window.umami = { track };
    analytics.startAnalytics({ ...LIVE, production: false });
    analytics.trackPageview();
    analytics.track(EVENT.themeSwitch, { theme: "dark" });
    expect(track).not.toHaveBeenCalled();
  });

  it("queue calls until the script has loaded, then send them in order", () => {
    analytics.startAnalytics(LIVE);
    go("/about", "About - Karolina Kita");
    analytics.trackPageview();
    analytics.track(EVENT.faqOpen, { question: "tools" });

    const sent = loadTracker();
    expect(sent.map((payload) => payload.name)).toEqual([undefined, "faq-open"]);
    analytics.track(EVENT.faqOpen, { question: "process" });
    expect(sent).toHaveLength(3);
  });

  it("send the page as it was when the call was made: address without the hash, and its title", () => {
    analytics.startAnalytics(LIVE);
    go("/about?ref=acme#career", "About - Karolina Kita");
    analytics.trackPageview();
    go("/contact", "Contact - Karolina Kita"); // the visitor moved on before the script arrived

    const [pageview] = loadTracker();
    expect(pageview).toEqual({
      ...TRACKER_PAYLOAD,
      url: window.location.origin + "/about?ref=acme",
      title: "About - Karolina Kita",
    });
  });

  it("keep the landing referrer on the first page, then refer each page to the one before it", () => {
    analytics.startAnalytics(LIVE);
    const sent = loadTracker();

    go("/");
    analytics.trackPageview();
    go("/work/meetestim#me-research");
    analytics.trackPageview();
    analytics.track(EVENT.imageOpen, { case: "case-meetestim", image: "me-dashboard" });

    expect(sent.map((payload) => payload.referrer)).toEqual(["https://www.linkedin.com/", "/", "/"]);
    expect(sent.map((payload) => payload.url)).toEqual([
      window.location.origin + "/",
      window.location.origin + "/work/meetestim",
      window.location.origin + "/work/meetestim",
    ]);
  });

  it("send events with their name and properties", () => {
    analytics.startAnalytics(LIVE);
    const sent = loadTracker();
    go("/work/automotive", "Automotive");
    analytics.track(EVENT.caseNav, { from: "case-automotive", to: "case-meetestim", direction: "next" });
    expect(sent).toEqual([
      {
        ...TRACKER_PAYLOAD,
        url: window.location.origin + "/work/automotive",
        title: "Automotive",
        name: "case-nav",
        data: { from: "case-automotive", to: "case-meetestim", direction: "next" },
      },
    ]);
  });

  it("count a tagged link (ref, else utm_source) once, with the first pageview", () => {
    analytics.startAnalytics(LIVE);
    const sent = loadTracker();
    go("/?utm_source=newsletter&ref=%20acme%20");
    analytics.trackPageview();
    go("/about?ref=acme");
    analytics.trackPageview();

    expect(sent.map((payload) => [payload.name, payload.data])).toEqual([
      [undefined, undefined],
      ["link-ref", { ref: "acme" }],
      [undefined, undefined],
    ]);
  });

  it("use utm_source when there is no ref, and cap a tag's length", () => {
    analytics.startAnalytics(LIVE);
    const sent = loadTracker();
    go("/?utm_source=" + "x".repeat(300));
    analytics.trackPageview();
    expect(sent[1]?.data).toEqual({ ref: "x".repeat(100) });
  });

  it("drop queued calls and stop when the script is blocked", () => {
    analytics.startAnalytics(LIVE);
    analytics.trackPageview();
    umamiScript()?.dispatchEvent(new Event("error"));

    const sent = loadTracker(); // a tracker that shows up anyway is not used
    analytics.trackPageview();
    expect(sent).toEqual([]);
  });

  it("keep at most 50 calls while the script is loading", () => {
    analytics.startAnalytics(LIVE);
    for (let i = 0; i < 80; i++) analytics.track(EVENT.sectionLinkCopy, { section: "career" });
    expect(loadTracker()).toHaveLength(50);
  });
});

describe("events", () => {
  it("have kebab-case names within Umami's 50-character limit", () => {
    for (const name of Object.values(EVENT)) expect(name).toMatch(/^[a-z]+(?:-[a-z]+)*$/);
    for (const name of Object.values(EVENT)) expect(name.length).toBeLessThanOrEqual(50);
  });

  // eslint-disable-next-line vitest/expect-expect -- type-level checks (expectTypeOf, @ts-expect-error)
  it("tie every event name to its properties", () => {
    expectTypeOf<EventData[typeof EVENT.caseOpen]>().toEqualTypeOf<{
      case: EventData["case-nav"]["from"];
      from: "card-link" | "thumbnail";
    }>();
    expectTypeOf<keyof EventData>().toEqualTypeOf<AnalyticsEvent>();
    // @ts-expect-error - not an event
    analytics.track("page-scroll", { depth: "50" });
    // @ts-expect-error - figma-click has no target
    analytics.track(EVENT.figmaClick, { target: "hero" });
    // @ts-expect-error - case takes a view id
    analytics.track(EVENT.caseOpen, { case: "meetestim", from: "thumbnail" });
  });
});

describe("time on page", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    Object.defineProperty(document, "visibilityState", { value: "visible", configurable: true });
  });

  it("is sent as the page being left when the view changes, before the next pageview", () => {
    analytics.startAnalytics(LIVE);
    const sent = loadTracker();
    go("/about?ref=acme#career", "About - Karolina Kita");
    analytics.trackPageview();
    vi.advanceTimersByTime(5000);
    go("/contact", "Contact - Karolina Kita");
    analytics.trackPageview();

    expect(sent.map((payload) => payload.name)).toEqual([undefined, "link-ref", "time-on-page", undefined]);
    expect(sent[2]).toEqual({
      ...TRACKER_PAYLOAD,
      url: window.location.origin + "/about?ref=acme",
      title: "About - Karolina Kita",
      name: "time-on-page",
      data: { time: "under 10 s", seconds: 5, scroll: "100%" }, // jsdom has no layout: the whole page is in view
    });
  });

  it("is sent when the tab hides, and never after statistics are switched off", () => {
    analytics.startAnalytics(LIVE);
    const sent = loadTracker();
    go("/work/automotive", "Automotive");
    analytics.trackPageview();
    vi.advanceTimersByTime(20_000);
    fireEvent.keyDown(document.body, { key: "ArrowDown" }); // still reading: without it, the count stops at 30 s
    vi.advanceTimersByTime(22_000);
    Object.defineProperty(document, "visibilityState", { value: "hidden", configurable: true });
    document.dispatchEvent(new Event("visibilitychange"));
    expect(sent.at(-1)).toMatchObject({ name: "time-on-page", data: { time: "30 s - 1 min", seconds: 42 } });

    Object.defineProperty(document, "visibilityState", { value: "visible", configurable: true });
    document.dispatchEvent(new Event("visibilitychange"));
    vi.advanceTimersByTime(10_000);
    analytics.stopAnalytics();
    window.dispatchEvent(new Event("pagehide"));
    expect(sent).toHaveLength(2);
  });
});

describe("clicks", () => {
  it("carry the input behind them: a tap, a click or a key; a tagged link does not", () => {
    vi.useFakeTimers();
    analytics.startAnalytics(LIVE);
    const sent = loadTracker();
    go("/?ref=acme");
    fireEvent.pointerDown(document.body, { pointerType: "touch" });
    analytics.trackPageview(); // the visitor's tap on "Allow statistics" counts the page and its tag
    analytics.track(EVENT.themeSwitch, { theme: "dark" });
    fireEvent.keyDown(document.body, { key: "Enter" });
    analytics.track(EVENT.faqOpen, { question: "tools" });
    vi.advanceTimersByTime(2000); // no input in the last second: none is named
    analytics.track(EVENT.sectionLinkCopy, { section: "faq" });

    expect(sent.map((payload) => [payload.name, payload.data])).toEqual([
      [undefined, undefined],
      ["link-ref", { ref: "acme" }],
      ["theme-switch", { theme: "dark", input: "touch" }],
      ["faq-open", { question: "tools", input: "keyboard" }],
      ["section-link-copy", { section: "faq" }],
    ]);
  });

  it("on something that does nothing are counted only while statistics are on", () => {
    document.body.innerHTML = `<main><section id="faq" data-anchor=""><h2 id="faq-title">FAQ</h2></section></main>`;
    const heading = document.getElementById("faq-title") ?? document.body;
    const click = () => {
      fireEvent.pointerDown(heading, { pointerType: "mouse" });
      fireEvent.click(heading, { detail: 1 });
    };
    click();
    analytics.startAnalytics(LIVE);
    const sent = loadTracker();
    analytics.trackPageview();
    click();
    analytics.stopAnalytics();
    click();

    expect(sent.map((payload) => [payload.name, payload.data])).toEqual([
      [undefined, undefined],
      ["dead-click", { element: "heading", area: "faq", label: "FAQ", input: "mouse" }],
    ]);
  });

  it("are counted once after statistics go off and on again: stopping removes the listeners", () => {
    document.body.innerHTML = `<main><p id="text">Text</p></main>`;
    const text = document.getElementById("text") ?? document.body;
    analytics.startAnalytics(LIVE);
    analytics.stopAnalytics();
    analytics.startAnalytics(LIVE);
    const sent = loadTracker();
    fireEvent.pointerDown(text, { pointerType: "mouse" });
    fireEvent.click(text, { detail: 1 });
    expect(sent.map((payload) => payload.name)).toEqual(["dead-click"]);
  });
});
