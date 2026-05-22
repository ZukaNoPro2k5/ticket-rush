'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Lock, Mail } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/api/client';
import { useAuthStore } from '@/stores/authStore';
import { extractApiError, isValidEmail } from './authUtils';
import {
  FieldError, FormError, SubmitBtn, fieldClass, AuthDivider,
} from './AuthFormAtoms';
import { OAuthButtons } from './OAuthButtons';
import { useLocale } from '@/components/providers/LocaleProvider';

interface LoginResponse {
  success: boolean;
  data: {
    token: string;
    user: { id: number; email: string; full_name: string; role: string };
    maintenance_mode: boolean;
  };
}

interface Props {
  onSuccess: (result?: LoginResponse['data']) => void;
  onForgotPassword?: () => void;
}

export function LoginForm({ onSuccess, onForgotPassword }: Props) {
  const { setAuth } = useAuthStore();
  const { messages } = useLocale();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [succeeded, setSucceeded]   = useState(false);
  const [formError, setFormError]   = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [shakeKey, setShakeKey]     = useState(0);

  const clearFieldError = (key: string) =>
    setFieldErrors((f) => { const n = { ...f }; delete n[key]; return n; });

  const validate = (): Record<string, string> => {
    const errs: Record<string, string> = {};
    if (!email) errs.email = messages.auth.emailRequired;
    else if (!isValidEmail(email)) errs.email = messages.auth.emailInvalid;
    if (!password) errs.password = messages.auth.passwordRequired;
    return errs;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setFieldErrors(errs);
      setShakeKey((k) => k + 1);
      return;
    }
    setFieldErrors({});
    setFormError(null);
    setSubmitting(true);
    try {
      const { data } = await api.post<LoginResponse>('/auth/login', { email, password });
      setAuth(data.data.token, {
        id: data.data.user.id,
        email: data.data.user.email,
        full_name: data.data.user.full_name,
        role: data.data.user.role as 'customer' | 'admin',
      });
      setSucceeded(true);
      toast.success(`${messages.auth.welcomeBack}, ${data.data.user.full_name.split(' ').pop()}!`);
      onSuccess(data.data);
    } catch (err) {
      setFormError(extractApiError(err, messages.auth.invalidCredentials));
      setShakeKey((k) => k + 1);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <OAuthButtons mode="login" onSuccess={onSuccess} />

      <AuthDivider label={messages.auth.orLoginEmail} />

      <motion.form
        key={shakeKey}
        onSubmit={handleSubmit}
        noValidate
        className="space-y-3.5"
        animate={shakeKey > 0 ? { x: [0, -5, 5, -3, 3, 0] } : {}}
        transition={{ duration: 0.35, ease: 'easeInOut' }}
      >
        <FormError message={formError} />

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

        <div>
          <div className="relative">
            <Lock className={`pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 transition-colors ${password ? 'text-amber-500' : 'text-stone-400'}`} />
            <input
              type={showPw ? 'text' : 'password'}
              autoComplete="current-password"
              placeholder={messages.auth.password}
              value={password}
              onChange={(e) => { setPassword(e.target.value); clearFieldError('password'); }}
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
          <FieldError msg={fieldErrors.password} />
        </div>

        <div className="flex justify-end">
          <button
            type="button"
            onClick={onForgotPassword}
            className="text-xs font-medium text-amber-700 hover:text-amber-800"
          >
            {messages.auth.forgotPassword}?
          </button>
        </div>

        <SubmitBtn submitting={submitting} succeeded={succeeded} label={messages.auth.login} />
      </motion.form>
    </div>
  );
}
