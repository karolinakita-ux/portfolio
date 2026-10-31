import { useId } from "react";

import { EVENT } from "#shared/lib/analytics/analytics.constants.ts";
import { track } from "#shared/lib/analytics/analytics.utils.ts";
import { CASE_NAMES } from "#shared/lib/routes/routes.content.ts";
import { hrefForView } from "#shared/lib/routes/routes.utils.ts";
import { CaseThumbnail } from "#shared/media/CaseThumbnail/CaseThumbnail.tsx";
import { Button } from "#shared/ui/Button/Button.tsx";
import { Card } from "#shared/ui/Card/Card.tsx";
import { Eyebrow } from "#shared/ui/Eyebrow/Eyebrow.tsx";
import { ArrowRight } from "#shared/ui/icons/icons.tsx";
import { ViewLink } from "#shared/ui/ViewLink/ViewLink.tsx";
import { VisuallyHidden } from "#shared/ui/VisuallyHidden/VisuallyHidden.tsx";

import { styles } from "./CaseCard.styles.ts";
import type { CaseCardProps } from "./CaseCard.types.ts";

/**
 * Static container: the CTA link, plus the thumbnail for mouse and touch. Both are counted (case-open). The title is
 * the case's card title (CASE_NAMES).
 */
export function CaseCard({ item, resolveAsset, onNavigate }: CaseCardProps) {
  const titleId = useId();
  const title = CASE_NAMES[item.view].cardTitle;
  return (
    <Card layout="media" gap="lg" aria-labelledby={titleId} className={styles.root}>
      {/* The thumbnail opens the case study too (mouse and touch). Keyboard and screen reader users get the
          "View Case Study" link below, so this overlay is out of the Tab order and hidden from assistive tech;
          the image itself, and its alt text, stay readable. The hidden title names the link for readers that
          ignore ARIA (search engines, link and text extractors), which would otherwise see an empty link. */}
      <div className={styles.thumbnail}>
        <CaseThumbnail
          src={resolveAsset(item.asset)}
          darkSrc={item.darkAsset ? resolveAsset(item.darkAsset) : undefined}
          alt={item.alt}
          interactive
        />
        <ViewLink
          view={item.view}
          onNavigate={onNavigate}
          tabIndex={-1}
          aria-hidden="true"
          data-case-thumbnail-link=""
          onClick={() => track(EVENT.caseOpen, { case: item.view, from: "thumbnail" })}
          className={styles.thumbnailLink}
        >
          <VisuallyHidden>{title}</VisuallyHidden>
        </ViewLink>
      </div>
      <div className={styles.body}>
        <Eyebrow parts={item.eyebrow} />
        <h3 id={titleId} className={styles.title}>
          {title}
        </h3>
        <p className={styles.summary}>{item.summary}</p>
        <Button
          as="a"
          href={hrefForView(item.view)}
          variant="link"
          iconRight={ArrowRight}
          className={styles.cta}
          onClick={(event) => {
            event.preventDefault();
            track(EVENT.caseOpen, { case: item.view, from: "card-link" });
            onNavigate(item.view);
          }}
        >
          {item.cta}
        </Button>
      </div>
    </Card>
  );
}
