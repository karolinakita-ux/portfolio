import { SCROLL_LOCKED_CLASS } from "./dialog.constants.ts";

export const lockScroll = (): void => document.documentElement.classList.add(SCROLL_LOCKED_CLASS);

export const unlockScroll = (): void => document.documentElement.classList.remove(SCROLL_LOCKED_CLASS);
