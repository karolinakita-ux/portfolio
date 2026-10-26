import { useRef } from "react";

import { useScrolledPast } from "#shared/hooks/scrolled-past/useScrolledPast.ts";
import { useSlidingPill } from "#shared/hooks/sliding-pill/useSlidingPill.ts";
import { Logo } from "#shared/layout/Logo/Logo.tsx";
import { ThemeToggle } from "#shared/layout/ThemeToggle/ThemeToggle.tsx";
import { NAV_ITEMS } from "#shared/lib/routes/routes.constants.ts";
import { navSectionFor } from "#shared/lib/routes/routes.utils.ts";
import { ViewLink } from "#shared/ui/ViewLink/ViewLink.tsx";

import { styles } from "./SiteHeader.styles.ts";
import type { SiteHeaderProps } from "./SiteHeader.types.ts";
import { useHeaderHeight } from "./useHeaderHeight.ts";

/**
 * Sticky header on an opaque canvas (content never shows through it), a
 * borderSubtle hairline, and shadow-sm once the page scrolls.
 *
 * Layout: one row from md (logo | nav centred | theme switch, ~67px); two rows
 * on phones (logo + theme switch, then the nav, ~103px). Its height never
 * changes while scrolling, so nothing jumps and anchor offsets stay right.
 * DOM order is logo → nav → theme switch, the same as the desktop row.
 *
 * On short viewports (landscape phones, 200-400% zoom) it stops sticking.
 * Publishes the height it covers as --kb-header-h (useHeaderHeight).
 */
export function SiteHeader({ activeView, onNavigate, onHome, theme, onThemeChange }: SiteHeaderProps) {
  const headerRef = useRef<HTMLElement>(null);
  const scrolled = useScrolledPast(4);
  // The nav section of the view (Work on a case study); null on a page outside the nav (Privacy).
  const activeNav = NAV_ITEMS.find((item) => item.view === navSectionFor(activeView))?.view ?? null;
  const navRef = useSlidingPill<HTMLUListElement>(activeNav);
  useHeaderHeight(headerRef);

  return (
    <header ref={headerRef} style={{ top: "env(safe-area-inset-top, 0px)" }} className={styles.root(scrolled)}>
      <div className={styles.row}>
        <a
          href="/"
          onClick={(event) => {
            event.preventDefault();
            onHome();
          }}
          // Starts with the wordmark the link shows, so "click K Kita" works by voice (WCAG 2.5.3).
          aria-label="K.Kita - Karolina Kita, home page"
          className={styles.home}
        >
          <Logo />
        </a>

        <nav aria-label="Primary" className={styles.nav}>
          <ul ref={navRef} className={styles.list}>
            {NAV_ITEMS.map((item) => {
              const active = item.view === activeNav;
              return (
                <li key={item.view}>
                  <ViewLink
                    view={item.view}
                    onNavigate={onNavigate}
                    // On a case study, Work is the current section ("true"); the breadcrumb names the page.
                    aria-current={active ? (item.view === activeView ? "page" : "true") : undefined}
                    className={styles.link(active)}
                  >
                    <span data-pill={item.view} aria-hidden="true" className={styles.pill(active)} />
                    {item.label}
                  </ViewLink>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className={styles.theme}>
          <ThemeToggle theme={theme} onChange={onThemeChange} />
        </div>
      </div>
    </header>
  );
}
