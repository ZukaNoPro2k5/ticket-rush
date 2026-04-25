// Static UI configuration — does NOT contain dynamic/API content.
// Event content, news, promotions come from the backend API.

import type { DisplayEvent } from '@/types';

export type CategoryKey =
  | 'music'
  | 'arts'
  | 'tech'
  | 'sports'
  | 'food'
  | 'entertainment'
  | 'workshop'
  | 'stage';

export interface CategoryDef {
  key: CategoryKey;
  label: string;
  icon: string; // FA class
  count: number;
  accent: string; // tailwind bg+text
  ring: string;
}

export const CATEGORIES: CategoryDef[] = [
  { key: 'music',         label: 'Âm nhạc',    icon: 'fa-solid fa-music',           count: 248, accent: 'bg-rose-100 text-rose-600',      ring: 'ring-rose-200' },
  { key: 'arts',          label: 'Nghệ thuật', icon: 'fa-solid fa-palette',         count: 132, accent: 'bg-sky-100 text-sky-600',        ring: 'ring-sky-200' },
  { key: 'tech',          label: 'Công nghệ',  icon: 'fa-solid fa-microchip',       count: 87,  accent: 'bg-pink-100 text-pink-600',      ring: 'ring-pink-200' },
  { key: 'sports',        label: 'Thể thao',   icon: 'fa-solid fa-futbol',          count: 96,  accent: 'bg-emerald-100 text-emerald-600', ring: 'ring-emerald-200' },
  { key: 'food',          label: 'Ẩm thực',    icon: 'fa-solid fa-utensils',        count: 64,  accent: 'bg-teal-100 text-teal-600',      ring: 'ring-teal-200' },
  { key: 'entertainment', label: 'Giải trí',   icon: 'fa-solid fa-masks-theater',   count: 154, accent: 'bg-purple-100 text-purple-600',  ring: 'ring-purple-200' },
  { key: 'workshop',      label: 'Hội thảo',   icon: 'fa-solid fa-chalkboard-user', count: 71,  accent: 'bg-amber-100 text-amber-600',    ring: 'ring-amber-200' },
  { key: 'stage',         label: 'Sân khấu',   icon: 'fa-solid fa-theater-masks',   count: 58,  accent: 'bg-orange-100 text-orange-600',  ring: 'ring-orange-200' },
];

export const FOOTER_LINKS = {
  company: [
    { label: 'Về TicketRush',  href: '#' },
    { label: 'Tuyển dụng',     href: '#' },
    { label: 'Tin tức',        href: '#' },
    { label: 'Liên hệ',        href: '#' },
  ],
  discover: [
    { label: 'Tất cả sự kiện', href: '/events' },
    { label: 'Sự kiện hot',    href: '/events?sort=trending' },
    { label: 'Sắp diễn ra',    href: '/events?sort=upcoming' },
    { label: 'Vé giá rẻ',      href: '/events?sort=price' },
  ],
  support: [
    { label: 'Trung tâm trợ giúp', href: '#' },
    { label: 'Hướng dẫn mua vé',   href: '#' },
    { label: 'Chính sách hoàn vé',  href: '#' },
    { label: 'Điều khoản dịch vụ',  href: '#' },
  ],
};

export const TRUST_SIGNALS = [
  { icon: 'shield-check', title: 'Thanh toán an toàn',  desc: 'Bảo mật chuẩn PCI DSS · 3D-Secure · không lưu thẻ' },
  { icon: 'rotate-ccw',   title: 'Hoàn vé minh bạch',   desc: 'Chính sách hoàn rõ ràng theo từng sự kiện' },
  { icon: 'headphones',   title: 'Hỗ trợ 24/7',         desc: 'Đội ngũ CSKH phản hồi trong 5 phút' },
];

export const STATS = [
  { value: '1,200+', label: 'Sự kiện đang mở bán' },
  { value: '98K+',   label: 'Vé đã giao thành công' },
  { value: '24',     label: 'Tỉnh thành phủ sóng' },
  { value: '4.9',    label: 'Điểm hài lòng (5.0)' },
];

export const TRENDING_CHIPS: string[] = [
  'EXO', 'Mr. Siro', 'Bùi Công Nam', 'GAI', 'Workshop',
  'Badass City', 'Mỹ Tâm', 'Stand-up Comedy', 'Art Fair',
  'V-League', 'Festival', 'IDECAF',
];

export const TIME_TABS = [
  { key: 'today',   label: 'Hôm nay' },
  { key: 'weekend', label: 'Cuối tuần' },
  { key: 'week',    label: 'Tuần này' },
  { key: 'month',   label: 'Tháng này' },
] as const;
export type TimeTabKey = typeof TIME_TABS[number]['key'];

export function formatVnd(value: number): string {
  return value.toLocaleString('vi-VN') + 'đ';
}

export type NewsArticle = {
  id: string;
  title: string;
  excerpt: string;        // lead / subtitle shown on card
  body: string[];         // body paragraphs for article detail page
  quote?: string;         // pull-quote for detail page
  author?: string;
  category: string;
  cover: string;
  publishedAt: string;
  readMin: number;
  featured?: boolean;
};

export type NewsCategory =
  | 'Tất cả' | 'Showbiz' | 'Sự kiện' | 'Phỏng vấn'
  | 'Sân khấu' | 'Mẹo hay' | 'Review' | 'Hậu trường';

export const NEWS_CATEGORIES: NewsCategory[] = [
  'Tất cả', 'Showbiz', 'Sự kiện', 'Phỏng vấn',
  'Review', 'Hậu trường', 'Sân khấu', 'Mẹo hay',
];

