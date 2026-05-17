export function SeatsInfoBox({ holdMinutes, maxTickets }: { holdMinutes: number; maxTickets: number }) {
  return (
    <div className="space-y-1.5 rounded-2xl border border-amber-100 bg-amber-50 p-4 text-xs leading-5 text-amber-800">
      <p className="font-semibold">Lưu ý</p>
      <p>• Ghế được giữ ngay khi bạn chọn, tối đa {holdMinutes} phút.</p>
      <p>• Mỗi giao dịch tối đa {maxTickets} vé.</p>
      <p>• Nếu hết hạn, ghế tự động trả lại cho người khác đặt.</p>
    </div>
  );
}

export function SeatsLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="mx-auto mb-3 h-10 w-10 animate-spin rounded-full border-4 border-orange-500 border-t-transparent" />
        <p className="text-sm text-gray-500">Đang tải sơ đồ ghế...</p>
      </div>
    </div>
  );
}
