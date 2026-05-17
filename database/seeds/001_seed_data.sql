-- =============================================
-- TicketRush — Real Seed Data
-- Source: ticketbox.vn (as of April 2026)
-- Run order: after all migration files
-- =============================================

SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci;

-- =============================================
-- USERS
-- Admin password: Admin@123
-- Customer password: User@123
-- =============================================
INSERT IGNORE INTO users (email, password_hash, full_name, phone, gender, birth_date, role) VALUES
  ('admin@ticketrush.vn',
   '$2a$10$leuVj9n1WUTWkP.Pt07Q5.TlsToA1HQXG9Bqn2dPi4WGDIzhRoev2',
   'TicketRush Admin', '0901000001', 'other', '1990-01-01', 'admin'),
  ('nguyen.van.an@example.com',
   '$2a$10$N5kjJijLqfhGJH/OXLGDgeKjTjjZHLHiVfYqWE3XriRjxH.2YMnWS',
   'Nguyễn Văn An', '0901234567', 'male', '1999-05-20', 'customer'),
  ('tran.thi.bao@example.com',
   '$2a$10$N5kjJijLqfhGJH/OXLGDgeKjTjjZHLHiVfYqWE3XriRjxH.2YMnWS',
   'Trần Thị Bảo', '0907654321', 'female', '2001-08-15', 'customer'),
  ('le.hoang.minh@example.com',
   '$2a$10$N5kjJijLqfhGJH/OXLGDgeKjTjjZHLHiVfYqWE3XriRjxH.2YMnWS',
   'Lê Hoàng Minh', '0912345678', 'male', '1998-03-10', 'customer'),
  ('pham.thu.hang@example.com',
   '$2a$10$N5kjJijLqfhGJH/OXLGDgeKjTjjZHLHiVfYqWE3XriRjxH.2YMnWS',
   'Phạm Thu Hằng', '0934567890', 'female', '2000-11-25', 'customer');

-- =============================================
-- EVENTS — real events from ticketbox.vn
-- =============================================
INSERT IGNORE INTO events
  (title, description, category, venue, event_date, poster_url, status, created_by)
