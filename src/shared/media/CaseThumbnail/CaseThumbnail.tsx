import { useImageStatus } from "#shared/media/image-status/useImageStatus.ts";
import { ThumbnailScaffold } from "#shared/media/ThumbnailScaffold/ThumbnailScaffold.tsx";
import { VisuallyHidden } from "#shared/ui/VisuallyHidden/VisuallyHidden.tsx";

import { styles } from "./CaseThumbnail.styles.ts";
import type { CaseThumbnailProps } from "./CaseThumbnail.types.ts";

/**
 * Work-page case thumbnail: fixed 4:3 frame, image contained, scaffold while loading.
 * `interactive`: hover feedback (border, slight zoom) when an ancestor with `group/thumb` is hovered.
 */
export function CaseThumbnail({ src, alt, interactive = false }: CaseThumbnailProps) {
  const { status, setStatus, ref } = useImageStatus(src);
  return (
    <div className={styles.root(interactive)}>
      {status !== "loaded" && <ThumbnailScaffold failed={status === "error"} />}
      {status !== "error" && (
        <img
          ref={ref}
          src={src}
          alt={alt}
          loading="lazy"
          decoding="async"
          onLoad={() => setStatus("loaded")}
          onError={() => setStatus("error")}
          className={styles.image(status, interactive)}
        />
      )}
      {status === "error" && <VisuallyHidden>{alt}</VisuallyHidden>}
    </div>
  );
}
