'use client';

import { useState } from 'react';
import HeroBanner from './HeroBanner';
import { translations } from '../utils/translations';

export default function Hero({ onOpenAuth, user, onPlayMovie, language = 'en' }) {
  const [email, setEmail] = useState('');
  const t = translations[language] || translations.en;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (user) {
      onPlayMovie && onPlayMovie({
        id: 'animal',
        title: 'Animal',
        trailerYoutubeId: '8FkLRUJj-o0',
        rating: '8.4',
        matchScore: '99% Match',
        year: '2023',
        ageRating: 'A (18+)',
        duration: '3h 21m',
        overview: 'A son undergoes a remarkable transformation as the bond with his father begins to fracture, unleashing an all-consuming path of revenge.',
      });
    } else {
      onOpenAuth('signup', email);
    }
  };

  if (user) {
    return <HeroBanner language={language} onPlayMovie={onPlayMovie} />;
  }

  return (
    <div className="netflix-hero-section">
      <div className="netflix-hero-overlay"></div>

      <div className="netflix-hero-content">
        <h1 className="netflix-hero-title">
          {t.heroTitle}
        </h1>
        <p className="netflix-hero-subtitle">
          {t.heroSubtitle}
        </p>

        <div className="netflix-hero-form-wrap">
          <h3 className="netflix-hero-cta">
            {t.heroCta}
          </h3>

          <form className="netflix-email-form" onSubmit={handleSubmit}>
            <div className="netflix-input-container">
              <input
                type="email"
                id="heroEmailInput"
                className="netflix-email-input"
                placeholder={t.emailPlaceholder}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="netflix-get-started-btn">
              {t.getStarted} <i className="fa-solid fa-greater-than"></i>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
