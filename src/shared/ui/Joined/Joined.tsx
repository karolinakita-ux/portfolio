import type { JoinedProps } from "./Joined.types.ts";

/**
 * Typed " | " separators between parts, so text extracted from a PDF (the CV) stays readable.
 * Falsy parts are skipped. Links in printable documents: DOC_LINK in shared/lib/ui.styles.ts.
 */
export function Joined({ parts }: JoinedProps) {
  return parts.filter(Boolean).map((part, index) => (
    // eslint-disable-next-line @eslint-react/no-array-index-key -- positional parts, never reordered
    <span key={index}>
      {index > 0 && " | "}
      {part}
    </span>
  ));
}
