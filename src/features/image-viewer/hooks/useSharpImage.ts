import { useEffect, useState, type RefObject } from "react";

import { needsMorePixels } from "#features/image-viewer/lightbox.utils.ts";
import { savesData } from "#shared/lib/browser/browser.utils.ts";

/** The sharper copy decided for one image: `pageWidth` is its page file's width, or null when the copy failed. */
interface Decision {
  src: string;
  zoomSrc: string;
  pageWidth: number | null;
}

/**
 * Which file the viewer's image shows. It opens on `src`, the page's own file (usually in the cache already), and
 * moves to `zoomSrc`, the same picture with more pixels, once the screen needs more pixels than `src` has: a dense
 * screen (a Retina laptop at fit), the viewer's zoom or the browser's pinch-zoom (needsMorePixels). Until then, and
 * for a visitor who saves data, the copy does not download. It loads in the background and takes over only once
 * decoded, sized by the page file's width (`pageWidth`), so nothing moves or flashes. A copy that fails leaves `src`.
 *
 * Not `srcset`: the browser picks a candidate by the screen's density (and `sizes`), which neither the viewer's zoom
 * nor a pinch-zoom changes (devicePixelRatio stays the same under a pinch), so it would never pick the copy then.
 */
export function useSharpImage(
  src: string,
  zoomSrc: string | undefined,
  imageRef: RefObject<HTMLImageElement | null>,
  loaded: boolean,
) {
  const [decision, setDecision] = useState<Decision | null>(null);
  // Derived for this image: a decision for another image, or for the other theme's copy, does not count.
  const decided = decision?.src === src && decision.zoomSrc === zoomSrc ? decision : null;

  useEffect(() => {
    const image = imageRef.current;
    if (zoomSrc === undefined || !loaded || decided || !image) return undefined;
    let live = true;
    let started = false;
    const check = () => {
      if (started || !needsMorePixels(image) || savesData()) return;
      started = true;
      const pageWidth = image.naturalWidth;
      const copy = new Image();
      const settle = () => {
        // Not when the visitor moved on or closed the viewer meanwhile.
        if (live) setDecision({ src, zoomSrc, pageWidth: copy.naturalWidth > 0 ? pageWidth : null });
      };
      copy.onload = () => {
        if (typeof copy.decode === "function") copy.decode().then(settle, settle);
        else settle();
      };
      copy.onerror = settle;
      copy.src = zoomSrc;
    };
    check();
    // The viewer's zoom and window resizes change the image's width; a pinch-zoom changes the visual viewport's scale.
    const observer = typeof ResizeObserver === "function" ? new ResizeObserver(check) : null;
    observer?.observe(image);
    window.visualViewport?.addEventListener("resize", check);
    return () => {
      live = false;
      observer?.disconnect();
      window.visualViewport?.removeEventListener("resize", check);
    };
  }, [decided, imageRef, loaded, src, zoomSrc]);

  const pageWidth = decided?.pageWidth ?? undefined;
  return {
    shownSrc: decided && pageWidth !== undefined ? decided.zoomSrc : src,
    /** The page file's width while the copy shows (the size to keep); undefined while `src` shows. */
    pageWidth,
    /** The shown copy failed after all: back to `src` for the rest of this image's visit. */
    dropCopy: () => {
      if (zoomSrc !== undefined) setDecision({ src, zoomSrc, pageWidth: null });
    },
  };
}
