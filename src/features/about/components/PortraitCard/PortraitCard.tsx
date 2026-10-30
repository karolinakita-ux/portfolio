import { PROFILE } from "#shared/content/profile.ts";
import { assetSize } from "#shared/media/asset-size/asset-size.utils.ts";
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
 * Default fetch priority: on phones the portrait is below the first screen, and with a high one the preload React
 * puts at the top of the prerendered page would compete with the styles, fonts and script.
 * The frame sets the size; the image still carries its file's width and height, as every image does.
 * The first HTML shows the portrait as it arrives, with no fade on About's first screen (`shown`); after a
 * navigation within the site it fades in once loaded, unless the browser already has it.
 */
export function PortraitCard({ src }: PortraitCardProps) {
  const { status, setStatus, ref, shown } = useImageStatus(src);
  const size = assetSize(src);
  return (
    <figure className={styles.root}>
      <div className={styles.frame}>
        {status !== "error" && (
          <img
            ref={ref}
            src={src}
            width={size?.width}
            height={size?.height}
            alt={PROFILE.name}
            decoding="async"
            onLoad={() => setStatus("loaded")}
            onError={() => setStatus("error")}
            className={styles.image(shown)}
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
