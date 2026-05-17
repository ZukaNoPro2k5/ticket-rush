"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { CalendarDays, Eye, FileText, Layers3, Loader2, Newspaper, Plus, Search } from "lucide-react";
import toast from "react-hot-toast";
import { listPosts, getPostStats } from "@/lib/api/posts";
import { POST_CATEGORIES, formatPostDate, postStatusLabel } from "@/lib/utils/posts";
import { fadeUp, staggerContainer } from "@/lib/motion";
import type { Post, PostStats } from "@/types";

type SortMode = "newest" | "oldest" | "views";
type StatusFilter = "all" | Post["status"];

export default function AdminPostsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [stats, setStats] = useState<PostStats | null>(null);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Tất cả");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [sort, setSort] = useState<SortMode>("newest");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [postResult, postStats] = await Promise.all([
        listPosts({
          search: search.trim() || undefined,
          category: category === "Tất cả" ? undefined : category,
          status: status === "all" ? undefined : status,
          sort: sort === "views" ? "views" : "published_at",
          order: sort === "oldest" ? "asc" : "desc",
          limit: 100,
        }),
        getPostStats(),
      ]);
      setPosts(postResult.posts);
      setStats(postStats);
    } catch {
      toast.error("Không tải được danh sách bài đăng");
    } finally {
      setLoading(false);
    }
  }, [category, search, sort, status]);

  useEffect(() => {
    void load();
  }, [load]);

  const availableCategories = useMemo(() => {
    const known = new Set(POST_CATEGORIES);
    const extras = posts.map((post) => post.category).filter((item) => !known.has(item as typeof POST_CATEGORIES[number]));
    return [...POST_CATEGORIES, ...new Set(extras)];
  }, [posts]);

  return (
    <motion.div variants={staggerContainer()} initial="hidden" animate="visible" className="space-y-5">
      <motion.div variants={fadeUp} className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="page-title">Bài đăng</h1>
          <p className="mt-1 text-sm text-stone-500">Admin sửa ở đây, newsroom ngoài trang khách đổi theo cùng dữ liệu.</p>
        </div>
        <Link
          href="/admin/posts/new"
          className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-amber-600"
        >
          <Plus className="h-4 w-4" />
          Tạo bài đăng
        </Link>
      </motion.div>

      <motion.div variants={fadeUp} className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Tổng bài", value: stats?.total ?? "…", icon: Newspaper },
          { label: "Đã đăng", value: stats?.published ?? "…", icon: FileText },
          { label: "Chủ đề", value: stats?.categories ?? "…", icon: Layers3 },
          { label: "Lượt xem", value: stats ? stats.views.toLocaleString("vi-VN") : "…", icon: Eye },
        ].map(({ label, value, icon: Icon }) => (
          <div key={label} className="rounded-2xl border border-stone-200 bg-white px-4 py-3.5 shadow-soft">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-medium uppercase tracking-wider text-stone-400">{label}</p>
              <Icon className="h-4 w-4 text-stone-300" />
            </div>
            <p className="mt-2 text-2xl font-bold tabular-nums text-stone-900">{value}</p>
          </div>
        ))}
      </motion.div>

      <motion.div variants={fadeUp} className="rounded-2xl border border-stone-200 bg-white p-4 shadow-soft">
        <div className="flex flex-wrap gap-2">
          {availableCategories.map((item) => (
            <button
              key={item}
              onClick={() => setCategory(item)}
              className={`rounded-xl px-3.5 py-2 text-xs font-semibold transition-colors ${
                category === item
                  ? "bg-amber-500 text-white shadow-sm"
                  : "border border-stone-200 bg-white text-stone-600 hover:border-stone-300"
              }`}
            >
              {item}
            </button>
          ))}
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm tiêu đề, tác giả, nội dung…"
              className="h-10 w-72 rounded-xl border border-stone-200 bg-white pl-10 pr-3 text-sm text-stone-800 outline-none focus:border-amber-400"
            />
          </div>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as StatusFilter)}
            className="h-10 rounded-xl border border-stone-200 bg-white px-3 text-sm text-stone-700 outline-none focus:border-amber-400"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="published">Đã đăng</option>
            <option value="draft">Bản nháp</option>
          </select>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortMode)}
            className="h-10 rounded-xl border border-stone-200 bg-white px-3 text-sm text-stone-700 outline-none focus:border-amber-400"
          >
            <option value="newest">Mới nhất</option>
            <option value="oldest">Cũ nhất</option>
            <option value="views">Lượt xem nhiều</option>
          </select>
        </div>
      </motion.div>

      {loading ? (
        <motion.div variants={fadeUp} className="flex items-center justify-center gap-2 rounded-2xl border border-stone-200 bg-white py-20 text-stone-400">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span className="text-sm">Đang tải bài đăng…</span>
        </motion.div>
      ) : posts.length === 0 ? (
        <motion.div variants={fadeUp} className="rounded-2xl border border-dashed border-stone-300 bg-white py-16 text-center">
          <Newspaper className="mx-auto h-9 w-9 text-stone-300" />
          <p className="mt-3 font-semibold text-stone-700">Không có bài đăng phù hợp</p>
          <p className="mt-1 text-sm text-stone-500">Thử đổi từ khóa hoặc bộ lọc.</p>
        </motion.div>
      ) : (
        <>
          <motion.div variants={fadeUp} className="space-y-3 md:hidden">
            {posts.map((post) => (
              <Link
                key={post.id}
                href={`/admin/posts/${post.id}`}
                className="block rounded-2xl border border-stone-200 bg-white p-4 shadow-soft transition-colors hover:bg-stone-50"
              >
                <div className="flex gap-3">
                  <div className="relative h-16 w-24 shrink-0 overflow-hidden rounded-xl bg-stone-100">
                    <Image src={post.cover_url} alt="" fill className="object-cover" sizes="96px" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-2 text-sm font-semibold text-stone-900">{post.title}</p>
                    <p className="mt-1 truncate text-xs text-stone-500">{post.author_name}</p>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-stone-500">
                  <span className="rounded-full bg-stone-100 px-2.5 py-1 font-medium text-stone-600">{post.category}</span>
                  <span className={`rounded-full px-2.5 py-1 font-semibold ${
                    post.status === "published"
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-stone-100 text-stone-500"
                  }`}>
                    {postStatusLabel(post.status)}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <CalendarDays className="h-3.5 w-3.5" />
                    {formatPostDate(post.published_at)}
                  </span>
                  <span className="inline-flex items-center gap-1 font-semibold text-stone-700">
                    <Eye className="h-3.5 w-3.5 text-stone-400" />
                    {post.view_count.toLocaleString("vi-VN")}
                  </span>
                </div>
              </Link>
            ))}
          </motion.div>

          <motion.div variants={fadeUp} className="hidden overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-soft md:block">
            <div className="grid grid-cols-[minmax(0,2fr)_120px_120px_120px_120px] gap-4 border-b border-stone-100 px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-stone-400">
              <span>Bài viết</span>
              <span>Chủ đề</span>
              <span>Ngày đăng</span>
              <span>Trạng thái</span>
              <span className="text-right">Lượt xem</span>
            </div>
            <div className="divide-y divide-stone-100">
              {posts.map((post) => (
                <Link
                  key={post.id}
                  href={`/admin/posts/${post.id}`}
                  className="grid grid-cols-[minmax(0,2fr)_120px_120px_120px_120px] items-center gap-4 px-5 py-3.5 transition-colors hover:bg-stone-50"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="relative h-10 w-16 shrink-0 overflow-hidden rounded-lg bg-stone-100">
                      <Image src={post.cover_url} alt="" fill className="object-cover" sizes="64px" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-stone-900">{post.title}</p>
                      <p className="mt-0.5 truncate text-xs text-stone-500">{post.author_name}</p>
                    </div>
                  </div>
                  <span className="text-sm text-stone-600">{post.category}</span>
                  <span className="inline-flex items-center gap-1 text-sm text-stone-500">
                    <CalendarDays className="h-3.5 w-3.5" />
                    {formatPostDate(post.published_at)}
                  </span>
                  <span className={`inline-flex w-fit rounded-full px-2.5 py-1 text-xs font-semibold ${
                    post.status === "published"
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-stone-100 text-stone-500"
                  }`}>
                    {postStatusLabel(post.status)}
                  </span>
                  <span className="inline-flex items-center justify-end gap-1 text-sm font-semibold text-stone-700">
                    <Eye className="h-3.5 w-3.5 text-stone-400" />
                    {post.view_count.toLocaleString("vi-VN")}
                  </span>
                </Link>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </motion.div>
  );
}
