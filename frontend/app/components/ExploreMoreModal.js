'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import { COMPREHENSIVE_CATALOG } from '../data/catalog';
import { TRENDING_SONGS } from '../data/songs';

export default function ExploreMoreModal({
  isOpen,
  onClose,
  onPlayMovie,
  language = 'en',
  user,
  onOpenAuth,
  onLogout,
  onLanguageChange,
  onOpenSettings,
}) {
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [liveResults, setLiveResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);
  const gridScrollRef = useRef(null);

  const [displayLimit, setDisplayLimit] = useState(16);
  const [extraLoadedItems, setExtraLoadedItems] = useState([]);
  const [freshOnRefreshItems, setFreshOnRefreshItems] = useState([]);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [fetchPageIndex, setFetchPageIndex] = useState(0);

  const shuffleList = (list) => {
    const array = [...list];
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  };

  const [baseSongs, setBaseSongs] = useState(TRENDING_SONGS);
  const [baseCatalog, setBaseCatalog] = useState(COMPREHENSIVE_CATALOG);

  useEffect(() => {
    // Client-side shuffle after hydration to avoid any text mismatch error
    setBaseSongs(shuffleList(TRENDING_SONGS));
    setBaseCatalog(shuffleList(COMPREHENSIVE_CATALOG));
  }, []);

  const MORE_TOPICS = [
    'latest bollywood songs 2024',
    'trending romantic songs hindi',
    'punjabi viral party songs',
    'top blockbuster movie songs hindi',
    'arijit singh hit songs',
    'best web series trailers hindi',
  ];

  useEffect(() => {
    const FRESH_SEARCH_TOPICS = [
      'latest bollywood songs 2024 trending',
      'top trending hindi songs',
      'new romantic songs bollywood',
      'viral punjabi songs 2024',
      'superhit hindi songs',
      'arijit singh latest songs',
    ];
    const q = FRESH_SEARCH_TOPICS[Math.floor(Math.random() * FRESH_SEARCH_TOPICS.length)];
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';
    fetch(`${backendUrl}/api/movies/youtube-search?q=${encodeURIComponent(q)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.results) && data.results.length > 0) {
          setFreshOnRefreshItems(shuffleList(data.results));
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const q = searchQuery.trim();
    if (!q) {
      setLiveResults([]);
      setIsSearching(false);
      return;
    }

    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';
    setIsSearching(true);
    const timeout = setTimeout(() => {
      fetch(`${backendUrl}/api/movies/youtube-search?q=${encodeURIComponent(q)}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success && Array.isArray(data.results)) {
            setLiveResults(data.results);
          }
        })
        .catch(() => {})
        .finally(() => setIsSearching(false));
    }, 280);

    return () => clearTimeout(timeout);
  }, [searchQuery]);

  const userInitial = user
    ? (user.name || user.email || 'U').trim().charAt(0).toUpperCase()
    : 'U';

  const handleLogoClick = () => {
    onClose();
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    if (!isOpen) return;
    const originalBodyOverflow = document.body.style.overflow;
    const originalHtmlOverflow = document.documentElement.style.overflow;

    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    document.body.classList.add('explore-modal-active');
    document.documentElement.classList.add('explore-modal-active');

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (
          document.querySelector('.netflix-player-container') ||
          document.querySelector('.auth-modal-backdrop') ||
          document.querySelector('.settings-modal-backdrop')
        ) {
          return;
        }
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = originalBodyOverflow;
      document.documentElement.style.overflow = originalHtmlOverflow;
      document.body.classList.remove('explore-modal-active');
      document.documentElement.classList.remove('explore-modal-active');
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const allMediaItems = useMemo(() => {
    const seenPosters = new Set();
    const seenYoutubeIds = new Set();
    const seenTitles = new Set();
    const uniqueList = [];

    const addItem = (item) => {
      const normTitle = (item.title || '').toLowerCase().replace(/[^a-z0-9]/g, '');
      const ytId = item.trailerYoutubeId;
      const poster = item.poster;

      if (ytId && seenYoutubeIds.has(ytId)) return;
      if (poster && seenPosters.has(poster)) return;
      if (normTitle && seenTitles.has(normTitle)) return;

      if (ytId) seenYoutubeIds.add(ytId);
      if (poster) seenPosters.add(poster);
      if (normTitle) seenTitles.add(normTitle);

      uniqueList.push({
        ...item,
        duration: item.duration || (item.type === 'song' ? '3:45' : '2h 15m'),
        views: item.views || `${((uniqueList.length * 7 + 23) % 75) + 20}M views`,
        uploaded: item.uploaded || '2 weeks ago',
      });
    };

    freshOnRefreshItems.forEach(addItem);

    baseSongs.forEach(addItem);

    baseCatalog.forEach(addItem);

    extraLoadedItems.forEach(addItem);

    return uniqueList;
  }, [freshOnRefreshItems, baseSongs, baseCatalog, extraLoadedItems]);

  useEffect(() => {
    setDisplayLimit(16);
    if (gridScrollRef.current) {
      gridScrollRef.current.scrollTop = 0;
    }
  }, [activeFilter, searchQuery]);

  const fetchMoreFromYouTube = () => {
    if (isLoadingMore) return;
    setIsLoadingMore(true);
    const topic = MORE_TOPICS[fetchPageIndex % MORE_TOPICS.length];
    setFetchPageIndex((prev) => prev + 1);

    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';
    fetch(`${backendUrl}/api/movies/youtube-search?q=${encodeURIComponent(topic)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.results) && data.results.length > 0) {
          setExtraLoadedItems((prev) => {
            const seen = new Set(prev.map((i) => i.trailerYoutubeId || i.id));
            const newOnes = data.results.filter((i) => !seen.has(i.trailerYoutubeId || i.id));
            return [...prev, ...newOnes];
          });
          setDisplayLimit((prev) => prev + 12);
        }
      })
      .catch(() => {})
      .finally(() => setIsLoadingMore(false));
  };

  const handleGridScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - scrollTop - clientHeight < 360) {
      if (displayLimit < filteredItems.length) {
        setDisplayLimit((prev) => Math.min(prev + 12, filteredItems.length));
      } else if (!isLoadingMore && fetchPageIndex < MORE_TOPICS.length) {
        fetchMoreFromYouTube();
      }
    }
  };

  const filteredItems = useMemo(() => {
    let list = allMediaItems;
    if (activeFilter === 'songs') {
      list = list.filter((i) => i.type === 'song');
    } else if (activeFilter === 'movies') {
      list = list.filter((i) => i.type === 'movie');
    } else if (activeFilter === 'series') {
      list = list.filter((i) => i.type === 'series');
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const localMatches = list.filter(
        (i) =>
          (i.title || '').toLowerCase().includes(q) ||
          (i.artist || '').toLowerCase().includes(q) ||
          (i.album || '').toLowerCase().includes(q)
      );

      const seenIds = new Set(localMatches.map((i) => i.id || i.trailerYoutubeId));
      const seenTitles = new Set(localMatches.map((i) => (i.title || '').toLowerCase().trim()));

      const newLive = liveResults.filter(
        (item) =>
          !seenIds.has(item.id) &&
          !seenIds.has(item.trailerYoutubeId) &&
          !seenTitles.has((item.title || '').toLowerCase().trim())
      );

      return [...localMatches, ...newLive];
    }
    return list;
  }, [allMediaItems, activeFilter, searchQuery, liveResults]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (!q) return;

    if (filteredItems.length > 0) {
      onPlayMovie && onPlayMovie(filteredItems[0]);
    } else {

      onPlayMovie &&
        onPlayMovie({
          searchQuery: q,
          title: q,
          quality: '4K Ultra HD',
          type: 'stream',
          year: '2024',
        });
    }
  };

  if (!isOpen) return null;

  const isHindi = language === 'hi';

  const filterChips = [
    { key: 'all', label: isHindi ? 'सभी' : 'All' },
    { key: 'songs', label: isHindi ? 'ट्रेंडिंग गाने' : 'Trending Songs' },
    { key: 'movies', label: isHindi ? 'फिल्में' : 'Blockbuster Movies' },
    { key: 'series', label: isHindi ? 'वेब सीरीज़' : 'Web Series' },
  ];

  return (
    <div className="youtube-explore-modal-backdrop" onClick={onClose}>
      <div className="youtube-explore-container" onClick={(e) => e.stopPropagation()}>
        
        <div className="modal-navbar-wrapper">
          <div className="nav modal-nav">
            
            <div
              className="logo"
              onClick={handleLogoClick}
              style={{ cursor: 'pointer' }}
              title={isHindi ? 'डैशबोर्ड पर जाएं' : 'Go to Dashboard'}
            >
              <img src="/custom-logo.png" alt="Music logo" />
            </div>

            <div className="nav-search-container modal-nav-search">
              <form
                className={`nav-search-box ${isSearchFocused || searchQuery.trim() ? 'focused' : ''}`}
                onSubmit={handleSearchSubmit}
              >
                <input
                  type="text"
                  className="nav-search-input"
                  placeholder={
                    isHindi
                      ? 'गाने, फिल्में, आर्टिस्ट खोजें (A to Z)...'
                      : 'Search movies, songs, artists (A to Z)...'
                  }
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setIsSearchFocused(false)}
                />
                {searchQuery && (
                  <button
                    type="button"
                    className="search-clear-btn"
                    onClick={() => {
                      setSearchQuery('');
                      setLiveResults([]);
                      setIsSearchFocused(false);
                    }}
                    title="Clear"
                  >
                    &times;
                  </button>
                )}
                <button
                  type="submit"
                  className="search-submit-btn"
                  title="Search & Play (Enter)"
                >
                  <i className="fa-solid fa-magnifying-glass"></i>
                </button>
              </form>
            </div>

            <div className="nav-item modal-nav-right">
              
              <div className="nav-language-wrap">
                <select
                  value={language}
                  onChange={(e) =>
                    onLanguageChange && onLanguageChange(e.target.value)
                  }
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
                    className="user-avatar-only-btn circular-profile-btn"
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    aria-label="User Profile"
                    title={user.name || user.email}
                  >
                    <span className="user-single-letter">{userInitial}</span>
                  </button>

                  {isUserMenuOpen && (
                    <div className="user-dropdown-card">
                      <div className="user-dropdown-header">
                        <div className="user-card-avatar circular-avatar">
                          <span className="user-dropdown-initial">
                            {userInitial}
                          </span>
                        </div>
                        <div className="user-card-details">
                          <strong className="user-card-name">
                            {user.name || user.email.split('@')[0]}
                          </strong>
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
                        <span>{isHindi ? 'सेटिंग्स' : 'Settings'}</span>
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
                        <span>{isHindi ? 'साइन आउट' : 'Sign Out'}</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  type="button"
                  className="nav-btn-signin"
                  onClick={() => {
                    onOpenAuth && onOpenAuth('signin');
                  }}
                >
                  {isHindi ? 'साइन इन' : 'Sign In'}
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="explore-chips-bar">
          <div className="yt-filter-chips-row">
            {filterChips.map((chip) => (
              <button
                key={chip.key}
                type="button"
                className={`yt-filter-chip ${activeFilter === chip.key ? 'active' : ''}`}
                onClick={() => setActiveFilter(chip.key)}
              >
                {chip.label}
              </button>
            ))}
          </div>
        </div>

        {searchQuery.trim() && (
          <div
            className="search-stream-action-banner"
            onClick={() => {
              onPlayMovie &&
                onPlayMovie({
                  searchQuery: searchQuery.trim(),
                  title: searchQuery.trim(),
                  quality: '4K Ultra HD',
                  type: 'stream',
                  year: '2024',
                });
            }}
            title={`Play "${searchQuery.trim()}" in 4K`}
          >
            <div className="stream-action-left">
              <i className="fa-solid fa-circle-play stream-action-icon"></i>
              <div className="stream-action-text">
                <strong>
                  {isHindi
                    ? `"${searchQuery.trim()}" को 4K Ultra HD में तुरंत स्ट्रीम करें`
                    : `Stream "${searchQuery.trim()}" live in 4K Ultra HD`}
                </strong>
                <span>
                  {isHindi
                    ? isSearching
                      ? 'YouTube से खोज रहे हैं...'
                      : 'A to Z किसी भी गाने या फिल्म को ऑनलाइन चलाने के लिए क्लिक करें'
                    : isSearching
                    ? 'Searching YouTube Data API v3...'
                    : 'Click to stream any song, movie or artist online instantly'}
                </span>
              </div>
            </div>
            <span className="stream-action-tag">LIVE 4K</span>
          </div>
        )}

        <div
          className="yt-video-grid-scroll"
          ref={gridScrollRef}
          onScroll={handleGridScroll}
        >
          <div className="yt-video-grid">
            {filteredItems.slice(0, displayLimit).map((item) => (
              <div
                key={item.id}
                className="yt-video-card"
                onClick={() => {
                  onPlayMovie && onPlayMovie(item);
                }}
                title={`Click to play ${item.title}`}
              >
                
                <div className="yt-thumb-wrap">
                  <img
                    src={item.poster}
                    alt={item.title}
                    className="yt-thumb-img"
                    loading="lazy"
                    onError={(e) => {
                      e.target.src = '/logo1.jpg';
                    }}
                  />
                  
                  <span className="yt-duration-pill">
                    {item.duration || '3:45'}
                  </span>
                  
                  <div className="yt-hover-play">
                    <div className="yt-hover-icon">
                      <i className="fa-solid fa-play"></i>
                    </div>
                  </div>
                </div>

                <div className="yt-details-wrap">
                  <div className="yt-channel-avatar">
                    <i
                      className={
                        item.type === 'song'
                          ? 'fa-solid fa-music'
                          : 'fa-solid fa-film'
                      }
                    ></i>
                  </div>
                  <div className="yt-meta-content">
                    <h3 className="yt-title" title={item.title}>
                      {item.title}
                    </h3>
                    <p className="yt-channel-title">
                      {item.artist || item.album || 'Official Channel'}{' '}
                      <i
                        className="fa-solid fa-circle-check yt-verified-tick"
                        title="Verified"
                      ></i>
                    </p>
                    <p className="yt-view-meta">
                      {item.views || '45M views'} • {item.year || '2024'}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {displayLimit < filteredItems.length && (
            <div className="load-more-sentinel">
              <button
                type="button"
                className="load-more-btn"
                onClick={() => setDisplayLimit((prev) => Math.min(prev + 12, filteredItems.length))}
              >
                <i className="fa-solid fa-angles-down"></i>
                <span>{isHindi ? 'और गाने व फिल्में लोड करें' : 'Load More Videos'}</span>
              </button>
            </div>
          )}

          {isLoadingMore && (
            <div className="infinite-scroll-loader">
              <i className="fa-solid fa-circle-notch fa-spin"></i>
              <span>{isHindi ? 'YouTube से और वीडियो लोड हो रहे हैं...' : 'Loading more videos from YouTube...'}</span>
            </div>
          )}

          {filteredItems.length === 0 && (
            <div className="yt-no-results">
              <i className="fa-solid fa-compact-disc"></i>
              <p>
                {isHindi
                  ? `"${searchQuery}" के लिए कोई गाना या फिल्म नहीं मिली`
                  : `No videos found for "${searchQuery}"`}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
