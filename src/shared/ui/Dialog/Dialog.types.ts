import type { KeyboardEventHandler, ReactNode, RefObject } from "react";

export interface DialogProps {
  /** The caller keeps the ref, e.g. to close the dialog from a button (dialogRef.current.close()). */
  dialogRef: RefObject<HTMLDialogElement | null>;
  open: boolean;
  /** Id of the dialog's title. */
  labelledBy: string;
  /** After the dialog has closed: Escape, a backdrop click or dialog.close(). */
  onClose: () => void;
  onKeyDown?: KeyboardEventHandler<HTMLDialogElement>;
  children: ReactNode;
}