VALUES

  -- ── MUSIC ────────────────────────────────────────────────
  (
    'EXO PLANET #6 – EXhOrizon in Ho Chi Minh City',
    'EXO chính thức trở lại Việt Nam với tour diễn "EXhOrizon" — vòng lưu diễn thế giới mùa hè 2026. Đây là đêm diễn duy nhất tại Đông Nam Á với setlist hơn 25 ca khúc trải dài suốt 12 năm sự nghiệp. Khán giả sẽ được trải nghiệm sân khấu 360° với công nghệ đèn LED và hiệu ứng âm thanh đỉnh cao.',
    'music',
    'Sân vận động Phú Thọ, 1 Lữ Gia, Quận 11, TP. Hồ Chí Minh',
    '2026-04-26 19:00:00',
    'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=1600&q=80',
    'published', 1
  ),
  (
    'Mr. Siro Fan Concert – Encore "Ai Cũng Giấu Trong Lòng Tảng Băng"',
    'Sau thành công vang dội của đêm diễn đầu tiên, Mr. Siro quay trở lại với đêm nhạc Encore đặc biệt. Đây là dịp để những người yêu nhạc được sống lại những khoảnh khắc cảm xúc nhất với những tình khúc quen thuộc như "Thấy chưa", "Đã lỡ yêu rồi", "Buồn của anh".',
    'music',
    'Nhà thi đấu Quân khu 7, 535 Minh Phụng, Quận 11, TP. Hồ Chí Minh',
    '2026-04-30 19:30:00',
    'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=1600&q=80',
    'published', 1
  ),
  (
    'GAI Home Concert – Hà Nội',
    'Nữ rapper GAI (Yến Lê) mang đến đêm nhạc thân mật theo phong cách "home concert" — sân khấu gần gũi, tương tác trực tiếp với khán giả. Chương trình kết hợp âm nhạc, storytelling và nghệ thuật hình ảnh độc đáo.',
    'music',
    'Cung Văn hóa Hữu nghị Hà Nội, 91 Trần Hưng Đạo, Hoàn Kiếm, Hà Nội',
    '2026-04-30 20:00:00',
    'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=1600&q=80',
    'published', 1
  ),
  (
    'Bùi Công Nam "The Story" Livetour – Hà Nội 2026',
    'Chuyến lưu diễn đầu tiên trong sự nghiệp của Bùi Công Nam — hành trình kể chuyện qua âm nhạc. Với giọng hát ấm áp, đặc trưng và những bài hát mộc mạc đến từng cảm xúc nhỏ nhất, đêm nhạc hứa hẹn mang đến trải nghiệm chữa lành sâu sắc.',
    'music',
    'Trung tâm Hội nghị Quốc gia, 57 Phạm Hùng, Mỹ Đình, Hà Nội',
    '2026-04-26 20:00:00',
    'https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?w=1600&q=80',
    'published', 1
  ),
  (
    'Bùi Công Nam "The Story" Livetour – TP. Hồ Chí Minh 2026',
    'Chặng tiếp theo trong hành trình "The Story Livetour" của Bùi Công Nam — sau đêm diễn tại Hà Nội, anh mang những câu chuyện âm nhạc chân thành nhất đến Sài Gòn. Đặc biệt hơn với nhiều bài hát mới chưa được phát hành chính thức.',
    'music',
    'SECC — Trung tâm Hội chợ và Triển lãm Sài Gòn, Quận 7, TP. Hồ Chí Minh',
    '2026-06-20 19:30:00',
    'https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?w=1600&q=80',
    'published', 1
  ),
  (
    'BADASS CITY 2026 – Saigon Hiphop Festival',
    'Lễ hội hip-hop lớn nhất miền Nam với hơn 30 nghệ sĩ rap hàng đầu Việt Nam: Wowy, Suboi, MCK, Tlinh, tlinh, Lil Wuyn, Đen Vâu và nhiều tên tuổi khác. Sân khấu ngoài trời quy mô lớn, không gian trải nghiệm văn hóa đường phố và khu hàng lưu niệm hip-hop.',
    'music',
    'Công viên bờ sông Sài Gòn, Bình Thạnh, TP. Hồ Chí Minh',
    '2026-05-02 16:00:00',
    'https://images.unsplash.com/photo-1571266028243-d220bc562f7c?w=1600&q=80',
    'published', 1
  ),
  (
    'CHARM MELODY 01: Biển Tình – Cẩm Ly & Quốc Đại',
    'Đêm nhạc trữ tình đặc biệt với hai nghệ sĩ kỳ cựu Cẩm Ly và Quốc Đại — những giai điệu nhẹ nhàng, sâu lắng về tình yêu và cuộc sống. Chương trình "Biển Tình" là sự kết hợp hoàn hảo giữa nhạc dân ca Nam Bộ và nhạc pop hiện đại.',
    'music',
    'Nhà hát Hòa Bình, 240 3 Tháng 2, Quận 10, TP. Hồ Chí Minh',
    '2026-05-16 19:30:00',
    'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=1600&q=80',
    'published', 1
  ),
  (
    'SPARK NITE: S.T Sơn Thạch x Neko Lê',
    'Đêm nhạc kết hợp đặc biệt giữa S.T Sơn Thạch (cựu thành viên ST319) và Neko Lê — hai phong cách âm nhạc hoàn toàn khác biệt nhưng cùng một tâm hồn nghệ sĩ. Chương trình hứa hẹn nhiều màn song ca bất ngờ và những bản mashup độc quyền.',
    'music',
    'GEM Center, 8 Nguyễn Bỉnh Khiêm, Đa Kao, Quận 1, TP. Hồ Chí Minh',
    '2026-05-24 20:00:00',
    'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=1600&q=80',
    'published', 1
  ),

  -- ── STAGE ────────────────────────────────────────────────
  (
    'Nhà hát Kịch IDECAF: Tấm Cám Đại Chiến!',
    'Câu chuyện cổ tích quen thuộc "Tấm Cám" được đạo diễn NSND Thành Lộc dàn dựng theo phong cách hoàn toàn mới — hài kịch hiện đại kết hợp vũ đạo bùng nổ, âm nhạc sôi động và những thông điệp hóm hỉnh về cuộc sống đương đại. Không thể bỏ lỡ!',
    'stage',
    'Nhà hát Kịch IDECAF, 28 Lê Lợi, Quận 1, TP. Hồ Chí Minh',
    '2026-05-17 19:30:00',
    'https://images.unsplash.com/photo-1503095396549-807759245b35?w=1600&q=80',
    'published', 1
  ),
  (
    'Sân Khấu Hồng Vân: Già Gân',
    'Vở hài kịch "Già Gân" của Sân khấu Kịch Hồng Vân — câu chuyện hài hước và cảm động về tình cảm gia đình, thế hệ và những hiểu lầm buồn cười. NSND Hồng Vân cùng dàn diễn viên cứng nghề mang đến tiếng cười giải trí cho cả gia đình.',
    'stage',
    'Sân khấu Kịch Hồng Vân, 136 Hai Bà Trưng, Đa Kao, Quận 1, TP. Hồ Chí Minh',
    '2026-04-25 19:30:00',
    'https://images.unsplash.com/photo-1527224538127-2104bb71c51b?w=1600&q=80',
    'published', 1
  ),
  (
    'Thanh Gươm và Bà Mẹ – Nhà hát Kịch Việt Nam',
    'Vở kịch lịch sử đương đại lấy cảm hứng từ huyền thoại Hồ Gươm, được dàn dựng bởi đạo diễn trẻ Trần Lực. Kết hợp nghệ thuật múa rối nước truyền thống với hình thức kịch nói hiện đại, tạo nên một trải nghiệm sân khấu độc đáo chưa từng có.',
    'stage',
    'Nhà hát Kịch Việt Nam, 1 Tràng Tiền, Hoàn Kiếm, Hà Nội',
    '2026-04-26 19:30:00',
    'https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?w=1600&q=80',
    'published', 1
  ),
  (
    'Sân Khấu Thế Giới Trẻ: Cuộc Chiến Sắc Đẹp',
    'Vở hài kịch "Cuộc Chiến Sắc Đẹp" — câu chuyện mang tính thời đại về áp lực ngoại hình trong xã hội hiện đại, được kể qua lăng kính hài hước nhưng đầy nhân văn. Tác giả — đạo diễn NSND Trần Minh Ngọc.',
    'stage',
    'Sân Khấu Thế Giới Trẻ, 16 Huỳnh Đình Hai, Bình Thạnh, TP. Hồ Chí Minh',
    '2026-04-25 19:30:00',
    'https://images.unsplash.com/photo-1527224538127-2104bb71c51b?w=1600&q=80',
    'published', 1
  ),
  (
    'Show Thực Cảnh Anh Hùng Cờ Lau – Đinh Bộ Lĩnh',
    'Show thực cảnh quy mô lớn tái hiện cuộc đời anh hùng Đinh Bộ Lĩnh — vị vua đầu tiên thống nhất Đại Cồ Việt. Diễn xuất trên nền cảnh quan thiên nhiên hùng vĩ với hơn 300 diễn viên, ngựa thật, thuyền thật và hiệu ứng pháo hoa ngoạn mục.',
    'stage',
    'Khu Di tích Cố đô Hoa Lư, Ninh Bình',
    '2026-05-30 19:00:00',
    'https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=1600&q=80',
    'published', 1
  ),

  -- ── SPORTS ───────────────────────────────────────────────
  (
    'V-League 2026 – Hà Nội FC vs. Hoàng Anh Gia Lai',
    'Trận đấu vòng 15 V-League 2026 giữa CLB Hà Nội FC (đương kim vô địch) và Hoàng Anh Gia Lai — một trong những trận derby hấp dẫn nhất giải. Sân Hàng Đẫy dự kiến chật kín khán giả.',
    'sports',
    'Sân vận động Hàng Đẫy, 36 Trần Phú, Ba Đình, Hà Nội',
    '2026-05-03 19:15:00',
    'https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=1600&q=80',
    'published', 1
  ),
  (
    'Đấu Trường Danh Vọng Mùa Xuân 2026 – Chung Kết',
    'Chung kết giải đấu Liên Minh Huyền Thoại Việt Nam mùa Xuân 2026 — màn so tài đỉnh cao giữa hai đội mạnh nhất khu vực. Sự kiện esports lớn nhất năm với hàng nghìn khán giả trực tiếp và hàng triệu người xem online.',
    'sports',
    'Nhà thi đấu Tinh Võ, 248 Nơ Trang Long, Bình Thạnh, TP. Hồ Chí Minh',
    '2026-05-01 14:00:00',
    'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1600&q=80',
    'published', 1
  ),

  -- ── WORKSHOP ─────────────────────────────────────────────
  (
    'Vietnam AI Summit 2026 – Hội thảo Trí tuệ Nhân tạo',
    'Diễn đàn AI lớn nhất Đông Nam Á 2026 với hơn 60 diễn giả từ Google, Meta, VinAI và các startup AI hàng đầu. Chủ đề: "Generative AI & Future of Work" — tương lai của công việc trong kỷ nguyên AI tổng quát. Kết hợp hội thảo, triển lãm demo và networking session.',
    'workshop',
    'GEM Center, 8 Nguyễn Bỉnh Khiêm, Đa Kao, Quận 1, TP. Hồ Chí Minh',
    '2026-05-15 08:30:00',
    'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1600&q=80',
    'published', 1
  ),
  (
    '[FLOWER 1969] Workshop Làm Nước Hoa – Trải nghiệm Perfumer',
    'Workshop chuyên sâu về nghệ thuật pha chế nước hoa do các Perfumer chuyên nghiệp hướng dẫn. Mỗi học viên sẽ tự tay tạo ra chai nước hoa cá nhân hóa 30ml mang về. Bộ kit nguyên liệu cao cấp được cung cấp đầy đủ.',
    'workshop',
    'FLOWER 1969 Studio, 38 Hoàng Cầu, Đống Đa, Hà Nội',
    '2026-04-27 10:00:00',
    'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=1600&q=80',
    'published', 1
  ),
  (
    '[Metashow] Triển Lãm Nghệ Thuật Ánh Sáng – Light Art Experience',
    'Triển lãm nghệ thuật ánh sáng tương tác đầu tiên tại Việt Nam với hơn 15 installation art quy mô lớn. Du khách có thể chạm, tương tác và chụp ảnh cùng các tác phẩm ánh sáng đến từ các nghệ sĩ Nhật Bản, Hàn Quốc và Việt Nam.',
    'workshop',
    'Vincom Mega Mall Royal City, 72A Nguyễn Trãi, Thanh Xuân, Hà Nội',
    '2026-04-24 09:00:00',
    'https://images.unsplash.com/photo-1531058020387-3be344556be6?w=1600&q=80',
    'published', 1
  ),

  -- ── MUSIC (tiếp theo) ─────────────────────────────────
  (
    'Mỹ Tâm "Tâm 9" Live Concert – Đà Nẵng 2026',
    'Đêm nhạc kỷ niệm 25 năm sự nghiệp của "Diva" Mỹ Tâm mang tên "Tâm 9" — con số 9 đánh dấu album thứ 9 trong sự nghiệp và sự tổng hòa của 9 màu âm nhạc suốt 1/4 thế kỷ. Khán giả sẽ được nghe lại những bản hit vượt thời gian như Đừng Nói Xa Nhau, Ước Gì, Hãy Đến Với Em, Đừng Hỏi Em, Ngẫu Hứng và nhiều ca khúc từ album mới nhất. Dàn dựng bởi ekip quốc tế với hơn 5.000 ghế ngồi.',
    'music',
    'Nhà thi đấu Tiên Sơn, 281 Trần Phú, Hải Châu, Đà Nẵng',
    '2026-07-05 20:00:00',
    'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=1600&q=80',
    'published', 1
  ),
  (
    'Hoàng Dũng "ALOHA" Concert Tour – TP.HCM',
    'Chuyến lưu diễn "ALOHA" của Hoàng Dũng — tên tour lấy cảm hứng từ triết lý sống của người Hawaii: yêu thương, hòa bình và hiện diện trọn vẹn. Đêm nhạc tại GEM Center sẽ là hành trình xuyên suốt qua các album Solo, Cá, Hoàng và những ca khúc hợp tác đình đám với Hà Anh Tuấn, Tùng Dương. Sân khấu thiết kế tông màu ấm, concept bohemian fusion.',
    'music',
    'GEM Center, 8 Nguyễn Bỉnh Khiêm, Đa Kao, Quận 1, TP. Hồ Chí Minh',
    '2026-06-06 20:00:00',
    'https://images.unsplash.com/photo-1549924231-f129b911e442?w=1600&q=80',
    'published', 1
  ),
  (
    'MONO "22" Live in Hà Nội',
    'Sau album "22" gây sốt toàn khu vực, MONO lần đầu tổ chức concert solo quy mô lớn tại Hà Nội. Đêm nhạc sẽ trình diễn toàn bộ album "22" theo thứ tự bài và cả những ca khúc được yêu thích nhất trong sự nghiệp. MONO nổi tiếng với giọng ca đặc trưng và phong cách trình diễn tinh tế, điềm đạm nhưng cuốn hút không kém bất kỳ ngôi sao K-pop nào.',
    'music',
    'Cung Văn hóa Hữu nghị Hà Nội, 91 Trần Hưng Đạo, Hoàn Kiếm, Hà Nội',
    '2026-05-10 20:00:00',
    'https://images.unsplash.com/photo-1540039155733-5bb30b4f8a61?w=1600&q=80',
    'published', 1
  ),
  (
    'tlinh "GLOW" Mini Concert – TP.HCM',
    'Nữ rapper tlinh trở lại với concept mini concert "GLOW" — đêm nhạc thân mật chỉ có 500 khán giả, nơi cô thoải mái thể hiện toàn bộ những gì không fit trong một concert lớn: freestyle, kể chuyện sau bài hát, jam cùng ban nhạc. Setlist tập trung vào bộ đôi album "Địa Đàng" và "Bơ" cùng những bản collab đình đám với MCK, tlinh, Dế Choắt.',
    'music',
    'Nhà máy Bia Sài Gòn – Bến Thành, 187 Nguyễn Chí Thanh, Quận 5, TP. Hồ Chí Minh',
    '2026-05-23 20:30:00',
    'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=1600&q=80',
    'published', 1
  ),
  (
    'Vũ. "Vũ-Verse 2026" Concert – Hà Nội',
    '"Vũ-Verse" là vũ trụ âm nhạc mà Vũ. xây dựng qua 5 năm — từ những bài hát phòng ngủ đến concert nghìn người. Đêm diễn tại Hà Nội mở ra cánh cổng vào thế giới đó: acoustic, raw, đầy cảm xúc. Setlist bao gồm toàn bộ những bài được yêu nhất từ các EP "Hoàng", "Về Nghe Nhạc Đi" cùng những ca khúc mới viết riêng cho tour này.',
    'music',
    'Cung Thể thao Quần Ngựa, Đào Tấn, Ba Đình, Hà Nội',
    '2026-06-13 20:00:00',
    'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=1600&q=80',
    'published', 1
  ),
  (
    'Đen Vâu "Cháy Cùng" Dor – Hà Nội',
    'Sau album phòng thu thứ 5, Đen Vâu ra mắt đêm diễn "Cháy Cùng" — concert đầu tiên tại sân khấu lớn Hà Nội sau 3 năm. Không khói, không pháo hoa — chỉ có từ ngữ, nhịp điệu và những thông điệp chạm thẳng vào ký ức thế hệ. Lineup hỗ trợ bao gồm nhiều nghệ sĩ đã cộng tác với Đen qua nhiều năm: Justatee, Ngọc Linh, Ngô Lan Hương.',
    'music',
    'Trung tâm Hội nghị Quốc gia, 57 Phạm Hùng, Mỹ Đình, Hà Nội',
    '2026-07-12 19:30:00',
    'https://images.unsplash.com/photo-1493559711823-0f56789cd001?w=1600&q=80',
    'published', 1
  ),
  (
    'Sơn Tùng M-TP "SKY TOUR" World Tour 2026 – Hà Nội',
    'Lần đầu tiên trong sự nghiệp, Sơn Tùng M-TP tổ chức world tour quy mô quốc tế với điểm dừng tại Hà Nội. Với hơn 40.000 chỗ ngồi và sân khấu cao 30m được dựng tại sân vận động Mỹ Đình, đây hứa hẹn là đêm diễn lớn nhất của một nghệ sĩ Việt từ trước đến nay. Setlist 28 bài xuyên suốt sự nghiệp từ Cơn Mưa Ngang Qua đến những hit mới nhất.',
    'music',
    'Sân vận động Mỹ Đình, Phạm Hùng, Nam Từ Liêm, Hà Nội',
    '2026-08-22 19:00:00',
    'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=1600&q=80',
    'published', 1
  ),
  (
    'SOOBIN "I Said I Love You" Concert Tour – TP.HCM',
    'SOOBIN mang đêm nhạc "I Said I Love You" đến TP.HCM — concert riêng đầu tiên sau thành công vang dội của album cùng tên đã đạt 50 triệu streams. Đêm nhạc kết hợp giữa R&B, pop và dance performance, với phần dàn dựng sân khấu hoành tráng theo concept "thư tình viết bằng ánh sáng".',
    'music',
    'Nhà hát Hòa Bình, 240 3 Tháng 2, Quận 10, TP. Hồ Chí Minh',
    '2026-06-27 19:30:00',
    'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=1600&q=80',
    'published', 1
  ),
  (
    'Indie Music Festival – Hanoi Open Air 2026',
    'Liên hoan âm nhạc indie lớn nhất miền Bắc — 2 ngày, 4 sân khấu, hơn 60 ban nhạc và nghệ sĩ độc lập từ khắp Việt Nam. Từ folk, blues, jazz đến indie pop và post-rock, Open Air 2026 là không gian tôn vinh những tiếng nói âm nhạc không theo khuôn mẫu. Đặc biệt có khu trao đổi vinyl, nhạc cụ và workshop làm nhạc cụ dân tộc.',
    'music',
    'Công viên Thống Nhất, Hai Bà Trưng, Hà Nội',
    '2026-09-19 15:00:00',
    'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=1600&q=80',
    'published', 1
  ),
  (
    'Lê Cát Trọng Lý "Giữa Hai Khoảng Lặng" Concert',
    'Lê Cát Trọng Lý — giọng hát được mệnh danh là "cây đàn chân mây" của âm nhạc Việt — trở lại Nhà hát Lớn với concert thính phòng mang tên "Giữa Hai Khoảng Lặng". Chỉ có 1 đêm duy nhất, 400 ghế. Piano, guitar, bộ dây — không thêm gì nữa. Những bài hát của cô vốn dĩ đã đủ đầy.',
    'music',
    'Nhà hát Lớn Hà Nội, 1 Tràng Tiền, Hoàn Kiếm, Hà Nội',
    '2026-07-25 20:00:00',
    'https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=1600&q=80',
    'published', 1
  ),

  -- ── STAGE (tiếp theo) ────────────────────────────────────
  (
    'Nhà hát Tuổi Trẻ: Người Cầm Lái',
    'Vở kịch "Người Cầm Lái" — tái dựng cuộc đời và hành trình tư tưởng của Chủ tịch Hồ Chí Minh qua những năm tháng hoạt động cách mạng bí mật tại Paris, Quảng Châu và Hà Nội. Đạo diễn NSƯT Chí Trung dàn dựng theo phong cách phi tuyến tính với kỹ thuật sân khấu hiện đại, xen kẽ hồi ức và hiện tại.',
    'stage',
    'Nhà hát Tuổi Trẻ, 11 Ngô Thì Nhậm, Hai Bà Trưng, Hà Nội',
    '2026-05-19 19:30:00',
    'https://images.unsplash.com/photo-1486591978090-58e619d37fe7?w=1600&q=80',
    'published', 1
  ),
  (
    'Nhà hát Múa Rối Thăng Long: Giao Mùa',
    '"Giao Mùa" là chương trình múa rối nước đặc biệt kết hợp nghệ thuật truyền thống 1000 năm với công nghệ chiếu mapping 3D xuống mặt nước. 45 phút hành trình qua 12 tháng trong năm — từ mùa gặt lúa đến tết Nguyên Đán — được kể bởi những con rối tre và ánh sáng. Phù hợp mọi lứa tuổi.',
    'stage',
    'Nhà hát Múa Rối Thăng Long, 57B Đinh Tiên Hoàng, Hoàn Kiếm, Hà Nội',
    '2026-05-08 20:00:00',
    'https://images.unsplash.com/photo-1519985176271-adb1088fa94c?w=1600&q=80',
    'published', 1
  ),
  (
    'Nhà hát Kịch TP.HCM: Ký Ức Sài Gòn',
    'Vở diễn "Ký Ức Sài Gòn" — hành trình qua những giai đoạn lịch sử của thành phố từ thời Pháp thuộc đến ngày đổi mới qua câu chuyện của một gia đình ba thế hệ sống tại con hẻm nhỏ Quận 1. Bi, hài, cảm động đan xen — phong cách đặc trưng của Nhà hát Kịch TP.HCM dưới sự dàn dựng của NSND Trần Ngọc Giàu.',
    'stage',
    'Nhà hát Kịch TP.HCM, 7 Trần Hưng Đạo, Quận 1, TP. Hồ Chí Minh',
    '2026-06-06 19:30:00',
    'https://images.unsplash.com/photo-1527224538127-2104bb71c51b?w=1600&q=80',
    'published', 1
  ),

  -- ── SPORTS (tiếp theo) ───────────────────────────────────
  (
    'V-League 2026 – CLB TP.HCM vs. Bình Dương FC (Vòng 16)',
    'Cuộc đối đầu giữa CLB TP.HCM và Bình Dương FC — hai đội có lịch sử cạnh tranh căng thẳng nhất ở phía Nam. Trận đấu vòng 16 V-League 2026 diễn ra tại sân Thống Nhất với dự kiến hơn 10.000 khán giả. CLB TP.HCM đang trong chuỗi 4 trận thắng liên tiếp, trong khi Bình Dương vừa có tân HLV trưởng người Brazil.',
    'sports',
    'Sân vận động Thống Nhất, 138 Đài Thắng Lợi, Quận 10, TP. Hồ Chí Minh',
    '2026-05-10 17:00:00',
    'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=1600&q=80',
    'published', 1
  ),
  (
    'AFF Cup 2026 – Việt Nam vs. Thái Lan (Vòng Bảng Bảng B)',
    'Trận đấu được cả khu vực mong đợi nhất tại AFF Cup 2026 — đại chiến truyền thống Việt Nam vs Thái Lan. Dưới sự dẫn dắt của HLV Kim Sang-sik, đội tuyển Việt Nam hướng đến mục tiêu vô địch lần thứ 3 trong lịch sử. Sân Mỹ Đình dự kiến cháy vé từ sớm với 40.000 ghế.',
    'sports',
    'Sân vận động Mỹ Đình, Phạm Hùng, Nam Từ Liêm, Hà Nội',
    '2026-12-10 19:30:00',
    'https://images.unsplash.com/photo-1575361204480-aadea25e6e68?w=1600&q=80',
    'published', 1
  ),
  (
    'VCT Pacific Kickoff 2026 – Chung Kết Khu Vực',
    'Valorant Champions Tour Pacific Kickoff 2026 — giải đấu esports đỉnh cao Châu Á – Thái Bình Dương lần đầu tiên tổ chức trận chung kết tại Việt Nam. 8 đội mạnh nhất khu vực tranh tài, trong đó có Paper Rex (Singapore), T1 (Hàn Quốc) và BOOM Esports (Indonesia). TP.HCM đón hàng chục nghìn fan esports quốc tế.',
    'sports',
    'SECC – Saigon Exhibition & Convention Center, 799 Nguyễn Văn Linh, Quận 7, TP. Hồ Chí Minh',
    '2026-06-14 13:00:00',
    'https://images.unsplash.com/photo-1556761175-4b46a572b786?w=1600&q=80',
    'published', 1
  ),
  (
    'Giải Cầu Lông Vô Địch Quốc Gia 2026 – Ngày Chung Kết',
    'Ngày thi đấu cuối cùng và căng thẳng nhất của giải Cầu Lông Vô Địch Quốc Gia 2026. Các trận tranh huy chương vàng đơn nam, đơn nữ, đôi nam, đôi nữ và đôi hỗn hợp diễn ra liên tiếp từ sáng đến tối. Nguyễn Tiến Minh (38 tuổi) được kỳ vọng tham dự lần cuối trong sự nghiệp.',
    'sports',
    'Nhà thi đấu Phú Thọ, 1 Lữ Gia, Quận 11, TP. Hồ Chí Minh',
    '2026-07-20 08:00:00',
    'https://images.unsplash.com/photo-1547347298-4074fc3086f0?w=1600&q=80',
    'published', 1
  ),
  (
    'ONE Championship: Vietnam Warriors',
    'ONE Championship mang sự kiện MMA và Muay Thai đẳng cấp thế giới đến TP.HCM với "Vietnam Warriors" — đêm thi đấu đặc biệt quy tụ 8 trận đấu, gồm 3 trận có võ sĩ người Việt Nam. Điểm nhấn là trận bảo vệ đai hạng cân Featherweight giữa đương kim vô địch Martin Nguyen và thách thức viên từ Nhật Bản.',
    'sports',
    'Nhà thi đấu Tinh Võ, 248 Nơ Trang Long, Bình Thạnh, TP. Hồ Chí Minh',
    '2026-05-31 18:00:00',
    'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=1600&q=80',
    'published', 1
  ),
  (
    'Vietnam Open Tennis 2026 – Chung Kết Đơn Nam/Nữ',
    'Giải quần vợt mở rộng Vietnam Open 2026 — sự kiện ATP 250 đầu tiên được tổ chức trên đất Việt, thu hút hơn 32 tay vợt trong top 200 thế giới. Ngày chung kết đơn nam và đơn nữ sẽ diễn ra cùng ngày với khán đài dự kiến chật kín. Sân đấu mặt cứng tiêu chuẩn ATP được lắp đặt tại Cung TDTT Mỹ Đình.',
    'sports',
    'Cung Thể dục Thể thao Mỹ Đình, Phạm Hùng, Nam Từ Liêm, Hà Nội',
    '2026-07-05 10:00:00',
    'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=1600&q=80',
    'published', 1
  ),

  -- ── WORKSHOP (tiếp theo) ────────────────────────────────
  (
    'UX/UI Design Masterclass 2026 – Google x FPT Software',
    'Khóa học thiết kế sản phẩm thực chiến do Google Design Advocate và senion designer từ FPT Software đồng giảng. 1 ngày đầy ắp: từ research user, wireframe, prototype trên Figma đến handoff với developer và design system. Mỗi học viên nhận chứng chỉ hoàn thành từ Google và FPT Software, cùng feedback 1-on-1 từ giảng viên.',
    'workshop',
    'FPT Tower, 10 Phạm Văn Bạch, Cầu Giấy, Hà Nội',
    '2026-05-24 09:00:00',
    'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=1600&q=80',
    'published', 1
  ),
  (
    'Hội Chợ Ẩm Thực Đường Phố Sài Gòn 2026',
    'Sự kiện ẩm thực đường phố thường niên lớn nhất tại TP.HCM với hơn 120 gian hàng từ các quán ăn đường phố nổi tiếng, chef local và thương hiệu F&B mới nổi. 3 ngày liên tục từ 17:00–23:00 trên Phố đi bộ Nguyễn Huệ. Ngoài ẩm thực còn có biểu diễn âm nhạc live, cooking class và chợ phiên thủ công.',
    'workshop',
    'Phố đi bộ Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh',
    '2026-05-01 17:00:00',
    'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1600&q=80',
    'published', 1
  ),
  (
    'Workshop Nhiếp Ảnh "Khoảnh Khắc Vàng" – Mạnh Đăng x Leica',
    'Nhiếp ảnh gia Mạnh Đăng — được biết đến với những khoảnh khắc đường phố Hà Nội đã xuất hiện trên National Geographic và TIME — hợp tác với Leica Camera Vietnam tổ chức workshop nhiếp ảnh street/portrait chuyên sâu. Học viên sẽ đi thực địa cùng giảng viên, học kỹ thuật ánh sáng tự nhiên và hậu kỳ. Thiết bị Leica cho mượn tại chỗ.',
    'workshop',
    'The Workshop, 27 Hoàng Diệu 2, Linh Chiểu, Thủ Đức, TP. Hồ Chí Minh',
    '2026-05-11 10:00:00',
    'https://images.unsplash.com/photo-1452780212441-51d6a531d3f9?w=1600&q=80',
    'published', 1
  );

