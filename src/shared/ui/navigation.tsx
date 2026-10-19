import type { AnchorHTMLAttributes, ReactNode } from "react";

import { hrefForView, type Navigate, type View } from "#shared/lib/routes.ts";
import { cn, FOCUS_RING, isPlainLeftClick } from "#shared/lib/ui.utils.ts";

import { ChevronRight, type IconComponent } from "./icons.tsx";

interface ViewLinkProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> {
  view: View;
  anchor?: string | null;
  onNavigate: Navigate;
  children: ReactNode;
}

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

export interface BreadcrumbItem {
  label: string;
  /** Required for every item except the last (current page). */
  view?: View;
  icon?: IconComponent;
}

export function Breadcrumb({ items, onNavigate }: { items: readonly BreadcrumbItem[]; onNavigate: Navigate }) {
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
                    FOCUS_RING,
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
