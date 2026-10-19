import { useCallback, useEffect, useRef, type ReactNode } from "react";

import { AboutView } from "#features/about/index.ts";
import {
  AUTOMOTIVE_CASE,
  caseCards,
  CaseStudyView,
  CaseThemingView,
  MEETESTIM_CASE,
  THEMING_CASE,
} from "#features/case-studies/index.ts";
import { ContactView } from "#features/contact/index.ts";
import { CvView } from "#features/cv/index.ts";
import { LightboxProvider } from "#features/image-viewer/index.ts";
import { WorkView } from "#features/work/index.ts";
import { useTheme } from "#shared/hooks/useTheme.ts";
import { BackToTop, SiteFooter } from "#shared/layout/SiteFooter.tsx";
import { SiteHeader } from "#shared/layout/SiteHeader.tsx";
import { trackPageview } from "#shared/lib/analytics.utils.ts";
import { VIEW, type Navigate, type View } from "#shared/lib/routes.ts";
import { cn, FOCUS_RING, prefersReducedMotion } from "#shared/lib/ui.utils.ts";
import { preloadImages } from "#shared/media/image-preload.ts";

import { headFor } from "./seo.utils.ts";
import { useHistoryRoute } from "./useHistoryRoute.ts";
import { useSectionHash } from "./useSectionHash.ts";

/** A section's heading (focusable, sits below the sticky header), else the element with that id. */
const findAnchorTarget = (anchor: string | null): HTMLElement | null =>
  anchor ? (document.getElementById(anchor + "-title") ?? document.getElementById(anchor)) : null;

interface AppProps {
  /** Base URL of every image (screenshots, thumbnails, portrait). */
  assetBase?: string;
  portraitSrc?: string;
}

interface ViewContext {
  navigate: Navigate;
  resolveAsset: (name: string) => string;
  portraitSrc: string;
}

/** One entry per view: adding a view to VIEWS without a renderer is a type error. */
const VIEW_RENDERERS: Record<View, (ctx: ViewContext) => ReactNode> = {
  [VIEW.work]: ({ navigate, resolveAsset }) => <WorkView resolveAsset={resolveAsset} onNavigate={navigate} />,
  [VIEW.about]: ({ navigate, portraitSrc }) => <AboutView portraitSrc={portraitSrc} onNavigate={navigate} />,
  [VIEW.contact]: ({ navigate }) => <ContactView onNavigate={navigate} />,
  [VIEW.cv]: ({ navigate }) => <CvView onNavigate={navigate} />,
  [VIEW.caseTheming]: ({ navigate, resolveAsset }) => (
    <CaseThemingView c={THEMING_CASE} resolveAsset={resolveAsset} onNavigate={navigate} />
  ),
  [VIEW.caseMeetestim]: ({ navigate, resolveAsset }) => (
    <CaseStudyView c={MEETESTIM_CASE} resolveAsset={resolveAsset} onNavigate={navigate} />
  ),
  [VIEW.caseAutomotive]: ({ navigate, resolveAsset }) => (
    <CaseStudyView c={AUTOMOTIVE_CASE} resolveAsset={resolveAsset} onNavigate={navigate} />
  ),
};

/**
 * Karolina Kita's portfolio: the app shell.
 * Views and their URLs: VIEW and VIEW_PATHS in src/shared/lib/routes.ts.
 *
 * Styling: every colour, space, radius, shadow and type style resolves to a
 * KitaBranding token (src/styles). Light/Dark swaps CSS variables via the
 * `dark` class on <html>, so no `dark:` variants are needed.
 *
 * Print: site chrome sits in `contents print:hidden` wrappers - no box on
 * screen (the sticky header behaves exactly as before), removed on paper.
 * Page size, margins and break rules live in src/styles/print.css.
 *
 * Routing: src/app/useHistoryRoute.ts. Navigating resets scroll to the top
 * (or to a section anchor, e.g. /#enterprise-cases) and moves focus to the new view;
 * a new view remounts and fades in, a jump within the same view only scrolls;
 * Back / Forward restore the scroll position of that entry. A deep link with a hash
 * (/about#career) lands on that section; useSectionHash keeps the hash on the
 * section in view while scrolling.
 */
