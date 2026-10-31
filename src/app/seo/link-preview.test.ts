import { existsSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { headersFor } from "#test/headers.ts";

import { SITE_URL } from "./seo.constants.ts";

/**
 * The link-preview image (og:image, twitter:image): the Light "Portfolio Cover" from Figma, one image for every
 * viewer, because a link preview cannot follow the viewer's theme (docs/design.md). LinkedIn, Facebook, Slack and X
 * fetch it by its absolute URL, so a renamed or deleted file shows only as a preview without a picture: these
 * checks keep the tags and the file together. Every prerendered page keeps the template's image tags
 * (scripts/prerender.ts changes the address, title and description).
 */
const ROOT = process.cwd();
const head = new DOMParser().parseFromString(readFileSync(join(ROOT, "index.html"), "utf8"), "text/html").head;
const meta = (key: string): string =>
  head.querySelector(`meta[property="${key}"], meta[name="${key}"]`)?.getAttribute("content") ?? "";

const imageUrl = meta("og:image");
const path = imageUrl.slice(SITE_URL.length);

describe("link-preview image", () => {
  it("is one absolute address under /assets for Open Graph and X, with one alt text", () => {
    expect(imageUrl.startsWith(`${SITE_URL}/assets/`), imageUrl).toBe(true);
    expect(meta("twitter:image")).toBe(imageUrl);
    expect(meta("twitter:card")).toBe("summary_large_image");
    expect(meta("og:image:alt")).not.toBe("");
    expect(meta("twitter:image:alt")).toBe(meta("og:image:alt"));
  });

  it("is a 1200 x 630 PNG in public/, as the tags say, well under 1 MB", () => {
    const file = join(ROOT, "public", path);
    expect(existsSync(file), `public${path}`).toBe(true);
    const data = readFileSync(file);
    expect(data.subarray(0, 8).toString("hex"), "PNG signature").toBe("89504e470d0a1a0a");
    expect(meta("og:image:type")).toBe("image/png");
    expect(`${meta("og:image:width")}x${meta("og:image:height")}`).toBe("1200x630");
    expect(`${String(data.readUInt32BE(16))}x${String(data.readUInt32BE(20))}`, "PNG header").toBe("1200x630");
    expect(statSync(file).size).toBeLessThan(1024 * 1024);
  });

  it("may be fetched by link-preview services and search engines", () => {
    const disallowed = readFileSync(join(ROOT, "public", "robots.txt"), "utf8")
      .split("\n")
      .flatMap((line) => /^Disallow:\s*(\S+)/i.exec(line)?.[1] ?? []);
    expect(disallowed.filter((prefix) => path.startsWith(prefix))).toEqual([]);
    expect(headersFor(path).filter((header) => /^X-Robots-Tag:/i.test(header))).toEqual([]);
  });

  it("is where old shares of the earlier image's address lead (a 301 in _redirects)", () => {
    const OLD = "/assets/site/og-image.png"; // until 5.14.5
    const rules = readFileSync(join(ROOT, "public", "_redirects"), "utf8")
      .split("\n")
      .filter((line) => line.trim() && !line.startsWith("#"))
      .map((line) => line.trim().split(/\s+/));
    expect(rules).toContainEqual([OLD, path, "301"]);
    // Netlify serves a file that exists before it reads a rule without "!".
    expect(existsSync(join(ROOT, "public", OLD))).toBe(false);
  });
});
