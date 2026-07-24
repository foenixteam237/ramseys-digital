export interface YoutubeVideo {
  id: string;
  title: string;
  thumbnailUrl: string;
  publishedAt: string;
}

const CHANNEL_ID = 'UCZ7oJA0u6vjhtNCXqerWMtQ';

function decodeXmlEntities(value: string): string {
  return value
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'");
}

/**
 * Récupère les dernières vidéos de la chaîne via le flux RSS public de
 * YouTube. Aucune clé API n'est nécessaire : le flux est public, gratuit
 * et sans quota.
 */
export async function getChannelVideos(maxResults = 6): Promise<YoutubeVideo[]> {
  const feedUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${CHANNEL_ID}`;

  try {
    const response = await fetch(feedUrl, { next: { revalidate: 3600 } });

    if (!response.ok) {
      console.error('getChannelVideos error: flux RSS indisponible', response.status);
      return [];
    }

    const xml = await response.text();
    const entries = xml.split('<entry>').slice(1);
    const videos: YoutubeVideo[] = [];

    for (const entry of entries) {
      const videoId = entry.match(/<yt:videoId>([^<]+)<\/yt:videoId>/)?.[1];
      const rawTitle = entry.match(/<title>([\s\S]*?)<\/title>/)?.[1];
      const published = entry.match(/<published>([^<]+)<\/published>/)?.[1];

      if (!videoId) {
        continue;
      }

      videos.push({
        id: videoId,
        title: rawTitle ? decodeXmlEntities(rawTitle.trim()) : '',
        thumbnailUrl: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
        publishedAt: published ?? '',
      });

      if (videos.length >= maxResults) {
        break;
      }
    }

    return videos;
  } catch (err) {
    console.error('getChannelVideos fetch failed:', err);
    return [];
  }
}