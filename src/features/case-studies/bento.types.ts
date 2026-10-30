/**
 * Bento cards: numbered cards with a status badge and an optional small visual (BentoCards). Used for the
 * Data Governance delivery and engineering sections. Colours inside a visual are content (sample brand colours
 * from the screens), not site colours: they stay the same in Light and Dark mode.
 */

/** A colour sample: any CSS colour, including color-mix() for derived states. */
export type ColorValue = string;

/** The small visual at the foot of a card, shown by BentoVisual. */
export type BentoVisualContent =
  /** Small neutral tags (who it was for). */
  | { kind: "tags"; items: readonly string[] }
  /** Checked items (what shipped). */
  | { kind: "checks"; items: readonly string[] }
  /** Text samples on brand colours: the label colour picked for each. */
  | { kind: "labels"; items: ReadonlyArray<{ text: string; background: ColorValue; color: ColorValue }> }
  /** State swatches derived from one base colour, each with its rule. */
  | { kind: "swatches"; items: ReadonlyArray<{ label: string; rule: string; color: ColorValue }> }
  /** Stylesheet lines: property, then value. */
  | { kind: "code"; label: string; lines: ReadonlyArray<readonly [property: string, value: string]> }
  /** Two phases on a line: what shipped, what comes next. */
  | { kind: "phases"; from: { label: string; note: string }; to: { label: string; note: string } };

export type BentoStatusTone = "shipped" | "roadmap";

export interface BentoCard {
  title: string;
  body: string;
  status?: { label: string; tone: BentoStatusTone };
  /** Spans two columns of the three-column grid (from md). */
  wide?: boolean;
  visual?: BentoVisualContent;
}
