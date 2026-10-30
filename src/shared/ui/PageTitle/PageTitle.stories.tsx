import type { Meta, StoryObj } from "@storybook/react-vite";

import { PageTitle } from "./PageTitle.tsx";

/** The page's H1: Display Small on phones, Display Medium from md. No trailing period. */
const meta = {
  title: "UI/PageTitle",
  component: PageTitle,
  args: { id: "story-title", children: "Clarity for Complex Enterprise Software" },
} satisfies Meta<typeof PageTitle>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