export const NEWS_ARTICLES: NewsArticle[] = [
  {
    id: 'n1',
    title: 'EXO PLANET #6 "EXhOrizon" — đêm diễn lịch sử tại TP.HCM sau 7 năm vắng bóng',
    excerpt: 'EXO chính thức trở lại Việt Nam với tour "EXhOrizon" — vòng lưu diễn thế giới đầu tiên kể từ 2019. Đêm 26/04 tại Sân vận động Phú Thọ hứa hẹn là sự kiện K-pop lớn nhất năm với setlist 25 ca khúc và sân khấu LED 800m².',
    body: [
      'Được công bố bất ngờ vào đêm 14 tháng 3 qua một tweet ngắn từ SM Entertainment, thông tin về đêm diễn tại TP.HCM lập tức khiến cộng đồng EXO-L Việt Nam "đứng tim". Chỉ trong 6 giờ đầu, hashtag #EXOVIETNAM đã trending tại 12 tỉnh thành và lượt đăng ký theo dõi sự kiện trên TicketRush vượt mốc 80.000 — con số chưa từng có trong lịch sử nền tảng.',
      'Setlist dự kiến bao gồm 25 ca khúc trải dài suốt 12 năm sự nghiệp, từ những bản hit kinh điển MAMA, Growl, Call Me Baby cho đến Wolf, Monster, Ko Ko Bop. Đặc biệt, đây là lần đầu tiên Lay Zhang (thành viên người Trung Quốc) tái hợp cùng nhóm trên sân khấu ngoài Trung Quốc sau hơn 8 năm, xác nhận được đại diện SM Entertainment vào chiều 20/04.',
      'Về sân khấu, ekip Dream Maker Entertainment tiết lộ hệ thống LED cong ôm toàn sân với hơn 800m² màn hình, kết hợp công nghệ hologram và laser đồng bộ theo từng nhịp bài — được lắp đặt bởi đội ngũ đã thực hiện concert BTS "Map of the Soul: ON:E" và Coldplay "Music of the Spheres". Toàn bộ thiết bị vận chuyển từ Seoul bằng 3 chuyến bay chở hàng.',
      'Vé chia thành 4 phân khu: FAN PIT (900.000đ), SILVER – Khu B (1.500.000đ), GOLD – Khu A (2.800.000đ) và DIAMOND – Sân khấu (4.500.000đ). Theo ghi nhận của TicketRush, hạng DIAMOND đã sold out trong 11 phút sau khi mở bán, GOLD trong 34 phút. Hiện chỉ còn một số ghế SILVER và FAN PIT.',
      'Nhìn rộng ra, sự kiện lần này đánh dấu bước ngoặt lớn cho thị trường concert quốc tế tại Việt Nam: đây là lần đầu tiên một nhóm nhạc K-pop hạng A chọn TP.HCM làm điểm dừng duy nhất tại Đông Nam Á, thay vì Bangkok hay Singapore như thông lệ. Tín hiệu này cho thấy Việt Nam đang dần được công nhận như một thị trường âm nhạc trực tiếp đáng đầu tư.',
    ],
    quote: 'Đây là lần đầu tiên chúng tôi chọn Việt Nam làm điểm dừng duy nhất tại Đông Nam Á. EXO-L Việt Nam — chúng tôi không quên các bạn.',
    author: 'Minh Thư',
    category: 'Showbiz',
    cover: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=1200&q=80',
    publishedAt: '25/04/2026',
    readMin: 5,
    featured: true,
  },
  {
    id: 'n6',
    title: 'Sơn Tùng M-TP công bố "SKY TOUR" World Tour 2026 — lần đầu tiên ra nước ngoài',
    excerpt: 'Đêm 20/04, Sơn Tùng M-TP bất ngờ công bố world tour đầu tiên trong sự nghiệp: "SKY TOUR 2026" với các điểm dừng tại Hà Nội, Seoul, Tokyo và London. Đêm mở màn tại Sân vận động Mỹ Đình ngày 22/08 với 40.000 chỗ ngồi.',
    body: [
      'Đúng nửa đêm 20/04, trang Instagram @sontungmtp đăng một video teaser 30 giây với hình ảnh bầu trời mở ra, kèm dòng chú thích duy nhất: "SKY TOUR 2026. WORLD. 22.08 — Hanoi. See you there." Trong 30 phút, video đạt hơn 2 triệu lượt xem — phá kỷ lục cá nhân của chính anh.',
      'Theo thông tin từ nhãn hàng M-TP Entertainment, tour diễn gồm 5 điểm dừng: Hà Nội (22/08), TP.HCM (30/08), Seoul (15/09), Tokyo (28/09) và London (12/10). Đây là lần đầu tiên trong lịch sử âm nhạc Việt Nam, một nghệ sĩ solo Việt tổ chức concert tại các trung tâm âm nhạc lớn của thế giới.',
      '"SKY TOUR" được biết là chủ đề của album phòng thu thứ 6 của Sơn Tùng, dự kiến phát hành trước ngày khai tour 1 tháng. Concept âm nhạc theo đội ngũ sản xuất mô tả là "sự pha trộn giữa pop Á, R&B hiện đại và âm thanh điện tử — hướng ra thế giới nhưng giữ hồn Việt".',
      'Tại Hà Nội, concert diễn ra tại Sân vận động Mỹ Đình với 40.000 chỗ ngồi — quy mô lớn nhất một nghệ sĩ Việt từng thực hiện tại đây. Vé mở bán từ ngày 01/05 theo 5 phân khu, từ 600.000đ đến 3.500.000đ. Đặc biệt 500 vé "SKY PASS" kèm meet & greet sẽ bán đấu giá 100% lợi nhuận cho quỹ học bổng trẻ em.',
      'Sự công bố của Sơn Tùng không chỉ là tin vui với fan mà còn là tín hiệu quan trọng: V-pop đang vươn ra thế giới theo con đường khác K-pop — không qua hệ thống idol factory, mà qua cá nhân hóa nghệ sĩ và câu chuyện âm nhạc chân thực.',
    ],
    quote: 'Tôi muốn chứng minh rằng âm nhạc Việt Nam có chỗ đứng trên bất kỳ sân khấu nào trên thế giới.',
    author: 'Thanh Long',
    category: 'Showbiz',
    cover: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=1200&q=80',
    publishedAt: '21/04/2026',
    readMin: 6,
    featured: true,
  },
  {
    id: 'n8',
    title: 'Phỏng vấn Đen Vâu: "Rap không phải để nổi tiếng — đó là cách tôi đặt câu hỏi với thế giới"',
    excerpt: 'Trước thềm concert "Cháy Cùng" tại Hà Nội (12/07), TicketRush Newsroom gặp Nguyễn Đức Cường — nghệ sĩ đứng sau biệt danh Đen Vâu — để nói về nhạc, xã hội và lý do anh không bao giờ viết nhạc "để bán".',
    body: [
      'Chúng tôi gặp Đen Vâu tại quán cà phê quen thuộc của anh ở Hoàng Mai — nơi anh nói anh thường viết nhạc và quan sát người qua đường. Không ekip, không PR, không máy quay. Chỉ một chiếc máy ghi âm và hai ly cà phê. "Tôi thích nói chuyện thế này hơn" — anh nói, rót thêm đường vào ly.',
      '"Nhiều người nghĩ rap là thể loại của giới trẻ, của đường phố, của sự nổi loạn. Nhưng với tôi, rap chỉ đơn giản là cách tôi đặt câu hỏi lớn hơn thể xác mình" — anh bắt đầu khi tôi hỏi về album mới. Album thứ 5 của anh, chưa có tên chính thức, được mô tả là "đen hơn, chậm hơn, và ít dễ nghe hơn". Đó là chủ ý.',
      '"Tôi không muốn mọi người stream nhạc tôi khi tập gym hay lúc rửa chén. Tôi muốn họ ngồi xuống, đeo tai nghe, và nghĩ. Nếu không ai nghĩ gì sau khi nghe — tôi đã thất bại, dù bài đó có 50 triệu views." Anh nói điều này không có vẻ kiêu ngạo, chỉ như một tuyên ngôn đã được nung nấu từ lâu.',
      'Về concert "Cháy Cùng", anh tiết lộ đây sẽ là đêm diễn khác nhất trong sự nghiệp: không màn hình LED lớn, không laser, không hype man. "Chỉ có âm nhạc, ánh đèn nhỏ và khoảng 3.000 người nghe thật sự. Tôi muốn thấy mặt người ta khi họ nghe nhạc của mình — không phải thấy màn hình điện thoại họ giơ lên."',
      'Câu hỏi cuối: anh sợ gì nhất trong sự nghiệp? Anh dừng lại khá lâu. "Sợ một ngày mình viết một bài hay nhưng không còn gì để nói nữa. Sợ nhạc của mình trở nên an toàn." Rồi anh cười. "Chưa xảy ra. Đời còn nhiều thứ cần hỏi lắm."',
    ],
    quote: 'Tôi không muốn mọi người stream nhạc tôi khi tập gym. Tôi muốn họ ngồi xuống và nghĩ.',
    author: 'Phương Anh',
    category: 'Phỏng vấn',
    cover: 'https://images.unsplash.com/photo-1571266028243-d220bc562f7c?w=1200&q=80',
    publishedAt: '19/04/2026',
    readMin: 7,
  },
  {
    id: 'n3',
    title: 'BADASS CITY 2026 — khi Sài Gòn thật sự là thủ đô hip-hop Đông Nam Á',
    excerpt: 'Lễ hội hip-hop lớn nhất miền Nam trở lại lần thứ 4 với quy mô nâng cấp hoàn toàn: 3 sân khấu, 30+ nghệ sĩ và lần đầu tiên có headliner quốc tế. Ngày 02/05, Công viên bờ sông Sài Gòn sẽ là tâm chấn.',
    body: [
      'BADASS CITY 2026 đánh dấu lần thứ 4 lễ hội hip-hop này được tổ chức tại TP.HCM, nhưng lần này quy mô được nâng cấp toàn diện: 3 sân khấu hoạt động song song từ 16:00 đến 24:00, thay vì 1 sân khấu duy nhất như những năm trước. Tổng diện tích khu vực sự kiện hơn 15.000m² — tương đương 2 sân bóng đá.',
      'Lineup năm nay quy tụ gần như đầy đủ "pantheon" hip-hop Việt: Wowy đảm nhận vai trò closing act sau gần 20 năm cầm mic, Suboi mở màn với bộ set electronic hip-hop mới hoàn toàn, MCK và Tlinh xuất hiện cùng nhau sau 2 năm ít hoạt động. Obito, Hứa Kim Tuyền, Yuk Trax, Lil Wuyn, Wxrdie, Andiez cũng có mặt trong lineup xác nhận.',
      'Điểm mới đáng chú ý nhất: năm nay BADASS CITY lần đầu tiên có headliner nước ngoài. Nhóm rapper/producer người Hàn Quốc Balming Tiger (đã cộng tác với RM của BTS) và DJ/producer Mndsgn từ Los Angeles sẽ mang đến màn giao thoa văn hóa đặc biệt. Đây là minh chứng cho việc BADASS CITY đang vươn tầm quốc tế.',
      'Ngoài âm nhạc, lễ hội năm nay còn có BAZAAR — khu mua sắm chuyên biệt với hơn 60 gian hàng sneaker, streetwear và thủ công nghệ sĩ. UNDERGROUND STAGE dành riêng cho các pha battle freestyle và showcase của các nghệ sĩ chưa được biết đến rộng rãi — đây là nơi nhiều ngôi sao hip-hop Việt hiện tại từng bước đầu xuất hiện.',
      'Vé theo 3 tier: BLEACHER 250.000đ, STANDING General 500.000đ và VIP ZONE 1.200.000đ (khu riêng có bàn, đồ uống free-flow). Lưu ý đây là sự kiện ngoài trời — ban tổ chức khuyến khích giày vải, áo mưa mỏng và tránh đồ da lộn.',
    ],
    quote: 'Hip-hop không còn là underground ở Việt Nam nữa. Đây không phải tiến bộ — đây là điều đương nhiên phải xảy ra.',
    author: 'Hoàng Việt',
    category: 'Sự kiện',
    cover: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=1200&q=80',
    publishedAt: '22/04/2026',
    readMin: 5,
  },
  {
    id: 'n4',
    title: 'IDECAF "Tấm Cám Đại Chiến" — cổ tích được kể lại đúng thời đại, theo cách đau nhất',
    excerpt: 'NSND Thành Lộc dàn dựng phiên bản "Tấm Cám" năm 2026 với Cám là influencer triệu followers và Bụt là AI assistant. Hài kịch, nhưng chạm thật sự vào những câu hỏi không dễ trả lời của thế hệ mạng xã hội.',
    body: [
      'NSND Thành Lộc kể rằng ý tưởng về "Tấm Cám Đại Chiến" đến từ một câu hỏi đùa của con trai ông: "Ba ơi, nếu hôm nay Tấm và Cám có điện thoại thì chuyện gì xảy ra?" Câu hỏi đó ám ảnh ông suốt 3 tháng trước khi ông quyết định biến nó thành vở kịch. "Câu trả lời thú vị hơn tôi tưởng nhiều" — ông nói trong buổi họp báo ra mắt.',
      'Phiên bản 2026 giữ nguyên xương sống cốt truyện nhưng cài cắm những chi tiết hiện đại một cách thông minh: Cám trở thành influencer với 5 triệu followers, livestream bán hàng mỗi ngày. Hoàng tử là CEO startup công nghệ đang IPO. Mẹ Cám — đương nhiên do NSND Thành Lộc đóng — là bà mẹ điển hình của thế hệ "helicopter parent" thời 4.0. Và Bụt xuất hiện dưới dạng AI assistant, giọng do Trấn Thành dubbing, hiện thị qua hologram.',
      'Điều làm vở kịch không chỉ là hài kịch là lớp ý nghĩa thứ hai: khi Cám trở thành kẻ phản diện được thuật toán trao quyền, và Tấm là người tốt bị shadowban vì không chịu drama — vở diễn đang nói về một vấn đề rất thật của 2026. "Chúng tôi không cố gắng dạy đạo đức. Chúng tôi chỉ đặt gương trước mặt người xem" — NSND Thành Lộc giải thích.',
      'Dàn diễn viên gồm 3 thế hệ nghệ sĩ IDECAF, với Kiều Trinh vai Tấm và Nhật Hào vai Cám. Vũ đạo do choreographer Quang Đăng thiết kế — 4 màn múa bùng nổ xen kẽ kịch nói mang lại nhịp điệu không cho phép khán giả ngồi yên. Vở diễn dài 2 giờ 20 phút với 1 intermission.',
      'Vé 3 hạng: VIP 600.000đ (hàng A–C), Hạng Nhất 400.000đ (hàng D–H), Phổ thông 250.000đ. Suất diễn từ Thứ Năm đến Chủ Nhật, 19:30. Suất Chủ Nhật đặc biệt có Q&A với ekip sau vở diễn. Vé hạng VIP các suất cuối tuần đã gần kín.',
    ],
    quote: 'Tấm Cám không chỉ là cổ tích. Đó là câu chuyện về việc người tốt phải chịu thiệt bao lâu trước khi được đền đáp — và liệu thuật toán có thay đổi điều đó không.',
    author: 'Thu Hà',
    category: 'Sân khấu',
    cover: 'https://images.unsplash.com/photo-1503095396549-807759245b35?w=1200&q=80',
    publishedAt: '20/04/2026',
    readMin: 6,
  },
  {
    id: 'n7',
    title: 'Mỹ Tâm "Tâm 9": 25 năm và vẫn hát như lần đầu tiên',
    excerpt: 'Kỷ niệm 25 năm sự nghiệp, Mỹ Tâm không tổ chức gala lộng lẫy. Cô chọn Đà Nẵng — thành phố quê hương — và một setlist hoàn toàn không có hit mới. Đây là câu chuyện về tại sao.',
    body: [
      'Khi đội ngũ ekip đề xuất tổ chức concert kỷ niệm 25 năm tại Hà Nội hoặc TP.HCM với 15.000 chỗ ngồi, Mỹ Tâm từ chối. Cô chọn Nhà thi đấu Tiên Sơn tại Đà Nẵng — thành phố nơi cô sinh ra và lớn lên — với sức chứa 5.000 người. "Tôi không muốn kỷ niệm 25 năm bằng một sự kiện. Tôi muốn kỷ niệm nó bằng một đêm hát thật sự" — cô chia sẻ trong video công bố.',
      '"Tâm 9" là tên album thứ 9 trong sự nghiệp của Mỹ Tâm, nhưng tên concert lại mang thêm ý nghĩa khác: "9" trong tiếng Quảng Nam quê cô có nghĩa là "cửu" — chín năm, chín lần trở đi trở lại. Setlist concert gồm 24 bài hát được chính fan bình chọn qua khảo sát trực tuyến — không phải ekip quyết định, không phải ban tổ chức. Fan quyết định.',
      'Điều đặc biệt: toàn bộ setlist là những bài đã ra đời trước năm 2020. "Nhiều người nói tôi nên hát nhạc mới để \'trẻ hóa hình ảnh\'. Nhưng tôi nghĩ ngược lại — những bài hát cũ mới thật sự là di sản. Đó là những gì còn lại sau 25 năm." Các bài như Đừng Nói Xa Nhau, Đừng Hỏi Em, Hãy Đến Với Em, Ước Gì vẫn gây ra những phản ứng cảm xúc mà không bài hit mới nào có thể thay thế.',
      'Ban nhạc sẽ gồm 12 nhạc công, trong đó có violinist Hoàng Rob — người đã cộng tác với Mỹ Tâm từ những ngày đầu sự nghiệp. Không DJ, không backing track điện tử. "Tôi muốn người nghe thấy nhạc thở. Thấy từng nốt được tạo ra ngay lúc đó, không phải phát lại." Concert không có quảng cáo tài trợ, không có MC mở màn.',
      'Vé đang bán trên TicketRush với 3 hạng: Platinum (2.000.000đ), VIP Gold (1.200.000đ) và Standard (600.000đ). Đây là một trong những concert hiếm hoi giá vé cao nhất không phải của nghệ sĩ nước ngoài tại Đà Nẵng — và vẫn sold out trong 3 ngày đầu mở bán.',
    ],
    quote: 'Những bài hát cũ mới thật sự là di sản. Đó là những gì còn lại sau 25 năm — không phải TikTok views, không phải chart position.',
    author: 'Lan Anh',
    category: 'Showbiz',
    cover: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=1200&q=80',
    publishedAt: '17/04/2026',
    readMin: 6,
  },
  {
    id: 'n9',
    title: 'Hậu trường EXO "EXhOrizon": 3 đêm, 120 nhân công, 2,5 tấn thiết bị bay từ Seoul',
    excerpt: 'Trước khi 25.000 khán giả bước vào Sân vận động Phú Thọ tối 26/04, một đội ngũ 120 người đã làm việc 72 giờ liên tục để dựng sân khấu. Đây là câu chuyện của họ.',
    body: [
      'Lúc 3 giờ sáng ngày 23/04, chiếc xe tải đầu tiên trong chuỗi 14 xe tải lăn vào cổng Sân vận động Phú Thọ. Bên trong: 2,5 tấn thiết bị gồm khung sân khấu, hệ thống LED, dàn âm thanh L-Acoustics K1 và toàn bộ phụ kiện kỹ thuật đặt cọc tại Seoul 3 tuần trước. Từ khoảnh khắc đó, đồng hồ đếm ngược bắt đầu.',
      'Kỹ thuật trưởng Kim Hyun-soo, người đã thực hiện sân khấu cho 6 tour diễn quốc tế của EXO, nói qua phiên dịch: "Mỗi sân vận động có cấu trúc riêng — sàn, hệ thống treo, tải trọng trần đều khác nhau. Sân Phú Thọ có những điểm thú vị cần giải quyết, nhưng đội ngũ Việt Nam làm việc nhanh hơn tôi mong đợi."',
      'Ekip gồm 120 người, trong đó 40 kỹ sư từ Seoul và 80 nhân công từ Việt Nam — phần lớn được thuê từ các công ty tổ chức sự kiện địa phương đã có kinh nghiệm với concert quốc tế. Ngôn ngữ chính là... màu sắc và ký hiệu trên bản vẽ kỹ thuật. "Không cần nói cùng ngôn ngữ khi mọi người đều biết công việc của mình" — một nhân công Việt Nam nói.',
      'Phần phức tạp nhất là hệ thống LED cong 800m² — không phải màn hình phẳng thông thường mà là các module uốn cong theo hình parabol để ôm sát khán giả theo góc 270 độ. Mỗi module có trọng lượng 45kg và cần 2 người lắp, căn chỉnh góc độ với sai số không quá 0,5 độ. Tổng cộng hơn 180 module.',
      'Đến chiều 25/04, sân khấu đã thành hình. Sound check đầu tiên lúc 18:00 với toàn bộ dàn âm thanh — tiếng nhạc vang ra khỏi sân vận động khiến hàng trăm fan đang chờ bên ngoài bắt đầu... khóc. Đó là khoảnh khắc mà ekip 120 người nhìn nhau, không nói gì. Họ biết mình đã làm được.',
    ],
    quote: 'Không cần nói cùng ngôn ngữ khi mọi người đều biết công việc của mình. Đó là ngôn ngữ của những người làm show.',
    author: 'Tuấn Khoa',
    category: 'Hậu trường',
    cover: 'https://images.unsplash.com/photo-1540039155733-5bb30b4f8a61?w=1200&q=80',
    publishedAt: '24/04/2026',
    readMin: 7,
  },
  {
    id: 'n10',
    title: 'Review Vũ. "Vũ-Verse 2026" tại Hà Nội: âm nhạc như một cuộc hành hương',
    excerpt: 'Cung Thể thao Quần Ngựa tối 13/06 không phải là một venue concert thông thường — nó trở thành một không gian thánh đường của những người đã lớn lên cùng âm nhạc Vũ. Đây là review đầy đủ.',
    body: [
      'Vũ. bước ra sân khấu lúc 20:07 — không có hype video, không có màn ra mắt rầm rộ. Chỉ có đèn vàng ấm, một cây guitar và 2.000 người im lặng hoàn toàn. Bài đầu tiên là "Về Nghe Nhạc Đi" — bản nhạc 6 năm tuổi mà đến hôm nay nghe vẫn thấy mới như lần đầu.',
      'Concert được thiết kế theo dạng thrust stage — sân khấu ăn sâu vào giữa khán giả, không có khoảng cách rõ ràng giữa nghệ sĩ và người nghe. Quyết định đó không phải ngẫu nhiên: "Tôi không muốn mọi người nhìn tôi. Tôi muốn chúng ta cùng nhìn vào một thứ gì đó" — Vũ. nói sau bài thứ ba.',
      'Setlist gồm 21 bài, không theo thứ tự album mà được sắp xếp theo cung bậc cảm xúc — từ buồn nhẹ đến nặng nề đến giải thoát. Phần giữa concert, anh hát liên tục 4 bài slow không nghỉ, không nói chuyện với khán giả. Không ai nói chuyện. Không ai quay TikTok. 2.000 người ngồi với nhạc.',
      'Những bài mới từ Vũ-Verse — chưa được phát hành chính thức — được tiếp nhận với sự chú ý kỳ lạ của người lần đầu nghe. Không có màn "hát theo" quen thuộc, chỉ có những cái đầu nghiêng nhẹ, những người nhắm mắt. "Tôi thích khi khán giả không biết bài — lúc đó họ thực sự nghe, không phải hát theo" — anh giải thích sau concert.',
      'Điểm trừ duy nhất: âm thanh ở vài khu vực phía sau có sự phản xạ không tốt từ mái nhà thi đấu, khiến phần mid-treble hơi mờ. Đây là vấn đề cố hữu của Cung Quần Ngựa và khó tránh khỏi. Nhưng với một concert dựa nhiều vào acoustic guitar và giọng hát — nó không phá hỏng trải nghiệm tổng thể. Điểm tổng: 9.2/10.',
    ],
    quote: 'Tôi không muốn mọi người nhìn tôi. Tôi muốn chúng ta cùng nhìn vào một thứ gì đó.',
    author: 'Minh Thư',
    category: 'Review',
    cover: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=1200&q=80',
    publishedAt: '14/06/2026',
    readMin: 8,
  },
  {
    id: 'n2',
    title: 'Bùi Công Nam "The Story" Livetour — hành trình kể chuyện bằng âm nhạc đầu tiên',
    excerpt: 'Khác với hầu hết nghệ sĩ chọn TP.HCM làm điểm xuất phát, BCN mở tour từ Hà Nội. Sân khấu thrust stage, không backdrop lớn, không laser. Chỉ có anh và những câu chuyện chưa bao giờ kể thành lời.',
    body: [
      '"The Story" không phải tên album — đó là lời hứa. Trong 4 năm, Bùi Công Nam tích lũy hơn 300 bài hát chưa phát hành. "The Story Livetour" là cách anh chọn để kể một phần trong số đó ra thế giới — không qua streaming platform, không qua MV, mà qua đêm nhạc trực tiếp. "Một số bài sẽ không bao giờ được phát hành chính thức. Đêm diễn là lần duy nhất người ta nghe được" — anh nói trong buổi họp báo.',
      'Quyết định mở tour từ Hà Nội mang màu sắc cá nhân rõ ràng: "Hà Nội là nơi tôi bắt đầu làm nhạc. Không gian đó — những con phố cũ, những quán cà phê nơi tôi viết bài — nó vẫn còn trong mỗi ca khúc tôi viết. Tôi muốn kể câu chuyện đầu tiên ở nơi nó được sinh ra."',
      'Thiết kế sân khấu theo dạng thrust — ăn sâu vào khán giả, không có hàng rào ngăn cách. Ban nhạc gồm 6 nhạc công tất cả đều là bạn bè đã chơi cùng anh từ những năm đầu sự nghiệp. "Tôi không muốn thuê người. Tôi muốn những người ngồi sau mic đó hiểu tại sao những bài hát đó tồn tại."',
      'Setlist 22 bài, phần lớn từ các album "Ký Ức Trong Lành" và "Nhìn Về Nhau" — nhưng 4 bài mới hoàn toàn chưa phát hành sẽ xuất hiện lần đầu tại Hà Nội. Thông tin này không được công bố chính thức; khán giả sẽ phát hiện tại đêm diễn.',
      'Vé hạng PLATINUM tại Hà Nội đã sold out trong ngày đầu mở bán. STANDARD còn một số lượng hạn chế. Concert tại TP.HCM (20/06) đang mở đăng ký ưu tiên.',
    ],
    quote: 'Một số bài sẽ không bao giờ được phát hành chính thức. Đêm diễn là lần duy nhất người ta nghe được.',
    author: 'Thanh Long',
    category: 'Showbiz',
    cover: 'https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?w=1200&q=80',
    publishedAt: '24/04/2026',
    readMin: 5,
  },
  {
    id: 'n5',
    title: '7 mẹo săn vé concert không bị "cháy" trong mùa show bùng nổ 2026',
    excerpt: 'Mùa concert 2026 đang đặt ra những thách thức mới cho người mua vé: tốc độ bán nhanh hơn, bot ngày càng tinh vi hơn. Đây là những chiến thuật từ các "fan cứng" và insider của ngành.',
    body: [
      'Mùa concert 2026 đang tạo ra áp lực mua vé chưa từng có: vé EXO sold out trong 11 phút, BADASS CITY City VIP hết trong 2 giờ, Sơn Tùng SKY TOUR Hà Nội dự kiến bán xong trong buổi sáng đầu tiên. Không chuẩn bị kỹ, bạn sẽ trắng tay dù online đúng giờ.',
      'Mẹo 1 — Bật thông báo đúng cách: Trong TicketRush, bấm "Theo dõi" sự kiện và bật cả push notification lẫn email reminder. Push notification tới tay bạn nhanh hơn email 2–5 phút — và trong cuộc đua mua vé, 5 phút là tất cả. Đặt thêm báo thức trước giờ mở bán 10 phút để sẵn sàng.\n\nMẹo 2 — Ví điện tử pre-loaded: Nạp sẵn tiền vào MoMo, VNPay hoặc ZaloPay trước ngày mở bán ít nhất 1 ngày. Tránh dùng thẻ quốc tế nếu có thể — bước xác thực OTP tốn thêm 30–45 giây, đủ để mất ghế trong trường hợp căng thẳng.',
      'Mẹo 3 — Chiến lược ghế khôn ngoan: Với concert seated, đừng chỉ nhắm VIP. Hàng cuối của GOLD hoặc đầu SILVER thường cho góc nhìn tốt hơn VIP hàng A vì sân khấu thường cao. Với concert standing, vị trí bên trái/phải sân khấu ít chen hơn center nhưng vẫn gần nghệ sĩ — và có không gian di chuyển khi cần.\n\nMẹo 4 — Chiếc tab dự phòng: Mở song song 2 tab hoặc dùng 2 thiết bị khác nhau (điện thoại + máy tính). Nếu một tab bị lỗi hoặc session hết hạn, bạn có tab dự phòng.',
      'Mẹo 5 — Đăng nhập trước 30 phút: Đừng đợi đến giờ mở bán mới đăng nhập. Server TicketRush có thể chậm nếu hàng trăm nghìn người cùng đăng nhập một lúc. Đăng nhập sẵn, điền thông tin thanh toán, chọn số ghế muốn mua — để khi vé mở bán chỉ cần nhấn "Thêm vào giỏ" và confirm.\n\nMẹo 6 — Group fan là nguồn thông tin tốt nhất: Các group Facebook như "Concert HN 2026", "Fan Concert Vietnam" thường có thông báo về flash sale, pre-sale link và cảnh báo vé giả sớm nhất. Join và bật thông báo.',
      'Mẹo 7 — Nếu trắng tay vẫn còn cơ hội: TicketRush có tính năng "Hàng chờ" — khi người mua không thanh toán trong 10 phút, ghế tự động trả về hàng đợi. Những slot này xuất hiện không báo trước, thường vào buổi chiều ngày mở bán. Cài thông báo "Ghế vừa mở" và kiểm tra app thường xuyên trong 24 giờ đầu.',
    ],
    quote: 'Fan cứng không chờ vé. Fan cứng chuẩn bị từ 30 phút trước khi mở bán.',
    author: 'Phương Anh',
    category: 'Mẹo hay',
    cover: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1200&q=80',
    publishedAt: '18/04/2026',
    readMin: 5,
  },
];

