/** The pill marked data-pill="<key>" inside the container, if there is one. */
export const pillFor = (container: HTMLElement, key: string | null): HTMLElement | null => {
  if (key === null) return null;
  for (const pill of container.querySelectorAll<HTMLElement>("[data-pill]")) {
    if (pill.dataset.pill === key) return pill;
  }
  return null;
};

export const px = (value: number) => `${value}px`;

/**
 * From the old box to the new pill's own box: translate plus width (height only when it
 * differs), never scale, so the rounded corners keep their radius all the way.
 */
export const travelKeyframes = (from: DOMRect, to: DOMRect): Keyframe[] => {
  const start: Keyframe = {
    transform: `translate(${px(from.left - to.left)}, ${px(from.top - to.top)})`,
    width: px(from.width),
  };
  const end: Keyframe = { transform: "translate(0px, 0px)", width: px(to.width) };
  if (Math.abs(from.height - to.height) >= 0.5) {
    start.height = px(from.height);
    end.height = px(to.height);
  }
  return [start, end];
};
