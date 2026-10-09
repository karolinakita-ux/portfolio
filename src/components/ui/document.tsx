import type { ReactNode } from "react";

/**
 * Shared primitives for printable documents (CV, cover letter).
 * Both read as plain text when a PDF is parsed, so separators are typed
 * characters and links show their URL as the visible label (see DOC_LINK in lib/ui.ts).
 */

/** Typed " | " separators between parts, so extracted text stays readable. Falsy parts are skipped. */
export function Joined({ parts }: { parts: ReadonlyArray<ReactNode> }) {
  return parts.filter(Boolean).map((part, index) => (
    <span key={index}>
      {index > 0 && " | "}
      {part}
    </span>
  ));
}
