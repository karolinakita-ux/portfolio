import { clsx } from "clsx";

export const styles = {
  root: (className?: string) => clsx("text-label-md text-text-secondary uppercase", className),
  /** Every part after the first opens with the bullet (bullet-before in utilities.css). */
  part: (joined: boolean) => clsx({ "bullet-before": joined }),
};
