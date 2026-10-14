import { useId } from "react";

import { hrefForView, type Navigate } from "#shared/lib/routes.ts";
import { BULLET_LIST, cn, FOCUS_RING } from "#shared/lib/ui.utils.ts";
import { Screenshot } from "#shared/media/images.tsx";
import { WORK_CRUMB } from "#shared/ui/crumbs.constants.ts";
import { ArrowLeft, ArrowRight } from "#shared/ui/icons.tsx";
import { Container, Eyebrow, Section } from "#shared/ui/layout.tsx";
import { Breadcrumb } from "#shared/ui/navigation.tsx";
import { Callout } from "#shared/ui/text.tsx";

import type {
  CaseNavTarget,
  CaseStudy,
  DetailItem,
  MetaEntry,
  ShowcaseCard,
  ThemingCaseStudy,
} from "./case-studies.types.ts";

type AnyCase = CaseStudy | ThemingCaseStudy;

/** Shared case-study opening: breadcrumb → eyebrow + title → details panel → notice. */
export function CaseIntro({ c, onNavigate }: { c: AnyCase; onNavigate: Navigate }) {
  return (
    <section aria-labelledby="case-title" className="pt-xl">
      <Container>
        <Breadcrumb onNavigate={onNavigate} items={[WORK_CRUMB, { label: c.shortTitle }]} />
        <div className="mt-xl flex flex-col gap-sm">
          <Eyebrow parts={c.eyebrow} />
          <h1
            id="case-title"
            className="font-display text-display-sm font-normal text-balance text-text-primary md:text-display-md"
          >
            {c.title}
          </h1>
        </div>
        <MetaMatrix entries={c.meta} />
        {c.notice && (
          <div className="mt-lg">
            <Callout tone={c.notice.tone} label={c.notice.label}>
              {c.notice.text}
            </Callout>
          </div>
        )}
      </Container>
    </section>
  );
}

export function CaseSummary({ c }: { c: AnyCase }) {
  return (
    <Section id={c.id + "-summary"} title={c.summaryTitle}>
      <div className="flex flex-col gap-md">
        {c.summary.map((paragraph) => (
          <p key={paragraph.slice(0, 24)} className="text-body-lg text-text-secondary">
            {paragraph}
          </p>
        ))}
      </div>
    </Section>
  );
}

/**
 * Case-study details panel. Up to 4 cells sit in one row on desktop; an entry
 * flagged `wide` spans the full width as a second row (e.g. Key Outcome when a
 * Team cell is present). Dividers are per-cell borders so both layouts share the
 * same 1px border-subtle rules: stacked rows on mobile, columns + row on lg.
 */
export function MetaMatrix({ entries }: { entries: readonly MetaEntry[] }) {
  return (
    <dl className="mt-xl grid rounded-md border border-border-subtle bg-bg-surface-raised shadow-sm lg:grid-cols-4">
      {entries.map((entry, index) => (
        <div
          key={entry.label}
          className={cn(
            "flex min-w-0 flex-col gap-2xs border-border-subtle p-md",
            index > 0 && "border-t",
            entry.wide ? "lg:col-span-4" : index > 0 && "lg:border-t-0 lg:border-l",
          )}
        >
          <dt className="text-body-sm text-text-secondary">{entry.label}</dt>
          <dd className="text-body-md text-text-primary">{entry.value}</dd>
        </div>
      ))}
    </dl>
  );
}

interface ShowcaseRowProps {
  item: ShowcaseCard;
  /** Full screenshot. */
  src: string;
  /** Optional close-up for the card. */
  previewSrc?: string;
  /** Opens the full-size viewer. */
  onExpand?: (trigger: HTMLElement) => void;
}

/** Screenshot left, rationale right (stacks on mobile). */
export function ShowcaseRow({ src, previewSrc, item, onExpand }: ShowcaseRowProps) {
  const titleId = useId();
  return (
    <article
      aria-labelledby={titleId}
      className="grid reveal-on-scroll gap-lg rounded-md border border-border-subtle bg-bg-surface-raised p-md shadow-sm md:grid-cols-showcase md:items-center md:p-lg"
    >
      <Screenshot
        src={previewSrc ?? src}
        fallbackSrc={previewSrc ? src : undefined}
        alt={item.alt}
        onExpand={onExpand}
      />
      <div className="flex min-w-0 flex-col gap-sm">
        <h3 id={titleId} className="text-title-md text-balance text-text-primary">
          {item.title}
        </h3>
        {item.intro ? <p className="text-body-md text-text-secondary">{item.intro}</p> : null}
        {/* Optional secondary titled paragraphs within one screenshot row */}
        {item.blocks?.map((block) => (
          <div key={block.title} className="flex flex-col gap-2xs pt-xs">
            <h4 className="text-title-md text-balance text-text-primary">{block.title}</h4>
            <p className="text-body-md text-text-secondary">{block.body}</p>
          </div>
        ))}
        {item.bullets && (
          <ul className={BULLET_LIST}>
            {item.bullets.map((bullet, index) => (
              // eslint-disable-next-line @eslint-react/no-array-index-key -- static content in fixed order
              <li key={index}>{bullet}</li>
            ))}
          </ul>
        )}
      </div>
    </article>
  );
}