export const TRENDING_NEWS_IDS: string[] = ['n1', 'n6', 'n8'];

// ─────────────────────────────────────────────
// Hero Carousel — static slides (real events)
// ─────────────────────────────────────────────
export interface HeroSlide {
  id: number;
  title: string;
  subtitle: string;
  tagline: string;
  badge: string;
  image: string;
  date: string;
  venue: string;
}

export const HERO_SLIDES: HeroSlide[] = [
  {
    id: 1,
    title: 'EXO PLANET #6 – EXhOrizon',
    subtitle: 'EXO WORLD TOUR 2026',
    tagline: 'Vòng lưu diễn thế giới — đêm duy nhất tại Đông Nam Á. Hơn 25 ca khúc spanning 12 năm sự nghiệp.',
    badge: 'HOT · 26/04 · TP.HCM',
    image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=1600&q=80',
    date: '26/04/2026 · 19:00',
    venue: 'Sân vận động Phú Thọ, TP.HCM',
  },
  {
    id: 6,
    title: 'BADASS CITY 2026',
    subtitle: 'Saigon Hip-Hop Festival',
    tagline: 'Hơn 30 rapper hàng đầu: Wowy, Suboi, MCK, Tlinh, Đen Vâu & nhiều hơn nữa trên sân khấu ngoài trời.',
    badge: '30 NGHỆ SĨ · Festival',
    image: 'https://images.unsplash.com/photo-1571266028243-d220bc562f7c?w=1600&q=80',
    date: '02/05/2026 · 16:00',
    venue: 'Công viên bờ sông Sài Gòn, Bình Thạnh',
  },
  {
    id: 4,
    title: 'Bùi Công Nam "The Story" Livetour',
    subtitle: 'Hà Nội 2026',
    tagline: 'Chuyến lưu diễn đầu tiên trong sự nghiệp — hành trình kể chuyện qua âm nhạc mộc mạc, chân thành.',
    badge: 'LIVETOUR 2026',
    image: 'https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?w=1600&q=80',
    date: '26/04/2026 · 20:00',
    venue: 'Trung tâm Hội nghị Quốc gia, Hà Nội',
  },
  {
    id: 9,
    title: 'Tấm Cám Đại Chiến!',
    subtitle: 'Nhà hát Kịch IDECAF',
    tagline: 'Cổ tích quen thuộc, phiên bản hài kịch bùng nổ — đạo diễn NSND Thành Lộc dàn dựng.',
    badge: 'SÂN KHẤU HOT',
    image: 'https://images.unsplash.com/photo-1503095396549-807759245b35?w=1600&q=80',
    date: '17/05/2026 · 19:30',
    venue: 'IDECAF, 28 Lê Lợi, Quận 1',
  },
  {
    id: 16,
    title: 'Vietnam AI Summit 2026',
    subtitle: 'Hội thảo AI lớn nhất Đông Nam Á',
    tagline: 'Generative AI & Future of Work — 60+ diễn giả từ Google, Meta, VinAI và các startup AI hàng đầu.',
    badge: 'TECH · Hội thảo',
    image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1600&q=80',
    date: '15/05/2026 · 08:30',
    venue: 'GEM Center, Quận 1, TP.HCM',
  },
  {
    id: 15,
    title: 'ĐTDV Mùa Xuân 2026 – Chung Kết',
    subtitle: 'Liên Minh Huyền Thoại Việt Nam',
    tagline: 'Trận chung kết esports lớn nhất năm — hàng nghìn khán giả trực tiếp tại Nhà thi đấu Tinh Võ.',
    badge: 'CHUNG KẾT · eSports',
    image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1600&q=80',
    date: '01/05/2026 · 14:00',
    venue: 'Nhà thi đấu Tinh Võ, Bình Thạnh, TP.HCM',
  },
];

