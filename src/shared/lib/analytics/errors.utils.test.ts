import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { JsError } from "./analytics.types.ts";
import { ownFile, watchErrors } from "./errors.utils.ts";

const { origin } = window.location;
const BUNDLE = origin + "/static/index-Bj0HK1p4.js";

const report = vi.fn<(error: JsError) => void>();
let stop: () => void;

beforeEach(() => {
  report.mockClear();
  stop = watchErrors(report);
});

afterEach(() => {
  stop();
});

const scriptError = (message: string, filename = BUNDLE) => {
  window.dispatchEvent(new ErrorEvent("error", { message, filename }));
};

/** jsdom has no PromiseRejectionEvent: an Event with its reason. */
const rejection = (reason: unknown) => {
  window.dispatchEvent(Object.assign(new Event("unhandledrejection"), { reason }));
};

describe("ownFile", () => {
  it("names a script of this site, and nothing for other sites and extensions", () => {
    expect(ownFile(BUNDLE)).toBe("index-Bj0HK1p4.js");
    expect(ownFile(origin + "/about")).toBe("inline"); // index.html's own script
    expect(ownFile("https://cloud.umami.is/script.js")).toBeNull();
    expect(ownFile("chrome-extension://abc/content.js")).toBeNull();
    expect(ownFile("")).toBeNull(); // "Script error." from another origin
  });
});

describe("watchErrors", () => {
  it("reports errors in the site's code and unhandled rejections, each message once", () => {
    scriptError("Cannot read properties of null (reading 'focus')");
    scriptError("Cannot read properties of null (reading 'focus')");
    rejection(new Error("Clipboard write was blocked"));
    expect(report.mock.calls.map(([error]) => error)).toEqual([
      { kind: "error", message: "Cannot read properties of null (reading 'focus')", file: "index-Bj0HK1p4.js" },
      { kind: "rejection", message: "Clipboard write was blocked" },
    ]);
  });

  it("leaves out other scripts, harmless browser warnings, and anything past three a page", () => {
    scriptError("Script error.", "");
    scriptError("boom", "chrome-extension://abc/content.js");
    scriptError("ResizeObserver loop completed with undelivered notifications.");
    for (const n of [1, 2, 3, 4]) scriptError("error " + String(n));
    expect(report.mock.calls.map(([error]) => error.message)).toEqual(["error 1", "error 2", "error 3"]);
  });

  it("shortens messages: addresses lose their query, and the text is cut", () => {
    rejection("Failed to load https://karolina.kita.company/static/a.js?token=secret#x");
    rejection({ code: 1 });
    scriptError("x".repeat(400));
    expect(report.mock.calls.map(([error]) => error.message)).toEqual([
      "Failed to load https://karolina.kita.company/static/a.js",
      "[object Object]",
      "x".repeat(150),
    ]);
  });

  it("stops listening, and counts afresh when it starts again", () => {
    scriptError("first");
    stop();
    scriptError("second");
    expect(report).toHaveBeenCalledOnce();
    stop = watchErrors(report);
    scriptError("first");
    expect(report).toHaveBeenCalledTimes(2);
  });
});
