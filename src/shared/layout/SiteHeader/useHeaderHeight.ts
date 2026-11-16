import { useEffect, type RefObject } from "react";

/**
 * Publishes the height the sticky header covers as --kb-header-h on <html> (0 when it is static,
 * e.g. on short viewports), so anchor jumps and keyboard focus clear it. Relative counts as covering:
 * the theme cross-fade holds the stuck header in place that way (holdStickyHeader), and a resize then
 * must not drop the padding.
 */
export function useHeaderHeight(headerRef: RefObject<HTMLElement | null>): void {
  useEffect(() => {
    const node = headerRef.current;
    if (!node) return undefined;
    const publish = () => {
      const covers = getComputedStyle(node).position === "static" ? 0 : node.offsetHeight;
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
