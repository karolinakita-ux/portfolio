import { styles } from "./IconButton.styles.ts";
import type { IconButtonProps } from "./IconButton.types.ts";

/** Square icon-only button on a raised surface (image viewer controls); a 40px touch target on touch screens. */
export function IconButton({ label, icon: Icon, className, ...props }: IconButtonProps) {
  return (
    <button type="button" aria-label={label} title={label} className={styles.root(className)} {...props}>
      <Icon aria-hidden="true" size={20} />
    </button>
  );
}
