import { useState } from "react";

import { useScrolledPast } from "#shared/hooks/scrolled-past/useScrolledPast.ts";
import { ArrowUp } from "#shared/ui/icons/icons.tsx";

import { styles } from "./BackToTop.styles.ts";
import type { BackToTopProps } from "./BackToTop.types.ts";

/**
 * Floating "back to top" button, shown after the visitor scrolls down.
 * It stays shown while it has focus (e.g. after Home scrolls the page up), so keyboard focus never sits on a hidden button.
 */
export function BackToTop({ onActivate }: BackToTopProps) {
  const scrolledPast = useScrolledPast(640);
  const [focused, setFocused] = useState(false);
  const visible = scrolledPast || focused;

  return (
    <button
      type="button"
      aria-label="Back to top"
      title="Back to top"
      tabIndex={visible ? 0 : -1}
      aria-hidden={!visible}
      onClick={onActivate}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={{ marginBottom: "env(safe-area-inset-bottom, 0px)" }}
      className={styles.root(visible)}
    >
      <ArrowUp aria-hidden="true" size={20} />
    </button>
  );
}
