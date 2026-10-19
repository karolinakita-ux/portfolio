import type { ReactNode } from "react";

export interface AccordionItemProps {
  /** The question or label on the button (inside an h3). */
  title: ReactNode;
  /** Called when the item opens (not when it closes). */
  onOpen?: () => void;
  children: ReactNode;
}
