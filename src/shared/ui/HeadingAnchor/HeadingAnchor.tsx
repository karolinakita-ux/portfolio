import { useEffect, useState } from "react";

import { EVENT } from "#shared/lib/analytics/analytics.constants.ts";
import { track } from "#shared/lib/analytics/analytics.utils.ts";
import { writeClipboard } from "#shared/lib/clipboard/clipboard.utils.ts";
import { replaceAddress } from "#shared/lib/routes/address.utils.ts";
import { urlWithAnchor } from "#shared/lib/routes/routes.utils.ts";
import { isPlainLeftClick, prefersReducedMotion } from "#shared/lib/ui/ui.utils.ts";
import { Check, Link } from "#shared/ui/icons/icons.tsx";

import { styles } from "./HeadingAnchor.styles.ts";
import type { HeadingAnchorProps } from "./HeadingAnchor.types.ts";

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
        title={copied ? "Link copied" : "Copy link to section"}
        onClick={(event) => {
          if (!isPlainLeftClick(event)) return;
          event.preventDefault();
          track(EVENT.sectionLinkCopy, { section: id });
          const url = urlWithAnchor(window.location, id);
          replaceAddress(url);
          document
            .getElementById(headingId)
            ?.scrollIntoView({ block: "start", behavior: prefersReducedMotion() ? "auto" : "smooth" });
          void writeClipboard(window.location.origin + url)?.then(
            () => setCopied(true),
            () => undefined, // blocked clipboard: the link and the address bar still carry the URL
          );
        }}
        className={styles.link(copied)}
      >
        {copied ? <Check aria-hidden="true" size={18} /> : <Link aria-hidden="true" size={18} />}
      </a>
      <span role="status" className={styles.status}>
        {copied ? "Link copied" : ""}
      </span>
    </>
  );
}
