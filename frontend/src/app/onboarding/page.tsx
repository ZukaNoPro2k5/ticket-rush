'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ArrowRight, Check, Loader2, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { CATEGORIES, type CategoryKey } from '@/data/uiConfig';
import api from '@/lib/api/client';
import { EASE_OUT_EXPO } from '@/lib/motion';

const CITY_OPTIONS = [
  { key: 'hanoi',   label: 'Hà Nội' },
  { key: 'hcm',     label: 'TP. HCM' },
  { key: 'danang',  label: 'Đà Nẵng' },
  { key: 'haiphong', label: 'Hải Phòng' },
  { key: 'hue',     label: 'Huế' },
  { key: 'other',   label: 'Khác / Đi xa' },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [interests, setInterests] = useState<Set<CategoryKey>>(new Set());
  const [city, setCity] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const toggleInterest = (k: CategoryKey) => {
    setInterests((prev) => {
      const n = new Set(prev);
      if (n.has(k)) n.delete(k); else n.add(k);
      return n;
    });
  };

  const goStep2 = () => {
    if (interests.size < 1) { toast.error('Hãy chọn ít nhất 1 danh mục'); return; }
    setStep(2);
  };

  const skip = async () => {
    router.push('/');
  };

  const finish = async () => {
    if (!city) { toast.error('Hãy chọn thành phố của bạn'); return; }
    setSubmitting(true);
    try {
      const preferredCity = CITY_OPTIONS.find((item) => item.key === city)?.label ?? city;
      await api.post('/users/preferences', {
        categories: Array.from(interests),
        preferred_city: preferredCity,
      });
      toast.success('Sở thích đã lưu. Chúc bạn săn vé vui!');
      router.push('/');
      router.refresh();
    } catch {
      toast.error('Chưa lưu được sở thích. Thử lại giúp mình nhé.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title={step === 1 ? 'Bạn thích sự kiện gì?' : 'Bạn đang ở đâu?'}
      subtitle={
        step === 1
          ? 'Chọn các danh mục bạn quan tâm để chúng tôi đề xuất sự kiện hợp gu hơn. Có thể đổi bất cứ lúc nào.'
          : 'Chọn thành phố để gợi ý sự kiện gần bạn nhất. Bạn có thể đổi sau trong phần Tài khoản.'
      }
    >
      {/* Progress */}
      <div className="mb-6 flex items-center gap-3">
        <div className="flex flex-1 items-center gap-2">
          <span className={`grid h-7 w-7 place-items-center rounded-full text-xs font-bold transition-colors ${step >= 1 ? 'bg-amber-500 text-white' : 'bg-stone-200 text-stone-500'}`}>
            {step > 1 ? <Check className="h-3.5 w-3.5" /> : '1'}
          </span>
          <span className={`text-sm font-medium ${step === 1 ? 'text-stone-900' : 'text-stone-500'}`}>Sở thích</span>
        </div>
        <div className={`h-px flex-1 ${step >= 2 ? 'bg-amber-500' : 'bg-stone-200'}`} />
        <div className="flex flex-1 items-center justify-end gap-2">
          <span className={`text-sm font-medium ${step === 2 ? 'text-stone-900' : 'text-stone-500'}`}>Khu vực</span>
          <span className={`grid h-7 w-7 place-items-center rounded-full text-xs font-bold transition-colors ${step >= 2 ? 'bg-amber-500 text-white' : 'bg-stone-200 text-stone-500'}`}>2</span>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {step === 1 ? (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
            transition={{ duration: 0.3, ease: EASE_OUT_EXPO }}
          >
            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
              {CATEGORIES.map((c) => {
                const active = interests.has(c.key);
                return (
                  <button
                    key={c.key}
                    onClick={() => toggleInterest(c.key)}
                    aria-pressed={active}
                    className={`group relative flex aspect-square flex-col items-center justify-center gap-2 rounded-2xl border-2 p-3 text-center transition-all
                      ${active
                        ? 'border-amber-500 bg-amber-50 shadow-soft'
                        : 'border-stone-200 bg-white hover:-translate-y-0.5 hover:border-stone-300 hover:shadow-soft'}`}
                  >
                    <span className={`grid h-12 w-12 place-items-center rounded-xl transition-colors
                      ${active ? 'bg-amber-500 text-white' : 'bg-stone-100 text-stone-600 group-hover:bg-stone-200'}`}>
                      <i className={`${c.icon} text-lg`} aria-hidden />
                    </span>
                    <span className={`text-xs font-semibold ${active ? 'text-amber-900' : 'text-stone-700'}`}>{c.label}</span>
                    {active && (
                      <span className="absolute right-2 top-2 grid h-5 w-5 place-items-center rounded-full bg-amber-500 text-white">
                        <Check className="h-3 w-3" strokeWidth={3} />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            <p className="mt-4 flex items-center gap-1.5 text-xs text-stone-500">
              <Sparkles className="h-3.5 w-3.5 text-amber-500" />
              Đã chọn <span className="font-semibold text-stone-700">{interests.size}</span> / {CATEGORIES.length} — khuyến nghị 2-4 mục.
            </p>

            <div className="mt-8 flex items-center gap-3">
              <button onClick={skip} className="text-sm font-medium text-stone-500 hover:text-stone-800">Bỏ qua</button>
              <button
                onClick={goStep2}
                disabled={interests.size < 1}
                className="ml-auto inline-flex h-12 items-center gap-2 rounded-xl bg-amber-500 px-6 text-sm font-semibold text-white shadow-soft transition-all hover:-translate-y-0.5 hover:bg-amber-600 hover:shadow-lift disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
              >
                Tiếp tục <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
            transition={{ duration: 0.3, ease: EASE_OUT_EXPO }}
          >
            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
              {CITY_OPTIONS.map((opt) => {
                const active = city === opt.key;
                return (
                  <button
                    key={opt.key}
                    onClick={() => setCity(opt.key)}
                    aria-pressed={active}
                    className={`group flex flex-col items-center justify-center gap-2 rounded-2xl border-2 px-3 py-5 text-center transition-all
                      ${active
                        ? 'border-amber-500 bg-amber-50 shadow-soft'
                        : 'border-stone-200 bg-white hover:-translate-y-0.5 hover:border-stone-300 hover:shadow-soft'}`}
                  >
                    <MapPin className={`h-6 w-6 ${active ? 'text-amber-600' : 'text-stone-500'}`} />
                    <span className={`text-sm font-semibold ${active ? 'text-amber-900' : 'text-stone-700'}`}>{opt.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="mt-8 flex items-center gap-3">
              <button onClick={() => setStep(1)} className="text-sm font-medium text-stone-500 hover:text-stone-800">← Quay lại</button>
              <button
                onClick={finish}
                disabled={!city || submitting}
                className="ml-auto inline-flex h-12 items-center gap-2 rounded-xl bg-amber-500 px-6 text-sm font-semibold text-white shadow-soft transition-all hover:-translate-y-0.5 hover:bg-amber-600 hover:shadow-lift disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
              >
                {submitting ? <><Loader2 className="h-4 w-4 animate-spin" /> Đang lưu…</> : <>Hoàn tất <Check className="h-4 w-4" /></>}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </AuthLayout>
  );
}
