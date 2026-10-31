import { readFileSync } from "node:fs";
import { join } from "node:path";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { App } from "#app/App/App.tsx";
import { VIEW, VIEW_PATHS, VIEWS } from "#shared/lib/routes/routes.constants.ts";
import type { View } from "#shared/lib/routes/routes.types.ts";

import { HEAD_TAGS } from "./seo.constants.ts";
import { headFor, headTagSelector } from "./seo.utils.ts";
import { applyHead } from "./static-head.utils.ts";

vi.mock("#shared/media/image-preload/image-preload.utils.ts", () => ({ preloadImages: vi.fn() }));

type Node = Record<string, unknown>;

const TEMPLATE = readFileSync(join(process.cwd(), "index.html"), "utf8");
let added: Element[] = [];

/** Opens a page as a visitor gets it: the prerendered head (scripts/prerender.ts), then the app. */
const openPage = (view: View) => {
  const head = new DOMParser().parseFromString(applyHead(TEMPLATE, headFor(view)), "text/html").head;
  added = [...head.querySelectorAll("meta, link[rel=canonical], script[data-page]")].map((tag) =>
    document.head.appendChild(document.importNode(tag, true)),
  );
  window.history.replaceState(null, "", VIEW_PATHS[view]);
  const user = userEvent.setup();
  render(<App />);
  return { user };
};

afterEach(() => {
  for (const tag of added) tag.remove();
  added = [];
});

/** What the open document's head says: the title, each tag in HEAD_TAGS and the page's structured data. */
const openHead = () => ({
  title: document.title,
  tags: HEAD_TAGS.map((tag) => {
    const selector = headTagSelector(tag);
    return [selector, document.head.querySelector(selector)?.getAttribute(tag.attribute)];
  }),
  data: JSON.parse(document.head.querySelector("script[data-page]")?.textContent ?? "null") as unknown,
});

/** What the head of `view` says, every tag of it. */
const headOf = (view: View) => {
  const head = headFor(view);
  return {
    title: head.title,
    tags: HEAD_TAGS.map((tag) => [headTagSelector(tag), head[tag.field]]),
    data: head.jsonLd,
  };
};

const crumbNames = (view: View): unknown[] => {
  const page = (headFor(view).jsonLd["@graph"] as Node[])[0];
  const list = page?.breadcrumb as { itemListElement: Node[] } | undefined;
  return list?.itemListElement.map((item) => item.name) ?? [];
};

describe("useDocumentHead", () => {
  it("moves the title, every head tag and the structured data to each new page", async () => {
    const { user } = openPage(VIEW.about);
    expect(openHead()).toEqual(headOf(VIEW.about));

    await user.click(within(screen.getByRole("navigation", { name: "Primary" })).getByRole("link", { name: "Work" }));
    expect(openHead()).toEqual(headOf(VIEW.work));

    const automotive = screen
      .getAllByRole("link", { name: /^View Case Study/ })
      .find((link) => link.getAttribute("href") === "/work/automotive");
    if (!automotive) throw new Error("no View Case Study link to the Automotive case");
    await user.click(automotive);
    expect(openHead()).toEqual(headOf(VIEW.caseAutomotive));
  });

  it("leaves the robots tag as the page was loaded (Google advises against changing it with JavaScript)", async () => {
    const { user } = openPage(VIEW.about);
    await user.click(
      within(screen.getByRole("navigation", { name: "Primary" })).getByRole("link", { name: "Contact" }),
    );
    expect(document.head.querySelector('meta[name="robots"]')).toHaveAttribute(
      "content",
      "index, follow, max-image-preview:large",
    );
  });

  it.each(VIEWS)("names the breadcrumb of %s in the structured data as the page shows it", (view) => {
    openPage(view);
    const breadcrumb = screen.queryByRole("navigation", { name: "Breadcrumb" });
    const shown = breadcrumb
      ? within(breadcrumb)
          .getAllByRole("listitem")
          .map((item) => item.textContent.trim())
      : [];
    expect(crumbNames(view)).toEqual(shown);
    expect(shown).toHaveLength(view === VIEW.work ? 0 : 2);
  });
});
