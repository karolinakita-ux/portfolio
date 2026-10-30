import sharp from "sharp";

/**
 * How far an image's content sits from its edges, against the band a hover zoom hides (src/app/zoom-margins.test.ts).
 * The zoom scales the image inside a frame that clips it, so at each edge it hides (1 - 1 / zoom) / 2 of the
 * image's width or height, at any rendered size.
 */
export const EDGES = ["top", "right", "bottom", "left"] as const;
export type Edge = (typeof EDGES)[number];

/** The zoom a component's hover classes apply: `scale-[1.02]` or `scale-102`; 1 without one. */
export function zoomOf(classes: string): number {
  const match = /scale-\[([\d.]+)\]|scale-(\d+)\b/.exec(classes);
  if (!match) return 1;
  return match[1] === undefined ? Number(match[2]) / 100 : Number(match[1]);
}

/** Image px a zoom hides at one edge of a side `size` px long. */
export const zoomBand = (size: number, zoom: number): number => (size * (1 - 1 / zoom)) / 2;

/** A step between neighbouring lines this large (0-255, any channel) is text, an icon or a line, not a gradient. */
const STEP = 40;

/**
 * Where content starts at each edge, in image px: the first line that differs sharply from the next line inward,
 * over white and over black (so transparency counts), in the middle 80% of the edge (an image's own rounded corners
 * and the frame's do not count). Scans `depth` lines at most. `seeThrough`: the page shows around the image (no
 * frame), so the image's own outermost line is compared with transparency too: a border on the edge counts.
 */
export async function contentMargins(file: string, depth: number, seeThrough = false): Promise<Record<Edge, number>> {
  const { data, info } = await sharp(file).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width, height } = info;
  const inside = (x: number, y: number): boolean => x >= 0 && y >= 0 && x < width && y < height;
  const differ = (x1: number, y1: number, x2: number, y2: number): boolean => {
    const i = (y1 * width + x1) * 4;
    const j = (y2 * width + x2) * 4;
    // Outside the image: transparent.
    const a1 = inside(x1, y1) ? (data[i + 3] ?? 0) / 255 : 0;
    const a2 = inside(x2, y2) ? (data[j + 3] ?? 0) / 255 : 0;
    for (const background of [255, 0])
      for (let c = 0; c < 3; c++) {
        const p = (data[i + c] ?? 0) * a1 + background * (1 - a1);
        const q = (data[j + c] ?? 0) * a2 + background * (1 - a2);
        if (Math.abs(p - q) > STEP) return true;
      }
    return false;
  };
  const scan = (length: number, size: number, at: (k: number, t: number) => [number, number]): number => {
    const from = Math.floor(length * 0.1);
    const to = Math.ceil(length * 0.9);
    for (let k = seeThrough ? -1 : 0; k < Math.min(depth, size - 1); k++)
      for (let t = from; t < to; t++) if (differ(...at(k, t), ...at(k + 1, t))) return k + 1;
    return depth;
  };
  return {
    top: scan(width, height, (k, t) => [t, k]),
    right: scan(height, width, (k, t) => [width - 1 - k, t]),
    bottom: scan(width, height, (k, t) => [t, height - 1 - k]),
    left: scan(height, width, (k, t) => [k, t]),
  };
}

export interface ZoomCheck {
  zoom: number;
  /** How many bands the content keeps clear of. */
  bands: number;
  /** The page shows around the image (no frame): see `contentMargins`. */
  seeThrough: boolean;
}

/**
 * The edges where content sits inside `bands` times the band `zoom` hides, each with its numbers
 * ("top: content 0 px from the edge, needs 26.4 px"). Empty when the image clears the zoom.
 */
export async function edgesInZoomBand(
  file: string,
  { zoom, bands, seeThrough }: ZoomCheck,
): Promise<Partial<Record<Edge, string>>> {
  const { width, height } = await sharp(file).metadata();
  const limit = (edge: Edge): number => bands * zoomBand(edge === "top" || edge === "bottom" ? height : width, zoom);
  const margins = await contentMargins(file, Math.ceil(Math.max(...EDGES.map(limit))) + 1, seeThrough);
  const cut: Partial<Record<Edge, string>> = {};
  for (const edge of EDGES)
    if (margins[edge] < limit(edge))
      cut[edge] = `content ${String(margins[edge])} px from the edge, needs ${limit(edge).toFixed(1)} px`;
  return cut;
}
