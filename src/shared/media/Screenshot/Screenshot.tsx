import { useState } from "react";

import { useDocumentTheme } from "#shared/hooks/theme/useDocumentTheme.ts";
import { assetSize } from "#shared/media/asset-size/asset-size.utils.ts";
import { useImageStatus } from "#shared/media/image-status/useImageStatus.ts";
import { themedSources } from "#shared/media/themed-image/themed-image.utils.ts";
import { ThumbnailScaffold } from "#shared/media/ThumbnailScaffold/ThumbnailScaffold.tsx";
import { Maximize2 } from "#shared/ui/icons/icons.tsx";
import { VisuallyHidden } from "#shared/ui/VisuallyHidden/VisuallyHidden.tsx";

import { styles } from "./Screenshot.styles.ts";
import type { ScreenshotProps } from "./Screenshot.types.ts";

/**
 * Case-study screenshot at its natural aspect ratio (no cropping). In Dark mode it shows `darkSrc` when given;
 * a broken file falls back to the next one (dark version → `src` → `fallbackSrc`). The image carries the shown
 * file's width and height (`assetSize`), so the page holds its height before the file arrives.
 */
export function Screenshot({ src, darkSrc, fallbackSrc, alt, onExpand, imageId, frameless = false }: ScreenshotProps) {
  const theme = useDocumentTheme();
  const sources = themedSources(theme, src, darkSrc, fallbackSrc);
  // Files that failed to load: the image moves on to the next source in the list.
  const [failed, setFailed] = useState<readonly string[]>([]);
  const currentSrc = sources.find((source) => !failed.includes(source)) ?? src;
  const size = assetSize(currentSrc);
  const { status, setStatus, ref } = useImageStatus(currentSrc);
  const hasNext = sources.indexOf(currentSrc) < sources.length - 1;

  const handleError = () => {
    if (hasNext) setFailed((list) => [...list, currentSrc]);
    else setStatus("error");
  };

  if (status === "error") {
    return (
      <div className={styles.failed}>
        <ThumbnailScaffold failed />
        <VisuallyHidden>{alt}</VisuallyHidden>
      </div>
    );
  }

  const image = (
    <img
      ref={ref}
      src={currentSrc}
      width={size?.width}
      height={size?.height}
      alt={alt}
      loading="lazy"
      decoding="async"
      onLoad={() => setStatus("loaded")}
      onError={handleError}
      className={styles.image(onExpand !== undefined)}
    />
  );

  if (!onExpand) return <div className={styles.frame(frameless)}>{image}</div>;

  return (
    <button
      type="button"
      aria-haspopup="dialog"
      data-image={imageId}
      onClick={(event) => onExpand(event.currentTarget)}
      className={styles.button(frameless)}
    >
      <VisuallyHidden>View full size: </VisuallyHidden>
      {image}
      <span aria-hidden="true" className={styles.badge}>
        <Maximize2 size={12} />
        <span className={styles.badgeLabel}>View full size</span>
      </span>
    </button>
  );
}
