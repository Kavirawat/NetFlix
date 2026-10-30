'use client';

import { translations } from '../utils/translations';

export default function FeatureBoxes({ language = 'en' }) {
  const t = translations[language] || translations.en;

  const features = [
    {
      title: t.reason1Title,
      desc: t.reason1Desc,
      img: '/tv.png',
    },
    {
      title: t.reason2Title,
      desc: t.reason2Desc,
      img: '/download.png',
    },
    {
      title: t.reason3Title,
      desc: t.reason3Desc,
      img: '/watch.png',
    },
    {
      title: t.reason4Title,
      desc: t.reason4Desc,
      img: '/msg.png',
    },
  ];

  return (
    <section className="features-section">
      <h2 className="section-title">{t.reasonsTitle}</h2>
      <div className="box-container">
        {features.map((item, index) => (
          <div key={index} className="box-item">
            <div className="box-text">
              <h3>{item.title}</h3>
              <p>{item.desc}</p>
            </div>
            <img src={item.img} alt={item.title} className="box-img" loading="lazy" />
          </div>
        ))}
      </div>
    </section>
  );
}
