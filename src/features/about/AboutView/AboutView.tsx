import { AboutHero } from "#features/about/components/AboutHero/AboutHero.tsx";
import { CareerSection } from "#features/about/components/CareerSection/CareerSection.tsx";
import { FaqSection } from "#features/about/components/FaqSection/FaqSection.tsx";
import { PhilosophySection } from "#features/about/components/PhilosophySection/PhilosophySection.tsx";

import type { AboutViewProps } from "./AboutView.types.ts";

/** About: intro → working principles with the portrait → career → FAQ. */
export function AboutView({ portraitSrc, onNavigate }: AboutViewProps) {
  return (
    <>
      <AboutHero onNavigate={onNavigate} />
      <PhilosophySection portraitSrc={portraitSrc} />
      <CareerSection onNavigate={onNavigate} />
      <FaqSection />
    </>
  );
}
