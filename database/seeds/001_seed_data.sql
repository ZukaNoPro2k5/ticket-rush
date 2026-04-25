-- =============================================
-- TicketRush — Real Seed Data
-- Source: ticketbox.vn (as of April 2026)
-- Run order: after all migration files (001–010)
-- =============================================

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

-- =============================================
-- SEAT ZONES
-- =============================================

-- EXO PLANET (event 1)
INSERT IGNORE INTO seat_zones (event_id, name, price, color, total_rows, total_cols)
SELECT id, 'DIAMOND – Sân khấu',     4_500_000, '#E8D5B7', 3, 20 FROM events WHERE title LIKE 'EXO PLANET%' LIMIT 1;
INSERT IGNORE INTO seat_zones (event_id, name, price, color, total_rows, total_cols)
SELECT id, 'GOLD – Khu A',           2_800_000, '#FFD700', 5, 30 FROM events WHERE title LIKE 'EXO PLANET%' LIMIT 1;
INSERT IGNORE INTO seat_zones (event_id, name, price, color, total_rows, total_cols)
SELECT id, 'SILVER – Khu B',         1_500_000, '#C0C0C0', 8, 40 FROM events WHERE title LIKE 'EXO PLANET%' LIMIT 1;
INSERT IGNORE INTO seat_zones (event_id, name, price, color, total_rows, total_cols)
SELECT id, 'FAN PIT – Đứng',           900_000, '#FF6B6B', 2, 60 FROM events WHERE title LIKE 'EXO PLANET%' LIMIT 1;

-- Mr. Siro Fan Concert (event 2)
INSERT IGNORE INTO seat_zones (event_id, name, price, color, total_rows, total_cols)
SELECT id, 'VIP – Hàng đầu',         2_200_000, '#9B59B6', 4, 20 FROM events WHERE title LIKE 'Mr. Siro Fan Concert%' LIMIT 1;
INSERT IGNORE INTO seat_zones (event_id, name, price, color, total_rows, total_cols)
SELECT id, 'Hạng A',                 1_500_000, '#3498DB', 6, 25 FROM events WHERE title LIKE 'Mr. Siro Fan Concert%' LIMIT 1;
INSERT IGNORE INTO seat_zones (event_id, name, price, color, total_rows, total_cols)
SELECT id, 'Hạng B – Tiêu chuẩn',     800_000, '#4ECDC4', 8, 30 FROM events WHERE title LIKE 'Mr. Siro Fan Concert%' LIMIT 1;

-- GAI Home Concert (event 3)
INSERT IGNORE INTO seat_zones (event_id, name, price, color, total_rows, total_cols)
SELECT id, 'PREMIUM',               2_000_000, '#E74C3C', 3, 15 FROM events WHERE title LIKE 'GAI Home Concert%' LIMIT 1;
INSERT IGNORE INTO seat_zones (event_id, name, price, color, total_rows, total_cols)
SELECT id, 'STANDARD',             1_000_000, '#2ECC71', 6, 25 FROM events WHERE title LIKE 'GAI Home Concert%' LIMIT 1;

-- Bùi Công Nam Hà Nội (event 4)
INSERT IGNORE INTO seat_zones (event_id, name, price, color, total_rows, total_cols)
SELECT id, 'PLATINUM',             3_000_000, '#8E44AD', 3, 20 FROM events WHERE title LIKE 'Bùi Công Nam%Hà Nội%' LIMIT 1;
INSERT IGNORE INTO seat_zones (event_id, name, price, color, total_rows, total_cols)
SELECT id, 'VIP GOLD',             1_800_000, '#F39C12', 5, 28 FROM events WHERE title LIKE 'Bùi Công Nam%Hà Nội%' LIMIT 1;
INSERT IGNORE INTO seat_zones (event_id, name, price, color, total_rows, total_cols)
SELECT id, 'STANDARD',               900_000, '#1ABC9C', 8, 35 FROM events WHERE title LIKE 'Bùi Công Nam%Hà Nội%' LIMIT 1;

