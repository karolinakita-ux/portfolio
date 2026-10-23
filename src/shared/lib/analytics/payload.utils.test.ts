import { describe, expect, it, vi } from "vitest";

import type { PerformancePayload } from "./analytics.types.ts";
import { cleanPayload, cleanReferrer, cleanUrl } from "./payload.utils.ts";

const { origin } = window.location;

describe("cleanUrl", () => {
  it("drops the hash and every query parameter but the link tag and UTM", () => {
    expect(cleanUrl(origin + "/about#career")).toBe(origin + "/about");
    expect(cleanUrl(origin + "/?fbclid=IwAR0&gclid=Cj0&li_fat_id=9&utm_source=linkedin&ref=acme")).toBe(
      origin + "/?utm_source=linkedin&ref=acme",
    );
    expect(cleanUrl(origin + "/contact?msclkid=1")).toBe(origin + "/contact");
  });

  it("leaves a kept query exactly as it was (no re-encoding)", () => {
    expect(cleanUrl(origin + "/?ref=Acme%20Corp")).toBe(origin + "/?ref=Acme%20Corp");
  });
});

describe("cleanReferrer", () => {
  it("keeps a page of this site as a cleaned path", () => {
    expect(cleanReferrer("/about?ref=acme&fbclid=1#faq")).toBe("/about?ref=acme");
    expect(cleanReferrer(origin + "/work/project-planning")).toBe("/work/project-planning");
  });

  it("keeps another site's address without its query and hash", () => {
    expect(cleanReferrer("https://www.google.com/search?q=karolina+kita")).toBe("https://www.google.com/search");
    expect(cleanReferrer("https://www.linkedin.com/")).toBe("https://www.linkedin.com/");
    expect(cleanReferrer("android-app://com.linkedin.android/?s=1")).toBe("android-app://com.linkedin.android/");
    expect(cleanReferrer("")).toBe("");
  });
});

describe("cleanPayload", () => {
  const payload: PerformancePayload = {
    website: "site",
    hostname: "karolina.kita.company",
    screen: "390x844",
    language: "pl-PL",
    title: "Title the tracker saw",
    url: origin + "/?fbclid=1",
    referrer: "https://l.facebook.com/l.php?u=abc",
    lcp: 2100,
    cls: 0.01,
  };
  const page = { url: origin + "/about", title: "About", referrer: "/" };

  it("keeps the page of a pageview or event, and cleans its addresses", () => {
    expect(cleanPayload("event", payload, page)).toEqual({
      ...payload,
      url: origin + "/",
      referrer: "https://l.facebook.com/l.php",
    });
  });

  it("gives session data and speed reports the page the app counted last", () => {
    vi.spyOn(window.performance, "getEntriesByType").mockReturnValue([{ name: origin + "/about" } as PerformanceEntry]);
    expect(cleanPayload("identify", payload, page)).toEqual({ ...payload, ...page });
    expect(cleanPayload("performance", payload, page)).toEqual({ ...payload, ...page });
  });

  it("drops a speed report's load metrics when the counted page is not the loaded one", () => {
    vi.spyOn(window.performance, "getEntriesByType").mockReturnValue([{ name: origin + "/" } as PerformanceEntry]);
    const sent = cleanPayload("performance", { ...payload, ttfb: 80, fcp: 900 }, page);
    expect(sent).toMatchObject({ url: origin + "/about", title: "About", cls: 0.01 });
    for (const metric of ["ttfb", "fcp", "lcp"]) expect(sent).not.toHaveProperty(metric);
  });
});
