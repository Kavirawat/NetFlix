'use client';

import { useRef, useState, useEffect } from 'react';
import { translations } from '../utils/translations';
import { getBackendUrl } from '../utils/apiConfig';

const TRENDING_ITEMS = [
  {
    rank: 1,
    id: 'animal',
    imdbId: 'tt13751694',
    title: 'Animal',
    poster: '/logo1.jpg',
    numImg: '/num1.png',
    matchScore: '99% Match',
    rating: '8.4',
    year: '2023',
    ageRating: 'A (18+)',
    duration: '3h 21m',
    overview: 'A son undergoes a remarkable transformation as the bond with his father begins to fracture, unleashing an all-consuming path of revenge.',
    trailerYoutubeId: '8FkLRUJj-o0',
    videoUrl: 'https://www.youtube.com/watch?v=8FkLRUJj-o0',
  },
  {
    rank: 2,
    id: 'leo',
    imdbId: 'tt15654328',
    title: 'Leo',
    poster: '/logo2.jpg',
    numImg: '/num2.png',
    matchScore: '97% Match',
    rating: '7.9',
    year: '2023',
    ageRating: 'U/A 16+',
    duration: '2h 44m',
    overview: 'A mild-mannered cafe owner becomes a local hero through an act of violence, setting off repercussions with a dangerous drug cartel.',
    trailerYoutubeId: 'Po3jStA673E',
    videoUrl: 'https://www.youtube.com/watch?v=Po3jStA673E',
  },
  {
    rank: 3,
    id: 'salaar',
    imdbId: 'tt13927994',
    title: 'Salaar: Part 1 – Ceasefire',
    poster: '/logo3.jpg',
    numImg: '/num3.png',
    matchScore: '96% Match',
    rating: '8.1',
    year: '2023',
    ageRating: 'A (18+)',
    duration: '2h 55m',
    overview: 'A gang leader makes a promise to a dying friend and takes on other criminal gangs in the lawless city of Khansaar.',
    trailerYoutubeId: 'HihakYi5M2I',
    videoUrl: 'https://www.youtube.com/watch?v=HihakYi5M2I',
  },
  {
    rank: 4,
    id: 'jawan',
    imdbId: 'tt15354916',
    title: 'Jawan',
    poster: '/logo4.jpg',
    numImg: '/num4.png',
    matchScore: '95% Match',
    rating: '7.8',
    year: '2023',
    ageRating: 'U/A 16+',
    duration: '2h 49m',
    overview: 'A prison warden recruits inmates to commit outrageous crimes that shed light on corruption and injustice in society.',
    trailerYoutubeId: 'COv52Qyctws',
    videoUrl: 'https://www.youtube.com/watch?v=COv52Qyctws',
  },
  {
    rank: 5,
    id: 'railway-men',
    imdbId: 'tt16296870',
    title: 'The Railway Men',
    poster: '/logo5.jpg',
    numImg: '/num5.png',
    matchScore: '98% Match',
    rating: '8.5',
    year: '2023',
    ageRating: 'U/A 16+',
    duration: '4 Episodes',
    overview: 'After a deadly gas leaks from a factory in Bhopal, brave railway workers risk their lives to save others in the face of an unspeakable disaster.',
    trailerYoutubeId: 'iD3TZ_Xxc14',
    videoUrl: 'https://www.youtube.com/watch?v=iD3TZ_Xxc14',
  },
  {
    rank: 6,
    id: 'jaane-jaan',
    imdbId: 'tt15748830',
    title: 'Jaane Jaan',
    poster: '/logo6.jpeg',
    numImg: '/num6.png',
    matchScore: '93% Match',
    rating: '7.5',
    year: '2023',
    ageRating: 'U/A 16+',
    duration: '2h 19m',
    overview: 'A single mother caught in a crime gets unexpected help from her gifted math teacher neighbor, while a tenacious cop probes the case.',
    trailerYoutubeId: 'GHX6yT9Lxfo',
    videoUrl: 'https://www.youtube.com/watch?v=GHX6yT9Lxfo',
  },
  {
    rank: 7,
    id: 'khufiya',
    imdbId: 'tt15433600',
    title: 'Khufiya',
    poster: '/logo7.jpg',
    numImg: '/num7.png',
    matchScore: '91% Match',
    rating: '7.2',
    year: '2023',
    ageRating: 'A (18+)',
    duration: '2h 37m',
    overview: 'An operative at India\'s intelligence agency is tasked with tracking down a mole who is selling defense secrets.',
    trailerYoutubeId: 'ByojhBwG_-E',
    videoUrl: 'https://www.youtube.com/watch?v=ByojhBwG_-E',
  },
  {
    rank: 8,
    id: 'mission-raniganj',
    imdbId: 'tt21262240',
    title: 'Mission Raniganj',
    poster: '/logo8.jpg',
    numImg: '/num8.png',
    matchScore: '92% Match',
    rating: '7.6',
    year: '2023',
    ageRating: 'U/A 13+',
    duration: '2h 14m',
    overview: 'Mining engineer Jaswant Singh Gill leads a daring rescue mission to save 65 miners trapped inside a flooded coal mine in 1989.',
    trailerYoutubeId: 'QFf91hnpClI',
    videoUrl: 'https://www.youtube.com/watch?v=QFf91hnpClI',
  },
  {
    rank: 9,
    id: 'omg-2',
    imdbId: 'tt15732324',
    title: 'OMG 2',
    poster: '/logo9.jpeg',
    numImg: '/num9.png',
    matchScore: '94% Match',
    rating: '7.7',
    year: '2023',
    ageRating: 'A (18+)',
    duration: '2h 36m',
    overview: 'An unhappy civilian asks the court to mandate comprehensive education in schools after an unfortunate incident shakes his family.',
    trailerYoutubeId: 'Y6ZKXqM7HNQ',
    videoUrl: 'https://www.youtube.com/watch?v=Y6ZKXqM7HNQ',
  },
  {
    rank: 10,
    id: 'lust-stories-2',
    imdbId: 'tt27989067',
    title: 'Lust Stories 2',
    poster: '/logo10.jpeg',
    numImg: '/num10.png',
    matchScore: '89% Match',
    rating: '6.8',
    year: '2023',
    ageRating: 'A (18+)',
    duration: '2h 12m',
    overview: 'Four eminent Indian directors explore relationships, desires and secrets in four unique short films.',
    trailerYoutubeId: '4aanxonXWiM',
    videoUrl: 'https://www.youtube.com/watch?v=4aanxonXWiM',
  },
];

