export interface LightboxHeaderProps {
  index: number;
  count: number;
  title: string;
  titleId: string;
  onClose: () => void;
  /** Shows Go to Description: closes the viewer onto the image's description on the page. */
  onGoToDescription?: () => void;
}
