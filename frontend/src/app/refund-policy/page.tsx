'use client';

import { InfoPageShell } from '@/components/layout/InfoPageShell';
import { useLocale } from '@/components/providers/LocaleProvider';

export default function RefundPolicyPage() {
  const { messages } = useLocale();

  return (
    <InfoPageShell
      eyebrow={messages.info.support}
      title={messages.info.refundTitle}
      intro={messages.info.refundIntro}
    >
      <section>
        <h2 className="font-display text-xl font-bold text-stone-900">{messages.info.refundNow}</h2>
        <p className="mt-2">{messages.info.refundNowText}</p>
      </section>
      <section>
        <h2 className="font-display text-xl font-bold text-stone-900">{messages.info.refundLater}</h2>
        <p className="mt-2">{messages.info.refundLaterText}</p>
      </section>
    </InfoPageShell>
  );
}
