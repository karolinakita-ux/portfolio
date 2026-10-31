import { MAX_ZOOM_STEP } from "#features/image-viewer/lightbox.constants.ts";
import { IconButton } from "#shared/ui/IconButton/IconButton.tsx";
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from "#shared/ui/icons/icons.tsx";

import { styles } from "./LightboxToolbar.styles.ts";
import type { LightboxToolbarProps } from "./LightboxToolbar.types.ts";

/** Previous / Next (with more than one image), zoom out / level / zoom in (every screen), browse hints. */
export function LightboxToolbar({
  count,
  zoomStep,
  zoomLabel,
  loaded,
  zoomInRef,
  onStep,
  onZoom,
}: LightboxToolbarProps) {
  const browsable = count > 1;
  return (
    <div className={styles.root(browsable)}>
      {browsable && <IconButton label="Previous image" icon={ChevronLeft} onClick={() => onStep(-1)} />}
      <div className={styles.center}>
        <div role="group" aria-label="Zoom" className={styles.zoom}>
          <IconButton
            label="Zoom out"
            title="Zoom out (-)"
            aria-keyshortcuts="-"
            icon={ZoomOut}
            aria-disabled={zoomStep === 0 || !loaded}
            onClick={() => onZoom(zoomStep - 1)}
          />
          <p aria-live="polite" className={styles.zoomLevel}>
            {zoomLabel}
          </p>
          <IconButton
            ref={zoomInRef}
            label="Zoom in"
            title="Zoom in (+)"
            aria-keyshortcuts="+"
            icon={ZoomIn}
            aria-disabled={zoomStep === MAX_ZOOM_STEP || !loaded}
            onClick={() => onZoom(zoomStep + 1)}
          />
        </div>
        {browsable && (
          <>
            <p className={styles.keysHint}>Use ← and → to browse</p>
            <p className={styles.swipeHint}>Swipe to browse</p>
          </>
        )}
      </div>
      {browsable && <IconButton label="Next image" icon={ChevronRight} onClick={() => onStep(1)} />}
    </div>
  );
}
