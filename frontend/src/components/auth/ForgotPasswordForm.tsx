'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Mail } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/api/client';
import { isValidEmail } from './authUtils';
import { FieldError, FormError, SubmitBtn, fieldClass } from './AuthFormAtoms';
import { useLocale } from '@/components/providers/LocaleProvider';

export function ForgotPasswordForm({
  onBack,
}: {
  onBack: () => void;
}) {
  const { messages } = useLocale();
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldError, setFieldError] = useState<string>();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setFieldError(messages.auth.emailRequired);
      return;
    }
    if (!isValidEmail(email)) {
      setFieldError(messages.auth.emailInvalid);
      return;
    }
    setSubmitting(true);
    setFieldError(undefined);
    setFormError(null);
    try {
      await api.post('/auth/forgot-password', { email });
      setSent(true);
      toast.success(messages.auth.resetSent);
    } catch {
      setFormError(messages.auth.resetSendFailed);
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    if (!sent) return;
    const timer = window.setTimeout(onBack, 900);
    return () => window.clearTimeout(timer);
  }, [sent, onBack]);

  return (
    <div>
      <p className="mb-5 text-sm leading-relaxed text-stone-500">
        {messages.auth.forgotHint}
      </p>

      <motion.form onSubmit={handleSubmit} noValidate className="space-y-3.5">
        <FormError message={formError} />
        <div>
          <div className="relative">
            <Mail className={`pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 transition-colors ${email ? 'text-amber-500' : 'text-stone-400'}`} />
            <input
              type="email"
              autoComplete="email"
              placeholder="Email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setFieldError(undefined);
              }}
              className={`${fieldClass(!!fieldError)} pl-10 pr-4`}
            />
          </div>
          <FieldError msg={fieldError} />
        </div>

        <SubmitBtn
          submitting={submitting}
          succeeded={sent}
          label={sent ? messages.auth.sentGuide : messages.auth.sendLink}
        />
      </motion.form>

      <button
        type="button"
        onClick={onBack}
        className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-amber-700 transition-colors hover:text-amber-800"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        {sent ? messages.auth.backToLogin : messages.auth.rememberedPassword}
      </button>
    </div>
  );
}
