/**
 * Changes the address bar without making it a new page: the section hash while reading, a jump
 * within the view, the first load's normalised URL. It calls History.prototype directly, past the
 * wrapper that Umami's tracker puts on history.replaceState: the tracker takes every address change
 * as a new page and restarts its speed measurement (data-performance), which would split one page
 * into many short ones. A new view still goes through history.pushState, so the tracker sees it.
 * Throws where the history is off limits (sandboxed frames): callers catch it.
 */
export const replaceAddress = (url: string, state: unknown = window.history.state): void => {
  History.prototype.replaceState.call(window.history, state, "", url);
};
