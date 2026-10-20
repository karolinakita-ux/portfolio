# Design source

The site's look comes from Karolina's KitaBranding design system in Figma.

- Figma file: [Karolina Kita Branding](https://www.figma.com/design/U5ke9Li7uZq06u8VM2VMCB/%F0%9F%A6%86-Karolina-Kita-Branding?node-id=0-1) - colour, typography, spacing, radius, shadow and motion variables in light and dark mode. The Work page links to it as "Figma workspace".

## From Figma to code

1. The variables live in the Figma collection "Kita Branding", with two modes: Light and Dark. Motion variables (`motion/duration/fast|medium|slow` in milliseconds, `motion/easing/standard` as a CSS easing) have the same value in both modes.
2. They are exported as JSON to `src/styles/kita-branding.tokens.json`.
3. `src/styles/tokens.css` turns each token into a CSS variable, for both modes. Dark mode swaps the variables when `<html>` has the `.dark` class.
4. `src/styles/theme.css` (imported by `app.css`) maps the variables into Tailwind's theme (`bg-bg-canvas`, `text-text-secondary`, `p-md`, `rounded-lg`, `duration-medium ease-standard` ...) and removes Tailwind's default colours, radii, shadows, font sizes and easings, so only tokens can be used.
5. `src/styles/tokens.test.ts` fails when `tokens.css` and the JSON export drift apart; `src/styles/motion-tokens.test.ts` fails on a raw duration or easing in the code.

## Changing a token

1. Change the variable in Figma first. Semantic tokens (for example `border/interactive/focus`) point to palette variables, so change the alias rather than typing a raw hex value.
2. Re-export `kita-branding.tokens.json`.
3. Update the variable in `tokens.css` in both modes (motion tokens once), and its mapping in `theme.css` if it is new.
4. Mirror the change in the KitaBranding design system on claude.ai (its `tokens.json`), so design agents see the same values.
5. Run `yarn verify`.

## Components

The Figma Components page maps to `src/shared/ui` (the table is in [architecture.md](architecture.md#component-library-srcsharedui)). Components and variants keep their Figma names: `Button` has the Primary, Secondary, Subtle and Link types, `Callout` the Info and Warning tones of the Figma Banner.

The library is published in Storybook at [karolina.kita.company/storybook](https://karolina.kita.company/storybook/). Its Welcome page explains the design system; every story shows a component with real copy, in light and dark.

## Design rules in code

Karolina's rules that a reviewer could miss, kept by the code and its tests:

- **One primary action per screen:** other buttons are secondary, so the page keeps one clear next step.
- **Equal choices look equal:** allow and decline in the consent box are the same secondary button (a story checks it).
- **Link buttons are as big as bordered buttons:** the Button Link type ("View Case Study") has a transparent border and the button padding, so its click area is a Secondary button's box, not only the text.
- **Link rows spaced like buttons:** a row of text links that can wrap gets a bordered button's height per link (`BUTTON_HEIGHT`) and the buttons' row gap, so wrapped rows do not look cramped.
- **Breadcrumbs:** pages outside Work start with Home, case studies with Work.
- **Calm motion:** nothing moves on the first screen at load, nothing loops past 5 seconds, and reduced motion makes every change instant.
