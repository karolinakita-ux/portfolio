import { useEffect, useRef } from "react";
import { Moon, Sun } from "#shared/ui/icons.tsx";
import { ViewLink } from "#shared/ui/navigation.tsx";
import type { Theme } from "#shared/hooks/useTheme.ts";
import { useScrolledPast } from "#shared/hooks/useScrolledPast.ts";
import { NAV_ITEMS, navSectionFor, type Navigate, type View } from "#shared/lib/routes.ts";
import { cn, FOCUS_RING } from "#shared/lib/ui.utils.ts";

/** K.KITA wordmark. Letters take textPrimary, the dot takes bgAccentBrand. */
function Logo() {
  const letter = "fill-text-primary transition-colors duration-150";
  return (
    <svg
      viewBox="0 0 102 28"
      width="102"
      height="28"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      focusable="false"
      className="block h-auto max-w-full"
    >
      <path
        className={letter}
        d="M8.35079 11C9.17103 11.2667 9.84293 11.6933 10.3665 12.28C10.8901 12.8667 11.3351 13.6667 11.7016 14.68C12.0855 15.6933 12.4695 17.04 12.8534 18.72L14.8691 28H11.7539L9.81675 19.16C9.57243 18.04 9.3281 17.1733 9.08377 16.56C8.83944 15.9467 8.50785 15.4533 8.08901 15.08C7.67016 14.7067 7.08552 14.4533 6.33508 14.32L3.08901 19.72V28H0V0H3.08901V13.88L11.3089 0H15L8.35079 11Z"
      />
      <path
        className="fill-bg-accent-brand"
        d="M22 26C22 24.8954 22.8954 24 24 24C25.1046 24 26 24.8954 26 26C26 27.1046 25.1046 28 24 28C22.8954 28 22 27.1046 22 26Z"
      />
      <path
        className={letter}
        d="M41.3508 11C42.171 11.2667 42.8429 11.6933 43.3665 12.28C43.8901 12.8667 44.3351 13.6667 44.7016 14.68C45.0855 15.6933 45.4695 17.04 45.8534 18.72L47.8691 28H44.7539L42.8168 19.16C42.5724 18.04 42.3281 17.1733 42.0838 16.56C41.8394 15.9467 41.5079 15.4533 41.089 15.08C40.6702 14.7067 40.0855 14.4533 39.3351 14.32L36.089 19.72V28H33V0H36.089V13.88L44.3089 0H48L41.3508 11Z"
      />
      <path className={letter} d="M55 0H58V28H55V0Z" />
      <path className={letter} d="M70.1198 3.72H65V0H78V3.72H72.9038V28H70.1198V3.72Z" />
      <path
        className={letter}
        d="M97.3539 20.764H89.6461L88.169 28H85L89.6998 5.70225C90.0042 4.23408 90.3175 3.09363 90.6398 2.2809C90.98 1.46816 91.3739 0.891384 91.8215 0.550562C92.2691 0.183521 92.8331 0 93.5134 0C94.1759 0 94.7309 0.183521 95.1785 0.550562C95.6261 0.891384 96.02 1.46816 96.3602 2.2809C96.7004 3.09363 97.0226 4.23408 97.327 5.70225L102 28H98.831L97.3539 20.764ZM96.6556 17.3034L94.3191 5.7809C94.2117 5.25655 94.0953 4.8764 93.97 4.64045C93.8626 4.40449 93.7104 4.28652 93.5134 4.28652C93.3165 4.28652 93.1553 4.40449 93.03 4.64045C92.9047 4.8764 92.7883 5.25655 92.6809 5.7809L90.3444 17.3034H96.6556Z"
      />
    </svg>
  );
}

const THEME_OPTIONS = [
  { value: "light", label: "Light theme", Icon: Sun },
  { value: "dark", label: "Dark theme", Icon: Moon },
] as const;

function ThemeToggle({ theme, onChange }: { theme: Theme; onChange: (theme: Theme) => void }) {
  return (
    <div
      role="group"
      aria-label="Color theme"
      className="inline-flex items-center gap-2xs rounded-md border border-border-subtle bg-bg-surface-raised p-2xs shadow-sm"
    >
      {THEME_OPTIONS.map(({ value, label, Icon }) => {
        const active = theme === value;
        return (
          <button
            key={value}
            type="button"
            aria-pressed={active}
            aria-label={label}
            title={label}
            onClick={() => onChange(value)}
            className={cn(
              "inline-flex items-center justify-center rounded-sm px-md py-xs transition-colors duration-150 ease-out",
              active
                ? "bg-bg-accent-brand text-text-on-accent shadow-sm"
                : "text-text-secondary hover:bg-bg-surface-default hover:text-text-primary",
              FOCUS_RING,
            )}
          >
            <Icon aria-hidden="true" size={16} />
          </button>
        );
      })}
    </div>
  );
}

interface SiteHeaderProps {
  activeView: View;
  onNavigate: Navigate;
  onHome: () => void;
  theme: Theme;
  onThemeChange: (theme: Theme) => void;
}

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
 * Publishes the height it covers as --kb-header-h (0 when not sticky) so
 * anchor jumps and keyboard focus clear it.
 */
export function SiteHeader({ activeView, onNavigate, onHome, theme, onThemeChange }: SiteHeaderProps) {
  const headerRef = useRef<HTMLElement>(null);
  const scrolled = useScrolledPast(4);

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
  }, []);

  return (
    <header
      ref={headerRef}
      style={{ top: "env(safe-area-inset-top, 0px)" }}
      className={cn(
        "sticky z-header border-b border-border-subtle bg-bg-canvas px-lg pt-sm pb-xs md:px-2xl md:py-sm lg:px-4xl short:static",
        "transition-[box-shadow,background-color,border-color] duration-200 ease-out",
        scrolled ? "shadow-sm" : "shadow-none",
      )}
    >
      {/* Phones: flex-wrap puts the nav on its own row below. From md: a 3-column grid keeps the nav centred. */}
      <div className="mx-auto flex w-full max-w-header flex-wrap items-center justify-between gap-x-md gap-y-2xs md:grid md:grid-cols-header">
        <a
          href="#"
          onClick={(event) => {
            event.preventDefault();
            onHome();
          }}
          aria-label="Karolina Kita, home page"
          className={cn("block cursor-pointer justify-self-start rounded-sm", FOCUS_RING)}
        >
          <Logo />
        </a>

        <nav aria-label="Primary" className="order-last w-full md:order-none md:w-auto">
          <ul className="flex flex-wrap items-center justify-center gap-2xs">
            {NAV_ITEMS.map((item) => {
              const active = navSectionFor(activeView) === item.view;
              return (
                <li key={item.view}>
                  <ViewLink
                    view={item.view}
                    onNavigate={onNavigate}
                    // On a case study, Work is the current section ("true"); the breadcrumb names the page.
                    aria-current={active ? (item.view === activeView ? "page" : "true") : undefined}
                    className={cn(
                      "block rounded-md px-sm py-xs text-label-lg transition-colors duration-150",
                      active
                        ? "bg-bg-accent-brand text-text-on-accent"
                        : "text-text-primary hover:bg-bg-surface-default",
                      FOCUS_RING,
                    )}
                  >
                    {item.label}
                  </ViewLink>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="justify-self-end">
          <ThemeToggle theme={theme} onChange={onThemeChange} />
        </div>
      </div>
    </header>
  );
}