-- BADASS CITY (event 6)
INSERT IGNORE INTO seat_zones (event_id, name, price, color, total_rows, total_cols)
SELECT id, 'VIP ZONE',             1_200_000, '#FF4757', 3, 25 FROM events WHERE title LIKE 'BADASS CITY%' LIMIT 1;
INSERT IGNORE INTO seat_zones (event_id, name, price, color, total_rows, total_cols)
SELECT id, 'STANDING – General',     500_000, '#FFA502', 2, 80 FROM events WHERE title LIKE 'BADASS CITY%' LIMIT 1;
INSERT IGNORE INTO seat_zones (event_id, name, price, color, total_rows, total_cols)
SELECT id, 'BLEACHER – Khán đài',    250_000, '#2ED573', 6, 30 FROM events WHERE title LIKE 'BADASS CITY%' LIMIT 1;

-- IDECAF Tấm Cám (event 9)
INSERT IGNORE INTO seat_zones (event_id, name, price, color, total_rows, total_cols)
SELECT id, 'VIP – Hàng A–C',        600_000, '#6C5CE7', 3, 18 FROM events WHERE title LIKE '%IDECAF%Tấm Cám%' LIMIT 1;
INSERT IGNORE INTO seat_zones (event_id, name, price, color, total_rows, total_cols)
SELECT id, 'Hạng Nhất – Hàng D–H', 400_000, '#00B894', 5, 18 FROM events WHERE title LIKE '%IDECAF%Tấm Cám%' LIMIT 1;
INSERT IGNORE INTO seat_zones (event_id, name, price, color, total_rows, total_cols)
SELECT id, 'Phổ thông',             250_000, '#FDCB6E', 7, 18 FROM events WHERE title LIKE '%IDECAF%Tấm Cám%' LIMIT 1;

-- Vietnam AI Summit (event 17)
INSERT IGNORE INTO seat_zones (event_id, name, price, color, total_rows, total_cols)
SELECT id, 'CONFERENCE PASS – Full',  5_000_000, '#2D3436', 5, 25 FROM events WHERE title LIKE '%Vietnam AI Summit%' LIMIT 1;
INSERT IGNORE INTO seat_zones (event_id, name, price, color, total_rows, total_cols)
SELECT id, 'DAY PASS – 1 ngày',      2_500_000, '#636E72', 8, 30 FROM events WHERE title LIKE '%Vietnam AI Summit%' LIMIT 1;

-- =============================================
-- SEATS — auto-generate cho EXO DIAMOND zone
-- =============================================
SET @exo_diamond = (
  SELECT sz.id FROM seat_zones sz
  JOIN events e ON e.id = sz.event_id
  WHERE e.title LIKE 'EXO PLANET%' AND sz.name LIKE 'DIAMOND%' LIMIT 1
);

INSERT IGNORE INTO seats (zone_id, row_label, col_number) VALUES
  (@exo_diamond,'A',1),(@exo_diamond,'A',2),(@exo_diamond,'A',3),(@exo_diamond,'A',4),(@exo_diamond,'A',5),
  (@exo_diamond,'A',6),(@exo_diamond,'A',7),(@exo_diamond,'A',8),(@exo_diamond,'A',9),(@exo_diamond,'A',10),
  (@exo_diamond,'A',11),(@exo_diamond,'A',12),(@exo_diamond,'A',13),(@exo_diamond,'A',14),(@exo_diamond,'A',15),
  (@exo_diamond,'A',16),(@exo_diamond,'A',17),(@exo_diamond,'A',18),(@exo_diamond,'A',19),(@exo_diamond,'A',20),
  (@exo_diamond,'B',1),(@exo_diamond,'B',2),(@exo_diamond,'B',3),(@exo_diamond,'B',4),(@exo_diamond,'B',5),
  (@exo_diamond,'B',6),(@exo_diamond,'B',7),(@exo_diamond,'B',8),(@exo_diamond,'B',9),(@exo_diamond,'B',10),
  (@exo_diamond,'B',11),(@exo_diamond,'B',12),(@exo_diamond,'B',13),(@exo_diamond,'B',14),(@exo_diamond,'B',15),
  (@exo_diamond,'B',16),(@exo_diamond,'B',17),(@exo_diamond,'B',18),(@exo_diamond,'B',19),(@exo_diamond,'B',20),
  (@exo_diamond,'C',1),(@exo_diamond,'C',2),(@exo_diamond,'C',3),(@exo_diamond,'C',4),(@exo_diamond,'C',5),
  (@exo_diamond,'C',6),(@exo_diamond,'C',7),(@exo_diamond,'C',8),(@exo_diamond,'C',9),(@exo_diamond,'C',10),
  (@exo_diamond,'C',11),(@exo_diamond,'C',12),(@exo_diamond,'C',13),(@exo_diamond,'C',14),(@exo_diamond,'C',15),
  (@exo_diamond,'C',16),(@exo_diamond,'C',17),(@exo_diamond,'C',18),(@exo_diamond,'C',19),(@exo_diamond,'C',20);

