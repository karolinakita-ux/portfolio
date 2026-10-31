import type { ShowcaseCard } from "#features/case-studies/case-studies.types.ts";

/**
 * Screenshot cards of one case, from its folder public/assets/cases/<folder>/. A card's id is its image's base
 * name: it keys the card and is the `image` value of the image-open, image-nav and image-zoom statistics events.
 */
export function caseShots(folder: string) {
  const path = "cases/" + folder + "/";
  return {
    /**
     * A screen with a Light and a Dark file, `<name>-light.webp` and `<name>-dark.webp`: it follows the theme.
     * A changed screen gets new file names, because /assets is cached for a week: with `fileVersion` 2 they are
     * `<name>-v2-light.webp` and `<name>-v2-dark.webp`, and the card id stays `<name>`, so the statistics keep
     * counting the same screen.
     */
    shot: (name: string, fileVersion?: number): Pick<ShowcaseCard, "id" | "asset" | "darkAsset"> => {
      const file = path + name + (fileVersion === undefined ? "" : "-v" + String(fileVersion));
      return { id: name, asset: file + "-light.webp", darkAsset: file + "-dark.webp" };
    },
    /** A screen in one version, `<name>.webp`, shown as it is in both themes. */
    singleShot: (name: string): Pick<ShowcaseCard, "id" | "asset"> => ({ id: name, asset: path + name + ".webp" }),
  };
}
