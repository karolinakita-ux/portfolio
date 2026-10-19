import { MAX_PARALLEL } from "./image-preload.constants.ts";
import type { NetworkInformation, PreloadOptions } from "./image-preload.types.ts";

/**
 * Background image preloading, so the image viewer opens on a picture that is
 * already in the browser cache.
 *
 *   preloadImages(srcs)                    after the page has loaded and the browser is idle
 *   preloadImages(srcs, { urgent: true })  now, ahead of everything queued (e.g. the next image in the viewer)
 *
 * Images load MAX_PARALLEL at a time, each URL once. Nothing loads when the
 * visitor has asked to save data or is on a 2G connection.
 */

/** Every URL ever passed in: queued, loading or done. */
const seen = new Set<string>();
const queue: string[] = [];
/**
 * Loaded images stay referenced, so they stay in the page's memory cache: Netlify
 * serves /assets with max-age=0, and a dropped image would cost a revalidation
 * round trip when the viewer shows it.
 */
const kept: HTMLImageElement[] = [];
let active = 0;

const savesData = () => {
  const connection = (navigator as Navigator & { connection?: NetworkInformation }).connection;
  return Boolean(connection?.saveData) || (connection?.effectiveType ?? "").includes("2g");
};

function pump() {
  while (active < MAX_PARALLEL) {
    const src = queue.shift();
    if (src === undefined) return;
    active += 1;
    const image = new Image();
    image.decoding = "async";
    image.onload = image.onerror = () => {
      active -= 1;
      pump();
    };
    kept.push(image);
    image.src = src;
  }
}

/** Runs `run` once the page has finished loading and the browser has a quiet moment. */
function whenIdleAfterLoad(run: () => void) {
  const idle = () => {
    if (typeof window.requestIdleCallback === "function") window.requestIdleCallback(run, { timeout: 3000 });
    else window.setTimeout(run, 200);
  };
  if (document.readyState === "complete") idle();
  else window.addEventListener("load", idle, { once: true });
}

export function preloadImages(srcs: readonly string[], { urgent = false }: PreloadOptions = {}) {
  if (savesData()) return;
  if (urgent) {
    // Still-queued URLs move to the front; ones already loading or done are left alone.
    const fresh = [...new Set(srcs)].filter((src) => !seen.has(src) || queue.includes(src));
    for (const src of fresh) {
      const queued = queue.indexOf(src);
      if (queued !== -1) queue.splice(queued, 1);
      seen.add(src);
    }
    queue.unshift(...fresh);
    pump();
    return;
  }
  whenIdleAfterLoad(() => {
    for (const src of srcs) {
      if (seen.has(src)) continue;
      seen.add(src);
      queue.push(src);
    }
    pump();
  });
}
