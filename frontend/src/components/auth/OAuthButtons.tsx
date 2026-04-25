'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { EASE_OUT_EXPO } from '@/lib/motion';

const POPUP_W = 520;
const POPUP_H = 640;

/**
 * Opens a small popup window for OAuth (Google / Facebook).
 * The popup goes through NextAuth → provider → /auth-callback.
 * /auth-callback posts the backend token back via postMessage,
 * then closes itself. We pick it up here and call setAuth().
 *
 * Falls back to full-page redirect if the browser blocks popups.
 */
export function OAuthButtons({ mode = 'login', onSuccess }: { mode?: 'login' | 'register'; onSuccess?: () => void }) {
  const verb = mode === 'register' ? 'Đăng ký' : 'Tiếp tục';
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const [loading, setLoading] = useState<'google' | 'facebook' | null>(null);

  const handle = async (provider: 'google' | 'facebook') => {
    if (loading) return;
    setLoading(provider);

    const left = Math.round(window.screenX + (window.outerWidth  - POPUP_W) / 2);
    const top  = Math.round(window.screenY + (window.outerHeight - POPUP_H) / 2.5);

    // Open blank popup first (must happen in the same sync tick to avoid popup blocker)
    const popup = window.open(
      'about:blank',
      'oauth-popup',
      `width=${POPUP_W},height=${POPUP_H},left=${left},top=${top},` +
      `scrollbars=yes,resizable=yes,status=no,toolbar=no,menubar=no,location=no`,
    );

    if (!popup) {
      setLoading(null);
      toast.error('Trình duyệt đã chặn cửa sổ popup. Vui lòng cho phép popup và thử lại.');
      return;
    }

    try {
      // NextAuth v4 requires a POST with CSRF token to initiate OAuth
      const csrfRes = await fetch('/api/auth/csrf');
      const { csrfToken } = (await csrfRes.json()) as { csrfToken: string };

      // Submit a hidden form that targets the popup window
      const callbackUrl = `${window.location.origin}/auth-callback`;
      const form = document.createElement('form');
      form.method = 'POST';
      form.action = `/api/auth/signin/${provider}`;
      form.target  = 'oauth-popup';

      for (const [name, value] of Object.entries({ csrfToken, callbackUrl })) {
        const input = document.createElement('input');
        input.type  = 'hidden';
        input.name  = name;
        input.value = value;
        form.appendChild(input);
      }

      document.body.appendChild(form);
      form.submit();
      document.body.removeChild(form);
    } catch {
      popup.close();
      setLoading(null);
      toast.error('Không thể khởi động OAuth. Vui lòng thử lại.');
      return;
    }

    // Listen for the postMessage from /auth-callback
    const onMessage = (ev: MessageEvent) => {
      if (ev.origin !== window.location.origin) return;

      window.removeEventListener('message', onMessage);
      clearInterval(pollClosed);
      setLoading(null);

      if (ev.data?.type === 'oauth-success') {
        const { token, user } = ev.data as {
          token: string | null;
          user: { id: number | string; email: string; name: string };
        };
        if (token) {
          setAuth(token, {
            id:        Number(user.id),
            email:     user.email,
            full_name: user.name,
            role:      'customer',
          });
          toast.success(`Chào mừng, ${user.name.split(' ').pop()}!`);
          if (onSuccess) {
            onSuccess();
          } else {
            router.push('/onboarding');
            router.refresh();
          }
        } else {
          toast.error('Đăng nhập thành công nhưng không nhận được token. Vui lòng thử lại.');
        }
      } else if (ev.data?.type === 'oauth-error') {
        const code = (ev.data as { code?: string }).code;
        const map: Record<string, string> = {
          OAuthSignin:           'Đăng nhập OAuth thất bại. Kiểm tra redirect URI đã được thêm vào Google/Facebook Console chưa.',
          OAuthCallback:         'Nhà cung cấp OAuth từ chối đăng nhập. Vui lòng thử lại.',
          OAuthCreateAccount:    'Không tạo được tài khoản OAuth. Vui lòng thử lại.',
          OAuthAccountNotLinked: 'Email này đã đăng ký bằng phương thức khác. Hãy dùng email & mật khẩu.',
          AccessDenied:          'Bạn đã từ chối cấp quyền truy cập.',
          Configuration:         'OAuth chưa được cấu hình. Vui lòng liên hệ admin.',
        };
        toast.error(code ? (map[code] ?? `Đăng nhập OAuth thất bại (${code}).`) : 'Đăng nhập OAuth thất bại. Vui lòng thử lại.');
      }
    };

    window.addEventListener('message', onMessage);

    // If user manually closes the popup without completing auth
    const pollClosed = setInterval(() => {
      if (popup.closed) {
        clearInterval(pollClosed);
        window.removeEventListener('message', onMessage);
        setLoading(null);
      }
    }, 500);
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.06 } } }}
      className="grid gap-3"
    >
      {/* Facebook */}
      <motion.button
        variants={{ hidden: { opacity: 0, y: 8 }, visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: EASE_OUT_EXPO } } }}
        type="button"
        disabled={!!loading}
        onClick={() => handle('facebook')}
        className="group relative flex h-12 items-center justify-center gap-3 rounded-xl bg-[#1877F2] px-4 text-sm font-semibold text-white shadow-soft transition-all hover:-translate-y-0.5 hover:bg-[#166FE5] hover:shadow-lift focus:outline-none focus:ring-2 focus:ring-[#1877F2] focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-60"
      >
        <AnimatePresence mode="wait" initial={false}>
          {loading === 'facebook' ? (
            <motion.span key="spin" initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" /> Đang mở cửa sổ…
            </motion.span>
          ) : (
            <motion.span key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2">
              <FacebookIcon />
              {verb} với Facebook
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Google */}
      <motion.button
        variants={{ hidden: { opacity: 0, y: 8 }, visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: EASE_OUT_EXPO } } }}
        type="button"
        disabled={!!loading}
        onClick={() => handle('google')}
        className="group relative flex h-12 items-center justify-center gap-3 rounded-xl border border-stone-200 bg-white px-4 text-sm font-semibold text-stone-800 shadow-soft transition-all hover:-translate-y-0.5 hover:border-stone-300 hover:shadow-lift focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-60"
      >
        <AnimatePresence mode="wait" initial={false}>
          {loading === 'google' ? (
            <motion.span key="spin" initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" /> Đang mở cửa sổ…
            </motion.span>
          ) : (
            <motion.span key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2">
              <GoogleIcon />
              {verb} với Google
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>
    </motion.div>
  );
}

function GoogleIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 48 48" aria-hidden>
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.9 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.2-.1-2.4-.4-3.5z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16 18.9 13 24 13c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2c-2 1.5-4.5 2.4-7.2 2.4-5.2 0-9.6-3.1-11.3-7.8l-6.5 5C9.5 39.6 16.1 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.2-4.1 5.6l6.2 5.2c4.3-4 6.6-10 6.6-16.3 0-1.2-.1-2.4-.4-3.5z" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}