/**
 * LAYOUT RULE - closing / impact / reflection sections in every case study.
 * Flat editorial flow: no cards, boxes, borders or list markers.
 *   Section H2 → optional lead (Body Large) → items:
 *   Title Medium, semibold, own line → Body Large description; 24px between items.
 */
export function DetailList({ items }: { items: readonly DetailItem[] }) {
  return (
    <ul className="flex list-none flex-col gap-lg">
      {items.map((item) => (
        <li key={item.title} className="flex min-w-0 flex-col gap-2xs">
          <h3 className="flex flex-wrap items-center gap-xs text-title-md font-semibold text-text-primary">
            {item.title}
            {item.badge && (
              <span className="rounded-full bg-bg-badge-default px-sm py-3xs text-label-sm font-medium text-text-primary">
                {item.badge}
              </span>
            )}
          </h3>
          <p className="text-body-lg text-text-secondary">{item.body}</p>
        </li>
      ))}
    </ul>
  );
}

/**
 * Key outcomes closing a case-study section (`section.highlights`). Follows the
 * flat editorial LAYOUT RULE above (no cards, boxes or borders), laid out as a
 * grid: 1 column on mobile, 3 from md. 24px extra space separates it from the cards.
 */
export function KeyOutcomes({ items, labelId }: { items: readonly DetailItem[]; labelId: string }) {
  return (
    <div className="flex flex-col gap-md pt-lg">
      <h3 id={labelId} className="text-title-lg text-text-primary">
        Key Outcomes
      </h3>
      <ul aria-labelledby={labelId} className="grid list-none gap-lg md:grid-cols-3">
        {items.map((item) => (
          <li key={item.title} className="flex min-w-0 flex-col gap-2xs">
            <h4 className="text-title-md font-semibold text-text-primary">{item.title}</h4>
            <p className="text-body-lg text-text-secondary">{item.body}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

function CaseNavLink({
  target,
  direction,
  onNavigate,
}: {
  target: CaseNavTarget;
  direction: "prev" | "next";
  onNavigate: Navigate;
}) {
  const isNext = direction === "next";
  const Icon = isNext ? ArrowRight : ArrowLeft;
  const arrow = (
    <Icon
      aria-hidden="true"
      size={16}
      className={cn(
        "shrink-0 transition-transform duration-fast ease-standard",
        isNext ? "motion-safe:group-hover/nav:translate-x-2xs" : "motion-safe:group-hover/nav:-translate-x-2xs",
      )}
    />
  );
  return (
    <a
      href={hrefForView(target.view)}
      onClick={(event) => {
        event.preventDefault();
        onNavigate(target.view);
      }}
      className={cn(
        "group/nav flex min-w-0 flex-col gap-2xs rounded-sm px-2xs py-xs",
        isNext ? "ml-auto items-end text-right" : "items-start",
        FOCUS_RING,
      )}
    >
      <span className="inline-flex items-center gap-xs text-label-lg text-text-primary decoration-1 underline-offset-4 group-hover/nav:underline">
        {!isNext && arrow}
        {target.action ?? (isNext ? "Next Case Study" : "Previous Case Study")}
        {isNext && arrow}
      </span>
      {target.label && (
        <span className="text-body-sm text-text-secondary transition-colors duration-fast group-hover/nav:text-text-primary">
          {target.label}
        </span>
      )}
    </a>
  );
}

/**
 * Previous / next case study links - borderless, inline.
 * Hover: label underlines, arrow nudges outward, project name darkens.
 * Wraps on narrow screens; Next keeps right alignment via ml-auto.
 */
export function CaseNav({
  prev,
  next,
  onNavigate,
}: {
  prev?: CaseNavTarget;
  next?: CaseNavTarget;
  onNavigate: Navigate;
}) {
  return (
    <section aria-label="More case studies" className="pt-3xl">
      <Container>
        <nav
          aria-label="Case study navigation"
          className={cn(
            "flex flex-wrap items-start gap-md",
            prev && next ? "justify-between" : next ? "justify-end" : "justify-start",
          )}
        >
          {prev && <CaseNavLink target={prev} direction="prev" onNavigate={onNavigate} />}
          {next && <CaseNavLink target={next} direction="next" onNavigate={onNavigate} />}
        </nav>
      </Container>
    </section>
  );
}
