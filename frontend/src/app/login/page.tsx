'use client';

import { useState, Suspense, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { OAuthButtons } from '@/components/auth/OAuthButtons';
import { useAuthStore } from '@/stores/authStore';
import api from '@/lib/api/client';
import { EASE_OUT_EXPO } from '@/lib/motion';

const FIELD_CLS = (
  err?: boolean,
) =>
  `h-12 w-full rounded-xl border bg-white text-sm text-stone-900 placeholder:text-stone-400
   transition-all duration-200 focus:outline-none focus:ring-2
   ${
     err
       ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/20'
       : 'border-stone-200 focus:border-amber-500 focus:ring-amber-500/20'
   }`;

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const callbackUrl = params.get('callbackUrl') ?? '/';
  const oauthError  = params.get('error');
  const { setAuth } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [remember, setRemember] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [succeeded, setSucceeded] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});
  const [shakeKey, setShakeKey] = useState(0);

  // Surface NextAuth OAuth errors (e.g. ?error=OAuthSignin when Google/Facebook
  // client IDs are missing or the provider rejects the request).
  // If we are inside the OAuth popup, forward the error back to the opener
  // and close the popup so the parent page stops spinning.
  useEffect(() => {
    if (!oauthError) return;

    // Running inside popup window → forward + close
    if (typeof window !== 'undefined' && window.opener && window.opener !== window) {
      try {
        window.opener.postMessage(
          { type: 'oauth-error', code: oauthError },
          window.location.origin,
        );
      } catch {
        // ignore — cross-origin opener
      }
      window.close();
      return;
    }

    const map: Record<string, string> = {
      OAuthSignin:           'Không khởi động được đăng nhập OAuth. Kiểm tra cấu hình Google/Facebook trong .env.local.',
      OAuthCallback:         'Nhà cung cấp OAuth từ chối đăng nhập. Vui lòng thử lại.',
      OAuthCreateAccount:    'Không tạo được tài khoản OAuth. Vui lòng thử lại.',
      OAuthAccountNotLinked: 'Email này đã đăng ký bằng phương thức khác. Hãy đăng nhập bằng email & mật khẩu.',
      Callback:              'Đăng nhập thất bại. Vui lòng thử lại.',
      AccessDenied:          'Bạn đã từ chối cấp quyền truy cập.',
      Configuration:         'OAuth chưa được cấu hình. Vui lòng liên hệ admin.',
    };
    setFormError(map[oauthError] ?? 'Không thể đăng nhập bằng OAuth. Vui lòng thử lại.');
    setShakeKey((k) => k + 1);
  }, [oauthError]);

  const validate = () => {
    const fe: { email?: string; password?: string } = {};
    if (!email) fe.email = 'Vui lòng nhập email';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) fe.email = 'Email không hợp lệ';
    if (!password) fe.password = 'Vui lòng nhập mật khẩu';
    return fe;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const fe = validate();
    if (Object.keys(fe).length) {
      setFieldErrors(fe);
      setShakeKey((k) => k + 1);
      return;
    }
    setFieldErrors({});
    setFormError(null);
    setSubmitting(true);
    try {
      const { data } = await api.post<{
        success: boolean;
        data: { token: string; user: { id: number; email: string; full_name: string; role: string } };
      }>('/auth/login', { email, password });

      setAuth(data.data.token, {
        id: data.data.user.id,
        email: data.data.user.email,
        full_name: data.data.user.full_name,
        role: data.data.user.role as 'customer' | 'admin',
      });

      setSucceeded(true);
      toast.success(`Chào mừng trở lại, ${data.data.user.full_name.split(' ').pop()}!`);
      setTimeout(() => {
        router.push(callbackUrl);
        router.refresh();
      }, 700);
    } catch (err: unknown) {
      const r   = (err as { response?: { data?: { message?: string; error?: { message?: string } } } })?.response?.data;
      const msg = r?.error?.message ?? r?.message ?? 'Email hoặc mật khẩu không chính xác';
      setFormError(msg);
      setShakeKey((k) => k + 1);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <OAuthButtons mode="login" />

      <div className="my-6 flex items-center gap-3 text-xs font-medium uppercase tracking-wider text-stone-400">
        <span className="h-px flex-1 bg-stone-200" />
        hoặc dùng email
        <span className="h-px flex-1 bg-stone-200" />
      </div>

      <motion.form
        key={shakeKey}
        onSubmit={handleSubmit}
        noValidate
        className="space-y-4"
        animate={shakeKey > 0 ? { x: [0, -5, 5, -3, 3, 0] } : {}}
        transition={{ duration: 0.35, ease: 'easeInOut' }}
      >
        <AnimatePresence mode="wait">
          {formError && (
            <motion.div
              key="err"
              initial={{ opacity: 0, y: -8, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.97 }}
              transition={{ duration: 0.25, ease: EASE_OUT_EXPO }}
              className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700"
              role="alert"
            >
              <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
              <span>{formError}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Email */}
        <div>
          <label htmlFor="email" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-stone-600">Email</label>
          <div className="relative">
            <Mail className={`pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 transition-colors ${email ? 'text-amber-500' : 'text-stone-400'}`} />
            <input
              id="email" type="email" autoComplete="email" required autoFocus
              value={email}
              onChange={(e) => { setEmail(e.target.value); setFieldErrors((fe) => ({ ...fe, email: undefined })); }}
              placeholder="ban@example.com"
              className={`${FIELD_CLS(!!fieldErrors.email)} pl-10 pr-4`}
            />
          </div>
          <AnimatePresence>
            {fieldErrors.email && (
              <motion.p
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-1 overflow-hidden text-xs text-rose-600"
              >{fieldErrors.email}</motion.p>
            )}
          </AnimatePresence>
        </div>

        {/* Password */}
        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label htmlFor="password" className="block text-xs font-bold uppercase tracking-wider text-stone-600">Mật khẩu</label>
            <Link href="/forgot-password" className="text-xs font-medium text-amber-700 hover:text-amber-800">Quên mật khẩu?</Link>
          </div>
          <div className="relative">
            <Lock className={`pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 transition-colors ${password ? 'text-amber-500' : 'text-stone-400'}`} />
            <input
              id="password" type={showPw ? 'text' : 'password'} autoComplete="current-password" required
              value={password}
              onChange={(e) => { setPassword(e.target.value); setFieldErrors((fe) => ({ ...fe, password: undefined })); }}
              placeholder="••••••••"
              className={`${FIELD_CLS(!!fieldErrors.password)} pl-10 pr-12`}
            />
            <button
              type="button" onClick={() => setShowPw((v) => !v)}
              aria-label={showPw ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
              className="absolute right-2 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-lg text-stone-400 transition-colors hover:bg-stone-100 hover:text-stone-700"
            >
              {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          <AnimatePresence>
            {fieldErrors.password && (
              <motion.p
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-1 overflow-hidden text-xs text-rose-600"
              >{fieldErrors.password}</motion.p>
            )}
          </AnimatePresence>
        </div>

        <label className="flex cursor-pointer items-center gap-2 text-sm text-stone-600">
          <input
            type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)}
            className="h-4 w-4 rounded border-stone-300 accent-amber-500"
          />
          Ghi nhớ đăng nhập
        </label>

        <motion.button
          type="submit" disabled={submitting || succeeded}
          whileHover={!submitting && !succeeded ? { y: -2 } : {}}
          whileTap={!submitting && !succeeded ? { scale: 0.98 } : {}}
          className={`flex h-12 w-full items-center justify-center gap-2 rounded-xl text-sm font-semibold text-white shadow-soft
            transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2
            disabled:cursor-not-allowed
            ${succeeded ? 'bg-emerald-500' : 'bg-amber-500 hover:bg-amber-600'}`}
        >
          <AnimatePresence mode="wait" initial={false}>
            {succeeded ? (
              <motion.span
                key="ok"
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-2"
              >
                <CheckCircle2 className="h-5 w-5" /> Đăng nhập thành công!
              </motion.span>
            ) : submitting ? (
              <motion.span key="spin" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" /> Đang đăng nhập…
              </motion.span>
            ) : (
              <motion.span key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>Đăng nhập</motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      </motion.form>
    </>
  );
}

export default function LoginPage() {
  return (
    <AuthLayout
      title="Chào mừng trở lại 👋"
      subtitle="Đăng nhập để săn vé nhanh hơn và theo dõi sự kiện yêu thích."
      footer={
        <>
          Chưa có tài khoản?{' '}
          <Link href="/register" className="font-semibold text-amber-700 hover:text-amber-800">Đăng ký miễn phí</Link>
        </>
      }
    >
      <Suspense fallback={<div className="h-96 animate-pulse rounded-xl bg-stone-100" />}>
        <LoginForm />
      </Suspense>
    </AuthLayout>
  );
}
