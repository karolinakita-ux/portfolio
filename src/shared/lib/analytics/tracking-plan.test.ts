import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { EVENT, PASSIVE_EVENTS } from "./analytics.constants.ts";
import { sessionData } from "./session.utils.ts";

/**
 * docs/analytics.md is the tracking plan: what is sent, why, and the naming rules. These checks keep it
 * in step with the code, so every event and session property is documented and none is left over.
 */
const plan = readFileSync(join(process.cwd(), "docs", "analytics.md"), "utf8");

/** The first-column names (`name`) of the table under a `## heading`. */
const tableNames = (heading: string): string[] => {
  const start = plan.indexOf("\n## " + heading + "\n");
  if (start < 0) throw new Error("docs/analytics.md has no section " + heading);
  const end = plan.indexOf("\n## ", start + 1);
  const section = plan.slice(start, end < 0 ? undefined : end);
  return [...section.matchAll(/^\| `([\w-]+)`/gm)].map(([, name = ""]) => name);
};

const sorted = (names: Iterable<string>) => [...names].sort();

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
