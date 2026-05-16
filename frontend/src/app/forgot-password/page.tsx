import Link from 'next/link';
import { MailQuestion } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

export default function ForgotPasswordPage() {
  return (
    <main className="min-h-screen bg-stone-50">
      <Navbar variant="solid" />
      <section className="mx-auto flex max-w-xl flex-col items-center px-4 py-24 text-center">
        <div className="grid h-16 w-16 place-items-center rounded-full bg-amber-100 text-amber-700">
          <MailQuestion className="h-7 w-7" />
        </div>
        <h1 className="mt-5 font-display text-2xl font-bold text-stone-950">Khôi phục mật khẩu</h1>
        <p className="mt-2 text-sm leading-6 text-stone-500">
          Backend hiện chưa có luồng gửi email đặt lại mật khẩu. Nếu dùng tài khoản seed, hãy đăng nhập bằng mật khẩu trong seed hoặc liên hệ admin dự án.
        </p>
        <Link
          href="/login"
          className="mt-6 rounded-full bg-amber-500 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-amber-600"
        >
          Quay lại đăng nhập
        </Link>
      </section>
      <Footer />
    </main>
  );
}
