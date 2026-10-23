import { afterEach, describe, expect, it, vi } from "vitest";

import { replaceAddress } from "./address.utils.ts";

afterEach(() => {
  Reflect.deleteProperty(window.history, "replaceState"); // the wrapper below
});

describe("replaceAddress", () => {
  it("changes the address and keeps the state, past a tracker's wrapper on history.replaceState", () => {
    window.history.replaceState({ kbView: "about" }, "", "/about");
    // Umami's tracker wraps the method on the history object itself (data-auto-track).
    const wrapper = vi.fn();
    window.history.replaceState = wrapper;

    replaceAddress("/about#career");
    expect(window.location.pathname + window.location.hash).toBe("/about#career");
    expect(window.history.state).toEqual({ kbView: "about" });

    replaceAddress("/about", { kbView: "about", scrollY: 40 });
    expect(window.location.hash).toBe("");
    expect(window.history.state).toEqual({ kbView: "about", scrollY: 40 });
    expect(wrapper).not.toHaveBeenCalled();
  });
});