export default function TrendingSlider({ onPlayMovie, language = 'en' }) {
  const containerRef = useRef(null);
  const cardRefs = useRef([]);
  const [trendingItems, setTrendingItems] = useState(TRENDING_ITEMS);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const t = translations[language] || translations.en;

  useEffect(() => {
    const backendUrl = getBackendUrl();
    fetch(`${backendUrl}/api/movies/trending`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.trending && data.trending.length > 0) {
          setTrendingItems(data.trending);
        }
      })
      .catch((err) => {
        console.warn('Using local trending list:', err.message);
      });
  }, []);

  useEffect(() => {
    if (isPaused || trendingItems.length === 0) return;

    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % trendingItems.length);
    }, 3500);

    return () => clearInterval(timer);
  }, [isPaused, trendingItems.length]);

  useEffect(() => {
    const card = cardRefs.current[activeIndex];
    const container = containerRef.current;
    if (card && container) {
      const cardLeft = card.offsetLeft;
      const cardWidth = card.offsetWidth;
      const containerWidth = container.offsetWidth;
      const targetScroll = cardLeft - (containerWidth / 2) + (cardWidth / 2);
      container.scrollTo({
        left: Math.max(0, targetScroll),
        behavior: 'smooth',
      });
    }
  }, [activeIndex]);

  return (
    <section
      className="trending-auto-section"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      
      <div className="trending-header-bar">
        <h2 className="section-title">{t.trendingMovies}</h2>
      </div>

      <div className="trending-wrapper">
        <div className="cards-container" ref={containerRef}>
          {trendingItems.map((item, idx) => {
            const isActive = idx === activeIndex;
            return (
              <div
                key={item.rank}
                ref={(el) => (cardRefs.current[idx] = el)}
                className={`trending-card ${isActive ? 'active-trending-card' : ''}`}
                title={`#${item.rank} ${item.title} — Click to Play Video`}
                onClick={() => {
                  setActiveIndex(idx);
                  onPlayMovie && onPlayMovie(item);
                }}
              >
                
                <div className="card-rank-wrap">
                  <img
                    src={item.numImg}
                    alt={`Rank ${item.rank}`}
                    className="card-rank-img"
                    loading="lazy"
                  />
                </div>

                <div className="card-poster-frame">
                  <img
                    src={item.poster}
                    alt={item.title}
                    className="card-poster"
                    loading="lazy"
                  />
                  <div className="card-play-hover-overlay">
                    <div className="card-play-icon-circle">
                      <i className="fa-solid fa-play"></i>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
