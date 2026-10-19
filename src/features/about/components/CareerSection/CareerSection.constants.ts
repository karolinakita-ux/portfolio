import { MILESTONES } from "#features/about/about.content.ts";

/** The career list shows the latest role first. */
export const MILESTONES_NEWEST_FIRST = [...MILESTONES].reverse();
