import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { headersFor } from "#test/headers.ts";

/**
 * The site icons. Google Search does not read SVG favicons (it lists BMP, GIF, ICO, PNG, JPEG, PPM and TIFF)
 * and shows a plain globe instead, so index.html links PNG and ICO copies after the SVG, made from it by
 * `yarn favicons` (scripts/favicons.ts). Google fetches them as Googlebot-Image and asks for stable URLs.
 * Every prerendered page keeps the links: scripts/prerender.ts fails the build when one loses them.
 */
const ROOT = process.cwd();
const read = (...path: string[]): Buffer => readFileSync(join(ROOT, ...path));

const html = new DOMParser().parseFromString(read("index.html").toString("utf8"), "text/html");
const links = Array.from(html.head.querySelectorAll('link[rel="icon"], link[rel="apple-touch-icon"]'));
const hrefs = links.map((link) => link.getAttribute("href") ?? "");

/** A PNG's size and colour type, from its header: colour type 2 is RGB, 6 is RGB with alpha. */
function png(data: Buffer): { size: string; colourType: number } {
  expect(data.subarray(0, 8).toString("hex"), "PNG signature").toBe("89504e470d0a1a0a");
  return { size: `${String(data.readUInt32BE(16))}x${String(data.readUInt32BE(20))}`, colourType: data.readUInt8(25) };
}

/** The sizes of the PNG images in an ICO file: a 6-byte header, then a 16-byte entry per image. */
function icoSizes(data: Buffer): string[] {
  expect(data.readUInt16LE(2), "ICO type: icon").toBe(1);
  return Array.from({ length: data.readUInt16LE(4) }, (_, index) => {
    const entry = 6 + 16 * index;
    const start = data.readUInt32LE(entry + 12);
    const { size } = png(data.subarray(start, start + data.readUInt32LE(entry + 8)));
    // A width or height of 0 in the entry means 256.
    expect(size, "ICO entry and its image agree").toBe(
      `${String(data.readUInt8(entry) || 256)}x${String(data.readUInt8(entry + 1) || 256)}`,
    );
    return size;
  });
}

describe("site icons", () => {
  it("are linked from index.html: the SVG first, then the PNG and ICO copies, then the iOS icon", () => {
    const attributes = links.map((link) => Object.fromEntries(Array.from(link.attributes, (a) => [a.name, a.value])));
    expect(attributes).toEqual([
      { rel: "icon", href: "/favicon.svg", type: "image/svg+xml" },
      { rel: "icon", href: "/favicon-96x96.png", type: "image/png", sizes: "96x96" },
      { rel: "icon", href: "/favicon.ico", sizes: "48x48" },
      { rel: "apple-touch-icon", href: "/apple-touch-icon.png" },
    ]);
  });

  it("are in public/, square, in the sizes the links name", () => {
    for (const href of hrefs) expect(existsSync(join(ROOT, "public", href)), `public${href}`).toBe(true);
    const [, width, height] = /viewBox="0 0 (\d+) (\d+)"/.exec(read("public", "favicon.svg").toString("utf8")) ?? [];
    expect(width, "favicon.svg viewBox").toBeDefined();
    expect(width).toBe(height);
    expect(png(read("public", "favicon-96x96.png")).size).toBe("96x96");
    expect(icoSizes(read("public", "favicon.ico"))).toEqual(["16x16", "32x32", "48x48"]);
    // iOS shows transparent pixels as black: the touch icon is plain RGB, with no alpha channel.
    expect(png(read("public", "apple-touch-icon.png"))).toEqual({ size: "180x180", colourType: 2 });
  });

  it("may be fetched by search engines, with a short cache because the names never change", () => {
    const disallowed = read("public", "robots.txt")
      .toString("utf8")
      .split("\n")
      .flatMap((line) => /^Disallow:\s*(\S+)/i.exec(line)?.[1] ?? []);
    for (const href of hrefs) {
      const headers = headersFor(href);
      expect(
        headers.filter((header) => /^X-Robots-Tag:/i.test(header)),
        href,
      ).toEqual([]);
      expect(
        disallowed.filter((path) => href.startsWith(path)),
        href,
      ).toEqual([]);
      const cache = headers.find((header) => header.startsWith("Cache-Control:")) ?? "";
      const maxAge = Number(/max-age=(\d+)/.exec(cache)?.[1]);
      expect(maxAge, `${href}: an hour to a week`).toBeGreaterThanOrEqual(3600);
      expect(maxAge, `${href}: an hour to a week`).toBeLessThanOrEqual(604800);
    }
  });
});
