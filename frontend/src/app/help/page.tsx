'use client';

import { InfoPageShell } from '@/components/layout/InfoPageShell';
import { useLocale } from '@/components/providers/LocaleProvider';

export default function HelpPage() {
  const { messages } = useLocale();

  return (
    <InfoPageShell
      eyebrow={messages.info.support}
      title={messages.info.helpTitle}
      intro={messages.info.helpIntro}
    >
      <section id="buying">
        <h2 className="font-display text-xl font-bold text-stone-900">{messages.info.buying}</h2>
        <p className="mt-2">{messages.info.buyingText}</p>
      </section>
      <section>
        <h2 className="font-display text-xl font-bold text-stone-900">{messages.info.vanishedSeat}</h2>
        <p className="mt-2">{messages.info.vanishedSeatText}</p>
      </section>
    </InfoPageShell>
  );
}
