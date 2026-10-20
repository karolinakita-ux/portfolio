import type { ReactNode } from "react";

/** Section ids: the URL hashes of the privacy page (/privacy#rights). Keep them stable. */
export type PrivacySectionId =
  | "in-short"
  | "controller"
  | "hosting"
  | "statistics"
  | "email"
  | "device"
  | "recipients"
  | "rights"
  | "links"
  | "changes";

export interface PrivacySection {
  id: PrivacySectionId;
  title: string;
  paragraphs?: readonly ReactNode[];
  /** A bullet list after the paragraphs. */
  points?: readonly ReactNode[];
  /** Paragraphs that lead into the section's own component (the switch, the table, the objection note). */
  intro?: readonly ReactNode[];
  /** Paragraphs after that component. */
  after?: readonly ReactNode[];
}

export interface Recipient {
  name: string;
  text: string;
  policy: { label: string; href: string };
}

export interface StatisticsSwitchCopy {
  on: string;
  off: string;
  /** Not decided yet: statistics stay off until the visitor allows them. */
  unset: string;
  browser: string;
  /** In the prerendered HTML, before the script runs (and for visitors without JavaScript). */
  noScript: string;
  switchOff: string;
  switchOn: string;
}

export interface PrivacyContent {
  eyebrow: string;
  title: string;
  intro: string;
  updated: { iso: string; label: string };
  sections: readonly PrivacySection[];
  recipients: readonly Recipient[];
  objection: { title: string; text: string };
  statisticsSwitch: StatisticsSwitchCopy;
  /** The consent box at the bottom of every page, until the visitor decides. */
  consent: { title: string; text: ReactNode; allow: string; decline: string; details: string };
}
