import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { VIEW_PATHS, VIEWS } from "#shared/lib/routes/routes.constants.ts";
import { joinedText } from "#test/plain-text.ts";

import { App } from "./App/App.tsx";

/**
 * Every page also reads cleanly as plain text: what search engines, AI assistants and text-only tools take
 * from the prerendered HTML, without CSS (src/test/plain-text.ts).
 */
describe("pages as plain text", () => {
  it.each(VIEWS)("%s: no words from two elements run together", (view) => {
    window.history.replaceState(null, "", VIEW_PATHS[view]);
    const { baseElement } = render(<App />);
    expect(joinedText(baseElement)).toEqual([]);
  });
});
