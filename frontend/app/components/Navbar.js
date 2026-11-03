'use client';

import { useState, useRef, useEffect } from 'react';
import { translations } from '../utils/translations';
import { COMPREHENSIVE_CATALOG } from '../data/catalog';
import { getBackendUrl } from '../utils/apiConfig';

export default function Navbar({
  user,
  onOpenAuth,
  onLogout,
  language = 'en',
  onLanguageChange,
  onOpenSettings,
  onPlayMovie,
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const searchRef = useRef(null);
  const userMenuRef = useRef(null);
  const t = translations[language] || translations.en;

  const userInitial = user
    ? (user.name || user.email || 'U').trim().charAt(0).toUpperCase()
    : 'U';

  useEffect(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) {
      setSearchResults([]);
      return;
    }

    const localFiltered = COMPREHENSIVE_CATALOG.filter((item) => {
      const titleMatch = (item.title || '').toLowerCase().includes(query);
      const artistMatch = (item.artist || '').toLowerCase().includes(query);
      const albumMatch = (item.album || '').toLowerCase().includes(query);
      const typeMatch = (item.type || '').toLowerCase().includes(query);
      return titleMatch || artistMatch || albumMatch || typeMatch;
    });

    setSearchResults(localFiltered);

    const timeout = setTimeout(() => {
      const backendUrl = getBackendUrl();
      fetch(`${backendUrl}/api/movies/youtube-search?q=${encodeURIComponent(query)}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success && Array.isArray(data.results) && data.results.length > 0) {
            setSearchResults((prev) => {
              const existingIds = new Set(prev.map((i) => i.trailerYoutubeId));
              const newUnique = data.results.filter((i) => !existingIds.has(i.trailerYoutubeId));
              return [...prev, ...newUnique];
            });
          }
        })
        .catch(() => {

        });
    }, 280);

    return () => clearTimeout(timeout);
  }, [searchQuery]);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setIsSearchOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const handleSelectResult = (item) => {
    setSearchQuery('');
    setIsSearchOpen(false);
    onPlayMovie && onPlayMovie(item);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const query = searchQuery.trim();
    if (!query) return;

    if (searchResults.length > 0) {
      handleSelectResult(searchResults[0]);
    } else {

      handleSelectResult({
        searchQuery: query,
        title: query,
        quality: '4K Ultra HD',
        type: 'stream',
        year: '2024',
      });
    }
  };

  return (
    <div className="nav">
      
      <div
        className="logo"
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        style={{ cursor: 'pointer' }}
      >
        <img src="/custom-logo.png" alt="Music logo" />
      </div>

      <div className="nav-search-container" ref={searchRef}>
        <form className={`nav-search-box ${isSearchOpen ? 'focused' : ''}`} onSubmit={handleSearchSubmit}>
          <input
            type="text"
            className="nav-search-input"
            placeholder={t.searchPlaceholder}
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setIsSearchOpen(true);
            }}
            onFocus={() => setIsSearchOpen(true)}
          />

          {searchQuery && (
            <button
              type="button"
              className="search-clear-btn"
              onClick={() => {
                setSearchQuery('');
                setSearchResults([]);
              }}
              title="Clear"
            >
              &times;
            </button>
          )}

          <button type="submit" className="search-submit-btn" title="Search (Enter)">
            <i className="fa-solid fa-magnifying-glass"></i>
          </button>
        </form>

        {isSearchOpen && searchQuery.trim() && (
          <div className="search-dropdown-menu">
            <div className="search-results-header">
              <span>{t.allResults} ({searchResults.length})</span>
            </div>

            <div className="search-results-list">
              
              <div
                className="search-result-item search-live-stream-item"
                onClick={() =>
                  handleSelectResult({
                    searchQuery: searchQuery.trim(),
                    title: searchQuery.trim(),
                    type: 'stream',
                    year: '2024',
                  })
                }
              >
                <div className="search-live-stream-icon">
                  <i className="fa-solid fa-circle-play"></i>
                </div>
                <div className="result-info">
                  <div className="result-title-row">
                    <span className="result-title">Stream "{searchQuery.trim()}"</span>
                  </div>
                  <span className="result-subtext">Click or press Enter to stream now</span>
                </div>
                <button type="button" className="result-play-btn" title="Play Now">
                  <i className="fa-solid fa-play"></i>
                </button>
              </div>

              {searchResults.map((item) => (
                <div
                  key={item.id}
                  className="search-result-item"
                  onClick={() => handleSelectResult(item)}
                >
                  <img
                    src={item.poster}
                    alt={item.title}
                    className="result-thumb"
                    onError={(e) => {
                      e.target.src = '/logo1.jpg';
                    }}
                  />
                  <div className="result-info">
                    <div className="result-title-row">
                      <span className="result-title">{item.title}</span>
                    </div>
                    <span className="result-subtext">
                      {item.artist || item.album || item.year || ''}{' '}
                      <span className="result-type-badge">
                        {item.type === 'song' ? t.song : t.movie}
                      </span>
                    </span>
                  </div>
                  <button type="button" className="result-play-btn" title="Stream Now">
                    <i className="fa-solid fa-play"></i>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="nav-item">
        
        <div className="nav-language-wrap">
          <select
            value={language}
            onChange={(e) => onLanguageChange && onLanguageChange(e.target.value)}
            className="language-btn no-icon"
            aria-label="Language selection"
          >
            <option value="en">English</option>
            <option value="hi">हिन्दी</option>
          </select>
        </div>

        {user ? (
          
          <div className="user-profile-menu-container" ref={userMenuRef}>
            <button
              type="button"
              className="user-avatar-only-btn"
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              aria-label="User Profile"
              title={user.name || user.email}
            >
              <span className="user-single-letter">{userInitial}</span>
            </button>

            {isUserMenuOpen && (
              <div className="user-dropdown-card">
                <div className="user-dropdown-header">
                  <div className="user-card-avatar">
                    <span className="user-dropdown-initial">{userInitial}</span>
                  </div>
                  <div className="user-card-details">
                    <strong className="user-card-name">{user.name || user.email.split('@')[0]}</strong>
                    <span className="user-card-email">{user.email}</span>
                  </div>
                </div>

                <div className="dropdown-divider"></div>

                <button
                  type="button"
                  className="dropdown-menu-item"
                  onClick={() => {
                    setIsUserMenuOpen(false);
                    onOpenSettings && onOpenSettings();
                  }}
                >
                  <i className="fa-solid fa-gear"></i>
                  <span>{t.settings}</span>
                </button>

                <div className="dropdown-divider"></div>

                <button
                  type="button"
                  className="dropdown-menu-item sign-out-item"
                  onClick={() => {
                    setIsUserMenuOpen(false);
                    onLogout && onLogout();
                  }}
                >
                  <i className="fa-solid fa-arrow-right-from-bracket"></i>
                  <span>{t.signOut}</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          
          <button
            type="button"
            className="nav-btn-signin"
            onClick={() => onOpenAuth('signin')}
          >
            {t.signIn}
          </button>
        )}
      </div>
    </div>
  );
}
