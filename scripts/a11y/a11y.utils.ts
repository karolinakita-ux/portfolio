/** `text` cut to `max` characters, with an ellipsis. */
export const clip = (text: string, max: number): string => (text.length > max ? text.slice(0, max) + "…" : text);
