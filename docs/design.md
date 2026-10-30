# Design source

The site's look comes from Karolina's KitaBranding design system in Figma.

- Figma file: [Karolina Kita Branding](https://www.figma.com/design/U5ke9Li7uZq06u8VM2VMCB/%F0%9F%A6%86-Karolina-Kita-Branding?node-id=0-1) - colour, typography, spacing, radius, shadow and motion variables in Light and Dark mode. The Work page links to it as "Explore the Figma Workspace".

## From Figma to code

1. The variables live in the Figma collection "Kita Branding", with four modes: Light, Dark, and their stronger versions "Light more contrast" and "Dark more contrast", used when a visitor's system asks for more contrast (macOS and iOS "Increase contrast"). The stronger modes copy Light and Dark and point 20 text, link, border, focus and status tokens to darker or lighter palette variables, so reading text reaches 7:1 and borders 3:1. Motion variables (`motion/duration/fast|medium|slow` in milliseconds, `motion/easing/standard` as a CSS easing) have the same value in both modes.
2. They are exported as JSON to `src/styles/kita-branding.tokens.json`.
3. `src/styles/tokens.css` turns each token into a CSS variable, for both modes. Dark mode swaps the variables when `<html>` has the `.dark` class. The more-contrast modes come last, inside `@media (prefers-contrast: more)`, and list only the tokens they change.
4. `src/styles/theme.css` (imported by `app.css`) maps the variables into Tailwind's theme (`bg-bg-canvas`, `text-text-secondary`, `p-md`, `rounded-lg`, `duration-medium ease-standard` ...) and removes Tailwind's default colours, radii, shadows, font sizes and easings, so only tokens can be used. Figma works in px; the code writes spacing, type, layout widths and breakpoints as rem (px / 16, so `spacing/md` 16px is `1rem`). At the browser's default text size the result is the same to the pixel, and visitors who set a larger text size get a page that grows with it.
5. `src/styles/tokens.test.ts` fails when `tokens.css` and the JSON export drift apart (all four modes); `src/styles/contrast.test.ts` checks the more-contrast targets; `src/styles/motion-tokens.test.ts` fails on a raw duration or easing in the code.

## Changing a token

1. Change the variable in Figma first. Semantic tokens (for example `border/interactive/focus`) point to palette variables, so change the alias rather than typing a raw hex value.
2. Re-export `kita-branding.tokens.json`.
3. Update the variable in `tokens.css` in both modes (motion tokens once), and its mapping in `theme.css` if it is new. A new text, border or status token also gets its value in the two more-contrast modes, in Figma and in the `prefers-contrast: more` blocks.
4. Mirror the change in the KitaBranding design system on claude.ai (its `tokens.json`), so design agents see the same values.
5. Run `yarn verify`.

## Components

The Figma Components page maps to `src/shared/ui` (the table is in [architecture.md](architecture.md#component-library-srcsharedui)). Components and variants keep their Figma names: `Button` has the Primary, Secondary, Subtle and Link types, `Callout` the Info and Warning tones of the Figma Banner.

The library is published in Storybook at [karolina.kita.company/storybook](https://karolina.kita.company/storybook/). Its Welcome page explains the design system; every story shows a component with real copy, in Light and Dark mode.

## Link-preview image

The picture LinkedIn, Facebook, Messenger, Slack and X show with a shared link is Karolina's "Portfolio Cover": the frame [Portfolio Cover · Open Graph 1200x630 · Light](https://www.figma.com/design/U5ke9Li7uZq06u8VM2VMCB/%F0%9F%A6%86-Karolina-Kita-Branding?node-id=2742-2910) on the Figma page Portfolio Thumbnails. The site serves it as `public/assets/site/og-cover.png`, named in `og:image` and `twitter:image` in `index.html`.

- **Light only:** a link preview cannot follow the viewer's theme. `og:image` has no colour-scheme variant, and each service fetches one image for everyone. The Dark and Square frames beside it are not used by the site.
- **Changing it:** edit the cover in Figma, export the Light frame as PNG at its export setting (2x, 1200 x 630), compress it without loss (`sharp`: no alpha channel, `compressionLevel: 9`), save it under a new file name (`/assets` is cached for a week), then update `og:image`, `twitter:image` and both alt texts. `src/app/seo/link-preview.test.ts` checks the file and the tags. After the release, refresh the previews ([CONTRIBUTING.md](../CONTRIBUTING.md#5-refresh-what-other-services-cached)).

## Design rules in code

Karolina's rules that a reviewer could miss, kept by the code and its tests:

- **One primary action per screen:** other buttons are secondary, so the page keeps one clear next step.
- **Equal choices look equal:** allow and decline in the consent box are the same secondary button (a story checks it).
- **Link buttons are as big as bordered buttons:** the Button Link type ("View Case Study") has a transparent border and the button padding, so its click area is a Secondary button's box, not only the text.
- **Link rows spaced like buttons:** a row of text links that can wrap gets a bordered button's height per link (`BUTTON_HEIGHT`) and the buttons' row gap, so wrapped rows do not look cramped.
- **Breadcrumbs:** pages outside Work start with Home (house icon, the home page); case studies start with Work, without the icon, which opens the list of case studies. One name for one destination (WCAG 3.2.4).
- **Previous and next at both ends of a case study:** compact "← Previous" and "Next →" at the end of the breadcrumb row (the case name for screen readers), the full links with the case names at the end. At the first and last case the top shows one link: the breadcrumb leads back to Work.
- **Dark label on gold:** a Secondary button's hover and pressed fills and every Subtle fill are gold in the dark theme, so their label is `text-on-accent`; the light label would fall under 4.5:1.
- **States are more than the yellow marker:** the chosen theme also fills its icon, because the yellow marker reads 1.54:1 on white.
- **Version in the footer:** the copyright line ends with the site's version, linked to the release notes.
- **Calm motion:** nothing moves on the first screen at load, nothing loops past 5 seconds, and reduced motion makes every change instant. Elements hidden until focus (the copy-link icons) appear at once, so their focus ring does too.