-- Giữ sẵn một sự kiện high-demand để có thể demo phòng chờ ảo ngay sau khi seed.
UPDATE events
SET queue_enabled = 1
WHERE title = 'EXO PLANET #6 – EXhOrizon in Ho Chi Minh City';

-- =============================================
-- SEAT ZONES
-- =============================================

-- EXO PLANET (event 1)
INSERT IGNORE INTO seat_zones (event_id, name, price, color, total_rows, total_cols)
SELECT id, 'DIAMOND – Sân khấu',     4500000, '#E8D5B7', 3, 20 FROM events WHERE title LIKE 'EXO PLANET%' LIMIT 1;
INSERT IGNORE INTO seat_zones (event_id, name, price, color, total_rows, total_cols)
SELECT id, 'GOLD – Khu A',           2800000, '#FFD700', 5, 30 FROM events WHERE title LIKE 'EXO PLANET%' LIMIT 1;
INSERT IGNORE INTO seat_zones (event_id, name, price, color, total_rows, total_cols)
SELECT id, 'SILVER – Khu B',         1500000, '#C0C0C0', 8, 40 FROM events WHERE title LIKE 'EXO PLANET%' LIMIT 1;
INSERT IGNORE INTO seat_zones (event_id, name, price, color, total_rows, total_cols)
SELECT id, 'FAN PIT – Đứng',           900000, '#FF6B6B', 2, 50 FROM events WHERE title LIKE 'EXO PLANET%' LIMIT 1;

