import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { EVENT, PASSIVE_EVENTS } from "./analytics.constants.ts";
import type { AnalyticsEvent, EventData } from "./analytics.types.ts";
import { sessionData } from "./session.utils.ts";

/**
 * docs/analytics.md is the tracking plan: what is sent, why, and the naming rules. These checks keep it
 * in step with the code, so every event and session property is documented and none is left over.
 */
const plan = readFileSync(join(process.cwd(), "docs", "analytics.md"), "utf8");

/** The text under a `## heading`, up to the next one. */
const planSection = (heading: string): string => {
  const start = plan.indexOf("\n## " + heading + "\n");
  if (start < 0) throw new Error("docs/analytics.md has no section " + heading);
  const end = plan.indexOf("\n## ", start + 1);
  return plan.slice(start, end < 0 ? undefined : end);
};

/** The first-column names (`name`) of the table under a `## heading`. */
const tableNames = (heading: string): string[] =>
  [...planSection(heading).matchAll(/^\| `([\w-]+)`/gm)].map(([, name = ""]) => name);

const sorted = (names: Iterable<string>) => [...names].sort();

/**
 * Each event's properties as the events table lists them (the third column), sorted: the names in backticks,
 * leaving out the values in brackets (`place` (`hero`, `banner`)). "none" lists none.
 */
const planProperties = (): Record<string, string[]> =>
  Object.fromEntries(
    [...planSection("Events").matchAll(/^\| `([\w-]+)` *\|[^|]*\|([^|]*)\|/gm)].map(([, name = "", cell = ""]) => [
      name,
      sorted([...cell.replace(/\([^)]*\)/g, "").matchAll(/`(\w+)`/g)].map(([, key = ""]) => key)),
    ]),
  );

/** Every key of every member of a union: figma-click's `case` counts, although the Work page's links send none. */
type KeysOfUnion<T> = T extends unknown ? keyof T : never;

/**
 * The properties each event carries, for the plan's Properties column. The type keeps it in step with EventData:
 * a property left out here, or one the event does not have, is a type error (yarn typecheck).
 */
const EVENT_PROPERTIES: { [E in AnalyticsEvent]: Record<KeysOfUnion<EventData[E]>, true> } = {
  [EVENT.linkRef]: { ref: true },
  [EVENT.caseOpen]: { case: true, from: true },
  [EVENT.caseNav]: { from: true, to: true, direction: true, place: true },
  [EVENT.imageOpen]: { case: true, image: true },
  [EVENT.imageNav]: { case: true, image: true, direction: true },
  [EVENT.figmaClick]: { place: true, case: true },
  [EVENT.githubClick]: { place: true },
  [EVENT.storybookClick]: { place: true },
  [EVENT.linkedinClick]: { target: true, place: true },
  [EVENT.emailClick]: { action: true, place: true },
  [EVENT.outboundClick]: { host: true },
  [EVENT.cvOpen]: { place: true },
  [EVENT.cvDownload]: { place: true },
  [EVENT.faqOpen]: { question: true },
  [EVENT.sectionLinkCopy]: { section: true },
  [EVENT.textCopy]: { element: true, area: true, label: true },
  [EVENT.themeSwitch]: { theme: true },
  [EVENT.pagePrint]: {},
  [EVENT.timeOnPage]: { time: true, seconds: true, scroll: true, section: true },
  [EVENT.deadClick]: { element: true, area: true, label: true },
  [EVENT.rageClick]: { element: true, area: true, label: true },
  [EVENT.pageNotFound]: { path: true },
  [EVENT.jsError]: { kind: true, message: true, file: true },
};

/** Every session property, the optional link tag included (it is sent only when the page has one). */
const sessionKeys = (): string[] => {
  window.history.replaceState(null, "", "/?ref=plan");
  const keys = Object.keys(sessionData());
  window.history.replaceState(null, "", "/");
  return keys;
};

describe("the tracking plan (docs/analytics.md)", () => {
  it("lists every event the code can send, and no other", () => {
    expect(sorted(tableNames("Events"))).toEqual(sorted(Object.values(EVENT)));
  });

  it("lists the properties each event carries, and no other", () => {
    const carried = Object.entries(EVENT_PROPERTIES).map(([name, keys]) => [name, sorted(Object.keys(keys))]);
    expect(planProperties()).toEqual(Object.fromEntries(carried));
  });

  it("lists every session property, and no other", () => {
    expect(sorted(tableNames("Session data"))).toEqual(sorted(sessionKeys()));
  });
});

describe("naming", () => {
  it("gives events kebab-case names within Umami's 50 characters", () => {
    for (const name of Object.values(EVENT)) {
      expect(name).toMatch(/^[a-z]+(?:-[a-z]+)*$/);
      expect(name.length).toBeLessThanOrEqual(50);
    }
  });

  it("never names a session property id: identify() would take it as a Distinct ID and link visits", () => {
    expect(sessionKeys()).not.toContain("id");
    for (const key of sessionKeys()) expect(key).toMatch(/^[a-z]+(?:[A-Z][a-z]+)*$/);
  });

  it("marks only known events as passive", () => {
    for (const name of PASSIVE_EVENTS) expect(Object.values(EVENT)).toContain(name);
  });
});
