export interface YoutubeVideo {
  id: string;
  title: string;
  thumbnailUrl: string;
  publishedAt: string;
}

interface YoutubePlaylistItem {
  snippet?: {
    title?: string;
    publishedAt?: string;
    resourceId?: { videoId?: string };
    thumbnails?: {
      medium?: { url?: string };
      default?: { url?: string };
    };
  };
}

const CHANNEL_ID = 'UCZ7oJA0u6vjhtNCXqerWMtQ';

export async function getChannelVideos(maxResults = 6): Promise<YoutubeVideo[]> {
  const apiKey = process.env.YOUTUBE_API_KEY;

  if (!apiKey) {
    console.warn('YOUTUBE_API_KEY absent : impossible de récupérer les vidéos YouTube.');
    return [];
  }

  // The uploads playlist of any channel is its channel ID with "UC" replaced by "UU".
  const uploadsPlaylistId = `UU${CHANNEL_ID.slice(2)}`;
  const url = new URL('https://www.googleapis.com/youtube/v3/playlistItems');
  url.searchParams.set('part', 'snippet');
  url.searchParams.set('playlistId', uploadsPlaylistId);
  url.searchParams.set('maxResults', String(maxResults));
  url.searchParams.set('key', apiKey);

  try {
    const response = await fetch(url.toString(), { next: { revalidate: 3600 } });

    if (!response.ok) {
      console.error('getChannelVideos error:', await response.text());
      return [];
    }

    const data = (await response.json()) as { items?: YoutubePlaylistItem[] };

    return (data.items ?? [])
      .filter((item) => item.snippet?.resourceId?.videoId)
      .map((item) => ({
        id: item.snippet!.resourceId!.videoId as string,
        title: item.snippet?.title ?? '',
        thumbnailUrl: item.snippet?.thumbnails?.medium?.url ?? item.snippet?.thumbnails?.default?.url ?? '',
        publishedAt: item.snippet?.publishedAt ?? '',
      }));
  } catch (err) {
    console.error('getChannelVideos fetch failed:', err);
    return [];
  }
}