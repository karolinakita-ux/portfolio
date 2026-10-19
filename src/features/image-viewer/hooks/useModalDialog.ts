import { useEffect, type RefObject } from "react";

import { lockScroll, unlockScroll } from "#features/image-viewer/lightbox.utils.ts";

/**
 * Opens the native <dialog> as a modal (showModal: the page behind becomes inert, focus stays inside)
 * while `isOpen`, and locks page scroll. The dialog's own close event unlocks it (see LightboxDialog);
 * unmounting while open unlocks it too.
 */
export function useModalDialog(dialogRef: RefObject<HTMLDialogElement | null>, isOpen: boolean): void {
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (isOpen && !dialog.open) {
      dialog.showModal();
      lockScroll();
    } else if (!isOpen && dialog.open) {
      dialog.close();
    }
  }, [dialogRef, isOpen]);

  useEffect(() => unlockScroll, []);
}
