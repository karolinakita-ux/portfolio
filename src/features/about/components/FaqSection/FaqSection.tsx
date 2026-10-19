import { FAQ } from "#features/about/about.content.ts";
import { FaqItem } from "#features/about/components/FaqItem/FaqItem.tsx";
import { Section } from "#shared/ui/Section/Section.tsx";

import { styles } from "./FaqSection.styles.ts";

export function FaqSection() {
  return (
    <Section id="faq" title={FAQ.title} description={FAQ.intro}>
      <ul className={styles.list}>
        {FAQ.items.map((item) => (
          <FaqItem key={item.id} item={item} />
        ))}
      </ul>
    </Section>
  );
}