-- EXO GOLD zone
SET @exo_gold = (
  SELECT sz.id FROM seat_zones sz
  JOIN events e ON e.id = sz.event_id
  WHERE e.title LIKE 'EXO PLANET%' AND sz.name LIKE 'GOLD%' LIMIT 1
);

INSERT IGNORE INTO seats (zone_id, row_label, col_number) VALUES
  (@exo_gold,'A',1),(@exo_gold,'A',2),(@exo_gold,'A',3),(@exo_gold,'A',4),(@exo_gold,'A',5),
  (@exo_gold,'A',6),(@exo_gold,'A',7),(@exo_gold,'A',8),(@exo_gold,'A',9),(@exo_gold,'A',10),
  (@exo_gold,'A',11),(@exo_gold,'A',12),(@exo_gold,'A',13),(@exo_gold,'A',14),(@exo_gold,'A',15),
  (@exo_gold,'A',16),(@exo_gold,'A',17),(@exo_gold,'A',18),(@exo_gold,'A',19),(@exo_gold,'A',20),
  (@exo_gold,'A',21),(@exo_gold,'A',22),(@exo_gold,'A',23),(@exo_gold,'A',24),(@exo_gold,'A',25),
  (@exo_gold,'A',26),(@exo_gold,'A',27),(@exo_gold,'A',28),(@exo_gold,'A',29),(@exo_gold,'A',30),
  (@exo_gold,'B',1),(@exo_gold,'B',2),(@exo_gold,'B',3),(@exo_gold,'B',4),(@exo_gold,'B',5),
  (@exo_gold,'B',6),(@exo_gold,'B',7),(@exo_gold,'B',8),(@exo_gold,'B',9),(@exo_gold,'B',10),
  (@exo_gold,'B',11),(@exo_gold,'B',12),(@exo_gold,'B',13),(@exo_gold,'B',14),(@exo_gold,'B',15),
  (@exo_gold,'B',16),(@exo_gold,'B',17),(@exo_gold,'B',18),(@exo_gold,'B',19),(@exo_gold,'B',20),
  (@exo_gold,'B',21),(@exo_gold,'B',22),(@exo_gold,'B',23),(@exo_gold,'B',24),(@exo_gold,'B',25),
  (@exo_gold,'B',26),(@exo_gold,'B',27),(@exo_gold,'B',28),(@exo_gold,'B',29),(@exo_gold,'B',30);

-- IDECAF VIP zone
SET @idecaf_vip = (
  SELECT sz.id FROM seat_zones sz
  JOIN events e ON e.id = sz.event_id
  WHERE e.title LIKE '%IDECAF%Tấm Cám%' AND sz.name LIKE 'VIP%' LIMIT 1
);

