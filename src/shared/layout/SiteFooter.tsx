import { useState } from "react";
import { ArrowUp, Linkedin, Mail } from "#shared/ui/icons.tsx";
import { Container } from "#shared/ui/layout.tsx";
import { ViewLink } from "#shared/ui/navigation.tsx";
import { CopyEmail } from "#shared/ui/CopyEmail.tsx";
import { PROFILE } from "#shared/content/profile.ts";
import { useScrolledPast } from "#shared/hooks/useScrolledPast.ts";
import { NAV_ITEMS, type Navigate } from "#shared/lib/routes.ts";
import { cn, FOCUS_RING } from "#shared/lib/ui.utils.ts";

/** Read once per page load (rendering stays pure). */
const CURRENT_YEAR = new Date().getFullYear();

export function SiteFooter({ onNavigate }: { onNavigate: Navigate }) {
  return (
    <footer className="bg-bg-footer">
      <Container className="pt-3xl pb-xl">
        <div className="grid gap-2xl md:grid-cols-2 lg:mx-auto lg:max-w-footer">
          <nav aria-labelledby="footer-explore-title">
            <h2 id="footer-explore-title" className="text-title-md text-text-primary">
              Explore
            </h2>
            <ul className="mt-md flex flex-col items-start gap-xs">
              {NAV_ITEMS.map((item) => (
                <li key={item.view}>
                  <ViewLink
                    view={item.view}
                    onNavigate={onNavigate}
                    className={cn(
                      "-mx-2xs block rounded-sm px-2xs py-3xs text-body-md text-text-primary underline-offset-4 hover:underline",
                      FOCUS_RING,
                    )}
                  >
                    {item.label}
                  </ViewLink>
                </li>
              ))}
            </ul>
          </nav>

          <section aria-labelledby="footer-contact-title">
            <h2 id="footer-contact-title" className="text-title-md text-text-primary">
              Contact
            </h2>
            <ul className="mt-md flex flex-col gap-sm">
              <li className="flex items-center gap-sm">
                <Linkedin aria-hidden="true" size={16} className="shrink-0 text-text-secondary" />
                <a
                  href={PROFILE.linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    "rounded-sm text-body-md text-text-link-default underline underline-offset-2 hover:text-text-link-hover",
                    FOCUS_RING,
                  )}
                >
                  {PROFILE.name} | LinkedIn
                  <span className="sr-only"> (opens in a new tab)</span>
                </a>
              </li>
              <li className="flex flex-wrap items-center gap-xs">
                <CopyEmail
                  email={PROFILE.email}
                  icon={<Mail aria-hidden="true" size={16} className="shrink-0 text-text-secondary" />}
                />
              </li>
            </ul>
          </section>
        </div>

        <div className="mt-4xl flex flex-col gap-2xs text-center text-body-sm text-text-secondary">
          <p>
            © {CURRENT_YEAR} {PROFILE.name} | All Rights Reserved
          </p>
          <p>{PROFILE.builtWith}</p>
        </div>
      </Container>
    </footer>
  );
}

/**
 * Floating "back to top" button, shown after the visitor scrolls down.
 * It stays shown while it has focus (e.g. after Home scrolls the page up), so keyboard focus never sits on a hidden button.
 */
export function BackToTop({ onActivate }: { onActivate: () => void }) {
  const scrolledPast = useScrolledPast(640);
  const [focused, setFocused] = useState(false);
  const visible = scrolledPast || focused;

  return (
    <button
      type="button"
      aria-label="Back to top"
      title="Back to top"
      tabIndex={visible ? 0 : -1}
      aria-hidden={!visible}
      onClick={onActivate}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={{ marginBottom: "env(safe-area-inset-bottom, 0px)" }}
      className={cn(
        "fixed right-md bottom-md z-20 inline-flex size-2xl items-center justify-center rounded-full md:right-lg md:bottom-lg",
        "border border-border-subtle bg-bg-surface-raised text-text-primary shadow-lg",
        "transition-[opacity,transform,background-color] duration-200 ease-out hover:bg-bg-surface-default",
        visible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-xs opacity-0",
        FOCUS_RING,
      )}
    >
      <ArrowUp aria-hidden="true" size={20} />
    </button>
  );
}
