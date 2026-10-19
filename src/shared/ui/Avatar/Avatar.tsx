import { styles } from "./Avatar.styles.ts";
import type { AvatarProps } from "./Avatar.types.ts";

/** Figma: Avatar. Initials on the avatar glow (people without a photo). Decorative: the name is next to it. */
export function Avatar({ initials }: AvatarProps) {
  return (
    <span aria-hidden="true" className={styles.root}>
      {initials}
    </span>
  );
}
