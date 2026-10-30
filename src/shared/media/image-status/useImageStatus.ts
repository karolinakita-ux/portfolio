import { useCallback, useState } from "react";

import { useHydrating } from "#shared/hooks/hydration/useHydrating.ts";

import type { ImageStatus, ImageStatusState } from "./image-status.types.ts";

/**
 * Tracks image load state for one `src`.
 *
 * - Status is stored together with the src it belongs to, so a new src reads
 *   as "loading" straight away (no effect, no stale frame).
 * - Cached images can finish before React sees the load event, so the ref
 *   callback also checks `img.complete` when the element mounts or src changes.
 * - `shown`: loaded, or the image the first HTML (the prerendered page) already holds. The browser draws that
 *   one as it arrives, without JavaScript, so it never waits hidden for the app; only an image the app adds or
 *   changes later stays hidden until it has loaded (and can fade in).
 */
export function useImageStatus(src: string) {
  const [state, setState] = useState<ImageStatusState>({ src, status: "loading" });
  const status: ImageStatus = state.src === src ? state.status : "loading";
  // The src this image had in the first HTML; null for an image the app rendered itself. Kept from the mount.
  const hydrating = useHydrating();
  const [firstHtmlSrc] = useState(hydrating ? src : null);

  const setStatus = useCallback((next: ImageStatus) => setState({ src, status: next }), [src]);

  const ref = useCallback(
    (img: HTMLImageElement | null) => {
      if (img?.complete) setState({ src, status: img.naturalWidth > 0 ? "loaded" : "error" });
    },
    [src],
  );

  return { status, setStatus, ref, shown: status === "loaded" || src === firstHtmlSrc };
}
