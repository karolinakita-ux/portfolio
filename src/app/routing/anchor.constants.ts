/**
 * Set on <html> by the section-link script in index.html when the page's HTML holds the section a link opens
 * (/about#career): the script has put its heading below the header before the app loaded and keeps it there until
 * the visitor scrolls, so on the first load the app only moves focus to the heading (useRouteFocus).
 */
export const ANCHOR_HELD_ATTRIBUTE = "data-kb-anchor-held";
