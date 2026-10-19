import type { LightboxState } from "#features/image-viewer/lightbox.types.ts";

export interface LightboxDialogProps {
  state: LightboxState | null;
  onClosed: () => void;
  onStep: (delta: number) => void;
}
