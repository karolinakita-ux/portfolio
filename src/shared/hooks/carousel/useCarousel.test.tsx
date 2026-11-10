import { act, fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { Carousel } from "#shared/ui/Carousel/Carousel.tsx";
import { CarouselControls } from "#shared/ui/CarouselControls/CarouselControls.tsx";

import { useCarousel } from "./useCarousel.ts";

const ITEMS = ["one", "two", "three", "four", "five"];
const STEP = 316;

function Example({ items = ITEMS }: { items?: string[] }) {
  const { trackRef, onScroll, previous, next, scrollable, ...position } = useCarousel(items.length);
  return (
    <>
      {scrollable ? (
        <CarouselControls
          {...position}
          onPrevious={previous}
          onNext={next}
          labels={{ previous: "Previous", next: "Next" }}
        />
      ) : null}
      <Carousel
        ref={trackRef}
        onScroll={onScroll}
        label="Items"
        items={items}
        getKey={(item) => item}
        renderItem={(item) => item}
      />
    </>
  );
}

/** jsdom has no layout: give the track and its items the sizes of a 2-up desktop row. */
function layOut(list: HTMLElement) {
  Array.from(list.children).forEach((item, index) => {
    Object.defineProperty(item, "offsetLeft", { value: index * STEP });
  });
  Object.defineProperty(list, "scrollWidth", { value: ITEMS.length * STEP - 16 });
  Object.defineProperty(list, "clientWidth", { value: 2 * STEP - 16 });
}

describe("useCarousel", () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("starts at the beginning with 2 items in view (the prerendered, wide layout)", () => {
    render(<Example />);
    expect(screen.getByText("1 - 2 of 5")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Previous" })).toHaveAttribute("aria-disabled", "true");
    expect(within(screen.getByRole("list", { name: "Items" })).getAllByRole("listitem")).toHaveLength(5);
  });

  it("hides the controls while every item fits in view", () => {
    render(<Example items={["one", "two"]} />);
    expect(screen.queryByRole("button", { name: "Next" })).not.toBeInTheDocument();
  });

  it("moves one view with Next, smoothly", async () => {
    render(<Example />);
    const list = screen.getByRole("list", { name: "Items" });
    layOut(list);
    const scrollTo = vi.spyOn(list, "scrollTo");
    await userEvent.click(screen.getByRole("button", { name: "Next" }));
    expect(scrollTo).toHaveBeenCalledWith({ left: 2 * STEP, behavior: "smooth" });
  });

  it("moves at once when the visitor asks for reduced motion", async () => {
    vi.stubGlobal(
      "matchMedia",
      (query: string) =>
        ({
          matches: query.includes("reduce") || query.includes("width"),
          addEventListener: () => undefined,
          removeEventListener: () => undefined,
        }) as unknown as MediaQueryList,
    );
    render(<Example />);
    const list = screen.getByRole("list", { name: "Items" });
    layOut(list);
    const scrollTo = vi.spyOn(list, "scrollTo");
    await userEvent.click(screen.getByRole("button", { name: "Next" }));
    expect(scrollTo).toHaveBeenCalledWith({ left: 2 * STEP, behavior: "instant" });
    vi.unstubAllGlobals();
  });

  it("reads the position once scrolling settles, however the track moved; a swipe or Tab stays silent", () => {
    render(<Example />);
    const list = screen.getByRole("list", { name: "Items" });
    layOut(list);
    list.scrollLeft = 2 * STEP;
    fireEvent.scroll(list);
    expect(screen.getByText("1 - 2 of 5")).toBeInTheDocument();
    act(() => {
      vi.advanceTimersByTime(200);
    });
    expect(screen.getByText("3 - 4 of 5")).toBeInTheDocument();
    expect(document.querySelector("[aria-live='polite']")).toHaveTextContent(/^$/);
    expect(screen.getByRole("button", { name: "Previous" })).toHaveAttribute("aria-disabled", "false");
  });

  it("speaks the new position once a move by Next settles", async () => {
    render(<Example />);
    const list = screen.getByRole("list", { name: "Items" });
    layOut(list);
    await userEvent.click(screen.getByRole("button", { name: "Next" }));
    list.scrollLeft = 2 * STEP; // where the smooth scroll ends (jsdom does not scroll)
    fireEvent.scroll(list);
    act(() => {
      vi.advanceTimersByTime(200);
    });
    expect(screen.getByText("Showing 3 to 4 of 5")).toHaveAttribute("aria-live", "polite");
  });

  it("goes on from where a move in flight lands when Next is pressed again before it settles", async () => {
    render(<Example />);
    const list = screen.getByRole("list", { name: "Items" });
    layOut(list);
    const scrollTo = vi.spyOn(list, "scrollTo");
    const next = screen.getByRole("button", { name: "Next" });
    await userEvent.click(next);
    await userEvent.click(next);
    expect(scrollTo.mock.calls.map(([options]) => (options as ScrollToOptions).left)).toEqual([
      2 * STEP,
      ITEMS.length * STEP - 16 - (2 * STEP - 16),
    ]);
  });

  it("knows the end from the scroll position", () => {
    render(<Example />);
    const list = screen.getByRole("list", { name: "Items" });
    layOut(list);
    list.scrollLeft = ITEMS.length * STEP - 16 - (2 * STEP - 16);
    fireEvent.scroll(list);
    act(() => {
      vi.advanceTimersByTime(200);
    });
    expect(screen.getByText("4 - 5 of 5")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Next" })).toHaveAttribute("aria-disabled", "true");
  });
});
