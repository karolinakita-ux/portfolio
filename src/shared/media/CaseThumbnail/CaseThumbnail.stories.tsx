import type { Meta, StoryObj } from "@storybook/react-vite";

import { CaseThumbnail } from "./CaseThumbnail.tsx";

/** Work-page thumbnail: a 16:10 frame filled edge to edge, a wireframe while it loads. Dark mode shows `darkSrc`. */
const meta = {
  title: "Media/CaseThumbnail",
  component: CaseThumbnail,
  args: {
    src: "/assets/cases/project-planning/thumbnail-light.webp",
    darkSrc: "/assets/cases/project-planning/thumbnail-dark.webp",
    alt: "Sample project dashboards: a goals and milestones timeline, a budget burn table, and budget guardrails that flag projects at 80% and 100% of their budget.",
  },
} satisfies Meta<typeof CaseThumbnail>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Missing: Story = { args: { src: "/assets/cases/missing.webp", alt: "A screenshot that cannot load" } };
