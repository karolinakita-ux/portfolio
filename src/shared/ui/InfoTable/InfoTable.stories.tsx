import type { Meta, StoryObj } from "@storybook/react-vite";

import { InfoTableCell } from "#shared/ui/InfoTableCell/InfoTableCell.tsx";

import { InfoTable } from "./InfoTable.tsx";

/**
 * Figma: Info Table. Label/value cells: two side by side from lg, or one per row. The Contact page’s details and the
 * privacy policy’s recipients.
 */
const meta = {
  title: "UI/InfoTable",
  component: InfoTable,
  args: {
    children: (
      <>
        <InfoTableCell label="Location">Poland (CET / UTC+1)</InfoTableCell>
        <InfoTableCell label="Collaboration">
          Available for remote work worldwide. Comfortable collaborating across European time zones and overlapping with
          US East Coast (EST) working hours.
        </InfoTableCell>
      </>
    ),
  },
  argTypes: { children: { control: false } },
} satisfies Meta<typeof InfoTable>;

export default meta;
type Story = StoryObj<typeof meta>;

export const TwoColumns: Story = {};

export const OneColumn: Story = { args: { columns: 1 } };
