import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { HeadingAnchor } from "./HeadingAnchor.tsx";

function stubClipboard(writeText: (text: string) => Promise<void>) {
  Object.defineProperty(navigator, "clipboard", { value: { writeText }, configurable: true });
}

afterEach(() => {
  Reflect.deleteProperty(navigator, "clipboard");
});

const renderAnchor = () =>
  render(
    <div className="group">
      <h2 id="career-title" tabIndex={-1}>
        Career Progression
      </h2>
      <HeadingAnchor id="career" headingId="career-title" label="Career Progression" />
    </div>,
  );

describe("HeadingAnchor", () => {
  it("is a real link to the section, named after its heading, outside the heading", () => {
    renderAnchor();
    const link = screen.getByRole("link", { name: "Copy link to section: Career Progression" });
    expect(link).toHaveAttribute("href", "#career");
    // The heading's accessible name stays the heading text alone.
    expect(screen.getByRole("heading", { level: 2 })).toHaveAccessibleName("Career Progression");
  });

  it("copies the full URL with the section-link tag, puts the hash in the address bar and announces it", async () => {
    window.history.replaceState(null, "", "/about?fbclid=IwAR0abc");
    const writeText = vi.fn((_text: string) => Promise.resolve());
    stubClipboard(writeText);
    renderAnchor();

    fireEvent.click(screen.getByRole("link", { name: /Copy link to section/ }));

    // A click id is not a tag and stays out of the copy.
    expect(writeText).toHaveBeenCalledWith(window.location.origin + "/about?ref=section-link#career");
    expect(window.location.pathname + window.location.search + window.location.hash).toBe(
      "/about?fbclid=IwAR0abc#career",
    );
    expect(await screen.findByRole("status")).toHaveTextContent("Link copied");
  });

  it("passes the copier's tag on, marked as a section link", () => {
    window.history.replaceState(null, "", "/about?ref=acme&utm_medium=social");
    const writeText = vi.fn((_text: string) => Promise.resolve());
    stubClipboard(writeText);
    renderAnchor();

    fireEvent.click(screen.getByRole("link", { name: /Copy link to section/ }));

    // Whoever opens it still counts for acme; the UTM report counts it as a section link.
    expect(writeText).toHaveBeenCalledWith(window.location.origin + "/about?ref=acme&utm_medium=section-link#career");
    expect(window.location.search + window.location.hash).toBe("?ref=acme&utm_medium=social#career");
  });

  it("moves the hash past a tracker's wrapper on history.replaceState: a copied link is not a new page", () => {
    window.history.replaceState(null, "", "/about");
    stubClipboard(vi.fn((_text: string) => Promise.resolve()));
    const wrapper = vi.fn(); // Umami's tracker wraps the method on the history object itself
    window.history.replaceState = wrapper;
    try {
      renderAnchor();
      fireEvent.click(screen.getByRole("link", { name: /Copy link to section/ }));
      expect(window.location.hash).toBe("#career");
      expect(wrapper).not.toHaveBeenCalled();
    } finally {
      Reflect.deleteProperty(window.history, "replaceState");
    }
  });

  it("still updates the address bar when the clipboard is blocked", () => {
    window.history.replaceState(null, "", "/about");
    stubClipboard(() => Promise.reject(new Error("denied")));
    renderAnchor();

    fireEvent.click(screen.getByRole("link", { name: /Copy link to section/ }));

    expect(window.location.hash).toBe("#career");
    expect(screen.getByRole("status")).toHaveTextContent("");
  });

  it("leaves modified clicks (new tab) to the browser", () => {
    window.history.replaceState(null, "", "/about");
    const writeText = vi.fn((_text: string) => Promise.resolve());
    stubClipboard(writeText);
    renderAnchor();

    fireEvent.click(screen.getByRole("link", { name: /Copy link to section/ }), { ctrlKey: true });

    expect(writeText).not.toHaveBeenCalled();
  });
});
