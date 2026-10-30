import { PROFILE } from "#shared/content/profile.ts";
import { EmailLink } from "#shared/ui/EmailLink/EmailLink.tsx";
import { lead } from "#shared/ui/lead/lead.tsx";

import type { AccessibilityContent } from "./accessibility.types.ts";

/**
 * The accessibility statement: what the site supports, its known limits, how it is checked and how to report a
 * problem. Keep it true to the code (CLAUDE.md, Design tokens; `yarn a11y` in scripts/a11y-audit.ts) and change
 * `updated` with every edit.
 */

const email = <EmailLink email={PROFILE.email} place="accessibility" />;

export const ACCESSIBILITY: AccessibilityContent = {
  eyebrow: "Accessibility statement",
  title: "Accessibility",
  intro:
    "How this website works for people who use it in different ways, and what to do if something does not work for you.",
  updated: { iso: "2026-10-30", label: "30 October 2026" },
  sections: [
    {
      id: "in-short",
      title: "In short",
      points: [
        "This website aims to meet the Web Content Accessibility Guidelines (WCAG) 2.2 at level AA.",
        "You can use it with a keyboard or a screen reader, with zoom up to 400% and with a larger text size.",
        "It follows your device's settings for dark mode, reduced motion and more contrast.",
        <>If something does not work for you, write to me at {email}.</>,
      ],
    },
    {
      id: "what-you-can-do",
      title: "What you can do",
      points: [
        lead(
          "Keyboard",
          "every link and button can be reached with Tab, in reading order. The focus is always visible and never hidden behind the header or the statistics box, and a Skip to main content link comes first.",
        ),
        lead(
          "Screen readers",
          "pages have headings, landmarks and labelled controls, images have descriptions, and decorative images are hidden. Copying the email address or a section link is announced.",
        ),
        lead(
          "Zoom and text size",
          "up to 400% zoom, pages fit the window without sideways scrolling, and text, spacing and layout grow with a larger default text size in your browser.",
        ),
        lead(
          "Dark mode",
          "the site follows your device setting, and the switch in the header changes it for this site.",
        ),
        lead("Less motion", "if your device asks for reduced motion, animations stop and changes happen at once."),
        lead(
          "More contrast",
          "if your device asks for more contrast (Increase contrast on a Mac, iPhone or iPad), text, links and borders get stronger colours. Windows contrast themes work too.",
        ),
        lead(
          "Screenshots",
          "the image viewer opens each one full size. You can zoom in, and move between screenshots with the arrow keys or a swipe.",
        ),
        lead(
          "CV",
          "read it as a web page like the others, or download the PDF. The PDF has real text with tagged headings, lists and links, bookmarks for its sections, and the Polish consent marked as Polish.",
        ),
      ],
    },
    {
      id: "known-limits",
      title: "Known limits",
      points: [
        lead(
          "Screenshots",
          "the case studies show screenshots of the products I worked on. Their descriptions say what each one shows, not every word in it, and text inside a screenshot does not follow your text size or contrast settings. You can zoom in on it in the image viewer.",
        ),
        lead(
          "CV as a PDF",
          "it is A4 and always light, and it does not follow your text size or contrast settings. The CV page has the same content and follows them.",
        ),
        lead(
          "Other websites",
          "links to LinkedIn, Figma, GitHub and other websites open those websites, and I do not control their accessibility. The Storybook library uses Storybook's own interface; its component examples are checked with the same automated rules as the site, except colour contrast.",
        ),
      ],
    },
    {
      id: "how-i-check-it",
      title: "How I check it",
      paragraphs: [
        "I check every page with automated tests in a real browser: the WCAG rules that tools can test (axe), the keyboard order and whether anything hides the focus, an emulated screen reader, 320px width and 400% zoom, a 200% text size and Windows contrast themes. Other tests check that animations stop with reduced motion and that colours get stronger with more contrast. Each component in the Storybook library is also checked with axe in its examples every time the code changes.",
        "Automated tests cannot find every problem, so feedback from people who use the web in different ways matters most to me.",
      ],
    },
    {
      id: "feedback",
      title: "Feedback",
      paragraphs: [
        <>
          If something on this website does not work for you, or you need its content in another format, write to me at{" "}
          {email}. Tell me which page and what happened. I will reply and fix what I can.
        </>,
      ],
    },
  ],
};
