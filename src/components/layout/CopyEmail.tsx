import { useEffect, useRef, useState, type ReactNode } from "react";
import { Check, Copy } from "../icons.tsx";
import { cn, FOCUS_RING } from "../../lib/ui.ts";

type CopyStatus = "idle" | "copied" | "selected";

const FEEDBACK: Record<CopyStatus, string> = {
  idle: "",
  copied: "Copied to clipboard!",
  selected: "Selected - press Ctrl+C or Command+C",
};

interface CopyEmailProps {
  email: string;
  textClassName?: string;
  icon?: ReactNode;
}

/**
 * Email as a mailto: link (textLinkDefault / textLinkHover, denim focus ring),
 * plus a separate copy-to-clipboard button for visitors without a mail app.
 * Copying shows a "Copied to clipboard!" bubble for 2 seconds, which is also
 * the polite live region. If the clipboard is blocked, the address is selected
 * so the visitor can copy it with the keyboard; that instruction stays until
 * focus leaves the button, since it tells the visitor what to do next.
 */
export function CopyEmail({ email, textClassName = "text-body-md", icon = null }: CopyEmailProps) {
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
    // writeText must start inside the click handler (user activation).
    let write: Promise<void> | null;
    try {
      write = typeof navigator.clipboard?.writeText === "function" ? navigator.clipboard.writeText(email) : null;
    } catch {
      write = null;
    }
    if (!write) {
      fallBackToSelection();
      return;
    }
    write.then(() => setStatus("copied"), fallBackToSelection);
  };

  const copied = status === "copied";
  const feedback = FEEDBACK[status];

  return (
    <span className="relative inline-flex min-w-0 flex-wrap items-center gap-xs">
      <a
        href={"mailto:" + email}
        className={cn(
          "inline-flex min-w-0 items-center gap-sm rounded-sm text-text-link-default underline underline-offset-2 hover:text-text-link-hover",
          FOCUS_RING,
        )}
      >
        {icon}
        <span ref={emailRef} className={cn("min-w-0 break-all", textClassName)}>
          {email}
        </span>
        <span className="sr-only"> (opens your email app)</span>
      </a>
      <span className="inline-flex shrink-0">
        <button
          type="button"
          onClick={handleCopy}
          onBlur={() => {
            if (status === "selected") setStatus("idle");
          }}
          aria-label={copied ? "Email address copied to clipboard" : "Copy email address"}
          title={copied ? "Copied to clipboard!" : "Copy email address"}
          className={cn(
            "inline-flex size-xl items-center justify-center rounded-sm text-text-link-default transition-colors duration-150",
            "hover:bg-bg-accent-brand-subtle hover:text-text-link-hover",
            FOCUS_RING,
          )}
        >
          {copied ? <Check aria-hidden="true" size={16} /> : <Copy aria-hidden="true" size={16} />}
        </button>
      </span>
      {/* Visible confirmation bubble above the row; also the polite live region. */}
      <span
        role="status"
        aria-live="polite"
        className={cn(
          feedback
            ? "absolute bottom-full left-0 z-10 mb-2xs rounded-sm bg-text-primary px-xs py-2xs text-label-sm whitespace-nowrap text-bg-canvas shadow-md motion-safe:animate-view-in"
            : "sr-only",
        )}
      >
        {feedback}
      </span>
    </span>
  );
}