-- Mr. Siro Fan Concert (event 2)
INSERT IGNORE INTO seat_zones (event_id, name, price, color, total_rows, total_cols)
SELECT id, 'VIP – Hàng đầu',         2200000, '#9B59B6', 4, 20 FROM events WHERE title LIKE 'Mr. Siro Fan Concert%' LIMIT 1;
INSERT IGNORE INTO seat_zones (event_id, name, price, color, total_rows, total_cols)
SELECT id, 'Hạng A',                 1500000, '#3498DB', 6, 25 FROM events WHERE title LIKE 'Mr. Siro Fan Concert%' LIMIT 1;
INSERT IGNORE INTO seat_zones (event_id, name, price, color, total_rows, total_cols)
SELECT id, 'Hạng B – Tiêu chuẩn',     800000, '#4ECDC4', 8, 30 FROM events WHERE title LIKE 'Mr. Siro Fan Concert%' LIMIT 1;

-- GAI Home Concert (event 3)
INSERT IGNORE INTO seat_zones (event_id, name, price, color, total_rows, total_cols)
SELECT id, 'PREMIUM',               2000000, '#E74C3C', 3, 15 FROM events WHERE title LIKE 'GAI Home Concert%' LIMIT 1;
INSERT IGNORE INTO seat_zones (event_id, name, price, color, total_rows, total_cols)
SELECT id, 'STANDARD',             1000000, '#2ECC71', 6, 25 FROM events WHERE title LIKE 'GAI Home Concert%' LIMIT 1;

-- Bùi Công Nam Hà Nội (event 4)
INSERT IGNORE INTO seat_zones (event_id, name, price, color, total_rows, total_cols)
SELECT id, 'PLATINUM',             3000000, '#8E44AD', 3, 20 FROM events WHERE title LIKE 'Bùi Công Nam%Hà Nội%' LIMIT 1;
INSERT IGNORE INTO seat_zones (event_id, name, price, color, total_rows, total_cols)
SELECT id, 'VIP GOLD',             1800000, '#F39C12', 5, 28 FROM events WHERE title LIKE 'Bùi Công Nam%Hà Nội%' LIMIT 1;
INSERT IGNORE INTO seat_zones (event_id, name, price, color, total_rows, total_cols)
SELECT id, 'STANDARD',               900000, '#1ABC9C', 8, 35 FROM events WHERE title LIKE 'Bùi Công Nam%Hà Nội%' LIMIT 1;

-- BADASS CITY (event 6)
INSERT IGNORE INTO seat_zones (event_id, name, price, color, total_rows, total_cols)
SELECT id, 'VIP ZONE',             1200000, '#FF4757', 3, 25 FROM events WHERE title LIKE 'BADASS CITY%' LIMIT 1;
INSERT IGNORE INTO seat_zones (event_id, name, price, color, total_rows, total_cols)
SELECT id, 'STANDING – General',     500000, '#FFA502', 2, 50 FROM events WHERE title LIKE 'BADASS CITY%' LIMIT 1;
INSERT IGNORE INTO seat_zones (event_id, name, price, color, total_rows, total_cols)
SELECT id, 'BLEACHER – Khán đài',    250000, '#2ED573', 6, 30 FROM events WHERE title LIKE 'BADASS CITY%' LIMIT 1;

