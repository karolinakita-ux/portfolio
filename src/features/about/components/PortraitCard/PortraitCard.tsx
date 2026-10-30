import { PROFILE } from "#shared/content/profile.ts";
import { useImageStatus } from "#shared/media/image-status/useImageStatus.ts";

import { styles } from "./PortraitCard.styles.ts";
import type { PortraitCardProps } from "./PortraitCard.types.ts";

/**
 * Transparent cutout over bgBgAvatarBase + avatar glow tokens.
 * Mobile: fixed portrait aspect ratio. From md up the figure stretches to the
 * height of the card list (grid stretch), the photo frame takes the remaining
 * height above the caption (flex-1), and the image covers it anchored to the
 * top - so the caption's bottom lines up with the 4th card. If the image
 * cannot load, the glow frame stays on its own.
 */
export function PortraitCard({ src }: PortraitCardProps) {
  const { status, setStatus, ref } = useImageStatus(src);
  const loaded = status === "loaded";
  return (
    <figure className={styles.root}>
      <div className={styles.frame}>
        {status !== "error" && (
          <img
            ref={ref}
            src={src}
            alt={PROFILE.name}
            decoding="async"
            fetchPriority="high"
            onLoad={() => setStatus("loaded")}
            onError={() => setStatus("error")}
            className={styles.image(loaded)}
          />
        )}
      </div>
      <figcaption className={styles.caption}>
        <span className={styles.captionLine}>Based in Poland</span>{" "}
        <span className={styles.captionLine}>{PROFILE.role}</span>
      </figcaption>
    </figure>
  );
}
