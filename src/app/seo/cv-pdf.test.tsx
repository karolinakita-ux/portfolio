import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { CvSheet } from "#features/cv/components/CvSheet/CvSheet.tsx";
import { CV_PDF_ATTRIBUTE, CV_SHEET_ID } from "#features/cv/cv.constants.ts";
import { CV } from "#features/cv/cv.content.ts";
import { PROFILE } from "#shared/content/profile.ts";
import { VIEW, VIEW_PATHS } from "#shared/lib/routes/routes.constants.ts";
import { titleForView } from "#shared/lib/routes/routes.utils.ts";
import { headersFor } from "#test/headers.ts";

import { CV_PDF_URL, SITE_URL } from "./seo.constants.ts";

/**
 * The CV as a PDF (public/karolina-kita-cv.pdf), made from the /cv page by `yarn cv-pdf` (scripts/cv-pdf.ts) and
 * committed. The script writes scripts/cv-pdf.lock.json with hashes of the sheet's text and of its elements and
 * classes, and the page count; this test hashes the page the same way, so a CV edit without a new PDF fails here
 * instead of going live stale. A change in tokens.css or print.css is not seen: run `yarn cv-pdf` after one.
 */
const ROOT = process.cwd();
const read = (...path: string[]): string => readFileSync(join(ROOT, ...path)).toString("latin1");
const pdf = read("public", "karolina-kita-cv.pdf");
const lock = JSON.parse(read("scripts", "cv-pdf.lock.json")) as { textHash: string; classHash: string; pages: number };

const hash = (text: string): string => "sha256-" + createHash("sha256").update(text).digest("hex");

/**
 * Hashed as scripts/cv-pdf.ts does in the browser: the sheet's text, a line break and the PDF's footer; and each
 * element of the sheet with its classes, in document order (a style change can move the layout or the page break).
 */
function sheetHashes(): { textHash: string; classHash: string } {
  const { unmount } = render(<CvSheet onNavigate={() => undefined} />);
  const sheet = screen.getByRole("article", { name: CV.header.name });
  expect(sheet).toHaveAttribute("id", CV_SHEET_ID); // the element scripts/cv-pdf.ts prints
  const text = sheet.textContent + "\n" + (sheet.getAttribute(CV_PDF_ATTRIBUTE.footer) ?? "");
  const classes = [sheet, ...sheet.querySelectorAll("*")]
    .map((node) => node.localName + "." + (node.getAttribute("class") ?? ""))
    .join("\n");
  unmount();
  return { textHash: hash(text), classHash: hash(classes) };
}

const count = (pattern: RegExp): number => pdf.match(pattern)?.length ?? 0;

describe("the CV as a PDF", () => {
  it("has the CV page's text and styles: after a CV change, run `yarn cv-pdf` and commit the PDF and its lock", () => {
    const { textHash, classHash } = sheetHashes();
    expect(textHash, "the CV's text changed: run `yarn cv-pdf`").toBe(lock.textHash);
    expect(classHash, "the CV's markup or classes changed: run `yarn cv-pdf`").toBe(lock.classHash);
  });

  it("is A4, with as many pages as the lock and the Download labels say (at most 2)", () => {
    expect(pdf.startsWith("%PDF-")).toBe(true);
    expect(count(/\/Type\s*\/Page(?![a-zA-Z])/g)).toBe(lock.pages);
    expect(lock.pages).toBe(PROFILE.cvPdfPages);
    expect(lock.pages).toBeLessThanOrEqual(2);
    const boxes = [...pdf.matchAll(/\/MediaBox\s*\[0 0 ([\d.]+) ([\d.]+)\]/g)];
    expect(boxes).toHaveLength(lock.pages);
    // A4 is 595.3 x 841.9 pt; Chromium rounds it to whole pixels at 96 dpi (595.9 x 842.9).
    for (const [, width = "", height = ""] of boxes) {
      expect(Math.abs(Number(width) - 595.3)).toBeLessThan(1.5);
      expect(Math.abs(Number(height) - 841.9)).toBeLessThan(1.5);
    }
  });

  it("is tagged for screen readers, with an outline, its title, and English as its only language", () => {
    expect(pdf).toContain("/StructTreeRoot");
    expect(pdf).toMatch(/\/MarkInfo\s*<<\/Type \/MarkInfo\s*\/Marked true>>/);
    expect(pdf).toContain("/Outlines");
    expect(pdf, "the page title changed: run `yarn cv-pdf`").toContain(`/Title (${titleForView(VIEW.cv)})`);
    expect(pdf).toContain("/Lang (en)");
    expect(pdf).not.toContain("/Lang (pl)");
    expect(count(/\/S \/H1\b/g)).toBe(1);
    expect(count(/\/S \/H2\b/g)).toBe(4);
    expect(count(/\/S \/H3\b/g)).toBe(CV.experience.length + CV.education.length);
    expect(count(/\/S \/LI\b/g)).toBeGreaterThan(20);
  });

  it("links the email, LinkedIn and the portfolio (with the link tag ?ref=cv), all clickable", () => {
    const uris = new Set([...pdf.matchAll(/\/URI\s*\(([^)]*)\)/g)].map(([, uri]) => uri));
    expect(uris).toEqual(new Set(["mailto:" + PROFILE.email, PROFILE.linkedinUrl, CV.header.site.pdfHref]));
  });

  it("keeps its address, is checked again on every visit, and sends search engines to the CV page", () => {
    expect(PROFILE.cvPdfUrl).toBe("/karolina-kita-cv.pdf");
    expect(CV_PDF_URL).toBe(SITE_URL + PROFILE.cvPdfUrl);
    const headers = headersFor(PROFILE.cvPdfUrl);
    expect(headers).toContain("Cache-Control: public, max-age=0, must-revalidate");
    expect(headers).toContain(`Link: <${SITE_URL}${VIEW_PATHS[VIEW.cv]}>; rel="canonical"`);
    expect(headers.filter((header) => /^X-Robots-Tag:/i.test(header))).toEqual([]);
  });

  it("is published: .gitignore keeps other PDFs out of the repo, not this one", () => {
    const lines = read(".gitignore").split(/\r?\n/);
    expect(lines.indexOf("*.pdf")).toBeGreaterThanOrEqual(0);
    expect(lines.indexOf("!public/karolina-kita-cv.pdf")).toBeGreaterThan(lines.indexOf("*.pdf"));
  });
});
