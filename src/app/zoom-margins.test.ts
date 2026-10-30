import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { AUTOMOTIVE_CASE } from "#features/case-studies/content/automotive.content.ts";
import { DATA_GOVERNANCE_CASE } from "#features/case-studies/content/data-governance.content.ts";
import { PROJECT_PLANNING_CASE } from "#features/case-studies/content/project-planning.content.tsx";
import { SMART_TICKET_CASE } from "#features/case-studies/content/smart-ticket.content.ts";
import { cardAssets, caseCards } from "#features/case-studies/gallery/gallery.utils.ts";
import { WORK_CASES } from "#features/work/work.content.ts";
import { styles as thumbnailStyles } from "#shared/media/CaseThumbnail/CaseThumbnail.styles.ts";
import { styles as screenshotStyles } from "#shared/media/Screenshot/Screenshot.styles.ts";
import { EDGES, edgesInZoomBand, zoomOf, type Edge, type ZoomCheck } from "#test/image-margins.ts";

/**
 * The hover zoom on case images (Screenshot, CaseThumbnail) scales the image inside a frame that clips it, so while
 * the pointer is over it a band at each edge is hidden (src/test/image-margins.ts). Content in that band is cut on
 * hover: the Smart Ticket user flow lost the top of its legend and its card border (5.14.6). Each image keeps its
 * content out of the band:
 * - framed screenshots: outside the band. A full-screen capture may run its UI to the edge (a header bar, a
 *   sheet); what counts is where text, icons and lines start.
 * - images without a frame (`frameless`) and Work thumbnails: outside twice the band. Their own card, legend or
 *   composition must stay whole, and the frame's rounded corners clip a little more on a phone.
 * A cut image gets padding in the file itself: its canvas extended evenly with its own background.
 */
const SCREENSHOT_ZOOM = zoomOf(screenshotStyles.image(true));
const THUMBNAIL_ZOOM = zoomOf(thumbnailStyles.image(true, true, false));

/**
 * UI that runs to the edge of a full-screen capture, checked by eye: what the zoom trims there is not content.
 * The guard fails when an entry is no longer needed.
 */
const RUNS_TO_THE_EDGE: Readonly<Record<string, readonly Edge[]>> = {
  // A bottom sheet over the dimmed screen reaches both screen edges: the zoom trims the side of its rounded top
  // corners (about 3 px on the page). In Dark mode the corners are too faint to count.
  "cases/smart-ticket/blik-confirmation-light.webp": ["left", "right"],
  "cases/smart-ticket/ticket-selection-sheet-light.webp": ["left", "right"],
  "cases/smart-ticket/vehicle-activation-light.webp": ["left", "right"],
};

interface CheckedImage extends ZoomCheck {
  asset: string;
  kind: "framed" | "frameless" | "thumbnail";
}

const FRAMED: ZoomCheck = { zoom: SCREENSHOT_ZOOM, bands: 1, seeThrough: false };
const FRAMELESS: ZoomCheck = { zoom: SCREENSHOT_ZOOM, bands: 2, seeThrough: true };
const THUMBNAIL: ZoomCheck = { zoom: THUMBNAIL_ZOOM, bands: 2, seeThrough: false };

const images = new Map<string, CheckedImage>();
for (const c of [SMART_TICKET_CASE, AUTOMOTIVE_CASE, PROJECT_PLANNING_CASE, DATA_GOVERNANCE_CASE])
  for (const card of caseCards(c))
    for (const asset of cardAssets(card))
      if (images.get(asset)?.kind !== "frameless")
        images.set(
          asset,
          card.frameless ? { asset, kind: "frameless", ...FRAMELESS } : { asset, kind: "framed", ...FRAMED },
        );
for (const item of WORK_CASES)
  for (const asset of [item.asset, item.darkAsset].filter((a): a is string => a !== undefined))
    images.set(asset, { asset, kind: "thumbnail", ...THUMBNAIL });

describe("hover zoom", () => {
  it("reads the zoom from the components' hover classes and checks every case image", () => {
    expect(SCREENSHOT_ZOOM).toBeGreaterThan(1);
    expect(THUMBNAIL_ZOOM).toBeGreaterThan(1);
    expect(images.size).toBeGreaterThan(100);
    expect([...images.values()].filter((image) => image.kind === "frameless").length).toBeGreaterThan(0);
    for (const asset of Object.keys(RUNS_TO_THE_EDGE)) expect(images.get(asset)?.kind, asset).toBe("framed");
  });

  it.each([...images.values()])("keeps the content of $asset ($kind) out of the band it hides", async (image) => {
    const cut = await edgesInZoomBand(join(process.cwd(), "public", "assets", image.asset), image);
    const allowed = RUNS_TO_THE_EDGE[image.asset] ?? [];
    const inBand = EDGES.filter((edge) => cut[edge] !== undefined && !allowed.includes(edge));
    expect(
      inBand.map((edge) => `${edge}: ${cut[edge] ?? ""}`),
      image.asset,
    ).toEqual([]);
    for (const edge of allowed)
      expect(cut[edge], `${image.asset}: ${edge} is clear now, remove its entry`).toBeDefined();
  });
});
