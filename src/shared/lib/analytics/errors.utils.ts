import { HARMLESS_ERRORS, MAX_ERRORS, MAX_MESSAGE_LENGTH } from "./analytics.constants.ts";
import type { JsError } from "./analytics.types.ts";

/**
 * Errors in the site's own code (js-error), so a page that breaks in some browser or in-app browser
 * shows up without an error-tracking service: script errors from a file on this site, and promises
 * nobody handled. Errors from browser extensions and other sites' scripts are left out (no file on
 * this site, or the browser's "Script error."), as are HARMLESS_ERRORS. At most MAX_ERRORS per page
 * load, each message once. Addresses in a message lose their query: it may name a page, never a visitor.
 */

/** Messages already sent, by kind and text. */
let reported = new Set<string>();

const shorten = (message: string): string =>
  message.replace(/(https?:\/\/[^\s?#]+)[?#]\S*/g, "$1").slice(0, MAX_MESSAGE_LENGTH);

/** The file name of a script on this site (index-Bj0HK1p4.js), or null for anything else. */
export const ownFile = (filename: string): string | null => {
  const { origin } = window.location;
  if (!filename.startsWith(origin + "/")) return null;
  // A script inside a page (index.html's theme script) reports the page's address.
  const name = new URL(filename).pathname.split("/").pop();
  return name?.endsWith(".js") ? name : "inline";
};

const reasonText = (reason: unknown): string => {
  if (reason instanceof Error) return reason.message;
  return typeof reason === "string" ? reason : Object.prototype.toString.call(reason);
};

/** Starts listening; `report` gets each error worth sending. Returns the function that stops. */
export function watchErrors(report: (error: JsError) => void): () => void {
  const note = (error: JsError) => {
    const key = error.kind + ":" + error.message;
    if (reported.size >= MAX_ERRORS || reported.has(key)) return;
    if (HARMLESS_ERRORS.some((text) => error.message.includes(text))) return;
    reported.add(key);
    report(error);
  };

  const onError = (event: ErrorEvent) => {
    const file = ownFile(event.filename);
    if (file !== null) note({ kind: "error", message: shorten(event.message), file });
  };
  const onRejection = (event: PromiseRejectionEvent) => {
    note({ kind: "rejection", message: shorten(reasonText(event.reason)) });
  };

  window.addEventListener("error", onError);
  window.addEventListener("unhandledrejection", onRejection);
  return () => {
    window.removeEventListener("error", onError);
    window.removeEventListener("unhandledrejection", onRejection);
    reported = new Set();
  };
}
