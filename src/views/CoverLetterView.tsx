import { useEffect, useRef, useState, type Ref, type RefObject } from "react";
import { WORK_CRUMB } from "../components/case/crumbs.ts";
import { Check } from "../components/icons.tsx";
import { Button } from "../components/ui/Button.tsx";
import { Joined } from "../components/ui/document.tsx";
import { Container, Eyebrow } from "../components/ui/layout.tsx";
import { Breadcrumb } from "../components/ui/navigation.tsx";
import { COVER_LETTER } from "../content/cover-letter.ts";
import type { CoverLetter, LeadBullet } from "../content/types.ts";
import { formatLongDate } from "../lib/dates.ts";
import { measurePageFit, type PageFit } from "../lib/pageFit.ts";
import type { Navigate } from "../lib/routes.ts";
import { cn, DOC_LINK, telHref } from "../lib/ui.ts";

/**
 * CoverLetterView - single-page business letter with A4 print / PDF export.
 *
 * Typography matches the CV: Zilla Slab (font-display) for the name and the
 * subject heading, Inter for everything else at Body Medium.
 *
 * Theming: the sheet carries .kb-theme-light, so the letter reads as a light
 * document even when the site is in dark mode, and the PDF matches the preview.
 *
 * Print (src/styles/print.css):
 *   - .page-cover-letter puts this view on the named `cover-letter` page:
 *     A4 with 20mm margins (the CV keeps the site-wide 17mm).
 *   - On screen the sheet is 210mm wide with p-letter (20mm) padding, so the
 *     text column is 170mm in both the preview and the PDF.
 *   - .kb-print-block (break-inside / page-break-inside: avoid) keeps the
 *     letter in one piece; the fit check below keeps it on one page.
 *   - The action bar is `print:hidden`; site chrome is hidden by App.tsx.
 */

function usePageFit(ref: RefObject<HTMLDivElement | null>): PageFit | null {
  const [fit, setFit] = useState<PageFit | null>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node || typeof ResizeObserver !== "function") return undefined;
    let active = true;

    const measure = () => {
      if (!active) return;
      const { width, height } = node.getBoundingClientRect();
      setFit(measurePageFit(width, height));
    };

    const observer = new ResizeObserver(measure);
    observer.observe(node);
    // Web fonts change line breaks once they load; measure again then.
    if ("fonts" in document) void document.fonts.ready.then(measure);

    return () => {
      active = false;
      observer.disconnect();
    };
  }, [ref]);

  return fit;
}

function FitStatus({ fit }: { fit: PageFit | null }) {
  return (
    <p role="status" className="text-body-md">
      {fit &&
        (fit.fits ? (
          <span className="inline-flex items-center gap-xs text-text-secondary">
            <Check aria-hidden="true" size={16} className="shrink-0 text-status-success-text" />
            Fits on one A4 page, {fit.mm} mm to spare.
          </span>
        ) : (
          <span className="text-status-error-text">
            Runs {fit.mm} mm past one A4 page. Shorten the copy before exporting.
          </span>
        ))}
    </p>
  );
}

/* ---------------------------------------------------------------------------
   Letter parts
   --------------------------------------------------------------------------- */

function LetterHeader({ sender }: { sender: CoverLetter["sender"] }) {
  return (
    <header className="flex flex-col gap-2xs border-b border-border-default pb-md">
      <h1 className="font-display text-display-sm font-medium text-text-primary">{sender.name}</h1>
      <p className="text-title-lg text-text-primary">{sender.title}</p>
      <address className="mt-2xs flex flex-col text-body-md text-text-secondary not-italic">
        <span>
          <Joined
            parts={[
              <a href={"mailto:" + sender.email} className={DOC_LINK}>
                {sender.email}
              </a>,
              sender.phone && (
                <a href={telHref(sender.phone)} className={DOC_LINK}>
                  {sender.phone}
                </a>
              ),
            ]}
          />
        </span>
        <span>
          <Joined
            parts={[
              <>
                Portfolio:{" "}
                <a href={sender.portfolio.href} className={DOC_LINK}>
                  {sender.portfolio.label}
                </a>
              </>,
              <>
                LinkedIn:{" "}
                <a href={sender.linkedin.href} className={DOC_LINK}>
                  {sender.linkedin.label}
                </a>
              </>,
            ]}
          />
        </span>
      </address>
    </header>
  );
}

function Highlights({ items }: { items: ReadonlyArray<LeadBullet> }) {
  return (
    <ul className="flex list-disc flex-col gap-xs pl-lg marker:text-text-primary">
      {items.map((item) => (
        <li key={item.lead}>
          <strong className="font-semibold">{item.lead}:</strong> {item.text}
        </li>
      ))}
    </ul>
  );
}

/** The printable sheet: A4 on screen, edge-to-edge inside the 20mm @page margins on paper. */
export function CoverLetterSheet({
  letter = COVER_LETTER,
  contentRef,
}: {
  letter?: CoverLetter;
  contentRef?: Ref<HTMLDivElement>;
}) {
  return (
    <article
      aria-labelledby="cover-letter-subject"
      className={cn(
        "kb-theme-light kb-print-block mx-auto w-full max-w-a4",
        "rounded-sm border border-border-subtle bg-bg-canvas p-lg text-text-primary shadow-md md:min-h-a4 md:p-letter",
        "print:min-h-0 print:max-w-none print:rounded-none print:border-0 print:p-0 print:shadow-none",
      )}
    >
      <div ref={contentRef} className="flex flex-col gap-lg">
        <LetterHeader sender={letter.sender} />

        <div className="flex flex-col gap-md text-body-md text-text-primary">
          <p>
            <time dateTime={letter.date}>{formatLongDate(letter.date)}</time>
          </p>
          <p className="flex flex-col">
            {letter.recipient.map((line) => (
              <span key={line}>{line}</span>
            ))}
          </p>
        </div>

        <h2 id="cover-letter-subject" className="font-display text-headline-sm text-text-primary">
          {letter.subject}
        </h2>

        <div className="flex flex-col gap-sm text-body-md text-text-primary">
          <p>{letter.salutation}</p>
          <p>{letter.opening}</p>
          <Highlights items={letter.highlights} />
          <p>{letter.closing}</p>
        </div>

        <div className="flex flex-col gap-2xs text-body-md text-text-primary">
          <p>{letter.signOff}</p>
          <p className="text-title-md">{letter.sender.name}</p>
        </div>
      </div>
    </article>
  );
}

export function CoverLetterView({ onNavigate }: { onNavigate: Navigate }) {
  const contentRef = useRef<HTMLDivElement>(null);
  const fit = usePageFit(contentRef);

  return (
    <Container className="pt-xl page-cover-letter print:p-0">
      <div className="flex flex-col gap-lg print:hidden">
        <Breadcrumb onNavigate={onNavigate} items={[WORK_CRUMB, { label: "Cover Letter" }]} />
        <div className="flex flex-col gap-md md:flex-row md:items-end md:justify-between">
          <div className="flex flex-col gap-xs">
            <Eyebrow parts={["Cover Letter", "A4 single page"]} />
            <p className="text-body-md text-text-secondary">
              To save a PDF, choose Save as PDF, paper size A4, margins Default, and turn off Headers and footers.
            </p>
            <FitStatus fit={fit} />
          </div>
          <Button onClick={() => window.print()} className="self-start md:self-auto">
            Download PDF
          </Button>
        </div>
      </div>

      <div className="mt-xl print:mt-0">
        <CoverLetterSheet contentRef={contentRef} />
      </div>
    </Container>
  );
}
