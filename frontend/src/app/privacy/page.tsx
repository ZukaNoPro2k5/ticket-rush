'use client';

import { InfoPageShell } from '@/components/layout/InfoPageShell';
import { useLocale } from '@/components/providers/LocaleProvider';

export default function PrivacyPage() {
  const { messages } = useLocale();

  return (
    <InfoPageShell
      eyebrow={messages.info.legal}
      title={messages.info.privacyTitle}
      intro={messages.info.privacyIntro}
    >
      <section>
        <h2 className="font-display text-xl font-bold text-stone-900">{messages.info.privacyUsage}</h2>
        <p className="mt-2">{messages.info.privacyUsageText}</p>
      </section>
    </InfoPageShell>
  );
}
