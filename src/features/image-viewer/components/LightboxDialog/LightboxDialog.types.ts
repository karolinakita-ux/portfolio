import type { LightboxState } from "#features/image-viewer/lightbox.types.ts";
import type { LightboxItem } from "#shared/media/lightbox/lightbox.types.ts";

export interface LightboxDialogProps {
  state: LightboxState | null;
  /** After the dialog closed, with the image it showed and whether the visitor chose Go to Description. */
  onClosed: (shown: LightboxItem | undefined, toDescription: boolean) => void;
  onStep: (delta: number) => void;
}
