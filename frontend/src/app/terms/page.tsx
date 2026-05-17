import { InfoPageShell } from '@/components/layout/InfoPageShell';

export default function TermsPage() {
  return (
    <InfoPageShell
      eyebrow="Pháp lý"
      title="Điều khoản sử dụng"
      intro="Bản rút gọn cho môi trường đồ án: rõ quyền, rõ trách nhiệm, không giấu điều quan trọng trong chữ nhỏ."
    >
      <section>
        <h2 className="font-display text-xl font-bold text-stone-900">Tài khoản và đặt vé</h2>
        <p className="mt-2">
          Người dùng chịu trách nhiệm với thông tin tài khoản của mình. Một ghế chỉ được xác nhận cho một đơn hợp lệ; ghế đã giữ nhưng không xác nhận đúng hạn sẽ tự nhả lại.
        </p>
      </section>
      <section>
        <h2 className="font-display text-xl font-bold text-stone-900">Nội dung</h2>
        <p className="mt-2">
          Thông tin sự kiện và bài đăng do quản trị viên cập nhật. TicketRush có thể chỉnh sửa nội dung sai lệch để giữ dữ liệu nhất quán cho người dùng.
        </p>
      </section>
    </InfoPageShell>
  );
}
