import { INPUT_WINDOW_MS } from "./analytics.constants.ts";
import type { InputKind } from "./analytics.types.ts";

/**
 * Which input the visitor used last: mouse, touch, pen or keyboard. An event that follows within
 * INPUT_WINDOW_MS carries it (`input`), so the dashboard can tell a tap from a click. Nothing about
 * the key or the spot is kept, only the kind of input and when it happened.
 */

let last: { input: InputKind; at: number } | null = null;

/** Holding Shift or Ctrl while clicking is still a click. */
const MODIFIERS = new Set(["Shift", "Control", "Alt", "Meta", "AltGraph", "CapsLock"]);

export const pointerInput = (pointerType: string): InputKind =>
  pointerType === "touch" || pointerType === "pen" ? pointerType : "mouse";

const onPointer = (event: PointerEvent) => {
  last = { input: pointerInput(event.pointerType), at: performance.now() };
};

const onKey = (event: KeyboardEvent) => {
  if (!MODIFIERS.has(event.key)) last = { input: "keyboard", at: performance.now() };
};

/** The input behind what is happening now, or undefined when nothing was pressed just before (a print from the menu). */
export const recentInput = (): InputKind | undefined =>
  last && performance.now() - last.at <= INPUT_WINDOW_MS ? last.input : undefined;

/** Starts listening; returns the function that stops. Capture phase, so the input is known before any handler runs. */
export function watchInput(): () => void {
  const options = { capture: true, passive: true };
  document.addEventListener("pointerdown", onPointer, options);
  document.addEventListener("pointerup", onPointer, options);
  document.addEventListener("keydown", onKey, options);
  return () => {
    document.removeEventListener("pointerdown", onPointer, options);
    document.removeEventListener("pointerup", onPointer, options);
    document.removeEventListener("keydown", onKey, options);
    last = null;
  };
}
