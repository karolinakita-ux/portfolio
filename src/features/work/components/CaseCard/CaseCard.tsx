import { useId } from "react";

import { EVENT } from "#shared/lib/analytics/analytics.constants.ts";
import { track } from "#shared/lib/analytics/analytics.utils.ts";
import { hrefForView } from "#shared/lib/routes/routes.utils.ts";
import { CaseThumbnail } from "#shared/media/CaseThumbnail/CaseThumbnail.tsx";
import { Button } from "#shared/ui/Button/Button.tsx";
import { Eyebrow } from "#shared/ui/Eyebrow/Eyebrow.tsx";
import { ArrowRight } from "#shared/ui/icons/icons.tsx";
import { ViewLink } from "#shared/ui/ViewLink/ViewLink.tsx";

import { styles } from "./CaseCard.styles.ts";
import type { CaseCardProps } from "./CaseCard.types.ts";

/** Static container: the CTA link, plus the thumbnail for mouse and touch. Both are counted (case-open). */
export function CaseCard({ item, resolveAsset, onNavigate }: CaseCardProps) {
  const titleId = useId();
  return (
    <article aria-labelledby={titleId} className={styles.root}>
      {/* The thumbnail opens the case study too (mouse and touch). Keyboard and screen reader users get the
          "View Case Study" link below, so this overlay is out of the Tab order and hidden from assistive tech;
          the image itself, and its alt text, stay readable. */}
      <div className={styles.thumbnail}>
        <CaseThumbnail src={resolveAsset(item.asset)} alt={item.alt} interactive />
        <ViewLink
          view={item.view}
          onNavigate={onNavigate}
          tabIndex={-1}
          aria-hidden="true"
          data-case-thumbnail-link=""
          onClick={() => track(EVENT.caseOpen, { case: item.view, from: "thumbnail" })}
          className={styles.thumbnailLink}
        >
          {null}
        </ViewLink>
      </div>
      <div className={styles.body}>
        <Eyebrow parts={item.eyebrow} />
        <h3 id={titleId} className={styles.title}>
          {item.title}
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
    </article>
  );
}
