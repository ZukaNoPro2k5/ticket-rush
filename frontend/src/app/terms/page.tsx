'use client';

import { InfoPageShell } from '@/components/layout/InfoPageShell';
import { useLocale } from '@/components/providers/LocaleProvider';

export default function TermsPage() {
  const { messages } = useLocale();

  return (
    <InfoPageShell
      eyebrow={messages.info.legal}
      title={messages.info.termsTitle}
      intro={messages.info.termsIntro}
    >
      <section>
        <h2 className="font-display text-xl font-bold text-stone-900">{messages.info.termsAccount}</h2>
        <p className="mt-2">{messages.info.termsAccountText}</p>
      </section>
      <section>
        <h2 className="font-display text-xl font-bold text-stone-900">{messages.info.termsContent}</h2>
        <p className="mt-2">{messages.info.termsContentText}</p>
      </section>
    </InfoPageShell>
  );
}
