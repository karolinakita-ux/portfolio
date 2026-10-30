import { useState } from "react";

import { useDocumentTheme } from "#shared/hooks/theme/useDocumentTheme.ts";
import { assetSize } from "#shared/media/asset-size/asset-size.utils.ts";
import { useImageStatus } from "#shared/media/image-status/useImageStatus.ts";
import { themedSources } from "#shared/media/themed-image/themed-image.utils.ts";
import { ThumbnailScaffold } from "#shared/media/ThumbnailScaffold/ThumbnailScaffold.tsx";
import { VisuallyHidden } from "#shared/ui/VisuallyHidden/VisuallyHidden.tsx";

import { styles } from "./CaseThumbnail.styles.ts";
import type { CaseThumbnailProps } from "./CaseThumbnail.types.ts";

/**
 * Work-page case thumbnail: 16:10 frame filled edge to edge, rounded, no border; scaffold while loading.
 * `darkSrc`: shown in Dark mode; a missing or broken dark version falls back to `src`.
 * `interactive`: hover feedback (slight zoom) when an ancestor with `group/thumb` is hovered.
 * The frame sets the size; the image still carries its file's width and height, as every image does.
 */
export function CaseThumbnail({ src, darkSrc, alt, interactive = false }: CaseThumbnailProps) {
  const theme = useDocumentTheme();
  const sources = themedSources(theme, src, darkSrc);
  const [failed, setFailed] = useState<readonly string[]>([]);
  const currentSrc = sources.find((source) => !failed.includes(source)) ?? src;
  const size = assetSize(currentSrc);
  const hasNext = sources.indexOf(currentSrc) < sources.length - 1;
  const { status, setStatus, ref } = useImageStatus(currentSrc);

  const handleError = () => {
    if (hasNext) setFailed((list) => [...list, currentSrc]);
    else setStatus("error");
  };

  return (
    <div className={styles.root}>
      {status !== "loaded" && <ThumbnailScaffold failed={status === "error"} />}
      {status !== "error" && (
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
          className={styles.image(status, interactive)}
        />
      )}
      {status === "error" && <VisuallyHidden>{alt}</VisuallyHidden>}
    </div>
  );
}
