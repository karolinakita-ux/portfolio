import { useId, useState } from "react";

import { PROFILE } from "#shared/content/profile.ts";
import { hrefForView, SECTION, VIEW, type Navigate } from "#shared/lib/routes.ts";
import { BULLET_LIST, cn, FOCUS_RING } from "#shared/lib/ui.utils.ts";
import { useImageStatus } from "#shared/media/useImageStatus.ts";
import { Button } from "#shared/ui/Button.tsx";
import { WORK_CRUMB } from "#shared/ui/crumbs.constants.ts";
import { ArrowRight, ChevronDown } from "#shared/ui/icons.tsx";
import { Container, Section } from "#shared/ui/layout.tsx";
import { lead } from "#shared/ui/lead.tsx";
import { Breadcrumb } from "#shared/ui/navigation.tsx";

import { ABOUT_INTRO, FAQ, MILESTONES, PRINCIPLES } from "./about.content.ts";
import type { FaqItem as FaqEntry, Milestone } from "./about.types.ts";

function AboutHero({ onNavigate }: { onNavigate: Navigate }) {
  return (
    <section aria-labelledby="about-title" className="pt-xl">
      <Container>
        <Breadcrumb onNavigate={onNavigate} items={[WORK_CRUMB, { label: "About" }]} />
        <div className="mt-xl flex flex-col gap-lg">
          {/* Same H1 scale as every page: Display Small (36px) on phones, Display Medium (45px) from md.
              Full column width, no max-w; kept short so it fits one line on desktop. No trailing period. */}
          <h1
            id="about-title"
            className="w-full font-display text-display-sm font-normal text-balance text-text-primary md:text-display-md"
          >
            Designing clarity for complex software
          </h1>
          {ABOUT_INTRO.map((paragraph) => (
            <p key={paragraph.slice(0, 24)} className="text-body-md text-text-secondary">
              {paragraph}
            </p>
          ))}
          <div className="flex flex-wrap justify-end gap-sm">
            <Button
              as="a"
              href={hrefForView(VIEW.work, SECTION.workCases)}
              onClick={(event) => {
                event.preventDefault();
                onNavigate(VIEW.work, SECTION.workCases);
              }}
            >
              Explore Selected Work
            </Button>
          </div>
        </div>
      </Container>
    </section>
  );
}

/**
 * Transparent cutout over bgBgAvatarBase + avatar glow tokens.
 * Mobile: fixed portrait aspect ratio. From md up the figure stretches to the
 * height of the card list (grid stretch), the photo frame takes the remaining
 * height above the caption (flex-1), and the image covers it anchored to the
 * top - so the caption's bottom lines up with the 4th card. If the image
 * cannot load, the glow frame stays on its own.
 */
function PortraitCard({ src }: { src: string }) {
  const { status, setStatus, ref } = useImageStatus(src);
  return (
    <figure className="flex h-full min-w-0 flex-col gap-sm">
      <div className="relative aspect-portrait w-full max-w-full overflow-hidden rounded-md border border-border-subtle bg-bg-avatar-base bg-portrait-glow shadow-sm md:aspect-auto md:min-h-0 md:flex-1">
        {status !== "error" && (
          <img
            ref={ref}
            src={src}
            alt={PROFILE.name}
            decoding="async"
            fetchPriority="high"
            onLoad={() => setStatus("loaded")}
            onError={() => setStatus("error")}
            className={cn(
              "absolute inset-0 h-full w-full object-cover object-top transition-opacity duration-slow ease-standard",
              status === "loaded" ? "opacity-100" : "opacity-0",
            )}
          />
        )}
      </div>
      <figcaption className="text-center text-body-sm text-text-primary">
        <span className="block">Based in Poland</span>
        <span className="block">Product &amp; UX/UI Designer</span>
      </figcaption>
    </figure>
  );
}

function PhilosophySection({ portraitSrc }: { portraitSrc: string }) {
  return (
    <Section
      id="philosophy"
      title="How I Like to Work"
      description="Good software should make work easier, not harder. Here are a few simple principles I follow on every project:"
      bodyGap="xl"
    >
      {/* Row height = card list; the portrait column stretches to it. 32px column gap. */}
      <div className="grid gap-xl md:grid-cols-2 md:items-stretch lg:grid-cols-about-lg">
        <ul className="flex min-w-0 flex-col gap-md">
          {PRINCIPLES.map((principle) => (
            <li
              key={principle.id}
              className="flex flex-col gap-sm rounded-md border border-border-subtle bg-bg-surface-raised p-lg shadow-sm"
            >
              <h3 className="text-title-md text-balance text-text-primary">{principle.title}</h3>
              <p className="text-body-md text-text-secondary">{principle.body}</p>
            </li>
          ))}
        </ul>
        <PortraitCard src={portraitSrc} />
      </div>
    </Section>
  );
}

