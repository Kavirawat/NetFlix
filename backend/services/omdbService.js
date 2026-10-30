const OMDB_API_KEY = process.env.OMDB_API_KEY || 'd590655a';
const OMDB_API_URL = process.env.OMDB_API_URL || 'http://www.omdbapi.com/';

const cache = new Map();

const getHighResPoster = (posterUrl) => {
  if (!posterUrl || posterUrl === 'N/A') return null;
  return posterUrl.replace(/\._V1_.*\.jpg$/, '._V1_SX1200.jpg');
};

const calculateMatchScore = (imdbRating) => {
  const num = parseFloat(imdbRating);
  if (isNaN(num)) return '95% Match';
  const score = Math.min(99, Math.max(85, Math.round(num * 10 + 12)));
  return `${score}% Match`;
};

const getMovieByImdbId = async (imdbId) => {
  if (cache.has(imdbId)) {
    return cache.get(imdbId);
  }

  try {
    const url = `${OMDB_API_URL}?i=${encodeURIComponent(imdbId)}&apikey=${OMDB_API_KEY}`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.Response === 'True') {
      const highResPoster = getHighResPoster(data.Poster) || data.Poster;
      const formatted = {
        id: data.imdbID,
        imdbID: data.imdbID,
        title: data.Title,
        type: data.Type === 'series' ? 'SERIES' : 'FILM',
        tagline: data.Awards !== 'N/A' ? data.Awards : 'Now Streaming on Netflix',
        overview: data.Plot !== 'N/A' ? data.Plot : 'Exciting story featuring world-class action and drama.',
        poster: highResPoster,
        backdropUrl: highResPoster,
        rating: data.imdbRating !== 'N/A' ? data.imdbRating : '8.0',
        matchScore: calculateMatchScore(data.imdbRating),
        releaseYear: data.Year?.split('–')[0] || '2023',
        ageRating: data.Rated !== 'N/A' ? data.Rated : 'U/A 16+',
        duration: data.Runtime !== 'N/A' ? data.Runtime : (data.totalSeasons ? `${data.totalSeasons} Seasons` : '2h 15m'),
        quality: 'Ultra HD 4K',
        genres: data.Genre !== 'N/A' ? data.Genre.split(', ') : ['Action', 'Drama'],
        cast: data.Actors !== 'N/A' ? data.Actors.split(', ') : ['Star Cast'],
        director: data.Director !== 'N/A' ? data.Director : 'Director',
        boxOffice: data.BoxOffice !== 'N/A' ? data.BoxOffice : null,
      };

      cache.set(imdbId, formatted);
      return formatted;
    }
    return null;
  } catch (error) {
    console.error(`OMDb fetch error for ID ${imdbId}:`, error.message);
    return null;
  }
};

const getMovieByTitle = async (title, year = null) => {
  const cacheKey = `title_${title}_${year || ''}`;
  if (cache.has(cacheKey)) {
    return cache.get(cacheKey);
  }

  try {
    let url = `${OMDB_API_URL}?t=${encodeURIComponent(title)}&apikey=${OMDB_API_KEY}`;
    if (year) url += `&y=${year}`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.Response === 'True') {
      const highResPoster = getHighResPoster(data.Poster) || data.Poster;
      const formatted = {
        id: data.imdbID,
        imdbID: data.imdbID,
        title: data.Title,
        type: data.Type === 'series' ? 'SERIES' : 'FILM',
        tagline: data.Awards !== 'N/A' ? data.Awards : 'Now Streaming on Netflix',
        overview: data.Plot !== 'N/A' ? data.Plot : 'Exciting story featuring world-class action and drama.',
        poster: highResPoster,
        backdropUrl: highResPoster,
        rating: data.imdbRating !== 'N/A' ? data.imdbRating : '8.0',
        matchScore: calculateMatchScore(data.imdbRating),
        releaseYear: data.Year?.split('–')[0] || '2023',
        ageRating: data.Rated !== 'N/A' ? data.Rated : 'U/A 16+',
        duration: data.Runtime !== 'N/A' ? data.Runtime : (data.totalSeasons ? `${data.totalSeasons} Seasons` : '2h 15m'),
        quality: 'Ultra HD 4K',
        genres: data.Genre !== 'N/A' ? data.Genre.split(', ') : ['Action', 'Drama'],
        cast: data.Actors !== 'N/A' ? data.Actors.split(', ') : ['Star Cast'],
        director: data.Director !== 'N/A' ? data.Director : 'Director',
      };

      cache.set(cacheKey, formatted);
      return formatted;
    }
    return null;
  } catch (error) {
    console.error(`OMDb fetch error for title ${title}:`, error.message);
    return null;
  }
};

module.exports = {
  getMovieByImdbId,
  getMovieByTitle,
  getHighResPoster,
};
