'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import PostEditor from '@/components/admin/PostEditor';
import { getPostById } from '@/lib/api/posts';
import type { Post } from '@/types';

export default function EditAdminPostPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [post, setPost] = useState<Post | null>(null);

  useEffect(() => {
    const postId = Number(id);
    if (!postId) {
      router.replace('/admin/posts');
      return;
    }
    getPostById(postId)
      .then(setPost)
      .catch(() => {
        toast.error('Không tải được bài đăng');
        router.replace('/admin/posts');
      });
  }, [id, router]);

  if (!post) {
    return (
      <div className="flex items-center justify-center gap-2 py-24 text-stone-400">
        <Loader2 className="h-5 w-5 animate-spin" />
        <span className="text-sm">Đang tải bài đăng…</span>
      </div>
    );
  }

  return <PostEditor post={post} />;
}