INSERT IGNORE INTO seats (zone_id, row_label, col_number) VALUES
  (@idecaf_vip,'A',1),(@idecaf_vip,'A',2),(@idecaf_vip,'A',3),(@idecaf_vip,'A',4),(@idecaf_vip,'A',5),
  (@idecaf_vip,'A',6),(@idecaf_vip,'A',7),(@idecaf_vip,'A',8),(@idecaf_vip,'A',9),(@idecaf_vip,'A',10),
  (@idecaf_vip,'A',11),(@idecaf_vip,'A',12),(@idecaf_vip,'A',13),(@idecaf_vip,'A',14),(@idecaf_vip,'A',15),
  (@idecaf_vip,'A',16),(@idecaf_vip,'A',17),(@idecaf_vip,'A',18),
  (@idecaf_vip,'B',1),(@idecaf_vip,'B',2),(@idecaf_vip,'B',3),(@idecaf_vip,'B',4),(@idecaf_vip,'B',5),
  (@idecaf_vip,'B',6),(@idecaf_vip,'B',7),(@idecaf_vip,'B',8),(@idecaf_vip,'B',9),(@idecaf_vip,'B',10),
  (@idecaf_vip,'B',11),(@idecaf_vip,'B',12),(@idecaf_vip,'B',13),(@idecaf_vip,'B',14),(@idecaf_vip,'B',15),
  (@idecaf_vip,'B',16),(@idecaf_vip,'B',17),(@idecaf_vip,'B',18),
  (@idecaf_vip,'C',1),(@idecaf_vip,'C',2),(@idecaf_vip,'C',3),(@idecaf_vip,'C',4),(@idecaf_vip,'C',5),
  (@idecaf_vip,'C',6),(@idecaf_vip,'C',7),(@idecaf_vip,'C',8),(@idecaf_vip,'C',9),(@idecaf_vip,'C',10),
  (@idecaf_vip,'C',11),(@idecaf_vip,'C',12),(@idecaf_vip,'C',13),(@idecaf_vip,'C',14),(@idecaf_vip,'C',15),
  (@idecaf_vip,'C',16),(@idecaf_vip,'C',17),(@idecaf_vip,'C',18);

-- =============================================
-- PROMO CODES
-- =============================================
INSERT IGNORE INTO promo_codes
  (code, discount_type, discount_value, max_uses, event_id, min_amount, starts_at, expires_at, is_active)
VALUES
  -- Chào mừng thành viên mới
  ('WELCOME10',   'percent', 10,  500, NULL,    500_000, '2026-01-01 00:00:00', '2026-12-31 23:59:59', TRUE),
  -- Tháng 5 - mùa concert
  ('MAY2026',     'percent', 15,  200, NULL,  1_000_000, '2026-05-01 00:00:00', '2026-05-31 23:59:59', TRUE),
  -- EXO exclusive
  ('EXOVIET',     'fixed',   300_000,  100, NULL, 2_000_000, '2026-04-01 00:00:00', '2026-04-30 23:59:59', TRUE),
  -- Summer voucher
  ('SUMMER150K',  'fixed',   150_000,  300, NULL,    800_000, '2026-06-01 00:00:00', '2026-08-31 23:59:59', TRUE),
  -- Early bird hội thảo AI
  ('AIEARLY',     'percent', 20,   50, NULL,  2_500_000, '2026-04-01 00:00:00', '2026-05-10 23:59:59', TRUE),
  -- Hip-hop fans
  ('HIPHOP50K',   'fixed',    50_000,  400, NULL,    250_000, '2026-04-15 00:00:00', '2026-05-03 23:59:59', TRUE);

-- =============================================
-- REVIEWS (sample — user 2, 3, 4 on early events)
-- =============================================
INSERT IGNORE INTO reviews (user_id, event_id, rating, comment)
SELECT 2, e.id, 5, 'Đêm nhạc tuyệt vời! EXO biểu diễn hết mình, âm thanh ánh sáng hoàn hảo. Chắc chắn sẽ mua vé lần sau nếu họ quay lại.'
FROM events e WHERE e.title LIKE 'EXO PLANET%' LIMIT 1;

INSERT IGNORE INTO reviews (user_id, event_id, rating, comment)
SELECT 3, e.id, 5, 'Bùi Công Nam hát live cực hay, không cần auto-tune vẫn cực kỳ cảm xúc. Không khí buổi diễn rất ấm áp và chân thành.'
FROM events e WHERE e.title LIKE 'Bùi Công Nam%Hà Nội%' LIMIT 1;

INSERT IGNORE INTO reviews (user_id, event_id, rating, comment)
SELECT 4, e.id, 4, 'IDECAF dàn dựng rất sáng tạo, hài mà không nhạt. Dàn diễn viên chuyên nghiệp, trang phục bắt mắt. Chỉ tiếc ghế hơi chật.'
FROM events e WHERE e.title LIKE '%IDECAF%Tấm Cám%' LIMIT 1;

INSERT IGNORE INTO reviews (user_id, event_id, rating, comment)
SELECT 2, e.id, 5, 'BADASS CITY đỉnh cao! Wowy và Suboi biểu diễn liên tục không nghỉ, MCK rap live không cần beat. Festival hip-hop chất lượng quốc tế!'
FROM events e WHERE e.title LIKE 'BADASS CITY%' LIMIT 1;
