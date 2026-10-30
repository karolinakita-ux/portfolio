/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** The version in package.json, set by vite.config.ts (define). */
  readonly APP_VERSION: string;
  /** The year of the build (the footer's copyright year), set by vite.config.ts (define). */
  readonly APP_BUILD_YEAR: number;
}

declare module "virtual:asset-sizes" {
  /** Pixel size of each image in public/assets by its path under /assets ("cases/project-planning/thumbnail-light.webp"): [width, height]. Built by vite.config.ts. */
  const sizes: Readonly<Record<string, readonly [number, number]>>;
  export default sizes;
}
