import { useCallback, useRef, type SyntheticEvent } from "react";

import { useImageStatus } from "#shared/media/image-status/useImageStatus.ts";

/**
 * Load state of the viewer's image. It counts as loaded once decoded (not just loaded), so the
 * skeleton never gives way to an empty frame; a late decode of an image the visitor has moved
 * on from changes nothing.
 */
export function useRevealedImage(src: string) {
  const imageRef = useRef<HTMLImageElement>(null);
  const { status, setStatus, ref: statusRef } = useImageStatus(src);

  const setImage = useCallback(
    (image: HTMLImageElement | null) => {
      imageRef.current = image;
      statusRef(image);
    },
    [statusRef],
  );

  const onLoad = (event: SyntheticEvent<HTMLImageElement>) => {
    const image = event.currentTarget;
    const reveal = () => {
      if (imageRef.current === image) setStatus("loaded"); // Not if the visitor moved on meanwhile.
    };
    if (typeof image.decode === "function") image.decode().then(reveal, reveal);
    else reveal();
  };

  return { status, imageRef, setImage, onLoad, onError: () => setStatus("error") };
}
