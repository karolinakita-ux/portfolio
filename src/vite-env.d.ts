/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** The version in package.json, set by vite.config.ts (define). */
  readonly APP_VERSION: string;
}

declare module "virtual:asset-sizes" {
  /** Pixel size of each image in public/assets by its path under /assets ("cases/project-planning/thumbnail.webp"): [width, height]. Built by vite.config.ts. */
  const sizes: Readonly<Record<string, readonly [number, number]>>;
  export default sizes;
}
