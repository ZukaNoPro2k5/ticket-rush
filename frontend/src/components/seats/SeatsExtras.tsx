export function SeatsInfoBox() {
  return (
    <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-xs text-blue-700 space-y-1">
      <p className="font-semibold mb-1">Lưu ý quan trọng</p>
      <p>• Ghế giữ tối đa 10 phút — xác nhận thanh toán ngay</p>
      <p>• Nếu hết hạn, ghế sẽ tự động trả lại</p>
      <p>• Mỗi lần đặt có thể chọn nhiều ghế</p>
    </div>
  );
}

export function SeatsLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-gray-500 text-sm">Đang tải sơ đồ ghế...</p>
      </div>
    </div>
  );
}
