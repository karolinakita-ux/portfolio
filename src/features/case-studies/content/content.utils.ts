import type { ShowcaseCard } from "#features/case-studies/case-studies.types.ts";

/**
 * Screenshot cards of one case, from its folder public/assets/cases/<folder>/. A card's id is its image's base
 * name: it keys the card and is the `image` value of the image-open, image-nav and image-zoom statistics events.
 */
export function caseShots(folder: string) {
  const path = "cases/" + folder + "/";
  return {
    /** A screen with a Light and a Dark file, `<name>-light.webp` and `<name>-dark.webp`: it follows the theme. */
    shot: (name: string): Pick<ShowcaseCard, "id" | "asset" | "darkAsset"> => ({
      id: name,
      asset: path + name + "-light.webp",
      darkAsset: path + name + "-dark.webp",
    }),
    /** A screen in one version, `<name>.webp`, shown as it is in both themes. */
    singleShot: (name: string): Pick<ShowcaseCard, "id" | "asset"> => ({ id: name, asset: path + name + ".webp" }),
  };
}
