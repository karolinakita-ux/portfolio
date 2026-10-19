import { ChevronRight } from "#shared/ui/icons/icons.tsx";
import { ViewLink } from "#shared/ui/ViewLink/ViewLink.tsx";

import { styles } from "./Breadcrumb.styles.ts";
import type { BreadcrumbProps } from "./Breadcrumb.types.ts";

export function Breadcrumb({ items, onNavigate }: BreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb">
      <ol className={styles.list}>
        {items.map((item, index) => {
          const isCurrent = index === items.length - 1 || item.view === undefined;
          const Icon = item.icon;
          return (
            <li key={item.label} className={styles.item}>
              {index > 0 && <ChevronRight aria-hidden="true" size={14} />}
              {isCurrent || item.view === undefined ? (
                <span aria-current="page" className={styles.current}>
                  {item.label}
                </span>
              ) : (
                <ViewLink view={item.view} onNavigate={onNavigate} className={styles.link}>
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
