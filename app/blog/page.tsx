import Link from 'next/link';
import { getPublishedPosts } from '@/lib/blog';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const dynamic = 'force-dynamic';

export default async function BlogPage() {
  const posts = await getPublishedPosts();

  return (
    <div className="min-h-screen bg-rd-deep text-white antialiased">
      <Header />
      <main className="mx-auto min-h-screen max-w-6xl px-6 pt-32 pb-24">
        <div className="mb-10 flex items-end justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-rd-red">Blog / Astuces</p>
            <h1 className="font-display text-4xl font-semibold text-white">Articles publiés</h1>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {posts.map((post) => (
            <article key={post.id} className="rounded-2xl border border-rd-line bg-rd-graphite p-5">
              <div className="mb-4 flex items-center justify-between text-sm text-white/60">
                <span>{new Date(post.createdAt).toLocaleDateString('fr-FR')}</span>
                <span>{post.likes.length} likes</span>
              </div>
              <h2 className="font-display text-2xl font-semibold text-white">{post.title}</h2>
              <p className="mt-3 text-sm text-white/70">{post.excerpt}</p>
              <Link
                href={`/blog/${post.slug}`}
                className="mt-5 inline-flex rounded-lg bg-rd-red px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
              >
                Lire l’article
              </Link>
            </article>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
