export type ImageStatus = "loading" | "loaded" | "error";

/** An image's status together with the src it belongs to. */
export interface ImageStatusState {
  src: string;
  status: ImageStatus;
}
