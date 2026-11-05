'use client';

import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { TRENDING_SONGS } from '../data/songs';
import { COMPREHENSIVE_CATALOG } from '../data/catalog';
import { getBackendUrl } from '../utils/apiConfig';

const YOUTUBE_QUALITIES = [
  { ytCode: 'highres', label: '2160p (4K)', tag: '4K', resolution: '2160p', altCodes: ['hd2160', 'highres'] },
  { ytCode: 'hd1440', label: '1440p (2K)', tag: 'HD', resolution: '1440p', altCodes: ['hd1440'] },
  { ytCode: 'hd1080', label: '1080p (HD)', tag: 'HD', resolution: '1080p', altCodes: ['hd1080'] },
  { ytCode: 'hd720', label: '720p', tag: '', resolution: '720p', altCodes: ['hd720'] },
  { ytCode: 'large', label: '480p', tag: '', resolution: '480p', altCodes: ['large'] },
  { ytCode: 'medium', label: '360p', tag: '', resolution: '360p', altCodes: ['medium'] },
  { ytCode: 'small', label: '240p', tag: '', resolution: '240p', altCodes: ['small'] },
  { ytCode: 'tiny', label: '144p', tag: '', resolution: '144p', altCodes: ['tiny'] },
];

const CODE_TO_LABEL_MAP = {
  highres: '2160p (4K)',
  hd2160: '2160p (4K)',
  hd1440: '1440p (2K)',
  hd1080: '1080p (HD)',
  hd720: '720p',
  large: '480p',
  medium: '360p',
  small: '240p',
  tiny: '144p',
};

function getNextVideo(current) {
  const allVideos = [...TRENDING_SONGS, ...COMPREHENSIVE_CATALOG];
  if (!current) return allVideos[0];
  const currId = (current.trailerYoutubeId || current.id || current.title || '').toLowerCase().replace(/^yt-/, '');
  const idx = allVideos.findIndex((item) => {
    const itId = (item.trailerYoutubeId || item.id || item.title || '').toLowerCase().replace(/^yt-/, '');
    return itId === currId || (item.title && current.title && item.title.toLowerCase() === current.title.toLowerCase());
  });
  if (idx >= 0 && idx < allVideos.length - 1) {
    return allVideos[idx + 1];
  }
  return allVideos[0] || TRENDING_SONGS[0];
}

const VERIFIED_TRAILERS = {
  animal: { id: '8FkLRUJj-o0', title: 'Animal', year: '2023', match: '99% Match', age: 'A (18+)', rating: '8.4', duration: '3h 21m' },
  leo: { id: 'Po3jStA673E', title: 'Leo', year: '2023', match: '97% Match', age: 'U/A 16+', rating: '7.9', duration: '2h 44m' },
  salaar: { id: 'HihakYi5M2I', title: 'Salaar: Part 1 – Ceasefire', year: '2023', match: '96% Match', age: 'A (18+)', rating: '8.1', duration: '2h 55m' },
  jawan: { id: 'COv52Qyctws', title: 'Jawan', year: '2023', match: '95% Match', age: 'U/A 16+', rating: '7.8', duration: '2h 49m' },
  railway: { id: 'iD3TZ_Xxc14', title: 'The Railway Men', year: '2023', match: '98% Match', age: 'U/A 16+', rating: '8.5', duration: '4 Episodes' },
  'jaane jaan': { id: 'GHX6yT9Lxfo', title: 'Jaane Jaan', year: '2023', match: '93% Match', age: 'U/A 16+', rating: '7.5', duration: '2h 19m' },
  khufiya: { id: 'ByojhBwG_-E', title: 'Khufiya', year: '2023', match: '91% Match', age: 'A (18+)', rating: '7.2', duration: '2h 37m' },
  'mission raniganj': { id: 'QFf91hnpClI', title: 'Mission Raniganj', year: '2023', match: '92% Match', age: 'U/A 13+', rating: '7.6', duration: '2h 14m' },
  'omg 2': { id: 'Y6ZKXqM7HNQ', title: 'OMG 2', year: '2023', match: '94% Match', age: 'A (18+)', rating: '7.7', duration: '2h 36m' },
  'lust stories': { id: '4aanxonXWiM', title: 'Lust Stories 2', year: '2023', match: '89% Match', age: 'A (18+)', rating: '6.8', duration: '2h 12m' },
  stranger: { id: 'b9EkMc79ZSU', title: 'Stranger Things', year: '2024', match: '98% Match', age: 'U/A 16+', rating: '8.6', duration: '4 Seasons' },
  guardians: { id: 'wUn05hdkhjM', title: 'Guardians of the Galaxy: Vol. 2', year: '2017', match: '88% Match', age: 'PG-13', rating: '7.6', duration: '136 min' },
  squid: { id: 'oqxAJKy0ii4', title: 'Squid Game', year: '2024', match: '99% Match', age: 'A (18+)', rating: '7.9', duration: 'Season 2' },
  extraction: { id: 'Y274jZs5s7s', title: 'Extraction II', year: '2023', match: '98% Match', age: 'A (18+)', rating: '7.0', duration: '2h 02m' },
  wednesday: { id: 'Di310WS8zLk', title: 'Wednesday', year: '2023', match: '96% Match', age: 'U/A 13+', rating: '8.0', duration: 'Season 1' },
};

function resolveVideoMeta(item) {
  if (!item) return VERIFIED_TRAILERS.animal;

  const isExplicit4K = !!(
    (item.title && /\b(4k|2160p|uhd)\b/i.test(item.title)) ||
    (item.overview && /\b(4k|2160p|uhd)\b/i.test(item.overview)) ||
    (item.searchQuery && /\b(4k|2160p|uhd)\b/i.test(item.searchQuery))
  );
  const defaultQuality = isExplicit4K ? '4K Ultra HD' : '1080p Full HD';

  if (item.trailerYoutubeId) {
    return {
      id: item.trailerYoutubeId,
      trailerYoutubeId: item.trailerYoutubeId,
      title: item.title,
      year: item.year || item.releaseYear || '2023',
      age: item.ageRating || 'U/A 16+',
      rating: item.rating || '8.0',
      duration: item.duration || '2h 15m',
      overview: item.overview,
      quality: item.quality || defaultQuality,
    };
  }

  const cleanId = (typeof item.id === 'string' ? item.id.replace(/^yt-/, '') : item.id);
  if (cleanId && cleanId.length === 11) {
    return {
      id: cleanId,
      trailerYoutubeId: cleanId,
      title: item.title || 'Now Playing',
      year: item.year || item.releaseYear || '2024',
      age: item.ageRating || 'U/A 16+',
      rating: item.rating || '8.0',
      duration: item.duration || 'Full Stream',
      overview: item.overview,
      quality: item.quality || defaultQuality,
    };
  }

  if (item.searchQuery) {
    return {
      id: 'LK7-_dgAVQE',
      trailerYoutubeId: 'LK7-_dgAVQE',
      searchQuery: item.searchQuery,
      title: item.title || item.searchQuery,
      year: item.year || '2024',
      age: item.ageRating || 'U/A 16+',
      rating: '8.8',
      duration: item.duration || 'Live Stream',
      overview: item.overview || `Live stream of ${item.title || item.searchQuery} in master definition.`,
      quality: item.quality || defaultQuality,
    };
  }

  const searchKey = ((item.id || '') + ' ' + (item.title || '')).toLowerCase();
  for (const [key, data] of Object.entries(VERIFIED_TRAILERS)) {
    if (searchKey.includes(key)) {
      return {
        ...data,
        title: item.title || data.title,
        overview: item.overview,
        quality: item.quality || defaultQuality,
      };
    }
  }

  return {
    id: '8FkLRUJj-o0',
    title: item.title || 'Now Playing',
    year: item.year || '2023',
    age: item.ageRating || 'A (18+)',
    rating: item.rating || '8.0',
    duration: item.duration || '2h 15m',
    overview: item.overview,
    quality: item.quality || defaultQuality,
  };
}

