import { useCallback, useEffect, useRef, type ReactNode } from "react";
import { BackToTop, SiteFooter } from "./components/layout/SiteFooter.tsx";
import { SiteHeader } from "./components/layout/SiteHeader.tsx";
import { LightboxProvider } from "./components/media/Lightbox.tsx";
import { AUTOMOTIVE_CASE } from "./content/cases/automotive.ts";
import { MEETESTIM_CASE } from "./content/cases/meetestim.tsx";
import { THEMING_CASE } from "./content/cases/theming.tsx";
import { useHistoryRoute } from "./hooks/useHistoryRoute.ts";
import { useTheme } from "./hooks/useTheme.ts";
import { titleForView, type Navigate, type View } from "./lib/routes.ts";
import { cn, FOCUS_RING, prefersReducedMotion } from "./lib/ui.ts";
import { AboutView } from "./views/AboutView.tsx";
import { CaseStudyView, CaseThemingView } from "./views/CaseViews.tsx";
import { ContactView } from "./views/ContactView.tsx";
import { CoverLetterView } from "./views/CoverLetterView.tsx";
import { CvView } from "./views/CvView.tsx";
import { WorkView } from "./views/WorkView.tsx";

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
  work: ({ navigate, resolveAsset }) => <WorkView resolveAsset={resolveAsset} onNavigate={navigate} />,
  about: ({ navigate, portraitSrc }) => <AboutView portraitSrc={portraitSrc} onNavigate={navigate} />,
  contact: ({ navigate }) => <ContactView onNavigate={navigate} />,
  cv: ({ navigate }) => <CvView onNavigate={navigate} />,
  "cover-letter": ({ navigate }) => <CoverLetterView onNavigate={navigate} />,
  "case-theming": ({ navigate, resolveAsset }) => (
    <CaseThemingView c={THEMING_CASE} resolveAsset={resolveAsset} onNavigate={navigate} />
  ),
  "case-meetestim": ({ navigate, resolveAsset }) => (
    <CaseStudyView c={MEETESTIM_CASE} resolveAsset={resolveAsset} onNavigate={navigate} />
  ),
  "case-automotive": ({ navigate, resolveAsset }) => (
    <CaseStudyView c={AUTOMOTIVE_CASE} resolveAsset={resolveAsset} onNavigate={navigate} />
  ),
};

/**
 * KitaPortfolio - Senior UX Portfolio
 * Views: work (default) · about · contact · cv · cover-letter · case-theming · case-meetestim · case-automotive
 *
 * Styling: every colour, space, radius, shadow and type style resolves to a
 * KitaBranding token (src/styles). Light/Dark swaps CSS variables via the
 * `dark` class on <html>, so no `dark:` variants are needed.
 *
 * Print: site chrome sits in `contents print:hidden` wrappers - no box on
 * screen (the sticky header behaves exactly as before), removed on paper.
 * Page size, margins and break rules live in src/styles/print.css.
 *
 * Routing: src/hooks/useHistoryRoute.ts. Navigating resets scroll to the top
 * (or to an anchor, e.g. the cases grid) and moves focus to the new view;
 * Back / Forward restore the scroll position of that entry.
 */
export function App({ assetBase = "/assets", portraitSrc = assetBase + "/avatar-cutout.png" }: AppProps) {
  const [theme, pickTheme] = useTheme();
  const [route, navigate] = useHistoryRoute("work");
  const mainRef = useRef<HTMLElement>(null);

  /** Named asset → URL (every image is served from /assets). */
  const resolveAsset = useCallback((name: string) => assetBase + "/" + name, [assetBase]);

  useEffect(() => {
    document.title = titleForView(route.view);
  }, [route.view]);

  // After each navigation: restore scroll (Back / Forward), land on an anchor, or go to the top.
  // `route` is a new object on every navigation (route.key increments), so it is the trigger.
  useEffect(() => {
    if (route.key === 0) return undefined;
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
    const target = route.anchor ? document.getElementById(route.anchor) : null;
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
    if (route.view === "work") {
      window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? "auto" : "smooth" });
      mainRef.current?.focus({ preventScroll: true });
      return;
    }
    navigate("work", null, { smooth: true });
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
          "selection:bg-bg-accent-brand-subtle selection:text-text-primary"
        )}
      >
        <a
          href="#main"
          onClick={(event) => {
            event.preventDefault();
            mainRef.current?.focus();
          }}
          className={cn(
            "sr-only focus:not-sr-only focus:fixed focus:left-md focus:top-md focus:z-skip",
            "focus:rounded-md focus:bg-bg-surface-raised focus:px-md focus:py-xs focus:text-label-lg focus:shadow-md",
            "print:hidden",
            FOCUS_RING
          )}
        >
          Skip to main content
        </a>

        <div className="contents print:hidden">
          <SiteHeader activeView={route.view} onNavigate={navigate} onHome={goHome} theme={theme} onThemeChange={pickTheme} />
        </div>

        <main id="main" ref={mainRef} tabIndex={-1} className="flex-1 pb-3xl focus:outline-none lg:pb-4xl print:pb-0">
          <div key={route.key} className="motion-safe:animate-view-in">
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
