import { hrefForView } from "#shared/lib/routes/routes.utils.ts";
import { isPlainLeftClick } from "#shared/lib/ui/ui.utils.ts";

import type { ViewLinkProps } from "./ViewLink.types.ts";

/**
 * <a> with a real href (/about, /work#cases) for semantics, middle-click and "open in new
 * tab"; a plain click navigates through app state and browser history. `onClick` runs first,
 * on every click (e.g. to count it).
 */
export function ViewLink({ view, anchor, onNavigate, onClick, className, children, ...props }: ViewLinkProps) {
  return (
    <a
      href={hrefForView(view, anchor)}
      onClick={(event) => {
        onClick?.(event);
        if (!isPlainLeftClick(event)) return; // let the browser open a new tab / window
        event.preventDefault();
        onNavigate(view, anchor);
      }}
      className={className}
      {...props}
    >
      {children}
    </a>
  );
}
