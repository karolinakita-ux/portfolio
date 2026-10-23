import { act, render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { UA } from "#test/user-agents.ts";

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

  it("moves the hash past a tracker's wrapper on history.replaceState: reading is not a new page", async () => {
    window.history.replaceState({ kbView: "about" }, "", "/about");
    const wrapper = vi.fn(); // Umami's tracker wraps the method on the history object itself
    window.history.replaceState = wrapper;
    try {
      render(<Page />);
      placeSections({ philosophy: -400, career: -10, faq: 400 });
      await scroll();
      expect(window.location.hash).toBe("#career");
      expect(wrapper).not.toHaveBeenCalled();
    } finally {
      Reflect.deleteProperty(window.history, "replaceState");
    }
  });

  it("leaves the address alone in an in-app browser (Messenger), which shows a loading bar on each write", async () => {
    vi.spyOn(navigator, "userAgent", "get").mockReturnValue(UA.messengerIos);
    window.history.replaceState({ kbView: "about" }, "", "/about");
    const replace = vi.spyOn(History.prototype, "replaceState");
    render(<Page />);
    placeSections({ philosophy: -400, career: -10, faq: 400 });
    await scroll();
    expect(replace).not.toHaveBeenCalled();
    expect(window.location.hash).toBe("");
  });
});
