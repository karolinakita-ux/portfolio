import { useState } from "react";

import { cn, FOCUS_RING } from "#shared/lib/ui.utils.ts";
import { ImageOff, Maximize2 } from "#shared/ui/icons.tsx";

import { useImageStatus } from "./useImageStatus.ts";

/** Geometric wireframe shown while a thumbnail loads, or if it fails. */
export function ThumbnailScaffold({ failed = false }: { failed?: boolean }) {
  return (
    <div aria-hidden="true" className="absolute inset-0 flex flex-col items-center justify-center gap-xs p-md">
      <svg
        viewBox="0 0 160 120"
        preserveAspectRatio="xMidYMid meet"
        className={cn("h-full w-full", !failed && "motion-safe:animate-pulse")}
      >
        <rect x="0.5" y="0.5" width="159" height="119" rx="4" className="fill-bg-surface-raised stroke-border-subtle" />
        <rect x="0.5" y="0.5" width="159" height="14" rx="4" className="fill-bg-accent-brand-subtle" />
        <rect x="8" y="5" width="22" height="4" rx="2" className="fill-border-default" />
        <circle cx="146" cy="7.5" r="3" className="fill-border-default" />
        <rect x="8" y="22" width="30" height="90" rx="2" className="fill-bg-surface-default stroke-border-subtle" />
        <rect x="13" y="28" width="20" height="3" rx="1.5" className="fill-border-default" />
        <rect x="13" y="36" width="16" height="3" rx="1.5" className="fill-border-subtle" />
        <rect x="13" y="44" width="18" height="3" rx="1.5" className="fill-border-subtle" />
        <rect x="46" y="22" width="60" height="6" rx="3" className="fill-border-default" />
        <rect x="46" y="33" width="104" height="3" rx="1.5" className="fill-border-subtle" />
        <rect x="46" y="40" width="92" height="3" rx="1.5" className="fill-border-subtle" />
        <rect x="46" y="52" width="50" height="28" rx="2" className="fill-bg-surface-default stroke-border-subtle" />
        <rect x="100" y="52" width="50" height="28" rx="2" className="fill-bg-surface-default stroke-border-subtle" />
        <rect x="46" y="84" width="50" height="28" rx="2" className="fill-bg-surface-default stroke-border-subtle" />
        <rect
          x="100"
          y="84"
          width="50"
          height="28"
          rx="2"
          className="fill-bg-accent-brand-subtle stroke-border-subtle"
        />
      </svg>
      {failed && (
        <span className="inline-flex items-center gap-2xs text-label-sm text-text-secondary">
          <ImageOff aria-hidden="true" size={12} />
          Preview unavailable
        </span>
      )}
    </div>
  );
}

/**
 * Work-page case thumbnail: fixed 4:3 frame, image contained, scaffold while loading.
 * `interactive`: hover feedback (border, slight zoom) when an ancestor with `group/thumb` is hovered.
 */
export function CaseThumbnail({ src, alt, interactive = false }: { src: string; alt: string; interactive?: boolean }) {
  const { status, setStatus, ref } = useImageStatus(src);
  return (
    <div
      className={cn(
        "relative aspect-thumb w-full max-w-full overflow-hidden rounded-sm border border-border-subtle bg-bg-surface-default",
        interactive && "transition-colors duration-150 group-hover/thumb:border-border-interactive-hover",
      )}
    >
      {status !== "loaded" && <ThumbnailScaffold failed={status === "error"} />}
      {status !== "error" && (
        <img
          ref={ref}
          src={src}
          alt={alt}
          loading="lazy"
          decoding="async"
          onLoad={() => setStatus("loaded")}
          onError={() => setStatus("error")}
          className={cn(
            "absolute inset-0 h-full w-full object-contain p-xs transition-[opacity,scale] duration-300 ease-out",
            status === "loaded" ? "opacity-100" : "opacity-0",
            interactive && "motion-safe:group-hover/thumb:scale-[1.02]",
          )}
        />
      )}
      {status === "error" && <span className="sr-only">{alt}</span>}
    </div>
  );
}

interface ScreenshotProps {
  src: string;
  /** Used when `src` fails (`src` is then an optional close-up "detail"). */
  fallbackSrc?: string;
  alt: string;
  /** When given, the screenshot becomes a button that opens the full-size viewer; `trigger` is the button, for focus return. */
  onExpand?: (trigger: HTMLElement) => void;
}

/** Case-study screenshot at its natural aspect ratio (no cropping). */
export function Screenshot({ src, fallbackSrc, alt, onExpand }: ScreenshotProps) {
  // Which src failed: once the close-up fails, show the fallback for that src.
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const currentSrc = fallbackSrc && failedSrc === src ? fallbackSrc : src;
  const { status, setStatus, ref } = useImageStatus(currentSrc);

  const handleError = () => {
    if (fallbackSrc && currentSrc !== fallbackSrc) setFailedSrc(src);
    else setStatus("error");
  };

  if (status === "error") {
    return (
      <div className="relative aspect-thumb min-w-0 overflow-hidden rounded-sm border border-border-subtle bg-bg-surface-default">
        <ThumbnailScaffold failed />
        <span className="sr-only">{alt}</span>
      </div>
    );
  }

  const image = (
    <img
      ref={ref}
      src={currentSrc}
      alt={alt}
      loading="lazy"
      decoding="async"
      onLoad={() => setStatus("loaded")}
      onError={handleError}
      className={cn(
        "block h-auto w-full transition-transform duration-300 ease-out",
        onExpand && "motion-safe:group-hover/zoom:scale-[1.02]",
      )}
    />
  );

  if (!onExpand) {
    return (
      <div className="min-w-0 overflow-hidden rounded-sm border border-border-subtle bg-bg-surface-default">
        {image}
      </div>
    );
  }

  return (
    <button
      type="button"
      aria-haspopup="dialog"
      onClick={(event) => onExpand(event.currentTarget)}
      className={cn(
        "group/zoom relative block w-full min-w-0 cursor-zoom-in overflow-hidden rounded-sm border border-border-subtle bg-bg-surface-default text-left",
        FOCUS_RING,
      )}
    >
      <span className="sr-only">View full size: </span>
      {image}
      {/* Visible affordance: always shown (touch screens have no hover), label expands on hover / focus. */}
      <span
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute top-xs right-xs inline-flex items-center gap-2xs rounded-sm border border-border-subtle",
          "bg-bg-surface-raised px-xs py-2xs text-label-sm text-text-primary shadow-sm",
        )}
      >
        <Maximize2 size={12} />
        <span className="hidden group-hover/zoom:inline group-focus-visible/zoom:inline">View full size</span>
      </span>
    </button>
  );
}