// ─────────────────────────────────────────────
// This Week Events — for EventCalendar & demo fallback
// ─────────────────────────────────────────────
export const THIS_WEEK_EVENTS: DisplayEvent[] = [
  {
    id: 1,
    title: 'EXO PLANET #6 – EXhOrizon',
    category: 'Âm nhạc',
    categoryKey: 'music',
    venue: 'Sân vận động Phú Thọ',
    city: 'TP. HCM',
    date: '2026-04-26T19:00:00',
    dateLabel: 'CN, 26/04',
    timeLabel: '19:00',
    poster: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&q=80',
    priceFrom: 900_000,
    priceTo: 4_500_000,
    soldPercent: 94,
    badge: 'hot',
    velocity: 32,
    organizer: 'Dream Maker Entertainment',
  },
  {
    id: 6,
    title: 'BADASS CITY 2026 – Saigon Hiphop Festival',
    category: 'Âm nhạc',
    categoryKey: 'music',
    venue: 'Công viên bờ sông Sài Gòn',
    city: 'TP. HCM',
    date: '2026-05-02T16:00:00',
    dateLabel: 'T7, 02/05',
    timeLabel: '16:00',
    poster: 'https://images.unsplash.com/photo-1571266028243-d220bc562f7c?w=800&q=80',
    priceFrom: 250_000,
    priceTo: 1_200_000,
    soldPercent: 78,
    badge: 'hot',
    velocity: 28,
    organizer: 'Badass Entertainment',
  },
  {
    id: 4,
    title: 'Bùi Công Nam "The Story" Livetour – Hà Nội',
    category: 'Âm nhạc',
    categoryKey: 'music',
    venue: 'Trung tâm Hội nghị Quốc gia',
    city: 'Hà Nội',
    date: '2026-04-26T20:00:00',
    dateLabel: 'CN, 26/04',
    timeLabel: '20:00',
    poster: 'https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?w=800&q=80',
    priceFrom: 900_000,
    priceTo: 3_000_000,
    soldPercent: 71,
    badge: 'hot',
    velocity: 22,
    organizer: 'Bùi Công Nam Team',
  },
  {
    id: 9,
    title: 'Nhà hát Kịch IDECAF: Tấm Cám Đại Chiến!',
    category: 'Sân khấu',
    categoryKey: 'stage',
    venue: 'Nhà hát Kịch IDECAF',
    city: 'TP. HCM',
    date: '2026-05-17T19:30:00',
    dateLabel: 'CN, 17/05',
    timeLabel: '19:30',
    poster: 'https://images.unsplash.com/photo-1503095396549-807759245b35?w=800&q=80',
    priceFrom: 250_000,
    priceTo: 600_000,
    soldPercent: 65,
    badge: 'new',
    velocity: 18,
    organizer: 'IDECAF',
  },
  {
    id: 10,
    title: 'Sân Khấu Hồng Vân: Già Gân',
    category: 'Sân khấu',
    categoryKey: 'stage',
    venue: 'Sân khấu Kịch Hồng Vân',
    city: 'TP. HCM',
    date: '2026-04-25T19:30:00',
    dateLabel: 'T7, 25/04',
    timeLabel: '19:30',
    poster: 'https://images.unsplash.com/photo-1527224538127-2104bb71c51b?w=800&q=80',
    priceFrom: 200_000,
    priceTo: 500_000,
    soldPercent: 58,
    badge: 'new',
    velocity: 10,
    organizer: 'Sân khấu Kịch Hồng Vân',
  },
  {
    id: 11,
    title: 'Thanh Gươm và Bà Mẹ – Nhà hát Kịch Việt Nam',
    category: 'Sân khấu',
    categoryKey: 'stage',
    venue: 'Nhà hát Kịch Việt Nam',
    city: 'Hà Nội',
    date: '2026-04-26T19:30:00',
    dateLabel: 'CN, 26/04',
    timeLabel: '19:30',
    poster: 'https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?w=800&q=80',
    priceFrom: 150_000,
    priceTo: 400_000,
    soldPercent: 45,
    badge: 'new',
    velocity: 8,
    organizer: 'Nhà hát Kịch Việt Nam',
  },
  {
    id: 17,
    title: '[FLOWER 1969] Workshop Làm Nước Hoa',
    category: 'Hội thảo',
    categoryKey: 'workshop',
    venue: 'FLOWER 1969 Studio',
    city: 'Hà Nội',
    date: '2026-04-27T10:00:00',
    dateLabel: 'T2, 27/04',
    timeLabel: '10:00',
    poster: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&q=80',
    priceFrom: 350_000,
    priceTo: 600_000,
    soldPercent: 40,
    badge: 'new',
    velocity: 6,
    organizer: 'FLOWER 1969',
  },
  {
    id: 2,
    title: 'Mr. Siro Fan Concert – Encore',
    category: 'Âm nhạc',
    categoryKey: 'music',
    venue: 'Nhà thi đấu Quân khu 7',
    city: 'TP. HCM',
    date: '2026-04-30T19:30:00',
    dateLabel: 'T5, 30/04',
    timeLabel: '19:30',
    poster: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&q=80',
    priceFrom: 800_000,
    priceTo: 2_200_000,
    soldPercent: 48,
    badge: 'new',
    velocity: 10,
    organizer: 'Quản lý Mr. Siro',
  },
  {
    id: 3,
    title: 'GAI Home Concert – Hà Nội',
    category: 'Âm nhạc',
    categoryKey: 'music',
    venue: 'Cung Văn hóa Hữu nghị Hà Nội',
    city: 'Hà Nội',
    date: '2026-04-30T20:00:00',
    dateLabel: 'T5, 30/04',
    timeLabel: '20:00',
    poster: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800&q=80',
    priceFrom: 1_000_000,
    priceTo: 2_000_000,
    soldPercent: 45,
    badge: 'new',
    velocity: 9,
    organizer: 'GAI / Yến Lê Team',
  },
  {
    id: 18,
    title: '[Metashow] Triển Lãm Nghệ Thuật Ánh Sáng',
    category: 'Hội thảo',
    categoryKey: 'workshop',
    venue: 'Vincom Mega Mall Royal City',
    city: 'Hà Nội',
    date: '2026-04-24T09:00:00',
    dateLabel: 'T6, 24/04',
    timeLabel: '09:00',
    poster: 'https://images.unsplash.com/photo-1531058020387-3be344556be6?w=800&q=80',
    priceFrom: 150_000,
    priceTo: 350_000,
    soldPercent: 38,
    badge: undefined,
    velocity: 5,
    organizer: 'Metashow Vietnam',
  },
];

