import { act, render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { IN_APP_BROWSER } from "./section-hash.constants.ts";
import { useSectionHash } from "./useSectionHash.ts";

const IDS = ["philosophy", "career", "faq"] as const;

function Page() {
  useSectionHash(0);
  return (
    <main>
      {IDS.map((id) => (
        <section key={id} id={id} data-anchor="" />
      ))}
    </main>
  );
}

/** jsdom has no layout: give each section a top edge relative to the viewport. */
const placeSections = (tops: Record<(typeof IDS)[number], number>) => {
  for (const id of IDS) {
    const section = document.getElementById(id);
    if (!section) throw new Error("missing " + id);
    section.getBoundingClientRect = () => ({ top: tops[id] }) as DOMRect;
  }
};

const scroll = async () => {
  window.dispatchEvent(new Event("scroll"));
  await act(() => new Promise<void>((resolve) => window.requestAnimationFrame(() => resolve())));
};

describe("useSectionHash", () => {
  it("keeps the hash on the section being read and clears it above the first one", async () => {
    window.history.replaceState({ kbView: "about" }, "", "/about?ref=cv");
    render(<Page />);
    const line = window.innerHeight * 0.3;

    placeSections({ philosophy: -400, career: line - 10, faq: line + 400 });
    await scroll();
    expect(window.location.pathname + window.location.search + window.location.hash).toBe("/about?ref=cv#career");
    expect(window.history.state).toEqual({ kbView: "about" }); // router state kept

    placeSections({ philosophy: line + 10, career: line + 500, faq: line + 900 });
    await scroll();
    expect(window.location.hash).toBe("");
  });

  it("leaves the address alone in an in-app browser (Messenger), which shows a loading bar on each write", async () => {
    vi.spyOn(navigator, "userAgent", "get").mockReturnValue(UA.messengerIos);
    window.history.replaceState({ kbView: "about" }, "", "/about");
    const replace = vi.spyOn(window.history, "replaceState");
    render(<Page />);
    placeSections({ philosophy: -400, career: -10, faq: 400 });
    await scroll();
    expect(replace).not.toHaveBeenCalled();
    expect(window.location.hash).toBe("");
  });
});

/** Real user agents (2026), shortened only where noted. */
const UA = {
  messengerIos:
    "Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 [FBAN/MessengerForiOS;FBAV/512.0.0.47.106;FBBV/731562344;FBDV/iPhone15,3;FBMD/iPhone;FBSN/iOS;FBSV/18.6;FBSS/3;FBCR/;FBID/phone;FBLC/pl_PL;FBOP/5]",
  messengerAndroid:
    "Mozilla/5.0 (Linux; Android 15; SM-S921B Build/AP3A.240905.015.A2; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/141.0.7390.70 Mobile Safari/537.36 [FB_IAB/Orca-Android;FBAV/512.0.0.37.110;]",
  instagram:
    "Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Instagram 401.0.0.32.107 (iPhone15,3; iOS 18_6; pl_PL; pl; scale=3.00; 1290x2796; 812345678)",
  linkedin:
    "Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 [LinkedInApp]/9.31.1735",
  chromeAndroid:
    "Mozilla/5.0 (Linux; Android 15; SM-S921B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Mobile Safari/537.36",
  safariIos:
    "Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Mobile/15E148 Safari/604.1",
  chromeDesktop:
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36",
};

describe("IN_APP_BROWSER", () => {
  it("recognises the browsers inside Messenger, Instagram and LinkedIn, and not ordinary browsers", () => {
    for (const agent of [UA.messengerIos, UA.messengerAndroid, UA.instagram, UA.linkedin]) {
      expect(IN_APP_BROWSER.test(agent), agent).toBe(true);
    }
    for (const agent of [UA.chromeAndroid, UA.safariIos, UA.chromeDesktop]) {
      expect(IN_APP_BROWSER.test(agent), agent).toBe(false);
    }
  });
});
