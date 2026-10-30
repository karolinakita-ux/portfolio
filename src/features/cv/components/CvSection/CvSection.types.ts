import type { ReactNode } from "react";

import type { CvSectionId } from "#features/cv/cv.types.ts";

export interface CvSectionProps {
  id: CvSectionId;
  title: string;
  children: ReactNode;
}