function formatTime(seconds) {
  if (isNaN(seconds) || seconds < 0) return '00:00';
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  const pad = (n) => String(n).padStart(2, '0');
  if (hrs > 0) {
    return `${hrs}:${pad(mins)}:${pad(secs)}`;
  }
  return `${pad(mins)}:${pad(secs)}`;
}

export default function NetflixVideoPlayer({ movie, onClose, onPlayMovie, language = 'en' }) {
  const containerRef = useRef(null);
  const iframeRef = useRef(null);
  const scrubberRailRef = useRef(null);

  const [resolvedMovie, setResolvedMovie] = useState(() => resolveVideoMeta(movie));
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPortrait, setIsPortrait] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const controlsTimeoutRef = useRef(null);
  const lastTouchTimeRef = useRef(0);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(210);
  const [volume, setVolume] = useState(100);
  const [isMuted, setIsMuted] = useState(false);
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const [settingsView, setSettingsView] = useState('main');
  const [ambientMode, setAmbientMode] = useState(true);
  const [annotations, setAnnotations] = useState(true);
  const [subtitlesLanguage, setSubtitlesLanguage] = useState('Off');
  const [sleepTimer, setSleepTimer] = useState('Off');
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [isAutoQuality, setIsAutoQuality] = useState(true);
  const [currentQualityLabel, setCurrentQualityLabel] = useState('1080p (HD)');
  const [selectedQualityCode, setSelectedQualityCode] = useState('auto');
  const [availableQualityLevels, setAvailableQualityLevels] = useState([]);
  const [detectedMaxQuality, setDetectedMaxQuality] = useState(null);
  const [hasMaxRes, setHasMaxRes] = useState(true);
  const [ccActive, setCcActive] = useState(false);
  const [ccToast, setCcToast] = useState('');
  const ccToastTimeoutRef = useRef(null);

  const [centerFlash, setCenterFlash] = useState(null);
  const flashTimeoutRef = useRef(null);

  const [nextCountdown, setNextCountdown] = useState(null);
  const [nextUpVideo, setNextUpVideo] = useState(null);
  const countdownTimerRef = useRef(null);

  const sendCommand = useCallback((func, args = []) => {
    if (iframeRef.current && iframeRef.current.contentWindow) {
      try {
        const payload = JSON.stringify({
          event: 'command',
          func: func,
          args: Array.isArray(args) ? args : [args],
        });
        iframeRef.current.contentWindow.postMessage(payload, '*');
      } catch (e) {}
    }
  }, []);

  const triggerCenterFlash = (type) => {
    setCenterFlash(type);
    if (flashTimeoutRef.current) clearTimeout(flashTimeoutRef.current);
    flashTimeoutRef.current = setTimeout(() => {
      setCenterFlash(null);
    }, 650);
  };

  const playNextVideo = useCallback((targetVideo) => {
    if (countdownTimerRef.current) {
      clearInterval(countdownTimerRef.current);
      countdownTimerRef.current = null;
    }
    setNextCountdown(null);
    setNextUpVideo(null);
    const next = targetVideo || nextUpVideo || getNextVideo(resolvedMovie);
    if (!next) return;

    const resolvedNext = resolveVideoMeta(next);
    const rawNextId = resolvedNext.trailerYoutubeId || resolvedNext.id || '8FkLRUJj-o0';
    const cleanNextId = (typeof rawNextId === 'string' ? rawNextId.replace(/^yt-/, '') : rawNextId) || '8FkLRUJj-o0';

    setResolvedMovie(resolvedNext);
    setCurrentTime(0);
    setDuration(0);
    setIsPlaying(true);

    // Command existing iframe immediately
    sendCommand('loadVideoById', [cleanNextId, 0]);
    sendCommand('playVideo');
    sendCommand('unMute');
    sendCommand('setVolume', [volume || 100]);

    if (onPlayMovie) {
      onPlayMovie(next);
    }
  }, [resolvedMovie, nextUpVideo, onPlayMovie, sendCommand, volume]);

  const cancelNextCountdown = () => {
    if (countdownTimerRef.current) {
      clearInterval(countdownTimerRef.current);
      countdownTimerRef.current = null;
    }
    setNextCountdown(null);
    setNextUpVideo(null);
  };

  const startNextVideoCountdown = useCallback(() => {
    if (nextCountdown !== null) return;
    const next = getNextVideo(resolvedMovie);
    setNextUpVideo(next);
    setNextCountdown(5);

    if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
    let rem = 5;
    countdownTimerRef.current = setInterval(() => {
      rem -= 1;
      if (rem <= 0) {
        clearInterval(countdownTimerRef.current);
        countdownTimerRef.current = null;
        setNextCountdown(null);
        setNextUpVideo(null);
        playNextVideo(next);
      } else {
        setNextCountdown(rem);
      }
    }, 1000);
  }, [resolvedMovie, nextCountdown, playNextVideo]);

  const triggerCcToast = (text) => {
    setCcToast(text);
    if (ccToastTimeoutRef.current) clearTimeout(ccToastTimeoutRef.current);
    ccToastTimeoutRef.current = setTimeout(() => {
      setCcToast('');
    }, 2800);
  };

  useEffect(() => {
    const initialMeta = resolveVideoMeta(movie);
    setResolvedMovie(initialMeta);
    setCurrentTime(0);
    setDuration(0);
    setIsPlaying(true);
    setNextCountdown(null);
    setNextUpVideo(null);
    if (countdownTimerRef.current) {
      clearInterval(countdownTimerRef.current);
      countdownTimerRef.current = null;
    }

    setIsAutoQuality(true);
    setSelectedQualityCode('auto');
    setAvailableQualityLevels([]);
    setDetectedMaxQuality(null);
    setHasMaxRes(true);
    setCurrentQualityLabel('1080p (HD)');

    const lookupParam = movie?.imdbId || movie?.id || movie?.title;
    if (lookupParam && !movie?.trailerYoutubeId && !movie?.searchQuery) {
      const backendUrl = getBackendUrl();
      fetch(`${backendUrl}/api/movies/watch/${encodeURIComponent(lookupParam)}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.movie) {
            setResolvedMovie((prev) => ({
              ...prev,
              ...data.movie,
              id: movie?.trailerYoutubeId || data.movie.trailerYoutubeId || prev.id,
            }));
          }
        })
        .catch(() => {});
    }
  }, [movie]);

  // Probe YouTube thumbnail to verify if maxres (HD) exists
  useEffect(() => {
    const rawId = resolvedMovie?.trailerYoutubeId || resolvedMovie?.id;
    const cleanId = (typeof rawId === 'string' ? rawId.replace(/^yt-/, '') : rawId);
    if (!cleanId || cleanId.length !== 11) return;

    if (typeof window !== 'undefined') {
      const probe = new Image();
      probe.src = `https://img.youtube.com/vi/${cleanId}/maxresdefault.jpg`;
      probe.onload = () => {
        if (probe.naturalWidth > 120 && probe.naturalHeight > 90) {
          setHasMaxRes(true);
        } else {
          setHasMaxRes(false);
        }
      };
      probe.onerror = () => {
        setHasMaxRes(false);
      };
    }
  }, [resolvedMovie]);

  const is4KAvailable = useMemo(() => {
    if (availableQualityLevels.length > 0) {
      return availableQualityLevels.some((q) => q === 'highres' || q === 'hd2160');
    }
    if (detectedMaxQuality === '2160p') return true;

    const title = (resolvedMovie?.title || '').toLowerCase();
    const overview = (resolvedMovie?.overview || '').toLowerCase();
    const search = (resolvedMovie?.searchQuery || '').toLowerCase();
    const combined = `${title} ${overview} ${search}`;
    return /\b(4k|2160p|uhd)\b/.test(combined);
  }, [availableQualityLevels, detectedMaxQuality, resolvedMovie]);

  const is1440pAvailable = useMemo(() => {
    if (is4KAvailable) return true;
    if (availableQualityLevels.length > 0) {
      return availableQualityLevels.some((q) => q === 'hd1440');
    }
    if (detectedMaxQuality === '1440p') return true;
    const title = (resolvedMovie?.title || '').toLowerCase();
    return /\b(1440p|2k)\b/.test(title);
  }, [is4KAvailable, availableQualityLevels, detectedMaxQuality, resolvedMovie]);

  const displayedQualityOptions = useMemo(() => {
    if (availableQualityLevels.length > 0) {
      const supported = YOUTUBE_QUALITIES.filter((item) =>
        item.altCodes.some((code) => availableQualityLevels.includes(code))
      );
      if (supported.length > 0) return supported;
    }

    if (is4KAvailable) {
      return YOUTUBE_QUALITIES;
    }

    if (is1440pAvailable) {
      return YOUTUBE_QUALITIES.filter((q) => q.ytCode !== 'highres');
    }

    if (!hasMaxRes) {
      return YOUTUBE_QUALITIES.filter(
        (q) => q.ytCode !== 'highres' && q.ytCode !== 'hd1440' && q.ytCode !== 'hd1080' && q.ytCode !== 'hd720'
      );
    }

    return YOUTUBE_QUALITIES.filter((q) => q.ytCode !== 'highres' && q.ytCode !== 'hd1440');
  }, [availableQualityLevels, is4KAvailable, is1440pAvailable, hasMaxRes]);

  const highestAvailableOption = displayedQualityOptions[0] || YOUTUBE_QUALITIES[2];
  const autoQualityLabel = highestAvailableOption.label;

  useEffect(() => {
    if (isAutoQuality && displayedQualityOptions.length > 0) {
      const highestCode = displayedQualityOptions[0].ytCode;
      sendCommand('setPlaybackQuality', [highestCode]);
      sendCommand('setPlaybackQualityRange', [highestCode, highestCode]);
    }
  }, [isAutoQuality, displayedQualityOptions, sendCommand]);

  const handleUserActivity = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      setShowControls(false);
      setShowSettingsMenu(false);
    }, 4500);
  };

  const handleToggleControls = (e) => {
    if (e && e.stopPropagation) {
      e.stopPropagation();
    }

    const now = Date.now();
    if (e?.type === 'touchend') {
      lastTouchTimeRef.current = now;
    } else if (e?.type === 'click') {
      if (now - lastTouchTimeRef.current < 450) {
        return;
      }
    }

    if (!showControls) {
      setShowControls(true);
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
        setShowSettingsMenu(false);
      }, 4500);
    } else {
      setShowControls(false);
      setShowSettingsMenu(false);
    }
  };

  const toggleFullscreen = () => {
    const isCurrentlyFs = !!(
      document.fullscreenElement ||
      document.webkitFullscreenElement ||
      document.mozFullScreenElement ||
      document.msFullscreenElement ||
      isFullscreen
    );

    if (!isCurrentlyFs) {
      if (containerRef.current) {
        if (containerRef.current.requestFullscreen) {
          containerRef.current.requestFullscreen().catch(() => {});
        } else if (containerRef.current.webkitRequestFullscreen) {
          containerRef.current.webkitRequestFullscreen();
        }
      }

      if (typeof screen !== 'undefined' && screen.orientation && screen.orientation.lock) {
        screen.orientation.lock('landscape').catch(() => {});
      }

      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      }

      if (typeof screen !== 'undefined' && screen.orientation && screen.orientation.unlock) {
        try {
          screen.orientation.unlock();
        } catch (e) {}
      }

      setIsFullscreen(false);
    }
  };

  const togglePlayPause = () => {
    if (isPlaying) {
      sendCommand('pauseVideo');
      setIsPlaying(false);
      triggerCenterFlash('pause');
    } else {
      if (duration > 5 && currentTime >= duration - 1) {
        sendCommand('seekTo', [0, true]);
        setCurrentTime(0);
      }
      sendCommand('playVideo');
      if (isMuted) {
        sendCommand('unMute');
        sendCommand('setVolume', [volume || 80]);
        setIsMuted(false);
      }
      setIsPlaying(true);
      triggerCenterFlash('play');
    }
    handleUserActivity();
  };

  const seekOffset = (offsetSeconds) => {
    setCurrentTime((prev) => {
      const targetTime = Math.max(0, Math.min(duration || 300, prev + offsetSeconds));
      sendCommand('seekTo', [targetTime, true]);
      return targetTime;
    });
    handleUserActivity();
  };

  const toggleMute = () => {
    if (isMuted) {
      sendCommand('unMute');
      sendCommand('setVolume', [volume || 80]);
      sendCommand('playVideo');
      setIsMuted(false);
      setIsPlaying(true);
    } else {
      sendCommand('mute');
      setIsMuted(true);
    }
    handleUserActivity();
  };

  const handleVolumeChange = (e) => {
    const newVol = parseInt(e.target.value, 10);
    setVolume(newVol);
    if (newVol === 0) {
      sendCommand('mute');
      setIsMuted(true);
    } else {
      sendCommand('unMute');
      sendCommand('setVolume', [newVol]);
      setIsMuted(false);
    }
    handleUserActivity();
  };

  const handleSpeedChange = (speed) => {
    setPlaybackSpeed(speed);
    sendCommand('setPlaybackRate', [speed]);
    setSettingsView('main');
    setShowSettingsMenu(false);
    handleUserActivity();
  };

  const handleQualityChange = (qCode, qLabel) => {
    if (qCode === 'auto') {
      setIsAutoQuality(true);
      setSelectedQualityCode('auto');
      const highestCode = displayedQualityOptions[0]?.ytCode || 'hd1080';
      sendCommand('setPlaybackQuality', [highestCode]);
      sendCommand('setPlaybackQualityRange', [highestCode, highestCode]);
    } else {
      setIsAutoQuality(false);
      setSelectedQualityCode(qCode);
      if (qLabel) {
        setCurrentQualityLabel(qLabel);
      }
      sendCommand('setPlaybackQuality', [qCode]);
      sendCommand('setPlaybackQualityRange', [qCode, qCode]);
    }
    setSettingsView('main');
    setShowSettingsMenu(false);
    handleUserActivity();
  };

  const handleSubtitlesChange = (lang) => {
    setSubtitlesLanguage(lang);
    if (lang === 'Off') {
      setCcActive(false);
      sendCommand('unloadModule', ['captions']);
      sendCommand('setOption', ['captions', 'track', {}]);
      triggerCcToast('Subtitles / CC: Off');
    } else {
      setCcActive(true);
      const code = lang.toLowerCase().includes('hindi') ? 'hi' : 'en';
      sendCommand('loadModule', ['captions']);
      sendCommand('setOption', ['captions', 'track', { languageCode: code }]);
      sendCommand('setOption', ['captions', 'fontSize', 1]);
      sendCommand('setOption', ['captions', 'reload', true]);
      triggerCcToast(`Subtitles / CC: ${lang}`);
    }
    setSettingsView('main');
    setShowSettingsMenu(false);
    handleUserActivity();
  };

  const handleTimerChange = (val) => {
    setSleepTimer(val);
    setSettingsView('main');
    setShowSettingsMenu(false);
    handleUserActivity();
  };

  const toggleCC = () => {
    const nextState = !ccActive;
    setCcActive(nextState);
    if (nextState) {
      setSubtitlesLanguage('English');
      sendCommand('loadModule', ['captions']);
      sendCommand('setOption', ['captions', 'track', { languageCode: 'en' }]);
      sendCommand('setOption', ['captions', 'fontSize', 1]);
      sendCommand('setOption', ['captions', 'reload', true]);
      triggerCcToast('Subtitles / CC: English (CC On)');
    } else {
      setSubtitlesLanguage('Off');
      sendCommand('unloadModule', ['captions']);
      sendCommand('setOption', ['captions', 'track', {}]);
      triggerCcToast('Subtitles / CC: Off');
    }
    handleUserActivity();
  };

  const handleScrubberClick = (e) => {
    if (!scrubberRailRef.current) return;
    const rect = scrubberRailRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const progressRatio = Math.max(0, Math.min(1, clickX / rect.width));
    const targetSeconds = progressRatio * (duration || 300);
    setCurrentTime(targetSeconds);
    sendCommand('seekTo', [targetSeconds, true]);
    handleUserActivity();
  };

  useEffect(() => {
    const handleMessage = (event) => {
      try {
        const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
        if (data && (data.event === 'infoDelivery' || data.event === 'initialDelivery') && data.info) {
          if (typeof data.info.currentTime === 'number') {
            setCurrentTime(data.info.currentTime);
          }
          if (typeof data.info.duration === 'number' && data.info.duration > 0) {
            setDuration(data.info.duration);
          }
          if (typeof data.info.playerState === 'number') {
            const st = data.info.playerState;
            if (st === 0) {
              setIsPlaying(false);
              startNextVideoCountdown();
            } else if (st === 1) {
              setIsPlaying(true);
              if (iframeRef.current && iframeRef.current.contentWindow) {
                try {
                  iframeRef.current.contentWindow.postMessage(JSON.stringify({ event: 'command', func: 'getAvailableQualityLevels', args: [] }), '*');
                  iframeRef.current.contentWindow.postMessage(JSON.stringify({ event: 'command', func: 'getPlaybackQuality', args: [] }), '*');
                } catch (e) {}
              }
            } else if (st === 2) {
              setIsPlaying(false);
            }
          }
          if (typeof data.info.muted === 'boolean') {
            setIsMuted(data.info.muted);
          }
          if (typeof data.info.playbackQuality === 'string' && data.info.playbackQuality !== 'unknown') {
            const qCode = data.info.playbackQuality;
            if (qCode === 'highres' || qCode === 'hd2160') {
              setDetectedMaxQuality('2160p');
            } else if (qCode === 'hd1440') {
              setDetectedMaxQuality((prev) => (prev === '2160p' ? '2160p' : '1440p'));
            } else if (qCode === 'hd1080') {
              setDetectedMaxQuality((prev) => (prev === '2160p' || prev === '1440p' ? prev : '1080p'));
            }
            const mapped = CODE_TO_LABEL_MAP[qCode];
            if (mapped) {
              setCurrentQualityLabel(mapped);
            }
          }
          if (Array.isArray(data.info.availableQualityLevels) && data.info.availableQualityLevels.length > 0) {
            const filtered = data.info.availableQualityLevels.filter((q) => q && q !== 'auto' && q !== 'unknown');
            if (filtered.length > 0) {
              setAvailableQualityLevels(filtered);
            }
          }
        }
      } catch (err) {

      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setCurrentTime((prev) => {
        if (prev >= duration) {
          if (nextCountdown === null && duration > 5) {
            startNextVideoCountdown();
          }
          return prev;
        }
        return prev + 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isPlaying, duration, nextCountdown, startNextVideoCountdown]);

  useEffect(() => {
    const timer = setInterval(() => {
      if (iframeRef.current && iframeRef.current.contentWindow) {
        try {
          iframeRef.current.contentWindow.postMessage('{"event":"listening"}', '*');
          iframeRef.current.contentWindow.postMessage(
            JSON.stringify({ event: 'listening', id: 1, channel: 'widget' }),
            '*'
          );
        } catch (e) {}
      }
    }, 1500);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        if (typeof e.stopImmediatePropagation === 'function') {
          e.stopImmediatePropagation();
        }
        if (document.fullscreenElement) {
          document.exitFullscreen().catch(() => {});
        } else {
          onClose();
        }
      } else if (e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        toggleFullscreen();
      } else if (e.key === ' ' || e.code === 'Space') {
        e.preventDefault();
        togglePlayPause();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        seekOffset(-10);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        seekOffset(10);
      } else if (e.key === 'm' || e.key === 'M') {
        e.preventDefault();
        toggleMute();
      } else if (e.key === 'c' || e.key === 'C') {
        e.preventDefault();
        toggleCC();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    };
  }, [onClose, isPlaying, isMuted]);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.body.classList.add('video-player-active');
      document.documentElement.classList.add('video-player-active');
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
    }

    const checkOrientation = () => {
      if (typeof window !== 'undefined') {
        const portrait = window.innerHeight > window.innerWidth && window.innerWidth <= 820;
        setIsPortrait(portrait);
      }
    };

    checkOrientation();
    window.addEventListener('resize', checkOrientation);
    window.addEventListener('orientationchange', checkOrientation);

    const handleFsChange = () => {
      const active = !!(
        document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.mozFullScreenElement ||
        document.msFullscreenElement
      );
      setIsFullscreen(active);
      if (!active && typeof screen !== 'undefined' && screen.orientation && screen.orientation.unlock) {
        try {
          screen.orientation.unlock();
        } catch (e) {}
      }
    };

    document.addEventListener('fullscreenchange', handleFsChange);
    document.addEventListener('webkitfullscreenchange', handleFsChange);

    return () => {
      if (typeof document !== 'undefined') {
        document.body.classList.remove('video-player-active');
        document.documentElement.classList.remove('video-player-active');
        if (
          document.querySelector('.youtube-explore-modal-backdrop') ||
          document.querySelector('.auth-modal-backdrop')
        ) {
          document.body.style.overflow = 'hidden';
          document.documentElement.style.overflow = 'hidden';
        } else {
          document.body.style.overflow = '';
          document.documentElement.style.overflow = '';
        }
      }
      if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
      if (flashTimeoutRef.current) clearTimeout(flashTimeoutRef.current);
      window.removeEventListener('resize', checkOrientation);
      window.removeEventListener('orientationchange', checkOrientation);
      document.removeEventListener('fullscreenchange', handleFsChange);
      document.removeEventListener('webkitfullscreenchange', handleFsChange);
      if (typeof screen !== 'undefined' && screen.orientation && screen.orientation.unlock) {
        try {
          screen.orientation.unlock();
        } catch (e) {}
      }
    };
  }, []);

  useEffect(() => {
    let isPopped = false;
    if (typeof window !== 'undefined') {
      window.history.pushState({ netflixPlayer: true }, '', window.location.href);

      const handlePop = () => {
        isPopped = true;
        onClose();
      };

      window.addEventListener('popstate', handlePop);
      return () => {
        window.removeEventListener('popstate', handlePop);
        if (!isPopped && window.history.state?.netflixPlayer) {
          window.history.back();
        }
      };
    }
  }, [onClose]);

  const getActiveSubtitle = () => {
    if (!ccActive || subtitlesLanguage === 'Off') return null;

    const title = (resolvedMovie.title || '').toLowerCase();
    const time = currentTime;
    const isHi = subtitlesLanguage.toLowerCase().includes('hindi');

    if (title.includes('tauba')) {
      if (time < 12) return isHi ? '♪ [ताल और संगीत शुरू] ♪' : '♪ [Vibrant Beats & Synth Intro] ♪';
      if (time < 32) return isHi ? 'हो दिल मेरा दीवाना हुआ, तौबा तौबा!' : 'Yeh dil mera deewaana hua, Tauba Tauba!';
      if (time < 58) return isHi ? 'हुस्न तेरा तौबा तौबा, रूप तेरा तौबा तौबा' : 'Husn tera tauba tauba, roop tera tauba tauba';
      if (time < 88) return isHi ? 'नाच के दिखा दे ज़रा, ताल पे हिला दे ज़रा' : 'Nach ke dikha de zara, taal pe hila de zara';
      if (time < 128) return isHi ? 'तौबा तौबा वे तेरी अदा, तौबा तौबा!' : 'Tauba tauba ve teri adaa, Tauba Tauba!';
      return isHi ? '♪ [धुन और तौबा तौबा कोरस] ♪' : '♪ [Vicky Kaushal signature rhythm & hook] ♪';
    }

    if (title.includes('arjan vailly')) {
      if (time < 16) return isHi ? '♪ [ढोल और गंडासी की गूंज] ♪' : '♪ [Fierce Punjabi Dhol & Battle Cry] ♪';
      if (time < 42) return isHi ? 'अर्जन वैली ने पैर जोड़ के गंडासी मारी!' : 'Arjan Vailly ne pair jod ke gandaasi maari!';
      if (time < 72) return isHi ? 'खड़क पई डांग विच मैदान दे!' : 'Khadak payi daang vich maidan de!';
      if (time < 118) return isHi ? 'खून दे समुंदर तरदे, अर्जन वैली!' : 'Khoon de samundar tarde, Arjan Vailly!';
      return isHi ? '♪ [रणबीर कपूर - एनिमल थीम] ♪' : '♪ [Ranbir Kapoor - Animal Theme Beats] ♪';
    }

    if (title.includes('chaleya')) {
      if (time < 14) return isHi ? '♪ [रोमांटिक धुन और गिटार] ♪' : '♪ [Acoustic Guitar & Soft Strings] ♪';
      if (time < 38) return isHi ? 'इश्क में दिल बना है, इश्क में दिल फ़ना है' : 'Ishq mein dil bana hai, ishq mein dil fanaa hai';
      if (time < 78) return isHi ? 'तेरी बाहों में आके मैं तो छलेया, छलेया' : 'Teri baahon mein aake main toh chaleya, chaleya';
      if (time < 118) return isHi ? 'हाय माहीया वे, तेरे बिना जी नहीं लगदा' : 'Haaye mahiya ve, tere bina jee nahi lagda';
      return isHi ? '♪ [अरिजीत सिंह और अनिरुद्ध सुर] ♪' : '♪ [Arijit Singh & Anirudh Melody] ♪';
    }

    if (title.includes('kesariya')) {
      if (time < 18) return isHi ? '♪ [बांसुरी और हारमोनियम आलाप] ♪' : '♪ [Melodic Flute & Harmonium Intro] ♪';
      if (time < 48) return isHi ? 'केसरिया तेरा इश्क है पिया, रंग जाऊं जो मैं हाथ लगाऊं' : 'Kesariya tera ishq hai piya, rang jaaun jo main haath lagaaun';
      if (time < 88) return isHi ? 'दिन बीते सारा तेरी फिक्र में, रैन सारी तेरी खैर मनाऊं' : 'Din beete saara teri fikr mein, rain saari teri khair manaaun';
      return isHi ? '♪ [केसरिया प्रेम आलाप] ♪' : '♪ [Kesariya Chorus & Symphony] ♪';
    }

    if (title.includes('lutt putt')) {
      if (time < 14) return isHi ? '♪ [डंकी ऊर्जावान बीट्स] ♪' : '♪ [Dunki Upbeat Groove & Harmonica] ♪';
      if (time < 42) return isHi ? 'ओ मैं तो लुट पुट गया, लुट पुट गया दिल से' : 'O main toh lutt putt gaya, lutt putt gaya dil se';
      return isHi ? '♪ [शाहरुख खान - लुट पुट गया] ♪' : '♪ [Shah Rukh Khan - Lutt Putt Gaya Groove] ♪';
    }

    const phase = Math.floor(time / 10) % 5;
    if (phase === 0) return isHi ? `♪ [संगीत और संवाद: ${resolvedMovie.title}] ♪` : `♪ [Audio Track: ${resolvedMovie.title}] ♪`;
    if (phase === 1) return isHi ? '♪ [स्टूडियो वोकल्स और इंस्ट्रूमेंट्स] ♪' : '♪ [Studio Vocals & Instruments] ♪';
    if (phase === 2) return isHi ? '♪ [स्टीरियो बीट्स और कोरस] ♪' : '♪ [Dynamic Stereo Rhythm & Chorus] ♪';
    if (phase === 3) return isHi ? `[${isHi ? 'हिन्दी सबटाइटल्स' : 'English Closed Captions'} — 4K Ultra HD]` : `[English Closed Captions — 4K Stream]`;
    return isHi ? '♪ [धुन और संगीत जारी है...] ♪' : '♪ [Music Playing Continuously...] ♪';
  };

  const rawId = resolvedMovie.trailerYoutubeId || resolvedMovie.id || '8FkLRUJj-o0';
  const videoId = (typeof rawId === 'string' ? rawId.replace(/^yt-/, '') : rawId) || '8FkLRUJj-o0';
  const originParam = typeof window !== 'undefined' && window.location.origin ? `&origin=${encodeURIComponent(window.location.origin)}` : '';
  const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&controls=0&enablejsapi=1&rel=0&playsinline=1&modestbranding=1&iv_load_policy=3&disablekb=1${originParam}`;

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div
      className={`netflix-player-container ${isFullscreen && isPortrait ? 'mobile-landscape-fullscreen' : ''}`}
      ref={containerRef}
      onMouseMove={handleUserActivity}
      onClick={handleUserActivity}
    >
      
      <div className={`player-top-overlay ${showControls ? 'visible' : ''}`}>
        <button
          type="button"
          className="player-back-btn"
          onClick={(e) => {
            if (e && e.stopPropagation) e.stopPropagation();
            if (isFullscreen) {
              toggleFullscreen();
            }
            onClose();
          }}
          aria-label="Back to Browse"
          title="Back to Browse (Esc)"
        >
          <i className="fa-solid fa-arrow-left"></i>
        </button>

        <div className="player-title-info">
          <h2>{resolvedMovie.title}</h2>
          <span className="player-badge">{resolvedMovie.year || resolvedMovie.releaseYear || '2024'}</span>
          <span className="player-badge">{resolvedMovie.age || resolvedMovie.ageRating || 'U/A 16+'}</span>
        </div>
      </div>

      <div className="player-youtube-wrap">
        <iframe
          ref={iframeRef}
          key={videoId}
          src={embedUrl}
          title={`${resolvedMovie.title} — Official Full Stream`}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
          scrolling="no"
          className="youtube-player-frame"
          style={{ width: '100%', height: '100%', border: 'none', overflow: 'hidden' }}
          onLoad={() => {
            if (iframeRef.current && iframeRef.current.contentWindow) {
              try {
                iframeRef.current.contentWindow.postMessage('{"event":"listening"}', '*');
                iframeRef.current.contentWindow.postMessage(
                  JSON.stringify({ event: 'listening', id: 1, channel: 'widget' }),
                  '*'
                );
                iframeRef.current.contentWindow.postMessage(JSON.stringify({ event: 'command', func: 'unMute', args: [] }), '*');
                iframeRef.current.contentWindow.postMessage(JSON.stringify({ event: 'command', func: 'setVolume', args: [volume || 100] }), '*');
                iframeRef.current.contentWindow.postMessage(JSON.stringify({ event: 'command', func: 'playVideo', args: [] }), '*');
                iframeRef.current.contentWindow.postMessage(JSON.stringify({ event: 'command', func: 'getAvailableQualityLevels', args: [] }), '*');
                iframeRef.current.contentWindow.postMessage(JSON.stringify({ event: 'command', func: 'getPlaybackQuality', args: [] }), '*');
              } catch (e) {}
            }
          }}
        ></iframe>

        {/* Screen Tap & Touch Layer to Show/Hide Controls */}
        <div
          className="player-touch-interceptor"
          onClick={handleToggleControls}
          onTouchEnd={handleToggleControls}
          onDoubleClick={(e) => {
            e.stopPropagation();
            toggleFullscreen();
          }}
          title="Tap screen to show/hide controls"
          aria-label="Tap screen to show/hide controls"
        />
      </div>

      {/* Center Big Play / Pause Button */}
      <div
        className={`player-center-control ${showControls || !isPlaying ? 'active' : ''}`}
      >
        <button
          type="button"
          className={`center-play-pause-btn ${!isPlaying ? 'is-paused' : ''}`}
          onClick={(e) => {
            e.stopPropagation();
            togglePlayPause();
          }}
          aria-label={isPlaying ? 'Pause' : 'Play'}
          title={isPlaying ? 'Pause (Space / Click)' : 'Play (Space / Click)'}
        >
          <i className={`fa-solid ${isPlaying ? 'fa-pause' : 'fa-play'}`}></i>
        </button>
      </div>

      {/* Center Animated Feedback on Toggle */}
      {centerFlash && (
        <div className="center-flash-ripple">
          <div className="center-flash-circle">
            <i className={`fa-solid ${centerFlash === 'play' ? 'fa-play' : 'fa-pause'}`}></i>
          </div>
        </div>
      )}

      {/* 5-Second Autoplay Next Video Card */}
      {nextCountdown !== null && nextUpVideo && (
        <div className="player-next-up-overlay" onClick={(e) => e.stopPropagation()}>
          <div className="next-up-header">
            <span className="next-up-badge">
              <i className="fa-solid fa-forward-step"></i> {language === 'hi' ? `अगला वीडियो ${nextCountdown}s में...` : `Next video in ${nextCountdown}s`}
            </span>
            <button
              type="button"
              className="next-up-cancel-btn"
              onClick={cancelNextCountdown}
              title={language === 'hi' ? 'ऑटोप्ले रद्द करें' : 'Cancel Autoplay'}
            >
              <i className="fa-solid fa-xmark"></i>
            </button>
          </div>

          <div
            className="next-up-body"
            onClick={() => playNextVideo(nextUpVideo)}
            style={{ cursor: 'pointer' }}
            title={language === 'hi' ? 'अगला वीडियो अभी चलाएं' : 'Play Next Video Now'}
          >
            <img
              src={nextUpVideo.poster || (nextUpVideo.trailerYoutubeId ? `https://img.youtube.com/vi/${nextUpVideo.trailerYoutubeId}/hqdefault.jpg` : '/logo1.jpg')}
              alt={nextUpVideo.title}
              className="next-up-thumb"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = '/logo1.jpg';
              }}
            />
            <div className="next-up-info">
              <h4 title={nextUpVideo.title}>{nextUpVideo.title}</h4>
              <p>{nextUpVideo.artist || nextUpVideo.album || nextUpVideo.year || 'Music Official'}</p>
            </div>
          </div>

          <div className="next-up-actions">
            <button
              type="button"
              className="next-up-play-btn"
              onClick={() => playNextVideo(nextUpVideo)}
            >
              <i className="fa-solid fa-play"></i> {language === 'hi' ? 'अभी चलाएं' : 'Play Now'}
            </button>
            <button
              type="button"
              className="next-up-stay-btn"
              onClick={cancelNextCountdown}
            >
              {language === 'hi' ? `रद्द करें (${nextCountdown}s)` : `Cancel (${nextCountdown}s)`}
            </button>
          </div>

          <div className="next-up-timer-bar">
            <div
              className="next-up-timer-fill"
              style={{ width: `${((5 - nextCountdown) / 5) * 100}%` }}
            ></div>
          </div>
        </div>
      )}

      <div className={`player-custom-controls-dock ${showControls ? 'visible' : ''}`}>
        
        <div
          className="player-scrubber-rail-wrap"
          ref={scrubberRailRef}
          onClick={handleScrubberClick}
          title="Click to seek"
        >
          <div className="player-scrubber-rail">
            <div className="player-scrubber-fill" style={{ width: `${progressPercent}%` }}></div>
            <div className="player-scrubber-thumb" style={{ left: `${progressPercent}%` }}></div>
          </div>
        </div>

        <div className="player-controls-row">
          
          <div className="controls-left-group">
            
            <button
              type="button"
              className="player-action-btn play-pause-btn"
              onClick={togglePlayPause}
              title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
            >
              <i className={`fa-solid ${isPlaying ? 'fa-pause' : 'fa-play'}`}></i>
            </button>

            <button
              type="button"
              className="player-action-btn skip-btn"
              onClick={() => seekOffset(-10)}
              title="Rewind 10 seconds (Left Arrow)"
            >
              <i className="fa-solid fa-rotate-left"></i>
              <span className="skip-label">10</span>
            </button>

            <button
              type="button"
              className="player-action-btn skip-btn"
              onClick={() => seekOffset(10)}
              title="Forward 10 seconds (Right Arrow)"
            >
              <i className="fa-solid fa-rotate-right"></i>
              <span className="skip-label">10</span>
            </button>

            <div className="player-volume-group">
              <button
                type="button"
                className="player-action-btn volume-btn"
                onClick={toggleMute}
                title={isMuted ? 'Unmute (M)' : 'Mute (M)'}
              >
                <i
                  className={`fa-solid ${
                    isMuted || volume === 0
                      ? 'fa-volume-xmark'
                      : volume < 50
                      ? 'fa-volume-low'
                      : 'fa-volume-high'
                  }`}
                ></i>
              </button>

              <input
                type="range"
                min="0"
                max="100"
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="player-volume-slider-bar"
                title={`Volume: ${isMuted ? 0 : volume}%`}
              />
            </div>

            <div className="player-time-indicator">
              <span className="time-current">{formatTime(currentTime)}</span>
              <span className="time-divider">/</span>
              <span className="time-duration">{formatTime(duration)}</span>
            </div>
          </div>

          <div className="controls-right-group">
            
            <button
              type="button"
              className={`player-action-btn yt-dock-btn cc-dock-btn ${ccActive ? 'active-cc' : ''}`}
              onClick={toggleCC}
              title={ccActive ? 'Subtitles/closed captions (c) - On' : 'Subtitles/closed captions (c) - Off'}
              aria-label="Subtitles/closed captions"
            >
              <span className="cc-box">CC</span>
            </button>

            <div className="player-settings-wrapper">
              <button
                type="button"
                className={`player-action-btn yt-dock-btn settings-btn ${showSettingsMenu ? 'active-gear' : ''}`}
                onClick={() => {
                  setShowSettingsMenu(!showSettingsMenu);
                  setSettingsView('main');
                }}
                title="Settings"
              >
                <i className="fa-solid fa-gear"></i>
              </button>

              {showSettingsMenu && (
                <div className="player-settings-popover yt-settings-menu">
                  {settingsView === 'main' && (
                    <div className="yt-menu-main">
                      
                      <div
                        className="yt-menu-row"
                        onClick={(e) => {
                          e.stopPropagation();
                          setAmbientMode(!ambientMode);
                        }}
                      >
                        <div className="yt-row-left">
                          <svg className="yt-menu-icon-svg" viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
                            <path d="M7 6h10v12H7z" fill="none" stroke="currentColor" strokeWidth="2" rx="1" />
                            <path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                          </svg>
                          <span className="yt-menu-label">Ambient mode</span>
                        </div>
                        <div className="yt-row-right">
                          <div className={`yt-toggle-switch ${ambientMode ? 'active' : ''}`}>
                            <div className="yt-toggle-thumb"></div>
                          </div>
                        </div>
                      </div>

                      <div
                        className="yt-menu-row"
                        onClick={(e) => {
                          e.stopPropagation();
                          setAnnotations(!annotations);
                        }}
                      >
                        <div className="yt-row-left">
                          <svg className="yt-menu-icon-svg" viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
                            <path d="M6 17h3l2-4V7H6v6h3l-2 4zm8 0h3l2-4V7h-5v6h3l-2 4z"/>
                          </svg>
                          <span className="yt-menu-label">Annotations</span>
                        </div>
                        <div className="yt-row-right">
                          <div className={`yt-toggle-switch ${annotations ? 'active' : ''}`}>
                            <div className="yt-toggle-thumb"></div>
                          </div>
                        </div>
                      </div>

                      <div className="yt-menu-row" onClick={() => setSettingsView('subtitles')}>
                        <div className="yt-row-left">
                          <svg className="yt-menu-icon-svg" viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
                            <path d="M19 4H5c-1.11 0-2 .9-2 2v12c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm-8 7H9.5v-.5h-2v3h2V13H11v1c0 .55-.45 1-1 1H7c-.55 0-1-.45-1-1v-4c0-.55.45-1 1-1h3c.55 0 1 .45 1 1v1zm7 0h-1.5v-.5h-2v3h2V13H18v1c0 .55-.45 1-1 1h-3c-.55 0-1-.45-1-1v-4c0-.55.45-1 1-1h3c.55 0 1 .45 1 1v1z"/>
                          </svg>
                          <span className="yt-menu-label">Subtitles/CC</span>
                        </div>
                        <div className="yt-row-right">
                          <span className="yt-item-badge">{subtitlesLanguage}</span>
                          <i className="fa-solid fa-chevron-right yt-arrow"></i>
                        </div>
                      </div>

                      <div className="yt-menu-row" onClick={() => setSettingsView('timer')}>
                        <div className="yt-row-left">
                          <svg className="yt-menu-icon-svg" viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M12.3 2a10 10 0 0 0-1.9 19.8 10 10 0 0 0 11.5-11.5c-6.1.4-10-3.5-9.6-8.3z" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                          <span className="yt-menu-label">Sleep timer</span>
                        </div>
                        <div className="yt-row-right">
                          <span className="yt-item-badge">{sleepTimer}</span>
                          <i className="fa-solid fa-chevron-right yt-arrow"></i>
                        </div>
                      </div>

                      <div className="yt-menu-row" onClick={() => setSettingsView('speed')}>
                        <div className="yt-row-left">
                          <svg className="yt-menu-icon-svg" viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="9"/>
                            <path d="M12 12l3.5-3.5" strokeLinecap="round"/>
                            <path d="M8 12h1M15 12h1M12 8v1" strokeLinecap="round"/>
                          </svg>
                          <span className="yt-menu-label">Playback speed</span>
                        </div>
                        <div className="yt-row-right">
                          <span className="yt-item-badge">{playbackSpeed === 1 ? 'Normal' : `${playbackSpeed}x`}</span>
                          <i className="fa-solid fa-chevron-right yt-arrow"></i>
                        </div>
                      </div>

                      <div className="yt-menu-row" onClick={() => setSettingsView('quality')}>
                        <div className="yt-row-left">
                          <svg className="yt-menu-icon-svg" viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
                            <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                            <circle cx="8" cy="6" r="2" fill="currentColor"/>
                            <circle cx="16" cy="12" r="2" fill="currentColor"/>
                            <circle cx="10" cy="18" r="2" fill="currentColor"/>
                          </svg>
                          <span className="yt-menu-label">Quality</span>
                        </div>
                        <div className="yt-row-right">
                          <span className="yt-item-badge">
                            {isAutoQuality ? `Auto (${autoQualityLabel})` : currentQualityLabel}
                          </span>
                          <i className="fa-solid fa-chevron-right yt-arrow"></i>
                        </div>
                      </div>
                    </div>
                  )}

                  {settingsView === 'quality' && (
                    <div className="yt-submenu-container">
                      <div className="yt-submenu-header" onClick={() => setSettingsView('main')}>
                        <i className="fa-solid fa-chevron-left"></i>
                        <span>Quality</span>
                      </div>
                      <div className="yt-submenu-divider"></div>
                      <div className="yt-submenu-scroll custom-scrollbar">
                        {/* Auto Option - Selected by Default with Highest Quality */}
                        <div
                          className={`yt-submenu-row ${isAutoQuality ? 'active' : ''}`}
                          onClick={() => handleQualityChange('auto')}
                        >
                          <span className="yt-check-box">
                            {isAutoQuality && <i className="fa-solid fa-check"></i>}
                          </span>
                          <span className="yt-submenu-label">
                            Auto ({autoQualityLabel})
                          </span>
                        </div>

                        {/* Available Qualities in Exact YouTube Sequence */}
                        {displayedQualityOptions.map((opt) => {
                          const isActive = !isAutoQuality && selectedQualityCode === opt.ytCode;
                          return (
                            <div
                              key={opt.ytCode}
                              className={`yt-submenu-row ${isActive ? 'active' : ''}`}
                              onClick={() => handleQualityChange(opt.ytCode, opt.label)}
                            >
                              <span className="yt-check-box">
                                {isActive && <i className="fa-solid fa-check"></i>}
                              </span>
                              <span className="yt-submenu-label">{opt.label}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {settingsView === 'speed' && (
                    <div className="yt-submenu-container">
                      <div className="yt-submenu-header" onClick={() => setSettingsView('main')}>
                        <i className="fa-solid fa-chevron-left"></i>
                        <span>Playback speed</span>
                      </div>
                      <div className="yt-submenu-divider"></div>
                      <div className="yt-submenu-scroll custom-scrollbar">
                        {[0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2].map((sp) => {
                          const spLabel = sp === 1 ? 'Normal' : `${sp}`;
                          const isActive = playbackSpeed === sp;
                          return (
                            <div
                              key={sp}
                              className={`yt-submenu-row ${isActive ? 'active' : ''}`}
                              onClick={() => handleSpeedChange(sp)}
                            >
                              <span className="yt-check-box">
                                {isActive && <i className="fa-solid fa-check"></i>}
                              </span>
                              <span className="yt-submenu-label">{spLabel}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {settingsView === 'subtitles' && (
                    <div className="yt-submenu-container">
                      <div className="yt-submenu-header" onClick={() => setSettingsView('main')}>
                        <i className="fa-solid fa-chevron-left"></i>
                        <span>Subtitles/CC</span>
                      </div>
                      <div className="yt-submenu-divider"></div>
                      <div className="yt-submenu-scroll custom-scrollbar">
                        {['Off', 'English (auto-generated)', 'Hindi (auto-generated)'].map((sub) => {
                          const isActive = subtitlesLanguage === sub;
                          return (
                            <div
                              key={sub}
                              className={`yt-submenu-row ${isActive ? 'active' : ''}`}
                              onClick={() => handleSubtitlesChange(sub)}
                            >
                              <span className="yt-check-box">
                                {isActive && <i className="fa-solid fa-check"></i>}
                              </span>
                              <span className="yt-submenu-label">{sub}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {settingsView === 'timer' && (
                    <div className="yt-submenu-container">
                      <div className="yt-submenu-header" onClick={() => setSettingsView('main')}>
                        <i className="fa-solid fa-chevron-left"></i>
                        <span>Sleep timer</span>
                      </div>
                      <div className="yt-submenu-divider"></div>
                      <div className="yt-submenu-scroll custom-scrollbar">
                        {[
                          'Off',
                          '10 minutes',
                          '15 minutes',
                          '30 minutes',
                          '45 minutes',
                          '60 minutes',
                          'End of video',
                        ].map((timer) => {
                          const isActive = sleepTimer === timer;
                          return (
                            <div
                              key={timer}
                              className={`yt-submenu-row ${isActive ? 'active' : ''}`}
                              onClick={() => handleTimerChange(timer)}
                            >
                              <span className="yt-check-box">
                                {isActive && <i className="fa-solid fa-check"></i>}
                              </span>
                              <span className="yt-submenu-label">{timer}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <button
              type="button"
              className="player-action-btn yt-dock-btn"
              title="Miniplayer (i)"
              onClick={() => {
                if (document.pictureInPictureElement) {
                  document.exitPictureInPicture().catch(() => {});
                }
              }}
            >
              <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                <path d="M19 7h-8v6h8V7zm2-4H3c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16.01H3V4.99h18v14.02z"/>
              </svg>
            </button>

            <button
              type="button"
              className="player-action-btn yt-dock-btn fullscreen-btn"
              onClick={toggleFullscreen}
              title={isFullscreen ? 'Exit full screen (f)' : 'Full screen (f)'}
            >
              <i className={`fa-solid ${isFullscreen ? 'fa-compress' : 'fa-expand'}`}></i>
            </button>
          </div>
        </div>
      </div>

      {ccActive && subtitlesLanguage !== 'Off' && (
        <div className="player-cc-subtitle-overlay">
          <div className="player-cc-subtitle-box">
            {getActiveSubtitle()}
          </div>
        </div>
      )}

      {ccToast && (
        <div className="player-cc-toast">
          <span className="cc-toast-pill">{ccToast}</span>
        </div>
      )}
    </div>
  );
}