function MilestoneCard({ milestone }: { milestone: Milestone }) {
  const titleId = useId();
  return (
    <article
      aria-labelledby={titleId}
      className="flex flex-col gap-sm rounded-md border border-border-subtle bg-bg-surface-raised p-lg shadow-sm"
    >
      <p className="text-body-sm text-text-secondary">{milestone.period}</p>
      <div className="flex flex-col gap-2xs">
        <h3 id={titleId} className="text-title-lg text-balance text-text-primary">
          {milestone.title}
        </h3>
        <p className="text-body-md text-text-secondary">{milestone.org}</p>
      </div>
      <dl className="grid grid-cols-term gap-x-xs text-body-md">
        <dt className="font-medium text-text-primary">Focus:</dt>
        <dd className="min-w-0 text-text-secondary">{milestone.focus}</dd>
      </dl>
      {/* Optional reflection quote - omitted on cards without a `lesson` */}
      {milestone.lesson && (
        <blockquote className="border-l-2 border-bg-accent-brand pl-sm text-body-md text-text-primary">
          <p>“{milestone.lesson}”</p>
        </blockquote>
      )}
      <ul aria-label="Skills" className="flex flex-wrap gap-xs">
        {milestone.tags.map((tag) => (
          <li key={tag} className="rounded-full bg-bg-badge-default px-sm py-3xs text-label-sm text-text-primary">
            {tag}
          </li>
        ))}
      </ul>
    </article>
  );
}

const MILESTONES_NEWEST_FIRST = [...MILESTONES].reverse();

function CareerSection({ onNavigate }: { onNavigate: Navigate }) {
  return (
    <Section id="career" title="Career Progression" description="2015 - Present">
      <ol className="flex flex-col gap-md">
        {MILESTONES_NEWEST_FIRST.map((milestone) => (
          <li key={milestone.id}>
            <MilestoneCard milestone={milestone} />
          </li>
        ))}
      </ol>
      {/* Reading path to the work for visitors who skipped the top navigation */}
      <div className="flex flex-wrap justify-end gap-sm pt-xs">
        <Button
          as="a"
          href={hrefForView(VIEW.work, SECTION.workCases)}
          iconRight={ArrowRight}
          onClick={(event) => {
            event.preventDefault();
            onNavigate(VIEW.work, SECTION.workCases);
          }}
        >
          Explore Enterprise Case Studies
        </Button>
      </div>
    </Section>
  );
}

/**
 * Accordion item (WAI-ARIA pattern): heading > button[aria-expanded] controlling
 * a labelled region. Collapsed by default; items open independently.
 * Height animates via grid-template-rows 0fr → 1fr (no measured heights).
 * The collapsed panel is `inert`, so hidden content is skipped by keyboard
 * and screen readers.
 */
function FaqItem({ item }: { item: FaqEntry }) {
  const [open, setOpen] = useState(false);
  const baseId = useId();
  const buttonId = baseId + "-q";
  const panelId = baseId + "-a";

  return (
    <li className="rounded-md border border-border-subtle bg-bg-surface-default">
      <h3 className="text-title-md text-text-primary">
        <button
          id={buttonId}
          type="button"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen((value) => !value)}
          className={cn(
            "flex w-full items-center justify-between gap-md rounded-md px-lg py-md text-left",
            "transition-colors duration-fast hover:text-text-secondary",
            FOCUS_RING,
          )}
        >
          <span className="min-w-0">{item.question}</span>
          <ChevronDown
            aria-hidden="true"
            size={20}
            className={cn(
              "shrink-0 text-text-secondary transition-transform duration-medium ease-standard",
              open && "rotate-180",
            )}
          />
        </button>
      </h3>
      <div
        id={panelId}
        role="region"
        aria-labelledby={buttonId}
        inert={!open}
        className={cn(
          "grid transition-[grid-template-rows] duration-medium ease-standard",
          open ? "grid-rows-expanded" : "grid-rows-collapsed",
        )}
      >
        <div className="overflow-hidden">
          <div className="flex flex-col gap-sm px-lg pb-lg">
            <p className="text-body-md text-text-secondary">{item.answer}</p>
            {item.points && (
              <ul className={BULLET_LIST}>
                {item.points.map(([term, text]) => (
                  <li key={term}>{lead(term, text)}</li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </li>
  );
}

function FaqSection() {
  return (
    <Section id="faq" title={FAQ.title} description={FAQ.intro}>
      <ul className="flex flex-col gap-sm">
        {FAQ.items.map((item) => (
          <FaqItem key={item.id} item={item} />
        ))}
      </ul>
    </Section>
  );
}

export function AboutView({ portraitSrc, onNavigate }: { portraitSrc: string; onNavigate: Navigate }) {
  return (
    <>
      <AboutHero onNavigate={onNavigate} />
      <PhilosophySection portraitSrc={portraitSrc} />
      <CareerSection onNavigate={onNavigate} />
      <FaqSection />
    </>
  );
}
