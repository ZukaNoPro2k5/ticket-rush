import { InfoPageShell } from '@/components/layout/InfoPageShell';

export default function PrivacyPage() {
  return (
    <InfoPageShell
      eyebrow="Pháp lý"
      title="Chính sách bảo mật"
      intro="TicketRush chỉ thu thập dữ liệu cần cho tài khoản, đặt vé và trải nghiệm gợi ý."
    >
      <section>
        <h2 className="font-display text-xl font-bold text-stone-900">Dữ liệu được dùng để làm gì</h2>
        <p className="mt-2">
          Email dùng cho đăng nhập và khôi phục mật khẩu; thông tin hồ sơ giúp cá nhân hóa gợi ý; dữ liệu đặt vé phục vụ phát hành QR và thống kê vận hành.
        </p>
      </section>
    </InfoPageShell>
  );
}
