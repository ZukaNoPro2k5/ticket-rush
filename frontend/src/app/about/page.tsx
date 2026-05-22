'use client';

import { InfoPageShell } from '@/components/layout/InfoPageShell';
import { useLocale } from '@/components/providers/LocaleProvider';

export default function AboutPage() {
  const { messages } = useLocale();

  return (
    <InfoPageShell
      eyebrow="TicketRush"
      title={messages.info.aboutTitle}
      intro={messages.info.aboutIntro}
    >
      <section>
        <h2 className="font-display text-xl font-bold text-stone-900">{messages.info.aboutPriority}</h2>
        <p className="mt-2">{messages.info.aboutPriorityText}</p>
      </section>
    </InfoPageShell>
  );
}
