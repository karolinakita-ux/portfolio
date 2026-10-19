import { FAQ } from "#features/about/about.content.ts";
import { FaqItem } from "#features/about/components/FaqItem/FaqItem.tsx";
import { Accordion } from "#shared/ui/Accordion/Accordion.tsx";
import { Section } from "#shared/ui/Section/Section.tsx";

export function FaqSection() {
  return (
    <Section id="faq" title={FAQ.title} description={FAQ.intro}>
      <Accordion>
        {FAQ.items.map((item) => (
          <FaqItem key={item.id} item={item} />
        ))}
      </Accordion>
    </Section>
  );
}
