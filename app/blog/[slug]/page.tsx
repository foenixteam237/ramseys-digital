import ReactMarkdown from 'react-markdown';
import { notFound } from 'next/navigation';
import { getPostBySlug } from '@/lib/blog';
import { getCurrentUser } from '@/lib/session';
import BlogInteractions from '@/components/BlogInteractions';

export const dynamic = 'force-dynamic';

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const currentUser = await getCurrentUser();

  return (
    <main className="mx-auto min-h-screen max-w-4xl px-6 py-24">
      <article className="rounded-2xl border border-rd-line bg-rd-graphite p-8">
        <p className="text-sm uppercase tracking-[0.3em] text-rd-red">Astuces • {new Date(post.createdAt).toLocaleDateString('fr-FR')}</p>
        <h1 className="mt-3 font-display text-4xl font-semibold">{post.title}</h1>
        <p className="mt-4 text-white/70">{post.excerpt}</p>
        <div className="prose prose-invert mt-8 max-w-none text-white/90">
          <ReactMarkdown>{post.content}</ReactMarkdown>
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
      </article>
    </main>
  );
}