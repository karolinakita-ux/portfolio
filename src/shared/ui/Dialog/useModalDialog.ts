import { useEffect, type RefObject } from "react";

import { lockScroll, unlockScroll } from "./Dialog.utils.ts";

/**
 * Opens the native <dialog> as a modal (showModal: the page behind becomes inert, focus stays inside)
 * while `open`, and locks page scroll. The dialog's close event unlocks it (Dialog); unmounting
 * while open unlocks it too.
 */
export function useModalDialog(dialogRef: RefObject<HTMLDialogElement | null>, open: boolean): void {
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.showModal();
      lockScroll();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [dialogRef, open]);

  useEffect(() => unlockScroll, []);
}
