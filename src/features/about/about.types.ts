/** Content model of the About page (copy in about.content.ts). */

export interface Milestone {
  id: string;
  period: string;
  title: string;
  org: string;
  focus: string;
  /** Optional reflection quote. */
  lesson?: string;
  tags: readonly string[];
}

export interface Principle {
  id: string;
  title: string;
  body: string;
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
  points?: ReadonlyArray<readonly [term: string, text: string]>;
}
