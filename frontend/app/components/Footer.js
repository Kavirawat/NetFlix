'use client';

import { translations } from '../utils/translations';

export default function Footer({ language = 'en', onLanguageChange }) {
  const t = translations[language] || translations.en;

  return (
    <footer>
      <div className="footer-contain">
        <p>
          {t.questionsCall.split('000-800-919-1694')[0]}
          <a href="tel:0008009191694">000-800-919-1694</a>
        </p>
      </div>
      <div className="footer-item">
        <ul>
          <li><a href="#">{t.faq}</a></li>
          <li><a href="#">{t.investorRelations}</a></li>
          <li><a href="#">{t.privacy}</a></li>
          <li><a href="#">{t.speedTest}</a></li>
        </ul>
        <ul>
          <li><a href="#">{t.helpCenter}</a></li>
          <li><a href="#">{t.jobs}</a></li>
          <li><a href="#">{t.cookiePreferences}</a></li>
          <li><a href="#">{t.legalNotices}</a></li>
        </ul>
        <ul>
          <li><a href="#">{t.account}</a></li>
          <li><a href="#">{t.waysToWatch}</a></li>
          <li><a href="#">{t.corporateInfo}</a></li>
          <li><a href="#">{t.onlyOnNetflix}</a></li>
        </ul>
        <ul>
          <li><a href="#">{t.mediaCentre}</a></li>
          <li><a href="#">{t.termsOfUse}</a></li>
          <li><a href="#">{t.contactUs}</a></li>
        </ul>
      </div>

      <div className="language">
        <select
          value={language}
          onChange={(e) => onLanguageChange && onLanguageChange(e.target.value)}
          aria-label="Footer language selection"
        >
          <option value="en">English</option>
          <option value="hi">हिन्दी</option>
        </select>
        <p style={{ marginTop: '0.75rem', color: '#737373' }}>{t.netflixIndia}</p>
      </div>

      <div className="para">
        <p>
          This page is protected by Google reCAPTCHA to ensure you're not a bot.{' '}
          <a href="#">Learn more.</a>
        </p>
      </div>
    </footer>
  );
}
