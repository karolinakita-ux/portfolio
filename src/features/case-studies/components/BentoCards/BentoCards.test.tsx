import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { DATA_GOVERNANCE_CASE } from "#features/case-studies/content/data-governance.content.ts";

import { BentoCards } from "./BentoCards.tsx";

const { delivery, engineering } = DATA_GOVERNANCE_CASE;

/** The cards' own list (a card's visual can hold a list too). */
const cardList = () => screen.getAllByRole("list")[0]!;

describe("BentoCards", () => {
  it("numbers a list from 01 by its position alone: the number on screen is hidden from screen readers", () => {
    render(<BentoCards items={delivery} />);
    const list = cardList();
    expect(list).not.toHaveAttribute("start");
    const items = [...list.children];
    expect(items).toHaveLength(delivery.length);
    expect(within(items[0] as HTMLElement).getByText("01")).toHaveAttribute("aria-hidden", "true");
  });

  it("continues the numbering for screen readers too: the list starts there and says the number on screen", () => {
    const start = delivery.length + 1;
    render(<BentoCards items={engineering} start={start} columns={2} />);
    const list = cardList();
    // Screen readers count each list from 1 ("1 of 2"), so the shown 05 must reach them as text.
    expect(list).toHaveAttribute("start", String(start));
    const numbers = [...list.children].map((item, index) =>
      within(item as HTMLElement).getByText(String(start + index).padStart(2, "0")),
    );
    expect(numbers.map((number) => number.textContent)).toEqual(["05", "06"]);
    for (const number of numbers) expect(number).not.toHaveAttribute("aria-hidden");
  });
});
