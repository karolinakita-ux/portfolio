import { useEffect, useState } from "react";

import { writeClipboard } from "#shared/lib/clipboard.utils.ts";
import { urlWithAnchor } from "#shared/lib/routes.ts";
import { cn, FOCUS_RING, isPlainLeftClick, prefersReducedMotion } from "#shared/lib/ui.utils.ts";

import { Check, Link } from "./icons.tsx";

interface HeadingAnchorProps {
  /** Section id: the URL hash (/about#career). */
  id: string;
  /** The heading element to scroll to. */
  headingId: string;
  /** Visible heading text, for the accessible name. */
  label: string;
}

/**
 * Link to a section, placed next to its heading (a sibling, so the heading keeps a clean
 * accessible name). A plain click copies the full URL, puts #id in the address bar and
 * scrolls to the heading; middle-click and "copy link address" work as on any link.
 * Visible on hover and keyboard focus, always on touch screens, hidden in print.
 */
export function HeadingAnchor({ id, headingId, label }: HeadingAnchorProps) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return undefined;
    const timer = window.setTimeout(() => setCopied(false), 2000);
    return () => window.clearTimeout(timer);
  }, [copied]);

  const hash = "#" + id;

  return (
    <>
      <a
        href={hash}
        aria-label={"Copy link to section: " + label}
        title={copied ? "Link copied" : "Copy link to this section"}
        onClick={(event) => {
          if (!isPlainLeftClick(event)) return;
          event.preventDefault();
          const url = urlWithAnchor(window.location, id);
          window.history.replaceState(window.history.state, "", url);
          document
            .getElementById(headingId)
            ?.scrollIntoView({ block: "start", behavior: prefersReducedMotion() ? "auto" : "smooth" });
          void writeClipboard(window.location.origin + url)?.then(
            () => setCopied(true),
            () => undefined, // blocked clipboard: the link and the address bar still carry the URL
          );
        }}
        className={cn(
          "inline-flex size-lg shrink-0 items-center justify-center rounded-sm text-text-secondary",
          "transition-opacity duration-fast hover:text-text-primary print:hidden",
          copied
            ? "opacity-100"
            : "opacity-0 group-hover:opacity-100 focus-visible:opacity-100 pointer-coarse:opacity-100",
          FOCUS_RING,
        )}
      >
        {copied ? <Check aria-hidden="true" size={18} /> : <Link aria-hidden="true" size={18} />}
      </a>
      <span role="status" className="sr-only">
        {copied ? "Link copied" : ""}
      </span>
    </>
  );
}
