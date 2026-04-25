export const DETAIL_ZONES = [
  { name: 'VIP Đứng Sân khấu', price: 3_500_000, available: 12,  total: 120, color: 'bg-rose-500',    desc: 'Khu vực đứng sát sân khấu, view đẹp nhất' },
  { name: 'Premium (A-B)',      price: 2_200_000, available: 48,  total: 200, color: 'bg-amber-500',   desc: 'Ghế ngồi hàng đầu, không khuất tầm nhìn' },
  { name: 'Standard (C-F)',     price: 1_200_000, available: 120, total: 400, color: 'bg-sky-500',     desc: 'Ghế ngồi trung tâm, âm thanh tốt' },
  { name: 'Economy (G-J)',      price: 600_000,   available: 180, total: 300, color: 'bg-emerald-500', desc: 'Ghế ngồi phía sau, tiết kiệm' },
];

export const DETAIL_LINEUP = [
  { time: '19:00 - 19:30', title: 'Đón khách & check-in', desc: 'Mở cửa, kiểm tra vé, check-in ảnh' },
  { time: '19:30 - 20:00', title: 'Opening Act', desc: 'Màn trình diễn mở màn từ nghệ sĩ trẻ' },
  { time: '20:00 - 21:30', title: 'Main Concert', desc: 'Phần biểu diễn chính — 90 phút bùng nổ' },
  { time: '21:30 - 22:00', title: 'Encore & Meet-and-Greet', desc: 'Gặp gỡ nghệ sĩ và chụp ảnh kỷ niệm' },
];

export const DETAIL_FAQ = [
  { q: 'Tôi có thể đổi/trả vé sau khi mua không?', a: 'Vé đã mua không đổi/trả, trừ trường hợp sự kiện bị hủy bởi BTC. Khi đó bạn sẽ được hoàn 100% giá trị vé qua phương thức thanh toán ban đầu.' },
  { q: 'Trẻ em có cần mua vé riêng?', a: 'Trẻ em dưới 6 tuổi được miễn phí vào cửa khi đi cùng người lớn có vé và không chiếm ghế. Trẻ từ 6 tuổi cần mua vé như người lớn.' },
  { q: 'Tôi nhận vé như thế nào?', a: 'Sau khi thanh toán thành công, e-ticket (QR code) sẽ được gửi qua email trong 5 phút. Bạn chỉ cần xuất trình mã QR tại cửa.' },
  { q: 'Có được mang đồ ăn, nước uống vào không?', a: 'Không mang đồ ăn/nước uống từ bên ngoài. Khu vực sự kiện có quầy F&B với nhiều lựa chọn.' },
  { q: 'Địa điểm có chỗ đỗ xe không?', a: 'Có bãi gửi xe máy và ôtô tại cổng phía Đông. Phí gửi theo giá niêm yết của SVĐ.' },
];

export const DETAIL_REVIEWS = [
  { name: 'Nguyễn Minh Anh', rating: 5, date: '2 ngày trước', text: 'Sự kiện cực kỳ chất lượng! Âm thanh ánh sáng đỉnh cao, nghệ sĩ rất gần gũi với khán giả. Chắc chắn sẽ đi tiếp nếu có tour sau.' },
  { name: 'Trần Quang Huy', rating: 5, date: '1 tuần trước', text: 'Mua vé cực nhanh, nhận QR qua email trong 2 phút. BTC rất chuyên nghiệp. Recommend 100%.' },
  { name: 'Lê Thảo Nguyên', rating: 4, date: '2 tuần trước', text: 'Nhìn chung ổn, chỉ có điều khu vực Economy hơi xa sân khấu. Lần sau sẽ chọn Standard.' },
];

export const RATING_DISTRIBUTION = [
  { s: 5, p: 78 }, { s: 4, p: 15 }, { s: 3, p: 5 }, { s: 2, p: 1 }, { s: 1, p: 1 },
];

export type EventTabKey = 'about' | 'lineup' | 'venue' | 'faq' | 'reviews';

export const EVENT_TABS: { key: EventTabKey; label: string }[] = [
  { key: 'about',   label: 'Giới thiệu' },
  { key: 'lineup',  label: 'Chương trình' },
  { key: 'venue',   label: 'Địa điểm' },
  { key: 'faq',     label: 'Hỏi đáp' },
  { key: 'reviews', label: 'Đánh giá' },
];
