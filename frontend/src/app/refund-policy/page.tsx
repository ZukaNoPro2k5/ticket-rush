import { InfoPageShell } from '@/components/layout/InfoPageShell';

export default function RefundPolicyPage() {
  return (
    <InfoPageShell
      eyebrow="Hỗ trợ"
      title="Chính sách hoàn vé"
      intro="Ở bản đồ án hiện tại, thanh toán thật đang được tạm hoãn. Trang này ghi rõ nguyên tắc để giao diện không hứa điều hệ thống chưa làm."
    >
      <section>
        <h2 className="font-display text-xl font-bold text-stone-900">Hiện tại</h2>
        <p className="mt-2">
          Xác nhận đơn được mô phỏng như thanh toán thành công, nên chưa phát sinh luồng hoàn tiền qua cổng thanh toán bên thứ ba.
        </p>
      </section>
      <section>
        <h2 className="font-display text-xl font-bold text-stone-900">Sau này</h2>
        <p className="mt-2">
          Khi tích hợp thanh toán thật, chính sách hoàn vé sẽ gắn với trạng thái đơn, thời điểm sự kiện và quy định của ban tổ chức.
        </p>
      </section>
    </InfoPageShell>
  );
}
