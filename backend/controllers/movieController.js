const fs = require('fs');
const path = require('path');
const omdbService = require('../services/omdbService');
const youtubeService = require('../services/youtubeService');

const moviesFilePath = path.join(__dirname, '..', 'data', 'movies.json');

const readMoviesData = () => {
  try {
    const raw = fs.readFileSync(moviesFilePath, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading movies.json:', err);
    return { banners: [], trending: [], actionShows: [] };
  }
};

const FEATURED_IMDB_LIST = [
  {
    imdbId: 'tt3896198',
    top10Badge: '#1 in Movies Today',
    videoUrl: 'https://vjs.zencdn.net/v/oceans.mp4',
    trailerYoutubeId: '2XqQMVx86Lg',
  },
  {
    imdbId: 'tt4574334',
    top10Badge: '#1 in TV Shows Today',
    videoUrl: 'https://vjs.zencdn.net/v/oceans.mp4',
    trailerYoutubeId: 'b9EkMc79ZSU',
  },
  {
    imdbId: 'tt13751694',
    top10Badge: '#2 in Movies Today',
    videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
    trailerYoutubeId: '8FkLRUJj-o0',
  },
  {
    imdbId: 'tt10919420',
    top10Badge: '#2 in TV Shows Today',
    videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
    trailerYoutubeId: 'oqxAJKy0ii4',
  },
  {
    imdbId: 'tt12263384',
    top10Badge: '#3 in Movies Today',
    videoUrl: 'https://vjs.zencdn.net/v/oceans.mp4',
    trailerYoutubeId: 'Y274jZs5s7s',
  },
  {
    imdbId: 'tt13443470',
    top10Badge: '#3 in TV Shows Today',
    videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
    trailerYoutubeId: 'Di310BC8urj',
  },
];

const enrichWithOmdb = async (movie) => {
  if (!movie.imdbId && !movie.title) return movie;

  let omdbData = null;
  if (movie.imdbId) {
    omdbData = await omdbService.getMovieByImdbId(movie.imdbId);
  } else if (movie.title) {
    omdbData = await omdbService.getMovieByTitle(movie.title, movie.year);
  }

  if (omdbData) {
    return {
      ...movie,
      title: omdbData.title || movie.title,
      overview: omdbData.overview || movie.overview,
      poster: omdbData.poster || movie.poster,
      backdropUrl: omdbData.backdropUrl || movie.backdropUrl,
      rating: omdbData.rating || movie.rating,
      matchScore: omdbData.matchScore || movie.matchScore,
      releaseYear: omdbData.releaseYear || movie.releaseYear,
      ageRating: omdbData.ageRating || movie.ageRating,
      duration: omdbData.duration || movie.duration,
      genres: omdbData.genres?.length ? omdbData.genres : movie.genres,
      cast: omdbData.cast?.length ? omdbData.cast : movie.cast,
      director: omdbData.director,
      imdbID: omdbData.imdbID,
    };
  }

  return movie;
};

const getBanner = async (req, res) => {
  try {
    const requestedId = req.query.id || 'tt3896198';

    const omdbMovie = await omdbService.getMovieByImdbId(requestedId);
    if (omdbMovie) {
      const bannerItem = {
        ...omdbMovie,
        top10Badge: '#1 in Movies Today',
        videoUrl: 'https://vjs.zencdn.net/v/oceans.mp4',
        trailerYoutubeId: '2XqQMVx86Lg',
      };

      return res.status(200).json({
        success: true,
        source: 'OMDb API',
        banner: bannerItem,
      });
    }

    const data = readMoviesData();
    const fallbackBanner = data.banners?.[0] || {};
    return res.status(200).json({
      success: true,
      source: 'local_fallback',
      banner: fallbackBanner,
    });
  } catch (error) {
    console.error('Get banner error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch banner data.',
    });
  }
};

