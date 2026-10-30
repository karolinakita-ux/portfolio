import { LinkedInTextLink } from "#features/work/components/LinkedInTextLink/LinkedInTextLink.tsx";
import { RECOMMENDATIONS_LINK_LABEL, TESTIMONIALS } from "#features/work/work.content.ts";
import { PROFILE } from "#shared/content/profile.ts";
import { EVENT } from "#shared/lib/analytics/analytics.constants.ts";
import { track } from "#shared/lib/analytics/analytics.utils.ts";
import { EXTERNAL_LINK } from "#shared/lib/ui/ui.constants.ts";
import { Avatar } from "#shared/ui/Avatar/Avatar.tsx";
import { Button } from "#shared/ui/Button/Button.tsx";
import { Card } from "#shared/ui/Card/Card.tsx";
import { ArrowUpRight, Linkedin, Quote } from "#shared/ui/icons/icons.tsx";
import { NewTabNote } from "#shared/ui/NewTabNote/NewTabNote.tsx";
import { Section } from "#shared/ui/Section/Section.tsx";
import { VisuallyHidden } from "#shared/ui/VisuallyHidden/VisuallyHidden.tsx";

import { styles } from "./TestimonialsSection.styles.ts";

/** Quotes are excerpts of LinkedIn recommendations: each names its author and company, with links to both. */
export function TestimonialsSection() {
  return (
    <Section id="testimonials" title="Trusted by the Leaders I Worked For">
      <ul className={styles.list}>
        {TESTIMONIALS.map((item) => (
          <li key={item.id} className={styles.item}>
            <Card as="figure" gap="md" className={styles.card}>
              <Quote aria-hidden="true" size={24} className={styles.quoteMark} />
              <blockquote cite={PROFILE.linkedinRecommendationsUrl} className={styles.quote}>
                <p>{item.quote}</p>
              </blockquote>
              <figcaption className={styles.caption}>
                <Avatar initials={item.initials} />{" "}
                <span className={styles.person}>
                  <span className={styles.name}>
                    <LinkedInTextLink
                      href={item.profileUrl}
                      label={item.name}
                      destination="LinkedIn profile"
                      target="author"
                    />
                  </span>{" "}
                  <span className={styles.role}>
                    {item.role}
                    <span aria-hidden="true"> | </span>
                    <VisuallyHidden> at </VisuallyHidden>
                    <LinkedInTextLink
                      href={item.company.url}
                      label={item.company.name}
                      destination="company page on LinkedIn"
                      target="company"
                    />
                  </span>
                </span>
              </figcaption>
            </Card>
          </li>
        ))}
      </ul>
      <div className={styles.more}>
        <Button
          as="a"
          href={PROFILE.linkedinRecommendationsUrl}
          {...EXTERNAL_LINK}
          variant="secondary"
          iconLeft={Linkedin}
          iconRight={ArrowUpRight}
          onClick={() => track(EVENT.linkedinClick, { target: "recommendations", place: "testimonials" })}
        >
          {RECOMMENDATIONS_LINK_LABEL}
          <NewTabNote />
        </Button>
      </div>
    </Section>
  );
}
