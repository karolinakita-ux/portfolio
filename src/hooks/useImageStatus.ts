import { useCallback, useState } from "react";

export type ImageStatus = "loading" | "loaded" | "error";

/**
 * Tracks image load state for one `src`.
 *
 * - Status is stored together with the src it belongs to, so a new src reads
 *   as "loading" straight away (no effect, no stale frame).
 * - Cached images can finish before React sees the load event, so the ref
 *   callback also checks `img.complete` when the element mounts or src changes.
 */
export function useImageStatus(src: string) {
  const [state, setState] = useState<{ src: string; status: ImageStatus }>({ src, status: "loading" });
  const status: ImageStatus = state.src === src ? state.status : "loading";

  const setStatus = useCallback((next: ImageStatus) => setState({ src, status: next }), [src]);

  const ref = useCallback(
    (img: HTMLImageElement | null) => {
      if (img?.complete) setState({ src, status: img.naturalWidth > 0 ? "loaded" : "error" });
    },
    [src]
  );

  return { status, setStatus, ref };
}
