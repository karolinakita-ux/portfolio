import { EVENT } from "#shared/lib/analytics/analytics.constants.ts";
import { track } from "#shared/lib/analytics/analytics.utils.ts";
import { BannerLink } from "#shared/ui/BannerLink/BannerLink.tsx";
import { Figma } from "#shared/ui/icons/icons.tsx";

import type { DesignFileLinkProps } from "./DesignFileLink.types.ts";

/**
 * "Open the Figma file" link (new tab) to a case study's design file: in the case intro under the details panel
 * and in the design files banner at the end. Counted as figma-click with its place.
 */
export function DesignFileLink({ file, caseView, place }: DesignFileLinkProps) {
  return (
    <BannerLink href={file.url} icon={Figma} onClick={() => track(EVENT.figmaClick, { place, case: caseView })}>
      {file.linkLabel}
    </BannerLink>
  );
}
