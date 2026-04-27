export function SeatsInfoBox() {
  return (
    <div className="space-y-1 rounded-xl border border-blue-100 bg-blue-50 p-4 text-xs text-blue-700">
      <p className="mb-1 font-semibold">Lưu ý quan trọng</p>
      <p>• Ghế giữ tối đa 10 phút, hãy xác nhận thanh toán đúng hạn.</p>
      <p>• Nếu hết hạn, ghế sẽ tự động trả lại cho người khác đặt.</p>
      <p>• Trạng thái ghế được cập nhật realtime giữa các thiết bị.</p>
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
