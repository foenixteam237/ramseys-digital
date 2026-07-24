import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getPostBySlug, getPublishedPosts } from '@/lib/blog';
import { estimateReadingTime } from '@/lib/readingtime';
import { extractToc } from '@/lib/toc';
import { getCurrentUser } from '@/lib/session';
import BlogInteractions from '@/components/BlogInteractions';
import ArticleBody from '@/components/ArticleBody';
import TableOfContents from '@/components/TableOfContents';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const dynamic = 'force-dynamic';

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const [currentUser, allPosts] = await Promise.all([getCurrentUser(), getPublishedPosts()]);

  const relatedPosts = allPosts
    .filter((candidate) => candidate.id !== post.id && post.categoryId && candidate.categoryId === post.categoryId)
    .slice(0, 3);

  const authorName = (post.author?.name as string | undefined) ?? 'Ramseys Digital';
  const readingMinutes = estimateReadingTime(post.content);
  const toc = extractToc(post.content);

  return (
    <div className="min-h-screen bg-rd-deep text-white antialiased">
      <Header />
      <main className="pb-24 pt-32">
        <div className="mx-auto max-w-4xl px-6">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-sm font-semibold text-white/50 transition-colors hover:text-white"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="m15 18-6-6 6-6" />
            </svg>
            Retour au blog
          </Link>
        </div>

        <article className="mx-auto mt-6 max-w-4xl px-6">
          {post.coverImageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={post.coverImageUrl}
              alt={post.title}
              className="h-64 w-full rounded-2xl border border-rd-line object-cover sm:h-80"
            />
          ) : (
            <div className="grid-bg red-glow-radial flex h-64 w-full items-center justify-center rounded-2xl border border-rd-line bg-rd-graphite sm:h-80">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo.png" alt="Ramseys Digital" className="h-24 w-24 object-contain opacity-60" />
            </div>
          )}

          <div className="mt-8">
            {post.categoryName ? (
              <span className="mb-4 inline-flex rounded-full bg-rd-red/15 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-rd-redlight">
                {post.categoryName}
              </span>
            ) : null}
            <h1 className="font-display text-3xl font-semibold leading-tight sm:text-4xl">{post.title}</h1>
            <p className="mt-4 text-lg text-white/60">{post.excerpt}</p>

            <div className="mt-6 flex flex-wrap items-center gap-3 border-y border-white/5 py-4 text-sm text-white/50">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-rd-red/20 text-xs font-bold text-rd-redlight">
                {authorName[0]?.toUpperCase() ?? '?'}
              </span>
              <span className="font-semibold text-white/80">{authorName}</span>
              <span className="h-1 w-1 rounded-full bg-white/20" />
              <span>
                {new Date(post.createdAt).toLocaleDateString('fr-FR', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </span>
              <span className="h-1 w-1 rounded-full bg-white/20" />
              <span>{readingMinutes} min de lecture</span>
            </div>

            <div className="mt-10">
              <TableOfContents items={toc} />
              <ArticleBody content={post.content} />
            </div>

            <div className="mt-12 rounded-2xl border border-rd-red/30 bg-rd-red/5 p-6 text-center">
              <p className="font-display text-lg font-semibold text-white">
                Cet article vous a été utile ?
              </p>
              <p className="mt-1 text-sm text-white/60">
                Aimez-le pour nous soutenir, partagez-le à votre réseau et laissez-nous un commentaire ci-dessous.
              </p>
            </div>

            <BlogInteractions
              postId={post.id}
              postSlug={post.slug}
              postTitle={post.title}
              initialLikes={post.likes}
              initialComments={post.comments}
              initialShares={post.shares}
              currentUser={currentUser}
            />
          </div>
        </article>

        {relatedPosts.length > 0 ? (
          <div className="mx-auto mt-20 max-w-4xl px-6">
            <h2 className="font-display text-xl font-semibold text-white">À lire aussi</h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              {relatedPosts.map((related) => (
                <Link
                  key={related.id}
                  href={`/blog/${related.slug}`}
                  className="card-hover rounded-xl border border-rd-line bg-rd-graphite p-4"
                >
                  <p className="line-clamp-2 font-display text-sm font-semibold text-white">{related.title}</p>
                  <p className="mt-2 text-xs text-white/40">
                    {new Date(related.createdAt).toLocaleDateString('fr-FR')}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        ) : null}
      </main>
      <Footer />
    </div>
  );
}
