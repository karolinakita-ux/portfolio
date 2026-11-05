import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";

import type { Theme } from "#shared/hooks/theme/theme.types.ts";
import { useDocumentTheme } from "#shared/hooks/theme/useDocumentTheme.ts";
import { useLightbox } from "#shared/media/lightbox/lightbox.context.ts";
import type { LightboxItem, LightboxPlace } from "#shared/media/lightbox/lightbox.types.ts";
import { Screenshot } from "#shared/media/Screenshot/Screenshot.tsx";
import { Section } from "#shared/ui/Section/Section.tsx";

import { LightboxProvider } from "./LightboxProvider.tsx";

/** Three of Project Planning’s screenshots with the copy its case study gives them; `file`: their files’ base name. */
const SHOTS = [
  {
    id: "calendar-week-view",
    file: "calendar-week-view-v2",
    section: "Scheduling and Time Logging in One Calendar",
    lead: "People plan, attend and log time without switching context.",
    title: "Month overview - week view",
    alt: "Month overview in week view: a Participant and Organizer switch, a project filter, a mini calendar with meeting counts, the selected day’s meetings and a weekly grid of meetings with a current-time line.",
  },
  {
    id: "goals-milestones-timeline",
    file: "goals-milestones-timeline",
    section: "Goals & Milestones Timeline (Proposal)",
    lead: "A proposed view that answers “are we on track?” for every goal in a project. Its goal-tracking logic is new, so it waits for the client’s sign-off.",
    title: "Goals & milestones timeline",
    alt: "Goals and milestones timeline: a tree of goals, key results and milestones with owners and status tags beside a Gantt chart with progress bars, milestone diamonds, dependencies, a Today marker and an at-risk popover.",
  },
  {
    id: "cost-distribution",
    file: "cost-distribution",
    section: "From One Project’s Budget to the Whole Portfolio",
    lead: "Finance, delivery and the PMO look at the same numbers, at the level of detail they need.",
    title: "PMO - cost distribution",
    alt: "Cost distribution: a drill-down sunburst chart beside a table of programmes with cost in PLN, share and difference against plan.",
  },
] as const;

const file = (name: string, theme: Theme) => `/assets/cases/project-planning/${name}-${theme}.webp`;

/**
 * As a case study finds it (features/case-studies, imagePlace): the screenshot's button, the section around it, and the
 * section's heading, where its description starts.
 */
const placeOf = (id: string) => (): LightboxPlace | null => {
  const target = [...document.querySelectorAll<HTMLElement>("[data-image]")].find((el) => el.dataset.image === id);
  const area = target?.closest("section");
  const description = area?.querySelector("h2");
  return target && area && description ? { target, area, description } : null;
};

/** A case page in short: each screenshot below its description, all three in one gallery. */
function CasePage() {
  const openImage = useLightbox();
  const theme = useDocumentTheme();
  const items: LightboxItem[] = SHOTS.map((shot) => ({
    src: file(shot.file, theme),
    alt: shot.alt,
    title: shot.title,
    place: placeOf(shot.id),
  }));
  return SHOTS.map((shot, index) => (
    <Section key={shot.id} id={"viewer-" + shot.id} title={shot.section} description={shot.lead}>
      <Screenshot
        src={file(shot.file, "light")}
        darkSrc={file(shot.file, "dark")}
        alt={shot.alt}
        imageId={shot.id}
        onExpand={(trigger) => openImage(items, index, trigger)}
      />
    </Section>
  ));
}

function ImageViewer() {
  return (
    <LightboxProvider>
      <CasePage />
    </LightboxProvider>
  );
}

/**
 * The case studies’ image viewer (Figma: Image Viewer · Go to Description). The title row holds the counter, the
 * title, Go to Description and Close: one row from md, Go to Description on a row of its own below md. Closing the
 * viewer lands on the screenshot shown, below its description, with focus on it; Go to Description lands on the
 * description itself, from its heading, with focus on the heading.
 */
