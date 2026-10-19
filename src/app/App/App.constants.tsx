import type { ReactNode } from "react";

import { AboutView } from "#features/about/index.ts";
import {
  AUTOMOTIVE_CASE,
  CaseStudyView,
  CaseThemingView,
  PROJECT_PLANNING_CASE,
  THEMING_CASE,
} from "#features/case-studies/index.ts";
import { ContactView } from "#features/contact/index.ts";
import { CvView } from "#features/cv/index.ts";
import { WorkView } from "#features/work/index.ts";
import { VIEW } from "#shared/lib/routes/routes.constants.ts";
import type { View } from "#shared/lib/routes/routes.types.ts";

import type { ViewContext } from "./App.types.ts";

/** One entry per view: adding a view to VIEW without a renderer is a type error. */
export const VIEW_RENDERERS: Record<View, (ctx: ViewContext) => ReactNode> = {
  [VIEW.work]: ({ navigate, resolveAsset }) => <WorkView resolveAsset={resolveAsset} onNavigate={navigate} />,
  [VIEW.about]: ({ navigate, portraitSrc }) => <AboutView portraitSrc={portraitSrc} onNavigate={navigate} />,
  [VIEW.contact]: ({ navigate }) => <ContactView onNavigate={navigate} />,
  [VIEW.cv]: ({ navigate }) => <CvView onNavigate={navigate} />,
  [VIEW.caseTheming]: ({ navigate, resolveAsset }) => (
    <CaseThemingView c={THEMING_CASE} resolveAsset={resolveAsset} onNavigate={navigate} />
  ),
  [VIEW.caseProjectPlanning]: ({ navigate, resolveAsset }) => (
    <CaseStudyView c={PROJECT_PLANNING_CASE} resolveAsset={resolveAsset} onNavigate={navigate} />
  ),
  [VIEW.caseAutomotive]: ({ navigate, resolveAsset }) => (
    <CaseStudyView c={AUTOMOTIVE_CASE} resolveAsset={resolveAsset} onNavigate={navigate} />
  ),
};

/** Every case study, for preloading their screenshots in the background. */
export const ALL_CASES = [AUTOMOTIVE_CASE, PROJECT_PLANNING_CASE, THEMING_CASE] as const;
