'use client';

import { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import TrendingSlider from './components/TrendingSlider';
import TrendingSongs from './components/TrendingSongs';
import FeatureBoxes from './components/FeatureBoxes';
import Faq from './components/Faq';
import Footer from './components/Footer';
import AuthModal from './components/AuthModal';
import SettingsModal from './components/SettingsModal';
import Toast from './components/Toast';
import NetflixVideoPlayer from './components/NetflixVideoPlayer';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

export default function Home() {
  const [user, setUser] = useState(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState('signin');
  const [prefillEmail, setPrefillEmail] = useState('');
  const [toast, setToast] = useState({ message: '', visible: false });
  const [activeVideoMovie, setActiveVideoMovie] = useState(null);
  const [pendingPlayMovie, setPendingPlayMovie] = useState(null);
  const [language, setLanguage] = useState('en');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedLang = localStorage.getItem('netflix_language');
      if (savedLang === 'hi' || savedLang === 'en') {
        setLanguage(savedLang);
      }
    }
  }, []);

  const handleLanguageChange = (newLang) => {
    setLanguage(newLang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('netflix_language', newLang);
    }
    triggerToast(newLang === 'hi' ? 'भाषा बदलकर हिन्दी कर दी गई है।' : 'Language switched to English.');
  };

  const triggerToast = (msg, duration = 3500) => {
    setToast({ message: msg, visible: true });
    setTimeout(() => {
      setToast({ message: '', visible: false });
    }, duration);
  };

  useEffect(() => {
    const savedUser = localStorage.getItem('netflix_user');
    const token = localStorage.getItem('netflix_token');

    if (savedUser && token) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        console.error('Failed to parse saved user', e);
      }

      fetch(`${BACKEND_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.user) {
            setUser(data.user);
            localStorage.setItem('netflix_user', JSON.stringify(data.user));
          } else {
            localStorage.removeItem('netflix_token');
            localStorage.removeItem('netflix_user');
            setUser(null);
          }
        })
        .catch(() => {});
    }
  }, []);

  const handleOpenAuth = (mode = 'signin', email = '') => {
    setAuthMode(mode);
    setPrefillEmail(email);
    setAuthModalOpen(true);
  };

  const handleCloseAuth = () => {
    setAuthModalOpen(false);
  };

  const handleAuthSuccess = (userData, message) => {
    setUser(userData);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    triggerToast(
      language === 'hi'
        ? `म्यूज़िक पर आपका स्वागत है, ${userData.name || 'दोस्त'}!`
        : `Welcome back to Music, ${userData.name || 'Friend'}!`
    );

    if (pendingPlayMovie) {
      setActiveVideoMovie(pendingPlayMovie);
      setPendingPlayMovie(null);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch(`${BACKEND_URL}/api/auth/logout`, { method: 'POST' });
    } catch (e) {}
    localStorage.removeItem('netflix_token');
    localStorage.removeItem('netflix_user');
    setUser(null);
    setPendingPlayMovie(null);
    setActiveVideoMovie(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    triggerToast(language === 'hi' ? 'आप साइन आउट हो गए हैं।' : 'You have been signed out.');
  };

  const handlePlayMovie = (movie) => {
    if (!user) {
      setPendingPlayMovie(movie);
      handleOpenAuth('signin');
      triggerToast(
        language === 'hi'
          ? 'वीडियो चलाने के लिए पहले कृपया लॉगिन करें।'
          : 'Please sign in to stream movies and songs.'
      );
      return;
    }
    setActiveVideoMovie(movie);
  };

  return (
    <>
      <header>
        <Navbar
          user={user}
          onOpenAuth={handleOpenAuth}
          onLogout={handleLogout}
          language={language}
          onLanguageChange={handleLanguageChange}
          onOpenSettings={() => setSettingsModalOpen(true)}
          onPlayMovie={handlePlayMovie}
        />

        <Hero
          onOpenAuth={handleOpenAuth}
          user={user}
          onPlayMovie={handlePlayMovie}
          language={language}
        />
      </header>

      <main>
        {!user && <div className="border-curve"></div>}

        <TrendingSlider
          onPlayMovie={handlePlayMovie}
          language={language}
        />

        <TrendingSongs
          onPlayMovie={handlePlayMovie}
          language={language}
          user={user}
          onOpenAuth={handleOpenAuth}
          onLogout={handleLogout}
          onLanguageChange={handleLanguageChange}
          onOpenSettings={() => setSettingsModalOpen(true)}
        />

        <FeatureBoxes language={language} />

        <Faq
          onOpenAuth={handleOpenAuth}
          user={user}
          language={language}
        />
      </main>

      <Footer
        language={language}
        onLanguageChange={handleLanguageChange}
      />

      {activeVideoMovie && (
        <NetflixVideoPlayer
          movie={activeVideoMovie}
          onClose={() => setActiveVideoMovie(null)}
          onPlayMovie={handlePlayMovie}
          language={language}
        />
      )}

      <SettingsModal
        isOpen={settingsModalOpen}
        onClose={() => setSettingsModalOpen(false)}
        user={user}
        language={language}
        onLanguageChange={handleLanguageChange}
        onSaveSettings={({ quality }) => {
          triggerToast(
            language === 'hi'
              ? `क्वालिटी ${quality.toUpperCase()} सेट हो गई है।`
              : `Streaming quality updated to ${quality.toUpperCase()}.`
          );
        }}
      />

      <AuthModal
        isOpen={authModalOpen}
        initialMode={authMode}
        prefillEmail={prefillEmail}
        onClose={handleCloseAuth}
        onAuthSuccess={handleAuthSuccess}
      />

      <Toast message={toast.message} isVisible={toast.visible} />
    </>
  );
}
