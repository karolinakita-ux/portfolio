import type { AnchorHTMLAttributes, ReactNode } from "react";
import { ChevronRight, type IconComponent } from "../icons.tsx";
import { hrefForView, type Navigate, type View } from "../../lib/routes.ts";
import { cn, FOCUS_RING, isPlainLeftClick } from "../../lib/ui.ts";

interface ViewLinkProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href" | "onClick"> {
  view: View;
  anchor?: string | null;
  onNavigate: Navigate;
  children: ReactNode;
}

/**
 * <a> with a real href (#view) for semantics, middle-click and "open in new
 * tab"; a plain click navigates through app state and browser history.
 */
export function ViewLink({ view, anchor, onNavigate, className, children, ...props }: ViewLinkProps) {
  return (
    <a
      href={hrefForView(view)}
      onClick={(event) => {
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

export interface BreadcrumbItem {
  label: string;
  /** Required for every item except the last (current page). */
  view?: View;
  icon?: IconComponent;
}

export function Breadcrumb({ items, onNavigate }: { items: ReadonlyArray<BreadcrumbItem>; onNavigate: Navigate }) {
  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex flex-wrap items-center gap-2xs text-body-sm text-text-secondary">
        {items.map((item, index) => {
          const isCurrent = index === items.length - 1 || item.view === undefined;
          const Icon = item.icon;
          return (
            <li key={item.label} className="flex items-center gap-2xs">
              {index > 0 && <ChevronRight aria-hidden="true" size={14} />}
              {isCurrent || item.view === undefined ? (
                <span aria-current="page" className="text-text-primary">
                  {item.label}
                </span>
              ) : (
                <ViewLink
                  view={item.view}
                  onNavigate={onNavigate}
                  className={cn(
                    "inline-flex items-center gap-2xs rounded-sm underline underline-offset-2 hover:text-text-primary",
                    FOCUS_RING
                  )}
                >
                  {Icon && <Icon aria-hidden="true" size={14} />}
                  {item.label}
                </ViewLink>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
