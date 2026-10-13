/**
 * Starts a clipboard write. Call it inside the click handler: browsers allow it only
 * during user activation. Returns null when there is no clipboard (insecure context,
 * old browser), so the caller can fall back, e.g. to selecting the text.
 */
export const writeClipboard = (text: string): Promise<void> | null => {
  try {
    // navigator.clipboard is undefined outside secure contexts, whatever the DOM types say.
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    return typeof navigator.clipboard?.writeText === "function" ? navigator.clipboard.writeText(text) : null;
  } catch {
    return null;
  }
};
