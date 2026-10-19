import type { RefObject } from "react";

export interface LightboxHeaderProps {
  index: number;
  count: number;
  title: string;
  titleId: string;
  closeRef: RefObject<HTMLButtonElement | null>;
  onClose: () => void;
}
