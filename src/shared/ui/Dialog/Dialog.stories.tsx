import type { Meta, StoryObj } from "@storybook/react-vite";
import { clsx } from "clsx";
import { useId, useRef, useState } from "react";
import { expect, fn, userEvent, waitFor } from "storybook/test";

import { Screenshot } from "#shared/media/Screenshot/Screenshot.tsx";
import { Button } from "#shared/ui/Button/Button.tsx";
import { IconButton } from "#shared/ui/IconButton/IconButton.tsx";
import { X } from "#shared/ui/icons/icons.tsx";

import { Dialog } from "./Dialog.tsx";
import type { DialogProps } from "./Dialog.types.ts";

/**
 * The panel the site's one dialog, the image viewer, puts inside the shell: its classes, copied from the viewer
 * (features/image-viewer, which shared code may not import). Tailwind does not scan story files (app.css), so a class
 * here works only while the site itself uses it, as these do.
 */
const styles = {
  panel: clsx(
    "my-auto flex w-full max-w-header min-w-0 flex-col gap-sm rounded-lg border border-border-subtle bg-bg-surface-raised p-sm shadow-xl md:p-md",
  ),
  header: clsx("flex items-start gap-xs"),
  heading: clsx("mr-xs flex min-w-0 flex-1 flex-col gap-3xs"),
  title: clsx("text-title-md text-balance text-text-primary"),
  text: clsx("text-body-md text-text-secondary"),
};

/** A Project Planning screenshot with the copy its case study gives it, as the image viewer shows it. */
const SHOT = {
  src: "/assets/cases/project-planning/calendar-week-view-v2-light.webp",
  darkSrc: "/assets/cases/project-planning/calendar-week-view-v2-dark.webp",
  alt: "Month overview in week view: a Participant and Organizer switch, a project filter, a mini calendar with meeting counts, the selected day’s meetings and a weekly grid of meetings with a current-time line.",
  title: "Month overview - week view",
  text: "People plan, attend and log time without switching context.",
};

/** A native modal dialog with a panel like the image viewer’s: title, Close, a screenshot and its description. */
function DialogDemo({ onClose }: Pick<DialogProps, "onClose">) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>Open dialog</Button>
      <Dialog
        dialogRef={dialogRef}
        open={open}
        labelledBy={titleId}
        onClose={() => {
          setOpen(false);
          onClose();
        }}
      >
        <div className={styles.panel}>
          <div className={styles.header}>
            <div className={styles.heading}>
              <h2 id={titleId} className={styles.title}>
                {SHOT.title}
              </h2>
            </div>{" "}
            <IconButton label="Close dialog" icon={X} onClick={() => dialogRef.current?.close()} />
          </div>
          {/* Sized like the image viewer’s picture: its height fits the window (this file is 2000 x 1422). */}
          <div style={{ width: "min(100%, calc((100dvh - 14rem) * 1.406))", marginInline: "auto" }}>
            <Screenshot src={SHOT.src} darkSrc={SHOT.darkSrc} alt={SHOT.alt} />
          </div>
          <p className={styles.text}>{SHOT.text}</p>
        </div>
      </Dialog>
    </>
  );
}

/**
 * A native modal dialog (`<dialog>` with `showModal`): the page behind becomes inert and dimmed, focus stays inside,
 * and Escape, Close or a click on the backdrop closes it. The shell is a full-screen layer; the panel inside comes
 * from the caller, here one like the image viewer’s, the site’s one dialog.
 */
const meta = {
  title: "UI/Dialog",
  component: DialogDemo,
  args: { onClose: fn() },
  parameters: {
    // An open modal covers the whole page: on the docs page it gets a frame of its own.
    docs: { story: { inline: false, iframeHeight: 720 } },
  },
} satisfies Meta<typeof DialogDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Opened, as a visitor sees it: Close takes the focus, so the keyboard starts inside the dialog. */
export const Open: Story = {
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Open dialog" }));
    const dialog = canvas.getByRole("dialog", { name: SHOT.title });
    await expect(dialog).toHaveAttribute("open");
    await expect(canvas.getByRole("img", { name: SHOT.alt })).toBeVisible();
    await waitFor(() => expect(canvas.getByRole("button", { name: "Close dialog" })).toHaveFocus());
  },
};

/** Close shuts it and calls onClose. From the sidebar only: on the docs page it would take focus from Open. */
export const OpenAndClose: Story = {
  name: "Open and Close",
  tags: ["!autodocs"],
  play: async ({ canvas, args }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Open dialog" }));
    const dialog = canvas.getByRole("dialog", { name: SHOT.title });
    await expect(dialog).toHaveAttribute("open");
    await userEvent.click(canvas.getByRole("button", { name: "Close dialog" }));
    await expect(dialog).not.toHaveAttribute("open");
    // The dialog's close event, which calls onClose, comes a moment after close() in a real browser.
    await waitFor(() => expect(args.onClose).toHaveBeenCalledOnce());
  },
};
