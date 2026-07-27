import { NextResponse } from 'next/server';
import { getChannelVideos } from '@/lib/youtube';
import { getFeaturedVideos } from '@/lib/admin';

export const dynamic = 'force-dynamic';

export async function GET() {
  // Priorite aux videos choisies par l'admin (aucune dependance a un appel
  // serveur vers YouTube : miniatures et lecteur se chargent chez le visiteur).
  const featured = await getFeaturedVideos();

  if (featured.length > 0) {
    const videos = featured.map((video) => ({
      id: video.youtubeId,
      title: video.title ?? '',
      thumbnailUrl: video.thumbnailUrl,
      publishedAt: video.createdAt,
    }));
    return NextResponse.json({ videos });
  }

  // Repli automatique sur le flux RSS public de la chaine.
  const videos = await getChannelVideos(6);
  return NextResponse.json({ videos });
}