import { BULLET_LIST } from "#shared/lib/ui/ui.styles.ts";
import { Screenshot } from "#shared/media/Screenshot/Screenshot.tsx";
import { Callout } from "#shared/ui/Callout/Callout.tsx";
import { Section } from "#shared/ui/Section/Section.tsx";

import { styles } from "./ScreenGrid.styles.ts";
import type { ScreenGridProps } from "./ScreenGrid.types.ts";

/**
 * Figma: Run the Network (Operations Console). The operations console: a scope note beside the description and design decisions
 * (side by side from lg), then the screens two to a row from md, each named in a caption.
 * `data-image-area`: closing the image viewer on a screen brings its figure, caption included, into view (gallery.utils).
 */
export function ScreenGrid({ section, rows }: ScreenGridProps) {
  return (
    <Section id={section.id} eyebrow={section.eyebrow} title={section.title} bodyGap="xl">
      <div className={styles.intro}>
        <Callout tone="info" label={section.scope.title} title={section.scope.title}>
          <p>{section.scope.body}</p>
        </Callout>{" "}
        <div className={styles.decisions}>
          <p className={styles.lead}>{section.lead}</p>
          <h3 className={styles.decisionsTitle}>{section.decisionsTitle}</h3>
          <ul className={BULLET_LIST}>
            {section.decisions.map((decision, index) => (
              // eslint-disable-next-line @eslint-react/no-array-index-key -- static content in fixed order
              <li key={index}>{decision}</li>
            ))}
          </ul>
        </div>
      </div>
      <ul aria-label={section.title + " - screens"} className={styles.grid}>
        {rows.map((row) => (
          <li key={row.card.id}>
            <figure data-image-area="" className={styles.figure}>
              <Screenshot
                src={row.src}
                darkSrc={row.darkSrc}
                alt={row.card.alt}
                onExpand={row.onExpand}
                imageId={row.card.id}
              />
              <figcaption className={styles.caption}>{row.card.title}</figcaption>
            </figure>
          </li>
        ))}
      </ul>
    </Section>
  );
}
