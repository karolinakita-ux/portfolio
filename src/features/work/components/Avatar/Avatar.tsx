import { styles } from "./Avatar.styles.ts";
import type { AvatarProps } from "./Avatar.types.ts";

/** Initials on the avatar glow (the recommendations have no photos). */
export function Avatar({ initials }: AvatarProps) {
  return (
    <span aria-hidden="true" className={styles.root}>
      {initials}
    </span>
  );
}
