import { Footer } from '@/components/layout/Footer';
import { Navbar } from '@/components/layout/Navbar';

export function InfoPageShell({
  eyebrow,
  title,
  intro,
  children,
}: {
  eyebrow: string;
  title: string;
  intro: string;
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar variant="solid" />
      <main className="mx-auto max-w-3xl px-4 py-12 lg:px-8 lg:py-16">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-700">{eyebrow}</p>
        <h1 className="mt-3 font-display text-3xl font-bold tracking-tight text-stone-900 md:text-4xl">{title}</h1>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-stone-600">{intro}</p>
        <div className="mt-10 space-y-8 text-sm leading-7 text-stone-700">{children}</div>
      </main>
      <Footer />
    </>
  );
}
