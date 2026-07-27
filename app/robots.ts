import type { MetadataRoute } from 'next';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://ramseys-digital.vercel.app';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // Les espaces prives ne doivent pas etre indexes.
      disallow: ['/admin', '/api/', '/login', '/verify-email', '/profile'],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
