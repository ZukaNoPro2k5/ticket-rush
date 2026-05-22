'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Users, Clock, ArrowLeft, Ticket, ShieldCheck } from 'lucide-react';
import { ProtectedRoute } from '@/components/providers/ProtectedRoute';
import { Card, Button } from '@/components/ui';
import { enterQueue, getQueueStatus, leaveQueue, type QueueStatus } from '@/lib/api';
import { useLocale } from '@/components/providers/LocaleProvider';

const POLL_INTERVAL_MS = 2500;

function QueueContent() {
  const { formatNumber, messages } = useLocale();
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const eventId = Number(params.id);

  const [status, setStatus] = useState<QueueStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [initialPosition, setInitialPosition] = useState<number | null>(null);
  const enteredRef = useRef(false);

  // Enter queue once on mount
  useEffect(() => {
    if (!eventId || enteredRef.current) return;
    enteredRef.current = true;

    let cancelled = false;
    (async () => {
      try {
        const result = await enterQueue(eventId);
        if (cancelled) return;
        setStatus(result);
        if (result.position > 0) setInitialPosition(result.position);
        if (result.granted) router.replace(`/events/${eventId}/seats`);
      } catch (err) {
        const msg = err instanceof Error ? err.message : messages.queue.enterFailed;
        setError(msg);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [eventId, messages.queue.enterFailed, router]);

  // Poll status
  useEffect(() => {
    if (!eventId || !status || status.granted) return;

    const interval = setInterval(async () => {
      try {
        const next = await getQueueStatus(eventId);
        setStatus(next);
        if (next.granted) {
          clearInterval(interval);
          router.replace(`/events/${eventId}/seats`);
        }
      } catch {
        // swallow transient errors, keep polling
      }
    }, POLL_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [eventId, status, router]);

  const handleLeave = async () => {
    try {
      await leaveQueue(eventId);
    } finally {
      router.push(`/events/${eventId}`);
    }
  };

  if (error) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center bg-stone-50 px-4">
        <Card className="w-full max-w-md border-stone-200 p-8 text-center shadow-soft">
          <p className="mb-4 text-red-600">{error}</p>
          <Button onClick={() => router.back()} variant="secondary">
            <ArrowLeft className="mr-2 h-4 w-4" />
            {messages.queue.back}
          </Button>
        </Card>
      </div>
    );
  }

  if (!status) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center bg-stone-50">
        <div className="animate-pulse text-sm font-medium text-stone-500">{messages.queue.connecting}</div>
      </div>
    );
  }

  const progress = initialPosition && initialPosition > 0
    ? Math.max(0, Math.min(100, ((initialPosition - status.position) / initialPosition) * 100))
    : 0;

  const minutes = Math.floor(status.estimatedWaitSec / 60);
  const seconds = status.estimatedWaitSec % 60;

  return (
    <div className="min-h-[80vh] bg-stone-50 px-4 py-10 md:py-14">
      <div className="mx-auto grid w-full max-w-5xl items-start gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <Card className="border-stone-200 p-6 shadow-soft md:p-8">
          <div className="mb-6 flex items-center gap-4">
            <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-amber-100 text-amber-700">
              <Ticket className="h-7 w-7" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-stone-500">{messages.queue.virtualRoom}</p>
              <h1 className="mt-1 font-display text-2xl font-bold tracking-tight text-stone-900 md:text-3xl">
                {messages.queue.holdingTurn}
              </h1>
            </div>
          </div>

          <p className="max-w-2xl text-sm leading-6 text-stone-600">
            {messages.queue.intro}
          </p>

          <div className="mt-8 rounded-3xl border border-amber-200 bg-amber-50 px-5 py-6 md:px-6">
            <div className="text-xs font-bold uppercase tracking-[0.18em] text-amber-700">{messages.queue.position}</div>
            <div className="mt-2 flex flex-wrap items-end gap-x-4 gap-y-2">
              <motion.div
                key={status.position}
                initial={{ y: 8, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className="font-display text-5xl font-bold tabular-nums tracking-tight text-stone-900 md:text-6xl"
              >
                #{status.position}
              </motion.div>
              <p className="pb-1 text-sm text-stone-600">
                {messages.queue.waitingPeople(formatNumber(status.totalWaiting))}
              </p>
            </div>
          </div>

          {initialPosition && initialPosition > 0 && (
            <div className="mt-6">
              <div className="mb-2 flex justify-between text-sm text-stone-600">
                <span>{messages.queue.progress}</span>
                <span className="font-semibold text-stone-900">{Math.round(progress)}%</span>
              </div>
              <div className="h-2.5 overflow-hidden rounded-full bg-stone-200">
                <motion.div
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                  className="h-full rounded-full bg-amber-500"
                />
              </div>
            </div>
          )}

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-stone-200 bg-white p-4">
              <div className="flex items-center gap-2 text-sm text-stone-500">
                <Users className="h-4 w-4 text-amber-600" />
                {messages.queue.ahead}
              </div>
              <div className="mt-2 text-2xl font-bold tabular-nums text-stone-900">
                {formatNumber(status.ahead)}
              </div>
            </div>
            <div className="rounded-2xl border border-stone-200 bg-white p-4">
              <div className="flex items-center gap-2 text-sm text-stone-500">
                <Clock className="h-4 w-4 text-amber-600" />
                {messages.queue.estimate}
              </div>
              <div className="mt-2 text-2xl font-bold tabular-nums text-stone-900">
                {minutes > 0 ? `${minutes}${messages.queue.minuteSuffix} ` : ''}{seconds}s
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-3 border-t border-stone-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs leading-5 text-stone-500">
              {messages.queue.dontReload}
            </p>
            <Button onClick={handleLeave} variant="ghost" className="justify-center text-stone-500 hover:text-red-600">
              {messages.queue.leave}
            </Button>
          </div>
        </Card>

        <aside className="space-y-4">
          <Card className="border-stone-200 p-5 shadow-soft">
            <div className="flex items-start gap-3">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-emerald-50 text-emerald-700">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-semibold text-stone-900">{messages.queue.keptAutomatically}</h2>
                <p className="mt-1 text-sm leading-6 text-stone-600">
                  {messages.queue.keptAutomaticallyDesc}
                </p>
              </div>
            </div>
          </Card>

          <Card className="border-stone-200 p-5 shadow-soft">
            <h2 className="font-semibold text-stone-900">{messages.queue.whenTurn}</h2>
            <ol className="mt-3 space-y-3 text-sm text-stone-600">
              <li className="flex gap-3">
                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-stone-100 text-xs font-bold text-stone-700">1</span>
                {messages.queue.stepMap}
              </li>
              <li className="flex gap-3">
                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-stone-100 text-xs font-bold text-stone-700">2</span>
                {messages.queue.stepSelect}
              </li>
              <li className="flex gap-3">
                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-stone-100 text-xs font-bold text-stone-700">3</span>
                {messages.queue.stepConfirm}
              </li>
            </ol>
          </Card>
        </aside>
      </div>
    </div>
  );
}

export default function QueuePage() {
  return (
    <ProtectedRoute>
      <QueueContent />
    </ProtectedRoute>
  );
}
