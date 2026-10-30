import { renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { AUTOMOTIVE_CASE, caseCards, SMART_TICKET_CASE } from "#features/case-studies/index.ts";
import { preloadImages } from "#shared/media/image-preload/image-preload.utils.ts";

import { usePreloadCaseImages } from "./usePreloadCaseImages.ts";

vi.mock("#shared/media/image-preload/image-preload.utils.ts", () => ({ preloadImages: vi.fn() }));

const resolveAsset = (name: string) => "/assets/" + name;

/** A link to a case study on the page, as a Work card or the next-case link would be. */
const linkTo = (path: string) => {
  const link = document.createElement("a");
  link.href = path;
  document.body.append(link);
  return link;
};

const hover = (link: HTMLElement) => link.dispatchEvent(new Event("pointerover", { bubbles: true }));
const preloaded = () => vi.mocked(preloadImages).mock.calls.map(([sources]) => sources);

beforeEach(() => {
  vi.mocked(preloadImages).mockClear();
});

afterEach(() => {
  document.documentElement.classList.remove("dark");
  document.body.replaceChildren();
});

describe("usePreloadCaseImages", () => {
  it("fetches a case's Light screenshots in Light mode, once", () => {
    renderHook(() => {
      usePreloadCaseImages(resolveAsset);
    });
    const link = linkTo("/work/automotive");
    hover(link);
    hover(link);
    expect(preloaded()).toEqual([caseCards(AUTOMOTIVE_CASE).map((card) => resolveAsset(card.asset))]);
  });

  it("fetches the Dark screenshots in Dark mode (a screen without one keeps its only file), and the other set after a switch", () => {
    renderHook(() => {
      usePreloadCaseImages(resolveAsset);
    });
    const cards = caseCards(SMART_TICKET_CASE);
    expect(cards.some((card) => card.darkAsset)).toBe(true);
    const link = linkTo("/work/smart-ticket");

    document.documentElement.classList.add("dark");
    hover(link);
    hover(link);
    document.documentElement.classList.remove("dark");
    hover(link);

    expect(preloaded()).toEqual([
      cards.map((card) => resolveAsset(card.darkAsset ?? card.asset)),
      cards.map((card) => resolveAsset(card.asset)),
    ]);
    expect(preloaded()[0]).not.toEqual(preloaded()[1]);
  });
});
