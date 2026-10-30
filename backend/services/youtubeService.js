const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY || 'AIzaSyCvhE1nAHr28SA8l7BQtj6_3rNY4libWi0';
const YOUTUBE_SEARCH_URL = 'https://www.googleapis.com/youtube/v3/search';

const searchCache = new Map();

function decodeHtmlEntities(str) {
  if (!str) return '';
  return str
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
}

async function searchYouTube(query, maxResults = 8) {
  const cleanQuery = (query || '').trim();
  if (!cleanQuery) return [];

  const cacheKey = `${cleanQuery.toLowerCase()}_${maxResults}`;
  if (searchCache.has(cacheKey)) {
    return searchCache.get(cacheKey);
  }

  try {
    const params = new URLSearchParams({
      part: 'snippet',
      maxResults: String(maxResults),
      q: cleanQuery,
      type: 'video',
      key: YOUTUBE_API_KEY,
    });

    const res = await fetch(`${YOUTUBE_SEARCH_URL}?${params.toString()}`);
    if (!res.ok) {
      const errText = await res.text();
      console.warn(`YouTube API returned ${res.status}:`, errText);
      return [];
    }

    const data = await res.json();
    if (!data.items || !Array.isArray(data.items)) {
      return [];
    }

    const results = data.items.map((item) => {
      const videoId = item.id?.videoId;
      const snippet = item.snippet || {};
      const title = decodeHtmlEntities(snippet.title || cleanQuery);
      const channel = decodeHtmlEntities(snippet.channelTitle || '');
      const poster = snippet.thumbnails?.high?.url || snippet.thumbnails?.medium?.url || snippet.thumbnails?.default?.url;
      const publishYear = snippet.publishedAt ? new Date(snippet.publishedAt).getFullYear() : '2024';

      const isSong = /song|music|audio|lyric|album|singer|singer|beat|dance/i.test(title) || /music|t-series|yrf|zee/i.test(channel);

      return {
        id: `yt-${videoId}`,
        trailerYoutubeId: videoId,
        title: title,
        artist: channel,
        year: String(publishYear),
        poster: poster,
        backdrop: poster,
        quality: /8k/i.test(title) ? '8K Ultra HD' : '4K Ultra HD',
        type: isSong ? 'song' : 'movie',
        overview: decodeHtmlEntities(snippet.description || `Official YouTube stream for ${title}`),
        duration: isSong ? 'Full Track' : 'Full Stream',
        embedUrl: `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&enablejsapi=1&rel=0&modestbranding=1&controls=1`,
      };
    });

    searchCache.set(cacheKey, results);
    return results;
  } catch (error) {
    console.error('YouTube search error:', error.message);
    return [];
  }
}

module.exports = {
  searchYouTube,
};
