import type { ReactNode } from "react";
import { WORK_CRUMB } from "../components/case/crumbs.ts";
import { Button } from "../components/ui/Button.tsx";
import { Joined } from "../components/ui/document.tsx";
import { Container, Eyebrow } from "../components/ui/layout.tsx";
import { Breadcrumb } from "../components/ui/navigation.tsx";
import { CV } from "../content/cv-data.ts";
import type { Cv, CvDegree, CvHeader as CvHeaderData, CvRole, LeadBullet } from "../content/types.ts";
import { formatMonthYear } from "../lib/dates.ts";
import type { Navigate } from "../lib/routes.ts";
import { cn, DOC_LINK, telHref } from "../lib/ui.ts";

/**
 * CvView - ATS-friendly, single-column CV with A4 print / PDF export.
 *
 * Machine readability:
 *   - One linear reading order: no columns, tables, icons, images or fills.
 *   - Semantic structure: h1 name → h2 standard section names → h3 roles, real <ul> lists.
 *   - Separators are typed characters (" | ", " - ") so they survive PDF text extraction.
 *
 * Theming: the sheet carries .kb-theme-light, which re-declares the light
 * KitaBranding tokens on that subtree, so the CV reads as a light document
 * even when the site is in dark mode (and the PDF always matches the preview).
 *
 * Print (src/styles/print.css): A4 at 17mm margins; the action bar and site
 * chrome are `print:hidden`; .kb-print-block keeps each role and short section
 * on one page; .kb-print-keep-with-next keeps a heading with its content.
 */

function DateRange({ start, end }: { start: string; end: string | null }) {
  return (
    <>
      <time dateTime={start}>{formatMonthYear(start)}</time>
      {" - "}
      {end ? <time dateTime={end}>{formatMonthYear(end)}</time> : "Present"}
    </>
  );
}

function CvSection({ id, title, keepTogether = false, children }: { id: string; title: string; keepTogether?: boolean; children: ReactNode }) {
  const titleId = "cv-" + id + "-title";
  return (
    <section aria-labelledby={titleId} className={cn("flex flex-col gap-sm", keepTogether && "kb-print-block")}>
      <h2
        id={titleId}
        className="kb-print-keep-with-next border-b border-border-default pb-2xs font-display text-headline-sm text-text-primary"
      >
        {title}
      </h2>
      {children}
    </section>
  );
}

function CvHeader({ header }: { header: CvHeaderData }) {
  const contacts: ReactNode[] = [
    header.location,
    header.phone && (
      <a href={telHref(header.phone)} className={DOC_LINK}>
        {header.phone}
      </a>
    ),
    <a href={"mailto:" + header.email} className={DOC_LINK}>
      {header.email}
    </a>,
    <a href={header.portfolio.href} className={DOC_LINK}>
      {header.portfolio.label}
    </a>,
    <a href={header.linkedin.href} className={DOC_LINK}>
      {header.linkedin.label}
    </a>,
  ];

  return (
    <header className="kb-print-block flex flex-col gap-2xs">
      <h1 id="cv-name" className="font-display text-display-sm font-medium text-text-primary">
        {header.name}
      </h1>
      <p className="text-title-lg text-text-primary">{header.title}</p>
      <address className="mt-2xs text-body-md not-italic text-text-secondary">
        <Joined parts={contacts} />
      </address>
    </header>
  );
}

function Bullets({ items }: { items: ReadonlyArray<LeadBullet> }) {
  return (
    <ul className="flex list-disc flex-col gap-2xs pl-lg text-body-md text-text-primary marker:text-text-primary">
      {items.map((item) => (
        <li key={item.lead}>
          <strong className="font-semibold">{item.lead}:</strong> {item.text}
        </li>
      ))}
    </ul>
  );
}

function Role({ role }: { role: CvRole }) {
  return (
    <article aria-labelledby={"cv-role-" + role.id} className="kb-print-block flex flex-col gap-xs">
      <div className="flex flex-col">
        <h3 id={"cv-role-" + role.id} className="text-title-md text-text-primary">
          {role.title}
        </h3>
        <p className="text-body-md text-text-secondary">
          <Joined
            parts={[
              <span className="font-semibold text-text-primary">{role.company}</span>,
              role.location,
              <DateRange start={role.start} end={role.end} />,
            ]}
          />
        </p>
        {role.previousTitle && <p className="text-body-md text-text-secondary">Previously: {role.previousTitle}</p>}
      </div>
      <Bullets items={role.bullets} />
    </article>
  );
}

function Degree({ item }: { item: CvDegree }) {
  return (
    <article aria-labelledby={"cv-edu-" + item.id} className="flex flex-col">
      <h3 id={"cv-edu-" + item.id} className="text-title-md text-text-primary">
        {item.degree}
      </h3>
      <p className="text-body-md text-text-secondary">
        <Joined
          parts={[
            <span className="font-semibold text-text-primary">{item.institution}</span>,
            <DateRange start={item.start} end={item.end} />,
          ]}
        />
      </p>
      {item.details && <p className="mt-2xs text-body-md text-text-primary">{item.details}</p>}
    </article>
  );
}

/** The printable sheet: A4 width on screen, edge-to-edge inside the @page margins on paper. */
export function CvSheet({ cv = CV }: { cv?: Cv }) {
  return (
    <article
      aria-labelledby="cv-name"
      className={cn(
        "kb-theme-light mx-auto flex w-full max-w-a4 flex-col gap-lg",
        "rounded-sm border border-border-subtle bg-bg-canvas p-lg text-text-primary shadow-md md:p-3xl",
        "print:max-w-none print:rounded-none print:border-0 print:p-0 print:shadow-none"
      )}
    >
      <CvHeader header={cv.header} />

      <CvSection id="summary" title="Professional Summary" keepTogether>
        <p className="text-body-md text-text-primary">{cv.summary}</p>
      </CvSection>

      <CvSection id="competencies" title="Core Competencies" keepTogether>
        <ul className="flex flex-col gap-2xs text-body-md text-text-primary">
          {cv.competencies.map((row) => (
            <li key={row.group}>
              <strong className="font-semibold">{row.group}:</strong> {row.items.join(", ")}
            </li>
          ))}
        </ul>
      </CvSection>

      <CvSection id="experience" title="Professional Experience">
        <div className="flex flex-col gap-md">
          {cv.experience.map((role) => (
            <Role key={role.id} role={role} />
          ))}
        </div>
      </CvSection>

      <CvSection id="education" title="Education" keepTogether>
        {cv.education.map((item) => (
          <Degree key={item.id} item={item} />
        ))}
      </CvSection>
    </article>
  );
}

export function CvView({ onNavigate }: { onNavigate: Navigate }) {
  return (
    <Container className="pt-xl print:p-0">
      <div className="flex flex-col gap-lg print:hidden">
        <Breadcrumb onNavigate={onNavigate} items={[WORK_CRUMB, { label: "CV" }]} />
        <div className="flex flex-col gap-md md:flex-row md:items-end md:justify-between">
          <div className="flex flex-col gap-xs">
            <Eyebrow parts={["Curriculum Vitae", "ATS-ready"]} />
            <p className="text-body-md text-text-secondary">
              Single-column and plain text, so applicant tracking systems parse it cleanly. To save a PDF, choose
              Save as PDF, paper size A4, and turn off Headers and footers.
            </p>
          </div>
          <Button onClick={() => window.print()} className="self-start md:self-auto">
            Download PDF
          </Button>
        </div>
      </div>

      <div className="mt-xl print:mt-0">
        <CvSheet />
      </div>
    </Container>
  );
}
