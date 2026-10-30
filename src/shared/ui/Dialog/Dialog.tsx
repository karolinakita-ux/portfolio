import { useRef } from "react";

import { styles } from "./Dialog.styles.ts";
import type { DialogProps } from "./Dialog.types.ts";
import { unlockScroll } from "./Dialog.utils.ts";
import { useModalDialog } from "./useModalDialog.ts";

/**
 * Modal dialog on the native <dialog> (showModal): the page behind becomes inert, Escape closes it,
 * focus stays inside, and page scroll is locked while it is open. A click on the dimmed backdrop
 * closes it too. Return focus to the opener in `onClose`.
 */
export function Dialog({ dialogRef, open, labelledBy, onClose, onKeyDown, children }: DialogProps) {
  useModalDialog(dialogRef, open);
  // A press that starts inside the panel (selecting caption text, panning an image) and ends over the
  // backdrop also sends its click to the dialog: only a press that starts on the backdrop closes it.
  const backdropPressRef = useRef(false);

  return (
    // A native modal <dialog>: backdrop clicks land on the element itself, keys apply to the whole dialog.
    // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions
    <dialog
      ref={dialogRef}
      aria-labelledby={labelledBy}
      onClose={() => {
        unlockScroll();
        onClose();
      }}
      onKeyDown={onKeyDown}
      onPointerDown={(event) => {
        backdropPressRef.current = event.target === event.currentTarget;
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget && backdropPressRef.current) event.currentTarget.close();
      }}
      className={styles.root}
    >
      {children}
    </dialog>
  );
}
