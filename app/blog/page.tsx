import { getPublishedPosts } from '@/lib/blog';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import BlogList from './BlogList';

export const dynamic = 'force-dynamic';

export default async function BlogPage() {
  const posts = await getPublishedPosts();

  const listPosts = posts.map((post) => ({
    id: post.id,
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt,
    content: post.content,
    createdAt: post.createdAt,
    coverImageUrl: post.coverImageUrl,
    categoryName: post.categoryName,
    authorName: (post.author?.name as string | undefined) ?? 'Ramseys Digital',
    likesCount: post.likes.length,
    commentsCount: post.comments.length,
  }));

  const usedCategoryNames = Array.from(
    new Set(listPosts.map((post) => post.categoryName).filter((name): name is string => Boolean(name))),
  ).sort((a, b) => a.localeCompare(b));

  return (
    <div className="min-h-screen bg-rd-deep text-white antialiased">
      <Header />
      <main className="mx-auto min-h-screen max-w-6xl px-6 pt-32 pb-24">
        <div className="mb-12 max-w-2xl">
          <p className="mb-4 font-mono text-xs uppercase tracking-[0.25em] text-rd-red">Blog / Astuces</p>
          <h1 className="font-display text-4xl font-semibold leading-tight text-white sm:text-5xl">
            Conseils, retours d&apos;expérience et actualités IT
          </h1>
          <p className="mt-4 text-white/60">
            Des articles pratiques sur la maintenance, la sécurité et les solutions numériques, écrits par l&apos;équipe Ramseys Digital.
          </p>
        </div>

        <BlogList posts={listPosts} categories={usedCategoryNames} />
      </main>
      <Footer />
    </div>
  );
}
