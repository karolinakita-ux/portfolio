import { useEffect, useRef, useState } from "react";

import { EVENT } from "#shared/lib/analytics/analytics.constants.ts";
import { track } from "#shared/lib/analytics/analytics.utils.ts";
import { writeClipboard } from "#shared/lib/clipboard/clipboard.utils.ts";
import { Check, Copy } from "#shared/ui/icons/icons.tsx";
import { VisuallyHidden } from "#shared/ui/VisuallyHidden/VisuallyHidden.tsx";

import { FEEDBACK } from "./CopyEmail.constants.ts";
import { styles } from "./CopyEmail.styles.ts";
import type { CopyEmailProps, CopyStatus } from "./CopyEmail.types.ts";

/**
 * Email as a mailto: link (textLinkDefault / textLinkHover, denim focus ring),
 * plus a separate copy-to-clipboard button for visitors without a mail app.
 * Copying shows a "Copied to clipboard!" bubble for 2 seconds, which is also
 * the polite live region. If the clipboard is blocked, the address is selected
 * so the visitor can copy it with the keyboard; that instruction stays until
 * focus leaves the button, since it tells the visitor what to do next.
 * Both the link and the button are counted (email-click).
 */
export function CopyEmail({ email, place, textClassName, icon = null }: CopyEmailProps) {
  const [status, setStatus] = useState<CopyStatus>("idle");
  const emailRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (status !== "copied") return undefined;
    const timer = window.setTimeout(() => setStatus("idle"), 2000);
    return () => window.clearTimeout(timer);
  }, [status]);

  const selectEmail = () => {
    const node = emailRef.current;
    const selection = window.getSelection();
    if (!node || !selection) return;
    const range = document.createRange();
    range.selectNodeContents(node);
    selection.removeAllRanges();
    selection.addRange(range);
  };

  const fallBackToSelection = () => {
    selectEmail();
    setStatus("selected");
  };

  const handleCopy = () => {
    track(EVENT.emailClick, { action: "copy", place });
    // writeText must start inside the click handler (user activation).
    const write = writeClipboard(email);
    if (!write) {
      fallBackToSelection();
      return;
    }
    write.then(() => setStatus("copied"), fallBackToSelection);
  };

  const copied = status === "copied";
  const feedback = FEEDBACK[status];
  const showFeedback = feedback !== "";

  return (
    <span className={styles.root}>
      <a
        href={"mailto:" + email}
        onClick={() => track(EVENT.emailClick, { action: "mailto", place })}
        className={styles.link}
      >
        {icon}
        <span ref={emailRef} className={styles.address(textClassName)}>
          {email}
        </span>
        <VisuallyHidden> (opens your email app)</VisuallyHidden>
      </a>
      <span className={styles.buttonCell}>
        <button
          type="button"
          onClick={handleCopy}
          onBlur={() => {
            if (status === "selected") setStatus("idle");
          }}
          aria-label={copied ? "Email address copied to clipboard" : "Copy email address"}
          title={copied ? "Copied to clipboard!" : "Copy email address"}
          className={styles.button}
        >
          {copied ? <Check aria-hidden="true" size={16} /> : <Copy aria-hidden="true" size={16} />}
        </button>
      </span>
      {/* Visible confirmation bubble above the row; also the polite live region. */}
      <span role="status" aria-live="polite" className={styles.feedback(showFeedback)}>
        {feedback}
      </span>
    </span>
  );
}
