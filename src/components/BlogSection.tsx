import { useEffect, useState } from 'react';
import { ArrowRight, BookMarked, X } from 'lucide-react';
import { motion } from 'motion/react';
import type { BlogPost } from '../types/portfolio';

interface BlogSectionProps {
  posts: BlogPost[];
}

export function BlogSection({ posts }: BlogSectionProps) {
  const [activePost, setActivePost] = useState<BlogPost | null>(null);

  useEffect(() => {
    if (!activePost) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setActivePost(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [activePost]);

  return (
    <section id="research" className="border-t border-white/[0.06] py-20 sm:py-24">
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6">
        <div className="mb-12 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-medium tracking-wide text-[#4788FF]">Security Research &amp; Dev Log</p>
            <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Research &amp; Build Notes.
            </h2>
          </div>
          <p className="max-w-md text-sm text-[#A0A4B0]">
            Documenting my learning process in AI security, defensive backend engineering, and trustworthy systems.
          </p>
        </div>

        {posts.length === 0 ? (
          <div className="rounded-2xl border border-white/[0.08] bg-[#11131A] p-10 text-center text-sm text-[#A0A4B0]">
            No published research notes yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {posts.map((post, idx) => (
              <motion.article
                key={post.id}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.35, delay: idx * 0.06 }}
                className="flex flex-col justify-between rounded-2xl border border-white/[0.08] bg-[#11131A] p-6 transition-colors hover:border-white/20"
              >
                <div>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-[#A0A4B0]">
                    <span className="text-[#9366FF]">{post.category}</span>
                    <span aria-hidden="true">·</span>
                    <span>{post.publishedAt}</span>
                    <span aria-hidden="true">·</span>
                    <span>{post.readTime}</span>
                  </div>

                  <h3 className="mt-3 font-display text-lg font-bold leading-snug text-white">
                    {post.title}
                  </h3>

                  <p className="mt-3 text-sm leading-relaxed text-[#A0A4B0]">{post.summary}</p>
                </div>

                <div className="mt-6 border-t border-white/[0.06] pt-4">
                  <button
                    type="button"
                    onClick={() => setActivePost(post)}
                    className="inline-flex items-center gap-2 text-xs font-semibold text-[#4788FF] transition-colors hover:text-white"
                  >
                    <BookMarked className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>Read Research Note</span>
                    <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                </div>
              </motion.article>
            ))}
          </div>
        )}
      </div>

      {/* Article Reader Modal */}
      {activePost && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="blog-modal-title"
        >
          <article className="relative max-h-[88vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-white/15 bg-[#11131A] p-6 sm:p-8 shadow-2xl">
            <button
              type="button"
              onClick={() => setActivePost(null)}
              aria-label="Close research note"
              className="absolute top-5 right-5 flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-[#08090D] text-[#A0A4B0] hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex flex-wrap items-center gap-2 text-xs text-[#A0A4B0]">
              <span className="text-[#9366FF]">{activePost.category}</span>
              <span aria-hidden="true">·</span>
              <span>{activePost.publishedAt}</span>
              <span aria-hidden="true">·</span>
              <span>{activePost.readTime}</span>
            </div>

            <h3 id="blog-modal-title" className="mt-3 pr-10 font-display text-2xl font-bold text-white">
              {activePost.title}
            </h3>

            <div className="mt-6 space-y-4 border-t border-white/[0.08] pt-6 text-sm leading-relaxed text-[#A0A4B0] whitespace-pre-line">
              {activePost.content}
            </div>
          </article>
        </div>
      )}
    </section>
  );
}
