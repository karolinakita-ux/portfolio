import { composeStories, setProjectAnnotations } from "@storybook/react-vite";
import axe from "axe-core";
import { describe, expect, it } from "vitest";

import preview from "../../.storybook/preview.tsx";

/**
 * Every Storybook story as a test: it renders with the site's preview settings, runs its play
 * function (the interaction checks written in the story), and then passes axe (WCAG 2.1 A/AA).
 * jsdom has no layout, so colour contrast is left to `yarn a11y` and the browser checks; a story is
 * a fragment, so the page-level rules (landmarks, one h1) are left to the page audits too.
 * A new *.stories.tsx is picked up by itself.
 */
setProjectAnnotations([preview]);

type StoriesModule = Parameters<typeof composeStories>[0];
/** What a composed story offers: render it and run its play function. */
interface RunnableStory {
  run: () => Promise<void>;
}

const modules = import.meta.glob<StoriesModule>("../**/*.stories.tsx", { eager: true });

const AXE_OPTIONS: axe.RunOptions = {
  runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"] },
  rules: {
    "color-contrast": { enabled: false },
    region: { enabled: false },
    "landmark-one-main": { enabled: false },
    "page-has-heading-one": { enabled: false },
  },
};

/** Shared components whose story lives with a sibling (they only make sense together). */
const COVERED_ELSEWHERE: Readonly<Record<string, string>> = {
  AccordionItem: "Accordion",
  InfoTableCell: "InfoTable",
  Lang: "Strong",
  NewTabNote: "Strong",
  Swatch: "Strong",
  VisuallyHidden: "Strong",
};

/** Every component folder of the shared library: src/shared/<ui|layout|media>/<Name>/<Name>.tsx. */
const components = Object.keys(import.meta.glob("../shared/{ui,layout,media}/*/*.tsx"))
  .map((path) => /\/([A-Z]\w+)\/\1\.tsx$/.exec(path)?.[1])
  .filter((name) => name !== undefined);

describe("stories", () => {
  it("cover every shared component", () => {
    const withStory = new Set(Object.keys(modules).map((path) => /\/(\w+)\.stories\.tsx$/.exec(path)?.[1]));
    const missing = components.filter((name) => !withStory.has(COVERED_ELSEWHERE[name] ?? name));
    expect(components.length).toBeGreaterThan(20);
    expect(missing).toEqual([]);
  });
});

describe.each(Object.entries(modules))("%s", (_path, module) => {
  it.each(Object.entries(composeStories(module) as Record<string, RunnableStory>))(
    "%s renders, passes its checks and axe",
    async (_name, Story) => {
      await expect(Story.run()).resolves.toBeUndefined();
      const { violations } = await axe.run(document.body, AXE_OPTIONS);
      expect(violations.map((violation) => `${violation.id}: ${violation.help}`)).toEqual([]);
    },
  );
});
