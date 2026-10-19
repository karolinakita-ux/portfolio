import type { ReactNode } from "react";

import { Strong } from "#shared/ui/Strong/Strong.tsx";

/**
 * TYPOGRAPHY RULE - case-study bullets.
 * Every bullet in a case study (problem lists, reality cards, showcase rows,
 * takeaways) opens with a bold lead-in term followed by a colon:
 *   lead("High risk of human error", "Admins pairing light text…")
 *   → <strong>High risk of human error:</strong> Admins pairing light text…
 * Author new bullets with lead() so the pattern is applied by construction.
 */
export const lead = (term: string, text: ReactNode): ReactNode => (
  <>
    <Strong>{term}:</Strong> {text}
  </>
);
