/** navigator.connection (Network Information API), where the browser has it. */
export interface NetworkInformation {
  saveData?: boolean;
  effectiveType?: string;
}

export interface PreloadOptions {
  /** Load now, ahead of everything queued (e.g. the next image in the viewer). */
  urgent?: boolean;
}
