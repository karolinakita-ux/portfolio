# Design source

The site's look comes from Karolina's KitaBranding design system in Figma.

- Figma file: [Karolina Kita Branding](https://www.figma.com/design/U5ke9Li7uZq06u8VM2VMCB/%F0%9F%A6%86-Karolina-Kita-Branding?node-id=0-1) - colour, typography, spacing, radius, shadow and motion variables in light and dark mode. The Work page links to it as "Figma workspace".

## From Figma to code

1. The variables live in the Figma collection "Kita Branding", with two modes: Light and Dark. Motion variables (`motion/duration/fast|medium|slow` in milliseconds, `motion/easing/standard` as a CSS easing) have the same value in both modes.
2. They are exported as JSON to `src/styles/kita-branding.tokens.json`.
3. `src/styles/tokens.css` turns each token into a CSS variable, for both modes. Dark mode swaps the variables when `<html>` has the `.dark` class.
4. `src/styles/app.css` maps the variables into Tailwind's theme (`bg-bg-canvas`, `text-text-secondary`, `p-md`, `rounded-lg`, `duration-medium ease-standard` ...) and removes Tailwind's default colours, radii, shadows, font sizes and easings, so only tokens can be used.
5. `src/styles/tokens.test.ts` fails when `tokens.css` and the JSON export drift apart; `src/styles/motion-tokens.test.ts` fails on a raw duration or easing in the code.

## Changing a token

1. Change the variable in Figma first. Semantic tokens (for example `border/interactive/focus`) point to palette variables, so change the alias rather than typing a raw hex value.
2. Re-export `kita-branding.tokens.json`.
3. Update the variable in `tokens.css` in both modes (motion tokens once), and its mapping in `app.css` if it is new.
4. Mirror the change in the KitaBranding design system on claude.ai (its `tokens.json`), so design agents see the same values.
5. Run `yarn verify`.