// ─────────────────────────────────────────────
// Trending Leaderboard — top 10 by ticket velocity
// ─────────────────────────────────────────────
export const TRENDING_LEADERBOARD: DisplayEvent[] = [
  { ...THIS_WEEK_EVENTS[0], rankChange: 2 },  // EXO — #1, up 2
  { ...THIS_WEEK_EVENTS[1], rankChange: 1 },  // BADASS CITY — #2, up 1
  { ...THIS_WEEK_EVENTS[2], rankChange: 0 },  // BCN HN — #3, same
  { ...THIS_WEEK_EVENTS[3], rankChange: 3 },  // IDECAF — #4, up 3
  {
    id: 16,
    title: 'Vietnam AI Summit 2026',
    category: 'Hội thảo',
    categoryKey: 'workshop',
    venue: 'GEM Center',
    city: 'TP. HCM',
    date: '2026-05-15T08:30:00',
    dateLabel: 'T6, 15/05',
    timeLabel: '08:30',
    poster: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80',
    priceFrom: 2_500_000,
    priceTo: 5_000_000,
    soldPercent: 58,
    badge: 'special',
    rankChange: -1,
    velocity: 14,
    organizer: 'Vietnam AI Alliance',
  },
  {
    id: 15,
    title: 'ĐTDV Mùa Xuân 2026 – Chung Kết',
    category: 'Thể thao',
    categoryKey: 'sports',
    venue: 'Nhà thi đấu Tinh Võ',
    city: 'TP. HCM',
    date: '2026-05-01T14:00:00',
    dateLabel: 'T6, 01/05',
    timeLabel: '14:00',
    poster: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&q=80',
    priceFrom: 100_000,
    priceTo: 500_000,
    soldPercent: 52,
    badge: 'hot',
    rankChange: 2,
    velocity: 12,
    organizer: 'VEC Esports',
  },
  { ...THIS_WEEK_EVENTS[7], rankChange: 0 },  // Mr. Siro — #7
  { ...THIS_WEEK_EVENTS[8], rankChange: 1 },  // GAI — #8
  {
    id: 14,
    title: 'V-League 2026 – Hà Nội FC vs. HAGL',
    category: 'Thể thao',
    categoryKey: 'sports',
    venue: 'Sân vận động Hàng Đẫy',
    city: 'Hà Nội',
    date: '2026-05-03T19:15:00',
    dateLabel: 'CN, 03/05',
    timeLabel: '19:15',
    poster: 'https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=800&q=80',
    priceFrom: 100_000,
    priceTo: 400_000,
    soldPercent: 42,
    badge: undefined,
    rankChange: -1,
    velocity: 8,
    organizer: 'VPF',
  },
  {
    id: 5,
    title: 'Bùi Công Nam "The Story" Livetour – TP.HCM',
    category: 'Âm nhạc',
    categoryKey: 'music',
    venue: 'SECC',
    city: 'TP. HCM',
    date: '2026-06-20T19:30:00',
    dateLabel: 'T7, 20/06',
    timeLabel: '19:30',
    poster: 'https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?w=800&q=80',
    priceFrom: 900_000,
    priceTo: 3_000_000,
    soldPercent: 35,
    badge: undefined,
    rankChange: 0,
    velocity: 7,
    organizer: 'Bùi Công Nam Team',
  },
];
