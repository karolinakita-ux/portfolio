import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, waitFor } from "storybook/test";

import { BackToTop } from "./BackToTop.tsx";

/**
 * The round button in the bottom-right corner of every page: it shows once the page has scrolled 640px and takes the
 * visitor back to the top. It stays shown while it has focus.
 */
const meta = {
  title: "Layout/BackToTop",
  component: BackToTop,
  args: { onActivate: fn() },
  parameters: {
    // Fixed to the window: on the docs page in a frame of its own, which the first story scrolls.
    docs: { story: { inline: false, iframeHeight: 320 } },
  },
  // A page long enough to scroll 800px at any frame height (300vh scrolled only 640px in the 320px docs frame).
  decorators: [
    (Story) => (
      <div style={{ minHeight: "calc(100vh + 1600px)" }}>
        <Story />
      </div>
    ),
  ],
  // As on the site (App.tsx): the click takes the page back to the top.
  render: (args) => (
    <BackToTop
      onActivate={() => {
        args.onActivate();
        window.scrollTo({ top: 0 });
      }}
    />
  ),
} satisfies Meta<typeof BackToTop>;

export default meta;
type Story = StoryObj<typeof meta>;

/** After scrolling down, as a visitor first sees it. */
export const Scrolled: Story = {
  play: async ({ canvas }) => {
    window.scrollTo({ top: 800 });
    // jsdom (stories.test.tsx) has no layout: nothing scrolls there (setup.ts stubs scrollTo).
    if (window.scrollY < 640) return;
    const button = canvas.getByRole("button", { hidden: true });
    await waitFor(() => expect(button).toHaveAttribute("aria-hidden", "false"));
  },
};

/** Keyboard focus keeps it shown, also at the top of the page. From the sidebar only: it moves focus. */
export const Focused: Story = {
  tags: ["!autodocs"],
  play: async ({ canvas, args }) => {
    // Hidden until the page scrolls or it gets focus, so it has no accessible name yet.
    const button = canvas.getByRole("button", { hidden: true });
    button.focus();
    await waitFor(() => expect(button).toHaveAttribute("aria-hidden", "false"));
    await userEvent.click(button);
    await expect(args.onActivate).toHaveBeenCalledOnce();
  },
};
