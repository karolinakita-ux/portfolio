import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { CopyEmail } from "./CopyEmail.tsx";

const EMAIL = "karolina.kita.zg@gmail.com";

function stubClipboard(writeText: (text: string) => Promise<void>) {
  Object.defineProperty(navigator, "clipboard", { value: { writeText }, configurable: true });
}

afterEach(() => {
  Reflect.deleteProperty(navigator, "clipboard");
});

describe("CopyEmail", () => {
  it("links to the mail app", () => {
    render(<CopyEmail email={EMAIL} />);
    expect(screen.getByRole("link", { name: /karolina\.kita\.zg@gmail\.com/ })).toHaveAttribute("href", "mailto:" + EMAIL);
  });

  it("copies the address and confirms in a live region", async () => {
    const writeText = vi.fn(() => Promise.resolve());
    stubClipboard(writeText);
    render(<CopyEmail email={EMAIL} />);

    fireEvent.click(screen.getByRole("button", { name: "Copy email address" }));

    expect(writeText).toHaveBeenCalledWith(EMAIL);
    expect(await screen.findByRole("status")).toHaveTextContent("Copied to clipboard!");
    expect(screen.getByRole("button", { name: "Email address copied to clipboard" })).toBeInTheDocument();
  });

  it("selects the address when the clipboard is blocked", async () => {
    stubClipboard(() => Promise.reject(new Error("denied")));
    render(<CopyEmail email={EMAIL} />);

    fireEvent.click(screen.getByRole("button", { name: "Copy email address" }));

    expect(await screen.findByText(/Selected - press Ctrl\+C/)).toBeInTheDocument();
    expect(window.getSelection()?.toString()).toBe(EMAIL);
  });

  it("selects the address when there is no clipboard API", () => {
    render(<CopyEmail email={EMAIL} />);
    fireEvent.click(screen.getByRole("button", { name: "Copy email address" }));
    expect(screen.getByRole("status")).toHaveTextContent(/Selected/);
  });
});
