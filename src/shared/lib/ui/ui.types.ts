/** The parts of a mouse event that tell a plain left click from one that opens a new tab or window. */
export interface ClickModifiers {
  defaultPrevented: boolean;
  button: number;
  metaKey: boolean;
  ctrlKey: boolean;
  shiftKey: boolean;
  altKey: boolean;
}
