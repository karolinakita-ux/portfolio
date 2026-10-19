import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { STATISTICS_OFF_KEY, UMAMI } from "./analytics.constants.ts";
import type { AnalyticsSite } from "./analytics.types.ts";
import type * as Analytics from "./analytics.utils.ts";
import type * as Switch from "./statistics-switch.utils.ts";

const LIVE: AnalyticsSite = { production: true, base: "/", hostname: UMAMI.host, privacy: {} };

/** Both modules keep page-lifetime state: fresh copies per test. */
let analytics: typeof Analytics;
let statistics: typeof Switch;

beforeEach(async () => {
  vi.resetModules();
  analytics = await import("./analytics.utils.ts");
  statistics = await import("./statistics-switch.utils.ts");
});

afterEach(() => {
  for (const script of document.querySelectorAll("script")) script.remove();
  Reflect.deleteProperty(window, "umami");
  Reflect.deleteProperty(navigator, "doNotTrack");
  Reflect.deleteProperty(navigator, "globalPrivacyControl");
});

const setSignal = (name: "doNotTrack" | "globalPrivacyControl", value: string | boolean) =>
  Object.defineProperty(navigator, name, { value, configurable: true });

describe("statisticsState", () => {
  it("is on by default, off once switched off, and browser with Do Not Track or Global Privacy Control", () => {
    expect(statistics.statisticsState()).toBe("on");
    statistics.setStatisticsOff(true);
    expect(statistics.statisticsState()).toBe("off");
    setSignal("doNotTrack", "1");
    expect(statistics.statisticsState()).toBe("browser");
    Reflect.deleteProperty(navigator, "doNotTrack");
    setSignal("globalPrivacyControl", true);
    expect(statistics.statisticsState()).toBe("browser");
  });
});

describe("setStatisticsOff", () => {
  it("keeps the choice in Umami's own key, and removes it when switched back on", () => {
    statistics.setStatisticsOff(true);
    expect(window.localStorage.getItem(STATISTICS_OFF_KEY)).toBe("1");
    statistics.setStatisticsOff(false);
    expect(window.localStorage.getItem(STATISTICS_OFF_KEY)).toBeNull();
  });

  it("stops counting on this page at once", () => {
    analytics.startAnalytics(LIVE);
    const track = vi.fn();
    window.umami = { track };
    statistics.setStatisticsOff(true);
    analytics.trackPageview();
    analytics.track("theme-switch", { theme: "dark" });
    expect(track).not.toHaveBeenCalled();
  });

  it("tells subscribers, and they stop hearing after unsubscribing", () => {
    const onChange = vi.fn();
    const unsubscribe = statistics.subscribeStatistics(onChange);
    statistics.setStatisticsOff(true);
    expect(onChange).toHaveBeenCalledOnce();
    unsubscribe();
    statistics.setStatisticsOff(false);
    expect(onChange).toHaveBeenCalledOnce();
  });
});

describe("visitorPrivacy", () => {
  it("keeps the script from loading once statistics are switched off", () => {
    statistics.setStatisticsOff(true);
    expect(analytics.startAnalytics({ ...LIVE, privacy: statistics.visitorPrivacy() })).toBe(false);
    expect(document.querySelector("script")).toBeNull();
  });
});
