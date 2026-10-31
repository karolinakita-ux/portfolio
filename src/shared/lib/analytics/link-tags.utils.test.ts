import { describe, expect, it } from "vitest";

import { LINK_REF } from "./analytics.constants.ts";
import { sectionLinkQuery } from "./link-tags.utils.ts";
import { linkRef } from "./payload.utils.ts";

describe("sectionLinkQuery", () => {
  it("tags a link copied by a visitor who came without a tag as ?ref=section-link", () => {
    expect(sectionLinkQuery("")).toBe("?ref=section-link");
    // Click ids are not a tag, and never travel.
    expect(sectionLinkQuery("?fbclid=IwAR0abc&li_fat_id=1f2e")).toBe("?ref=section-link");
    // UTM tags without a source name nothing (the CV's PDF linked ?utm_medium=cv-pdf before 5.14.23).
    expect(sectionLinkQuery("?utm_medium=cv-pdf")).toBe("?ref=section-link");
    expect(linkRef(sectionLinkQuery(""))).toBe(LINK_REF.sectionLink);
  });

  it("keeps the copier's tag, so the visit still counts for that company or channel, marked as a section link", () => {
    expect(sectionLinkQuery("?ref=acme")).toBe("?ref=acme&utm_medium=section-link");
    expect(sectionLinkQuery("?fbclid=IwAR0abc&ref=acme&li_fat_id=1f2e")).toBe("?ref=acme&utm_medium=section-link");
    expect(sectionLinkQuery("?ref=cv")).toBe("?ref=cv&utm_medium=section-link");
    expect(linkRef(sectionLinkQuery("?ref=acme"))).toBe("acme");
  });

  it("passes a UTM-tagged link's tags on, with section-link as its medium", () => {
    expect(sectionLinkQuery("?utm_source=linkedin&utm_medium=social&utm_campaign=launch")).toBe(
      "?utm_source=linkedin&utm_campaign=launch&utm_medium=section-link",
    );
  });

  it("gives a copy of a copied link the same tags", () => {
    expect(sectionLinkQuery("?ref=section-link")).toBe("?ref=section-link");
    expect(sectionLinkQuery("?ref=acme&utm_medium=section-link")).toBe("?ref=acme&utm_medium=section-link");
  });
});
