import type { Meta, StoryObj } from "@storybook/react-vite";

import { ThumbnailScaffold } from "./ThumbnailScaffold.tsx";

/** The wireframe behind a loading thumbnail (it pulses twice, then holds still), or a failed one. */
const meta = {
  title: "Media/ThumbnailScaffold",
  component: ThumbnailScaffold,
  decorators: [
    (Story) => (
      <div style={{ position: "relative", width: 320, aspectRatio: "4 / 3" }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ThumbnailScaffold>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Loading: Story = {};

export const Failed: Story = { args: { failed: true } };
