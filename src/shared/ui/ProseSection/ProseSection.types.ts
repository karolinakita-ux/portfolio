import type { ReactNode } from "react";

/** One part of a text page (the privacy policy, the accessibility statement). */
export interface ProseSectionContent {
  /** The URL hash (/privacy#rights): keep it stable, it is a shared link. */
  id: string;
  title: string;
  paragraphs?: readonly ReactNode[];
  /** A bullet list after the paragraphs. */
  points?: readonly ReactNode[];
  /** Paragraphs that lead into the section's own component (a switch, a table, a note). */
  intro?: readonly ReactNode[];
  /** Paragraphs after that component. */
  after?: readonly ReactNode[];
}

export interface ProseSectionProps {
  section: ProseSectionContent;
  /** The section's own component, between its points and its closing paragraphs. */
  extra?: ReactNode;
}
