import type { Meta, StoryObj } from "@storybook/react-vite";
import { clsx } from "clsx";

import { CaseThumbnail } from "./CaseThumbnail.tsx";

/** The Work card’s thumbnail slot (features/work CaseCard): its hover group, 18.75rem wide from lg. */
const styles = { card: clsx("group/thumb relative w-full min-w-0") };

/**
 * Work-page thumbnail: a 16:10 frame filled edge to edge, a wireframe while it loads. Dark mode shows `darkSrc`. Hover
 * it for the slight zoom.
 */
const meta = {
  title: "Media/CaseThumbnail",
  component: CaseThumbnail,
  args: {
    src: "/assets/cases/project-planning/thumbnail-light.webp",
    darkSrc: "/assets/cases/project-planning/thumbnail-dark.webp",
    alt: "Sample project dashboards: a goals and milestones timeline, a budget burn table, and budget guardrails that flag projects at 80% and 100% of their budget.",
    interactive: true,
  },
  decorators: [
    (Story) => (
      <div className={styles.card} style={{ maxWidth: "18.75rem" }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof CaseThumbnail>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/**
 * When the image cannot load: the drawing of a page the thumbnail shows while it waits stays, still, with “Preview
 * unavailable” under it. The file here does not exist on purpose.
 */
export const Missing: Story = {
  args: { src: "/assets/cases/missing.webp", darkSrc: undefined, alt: "A screenshot that cannot load" },
};
