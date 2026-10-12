import { useMemo } from "react";
import { CaseIntro, CaseNav, CaseSummary, DetailList, KeyOutcomes, ShowcaseRow } from "../components/case/case.tsx";
import { useCaseGallery, type GalleryRow } from "../components/case/useCaseGallery.ts";
import { Section } from "../components/ui/layout.tsx";
import type { CaseStudy, ThemingCaseStudy } from "../content/types.ts";
import { caseCards } from "../lib/gallery.ts";
import type { Navigate } from "../lib/routes.ts";
import { BULLET_LIST } from "../lib/ui.ts";

interface CaseViewProps<C> {
  c: C;
  resolveAsset: (name: string) => string;
  onNavigate: Navigate;
}

function ShowcaseRows({ rows }: { rows: ReadonlyArray<GalleryRow> }) {
  return rows.map((row) => (
    <li key={row.card.id}>
      <ShowcaseRow item={row.card} src={row.src} previewSrc={row.previewSrc} onExpand={row.onExpand} />
    </li>
  ));
}

/**
 * Shared case-study layout (Project Planning, Automotive):
 * intro → summary → screenshot sections (optional key-outcomes grid) → optional outcomes / reflections → prev/next.
 */
export function CaseStudyView({ c, resolveAsset, onNavigate }: CaseViewProps<CaseStudy>) {
  const cards = useMemo(() => caseCards(c), [c]);
  const rows = useCaseGallery(cards, resolveAsset);

  // Start index of each section's cards in the shared gallery.
  const sectionStarts = useMemo(() => {
    const starts: number[] = [];
    let offset = 0;
    for (const section of c.sections) {
      starts.push(offset);
      offset += section.cards.length;
    }
    return starts;
  }, [c]);

  return (
    <>
      <CaseIntro c={c} onNavigate={onNavigate} />
      <CaseSummary c={c} />

      {c.sections.map((section, index) => {
        const start = sectionStarts[index] ?? 0;
        return (
          <Section key={section.id} id={section.id} title={section.title} description={section.intro}>
            <ul className="flex flex-col gap-md">
              <ShowcaseRows rows={rows.slice(start, start + section.cards.length)} />
            </ul>
            {section.highlights && <KeyOutcomes items={section.highlights} labelId={section.id + "-outcomes"} />}
          </Section>
        );
      })}

      {c.outcomes && (
        <Section
          id={c.id + "-outcomes"}
          title={c.outcomesTitle ?? "Outcomes & Business Impact"}
          description={c.outcomesIntro}
        >
          <DetailList items={c.outcomes} />
        </Section>
      )}

      {c.reflections && (
        <Section id={c.id + "-reflections"} title={c.reflections.title} description={c.reflections.intro}>
          <DetailList items={c.reflections.points.map(([title, body]) => ({ title, body }))} />
        </Section>
      )}

      <CaseNav prev={c.prev} next={c.next} onNavigate={onNavigate} />
    </>
  );
}

/** Multi-Tenant Theme Customizer: problem cards, solution and safety rows, delivery, handoff, takeaways. */
export function CaseThemingView({ c, resolveAsset, onNavigate }: CaseViewProps<ThemingCaseStudy>) {
  const cards = useMemo(() => caseCards(c), [c]);
  const rows = useCaseGallery(cards, resolveAsset);
  const solutionRows = rows.slice(0, c.solution.length);
  const safetyRows = rows.slice(c.solution.length);

  return (
    <>
      <CaseIntro c={c} onNavigate={onNavigate} />
      <CaseSummary c={c} />

      <Section id="case-problem" title="The Core Problem: Management Assumption vs. Usability Reality">
        <div className="grid gap-md md:grid-cols-2">
          <article className="flex flex-col gap-sm rounded-md border border-border-subtle bg-bg-surface-raised p-lg shadow-sm">
            <h3 className="text-title-md text-text-primary">The Assumption</h3>
            <p className="text-body-md text-text-secondary">{c.assumption}</p>
          </article>
          <article className="flex flex-col gap-sm rounded-md border border-border-subtle bg-bg-surface-raised p-lg shadow-sm">
            <h3 className="text-title-md text-text-primary">The Reality</h3>
            <ul className={BULLET_LIST}>
              {c.reality.map((point, index) => (
                <li key={index}>{point}</li>
              ))}
            </ul>
          </article>
        </div>
      </Section>

      <Section id="case-solution" title="The Solution: Governed White-Label Theming & Accessibility" description={c.solutionIntro}>
        <ol className="flex flex-col gap-md">
          <ShowcaseRows rows={solutionRows} />
        </ol>
      </Section>

      <Section id="case-safety" title="Error Prevention & Deployment Safeguards" description={c.safetyIntro}>
        <ul className="flex flex-col gap-md">
          <ShowcaseRows rows={safetyRows} />
        </ul>
      </Section>

      <Section id="case-delivery" title="MVP Delivery & Phased Roadmap" description={c.deliveryIntro}>
        <DetailList items={c.delivery} />
      </Section>

      <Section id="case-engineering" title="Developer Handoff & Technical Collaboration" description={c.engineeringIntro}>
        <DetailList items={c.engineering} />
      </Section>

      <Section id="case-takeaways" title="Key Takeaways & Retrospective">
        <DetailList items={c.takeaways} />
      </Section>

      <CaseNav prev={c.prev} next={c.next} onNavigate={onNavigate} />
    </>
  );
}
