import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { VIEW, VIEWS } from "#shared/lib/routes/routes.constants.ts";

import { HEAD_TAGS } from "./seo.constants.ts";
import type { PageHead } from "./seo.types.ts";
import { headFor, headTagSelector } from "./seo.utils.ts";
import { applyHead, withRootContent } from "./static-head.utils.ts";

const TEMPLATE = readFileSync(join(process.cwd(), "index.html"), "utf8");
const parse = (html: string) => new DOMParser().parseFromString(html, "text/html");

/** What a head says about its page: the title and each tag in HEAD_TAGS. */
const shown = (doc: Document) => ({
  title: doc.title,
  tags: HEAD_TAGS.map((tag) => [
    headTagSelector(tag),
    doc.querySelector(headTagSelector(tag))?.getAttribute(tag.attribute),
  ]),
});
const expected = (head: PageHead) => ({
  title: head.title,
  tags: HEAD_TAGS.map((tag) => [headTagSelector(tag), head[tag.field]]),
});
const robots = (doc: Document) => doc.querySelector('meta[name="robots"]')?.getAttribute("content");
const pageData = (doc: Document): unknown =>
  JSON.parse(doc.querySelector('script[type="application/ld+json"][data-page]')?.textContent ?? "null");

describe("index.html", () => {
  it("has each tag in HEAD_TAGS once, so the prerender and the app can find it", () => {
    for (const tag of HEAD_TAGS) expect(parse(TEMPLATE).querySelectorAll(headTagSelector(tag))).toHaveLength(1);
  });

  it("says what the Work page says, for any build without the prerender (the claude.ai artifact)", () => {
    expect(shown(parse(TEMPLATE))).toEqual(expected(headFor(VIEW.work)));
  });
});

describe("applyHead", () => {
  it.each(VIEWS)("writes the title, head tags and structured data of %s", (view) => {
    const head = headFor(view);
    const doc = parse(applyHead(TEMPLATE, head));
    expect(shown(doc)).toEqual(expected(head));
    expect(pageData(doc)).toEqual(head.jsonLd);
    expect(robots(doc)).toBe("index, follow, max-image-preview:large");
  });

  it("keeps search engines out of the 404 page", () => {
    expect(robots(parse(applyHead(TEMPLATE, headFor(VIEW.work), { noindex: true })))).toBe("noindex, follow");
  });

  it("writes copy with $ in it as it is: '$2M' is not a replacement pattern", () => {
    const copy = `Saved $2M: $1, $&, $' and $\` stay & <b>"text"</b>`;
    const head: PageHead = {
      title: copy,
      description: copy,
      url: "https://karolina.kita.company/about",
      jsonLd: { copy },
    };
    const html = withRootContent(applyHead(TEMPLATE, head), `<p>${copy}</p>`);
    const doc = parse(html);
    expect(shown(doc)).toEqual(expected(head));
    expect(pageData(doc)).toEqual({ copy });
    expect(html).toContain(`<div id="root"><p>${copy}</p></div>`);
  });

  it("fails the build when the template has lost a tag", () => {
    const template = TEMPLATE.replace(/<meta property="og:title"[^>]*>/, "");
    expect(() => applyHead(template, headFor(VIEW.about))).toThrow('meta[property="og:title"] not found');
  });
});
