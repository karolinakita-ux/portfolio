import { LinkedInTextLink } from "#features/work/components/LinkedInTextLink/LinkedInTextLink.tsx";
import { TESTIMONIALS_SECTION } from "#features/work/work.content.ts";
import { PROFILE } from "#shared/content/profile.ts";
import { Avatar } from "#shared/ui/Avatar/Avatar.tsx";
import { Badge } from "#shared/ui/Badge/Badge.tsx";
import { Card } from "#shared/ui/Card/Card.tsx";
import { Quote } from "#shared/ui/icons/icons.tsx";
import { VisuallyHidden } from "#shared/ui/VisuallyHidden/VisuallyHidden.tsx";

import { styles } from "./TestimonialCard.styles.ts";
import type { TestimonialCardProps } from "./TestimonialCard.types.ts";

/**
 * Figma: Tile (Testimonial). An excerpt of a LinkedIn recommendation with its author: name and company link to
 * their LinkedIn pages when the card has them. What qualifies the quote sits under it, above the line: a badge
 * (“Translated from Polish”) and where we worked together, so every author block keeps its 2 lines and the lines
 * of cards side by side stay level. It stays still: the carousel row fades up as a whole.
 */
export function TestimonialCard({ item }: TestimonialCardProps) {
  const context = item.note !== undefined || item.workedAt !== undefined;
  return (
    <Card as="figure" layout="rows" gap="md" reveal={false} className={styles.card}>
      <Quote aria-hidden="true" size={24} className={styles.quoteMark} />
      <blockquote cite={PROFILE.linkedinRecommendationsUrl} className={styles.quote}>
        <p>{item.quote}</p>
      </blockquote>
      {context ? (
        <p className={styles.context}>
          {item.note ? <Badge>{item.note}</Badge> : null}{" "}
          {item.workedAt ? (
            <span className={styles.role}>
              {TESTIMONIALS_SECTION.workedAt}{" "}
              <LinkedInTextLink
                href={item.workedAt.url}
                label={item.workedAt.name}
                destination="company page on LinkedIn"
                target="company"
              />
            </span>
          ) : null}
        </p>
      ) : null}
      <figcaption className={styles.caption}>
        <Avatar initials={item.initials} />{" "}
        <span className={styles.person}>
          <span className={styles.name}>
            {item.profileUrl ? (
              <LinkedInTextLink
                href={item.profileUrl}
                label={item.name}
                destination="LinkedIn profile"
                target="author"
              />
            ) : (
              item.name
            )}
          </span>{" "}
          <span className={styles.role}>
            {item.role}
            {item.company ? (
              <>
                <span aria-hidden="true"> | </span>
                <VisuallyHidden> at </VisuallyHidden>
                <LinkedInTextLink
                  href={item.company.url}
                  label={item.company.name}
                  destination="company page on LinkedIn"
                  target="company"
                />
              </>
            ) : null}
          </span>
        </span>
      </figcaption>
    </Card>
  );
}
