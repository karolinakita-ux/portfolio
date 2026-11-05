import type { Meta, StoryObj } from "@storybook/react-vite";
import { clsx } from "clsx";
import { expect } from "storybook/test";

import { BannerLink } from "#shared/ui/BannerLink/BannerLink.tsx";
import { Figma } from "#shared/ui/icons/icons.tsx";
import { Strong } from "#shared/ui/Strong/Strong.tsx";

import { Callout } from "./Callout.tsx";

const styles = {
  body: clsx("flex flex-col items-start gap-md"),
};

/**
 * Figma: Banner, Info | Warning. Plain text, or a titled block. The title is an H3 (under a section’s H2); a banner
 * between sections makes it an H2, one inside a block with its own H3 an H4 (`headingLevel`). The look stays.
 */
const meta = {
  title: "UI/Callout",
  component: Callout,
  args: {
    tone: "warning",
    label: "Confidentiality note",
    children: (
      <>
        Due to confidentiality and <Strong>NDAs</Strong>, client names, product names and sensitive business data in the
        case studies have been anonymised. In-depth walkthroughs of proprietary flows are available during interviews.
      </>
    ),
  },
} satisfies Meta<typeof Callout>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Warning: Story = {};

/** A titled note, as on the privacy page. */
export const WithTitle: Story = {
  args: {
    tone: "info",
    label: "Your Right to Object",
    title: "Your Right to Object",
    children: (
      <p>
        You can object at any time to the use of your data based on my legitimate interest: the server logs, and emails
        that are not about work (GDPR Art. 21). The statistics run only with your consent, which you can withdraw with
        the switch on this page.
      </p>
    ),
  },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("heading", { level: 3, name: "Your Right to Object" })).toBeVisible();
  },
};

/** With an `id`, a titled banner is linkable like a Section: the copy-link icon shows on hover and focus. */
export const Linkable: Story = {
  args: {
    tone: "info",
    label: "How this portfolio was built",
    title: "Behind the Design",
    id: "behind-the-design",
    children: (
      <p>
        I treat design handoff seriously. Components and flows are organised with clear states, responsive layouts, and
        practical documentation so developers don’t have to guess how things should behave.
      </p>
    ),
  },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("complementary", { name: "How this portfolio was built" })).toHaveAttribute(
      "id",
      "behind-the-design",
    );
    await expect(canvas.getByRole("link", { name: "Copy link to section: Behind the Design" })).toHaveAttribute(
      "href",
      "#behind-the-design",
    );
  },
};

/** A case study’s closing banner: its title is an H2, and the link opens the Figma file in a new tab. */
export const BetweenSections: Story = {
  args: {
    tone: "info",
    label: "Design files",
    title: "Inspect the Design Files",
    headingLevel: 2,
    children: (
      <div className={styles.body}>
        <p>
          The Figma file holds the token collections and their DTCG export, the mobile screens and states in Light and
          Dark mode, the operations console, the components with their variants and the original 2022 screens for
          comparison.
        </p>{" "}
        <BannerLink
          href="https://www.figma.com/design/al8zX7vvgJvxNPUaeKp38Q/Smart-Ticket-App?node-id=200-85&t=rLEE9MGJA3JJXZxT-1"
          icon={Figma}
        >
          Explore the Figma File
        </BannerLink>
      </div>
    ),
  },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("heading", { level: 2, name: "Inspect the Design Files" })).toBeVisible();
  },
};
