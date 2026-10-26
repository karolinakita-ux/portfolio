import type { CaseNavDirection, CaseNavPlace } from "./CaseNavLink.types.ts";

/** What the link says, unless a case study's own action replaces it at the end ("Back to All Work"). */
export const CASE_NAV_ACTION: Readonly<Record<CaseNavPlace, Readonly<Record<CaseNavDirection, string>>>> = {
  top: { prev: "Previous", next: "Next" },
  end: { prev: "Previous Case Study", next: "Next Case Study" },
};
