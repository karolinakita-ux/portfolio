import { skeletonStyle } from "#features/image-viewer/lightbox.utils.ts";
import { ThumbnailScaffold } from "#shared/media/ThumbnailScaffold/ThumbnailScaffold.tsx";

import { styles } from "./LoadingSkeleton.styles.ts";
import type { LoadingSkeletonProps } from "./LoadingSkeleton.types.ts";

/**
 * Placeholder while an image loads: the size the fitted image will have
 * (.kb-lightbox-skeleton in lightbox.css), or the whole pane when the size is unknown.
 */
export function LoadingSkeleton({ item, className }: LoadingSkeletonProps) {
  const style = skeletonStyle(item);
  return (
    <div aria-hidden="true" style={style} className={styles.root(style !== undefined, className)}>
      <ThumbnailScaffold />
    </div>
  );
}
