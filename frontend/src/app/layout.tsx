import type { Metadata } from 'next';
import { Be_Vietnam_Pro } from 'next/font/google';
import './globals.css';

const beVietnamPro = Be_Vietnam_Pro({
  subsets: ['latin', 'vietnamese'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-be-vietnam-pro',
});

export const metadata: Metadata = {
  title: 'TicketRush - Đặt vé sự kiện online',
  description: 'Nền tảng mua vé sự kiện trực tuyến hàng đầu Việt Nam',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body className={`${beVietnamPro.variable} font-sans`}>{children}</body>
    </html>
  );
}
