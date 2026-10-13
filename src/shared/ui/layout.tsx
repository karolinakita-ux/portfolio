import type { HTMLAttributes, ReactNode } from "react";

import { cn } from "#shared/lib/ui.utils.ts";

import { HeadingAnchor } from "./HeadingAnchor.tsx";

/** Page gutter + centred 1120px content column. */
export function Container({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div className={cn("px-lg md:px-2xl lg:px-4xl", className)}>
      <div className="mx-auto w-full max-w-content">{children}</div>
    </div>
  );
}

/** Uppercase Label Medium kicker; parts are joined by a decorative bullet. */
export function Eyebrow({ parts, className }: { parts: readonly string[]; className?: string }) {
  return (
    <p className={cn("text-label-md text-text-secondary uppercase", className)}>
      {parts.map((part, index) => (
        <span key={part}>
          {index > 0 && (
            <>
              <span aria-hidden="true"> • </span>
              <span className="sr-only">, </span>
            </>
          )}
          {part}
        </span>
      ))}
    </p>
  );
}

/** Space between the heading block and the section body: 24px (default) or 32px. */
const SECTION_BODY_GAP = { lg: "gap-lg", xl: "gap-xl" } as const;

interface SectionProps {
  id: string;
  title: string;
  /** One paragraph, or several rendered as separate paragraphs. */
  description?: string | readonly string[];
  children?: ReactNode;
  headingProps?: HTMLAttributes<HTMLHeadingElement>;
  bodyGap?: keyof typeof SECTION_BODY_GAP;
}

/**
 * Page section: Headline Large / Display Small heading with a copy-link anchor, optional lead, content.
 * `id` is the section's URL hash (/about#career); the URL follows it while scrolling (useSectionHash).
 */
export function Section({ id, title, description, children, headingProps, bodyGap = "lg" }: SectionProps) {
  const titleId = id + "-title";
  const paragraphs = description === undefined ? [] : typeof description === "string" ? [description] : description;
  return (
    <section id={id} aria-labelledby={titleId} data-anchor="" className="pt-3xl">
      <Container>
        <div className={cn("flex flex-col", SECTION_BODY_GAP[bodyGap])}>
          <div className="flex flex-col gap-xs">
            <div className="group flex items-center gap-xs">
              <h2
                id={titleId}
                tabIndex={-1}
                className="scroll-mt-lg font-display text-headline-lg text-balance text-text-primary focus:outline-none lg:text-display-sm"
                {...headingProps}
              >
                {title}
              </h2>
              <HeadingAnchor id={id} headingId={titleId} label={title} />
            </div>
            {paragraphs.map((paragraph, index) => (
              // eslint-disable-next-line @eslint-react/no-array-index-key -- static paragraphs in fixed order
              <p key={index} className={cn("text-body-lg text-text-secondary", index > 0 && "mt-xs")}>
                {paragraph}
              </p>
            ))}
          </div>
          {children}
        </div>
      </Container>
    </section>
  );
}
