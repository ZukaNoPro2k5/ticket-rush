'use client';

import { useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, Eye, EyeOff, Lock, Mail, User as UserIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/api/client';
import { useAuthStore } from '@/stores/authStore';
import { extractApiError, isValidEmail } from './authUtils';
import {
  AuthDivider, FieldError, FormError, SubmitBtn, fieldClass,
} from './AuthFormAtoms';
import { OAuthButtons } from './OAuthButtons';
import { PasswordStrength } from './PasswordStrength';
import { useLocale } from '@/components/providers/LocaleProvider';

interface RegisterResponse {
  success: boolean;
  data: {
    token: string;
    user: { id: number; email: string; full_name: string; role: string };
    maintenance_mode: boolean;
  };
}

interface Props {
  onSuccess: (result?: RegisterResponse['data']) => void;
}

export function RegisterForm({ onSuccess }: Props) {
  const { setAuth } = useAuthStore();
  const { messages } = useLocale();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [agreed, setAgreed] = useState(false);

  const [showPw, setShowPw] = useState(false);
  const [pwTouched, setPwTouched] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [succeeded, setSucceeded]   = useState(false);
  const [formError, setFormError]   = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [shakeKey, setShakeKey]     = useState(0);

  const clearFieldError = (key: string) =>
    setFieldErrors((f) => { const n = { ...f }; delete n[key]; return n; });

  const validate = (): Record<string, string> => {
    const errs: Record<string, string> = {};
    if (!name.trim() || name.trim().length < 2) errs.name = messages.auth.fullNameShort;
    if (!email) errs.email = messages.auth.emailRequired;
    else if (!isValidEmail(email)) errs.email = messages.auth.emailInvalid;
    if (!password) errs.password = messages.auth.passwordRequired;
    else if (password.length < 8) errs.password = messages.auth.passwordMin;
    else if (!/[A-Z]/.test(password)) errs.password = messages.auth.passwordUpper;
    else if (!/[0-9]/.test(password)) errs.password = messages.auth.passwordNumber;
    if (!confirm) errs.confirm = messages.auth.confirmRequired;
    else if (confirm !== password) errs.confirm = messages.auth.passwordMismatch;
    if (!agreed) errs.agree = messages.auth.agreeRequired;
    return errs;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setFieldErrors(errs);
      setFormError(messages.auth.checkInfo);
      setShakeKey((k) => k + 1);
      return;
    }
    setFieldErrors({});
    setFormError(null);
    setSubmitting(true);
    try {
      const { data } = await api.post<RegisterResponse>('/auth/register', {
        full_name: name.trim(),
        email,
        password,
      });
      setAuth(data.data.token, {
        id: data.data.user.id,
        email: data.data.user.email,
        full_name: data.data.user.full_name,
        role: data.data.user.role as 'customer' | 'admin',
      });
      setSucceeded(true);
      toast.success(messages.auth.success);
      onSuccess(data.data);
    } catch (err) {
      setFormError(extractApiError(err, messages.auth.createAccountFailed));
      setShakeKey((k) => k + 1);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <OAuthButtons mode="register" onSuccess={onSuccess} />

      <AuthDivider label={messages.auth.orRegisterEmail} />

      <motion.form
        key={shakeKey}
        onSubmit={handleSubmit}
        noValidate
        className="space-y-3"
        animate={shakeKey > 0 ? { x: [0, -5, 5, -3, 3, 0] } : {}}
        transition={{ duration: 0.35, ease: 'easeInOut' }}
      >
        <FormError message={formError} />

        {/* Full name */}
        <div>
          <div className="relative">
            <UserIcon className={`pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 transition-colors ${name ? 'text-amber-500' : 'text-stone-400'}`} />
            <input
              type="text"
              autoComplete="name"
              placeholder={messages.auth.fullName}
              value={name}
              onChange={(e) => { setName(e.target.value); clearFieldError('name'); }}
              className={`${fieldClass(!!fieldErrors.name)} pl-10 pr-4`}
            />
          </div>
          <FieldError msg={fieldErrors.name} />
        </div>

        {/* Email */}
        <div>
          <div className="relative">
            <Mail className={`pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 transition-colors ${email ? 'text-amber-500' : 'text-stone-400'}`} />
            <input
              type="email"
              autoComplete="email"
              placeholder="Email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); clearFieldError('email'); }}
              className={`${fieldClass(!!fieldErrors.email)} pl-10 pr-4`}
            />
          </div>
          <FieldError msg={fieldErrors.email} />
        </div>

        {/* Password */}
        <div>
          <div className="relative">
            <Lock className={`pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 transition-colors ${password ? 'text-amber-500' : 'text-stone-400'}`} />
            <input
              type={showPw ? 'text' : 'password'}
              autoComplete="new-password"
              placeholder={messages.auth.password}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setPwTouched(true);
                clearFieldError('password');
              }}
              className={`${fieldClass(!!fieldErrors.password)} pl-10 pr-12`}
            />
            <button
              type="button"
              onClick={() => setShowPw((v) => !v)}
              aria-label={showPw ? messages.auth.hidePassword : messages.auth.showPassword}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 transition-colors hover:text-stone-600"
            >
              {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          <PasswordStrength password={password} visible={pwTouched} />
          <FieldError msg={fieldErrors.password} />
        </div>

        {/* Confirm */}
        <div>
          <div className="relative">
            <Lock className={`pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 transition-colors ${confirm && confirm === password ? 'text-emerald-500' : confirm ? 'text-rose-400' : 'text-stone-400'}`} />
            <input
              type={showPw ? 'text' : 'password'}
              autoComplete="new-password"
              placeholder={messages.auth.confirmPassword}
              value={confirm}
              onChange={(e) => { setConfirm(e.target.value); clearFieldError('confirm'); }}
              className={`${fieldClass(!!(fieldErrors.confirm || (confirm && confirm !== password)))} pl-10 pr-10`}
            />
            <AnimatePresence>
              {confirm && confirm === password && (
                <motion.span
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2"
                >
                  <Check className="h-4 w-4 text-emerald-600" />
                </motion.span>
              )}
            </AnimatePresence>
          </div>
          <FieldError msg={fieldErrors.confirm} />
        </div>

        {/* Terms */}
        <label className={`flex cursor-pointer items-start gap-2.5 rounded-xl px-2 py-2 transition-colors hover:bg-stone-50 ${fieldErrors.agree ? 'text-rose-700' : 'text-stone-600'}`}>
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => { setAgreed(e.target.checked); clearFieldError('agree'); }}
            className="mt-0.5 h-4 w-4 flex-shrink-0 cursor-pointer rounded accent-amber-500"
          />
          <span className="text-xs leading-relaxed">
            {messages.auth.agreePrefix}{' '}
            <Link href="/terms" className="font-semibold text-amber-700 hover:underline">{messages.auth.terms}</Link>
            {' '}{messages.auth.and}{' '}
            <Link href="/privacy" className="font-semibold text-amber-700 hover:underline">{messages.auth.privacy}</Link>
            {fieldErrors.agree && <span className="ml-1 text-[11px] text-rose-500">: {fieldErrors.agree}</span>}
          </span>
        </label>

        <SubmitBtn submitting={submitting} succeeded={succeeded} label={messages.auth.createAccount} />
      </motion.form>
    </div>
  );
}
