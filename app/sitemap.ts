import type { MetadataRoute } from 'next';
import { getPublishedPosts } from '@/lib/blog';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://ramseys-digital.vercel.app';

export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticEntries: MetadataRoute.Sitemap = [
    { url: `${siteUrl}/`, changeFrequency: 'weekly', priority: 1 },
    { url: `${siteUrl}/blog`, changeFrequency: 'daily', priority: 0.9 },
  ];

  let postEntries: MetadataRoute.Sitemap = [];

  try {
    const posts = await getPublishedPosts();
    postEntries = posts.map((post) => ({
      url: `${siteUrl}/blog/${post.slug}`,
      lastModified: post.updatedAt ? new Date(post.updatedAt) : undefined,
      changeFrequency: 'weekly',
      priority: 0.7,
    }));
  } catch {
    // La base peut etre indisponible au build : on renvoie au moins les pages fixes.
  }

  return [...staticEntries, ...postEntries];
}
