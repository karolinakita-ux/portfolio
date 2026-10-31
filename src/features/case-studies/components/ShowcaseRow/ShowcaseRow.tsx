import { useId } from "react";

import { BULLET_LIST } from "#shared/lib/ui/ui.styles.ts";
import { Screenshot } from "#shared/media/Screenshot/Screenshot.tsx";

import { styles } from "./ShowcaseRow.styles.ts";
import type { ShowcaseRowProps } from "./ShowcaseRow.types.ts";

/**
 * One screenshot with its rationale, in the feature-row layout every case study shares: a 440px text column
 * beside the framed screenshot from lg, the sides alternating row by row (`reverse`); stacked, text first, below lg.
 * A phone screen (`device: "phone"`) flips the proportions: a wide text column beside a 376px card holding the screen.
 * `data-image-area`: closing the image viewer on this screenshot brings the whole row into view (gallery.utils);
 * `data-image-description`: the viewer's Go to Description puts keyboard focus on the row's title (focusable for it).
 */
export function ShowcaseRow({ src, darkSrc, previewSrc, item, onExpand, reverse = false }: ShowcaseRowProps) {
  const titleId = useId();
  const phone = item.device === "phone";
  return (
    <article data-card="" data-image-area="" aria-labelledby={titleId} className={styles.root(reverse, phone)}>
      <div className={styles.body}>
        <h3 id={titleId} tabIndex={-1} data-image-description="" className={styles.title}>
          {item.title}
        </h3>
        {item.intro ? <p className={styles.intro}>{item.intro}</p> : null}
        {item.paragraphs?.map((paragraph) => (
          <p key={paragraph.slice(0, 24)} className={styles.intro}>
            {paragraph}
          </p>
        ))}
        {/* Optional secondary titled paragraphs within one screenshot row */}
        {item.blocks?.map((block) => (
          <div key={block.title} className={styles.block}>
            <h4 className={styles.blockTitle}>{block.title}</h4>
            <p className={styles.blockBody}>{block.body}</p>
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
      </div>{" "}
      <div className={styles.media(reverse, phone)}>
        <div className={styles.screen(phone)}>
          <Screenshot
            src={previewSrc ?? src}
            darkSrc={previewSrc ? undefined : darkSrc}
            fallbackSrc={previewSrc ? src : undefined}
            alt={item.alt}
            onExpand={onExpand}
            imageId={item.id}
            frameless={item.frameless}
          />
        </div>
      </div>
    </article>
  );
}
