import ASSET_SIZES from "virtual:asset-sizes";

import type { AssetSize } from "./asset-size.types.ts";

/**
 * The path after an image URL's first /assets folder, the key of virtual:asset-sizes: "cases/automotive/x.webp"
 * from "/assets/cases/automotive/x.webp", a relative build's "./assets/..." or a full URL. Query and hash stay out.
 */
const UNDER_ASSETS = /^(?:[^?#]*?\/)?assets\/([^?#]+)/;

/**
 * Pixel size of an image under /assets, read from its file at build time (vite.config.ts), or undefined for any
 * other file. Images take it as width and height attributes, so the prerendered page already holds each image's
 * height before the file arrives and nothing below it moves. CSS keeps them responsive (w-full h-auto, or a
 * frame the image covers).
 */
export function assetSize(src: string): AssetSize | undefined {
  const key = UNDER_ASSETS.exec(src)?.[1];
  const size = key === undefined ? undefined : ASSET_SIZES[key];
  return size ? { width: size[0], height: size[1] } : undefined;
}
