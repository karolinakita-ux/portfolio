import type { RefObject } from "react";

export interface LightboxToolbarProps {
  count: number;
  zoomStep: number;
  /** "Fit" or the zoom level, e.g. "150%". */
  zoomLabel: string;
  loaded: boolean;
  zoomInRef: RefObject<HTMLButtonElement | null>;
  onStep: (delta: number) => void;
  onZoom: (step: number) => void;
}
