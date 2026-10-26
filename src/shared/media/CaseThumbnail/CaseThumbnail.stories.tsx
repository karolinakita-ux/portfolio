import type { Meta, StoryObj } from "@storybook/react-vite";

import { CaseThumbnail } from "./CaseThumbnail.tsx";

/** Work-page thumbnail: a 4:3 frame, the image contained, a wireframe while it loads. */
const meta = {
  title: "Media/CaseThumbnail",
  component: CaseThumbnail,
  args: {
    src: "/assets/cases/project-planning/thumbnail.webp",
    alt: "Month overview: a participant calendar with a mini month picker beside a weekly schedule of meetings.",
  },
} satisfies Meta<typeof CaseThumbnail>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Missing: Story = { args: { src: "/assets/cases/missing.webp", alt: "A screenshot that cannot load" } };
