import { LinkedInTextLink } from "#features/work/components/LinkedInTextLink/LinkedInTextLink.tsx";
import { PROFILE } from "#shared/content/profile.ts";
import { Avatar } from "#shared/ui/Avatar/Avatar.tsx";
import { Card } from "#shared/ui/Card/Card.tsx";
import { Quote } from "#shared/ui/icons/icons.tsx";
import { VisuallyHidden } from "#shared/ui/VisuallyHidden/VisuallyHidden.tsx";

import { styles } from "./TestimonialCard.styles.ts";
import type { TestimonialCardProps } from "./TestimonialCard.types.ts";

/**
 * Figma: Tile (Testimonial). An excerpt of a LinkedIn recommendation with its author: name and company link to
 * their LinkedIn pages when the card has those addresses, and are plain text otherwise. It stays still: the
 * carousel row fades up as a whole.
 */
export function TestimonialCard({ item }: TestimonialCardProps) {
  return (
    <Card as="figure" gap="md" reveal={false} className={styles.card}>
      <Quote aria-hidden="true" size={24} className={styles.quoteMark} />
      <blockquote cite={PROFILE.linkedinRecommendationsUrl} className={styles.quote}>
        <p>{item.quote}</p>
      </blockquote>
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
                {item.company.url ? (
                  <LinkedInTextLink
                    href={item.company.url}
                    label={item.company.name}
                    destination="company page on LinkedIn"
                    target="company"
                  />
                ) : (
                  item.company.name
                )}
              </>
            ) : null}
          </span>
          {item.note ? (
            <>
              {" "}
              <span className={styles.role}>{item.note}</span>
            </>
          ) : null}
        </span>
      </figcaption>
    </Card>
  );
}
