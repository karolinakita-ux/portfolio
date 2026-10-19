/** A section's heading (focusable, sits below the sticky header), else the element with that id. */
export const findAnchorTarget = (anchor: string | null): HTMLElement | null =>
  anchor ? (document.getElementById(anchor + "-title") ?? document.getElementById(anchor)) : null;