const getAllBanners = async (req, res) => {
  try {
    const enrichedBanners = await Promise.all(
      FEATURED_IMDB_LIST.map(async (item) => {
        const omdb = await omdbService.getMovieByImdbId(item.imdbId);
        if (omdb) {
          return {
            ...omdb,
            top10Badge: item.top10Badge,
            videoUrl: item.videoUrl,
            trailerYoutubeId: item.trailerYoutubeId,
          };
        }
        return null;
      })
    );

    const validBanners = enrichedBanners.filter(Boolean);

    if (validBanners.length > 0) {
      return res.status(200).json({
        success: true,
        source: 'OMDb API',
        banners: validBanners,
      });
    }

    const data = readMoviesData();
    return res.status(200).json({
      success: true,
      source: 'local_fallback',
      banners: data.banners || [],
    });
  } catch (error) {
    console.error('Get all banners error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch banners list.',
    });
  }
};

const getMovieFromOmdb = async (req, res) => {
  try {
    const { title, id, year } = req.query;

    let movie = null;
    if (id) {
      movie = await omdbService.getMovieByImdbId(id);
    } else if (title) {
      movie = await omdbService.getMovieByTitle(title, year);
    }

    if (!movie) {
      return res.status(404).json({
        success: false,
        message: 'Movie not found in OMDb database.',
      });
    }

    return res.status(200).json({
      success: true,
      movie,
    });
  } catch (error) {
    console.error('OMDb controller error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch movie from OMDb.',
    });
  }
};

const getTrending = async (req, res) => {
  try {
    const data = readMoviesData();
    const trending = data.trending || [];
    const enriched = await Promise.all(trending.map(enrichWithOmdb));

    return res.status(200).json({
      success: true,
      count: enriched.length,
      movies: enriched,
    });
  } catch (error) {
    console.error('Get trending error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch trending movies.',
    });
  }
};

const getActionShows = async (req, res) => {
  try {
    const data = readMoviesData();
    const actionShows = data.actionShows || [];
    const enriched = await Promise.all(actionShows.map(enrichWithOmdb));

    return res.status(200).json({
      success: true,
      count: enriched.length,
      shows: enriched,
    });
  } catch (error) {
    console.error('Get action shows error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch action shows.',
    });
  }
};

const VERIFIED_VIDEO_MAP = {
  animal: { youtubeId: '8FkLRUJj-o0', title: 'Animal', year: '2023', imdbId: 'tt13751694' },
  salaar: { youtubeId: 'e2c_7XU4GjI', title: 'Salaar: Part 1 – Ceasefire', year: '2023', imdbId: 'tt13927994' },
  jawan: { youtubeId: 'COv52Qyctws', title: 'Jawan', year: '2023', imdbId: 'tt15354916' },
  'the-railway-men': { youtubeId: 'iD3TZ_Xxc14', title: 'The Railway Men', year: '2023', imdbId: 'tt16296870' },
  railwaymen: { youtubeId: 'iD3TZ_Xxc14', title: 'The Railway Men', year: '2023', imdbId: 'tt16296870' },
  'jaane-jaan': { youtubeId: 'GHX6yT9Lxfo', title: 'Jaane Jaan', year: '2023', imdbId: 'tt15748830' },
  khufiya: { youtubeId: 'ByojhBwG_-E', title: 'Khufiya', year: '2023', imdbId: 'tt15433600' },
  'mission-raniganj': { youtubeId: 'QFf91hnpClI', title: 'Mission Raniganj', year: '2023', imdbId: 'tt21262240' },
  'omg-2': { youtubeId: 'Y6ZKXqM7HNQ', title: 'OMG 2', year: '2023', imdbId: 'tt15732324' },
  'lust-stories-2': { youtubeId: '4aanxonXWiM', title: 'Lust Stories 2', year: '2023', imdbId: 'tt27989067' },
  tt3896198: { youtubeId: '2XqQMVx86Lg', title: 'Guardians of the Galaxy: Vol. 2', year: '2017', imdbId: 'tt3896198' },
  tt4574334: { youtubeId: 'b9EkMc79ZSU', title: 'Stranger Things', year: '2024', imdbId: 'tt4574334' },
  tt10919420: { youtubeId: 'oqxAJKy0ii4', title: 'Squid Game', year: '2024', imdbId: 'tt10919420' },
  tt12263384: { youtubeId: 'Y274jZs5s7s', title: 'Extraction II', year: '2023', imdbId: 'tt12263384' },
  tt13443470: { youtubeId: 'Di310BC8urj', title: 'Wednesday', year: '2023', imdbId: 'tt13443470' },
};

