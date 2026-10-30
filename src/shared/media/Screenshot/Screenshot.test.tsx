import { fireEvent, render, screen } from "@testing-library/react";
import ASSET_SIZES from "virtual:asset-sizes";
import { describe, expect, it } from "vitest";

import { Screenshot } from "./Screenshot.tsx";

const FULL = "cases/automotive/multi-market-survey-light.webp";

describe("Screenshot", () => {
  it("gives the image its file's width and height", () => {
    render(<Screenshot src={"/assets/" + FULL} alt="Survey" />);
    const [width, height] = ASSET_SIZES[FULL] ?? [];
    expect(screen.getByRole("img", { name: "Survey" })).toHaveAttribute("width", String(width));
    expect(screen.getByRole("img", { name: "Survey" })).toHaveAttribute("height", String(height));
  });

  it("takes the size of the file it shows: none for an unknown file, then the fallback's", () => {
    render(<Screenshot src="/assets/cases/missing.webp" fallbackSrc={"/assets/" + FULL} alt="Survey" />);
    const image = screen.getByRole("img", { name: "Survey" });
    expect(image).not.toHaveAttribute("width");
    expect(image).not.toHaveAttribute("height");
    fireEvent.error(image);
    expect(screen.getByRole("img", { name: "Survey" })).toHaveAttribute("src", "/assets/" + FULL);
    expect(screen.getByRole("img", { name: "Survey" })).toHaveAttribute("width", String(ASSET_SIZES[FULL]?.[0]));
  });
});
