import type { Metadata } from 'next';
import NextTopLoader from 'nextjs-toploader';
import { Providers } from '@/components/providers/Providers';
import './globals.css';

export const metadata: Metadata = {
  title: 'TicketRush - Đặt vé sự kiện online',
  description: 'Nền tảng mua vé sự kiện trực tuyến hàng đầu Việt Nam',
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="vi">
      <head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
          crossOrigin="anonymous"
          referrerPolicy="no-referrer"
        />
      </head>
      <body className="bg-stone-50 font-sans text-stone-900 antialiased">
        <NextTopLoader
          color="#f59e0b"
          initialPosition={0.12}
          crawlSpeed={160}
          height={3}
          showSpinner={false}
          easing="ease"
          speed={200}
          shadow="0 0 10px #f59e0b,0 0 5px #f59e0b"
        />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