-- IDECAF Tấm Cám (event 9)
INSERT IGNORE INTO seat_zones (event_id, name, price, color, total_rows, total_cols)
SELECT id, 'VIP – Hàng A–C',        600000, '#6C5CE7', 3, 18 FROM events WHERE title LIKE '%IDECAF%Tấm Cám%' LIMIT 1;
INSERT IGNORE INTO seat_zones (event_id, name, price, color, total_rows, total_cols)
SELECT id, 'Hạng Nhất – Hàng D–H', 400000, '#00B894', 5, 18 FROM events WHERE title LIKE '%IDECAF%Tấm Cám%' LIMIT 1;
INSERT IGNORE INTO seat_zones (event_id, name, price, color, total_rows, total_cols)
SELECT id, 'Phổ thông',             250000, '#FDCB6E', 7, 18 FROM events WHERE title LIKE '%IDECAF%Tấm Cám%' LIMIT 1;

-- Vietnam AI Summit (event 17)
INSERT IGNORE INTO seat_zones (event_id, name, price, color, total_rows, total_cols)
SELECT id, 'CONFERENCE PASS – Full',  5000000, '#2D3436', 5, 25 FROM events WHERE title LIKE '%Vietnam AI Summit%' LIMIT 1;
INSERT IGNORE INTO seat_zones (event_id, name, price, color, total_rows, total_cols)
SELECT id, 'DAY PASS – 1 ngày',      2500000, '#636E72', 8, 30 FROM events WHERE title LIKE '%Vietnam AI Summit%' LIMIT 1;

-- =============================================
-- DEFAULT SEAT ZONES — for events missing zones
-- Uses temp table so all 3 tiers are inserted
-- consistently based on events at time of seed
-- =============================================
DROP TEMPORARY TABLE IF EXISTS tmp_events_no_zones;
CREATE TEMPORARY TABLE tmp_events_no_zones AS
  SELECT e.id, e.category FROM events e
  WHERE NOT EXISTS (SELECT 1 FROM seat_zones sz WHERE sz.event_id = e.id);

INSERT INTO seat_zones (event_id, name, price, color, total_rows, total_cols)
SELECT id,
  'VIP',
  CASE category
    WHEN 'music'    THEN 1500000
    WHEN 'stage'    THEN  800000
    WHEN 'sports'   THEN 1200000
    WHEN 'workshop' THEN 2000000
    ELSE                 1000000
  END,
  '#F59E0B', 5, 10
FROM tmp_events_no_zones;

INSERT INTO seat_zones (event_id, name, price, color, total_rows, total_cols)
SELECT id,
  'Hạng A',
  CASE category
    WHEN 'music'    THEN  800000
    WHEN 'stage'    THEN  500000
    WHEN 'sports'   THEN  700000
    WHEN 'workshop' THEN 1200000
    ELSE                  600000
  END,
  '#3B82F6', 8, 15
FROM tmp_events_no_zones;

INSERT INTO seat_zones (event_id, name, price, color, total_rows, total_cols)
SELECT id,
  'Hạng B',
  CASE category
    WHEN 'music'    THEN  400000
    WHEN 'stage'    THEN  250000
    WHEN 'sports'   THEN  350000
    WHEN 'workshop' THEN  600000
    ELSE                  300000
  END,
  '#10B981', 10, 20
FROM tmp_events_no_zones;

DROP TEMPORARY TABLE IF EXISTS tmp_events_no_zones;

-- =============================================
-- SEATS — auto-generate from every seeded zone matrix
-- =============================================
DROP TEMPORARY TABLE IF EXISTS tmp_row_seq;
CREATE TEMPORARY TABLE tmp_row_seq (n INT PRIMARY KEY);
INSERT INTO tmp_row_seq (n) VALUES
  (1),(2),(3),(4),(5),(6),(7),(8),(9),(10),
  (11),(12),(13),(14),(15),(16),(17),(18),(19),(20),
  (21),(22),(23),(24),(25),(26);

DROP TEMPORARY TABLE IF EXISTS tmp_col_seq;
CREATE TEMPORARY TABLE tmp_col_seq (n INT PRIMARY KEY);
INSERT INTO tmp_col_seq (n) VALUES
  (1),(2),(3),(4),(5),(6),(7),(8),(9),(10),
  (11),(12),(13),(14),(15),(16),(17),(18),(19),(20),
  (21),(22),(23),(24),(25),(26),(27),(28),(29),(30),
  (31),(32),(33),(34),(35),(36),(37),(38),(39),(40),
  (41),(42),(43),(44),(45),(46),(47),(48),(49),(50);

INSERT IGNORE INTO seats (zone_id, row_label, col_number)
SELECT
  sz.id,
  CHAR(64 + r.n) AS row_label,
  c.n AS col_number
FROM seat_zones sz
JOIN tmp_row_seq r ON r.n <= sz.total_rows
JOIN tmp_col_seq c ON c.n <= sz.total_cols;

DROP TEMPORARY TABLE IF EXISTS tmp_row_seq;
DROP TEMPORARY TABLE IF EXISTS tmp_col_seq;

-- =============================================
-- PROMO CODES
-- =============================================
INSERT IGNORE INTO promo_codes
  (code, discount_type, discount_value, max_uses, event_id, min_amount, starts_at, expires_at, is_active)
VALUES
  -- Chào mừng thành viên mới
  ('WELCOME10',   'percent', 10,  500, NULL,    500000, '2026-01-01 00:00:00', '2026-12-31 23:59:59', TRUE),
  -- Tháng 5 - mùa concert
  ('MAY2026',     'percent', 15,  200, NULL,  1000000, '2026-05-01 00:00:00', '2026-05-31 23:59:59', TRUE),
  -- EXO exclusive
  ('EXOVIET',     'fixed',   300000,  100, NULL, 2000000, '2026-04-01 00:00:00', '2026-04-30 23:59:59', TRUE),
  -- Summer voucher
  ('SUMMER150K',  'fixed',   150000,  300, NULL,    800000, '2026-06-01 00:00:00', '2026-08-31 23:59:59', TRUE),
  -- Early bird hội thảo AI
  ('AIEARLY',     'percent', 20,   50, NULL,  2500000, '2026-04-01 00:00:00', '2026-05-10 23:59:59', TRUE),
  -- Hip-hop fans
  ('HIPHOP50K',   'fixed',    50000,  400, NULL,    250000, '2026-04-15 00:00:00', '2026-05-03 23:59:59', TRUE);


