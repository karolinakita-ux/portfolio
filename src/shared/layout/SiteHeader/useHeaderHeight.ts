import { useEffect, type RefObject } from "react";

/**
 * Publishes the height the sticky header covers as --kb-header-h on <html> (0 when it is not
 * sticky, e.g. on short viewports), so anchor jumps and keyboard focus clear it.
 */
export function useHeaderHeight(headerRef: RefObject<HTMLElement | null>): void {
  useEffect(() => {
    const node = headerRef.current;
    if (!node) return undefined;
    const publish = () => {
      const covers = getComputedStyle(node).position === "sticky" ? node.offsetHeight : 0;
      document.documentElement.style.setProperty("--kb-header-h", covers + "px");
    };
    publish();
    window.addEventListener("resize", publish); // viewport height or zoom crosses the short breakpoint
    const observer = typeof ResizeObserver === "function" ? new ResizeObserver(publish) : null;
    observer?.observe(node);
    return () => {
      window.removeEventListener("resize", publish);
      observer?.disconnect();
    };
  }, [headerRef]);
}
