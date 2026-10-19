import type { Meta, StoryObj } from "@storybook/react-vite";

import { CaseThumbnail } from "./CaseThumbnail.tsx";

/** Work-page thumbnail: a 4:3 frame, the image contained, a wireframe while it loads. */
const meta = {
  title: "Media/CaseThumbnail",
  component: CaseThumbnail,
  args: { src: "/assets/cases/meetestim/thumbnail.webp", alt: "MeetEstim project dashboard" },
} satisfies Meta<typeof CaseThumbnail>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Missing: Story = { args: { src: "/assets/cases/missing.webp", alt: "A screenshot that cannot load" } };
