import type { ReactNode } from "react";

/**
 * Shared primitives for printable documents (the CV).
 * Both read as plain text when a PDF is parsed, so separators are typed
 * characters and links show their URL as the visible label (see DOC_LINK in shared/lib/ui.utils.ts).
 */

/** Typed " | " separators between parts, so extracted text stays readable. Falsy parts are skipped. */
export function Joined({ parts }: { parts: readonly ReactNode[] }) {
  return parts.filter(Boolean).map((part, index) => (
    // eslint-disable-next-line @eslint-react/no-array-index-key -- positional parts, never reordered
    <span key={index}>
      {index > 0 && " | "}
      {part}
    </span>
  ));
}