const getWatchDetails = async (req, res) => {
  try {
    const rawId = (req.params.id || '').trim().toLowerCase();
    const data = readMoviesData();
    const allMovies = [...(data.banners || []), ...(data.trending || []), ...(data.actionShows || [])];

    let movie = allMovies.find((m) => {
      const mId = (m.id || '').toLowerCase();
      const mImdb = (m.imdbId || '').toLowerCase();
      const mTitle = (m.title || '').toLowerCase();
      return mId === rawId || mImdb === rawId || mTitle === rawId || mTitle.includes(rawId);
    });

    const videoEntry = VERIFIED_VIDEO_MAP[rawId] || Object.values(VERIFIED_VIDEO_MAP).find((v) => {
      return (movie?.title && v.title.toLowerCase().includes(movie.title.toLowerCase())) ||
             (movie?.imdbId && v.imdbId === movie.imdbId);
    });

    const trailerYoutubeId = movie?.trailerYoutubeId || videoEntry?.youtubeId || 'DydmpkhEvAg';
    const imdbId = movie?.imdbId || videoEntry?.imdbId;

    let omdbData = null;
    if (imdbId) {
      omdbData = await omdbService.getMovieByImdbId(imdbId);
    }

    return res.status(200).json({
      success: true,
      movie: {
        id: movie?.id || rawId,
        imdbId: imdbId || 'tt13751694',
        title: omdbData?.title || movie?.title || videoEntry?.title || 'Featured Movie',
        overview: omdbData?.overview || movie?.overview || 'High-intensity Netflix blockbuster presentation.',
        poster: omdbData?.poster || movie?.poster || '/logo1.jpg',
        rating: omdbData?.rating || movie?.rating || '8.2',
        matchScore: omdbData?.matchScore || movie?.matchScore || '98% Match',
        year: omdbData?.releaseYear || movie?.year || videoEntry?.year || '2023',
        ageRating: omdbData?.ageRating || movie?.ageRating || 'A (18+)',
        duration: omdbData?.duration || movie?.duration || '2h 30m',
        genres: omdbData?.genres || movie?.genres || ['Action', 'Drama'],
        cast: omdbData?.cast || movie?.cast || ['Star Cast'],
        director: omdbData?.director || movie?.director || 'Director',
        trailerYoutubeId: trailerYoutubeId,
        embedUrl: `https://www.youtube-nocookie.com/embed/${trailerYoutubeId}?autoplay=1&enablejsapi=1&rel=0&modestbranding=1&controls=1`,
      },
    });
  } catch (error) {
    console.error('getWatchDetails error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch watch details.',
    });
  }
};

const searchYouTubeVideos = async (req, res) => {
  try {
    const query = req.query.q || '';
    if (!query.trim()) {
      return res.status(200).json({ success: true, results: [] });
    }
    const results = await youtubeService.searchYouTube(query, 8);
    return res.status(200).json({
      success: true,
      source: 'YouTube Data API v3',
      results,
    });
  } catch (error) {
    console.error('searchYouTubeVideos error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to search YouTube videos.',
    });
  }
};

module.exports = {
  getBanner,
  getAllBanners,
  getMovieFromOmdb,
  getTrending,
  getActionShows,
  getWatchDetails,
  searchYouTubeVideos,
};