const meta = {
  title: "Patterns/Image Viewer",
  component: ImageViewer,
  parameters: {
    layout: "fullscreen",
    // In a frame of its own on the docs page: an open modal would cover the whole page. Only Desktop is there
    // (SIDEBAR_ONLY below): several open viewers on one page took focus from each other, and their checks failed.
    docs: { story: { inline: false, iframeHeight: 800 } },
    viewport: {
      options: {
        desktop: { name: "Desktop (1280 x 800)", styles: { width: "1280px", height: "800px" }, type: "desktop" },
        phone: { name: "Phone (390 x 844)", styles: { width: "390px", height: "844px" }, type: "mobile" },
        zoomed: { name: "Phone at 200% zoom (195 x 422)", styles: { width: "195px", height: "422px" }, type: "mobile" },
      },
    },
  },
} satisfies Meta<typeof ImageViewer>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Where focus is. Skipped only in a frame inside another page that has not given it focus: on the docs page the story
 * sits in a frame inside the docs frame, which WebKit (Safari) never focuses, so focus cannot move into it there. A
 * story on its own page (stories.test.tsx in jsdom, a story opened alone) is always checked, as it is in the sidebar.
 */
const expectFocusOn = async (element: HTMLElement) => {
  if (window.parent !== window && !document.hasFocus()) return;
  await waitFor(() => expect(element).toHaveFocus());
};

/**
 * Opens the first screenshot and moves to the second: the title row shows Go to Description beside Close. With the
 * Next image button, which works without focus: a key goes where focus is (the docs page in WebKit: outside).
 */
const openSecond: NonNullable<Story["play"]> = async ({ canvas }) => {
  await userEvent.click(canvas.getByRole("button", { name: /^View full size: ?Month overview in week view/ }));
  const dialog = canvas.getByRole("dialog", { name: "Month overview - week view" });
  await expectFocusOn(within(dialog).getByRole("button", { name: "Close image viewer" }));
  await userEvent.click(within(dialog).getByRole("button", { name: "Next image" }));
  await expect(within(dialog).getByText("2 / 3")).toBeInTheDocument();
  await expect(within(dialog).getByRole("heading", { name: "Goals & milestones timeline" })).toBeInTheDocument();
  // Named by its visible label, nothing more (WCAG 2.5.3).
  await expect(within(dialog).getByRole("button", { name: "Go to Description" })).toHaveTextContent(
    "Go to Description",
  );
};

export const Desktop: Story = {
  globals: { viewport: { value: "desktop", isRotated: false } },
  play: openSecond,
};

/** Each story but Desktop opens from the sidebar only: on the docs page their open viewers took focus from each other. */
const SIDEBAR_ONLY = ["!autodocs"];

export const Phone: Story = {
  tags: SIDEBAR_ONLY,
  globals: { viewport: { value: "phone", isRotated: false } },
  play: openSecond,
};

/**
 * A phone at 200% page zoom (or with a 200% text size): the counter shares Close’s row, the title takes the full width
 * under them, Go to Description keeps its own row, and the toolbar takes two rows. The image has the height they leave.
 */
export const PhoneAt200Percent: Story = {
  tags: SIDEBAR_ONLY,
  globals: { viewport: { value: "zoomed", isRotated: false } },
  play: openSecond,
};

/**
 * Go to Description closes the viewer onto the description of the screenshot it shows: its section from the top, focus
 * on the section’s heading. Closing lands on the screenshot itself, focus on its button.
 */
export const GoToDescription: Story = {
  tags: SIDEBAR_ONLY,
  play: async (context) => {
    await openSecond(context);
    const { canvas } = context;
    await userEvent.keyboard("{ArrowRight}");
    await userEvent.click(canvas.getByRole("button", { name: "Go to Description" }));
    await expect(canvas.getByRole("dialog", { hidden: true })).not.toHaveAttribute("open");
    // Focus moves once the viewer has closed and the page has landed: a moment later in a real browser.
    const heading = canvas.getByRole("heading", { level: 2, name: "From One Project’s Budget to the Whole Portfolio" });
    await waitFor(() => expect(heading).toHaveFocus());

    await userEvent.click(canvas.getByRole("button", { name: /^View full size: ?Cost distribution/ }));
    await userEvent.click(canvas.getByRole("button", { name: "Close image viewer" }));
    const screenshot = canvas.getByRole("button", { name: /^View full size: ?Cost distribution/ });
    await waitFor(() => expect(screenshot).toHaveFocus());
  },
};
