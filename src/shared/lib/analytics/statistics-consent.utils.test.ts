import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { STATISTICS_CHOICE_KEY, STORED_CHOICE, UMAMI } from "./analytics.constants.ts";
import type { AnalyticsSite } from "./analytics.types.ts";
import type * as Analytics from "./analytics.utils.ts";
import type * as Consent from "./statistics-consent.utils.ts";

const LIVE: AnalyticsSite = { production: true, base: "/", hostname: UMAMI.host, privacy: {} };

/** Both modules keep page-lifetime state: fresh copies per test. */
let analytics: typeof Analytics;
let consent: typeof Consent;
/** initStatistics() listens for choices made in other tabs: each test stops the listeners it started. */
const unlisten: Array<() => void> = [];
const init = (site: AnalyticsSite) => {
  unlisten.push(consent.initStatistics(site));
};

beforeEach(async () => {
  vi.resetModules();
  analytics = await import("./analytics.utils.ts");
  consent = await import("./statistics-consent.utils.ts");
});

afterEach(() => {
  for (const stop of unlisten.splice(0)) stop();
  analytics.stopAnalytics(); // its listeners stay on the document otherwise
  for (const script of document.querySelectorAll("script")) script.remove();
  Reflect.deleteProperty(window, "umami");
  Reflect.deleteProperty(navigator, "doNotTrack");
  Reflect.deleteProperty(navigator, "globalPrivacyControl");
});

const umamiScript = () => document.querySelector(`script[src="${UMAMI.script}"]`);
const setSignal = (name: "doNotTrack" | "globalPrivacyControl", value: string | boolean) =>
  Object.defineProperty(navigator, name, { value, configurable: true });

describe("statisticsState", () => {
  it("is unset until the visitor decides, then on or off, and browser with Do Not Track or Global Privacy Control", () => {
    expect(consent.statisticsState()).toBe("unset");
    consent.setStatisticsChoice("on");
    expect(consent.statisticsState()).toBe("on");
    consent.setStatisticsChoice("off");
    expect(consent.statisticsState()).toBe("off");
    setSignal("doNotTrack", "1");
    expect(consent.statisticsState()).toBe("browser");
    Reflect.deleteProperty(navigator, "doNotTrack");
    setSignal("globalPrivacyControl", true);
    expect(consent.statisticsState()).toBe("browser");
  });

  it("ignores a stored value it does not know", () => {
    window.localStorage.setItem(STATISTICS_CHOICE_KEY, "maybe");
    expect(consent.statisticsState()).toBe("unset");
  });

  it("asks again after a yes to the older statistics (a plain on), but keeps a no", () => {
    window.localStorage.setItem(STATISTICS_CHOICE_KEY, "on");
    expect(consent.statisticsState()).toBe("unset");
    init(LIVE);
    expect(umamiScript()).toBeNull();
    expect(consent.consentNeeded()).toBe(true);

    window.localStorage.setItem(STATISTICS_CHOICE_KEY, "off");
    expect(consent.statisticsState()).toBe("off");
    expect(consent.consentNeeded()).toBe(false);
  });
});

describe("consentNeeded", () => {
  it("asks only on the live site, before a choice, and not with Global Privacy Control", () => {
    expect(consent.consentNeeded()).toBe(false); // initStatistics has not run
    init({ ...LIVE, hostname: "localhost" });
    expect(consent.consentNeeded()).toBe(false);
    init(LIVE);
    expect(consent.consentNeeded()).toBe(true);
    setSignal("globalPrivacyControl", true);
    expect(consent.consentNeeded()).toBe(false);
    Reflect.deleteProperty(navigator, "globalPrivacyControl");
    consent.setStatisticsChoice("off");
    expect(consent.consentNeeded()).toBe(false);
  });
});

describe("initStatistics", () => {
  it("loads nothing before consent", () => {
    init(LIVE);
    expect(umamiScript()).toBeNull();
  });

  it("loads the script at once for a visitor who allowed statistics earlier", () => {
    window.localStorage.setItem(STATISTICS_CHOICE_KEY, STORED_CHOICE.on);
    init(LIVE);
    expect(umamiScript()).not.toBeNull();
  });
});

describe("setStatisticsChoice", () => {
  it("on: keeps the choice, loads the script and counts the page the visitor is on", () => {
    init(LIVE);
    const track = vi.fn();
    window.umami = { track, identify: vi.fn() };
    consent.setStatisticsChoice("on");
    expect(window.localStorage.getItem(STATISTICS_CHOICE_KEY)).toBe(STORED_CHOICE.on);
    expect(umamiScript()).not.toBeNull();
    expect(track).toHaveBeenCalledOnce();
  });

  it("off: keeps the choice and stops counting on this page at once", () => {
    init(LIVE);
    const track = vi.fn();
    window.umami = { track, identify: vi.fn() };
    consent.setStatisticsChoice("on");
    consent.setStatisticsChoice("off");
    analytics.trackPageview();
    analytics.track("theme-switch", { theme: "dark" });
    expect(window.localStorage.getItem(STATISTICS_CHOICE_KEY)).toBe("off");
    expect(track).toHaveBeenCalledOnce(); // only the pageview sent when it was allowed
  });

  it("tells subscribers, and they stop hearing after unsubscribing", () => {
    const onChange = vi.fn();
    const unsubscribe = consent.subscribeStatistics(onChange);
    consent.setStatisticsChoice("on");
    expect(onChange).toHaveBeenCalledOnce();
    unsubscribe();
    consent.setStatisticsChoice("off");
    expect(onChange).toHaveBeenCalledOnce();
  });
});

describe("a choice made in another tab", () => {
  /** What the browser does in this tab when another tab of the site writes to (or clears) its storage. */
  const fromOtherTab = (key: string | null, value: string | null) => {
    if (key === null) window.localStorage.clear();
    else if (value === null) window.localStorage.removeItem(key);
    else window.localStorage.setItem(key, value);
    window.dispatchEvent(new StorageEvent("storage", { key, newValue: value }));
  };

  it.each([
    ["switched off there", STATISTICS_CHOICE_KEY, "off"],
    ["the site's data cleared", null, null],
  ] as const)("stops counting here at once: %s", (_case, key, value) => {
    init(LIVE);
    const track = vi.fn();
    window.umami = { track, identify: vi.fn() };
    consent.setStatisticsChoice("on");
    expect(track).toHaveBeenCalledOnce();

    fromOtherTab(key, value);
    analytics.trackPageview();
    analytics.track("theme-switch", { theme: "dark" });
    expect(track).toHaveBeenCalledOnce(); // only the pageview sent before
  });

  it("allowed there: starts here and counts the page this tab shows, once", () => {
    init(LIVE);
    const track = vi.fn();
    window.umami = { track, identify: vi.fn() };
    expect(umamiScript()).toBeNull();

    fromOtherTab(STATISTICS_CHOICE_KEY, STORED_CHOICE.on);
    expect(umamiScript()).not.toBeNull();
    expect(track).toHaveBeenCalledOnce();
    fromOtherTab(STATISTICS_CHOICE_KEY, STORED_CHOICE.on);
    expect(track).toHaveBeenCalledOnce();
  });
});
