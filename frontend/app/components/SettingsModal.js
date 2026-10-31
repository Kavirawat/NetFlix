'use client';

import { useState } from 'react';
import { translations } from '../utils/translations';

export default function SettingsModal({ isOpen, onClose, user, language, onLanguageChange, onSaveSettings }) {
  const [quality, setQuality] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('netflix_quality') || '4k';
    }
    return '4k';
  });

  const [selectedLang, setSelectedLang] = useState(language || 'en');
  const [savedAlert, setSavedAlert] = useState(false);

  if (!isOpen) return null;

  const t = translations[selectedLang] || translations.en;

  const handleSave = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('netflix_quality', quality);
      localStorage.setItem('netflix_language', selectedLang);
    }
    if (onLanguageChange && selectedLang !== language) {
      onLanguageChange(selectedLang);
    }
    if (onSaveSettings) {
      onSaveSettings({ quality, language: selectedLang });
    }
    setSavedAlert(true);
    setTimeout(() => {
      setSavedAlert(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="netflix-modal-backdrop" onClick={onClose}>
      <div className="netflix-modal-box settings-modal-box" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          className="modal-close-btn"
          onClick={onClose}
          aria-label="Close settings"
        >
          &times;
        </button>

        <div className="settings-header">
          <div className="settings-icon-circle">
            <i className="fa-solid fa-gear"></i>
          </div>
          <h2>{t.settingsTitle}</h2>
        </div>

        {savedAlert && (
          <div className="settings-alert-success">
            <i className="fa-solid fa-circle-check"></i> {t.settingsSaved}
          </div>
        )}

        <div className="settings-body">
          
          <div className="settings-group">
            <label className="settings-label">{t.accountEmail}</label>
            <div className="settings-user-info">
              <span className="user-email-text">{user?.email || 'user@music.com'}</span>
            </div>
          </div>

          <div className="settings-group">
            <label className="settings-label">
              <i className="fa-solid fa-film"></i> {t.streamingQuality}
            </label>
            <div className="quality-radio-list">
              <label className={`quality-option ${quality === 'auto' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="quality"
                  value="auto"
                  checked={quality === 'auto'}
                  onChange={(e) => setQuality(e.target.value)}
                />
                <span className="quality-title">{t.qualityAuto}</span>
              </label>

              <label className={`quality-option ${quality === '4k' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="quality"
                  value="4k"
                  checked={quality === '4k'}
                  onChange={(e) => setQuality(e.target.value)}
                />
                <span className="quality-title">{t.quality4k}</span>
                <span className="quality-tag">4K HDR</span>
              </label>

              <label className={`quality-option ${quality === '8k' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="quality"
                  value="8k"
                  checked={quality === '8k'}
                  onChange={(e) => setQuality(e.target.value)}
                />
                <span className="quality-title">{t.quality8k}</span>
                <span className="quality-tag tag-8k">8K ULTRA</span>
              </label>
            </div>
          </div>

          <div className="settings-group">
            <label className="settings-label">
              <i className="fa-solid fa-globe"></i> {t.languagePref}
            </label>
            <select
              className="settings-select"
              value={selectedLang}
              onChange={(e) => setSelectedLang(e.target.value)}
            >
              <option value="en">English (English)</option>
              <option value="hi">हिन्दी (Hindi)</option>
            </select>
          </div>
        </div>

        <div className="settings-footer">
          <button type="button" className="settings-cancel-btn" onClick={onClose}>
            {t.close}
          </button>
          <button type="button" className="settings-save-btn" onClick={handleSave}>
            {t.saveChanges}
          </button>
        </div>
      </div>
    </div>
  );
}
