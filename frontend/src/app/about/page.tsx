import { InfoPageShell } from '@/components/layout/InfoPageShell';

export default function AboutPage() {
  return (
    <InfoPageShell
      eyebrow="TicketRush"
      title="Nền tảng đặt vé cho những đêm đáng nhớ"
      intro="TicketRush tập trung vào một việc: giúp khán giả chọn ghế nhanh, hiểu trạng thái vé rõ, và để ban tổ chức vận hành sự kiện bằng dữ liệu thật."
    >
      <section>
        <h2 className="font-display text-xl font-bold text-stone-900">Điều chúng tôi ưu tiên</h2>
        <p className="mt-2">
          Tốc độ, minh bạch và trải nghiệm gọn. Ghế được giữ theo thời gian thực, vé QR sinh sau khi xác nhận, và dashboard admin phản chiếu dữ liệu vận hành thay vì chỉ trình diễn con số.
        </p>
      </section>
    </InfoPageShell>
  );
}
