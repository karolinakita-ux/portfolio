import { useCallback, useRef } from "react";

import { usePageviews } from "#app/analytics/usePageviews.ts";
import { useHistoryRoute } from "#app/routing/useHistoryRoute.ts";
import { useRouteFocus } from "#app/routing/useRouteFocus.ts";
import { useSectionHash } from "#app/routing/useSectionHash.ts";
import { useDocumentHead } from "#app/seo/useDocumentHead.ts";
import { LightboxProvider } from "#features/image-viewer/index.ts";
import { useTheme } from "#shared/hooks/theme/useTheme.ts";
import { BackToTop } from "#shared/layout/BackToTop/BackToTop.tsx";
import { SiteFooter } from "#shared/layout/SiteFooter/SiteFooter.tsx";
import { SiteHeader } from "#shared/layout/SiteHeader/SiteHeader.tsx";
import { VIEW } from "#shared/lib/routes/routes.constants.ts";
import { prefersReducedMotion } from "#shared/lib/ui/ui.utils.ts";

import { VIEW_RENDERERS } from "./App.constants.tsx";
import { styles } from "./App.styles.ts";
import type { AppProps } from "./App.types.ts";
import { usePreloadCaseImages } from "./usePreloadCaseImages.ts";

/**
 * Karolina Kita's portfolio: the app shell.
 * Views and their URLs: VIEW and VIEW_PATHS in src/shared/lib/routes/routes.constants.ts.
 *
 * Styling: every colour, space, radius, shadow and type style resolves to a
 * KitaBranding token (src/styles). Light/Dark swaps CSS variables via the
 * `dark` class on <html>, so no `dark:` variants are needed.
 *
 * Print: site chrome sits in `contents print:hidden` wrappers - no box on
 * screen, removed on paper. Page size, margins and break rules live in src/styles/print.css.
 *
 * Routing: app/routing. Navigating resets scroll to the top (or to a section anchor,
 * e.g. /#enterprise-cases) and moves focus to the new view (useRouteFocus); a new view
 * remounts and fades in, a jump within the same view only scrolls; Back / Forward restore
 * the scroll position of that entry. useSectionHash keeps the hash on the section in view.
 */
export function App({ assetBase = "/assets", portraitSrc = assetBase + "/site/portrait.webp" }: AppProps) {
  const [theme, pickTheme] = useTheme();
  const [route, navigate] = useHistoryRoute(VIEW.work);
  const mainRef = useRef<HTMLElement>(null);

  /** Named asset → URL (every image is served from /assets). */
  const resolveAsset = useCallback((name: string) => assetBase + "/" + name, [assetBase]);

  usePreloadCaseImages(resolveAsset);
  useDocumentHead(route.view);
  usePageviews(route.viewKey);
  useSectionHash(route.key);
  useRouteFocus(route, mainRef);

  /** Logo: home reset. Already home → glide to top without re-mounting the view. */
  const goHome = useCallback(() => {
    if (route.view === VIEW.work) {
      window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? "auto" : "smooth" });
      mainRef.current?.focus({ preventScroll: true });
      return;
    }
    navigate(VIEW.work, null, { smooth: true });
  }, [route.view, navigate]);

  const backToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? "auto" : "smooth" });
    mainRef.current?.focus({ preventScroll: true });
  }, []);

  const view = VIEW_RENDERERS[route.view]({ navigate, resolveAsset, portraitSrc });

  return (
    <LightboxProvider>
      <div className={styles.root}>
        <a
          href="#main"
          onClick={(event) => {
            event.preventDefault();
            mainRef.current?.focus();
          }}
          className={styles.skipLink}
        >
          Skip to main content
        </a>

        <div className={styles.chrome}>
          <SiteHeader
            activeView={route.view}
            onNavigate={navigate}
            onHome={goHome}
            theme={theme}
            onThemeChange={pickTheme}
          />
        </div>

        <main id="main" ref={mainRef} tabIndex={-1} className={styles.main}>
          {/* Remounts and fades in only when the view changes: a jump within the page
              (Explore Case Studies) just scrolls. */}
          <div key={route.viewKey} className={styles.view(route.viewKey)}>
            {view}
          </div>
        </main>

        <div className={styles.chrome}>
          <SiteFooter onNavigate={navigate} />
          <BackToTop onActivate={backToTop} />
        </div>
      </div>
    </LightboxProvider>
  );
}
