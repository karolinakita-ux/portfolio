import type { Navigate } from "#shared/lib/routes/routes.types.ts";

export interface AppProps {
  /** Base URL of every image (screenshots, thumbnails, portrait); ASSET_BASE (App.constants.tsx) by default. */
  assetBase?: string;
  portraitSrc?: string;
}

/** What a view needs from the app shell. */
export interface ViewContext {
  navigate: Navigate;
  resolveAsset: (name: string) => string;
  portraitSrc: string;
}
