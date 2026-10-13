/// <reference types="vite/client" />

declare module "virtual:asset-sizes" {
  /** Pixel size of each image in public/assets by its path under /assets ("cases/meetestim/thumbnail.webp"): [width, height]. Built by vite.config.ts. */
  const sizes: Readonly<Record<string, readonly [number, number]>>;
  export default sizes;
}
