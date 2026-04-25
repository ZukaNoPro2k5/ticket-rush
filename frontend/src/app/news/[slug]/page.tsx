import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Clock, Share2, Bookmark } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { NEWS_ARTICLES as ALL_NEWS } from '@/data/uiConfig';

export function generateStaticParams() {
  return ALL_NEWS.map((a) => ({ slug: a.id }));
}

export default function ArticlePage({ params }: { params: { slug: string } }) {
  const article = ALL_NEWS.find((a) => a.id === params.slug);
  if (!article) notFound();

  const related = ALL_NEWS.filter((a) => a.id !== article.id && a.category === article.category).slice(0, 3);

  // Mock body paragraphs generated from excerpt for demo
  const paragraphs = [
    article.excerpt,
    'Trong một cuộc trò chuyện vừa diễn ra tại studio ở Quận 1, ê-kíp sản xuất chia sẻ rằng họ đã dành 6 tháng chỉ để lên ý tưởng. Đây là giai đoạn khó nhất — khi mọi thứ chỉ nằm trên giấy và bản phác thảo 3D.',
    '"Chúng tôi không muốn đây chỉ là một đêm diễn khác. Khán giả bây giờ sành lắm, mỗi lần đến show là mỗi lần kỳ vọng cao hơn" — đại diện ê-kíp nói. Quả thật, áp lực này đến từ chính người hâm mộ: cộng đồng fan ngày càng hoạt động mạnh trên mạng xã hội, chia sẻ từng chi tiết nhỏ về trải nghiệm.',
    'Về mặt kỹ thuật, sân khấu mới sử dụng hệ thống LED cong ôm sát khán giả, kết hợp với hiệu ứng haze và laser được đồng bộ theo từng nhịp bài hát. Ba đạo diễn ánh sáng đã được mời từ Hàn Quốc — nơi công nghệ trình diễn concert đã đi trước Việt Nam khoảng 5-7 năm.',
    'Điều đáng chú ý là giá vé sẽ được chia thành 6 hạng — từ phổ thông đến VIP kèm meet & greet. Thông tin chi tiết sẽ mở bán trên TicketRush sau khi ê-kíp hoàn tất các khâu cuối cùng.',
    'Nhìn rộng ra, đây là một tín hiệu tích cực cho thị trường sự kiện giải trí trong nước. Các nghệ sĩ Việt bắt đầu đầu tư nghiêm túc hơn cho sản phẩm live — điều mà trước đây chỉ các đêm diễn quốc tế mới có.',
  ];

  return (
    <>
      <Navbar variant="solid" />

      <article className="mx-auto max-w-3xl px-4 py-10 lg:px-8 lg:py-16">
        <Link href="/news" className="mb-6 inline-flex items-center gap-1.5 text-sm font-semibold text-stone-500 hover:text-stone-900">
          <ArrowLeft className="h-4 w-4" /> Quay lại tin tức
        </Link>

        <header>
          <div className="flex flex-wrap items-center gap-3 text-xs font-semibold uppercase tracking-wider text-amber-700">
            <span>{article.category}</span>
            <span className="h-1 w-1 rounded-full bg-stone-300" />
            <span className="text-stone-500">{article.publishedAt}</span>
            <span className="h-1 w-1 rounded-full bg-stone-300" />
            <span className="inline-flex items-center gap-1 text-stone-500">
              <Clock className="h-3 w-3" /> {article.readMin} phút đọc
            </span>
          </div>
          <h1 className="mt-3 font-display text-3xl font-extrabold leading-tight text-stone-900 md:text-5xl">
            {article.title}
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-stone-600 md:text-xl">
            {article.excerpt}
          </p>
        </header>

        {/* Cover */}
        <figure className="mt-8 overflow-hidden rounded-3xl">
          <div
            className="aspect-[16/9] w-full bg-cover bg-center"
            style={{ backgroundImage: `url(${article.cover})` }}
            role="img"
            aria-label={article.title}
          />
          <figcaption className="mt-2 text-xs italic text-stone-500">
            Ảnh: TicketRush Newsroom
          </figcaption>
        </figure>

        {/* Share / bookmark */}
        <div className="mt-6 flex items-center gap-2 border-b border-stone-200 pb-6">
          <button className="inline-flex items-center gap-1.5 rounded-full border border-stone-200 bg-white px-3 py-1.5 text-xs font-semibold text-stone-700 transition-colors hover:bg-stone-100">
            <Share2 className="h-3.5 w-3.5" /> Chia sẻ
          </button>
          <button className="inline-flex items-center gap-1.5 rounded-full border border-stone-200 bg-white px-3 py-1.5 text-xs font-semibold text-stone-700 transition-colors hover:bg-stone-100">
            <Bookmark className="h-3.5 w-3.5" /> Lưu bài
          </button>
        </div>

        {/* Body */}
        <div className="prose-stone mt-8 space-y-5 text-base leading-relaxed text-stone-800 md:text-lg md:leading-[1.8]">
          <p className="first-letter:float-left first-letter:mr-2 first-letter:font-display first-letter:text-6xl first-letter:font-extrabold first-letter:leading-none first-letter:text-amber-600">
            {paragraphs[0]}
          </p>
          {paragraphs.slice(1, 3).map((p, i) => <p key={i}>{p}</p>)}

          <blockquote className="my-8 border-l-4 border-amber-500 bg-amber-50/50 px-6 py-4 font-display text-xl italic leading-snug text-stone-800 md:text-2xl">
            &ldquo;Khán giả bây giờ sành lắm. Mỗi lần đến show là mỗi lần kỳ vọng cao hơn.&rdquo;
          </blockquote>

          {paragraphs.slice(3).map((p, i) => <p key={i}>{p}</p>)}
        </div>

        {/* Author bar */}
        <div className="mt-12 flex items-center gap-3 rounded-2xl border border-stone-200 bg-stone-50 p-4">
          <div className="h-12 w-12 flex-shrink-0 rounded-full bg-gradient-to-br from-amber-400 to-amber-600" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-stone-900">TicketRush Newsroom</p>
            <p className="text-xs text-stone-500">Đội ngũ biên tập — viết vì người yêu show.</p>
          </div>
          <Link href="/news" className="text-xs font-semibold text-amber-700 hover:text-amber-800">
            Xem thêm bài →
          </Link>
        </div>

        {/* Related */}
        {related.length > 0 && (
          <section className="mt-14 border-t border-stone-200 pt-10">
            <h2 className="font-display text-xl font-bold text-stone-900 md:text-2xl">Đọc thêm cùng chủ đề</h2>
            <ul className="mt-5 grid grid-cols-1 gap-6 sm:grid-cols-3">
              {related.map((r) => (
                <li key={r.id}>
                  <Link href={`/news/${r.id}`} className="group block">
                    <div
                      className="aspect-[4/3] w-full overflow-hidden rounded-xl bg-cover bg-center transition-transform duration-500 group-hover:scale-[1.03]"
                      style={{ backgroundImage: `url(${r.cover})` }}
                      aria-hidden
                    />
                    <p className="mt-2 text-[11px] font-semibold uppercase tracking-wider text-amber-700">{r.category}</p>
                    <p className="mt-1 font-display text-sm font-bold leading-snug text-stone-900 group-hover:text-amber-700">
                      {r.title}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
      </article>

      <Footer />
    </>
  );
}
