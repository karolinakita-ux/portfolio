import "@testing-library/jest-dom/vitest";

// Vitest runs without globals, so Testing Library cannot register its own afterEach cleanup.
// eslint-disable-next-line testing-library/no-manual-cleanup
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

/*
 * jsdom gaps. Only what the app touches; behaviour that matters is asserted in the tests.
 */

// No layout engine: scrolling is a no-op.
window.scrollTo = () => {};
Element.prototype.scrollIntoView = () => {};

// No pointer capture (the image viewer captures the mouse while a drag pans the zoomed image).
if (typeof Element.prototype.setPointerCapture !== "function") {
  Element.prototype.setPointerCapture = () => {};
  Element.prototype.releasePointerCapture = () => {};
  Element.prototype.hasPointerCapture = () => false;
}

// <dialog>: showModal / close with the `close` event the app listens for.
if (typeof HTMLDialogElement !== "undefined") {
  const proto = HTMLDialogElement.prototype;
  if (!Object.getOwnPropertyDescriptor(proto, "open")) {
    Object.defineProperty(proto, "open", {
      configurable: true,
      get(this: HTMLDialogElement) {
        return this.hasAttribute("open");
      },
    });
  }
  if (typeof proto.showModal !== "function") {
    proto.showModal = function (this: HTMLDialogElement) {
      this.setAttribute("open", "");
      // Like browsers: focus moves to the first focusable element inside.
      this.querySelector<HTMLElement>(
        "button, [href], input, select, textarea, [tabindex]:not([tabindex='-1'])",
      )?.focus();
    };
    proto.close = function (this: HTMLDialogElement) {
      if (!this.hasAttribute("open")) return;
      this.removeAttribute("open");
      this.dispatchEvent(new Event("close"));
    };
  }
}

afterEach(() => {
  cleanup();
  window.localStorage.clear();
  document.documentElement.className = "";
  document.documentElement.removeAttribute("style");
  window.history.replaceState(null, "", "/");
});
