import { InfoPageShell } from '@/components/layout/InfoPageShell';

export default function HelpPage() {
  return (
    <InfoPageShell
      eyebrow="Hỗ trợ"
      title="Mua vé không nên là một bài kiểm tra sức bền"
      intro="Nếu có trục trặc, đây là những câu trả lời cần nhất trước khi bạn phải nhắn cho đội hỗ trợ."
    >
      <section id="buying">
        <h2 className="font-display text-xl font-bold text-stone-900">Cách mua vé</h2>
        <p className="mt-2">
          Chọn sự kiện, chọn ghế còn trống, giữ ghế, rồi bấm xác nhận. Trong bản hiện tại, thao tác xác nhận được xem như thanh toán thành công để bạn nhận vé QR ngay.
        </p>
      </section>
      <section>
        <h2 className="font-display text-xl font-bold text-stone-900">Khi ghế vừa biến mất</h2>
        <p className="mt-2">
          Ghế có thể vừa được người khác giữ trước bạn. Bản đồ ghế tự cập nhật theo thời gian thực, nên hãy chọn ghế khác thay vì tải lại trang liên tục.
        </p>
      </section>
    </InfoPageShell>
  );
}
