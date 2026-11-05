'use client';

import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { COMPREHENSIVE_CATALOG } from '../data/catalog';
import { TRENDING_SONGS } from '../data/songs';
import { getBackendUrl } from '../utils/apiConfig';

const CATEGORY_TOPICS = {
  all: ['latest bollywood songs 2024', 'blockbuster movie trailers hindi', 'trending web series trailer hindi'],
  songs: ['latest bollywood songs 2024', 'top trending hindi songs', 'arijit singh hit songs'],
  movies: ['blockbuster bollywood movies trailer', 'latest action movie trailers hindi', 'south hindi dubbed movies trailer'],
  series: ['top trending web series hindi', 'netflix series trailer hindi', 'best crime thriller web series'],
  romantic: ['romantic hindi songs 2024', 'arijit singh love songs', 'best bollywood romantic hits'],
  party: ['party dance songs bollywood', 'club party tracks hindi', 'punjabi party dance songs'],
  punjabi: ['punjabi viral songs 2024', 'karan aujla hit songs', 'diljit dosanjh top tracks'],
  action: ['action movie trailers hindi', 'south action trailers hindi dubbed', 'blockbuster thriller trailers'],
  devotional: ['ram bhajan ramayana songs', 'bhakti geet hindi', 'deva deva shiva devotional'],
  arijit: ['arijit singh best songs', 'arijit singh live acoustic', 'arijit singh latest romantic hits'],
};

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
  const sentinelRef = useRef(null);

  const [displayLimit, setDisplayLimit] = useState(16);
  const [extraLoadedItems, setExtraLoadedItems] = useState([]);
  const [freshOnRefreshItems, setFreshOnRefreshItems] = useState([]);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [exhaustedFilters, setExhaustedFilters] = useState({});
  const fetchPageIndexRef = useRef({});
  const filterAttemptsRef = useRef({});

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
    const backendUrl = getBackendUrl();
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

    const backendUrl = getBackendUrl();
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
      if (!item) return;
      const ytId = item.trailerYoutubeId || (typeof item.id === 'string' ? item.id.replace(/^yt-/, '') : item.id);
      const safePoster = item.poster || (ytId ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg` : '/logo1.jpg');
      const normTitle = (item.title || '').toLowerCase().replace(/[^a-z0-9]/g, '');

      if (ytId && seenYoutubeIds.has(ytId)) return;
      if (seenPosters.has(safePoster)) return;
      if (normTitle && seenTitles.has(normTitle)) return;

      if (ytId) seenYoutubeIds.add(ytId);
      seenPosters.add(safePoster);
      if (normTitle) seenTitles.add(normTitle);

      uniqueList.push({
        ...item,
        poster: safePoster,
        type: item.type || 'song',
        duration: item.duration || (item.type === 'song' ? '3:45' : '2h 15m'),
        views: item.views || `${((uniqueList.length * 7 + 23) % 75) + 20}M views`,
        uploaded: item.uploaded || '2 weeks ago',
      });
    };

    // Separate items by type for rich interleaved mixing in "All"
    const songsPool = [];
    const moviesPool = [];
    const seriesPool = [];
    const otherPool = [];

    baseSongs.forEach((item) => {
      const type = item.type || 'song';
      if (type === 'song') songsPool.push({ ...item, type: 'song' });
      else if (type === 'movie') moviesPool.push({ ...item, type: 'movie' });
      else if (type === 'series') seriesPool.push({ ...item, type: 'series' });
      else otherPool.push(item);
    });

    baseCatalog.forEach((item) => {
      const type = item.type || 'movie';
      if (type === 'movie') moviesPool.push({ ...item, type: 'movie' });
      else if (type === 'series') seriesPool.push({ ...item, type: 'series' });
      else if (type === 'song') songsPool.push({ ...item, type: 'song' });
      else otherPool.push(item);
    });

    // Create a perfectly balanced mix: 1 Song, 1 Movie, 1 Web Series, 1 Song, 1 Movie...
    // This ensures every screen and row has Songs, Blockbuster Movies and Web Series genuinely mixed together!
    const mixedStream = [];
    let s = 0, m = 0, sr = 0, f = 0, e = 0;
    const totalItems =
      songsPool.length +
      moviesPool.length +
      seriesPool.length +
      freshOnRefreshItems.length +
      extraLoadedItems.length;

    while (
      mixedStream.length < totalItems &&
      (s < songsPool.length ||
        m < moviesPool.length ||
        sr < seriesPool.length ||
        f < freshOnRefreshItems.length ||
        e < extraLoadedItems.length)
    ) {
      if (s < songsPool.length) mixedStream.push(songsPool[s++]);
      if (m < moviesPool.length) mixedStream.push(moviesPool[m++]);
      if (sr < seriesPool.length) mixedStream.push(seriesPool[sr++]);
      if (f < freshOnRefreshItems.length) mixedStream.push(freshOnRefreshItems[f++]);
      if (s < songsPool.length) mixedStream.push(songsPool[s++]);
      if (m < moviesPool.length) mixedStream.push(moviesPool[m++]);
      if (e < extraLoadedItems.length) mixedStream.push(extraLoadedItems[e++]);
      if (sr < seriesPool.length) mixedStream.push(seriesPool[sr++]);
    }

    otherPool.forEach((item) => mixedStream.push(item));
    mixedStream.forEach(addItem);

    return uniqueList;
  }, [freshOnRefreshItems, baseSongs, baseCatalog, extraLoadedItems]);

  const filteredItems = useMemo(() => {
    let list = allMediaItems;

    if (activeFilter === 'songs') {
      list = list.filter((i) => i.type === 'song');
    } else if (activeFilter === 'movies') {
      list = list.filter((i) => i.type === 'movie');
    } else if (activeFilter === 'series') {
      list = list.filter((i) => i.type === 'series');
    } else if (activeFilter === 'romantic') {
      list = list.filter((i) => {
        if (i.categoryTag === 'romantic') return true;
        const text = `${i.title || ''} ${i.artist || ''} ${i.album || ''} ${i.overview || ''}`.toLowerCase();
        return (
          text.includes('romantic') ||
          text.includes('love') ||
          text.includes('ishq') ||
          text.includes('pyaar') ||
          text.includes('dil') ||
          text.includes('chaleya') ||
          text.includes('kesariya') ||
          text.includes('heeriye') ||
          text.includes('sajni') ||
          text.includes('ve kamleya') ||
          text.includes('satranga') ||
          text.includes('tum se') ||
          text.includes('o maahi') ||
          text.includes('jaane jaan') ||
          text.includes('pehle bhi main') ||
          text.includes('bad newz') ||
          text.includes('heeramandi') ||
          text.includes('lust stories')
        );
      });
    } else if (activeFilter === 'party') {
      list = list.filter((i) => {
        if (i.categoryTag === 'party') return true;
        const text = `${i.title || ''} ${i.artist || ''} ${i.album || ''} ${i.overview || ''}`.toLowerCase();
        return (
          text.includes('party') ||
          text.includes('dance') ||
          text.includes('anthem') ||
          text.includes('beat') ||
          text.includes('tauba') ||
          text.includes('aaj ki raat') ||
          text.includes('aayi nai') ||
          text.includes('pushpa') ||
          text.includes('jhoome jo pathaan') ||
          text.includes('taras') ||
          text.includes('illuminati') ||
          text.includes('dhol') ||
          text.includes('groove') ||
          text.includes('crew')
        );
      });
    } else if (activeFilter === 'punjabi') {
      list = list.filter((i) => {
        if (i.categoryTag === 'punjabi') return true;
        const text = `${i.title || ''} ${i.artist || ''} ${i.album || ''} ${i.overview || ''}`.toLowerCase();
        return (
          text.includes('punjabi') ||
          text.includes('aujla') ||
          text.includes('diljit') ||
          text.includes('arjan') ||
          text.includes('vailly') ||
          text.includes('bhangra') ||
          text.includes('shubh') ||
          text.includes('dhillon') ||
          text.includes('moose') ||
          text.includes('lover') ||
          text.includes('softly') ||
          text.includes('ammy') ||
          text.includes('tauba')
        );
      });
    } else if (activeFilter === 'action') {
      list = list.filter((i) => {
        if (i.categoryTag === 'action') return true;
        const text = `${i.title || ''} ${i.artist || ''} ${i.album || ''} ${i.overview || ''}`.toLowerCase();
        return (
          text.includes('action') ||
          text.includes('thriller') ||
          text.includes('animal') ||
          text.includes('jawan') ||
          text.includes('salaar') ||
          text.includes('leo') ||
          text.includes('extraction') ||
          text.includes('squid') ||
          text.includes('baahubali') ||
          text.includes('war') ||
          text.includes('fighter') ||
          text.includes('kill') ||
          text.includes('pathaan') ||
          text.includes('kalki') ||
          text.includes('kgf') ||
          text.includes('pushpa') ||
          text.includes('rrr') ||
          text.includes('money heist') ||
          text.includes('aavesham') ||
          text.includes('kantara') ||
          text.includes('drishyam') ||
          text.includes('shaitaan') ||
          text.includes('guardians') ||
          text.includes('breaking bad') ||
          text.includes('dark') ||
          text.includes('mission raniganj') ||
          text.includes('gangubai')
        );
      });
    } else if (activeFilter === 'devotional') {
      list = list.filter((i) => {
        if (i.categoryTag === 'devotional') return true;
        const text = `${i.title || ''} ${i.artist || ''} ${i.album || ''} ${i.overview || ''}`.toLowerCase();
        return (
          text.includes('ram') ||
          text.includes('ramayana') ||
          text.includes('deva') ||
          text.includes('shiva') ||
          text.includes('brahmastra') ||
          text.includes('bhakti') ||
          text.includes('devotional') ||
          text.includes('spiritual') ||
          text.includes('chalisa') ||
          text.includes('omg 2') ||
          text.includes('kantara')
        );
      });
    } else if (activeFilter === 'arijit') {
      list = list.filter((i) => {
        if (i.categoryTag === 'arijit') return true;
        const text = `${i.title || ''} ${i.artist || ''} ${i.album || ''}`.toLowerCase();
        return text.includes('arijit');
      });
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

  useEffect(() => {
    setDisplayLimit(16);
    if (gridScrollRef.current) {
      gridScrollRef.current.scrollTop = 0;
    }
  }, [activeFilter, searchQuery]);

  const displayLimitRef = useRef(displayLimit);
  displayLimitRef.current = displayLimit;
  const filteredLengthRef = useRef(filteredItems.length);
  filteredLengthRef.current = filteredItems.length;
  const isLoadingMoreRef = useRef(isLoadingMore);
  isLoadingMoreRef.current = isLoadingMore;
  const activeFilterRef = useRef(activeFilter);
  activeFilterRef.current = activeFilter;
  const exhaustedFiltersRef = useRef(exhaustedFilters);
  exhaustedFiltersRef.current = exhaustedFilters;

  const fetchMoreFromYouTube = useCallback(() => {
    const curFilter = activeFilterRef.current;
    if (isLoadingMoreRef.current || exhaustedFiltersRef.current[curFilter]) return;

    const attempts = filterAttemptsRef.current[curFilter] || 0;
    if (attempts >= 2) {
      setExhaustedFilters((prev) => ({ ...prev, [curFilter]: true }));
      return;
    }
    filterAttemptsRef.current[curFilter] = attempts + 1;

    setIsLoadingMore(true);
    const topicsForFilter = CATEGORY_TOPICS[curFilter] || CATEGORY_TOPICS.all;
    const pageIdx = fetchPageIndexRef.current[curFilter] || 0;
    fetchPageIndexRef.current[curFilter] = pageIdx + 1;
    const topic = topicsForFilter[pageIdx % topicsForFilter.length];

    const backendUrl = getBackendUrl();
    fetch(`${backendUrl}/api/movies/youtube-search?q=${encodeURIComponent(topic)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data && data.success && Array.isArray(data.results) && data.results.length > 0) {
          const tagged = data.results.map((i) => ({
            ...i,
            categoryTag: curFilter,
            type:
              curFilter === 'songs'
                ? 'song'
                : curFilter === 'series'
                ? 'series'
                : curFilter === 'movies'
                ? 'movie'
                : i.type || 'movie',
          }));

          setExtraLoadedItems((prev) => {
            const seen = new Set(prev.map((i) => i.trailerYoutubeId || i.id));
            const newOnes = tagged.filter((i) => !seen.has(i.trailerYoutubeId || i.id));
            return [...prev, ...newOnes];
          });
          setDisplayLimit((prev) => prev + 12);
        } else {
          setExhaustedFilters((prev) => ({ ...prev, [curFilter]: true }));
        }
      })
      .catch(() => {
        setExhaustedFilters((prev) => ({ ...prev, [curFilter]: true }));
      })
      .finally(() => {
        setIsLoadingMore(false);
      });
  }, []);

  const handleGridScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - scrollTop - clientHeight < 400) {
      if (displayLimitRef.current < filteredLengthRef.current) {
        setDisplayLimit((prev) => Math.min(prev + 12, filteredLengthRef.current));
      } else if (!isLoadingMoreRef.current && !exhaustedFiltersRef.current[activeFilterRef.current]) {
        fetchMoreFromYouTube();
      }
    }
  };

  useEffect(() => {
    if (!isOpen || !sentinelRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0] && entries[0].isIntersecting) {
          if (displayLimitRef.current < filteredLengthRef.current) {
            setDisplayLimit((prev) => Math.min(prev + 12, filteredLengthRef.current));
          } else if (
            !isLoadingMoreRef.current &&
            !exhaustedFiltersRef.current[activeFilterRef.current] &&
            gridScrollRef.current &&
            gridScrollRef.current.scrollTop > 40
          ) {
            fetchMoreFromYouTube();
          }
        }
      },
      { root: gridScrollRef.current, rootMargin: '100px' }
    );
    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [isOpen, activeFilter, fetchMoreFromYouTube]);

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
          quality: /\b(4k|2160p|uhd)\b/i.test(q) ? '4K Ultra HD' : '1080p Full HD',
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
    { key: 'movies', label: isHindi ? 'ब्लॉकबस्टर फिल्में' : 'Blockbuster Movies' },
    { key: 'series', label: isHindi ? 'वेब सीरीज़' : 'Web Series' },
    { key: 'romantic', label: isHindi ? 'रोमांटिक' : 'Romantic' },
    { key: 'party', label: isHindi ? 'पार्टी व डांस' : 'Party & Dance' },
    { key: 'punjabi', label: isHindi ? 'पंजाबी हिट्स' : 'Punjabi Hits' },
    { key: 'action', label: isHindi ? 'एक्शन व थ्रिलर' : 'Action' },
    { key: 'devotional', label: isHindi ? 'भक्ति व भजन' : 'Devotional' },
    { key: 'arijit', label: isHindi ? 'अरिजीत सिंह स्पेशल' : 'Arijit Singh' },
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
              const q = searchQuery.trim();
              onPlayMovie &&
                onPlayMovie({
                  searchQuery: q,
                  title: q,
                  quality: /\b(4k|2160p|uhd)\b/i.test(q) ? '4K Ultra HD' : '1080p Full HD',
                  type: 'stream',
                  year: '2024',
                });
            }}
            title={`Play "${searchQuery.trim()}"`}
          >
            <div className="stream-action-left">
              <i className="fa-solid fa-circle-play stream-action-icon"></i>
              <div className="stream-action-text">
                <strong>
                  {isHindi
                    ? `"${searchQuery.trim()}" को तुरंत ऑनलाइन स्ट्रीम करें`
                    : `Stream "${searchQuery.trim()}" live stream`}
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
            <span className="stream-action-tag">LIVE STREAM</span>
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
                    src={
                      item.poster ||
                      (item.trailerYoutubeId
                        ? `https://img.youtube.com/vi/${item.trailerYoutubeId}/hqdefault.jpg`
                        : '/logo1.jpg')
                    }
                    alt={item.title}
                    className="yt-thumb-img"
                    loading="lazy"
                    onError={(e) => {
                      const ytFallback =
                        item.trailerYoutubeId ||
                        (typeof item.id === 'string' ? item.id.replace(/^yt-/, '') : null);
                      if (ytFallback && !e.currentTarget.src.includes(`vi/${ytFallback}/`)) {
                        e.currentTarget.src = `https://img.youtube.com/vi/${ytFallback}/hqdefault.jpg`;
                      } else if (!e.currentTarget.src.includes('logo1.jpg')) {
                        e.currentTarget.src = '/logo1.jpg';
                      } else {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = '/custom-logo-clean-full.jpg';
                      }
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
                        item.type === 'series'
                          ? 'fa-solid fa-tv'
                          : item.type === 'movie'
                          ? 'fa-solid fa-film'
                          : 'fa-solid fa-music'
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

          <div ref={sentinelRef} style={{ height: '10px', width: '100%', pointerEvents: 'none' }} />

          {isLoadingMore && (
            <div className="infinite-scroll-loader">
              <i className="fa-solid fa-circle-notch fa-spin"></i>
              <span>{isHindi ? 'और वीडियो लोड हो रहे हैं...' : 'Loading more videos...'}</span>
            </div>
          )}

          {!isLoadingMore && filteredItems.length > 0 && displayLimit >= filteredItems.length && (
            <div className="all-videos-loaded-badge">
              <span>{isHindi ? '✓ सभी उपलब्ध वीडियो लोड हो चुके हैं' : '✓ All available videos loaded'}</span>
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
