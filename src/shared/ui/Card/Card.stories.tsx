import type { Meta, StoryObj } from "@storybook/react-vite";
import { clsx } from "clsx";

import { VIEW } from "#shared/lib/routes/routes.constants.ts";
import { CASE_NAMES } from "#shared/lib/routes/routes.content.ts";
import { CaseThumbnail } from "#shared/media/CaseThumbnail/CaseThumbnail.tsx";
import { Button } from "#shared/ui/Button/Button.tsx";
import { Eyebrow } from "#shared/ui/Eyebrow/Eyebrow.tsx";
import { ArrowRight } from "#shared/ui/icons/icons.tsx";

import { Card } from "./Card.tsx";

const styles = {
  caseCard: clsx("md:grid-cols-case-md lg:grid-cols-case-lg"),
  thumbnail: clsx("relative w-full min-w-0"),
  body: clsx("flex w-full min-w-0 flex-col items-start gap-xs"),
  title: clsx("w-full text-title-md text-text-primary"),
  text: clsx("text-body-md text-text-secondary"),
};

/**
 * Figma: Card (Big Card). The About page’s principles, the Work page’s case cards and testimonials, and the persona
 * and impact cards in the case studies. Cards in a list fade up as they scroll into view, from tablet width up; cards
 * that close a case study, after its impact, stay still (`reveal={false}`).
 */
const meta = {
  title: "UI/Card",
  component: Card,
  args: {
    children: (
      <>
        <h3 className={styles.title}>Clarity First</h3>{" "}
        <p className={styles.text}>
          Complex tools don’t have to feel messy. I organise information so users can quickly find what they need
          without feeling lost in buttons and tables.
        </p>
      </>
    ),
  },
  argTypes: { children: { control: false } },
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Stack: Story = {};

/** The Work page’s case card: the thumbnail beside the text from tablet width up, with the grid columns the caller sets. */
export const Media: Story = {
  args: {
    layout: "media",
    gap: "lg",
    className: styles.caseCard,
    children: (
      <>
        <div className={styles.thumbnail}>
          <CaseThumbnail
            src="/assets/cases/project-planning/thumbnail-light.webp"
            darkSrc="/assets/cases/project-planning/thumbnail-dark.webp"
            alt="Sample project dashboards: a goals and milestones timeline, a budget burn table that marks each project’s status with 1 project over budget, and a card that turns a project orange at 80% and red at 100% of its budget."
          />
        </div>{" "}
        <div className={styles.body}>
          <Eyebrow parts={["B2B Enterprise SaaS", "Design System & PrimeNG"]} />{" "}
          <h3 className={styles.title}>{CASE_NAMES[VIEW.caseProjectPlanning].cardTitle}</h3>{" "}
          <p className={styles.text}>
            Designed a desktop platform for time tracking, meeting cost, project budgets and portfolio reporting, built
            on PrimeNG design tokens in Light and Dark mode. Mentored a UX intern and labelled every new piece of
            business logic as a proposal for client sign-off.
          </p>{" "}
          <Button variant="link" iconRight={ArrowRight}>
            View Case Study
          </Button>
        </div>
      </>
    ),
  },
};
