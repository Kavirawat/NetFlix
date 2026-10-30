'use client';

import { useState, useEffect } from 'react';
import { translations } from '../utils/translations';

const FEATURED_BANNERS = [
  {
    id: 'animal',
    title: 'Animal',
    type: 'MUSIC',
    tagline: 'Can love turn you into a monster?',
    overview: 'A son undergoes a violent transformation as the bond with his father begins to fracture, unleashing an all-consuming path of revenge and raw action.',
    backdropUrl: '/background-hero.webp',
    rating: '8.4',
    matchScore: '99% Match',
    year: '2023',
    ageRating: 'A (18+)',
    duration: '3h 21m',
    trailerYoutubeId: '8FkLRUJj-o0',
  },
  {
    id: 'jawan',
    title: 'Jawan',
    type: 'MUSIC',
    tagline: 'Ready Chief?',
    overview: 'A prison warden recruits inmates to commit outrageous crimes that shed light on corruption and injustice in society while uncovering secrets of his past.',
    backdropUrl: '/logo4.jpg',
    rating: '7.8',
    matchScore: '98% Match',
    year: '2023',
    ageRating: 'U/A 16+',
    duration: '2h 49m',
    trailerYoutubeId: 'COv52Qyctws',
  },
  {
    id: 'tauba-tauba',
    title: 'Tauba Tauba (Song)',
    type: 'MUSIC',
    tagline: 'The #1 Viral Dance Sensation of the Year',
    overview: 'Watch Vicky Kaushal and Karan Aujla set the dance floor ablaze with the mega-hit track Tauba Tauba in stunning Master Quality.',
    backdropUrl: 'https://img.youtube.com/vi/LK7-_dgAVQE/maxresdefault.jpg',
    rating: '9.2',
    matchScore: '99% Match',
    year: '2024',
    ageRating: 'All Ages',
    duration: '3m 30s',
    trailerYoutubeId: 'LK7-_dgAVQE',
  },
  {
    id: 'salaar',
    title: 'Salaar: Part 1 – Ceasefire',
    type: 'MUSIC',
    tagline: 'A father\'s promise, a city\'s destiny.',
    overview: 'A gang leader makes a promise to a dying friend and takes on other criminal syndicates in the ruthless lawless city of Khansaar.',
    backdropUrl: '/logo3.jpg',
    rating: '8.1',
    matchScore: '96% Match',
    year: '2023',
    ageRating: 'A (18+)',
    duration: '2h 55m',
    trailerYoutubeId: 'HihakYi5M2I',
  },
  {
    id: 'pehle-bhi-main',
    title: 'Pehle Bhi Main (Song)',
    type: 'MUSIC',
    tagline: 'Soul-stirring romantic masterpiece',
    overview: 'Vishal Mishra\'s chartbuster from Animal featuring Ranbir Kapoor and Triptii Dimri streamed in breathtaking High Definition.',
    backdropUrl: 'https://img.youtube.com/vi/iAIBF2ngbWY/maxresdefault.jpg',
    rating: '9.4',
    matchScore: '99% Match',
    year: '2023',
    ageRating: 'All Ages',
    duration: '4m 10s',
    trailerYoutubeId: 'iAIBF2ngbWY',
  },
];

export default function HeroBanner({ language = 'en', onPlayMovie }) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const t = translations[language] || translations.en;

  // Auto-rotate banner every 6.5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIdx((prev) => (prev + 1) % FEATURED_BANNERS.length);
    }, 6500);
    return () => clearInterval(timer);
  }, []);

  const banner = FEATURED_BANNERS[currentIdx];

  const handlePlay = () => {
    onPlayMovie && onPlayMovie(banner);
  };

  return (
    <div className="netflix-browse-banner">
      {/* Background with Vignette Overlays */}
      <div
        className="banner-backdrop-img"
        style={{ backgroundImage: `url(${banner.backdropUrl})` }}
      >
        <div className="banner-vignette-left"></div>
        <div className="banner-vignette-bottom"></div>
      </div>

      {/* Banner Content (Title, Badges, Buttons) */}
      <div className="banner-content-container">
        <div className="banner-badge-row">
          <span className="banner-netflix-tag">{banner.type}</span>
          <span className="banner-top10">
            <i className="fa-solid fa-fire"></i> {t.top10Badge}
          </span>
        </div>

        <h1 className="banner-title">{banner.title}</h1>

        <div className="banner-meta-line">
          <span className="banner-year">{banner.year}</span>
          <span className="banner-age">{banner.ageRating}</span>
          <span className="banner-duration">{banner.duration}</span>
        </div>

        <p className="banner-overview">{banner.overview}</p>

        <div className="banner-actions">
          <button
            type="button"
            className="banner-play-btn"
            onClick={handlePlay}
            title="Stream Now"
          >
            <i className="fa-solid fa-play"></i> {t.play}
          </button>

          <button
            type="button"
            className="banner-info-btn"
            onClick={handlePlay}
            title="View Details"
          >
            <i className="fa-solid fa-circle-info"></i> {t.moreInfo}
          </button>
        </div>
      </div>

      {/* Right-Hand Controls: Indicators */}
      <div className="banner-right-controls">
        {/* Carousel Dots */}
        <div className="banner-dots">
          {FEATURED_BANNERS.map((_, idx) => (
            <button
              key={idx}
              type="button"
              className={`banner-dot ${idx === currentIdx ? 'active' : ''}`}
              onClick={() => setCurrentIdx(idx)}
              aria-label={`Slide ${idx + 1}`}
            ></button>
          ))}
        </div>
      </div>
    </div>
  );
}
