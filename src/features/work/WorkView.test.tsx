import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type * as Profile from "#shared/content/profile.ts";

import { WorkView } from "./WorkView.tsx";

// The source-code button appears only once PROFILE.repositoryUrl is set (the repo is public).
vi.mock("#shared/content/profile.ts", async (importOriginal) => {
  const actual = await importOriginal<typeof Profile>();
  return { PROFILE: { ...actual.PROFILE, repositoryUrl: "https://github.com/karolinakita-ux/portfolio" } };
});

describe("WorkView", () => {
  it("links the source code next to the Figma workspace, in a new tab", () => {
    render(<WorkView resolveAsset={(name) => "/assets/" + name} onNavigate={() => undefined} />);
    const link = screen.getByRole("link", { name: /^View Code on GitHub.*opens in a new tab/ });
    expect(link).toHaveAttribute("href", "https://github.com/karolinakita-ux/portfolio");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("links the Figma workspace and the code from the Behind the Design banner", () => {
    render(<WorkView resolveAsset={(name) => "/assets/" + name} onNavigate={() => undefined} />);
    const figma = screen.getByRole("link", { name: /^Explore the Figma Workspace.*opens in a new tab/ });
    expect(figma).toHaveAttribute("href", expect.stringContaining("figma.com"));
    const code = screen.getByRole("link", { name: /^Explore the Code on GitHub.*opens in a new tab/ });
    expect(code).toHaveAttribute("href", "https://github.com/karolinakita-ux/portfolio");
    expect(code).toHaveAttribute("target", "_blank");
  });
});
