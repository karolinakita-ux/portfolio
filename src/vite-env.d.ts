/// <reference types="vite/client" />

declare module "virtual:asset-sizes" {
  /** Pixel size of each PNG in public/assets, by file name: [width, height]. Built by vite.config.ts. */
  const sizes: Readonly<Record<string, readonly [number, number]>>;
  export default sizes;
}