-- =============================================
-- POSTS / NEWSROOM
-- =============================================
INSERT INTO posts (
  slug, title, excerpt, body, quote, author_name, category, cover_url,
  read_time_min, featured, status, view_count, published_at, created_by
)
VALUES
  ('n1', 'EXO PLANET #6 "EXhOrizon" — đêm diễn lịch sử tại TP.HCM sau 7 năm vắng bóng', 'EXO chính thức trở lại Việt Nam với tour "EXhOrizon" — vòng lưu diễn thế giới đầu tiên kể từ 2019. Đêm 26/04 tại Sân vận động Phú Thọ hứa hẹn là sự kiện K-pop lớn nhất năm với setlist 25 ca khúc và sân khấu LED 800m².', CAST('["Được công bố bất ngờ vào đêm 14 tháng 3 qua một tweet ngắn từ SM Entertainment, thông tin về đêm diễn tại TP.HCM lập tức khiến cộng đồng EXO-L Việt Nam \\"đứng tim\\". Chỉ trong 6 giờ đầu, hashtag #EXOVIETNAM đã trending tại 12 tỉnh thành và lượt đăng ký theo dõi sự kiện trên TicketRush vượt mốc 80.000 — con số chưa từng có trong lịch sử nền tảng.","Setlist dự kiến bao gồm 25 ca khúc trải dài suốt 12 năm sự nghiệp, từ những bản hit kinh điển MAMA, Growl, Call Me Baby cho đến Wolf, Monster, Ko Ko Bop. Đặc biệt, đây là lần đầu tiên Lay Zhang (thành viên người Trung Quốc) tái hợp cùng nhóm trên sân khấu ngoài Trung Quốc sau hơn 8 năm, xác nhận được đại diện SM Entertainment vào chiều 20/04.","Về sân khấu, ekip Dream Maker Entertainment tiết lộ hệ thống LED cong ôm toàn sân với hơn 800m² màn hình, kết hợp công nghệ hologram và laser đồng bộ theo từng nhịp bài — được lắp đặt bởi đội ngũ đã thực hiện concert BTS \\"Map of the Soul: ON:E\\" và Coldplay \\"Music of the Spheres\\". Toàn bộ thiết bị vận chuyển từ Seoul bằng 3 chuyến bay chở hàng.","Vé chia thành 4 phân khu: FAN PIT (900.000đ), SILVER – Khu B (1.500.000đ), GOLD – Khu A (2.800.000đ) và DIAMOND – Sân khấu (4.500.000đ). Theo ghi nhận của TicketRush, hạng DIAMOND đã sold out trong 11 phút sau khi mở bán, GOLD trong 34 phút. Hiện chỉ còn một số ghế SILVER và FAN PIT.","Nhìn rộng ra, sự kiện lần này đánh dấu bước ngoặt lớn cho thị trường concert quốc tế tại Việt Nam: đây là lần đầu tiên một nhóm nhạc K-pop hạng A chọn TP.HCM làm điểm dừng duy nhất tại Đông Nam Á, thay vì Bangkok hay Singapore như thông lệ. Tín hiệu này cho thấy Việt Nam đang dần được công nhận như một thị trường âm nhạc trực tiếp đáng đầu tư."]' AS JSON), 'Đây là lần đầu tiên chúng tôi chọn Việt Nam làm điểm dừng duy nhất tại Đông Nam Á. EXO-L Việt Nam — chúng tôi không quên các bạn.', 'Minh Thư', 'Showbiz', 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=1200&q=80', 5, TRUE, 'published', 18420, '2026-04-25 09:00:00', (SELECT id FROM users WHERE email = 'admin@ticketrush.vn' LIMIT 1)),
  ('n6', 'Sơn Tùng M-TP công bố "SKY TOUR" World Tour 2026 — lần đầu tiên ra nước ngoài', 'Đêm 20/04, Sơn Tùng M-TP bất ngờ công bố world tour đầu tiên trong sự nghiệp: "SKY TOUR 2026" với các điểm dừng tại Hà Nội, Seoul, Tokyo và London. Đêm mở màn tại Sân vận động Mỹ Đình ngày 22/08 với 40.000 chỗ ngồi.', CAST('["Đúng nửa đêm 20/04, trang Instagram @sontungmtp đăng một video teaser 30 giây với hình ảnh bầu trời mở ra, kèm dòng chú thích duy nhất: \\"SKY TOUR 2026. WORLD. 22.08 — Hanoi. See you there.\\" Trong 30 phút, video đạt hơn 2 triệu lượt xem — phá kỷ lục cá nhân của chính anh.","Theo thông tin từ nhãn hàng M-TP Entertainment, tour diễn gồm 5 điểm dừng: Hà Nội (22/08), TP.HCM (30/08), Seoul (15/09), Tokyo (28/09) và London (12/10). Đây là lần đầu tiên trong lịch sử âm nhạc Việt Nam, một nghệ sĩ solo Việt tổ chức concert tại các trung tâm âm nhạc lớn của thế giới.","\\"SKY TOUR\\" được biết là chủ đề của album phòng thu thứ 6 của Sơn Tùng, dự kiến phát hành trước ngày khai tour 1 tháng. Concept âm nhạc theo đội ngũ sản xuất mô tả là \\"sự pha trộn giữa pop Á, R&B hiện đại và âm thanh điện tử — hướng ra thế giới nhưng giữ hồn Việt\\".","Tại Hà Nội, concert diễn ra tại Sân vận động Mỹ Đình với 40.000 chỗ ngồi — quy mô lớn nhất một nghệ sĩ Việt từng thực hiện tại đây. Vé mở bán từ ngày 01/05 theo 5 phân khu, từ 600.000đ đến 3.500.000đ. Đặc biệt 500 vé \\"SKY PASS\\" kèm meet & greet sẽ bán đấu giá 100% lợi nhuận cho quỹ học bổng trẻ em.","Sự công bố của Sơn Tùng không chỉ là tin vui với fan mà còn là tín hiệu quan trọng: V-pop đang vươn ra thế giới theo con đường khác K-pop — không qua hệ thống idol factory, mà qua cá nhân hóa nghệ sĩ và câu chuyện âm nhạc chân thực."]' AS JSON), 'Tôi muốn chứng minh rằng âm nhạc Việt Nam có chỗ đứng trên bất kỳ sân khấu nào trên thế giới.', 'Thanh Long', 'Showbiz', 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=1200&q=80', 6, TRUE, 'published', 15380, '2026-04-21 09:00:00', (SELECT id FROM users WHERE email = 'admin@ticketrush.vn' LIMIT 1)),
  ('n8', 'Phỏng vấn Đen Vâu: "Rap không phải để nổi tiếng — đó là cách tôi đặt câu hỏi với thế giới"', 'Trước thềm concert "Cháy Cùng" tại Hà Nội (12/07), TicketRush Newsroom gặp Nguyễn Đức Cường — nghệ sĩ đứng sau biệt danh Đen Vâu — để nói về nhạc, xã hội và lý do anh không bao giờ viết nhạc "để bán".', CAST('["Chúng tôi gặp Đen Vâu tại quán cà phê quen thuộc của anh ở Hoàng Mai — nơi anh nói anh thường viết nhạc và quan sát người qua đường. Không ekip, không PR, không máy quay. Chỉ một chiếc máy ghi âm và hai ly cà phê. \\"Tôi thích nói chuyện thế này hơn\\" — anh nói, rót thêm đường vào ly.","\\"Nhiều người nghĩ rap là thể loại của giới trẻ, của đường phố, của sự nổi loạn. Nhưng với tôi, rap chỉ đơn giản là cách tôi đặt câu hỏi lớn hơn thể xác mình\\" — anh bắt đầu khi tôi hỏi về album mới. Album thứ 5 của anh, chưa có tên chính thức, được mô tả là \\"đen hơn, chậm hơn, và ít dễ nghe hơn\\". Đó là chủ ý.","\\"Tôi không muốn mọi người stream nhạc tôi khi tập gym hay lúc rửa chén. Tôi muốn họ ngồi xuống, đeo tai nghe, và nghĩ. Nếu không ai nghĩ gì sau khi nghe — tôi đã thất bại, dù bài đó có 50 triệu views.\\" Anh nói điều này không có vẻ kiêu ngạo, chỉ như một tuyên ngôn đã được nung nấu từ lâu.","Về concert \\"Cháy Cùng\\", anh tiết lộ đây sẽ là đêm diễn khác nhất trong sự nghiệp: không màn hình LED lớn, không laser, không hype man. \\"Chỉ có âm nhạc, ánh đèn nhỏ và khoảng 3.000 người nghe thật sự. Tôi muốn thấy mặt người ta khi họ nghe nhạc của mình — không phải thấy màn hình điện thoại họ giơ lên.\\"","Câu hỏi cuối: anh sợ gì nhất trong sự nghiệp? Anh dừng lại khá lâu. \\"Sợ một ngày mình viết một bài hay nhưng không còn gì để nói nữa. Sợ nhạc của mình trở nên an toàn.\\" Rồi anh cười. \\"Chưa xảy ra. Đời còn nhiều thứ cần hỏi lắm.\\""]' AS JSON), 'Tôi không muốn mọi người stream nhạc tôi khi tập gym. Tôi muốn họ ngồi xuống và nghĩ.', 'Phương Anh', 'Phỏng vấn', 'https://images.unsplash.com/photo-1571266028243-d220bc562f7c?w=1200&q=80', 7, FALSE, 'published', 11240, '2026-04-19 09:00:00', (SELECT id FROM users WHERE email = 'admin@ticketrush.vn' LIMIT 1)),
  ('n3', 'BADASS CITY 2026 — khi Sài Gòn thật sự là thủ đô hip-hop Đông Nam Á', 'Lễ hội hip-hop lớn nhất miền Nam trở lại lần thứ 4 với quy mô nâng cấp hoàn toàn: 3 sân khấu, 30+ nghệ sĩ và lần đầu tiên có headliner quốc tế. Ngày 02/05, Công viên bờ sông Sài Gòn sẽ là tâm chấn.', CAST('["BADASS CITY 2026 đánh dấu lần thứ 4 lễ hội hip-hop này được tổ chức tại TP.HCM, nhưng lần này quy mô được nâng cấp toàn diện: 3 sân khấu hoạt động song song từ 16:00 đến 24:00, thay vì 1 sân khấu duy nhất như những năm trước. Tổng diện tích khu vực sự kiện hơn 15.000m² — tương đương 2 sân bóng đá.","Lineup năm nay quy tụ gần như đầy đủ \\"pantheon\\" hip-hop Việt: Wowy đảm nhận vai trò closing act sau gần 20 năm cầm mic, Suboi mở màn với bộ set electronic hip-hop mới hoàn toàn, MCK và Tlinh xuất hiện cùng nhau sau 2 năm ít hoạt động. Obito, Hứa Kim Tuyền, Yuk Trax, Lil Wuyn, Wxrdie, Andiez cũng có mặt trong lineup xác nhận.","Điểm mới đáng chú ý nhất: năm nay BADASS CITY lần đầu tiên có headliner nước ngoài. Nhóm rapper/producer người Hàn Quốc Balming Tiger (đã cộng tác với RM của BTS) và DJ/producer Mndsgn từ Los Angeles sẽ mang đến màn giao thoa văn hóa đặc biệt. Đây là minh chứng cho việc BADASS CITY đang vươn tầm quốc tế.","Ngoài âm nhạc, lễ hội năm nay còn có BAZAAR — khu mua sắm chuyên biệt với hơn 60 gian hàng sneaker, streetwear và thủ công nghệ sĩ. UNDERGROUND STAGE dành riêng cho các pha battle freestyle và showcase của các nghệ sĩ chưa được biết đến rộng rãi — đây là nơi nhiều ngôi sao hip-hop Việt hiện tại từng bước đầu xuất hiện.","Vé theo 3 tier: BLEACHER 250.000đ, STANDING General 500.000đ và VIP ZONE 1.200.000đ (khu riêng có bàn, đồ uống free-flow). Lưu ý đây là sự kiện ngoài trời — ban tổ chức khuyến khích giày vải, áo mưa mỏng và tránh đồ da lộn."]' AS JSON), 'Hip-hop không còn là underground ở Việt Nam nữa. Đây không phải tiến bộ — đây là điều đương nhiên phải xảy ra.', 'Hoàng Việt', 'Sự kiện', 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=1200&q=80', 5, FALSE, 'published', 9860, '2026-04-22 09:00:00', (SELECT id FROM users WHERE email = 'admin@ticketrush.vn' LIMIT 1)),
  ('n4', 'IDECAF "Tấm Cám Đại Chiến" — cổ tích được kể lại đúng thời đại, theo cách đau nhất', 'NSND Thành Lộc dàn dựng phiên bản "Tấm Cám" năm 2026 với Cám là influencer triệu followers và Bụt là AI assistant. Hài kịch, nhưng chạm thật sự vào những câu hỏi không dễ trả lời của thế hệ mạng xã hội.', CAST('["NSND Thành Lộc kể rằng ý tưởng về \\"Tấm Cám Đại Chiến\\" đến từ một câu hỏi đùa của con trai ông: \\"Ba ơi, nếu hôm nay Tấm và Cám có điện thoại thì chuyện gì xảy ra?\\" Câu hỏi đó ám ảnh ông suốt 3 tháng trước khi ông quyết định biến nó thành vở kịch. \\"Câu trả lời thú vị hơn tôi tưởng nhiều\\" — ông nói trong buổi họp báo ra mắt.","Phiên bản 2026 giữ nguyên xương sống cốt truyện nhưng cài cắm những chi tiết hiện đại một cách thông minh: Cám trở thành influencer với 5 triệu followers, livestream bán hàng mỗi ngày. Hoàng tử là CEO startup công nghệ đang IPO. Mẹ Cám — đương nhiên do NSND Thành Lộc đóng — là bà mẹ điển hình của thế hệ \\"helicopter parent\\" thời 4.0. Và Bụt xuất hiện dưới dạng AI assistant, giọng do Trấn Thành dubbing, hiện thị qua hologram.","Điều làm vở kịch không chỉ là hài kịch là lớp ý nghĩa thứ hai: khi Cám trở thành kẻ phản diện được thuật toán trao quyền, và Tấm là người tốt bị shadowban vì không chịu drama — vở diễn đang nói về một vấn đề rất thật của 2026. \\"Chúng tôi không cố gắng dạy đạo đức. Chúng tôi chỉ đặt gương trước mặt người xem\\" — NSND Thành Lộc giải thích.","Dàn diễn viên gồm 3 thế hệ nghệ sĩ IDECAF, với Kiều Trinh vai Tấm và Nhật Hào vai Cám. Vũ đạo do choreographer Quang Đăng thiết kế — 4 màn múa bùng nổ xen kẽ kịch nói mang lại nhịp điệu không cho phép khán giả ngồi yên. Vở diễn dài 2 giờ 20 phút với 1 intermission.","Vé 3 hạng: VIP 600.000đ (hàng A–C), Hạng Nhất 400.000đ (hàng D–H), Phổ thông 250.000đ. Suất diễn từ Thứ Năm đến Chủ Nhật, 19:30. Suất Chủ Nhật đặc biệt có Q&A với ekip sau vở diễn. Vé hạng VIP các suất cuối tuần đã gần kín."]' AS JSON), 'Tấm Cám không chỉ là cổ tích. Đó là câu chuyện về việc người tốt phải chịu thiệt bao lâu trước khi được đền đáp — và liệu thuật toán có thay đổi điều đó không.', 'Thu Hà', 'Sân khấu', 'https://images.unsplash.com/photo-1503095396549-807759245b35?w=1200&q=80', 6, FALSE, 'published', 8740, '2026-04-20 09:00:00', (SELECT id FROM users WHERE email = 'admin@ticketrush.vn' LIMIT 1)),
  ('n7', 'Mỹ Tâm "Tâm 9": 25 năm và vẫn hát như lần đầu tiên', 'Kỷ niệm 25 năm sự nghiệp, Mỹ Tâm không tổ chức gala lộng lẫy. Cô chọn Đà Nẵng — thành phố quê hương — và một setlist hoàn toàn không có hit mới. Đây là câu chuyện về tại sao.', CAST('["Khi đội ngũ ekip đề xuất tổ chức concert kỷ niệm 25 năm tại Hà Nội hoặc TP.HCM với 15.000 chỗ ngồi, Mỹ Tâm từ chối. Cô chọn Nhà thi đấu Tiên Sơn tại Đà Nẵng — thành phố nơi cô sinh ra và lớn lên — với sức chứa 5.000 người. \\"Tôi không muốn kỷ niệm 25 năm bằng một sự kiện. Tôi muốn kỷ niệm nó bằng một đêm hát thật sự\\" — cô chia sẻ trong video công bố.","\\"Tâm 9\\" là tên album thứ 9 trong sự nghiệp của Mỹ Tâm, nhưng tên concert lại mang thêm ý nghĩa khác: \\"9\\" trong tiếng Quảng Nam quê cô có nghĩa là \\"cửu\\" — chín năm, chín lần trở đi trở lại. Setlist concert gồm 24 bài hát được chính fan bình chọn qua khảo sát trực tuyến — không phải ekip quyết định, không phải ban tổ chức. Fan quyết định.","Điều đặc biệt: toàn bộ setlist là những bài đã ra đời trước năm 2020. \\"Nhiều người nói tôi nên hát nhạc mới để ''trẻ hóa hình ảnh''. Nhưng tôi nghĩ ngược lại — những bài hát cũ mới thật sự là di sản. Đó là những gì còn lại sau 25 năm.\\" Các bài như Đừng Nói Xa Nhau, Đừng Hỏi Em, Hãy Đến Với Em, Ước Gì vẫn gây ra những phản ứng cảm xúc mà không bài hit mới nào có thể thay thế.","Ban nhạc sẽ gồm 12 nhạc công, trong đó có violinist Hoàng Rob — người đã cộng tác với Mỹ Tâm từ những ngày đầu sự nghiệp. Không DJ, không backing track điện tử. \\"Tôi muốn người nghe thấy nhạc thở. Thấy từng nốt được tạo ra ngay lúc đó, không phải phát lại.\\" Concert không có quảng cáo tài trợ, không có MC mở màn.","Vé đang bán trên TicketRush với 3 hạng: Platinum (2.000.000đ), VIP Gold (1.200.000đ) và Standard (600.000đ). Đây là một trong những concert hiếm hoi giá vé cao nhất không phải của nghệ sĩ nước ngoài tại Đà Nẵng — và vẫn sold out trong 3 ngày đầu mở bán."]' AS JSON), 'Những bài hát cũ mới thật sự là di sản. Đó là những gì còn lại sau 25 năm — không phải TikTok views, không phải chart position.', 'Lan Anh', 'Showbiz', 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=1200&q=80', 6, FALSE, 'published', 8350, '2026-04-17 09:00:00', (SELECT id FROM users WHERE email = 'admin@ticketrush.vn' LIMIT 1)),
  ('n9', 'Hậu trường EXO "EXhOrizon": 3 đêm, 120 nhân công, 2,5 tấn thiết bị bay từ Seoul', 'Trước khi 25.000 khán giả bước vào Sân vận động Phú Thọ tối 26/04, một đội ngũ 120 người đã làm việc 72 giờ liên tục để dựng sân khấu. Đây là câu chuyện của họ.', CAST('["Lúc 3 giờ sáng ngày 23/04, chiếc xe tải đầu tiên trong chuỗi 14 xe tải lăn vào cổng Sân vận động Phú Thọ. Bên trong: 2,5 tấn thiết bị gồm khung sân khấu, hệ thống LED, dàn âm thanh L-Acoustics K1 và toàn bộ phụ kiện kỹ thuật đặt cọc tại Seoul 3 tuần trước. Từ khoảnh khắc đó, đồng hồ đếm ngược bắt đầu.","Kỹ thuật trưởng Kim Hyun-soo, người đã thực hiện sân khấu cho 6 tour diễn quốc tế của EXO, nói qua phiên dịch: \\"Mỗi sân vận động có cấu trúc riêng — sàn, hệ thống treo, tải trọng trần đều khác nhau. Sân Phú Thọ có những điểm thú vị cần giải quyết, nhưng đội ngũ Việt Nam làm việc nhanh hơn tôi mong đợi.\\"","Ekip gồm 120 người, trong đó 40 kỹ sư từ Seoul và 80 nhân công từ Việt Nam — phần lớn được thuê từ các công ty tổ chức sự kiện địa phương đã có kinh nghiệm với concert quốc tế. Ngôn ngữ chính là... màu sắc và ký hiệu trên bản vẽ kỹ thuật. \\"Không cần nói cùng ngôn ngữ khi mọi người đều biết công việc của mình\\" — một nhân công Việt Nam nói.","Phần phức tạp nhất là hệ thống LED cong 800m² — không phải màn hình phẳng thông thường mà là các module uốn cong theo hình parabol để ôm sát khán giả theo góc 270 độ. Mỗi module có trọng lượng 45kg và cần 2 người lắp, căn chỉnh góc độ với sai số không quá 0,5 độ. Tổng cộng hơn 180 module.","Đến chiều 25/04, sân khấu đã thành hình. Sound check đầu tiên lúc 18:00 với toàn bộ dàn âm thanh — tiếng nhạc vang ra khỏi sân vận động khiến hàng trăm fan đang chờ bên ngoài bắt đầu... khóc. Đó là khoảnh khắc mà ekip 120 người nhìn nhau, không nói gì. Họ biết mình đã làm được."]' AS JSON), 'Không cần nói cùng ngôn ngữ khi mọi người đều biết công việc của mình. Đó là ngôn ngữ của những người làm show.', 'Tuấn Khoa', 'Hậu trường', 'https://images.unsplash.com/photo-1540039155733-5bb30b4f8a61?w=1200&q=80', 7, FALSE, 'published', 6920, '2026-04-24 09:00:00', (SELECT id FROM users WHERE email = 'admin@ticketrush.vn' LIMIT 1)),
  ('n10', 'Bình luận Vũ. "Vũ-Verse 2026" tại Hà Nội: âm nhạc như một cuộc hành hương', 'Cung Thể thao Quần Ngựa tối 13/06 không phải là một venue concert thông thường — nó trở thành một không gian thánh đường của những người đã lớn lên cùng âm nhạc Vũ. Đây là bài viết đầy đủ.', CAST('["Vũ. bước ra sân khấu lúc 20:07 — không có hype video, không có màn ra mắt rầm rộ. Chỉ có đèn vàng ấm, một cây guitar và 2.000 người im lặng hoàn toàn. Bài đầu tiên là \\"Về Nghe Nhạc Đi\\" — bản nhạc 6 năm tuổi mà đến hôm nay nghe vẫn thấy mới như lần đầu.","Concert được thiết kế theo dạng thrust stage — sân khấu ăn sâu vào giữa khán giả, không có khoảng cách rõ ràng giữa nghệ sĩ và người nghe. Quyết định đó không phải ngẫu nhiên: \\"Tôi không muốn mọi người nhìn tôi. Tôi muốn chúng ta cùng nhìn vào một thứ gì đó\\" — Vũ. nói sau bài thứ ba.","Setlist gồm 21 bài, không theo thứ tự album mà được sắp xếp theo cung bậc cảm xúc — từ buồn nhẹ đến nặng nề đến giải thoát. Phần giữa concert, anh hát liên tục 4 bài slow không nghỉ, không nói chuyện với khán giả. Không ai nói chuyện. Không ai quay TikTok. 2.000 người ngồi với nhạc.","Những bài mới từ Vũ-Verse — chưa được phát hành chính thức — được tiếp nhận với sự chú ý kỳ lạ của người lần đầu nghe. Không có màn \\"hát theo\\" quen thuộc, chỉ có những cái đầu nghiêng nhẹ, những người nhắm mắt. \\"Tôi thích khi khán giả không biết bài — lúc đó họ thực sự nghe, không phải hát theo\\" — anh giải thích sau concert.","Điểm trừ duy nhất: âm thanh ở vài khu vực phía sau có sự phản xạ không tốt từ mái nhà thi đấu, khiến phần mid-treble hơi mờ. Đây là vấn đề cố hữu của Cung Quần Ngựa và khó tránh khỏi. Nhưng với một concert dựa nhiều vào acoustic guitar và giọng hát — nó không phá hỏng trải nghiệm tổng thể. Điểm tổng: 9.2/10."]' AS JSON), 'Tôi không muốn mọi người nhìn tôi. Tôi muốn chúng ta cùng nhìn vào một thứ gì đó.', 'Minh Thư', 'Bình luận', 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=1200&q=80', 8, FALSE, 'published', 6480, '2026-06-14 09:00:00', (SELECT id FROM users WHERE email = 'admin@ticketrush.vn' LIMIT 1)),
  ('n2', 'Bùi Công Nam "The Story" Livetour — hành trình kể chuyện bằng âm nhạc đầu tiên', 'Khác với hầu hết nghệ sĩ chọn TP.HCM làm điểm xuất phát, BCN mở tour từ Hà Nội. Sân khấu thrust stage, không backdrop lớn, không laser. Chỉ có anh và những câu chuyện chưa bao giờ kể thành lời.', CAST('["\\"The Story\\" không phải tên album — đó là lời hứa. Trong 4 năm, Bùi Công Nam tích lũy hơn 300 bài hát chưa phát hành. \\"The Story Livetour\\" là cách anh chọn để kể một phần trong số đó ra thế giới — không qua streaming platform, không qua MV, mà qua đêm nhạc trực tiếp. \\"Một số bài sẽ không bao giờ được phát hành chính thức. Đêm diễn là lần duy nhất người ta nghe được\\" — anh nói trong buổi họp báo.","Quyết định mở tour từ Hà Nội mang màu sắc cá nhân rõ ràng: \\"Hà Nội là nơi tôi bắt đầu làm nhạc. Không gian đó — những con phố cũ, những quán cà phê nơi tôi viết bài — nó vẫn còn trong mỗi ca khúc tôi viết. Tôi muốn kể câu chuyện đầu tiên ở nơi nó được sinh ra.\\"","Thiết kế sân khấu theo dạng thrust — ăn sâu vào khán giả, không có hàng rào ngăn cách. Ban nhạc gồm 6 nhạc công tất cả đều là bạn bè đã chơi cùng anh từ những năm đầu sự nghiệp. \\"Tôi không muốn thuê người. Tôi muốn những người ngồi sau mic đó hiểu tại sao những bài hát đó tồn tại.\\"","Setlist 22 bài, phần lớn từ các album \\"Ký Ức Trong Lành\\" và \\"Nhìn Về Nhau\\" — nhưng 4 bài mới hoàn toàn chưa phát hành sẽ xuất hiện lần đầu tại Hà Nội. Thông tin này không được công bố chính thức; khán giả sẽ phát hiện tại đêm diễn.","Vé hạng PLATINUM tại Hà Nội đã sold out trong ngày đầu mở bán. STANDARD còn một số lượng hạn chế. Concert tại TP.HCM (20/06) đang mở đăng ký ưu tiên."]' AS JSON), 'Một số bài sẽ không bao giờ được phát hành chính thức. Đêm diễn là lần duy nhất người ta nghe được.', 'Thanh Long', 'Showbiz', 'https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?w=1200&q=80', 5, FALSE, 'published', 5940, '2026-04-24 09:00:00', (SELECT id FROM users WHERE email = 'admin@ticketrush.vn' LIMIT 1)),
  ('n5', '7 mẹo săn vé concert không bị "cháy" trong mùa show bùng nổ 2026', 'Mùa concert 2026 đang đặt ra những thách thức mới cho người mua vé: tốc độ bán nhanh hơn, bot ngày càng tinh vi hơn. Đây là những chiến thuật từ các "fan cứng" và insider của ngành.', CAST('["Mùa concert 2026 đang tạo ra áp lực mua vé chưa từng có: vé EXO sold out trong 11 phút, BADASS CITY City VIP hết trong 2 giờ, Sơn Tùng SKY TOUR Hà Nội dự kiến bán xong trong buổi sáng đầu tiên. Không chuẩn bị kỹ, bạn sẽ trắng tay dù online đúng giờ.","Mẹo 1 — Bật thông báo đúng cách: Trong TicketRush, bấm \\"Theo dõi\\" sự kiện và bật cả push notification lẫn email reminder. Push notification tới tay bạn nhanh hơn email 2–5 phút — và trong cuộc đua mua vé, 5 phút là tất cả. Đặt thêm báo thức trước giờ mở bán 10 phút để sẵn sàng.\\n\\nMẹo 2 — Ví điện tử pre-loaded: Nạp sẵn tiền vào MoMo, VNPay hoặc ZaloPay trước ngày mở bán ít nhất 1 ngày. Tránh dùng thẻ quốc tế nếu có thể — bước xác thực OTP tốn thêm 30–45 giây, đủ để mất ghế trong trường hợp căng thẳng.","Mẹo 3 — Chiến lược ghế khôn ngoan: Với concert seated, đừng chỉ nhắm VIP. Hàng cuối của GOLD hoặc đầu SILVER thường cho góc nhìn tốt hơn VIP hàng A vì sân khấu thường cao. Với concert standing, vị trí bên trái/phải sân khấu ít chen hơn center nhưng vẫn gần nghệ sĩ — và có không gian di chuyển khi cần.\\n\\nMẹo 4 — Chiếc tab dự phòng: Mở song song 2 tab hoặc dùng 2 thiết bị khác nhau (điện thoại + máy tính). Nếu một tab bị lỗi hoặc session hết hạn, bạn có tab dự phòng.","Mẹo 5 — Đăng nhập trước 30 phút: Đừng đợi đến giờ mở bán mới đăng nhập. Server TicketRush có thể chậm nếu hàng trăm nghìn người cùng đăng nhập một lúc. Đăng nhập sẵn, điền thông tin thanh toán, chọn số ghế muốn mua — để khi vé mở bán chỉ cần nhấn \\"Thêm vào giỏ\\" và confirm.\\n\\nMẹo 6 — Group fan là nguồn thông tin tốt nhất: Các group Facebook như \\"Concert HN 2026\\", \\"Fan Concert Vietnam\\" thường có thông báo về flash sale, pre-sale link và cảnh báo vé giả sớm nhất. Join và bật thông báo.","Mẹo 7 — Nếu trắng tay vẫn còn cơ hội: TicketRush có tính năng \\"Hàng chờ\\" — khi người mua không thanh toán trong 10 phút, ghế tự động trả về hàng đợi. Những slot này xuất hiện không báo trước, thường vào buổi chiều ngày mở bán. Cài thông báo \\"Ghế vừa mở\\" và kiểm tra app thường xuyên trong 24 giờ đầu."]' AS JSON), 'Fan cứng không chờ vé. Fan cứng chuẩn bị từ 30 phút trước khi mở bán.', 'Phương Anh', 'Mẹo hay', 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1200&q=80', 5, FALSE, 'published', 5210, '2026-04-18 09:00:00', (SELECT id FROM users WHERE email = 'admin@ticketrush.vn' LIMIT 1))
ON DUPLICATE KEY UPDATE
  title = VALUES(title),
  excerpt = VALUES(excerpt),
  body = VALUES(body),
  quote = VALUES(quote),
  author_name = VALUES(author_name),
  category = VALUES(category),
  cover_url = VALUES(cover_url),
  read_time_min = VALUES(read_time_min),
  featured = VALUES(featured),
  status = VALUES(status),
  view_count = VALUES(view_count),
  published_at = VALUES(published_at);
