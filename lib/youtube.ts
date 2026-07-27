export interface YoutubeVideo {
  id: string;
  title: string;
  thumbnailUrl: string;
  publishedAt: string;
}

const CHANNEL_ID = 'UCZ7oJA0u6vjhtNCXqerWMtQ';

/**
 * Extrait l'identifiant d'une vidéo YouTube à partir d'une URL (watch, youtu.be,
 * embed, shorts, live) ou d'un identifiant brut collé tel quel. Renvoie null si
 * aucun identifiant valide (11 caractères) n'est trouvé.
 */
export function parseYoutubeId(input: string): string | null {
  const value = input.trim();
  if (!value) return null;

  // Déjà un identifiant brut (11 caractères autorisés par YouTube).
  if (/^[A-Za-z0-9_-]{11}$/.test(value)) return value;

  const patterns = [
    /[?&]v=([A-Za-z0-9_-]{11})/, // watch?v=ID
    /youtu\.be\/([A-Za-z0-9_-]{11})/, // youtu.be/ID
    /\/embed\/([A-Za-z0-9_-]{11})/, // /embed/ID
    /\/shorts\/([A-Za-z0-9_-]{11})/, // /shorts/ID
    /\/live\/([A-Za-z0-9_-]{11})/, // /live/ID
  ];

  for (const pattern of patterns) {
    const match = value.match(pattern);
    if (match) return match[1];
  }

  return null;
}

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
    const response = await fetch(feedUrl, {
      // Un User-Agent de navigateur limite les blocages du flux RSS depuis
      // les IP de datacenter (Vercel, etc.).
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36',
        Accept: 'application/atom+xml, application/xml, text/xml',
      },
      next: { revalidate: 3600 },
    });

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