export function App({ assetBase = "/assets", portraitSrc = assetBase + "/site/portrait.webp" }: AppProps) {
  const [theme, pickTheme] = useTheme();
  const [route, navigate] = useHistoryRoute(VIEW.work);
  const mainRef = useRef<HTMLElement>(null);

  /** Named asset → URL (every image is served from /assets). */
  const resolveAsset = useCallback((name: string) => assetBase + "/" + name, [assetBase]);

  // Once the first page has loaded, fetch every case study's full screenshots in the background,
  // so the image viewer opens at once. The open case study queues its own first (useCaseGallery).
  useEffect(() => {
    const cases = [AUTOMOTIVE_CASE, MEETESTIM_CASE, THEMING_CASE];
    preloadImages(cases.flatMap((c) => caseCards(c).map((card) => resolveAsset(card.asset))));
  }, [resolveAsset]);

  // Title, description, canonical URL and the page's structured data follow the view
  // (the prerendered HTML already carries them for the first page).
  useEffect(() => {
    const head = headFor(route.view);
    document.title = head.title;
    const set = (selector: string, attribute: string, value: string) =>
      document.querySelector(selector)?.setAttribute(attribute, value);
    set('meta[name="description"]', "content", head.description);
    set('link[rel="canonical"]', "href", head.url);
    set('meta[property="og:url"]', "content", head.url);
    const pageData = document.querySelector('script[type="application/ld+json"][data-page]');
    if (pageData) pageData.textContent = JSON.stringify(head.jsonLd);
  }, [route.view]);

  // One pageview per page: the first load and every view change, Back / Forward included. A jump to a
  // section and the hash that follows scrolling are not pages. After the title effect: it sends the new title.
  useEffect(() => {
    trackPageview();
  }, [route.viewKey]);

  useSectionHash(route.key);

  // After each navigation: restore scroll (Back / Forward), land on an anchor, or go to the top.
  // `route` is a new object on every navigation (route.key increments), so it is the trigger.
  // The first load only acts on a deep link to a section (/about#career).
  useEffect(() => {
    if (route.key === 0) {
      const target = findAnchorTarget(route.anchor);
      if (!target) return undefined;
      const frame = window.requestAnimationFrame(() => {
        target.scrollIntoView({ block: "start", behavior: "auto" });
        target.focus({ preventScroll: true });
      });
      return () => window.cancelAnimationFrame(frame);
    }
    const focusMain = () => mainRef.current?.focus({ preventScroll: true });

    if (route.restoreY !== null) {
      const top = route.restoreY;
      const frame = window.requestAnimationFrame(() => {
        window.scrollTo({ top, behavior: "auto" });
        focusMain();
      });
      return () => window.cancelAnimationFrame(frame);
    }

    const smooth = route.smooth && !prefersReducedMotion();
    const target = findAnchorTarget(route.anchor);
    if (target) {
      target.scrollIntoView({ block: "start", behavior: smooth ? "smooth" : "auto" });
      target.focus({ preventScroll: true });
    } else {
      window.scrollTo({ top: 0, behavior: smooth ? "smooth" : "auto" });
      focusMain();
    }
    return undefined;
  }, [route]);

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
      <div
        className={cn(
          "flex min-h-screen flex-col bg-bg-canvas font-sans text-text-primary antialiased",
          "selection:bg-bg-accent-brand-subtle selection:text-text-primary",
        )}
      >
        <a
          href="#main"
          onClick={(event) => {
            event.preventDefault();
            mainRef.current?.focus();
          }}
          className={cn(
            "sr-only focus:not-sr-only focus:fixed focus:top-md focus:left-md focus:z-skip",
            "focus:rounded-md focus:bg-bg-surface-raised focus:px-md focus:py-xs focus:text-label-lg focus:shadow-md",
            "print:hidden",
            FOCUS_RING,
          )}
        >
          Skip to main content
        </a>

        <div className="contents print:hidden">
          <SiteHeader
            activeView={route.view}
            onNavigate={navigate}
            onHome={goHome}
            theme={theme}
            onThemeChange={pickTheme}
          />
        </div>

        <main id="main" ref={mainRef} tabIndex={-1} className="flex-1 pb-3xl focus:outline-none lg:pb-4xl print:pb-0">
          {/* Remounts and fades in only when the view changes: a jump within the page
              (Explore Case Studies) just scrolls. No fade on the first view: it is
              already on screen as prerendered HTML. */}
          <div key={route.viewKey} className={route.viewKey > 0 ? "motion-safe:animate-view-in" : undefined}>
            {view}
          </div>
        </main>

        <div className="contents print:hidden">
          <SiteFooter onNavigate={navigate} />
          <BackToTop onActivate={backToTop} />
        </div>
      </div>
    </LightboxProvider>
  );
}
