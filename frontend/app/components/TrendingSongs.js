'use client';

import { useRef, useState } from 'react';
import { TRENDING_SONGS } from '../data/songs';
import { translations } from '../utils/translations';
import ExploreMoreModal from './ExploreMoreModal';

export default function TrendingSongs({
  onPlayMovie,
  language = 'en',
  user,
  onOpenAuth,
  onLogout,
  onLanguageChange,
  onOpenSettings,
}) {
  const containerRef = useRef(null);
  const [songs] = useState(TRENDING_SONGS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const t = translations[language] || translations.en;

  const initialSongs = songs.slice(0, 6);

  const scrollLeft = () => {
    if (containerRef.current) {
      containerRef.current.scrollBy({ left: -450, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (containerRef.current) {
      containerRef.current.scrollBy({ left: 450, behavior: 'smooth' });
    }
  };

  const isHindi = language === 'hi';

  return (
    <>
      <section className="trending-songs-section">
        <div className="trending-header-bar">
          <div className="trending-title-group">
            <h2 className="section-title">
              <i className="fa-solid fa-music" style={{ color: '#e50914', marginRight: '0.65rem' }}></i>
              {t.trendingSongs}
            </h2>
          </div>
        </div>

        <div className="trending-wrapper">
          <button
            type="button"
            className="slider-arrow arrow-left"
            onClick={scrollLeft}
            aria-label="Scroll left"
          >
            <i className="fa-solid fa-chevron-left"></i>
          </button>

          <div className="songs-cards-container" ref={containerRef}>
            {initialSongs.map((song) => (
              <div
                key={song.id}
                className="song-card"
                title={`${song.title} - ${song.artist} — Click to Play`}
                onClick={() => onPlayMovie && onPlayMovie(song)}
              >
                
                <div className="song-thumb-frame">
                  <img
                    src={song.poster}
                    alt={song.title}
                    className="song-thumb-img"
                    loading="lazy"
                    onError={(e) => {
                      e.target.src = '/logo1.jpg';
                    }}
                  />

                  <div className="card-play-hover-overlay">
                    <div className="card-play-icon-circle">
                      <i className="fa-solid fa-play"></i>
                    </div>
                  </div>
                </div>

                <div className="song-card-info">
                  <h3 className="song-card-title">{song.title}</h3>
                  <p className="song-card-artist">{song.artist}</p>
                  <div className="song-card-meta">
                    <span className="song-album-name">{song.album}</span>
                    <span className="song-duration">{song.duration}</span>
                  </div>
                </div>
              </div>
            ))}

            <div
              className="song-card song-more-card"
              onClick={() => setIsModalOpen(true)}
              title={isHindi ? 'और गाने व फिल्में देखें' : 'Explore More Songs & Movies'}
            >
              <div className="song-more-inner">
                <div className="more-icon-circle">
                  <i className="fa-solid fa-play"></i>
                </div>
                <h3 className="more-card-title">{isHindi ? 'और देखें' : 'Explore More'}</h3>
                <p className="more-card-subtext">
                  {isHindi ? 'YouTube जैसे 50+ गाने और फिल्में' : '50+ Songs & Blockbusters'}
                </p>
              </div>
            </div>
          </div>

          <button
            type="button"
            className="slider-arrow arrow-right"
            onClick={scrollRight}
            aria-label="Scroll right"
          >
            <i className="fa-solid fa-chevron-right"></i>
          </button>
        </div>
      </section>

      <ExploreMoreModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onPlayMovie={onPlayMovie}
        language={language}
        user={user}
        onOpenAuth={onOpenAuth}
        onLogout={onLogout}
        onLanguageChange={onLanguageChange}
        onOpenSettings={onOpenSettings}
      />
    </>
  );
}
