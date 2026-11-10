import type { Meta, StoryObj } from "@storybook/react-vite";
import { clsx } from "clsx";
import { expect, waitFor } from "storybook/test";

import { useCarousel } from "#shared/hooks/carousel/useCarousel.ts";
import { Avatar } from "#shared/ui/Avatar/Avatar.tsx";
import { Card } from "#shared/ui/Card/Card.tsx";
import { CarouselControls } from "#shared/ui/CarouselControls/CarouselControls.tsx";
import { Quote } from "#shared/ui/icons/icons.tsx";
import { Section } from "#shared/ui/Section/Section.tsx";

import { Carousel } from "./Carousel.tsx";

/**
 * The classes of the Work page’s testimonial cards (TestimonialCard.styles.ts), so the story looks the same; the
 * caption aligns to the top here (the copy rules read a class list in a story as text, and the avatar is as tall
 * as the two lines beside it).
 */
const styles = {
  card: clsx("w-full"),
  quoteMark: clsx("text-bg-accent-brand"),
  quote: clsx("flex-1 text-body-md text-text-secondary"),
  caption: clsx("flex items-start gap-sm border-t border-border-subtle pt-md"),
  person: clsx("flex min-w-0 flex-col items-start gap-3xs"),
  name: clsx("text-title-sm"),
  role: clsx("text-body-sm text-text-secondary"),
};

interface Recommendation {
  id: string;
  quote: string;
  name: string;
  initials: string;
  role: string;
}

/** Excerpts from the Work page, word for word. */
const RECOMMENDATIONS: readonly Recommendation[] = [
  {
    id: "stewart-wilson",
    quote:
      "Karolina has a strong, balanced skillset as a UX designer and was able to quickly build an understanding of our complex, enterprise product domain, delivering significant improvements to the user experience through her discovery, design and validation of new features, and her contributions to research, standards and the design system…",
    name: "Stewart Wilson",
    initials: "SW",
    role: "UX Director",
  },
  {
    id: "gavin-harvey",
    quote:
      "One of Karolina’s biggest strengths is her ability to understand complex problems, break them down and develop solutions to a very high standard. Her documentation was consistently outstanding, clearly capturing research findings, design thinking and the rationale behind decisions.",
    name: "Gavin Harvey",
    initials: "GH",
    role: "Lead Product Designer",
  },
  {
    id: "weronika-dobrowolska",
    quote:
      "Karolina is an incredibly versatile UX/UI Designer whose background in psychology has always been a tremendous asset when shaping product strategies and understanding user needs. She combines strategic thinking with a keen eye for detail and has a deep understanding of design principles that she applies effortlessly in her work.",
    name: "Weronika Dobrowolska",
    initials: "WD",
    role: "Senior UX Designer",
  },
  {
    id: "natalia-jeszke",
    quote:
      "What I particularly appreciated was her openness to discussions with developers. She was always willing to explain her thinking, answer questions, and explore different approaches to find the best solution.",
    name: "Natalia Jeszke",
    initials: "NJ",
    role: "Frontend Developer",
  },
  {
    id: "angelika-kuzbit",
    quote:
      "Karolina showed strong skills in design, analysis, and in creating and conducting research. Karolina has broad knowledge and skills that allow a creative, conscientious, precise and high-quality approach to every task she takes on.",
    name: "Angelika Kuźbit",
    initials: "AK",
    role: "Psychologist",
  },
];

function RecommendationCard({ item }: { item: Recommendation }) {
  return (
    <Card as="figure" gap="md" reveal={false} className={styles.card}>
      <Quote aria-hidden="true" size={24} className={styles.quoteMark} />
      <blockquote className={styles.quote}>
        <p>{item.quote}</p>
      </blockquote>
      <figcaption className={styles.caption}>
        <Avatar initials={item.initials} />{" "}
        <span className={styles.person}>
          <span className={styles.name}>{item.name}</span> <span className={styles.role}>{item.role}</span>
        </span>
      </figcaption>
    </Card>
  );
}

/** As on the Work page: the controls at the end of the heading row, the track below. */
function Recommendations() {
  const { trackRef, onScroll, previous, next, scrollable, ...position } = useCarousel(RECOMMENDATIONS.length);
  const controls = scrollable ? (
    <CarouselControls
      {...position}
      onPrevious={previous}
      onNext={next}
      labels={{ previous: "Previous recommendations", next: "Next recommendations" }}
    />
  ) : null;
  return (
    <Section id="testimonials" title="Trusted by the People I Worked With" actions={controls}>
      <Carousel
        ref={trackRef}
        onScroll={onScroll}
        label="Recommendations"
        items={RECOMMENDATIONS}
        getKey={(item) => item.id}
        renderItem={(item) => <RecommendationCard item={item} />}
      />
    </Section>
  );
}

/**
 * Figma: Carousel. A manual carousel: 2 items in view from tablet width up, 1 on phones with the next one showing
 * at the edge. It never moves on its own: Previous and Next (CarouselControls), a swipe, a trackpad or Tab onto an
 * item’s link move it, and every item stays in the page for keyboards and screen readers. `useCarousel` connects
 * the two; Previous and Next sit in the heading row through Section’s `actions`.
 */
const meta = {
  title: "UI/Carousel",
  component: Recommendations,
  parameters: { layout: "fullscreen" },
  decorators: [
    (Story) => (
      <div style={{ paddingBottom: "var(--spacing-2xl)" }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Recommendations>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The Work page’s recommendations, at the start: the two managers first. */
export const Default: Story = {
  play: async ({ canvas }) => {
    const list = canvas.getByRole("list", { name: "Recommendations" });
    await expect(list.children).toHaveLength(RECOMMENDATIONS.length);
    await waitFor(() =>
      expect(canvas.getByRole("button", { name: "Previous recommendations" })).toHaveAttribute("aria-disabled", "true"),
    );
  },
};
