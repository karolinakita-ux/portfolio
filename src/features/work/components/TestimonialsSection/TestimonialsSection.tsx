import { TestimonialCard } from "#features/work/components/TestimonialCard/TestimonialCard.tsx";
import { RECOMMENDATIONS_LINK_LABEL, TESTIMONIALS, TESTIMONIALS_SECTION } from "#features/work/work.content.ts";
import { PROFILE } from "#shared/content/profile.ts";
import { carouselRange } from "#shared/hooks/carousel/carousel.utils.ts";
import { useCarousel } from "#shared/hooks/carousel/useCarousel.ts";
import { EVENT } from "#shared/lib/analytics/analytics.constants.ts";
import { track } from "#shared/lib/analytics/analytics.utils.ts";
import { EXTERNAL_LINK } from "#shared/lib/ui/ui.constants.ts";
import { Button } from "#shared/ui/Button/Button.tsx";
import { Carousel } from "#shared/ui/Carousel/Carousel.tsx";
import { CarouselControls } from "#shared/ui/CarouselControls/CarouselControls.tsx";
import { ArrowUpRight, Linkedin } from "#shared/ui/icons/icons.tsx";
import { NewTabNote } from "#shared/ui/NewTabNote/NewTabNote.tsx";
import { Section } from "#shared/ui/Section/Section.tsx";

import { styles } from "./TestimonialsSection.styles.ts";

/**
 * Excerpts of LinkedIn recommendations in a manual carousel: 2 in view from tablet width up (the managers
 * first), 1 on phones. Previous and Next sit at the end of the heading row; it never moves on its own.
 */
export function TestimonialsSection() {
  const { trackRef, onScroll, previous, next, scrollable, ...position } = useCarousel(TESTIMONIALS.length);
  /** Moves, then counts the press with the items now in view (swipes are not counted). */
  const move = (direction: "prev" | "next") => {
    const landed = direction === "prev" ? previous() : next();
    if (landed)
      track(EVENT.carouselNav, { direction, place: "testimonials", shown: carouselRange(landed.first, landed.last) });
  };
  const controls = scrollable ? (
    <CarouselControls
      {...position}
      onPrevious={() => {
        move("prev");
      }}
      onNext={() => {
        move("next");
      }}
      labels={TESTIMONIALS_SECTION.controls}
    />
  ) : null;
  return (
    <Section id="testimonials" title={TESTIMONIALS_SECTION.title} actions={controls}>
      <Carousel
        ref={trackRef}
        onScroll={onScroll}
        label={TESTIMONIALS_SECTION.list}
        items={TESTIMONIALS}
        getKey={(item) => item.id}
        renderItem={(item) => <TestimonialCard item={item} />}
      />
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
