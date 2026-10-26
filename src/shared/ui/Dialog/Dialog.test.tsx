import { fireEvent, render, screen } from "@testing-library/react";
import { useRef } from "react";
import { describe, expect, it, vi } from "vitest";

import { Dialog } from "./Dialog.tsx";

function OpenDialog({ onClose }: { onClose: () => void }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  return (
    <Dialog dialogRef={dialogRef} open labelledBy="dialog-title" onClose={onClose}>
      <h2 id="dialog-title">Survey data quality</h2>
    </Dialog>
  );
}

describe("Dialog", () => {
  it("closes on a press on the backdrop, not on one that starts inside and ends over it", () => {
    const onClose = vi.fn();
    render(<OpenDialog onClose={onClose} />);
    const dialog = screen.getByRole("dialog", { name: "Survey data quality" });

    // Selecting the title text and letting go over the backdrop: the click lands on the dialog.
    fireEvent.pointerDown(screen.getByRole("heading", { name: "Survey data quality" }));
    fireEvent.click(dialog);
    expect(dialog).toHaveAttribute("open");
    expect(onClose).not.toHaveBeenCalled();

    fireEvent.pointerDown(dialog);
    fireEvent.click(dialog);
    expect(dialog).not.toHaveAttribute("open");
    expect(onClose).toHaveBeenCalledOnce();
  });
});
