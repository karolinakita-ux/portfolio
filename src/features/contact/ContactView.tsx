import type { ReactNode } from "react";

import { PROFILE } from "#shared/content/profile.ts";
import type { Navigate } from "#shared/lib/routes.ts";
import { cn, FOCUS_RING } from "#shared/lib/ui.utils.ts";
import { CopyEmail } from "#shared/ui/CopyEmail.tsx";
import { WORK_CRUMB } from "#shared/ui/crumbs.constants.ts";
import { ExternalLink } from "#shared/ui/icons.tsx";
import { Container, Eyebrow, Section } from "#shared/ui/layout.tsx";
import { Breadcrumb } from "#shared/ui/navigation.tsx";

import { CONTACT, type Engagement } from "./contact.content.ts";

/** Two-cell label/value panel; cells stack with a hairline below lg. */
function InfoPanel({ children }: { children: ReactNode }) {
  return (
    <dl className="grid divide-y divide-border-subtle rounded-md border border-border-subtle bg-bg-surface-raised shadow-sm lg:grid-cols-2 lg:divide-x lg:divide-y-0">
      {children}
    </dl>
  );
}

function InfoCell({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex min-w-0 flex-col gap-xs p-lg">
      <dt className="text-body-lg text-text-secondary">{label}</dt>
      <dd className="min-w-0 text-body-lg text-text-primary">{children}</dd>
    </div>
  );
}

/**
 * Engagement tiers - primary vs selective.
 * Primary: bgAccentBrandSubtle pill + textPrimary, gold dot marker.
 * Selective: bgSurfaceDefault + borderSubtle + textSecondary - deliberately quieter.
 * Pills round fully from sm up; below that a label may wrap, so radiusMd keeps it tidy.
 */
const TIER_PILL: Record<Engagement["tier"], string> = {
  primary: "bg-bg-accent-brand-subtle text-text-primary",
  selective: "border border-border-subtle bg-bg-surface-default text-text-secondary",
};

function EngagementTiers({ items }: { items: readonly Engagement[] }) {
  return (
    <ul className="flex flex-col gap-lg">
      {items.map((item) => (
        <li key={item.tier} className="flex flex-col items-start gap-xs">
          <span
            className={cn(
              "inline-flex items-center gap-xs rounded-md px-sm py-2xs text-label-lg sm:rounded-full",
              TIER_PILL[item.tier],
            )}
          >
            {item.tier === "primary" && (
              <span aria-hidden="true" className="size-xs shrink-0 rounded-full bg-bg-accent-brand" />
            )}
            {item.label}
          </span>
          <p className="text-body-md text-text-secondary">{item.body}</p>
        </li>
      ))}
    </ul>
  );
}

export function ContactView({ onNavigate }: { onNavigate: Navigate }) {
  return (
    <>
      <section aria-labelledby="contact-title" className="pt-xl">
        <Container>
          <Breadcrumb onNavigate={onNavigate} items={[WORK_CRUMB, { label: "Contact" }]} />
          <div className="mt-xl flex flex-col gap-sm">
            <Eyebrow parts={[CONTACT.eyebrow]} />
            <h1
              id="contact-title"
              className="font-display text-display-sm font-normal text-balance text-text-primary md:text-display-md"
            >
              {CONTACT.title}
            </h1>
            <p className="text-body-lg text-text-secondary">{CONTACT.intro}</p>
          </div>
        </Container>
      </section>

      <Section id="contact-channels" title="Primary Channels">
        <InfoPanel>
          <InfoCell label="Direct Email">
            <span className="flex items-center gap-xs">
              <CopyEmail email={PROFILE.email} textClassName="text-body-lg" />
            </span>
          </InfoCell>
          <InfoCell label="LinkedIn Profile">
            <a
              href={PROFILE.linkedinUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                "inline-flex items-center gap-xs rounded-sm text-text-link-default underline underline-offset-2 hover:text-text-link-hover",
                FOCUS_RING,
              )}
            >
              {PROFILE.name} | LinkedIn
              <ExternalLink aria-hidden="true" size={16} className="shrink-0" />
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
          </InfoCell>
        </InfoPanel>
      </Section>

      <Section id="contact-availability" title="Current Availability & Roles">
        <InfoPanel>
          <InfoCell label="Availability">
            <EngagementTiers items={CONTACT.engagements} />
          </InfoCell>
          <InfoCell label="Target Roles">
            <ul className="flex list-disc flex-col gap-xs pl-lg marker:text-text-primary">
              {CONTACT.targetRoles.map((role) => (
                <li key={role}>{role}</li>
              ))}
            </ul>
          </InfoCell>
        </InfoPanel>
      </Section>

      <Section id="contact-location" title="Location & Working Hours">
        <InfoPanel>
          <InfoCell label="Location">{CONTACT.location}</InfoCell>
          <InfoCell label="Collaboration">{CONTACT.collaboration}</InfoCell>
        </InfoPanel>
      </Section>
    </>
  );
}
