import { useId } from "react";
import { ArrowDown, ArrowRight, ArrowUpRight, Figma, Quote } from "../components/icons.tsx";
import { CaseThumbnail } from "../components/media/images.tsx";
import { Button } from "../components/ui/Button.tsx";
import { Container, Eyebrow, Section } from "../components/ui/layout.tsx";
import { Callout } from "../components/ui/text.tsx";
import { PROFILE } from "../content/profile.ts";
import type { WorkCase } from "../content/types.ts";
import { HERO_ACTIONS, PROCESS_BANNER, TESTIMONIALS, WORK_CASES, WORK_INTRO } from "../content/work.ts";
import { hrefForView, type Navigate } from "../lib/routes.ts";
import { cn, FOCUS_RING } from "../lib/ui.ts";

function HeroSection({ onNavigate }: { onNavigate: Navigate }) {
  return (
    <section aria-labelledby="hero-title" className="pt-2xl lg:pt-3xl">
      <Container>
        <div className="flex flex-col gap-lg">
          <Eyebrow parts={[PROFILE.name, PROFILE.role]} />
          {/* H1 scale shared by every page: Display Small → Display Medium (45px). No trailing period.
              Kept short (~40 characters) so it fits one line on desktop from 1024px. */}
          <h1
            id="hero-title"
            className="font-display text-display-sm font-normal text-balance text-text-primary md:text-display-md"
          >
            Clarity for complex enterprise software
          </h1>
          <p className="font-display text-headline-sm text-text-secondary">
            I have 8+ years of experience turning data-heavy B2B platforms and messy workflows into clear, usable
            digital products. With a background in psychology, I focus on how people actually think and work - combining
            practical research with solid design systems that engineers can easily build.
          </p>
          <div className="flex flex-wrap gap-sm">
            <Button
              as="a"
              href="#enterprise-cases"
              iconRight={ArrowDown}
              onClick={(event) => {
                event.preventDefault();
                onNavigate("work", "enterprise-cases-title", { smooth: true });
              }}
            >
              {HERO_ACTIONS.cases}
            </Button>
            <Button
              as="a"
              href={PROFILE.figmaWorkspaceUrl}
              target="_blank"
              rel="noopener noreferrer"
              variant="secondary"
              iconLeft={Figma}
              iconRight={ArrowUpRight}
            >
              {HERO_ACTIONS.figma}
              <span className="sr-only"> (opens in a new tab)</span>
            </Button>
          </div>
        </div>
      </Container>
    </section>
  );
}

function Avatar({ initials }: { initials: string }) {
  return (
    <span
      aria-hidden="true"
      className="inline-flex size-2xl shrink-0 items-center justify-center rounded-full bg-bg-avatar-base bg-avatar-glow text-title-sm text-text-primary"
    >
      {initials}
    </span>
  );
}

function TestimonialsSection() {
  return (
    <Section id="testimonials" title="Trusted by the leaders I worked for">
      <ul className="grid gap-md md:grid-cols-2">
        {TESTIMONIALS.map((item) => (
          <li key={item.id} className="min-w-0">
            <figure className="flex h-full flex-col gap-md rounded-md border border-border-subtle bg-bg-surface-raised p-lg shadow-sm">
              <Quote aria-hidden="true" size={24} className="text-bg-accent-brand" />
              <blockquote className="flex-1 text-body-md text-text-secondary">
                <p>{item.quote}</p>
              </blockquote>
              <figcaption className="flex items-center gap-sm border-t border-border-subtle pt-md">
                <Avatar initials={item.initials} />
                <span className="flex min-w-0 flex-col">
                  <span className="text-title-sm text-text-primary">{item.name}</span>
                  <span className="text-body-sm text-text-secondary">{item.role}</span>
                </span>
              </figcaption>
            </figure>
          </li>
        ))}
      </ul>
    </Section>
  );
}

interface CaseCardProps {
  item: WorkCase;
  resolveAsset: (name: string) => string;
  onNavigate: Navigate;
}

/** Static container - only the CTA link is interactive. */
function CaseCard({ item, resolveAsset, onNavigate }: CaseCardProps) {
  const titleId = useId();
  return (
    <article
      aria-labelledby={titleId}
      className="grid gap-lg rounded-md border border-border-subtle bg-bg-surface-raised p-md shadow-sm md:grid-cols-case-md md:items-center md:p-lg lg:grid-cols-case-lg"
    >
      <CaseThumbnail src={resolveAsset(item.asset)} alt={item.alt} />
      <div className="flex w-full min-w-0 flex-col items-start gap-xs">
        <Eyebrow parts={item.eyebrow} />
        {/* Full column width; text-pretty only prevents a lone last word (no forced even split) */}
        <h3 id={titleId} className="w-full text-title-md text-pretty text-text-primary">
          {item.title}
        </h3>
        <p className="text-body-md text-text-secondary">{item.summary}</p>
        <Button
          as="a"
          href={hrefForView(item.view)}
          variant="link"
          iconRight={ArrowRight}
          className="mt-xs"
          onClick={(event) => {
            event.preventDefault();
            onNavigate(item.view);
          }}
        >
          {item.cta}
        </Button>
      </div>
    </article>
  );
}

function ProcessBanner() {
  const href = PROFILE.figmaWorkspaceUrl;
  return (
    <Callout tone="info" label="How this portfolio was built" title={PROCESS_BANNER.title}>
      <p>{PROCESS_BANNER.body}</p>
      {/* Rhythm: body → 12px → link (same at every width) */}
      <div className="flex">
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            "group/fig inline-flex items-center gap-2xs rounded-sm text-label-lg font-semibold decoration-1 underline-offset-4 hover:underline",
            FOCUS_RING,
          )}
        >
          {PROCESS_BANNER.linkLabel}
          <ArrowUpRight
            aria-hidden="true"
            size={16}
            className="shrink-0 transition-transform duration-150 motion-safe:group-hover/fig:translate-x-3xs motion-safe:group-hover/fig:-translate-y-3xs"
          />
          <span className="sr-only"> (opens in a new tab)</span>
        </a>
      </div>
    </Callout>
  );
}

/** Work (default view): hero → featured case studies → leadership endorsements. */
export function WorkView({
  resolveAsset,
  onNavigate,
}: {
  resolveAsset: (name: string) => string;
  onNavigate: Navigate;
}) {
  // Rhythm: hero → 64px → heading → 8px → lead-in → 24px → NDA note → 24px → cards
  return (
    <>
      <HeroSection onNavigate={onNavigate} />
      <Section
        id="enterprise-cases"
        title="Selected Work & Case Studies"
        description={WORK_INTRO}
        headingProps={{ tabIndex: -1 }}
      >
        <Callout tone="warning" label="Confidentiality note">
          Due to confidentiality and <strong className="font-semibold">NDAs</strong>, sensitive business data and client
          names have been anonymized, except where explicitly permitted for public display (e.g., MeetEstim). In-depth
          walkthroughs of proprietary flows are available during interviews.
        </Callout>
        <ul className="flex flex-col gap-md">
          {WORK_CASES.map((item) => (
            <li key={item.id}>
              <CaseCard item={item} resolveAsset={resolveAsset} onNavigate={onNavigate} />
            </li>
          ))}
        </ul>
        <ProcessBanner />
      </Section>
      <TestimonialsSection />
    </>
  );
}
