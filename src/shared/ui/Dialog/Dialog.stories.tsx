import type { Meta, StoryObj } from "@storybook/react-vite";
import { useId, useRef, useState } from "react";
import { expect, fn, userEvent } from "storybook/test";

import { Button } from "#shared/ui/Button/Button.tsx";
import { IconButton } from "#shared/ui/IconButton/IconButton.tsx";
import { X } from "#shared/ui/icons/icons.tsx";

import { Dialog } from "./Dialog.tsx";
import type { DialogProps } from "./Dialog.types.ts";

/** A native modal dialog: the page behind becomes inert, Escape and a backdrop click close it. */
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
        <div>
          <h2 id={titleId}>Dialog Title</h2>
          <IconButton label="Close dialog" icon={X} onClick={() => dialogRef.current?.close()} />
        </div>
      </Dialog>
    </>
  );
}

const meta = {
  title: "UI/Dialog",
  component: DialogDemo,
  args: { onClose: fn() },
} satisfies Meta<typeof DialogDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const OpenAndClose: Story = {
  play: async ({ canvas, args }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Open dialog" }));
    const dialog = canvas.getByRole("dialog", { name: "Dialog Title" });
    await expect(dialog).toHaveAttribute("open");
    await userEvent.click(canvas.getByRole("button", { name: "Close dialog" }));
    await expect(dialog).not.toHaveAttribute("open");
    await expect(args.onClose).toHaveBeenCalledOnce();
  },
};
