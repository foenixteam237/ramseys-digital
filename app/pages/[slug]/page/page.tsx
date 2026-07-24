import { notFound } from 'next/navigation';
import { getPublishedPageBySlug } from '@/lib/pages';
import ArticleBody from '@/components/ArticleBody';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const dynamic = 'force-dynamic';

export default async function StaticPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = await getPublishedPageBySlug(slug);

  if (!page) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-rd-deep text-white antialiased">
      <Header />
      <main className="mx-auto min-h-screen max-w-4xl px-6 py-32">
        <article className="rounded-2xl border border-rd-line bg-rd-graphite p-8">
          <h1 className="font-display text-4xl font-semibold">{page.title}</h1>
          <div className="mt-8">
            <ArticleBody content={page.content} />
          </div>
        </article>
      </main>
      <Footer />
    </div>
  );
}
