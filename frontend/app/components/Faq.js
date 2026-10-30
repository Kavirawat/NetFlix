'use client';

import { useState } from 'react';
import { translations } from '../utils/translations';

const FAQ_LIST_EN = [
  {
    q: 'What is Music?',
    a: 'Music is a streaming service that offers a wide variety of award-winning TV shows, movies, songs, anime, documentaries and more on thousands of internet-connected devices. You can watch and listen as much as you want, whenever you want without a single commercial – all for one low monthly price.',
  },
  {
    q: 'How much does Music cost?',
    a: 'Watch and listen to Music on your smartphone, tablet, Smart TV, laptop, or streaming device, all for one fixed monthly fee. Plans range from ₹149 to ₹649 a month. No extra costs, no contracts.',
  },
  {
    q: 'Where can I watch?',
    a: 'Watch anywhere, anytime. Sign in with your Music account to watch instantly on the web at music.com from your personal computer or on any internet-connected device that offers the Music app.',
  },
  {
    q: 'How do I cancel?',
    a: 'Music is flexible. There are no pesky contracts and no commitments. You can easily cancel your account online in two clicks. There are no cancellation fees – start or stop your account anytime.',
  },
  {
    q: 'What can I watch on Music?',
    a: 'Music has an extensive library of feature films, hit songs, documentaries, TV shows, anime, award-winning Music originals, and more. Watch and listen as much as you want, anytime you want.',
  },
  {
    q: 'Is Music good for kids?',
    a: 'The Music Kids experience is included in your membership to give parents control while kids enjoy family-friendly TV shows and films in their own space. Kids profiles come with PIN-protected parental controls.',
  },
];

const FAQ_LIST_HI = [
  {
    q: 'म्यूज़िक क्या है?',
    a: 'म्यूज़िक एक स्ट्रीमिंग सेवा है जो हजारों इंटरनेट-कनेक्टेड डिवाइसों पर कई तरह के पुरस्कार विजेता टीवी शो, फिल्में, गाने, एनीमे, वृत्तचित्र और बहुत कुछ पेश करती है। आप जब चाहें, जितना चाहें देख और सुन सकते हैं — एक कम मासिक शुल्क पर।',
  },
  {
    q: 'म्यूज़िक की कीमत कितनी है?',
    a: 'अपने स्मार्टफोन, टैबलेट, स्मार्ट टीवी, लैपटॉप या स्ट्रीमिंग डिवाइस पर म्यूज़िक देखें व सुनें, सभी के लिए एक निश्चित मासिक शुल्क। प्लान ₹149 से ₹649 प्रति माह तक हैं। कोई अतिरिक्त लागत नहीं, कोई अनुबंध नहीं।',
  },
  {
    q: 'मैं कहाँ देख सकता हूँ?',
    a: 'कहीं भी, कभी भी देखें। अपने पर्सनल कंप्यूटर से music.com पर वेब पर तुरंत देखने के लिए या म्यूज़िक ऐप पेश करने वाले किसी भी इंटरनेट-कनेक्टेड डिवाइस पर अपने म्यूज़िक खाते से साइन इन करें।',
  },
  {
    q: 'मैं सदस्यता कैसे रद्द करूँ?',
    a: 'म्यूज़िक बहुत आसान और फ्लेक्सिबल है। कोई परेशानी भरे अनुबंध नहीं हैं और कोई प्रतिबद्धता नहीं है। आप आसानी से दो क्लिक में अपना खाता ऑनलाइन रद्द कर सकते हैं। कोई रद्दीकरण शुल्क नहीं है।',
  },
  {
    q: 'मैं म्यूज़िक पर क्या देख सकता हूँ?',
    a: 'म्यूज़िक में फीचर फिल्मों, ब्लॉकबस्टर गानों, वृत्तचित्रों, टीवी शो, एनीमे, पुरस्कार विजेता म्यूज़िक ओरिजिनल्स और बहुत कुछ की एक व्यापक लाइब्रेरी है। जितना चाहें देखें, जब चाहें देखें।',
  },
  {
    q: 'क्या म्यूज़िक बच्चों के लिए अच्छा है?',
    a: 'माता-पिता को नियंत्रण देने के लिए म्यूज़िक किड्स का अनुभव आपकी सदस्यता में शामिल है, जबकि बच्चे अपने स्वयं के स्थान में परिवार के अनुकूल टीवी शो और फिल्मों का आनंद लेते हैं।',
  },
];

export default function Faq({ onOpenAuth, user, language = 'en' }) {
  const [openIndex, setOpenIndex] = useState(null);
  const [email, setEmail] = useState('');
  const t = translations[language] || translations.en;
  const faqList = language === 'hi' ? FAQ_LIST_HI : FAQ_LIST_EN;

  const toggleFaq = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onOpenAuth('signup', email);
  };

  return (
    <section className="info">
      <h2>{t.faqTitle}</h2>
      <div className="info-contain">
        {faqList.map((item, index) => {
          const isOpen = openIndex === index;
          return (
            <div
              key={index}
              className={`info-box ${isOpen ? 'open' : ''}`}
              onClick={() => toggleFaq(index)}
            >
              <div className="info-header">
                <p>{item.q}</p>
                <i className={`fa-solid ${isOpen ? 'fa-xmark' : 'fa-plus'}`}></i>
              </div>
              <div className="info-body">
                <p>{item.a}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* When user is NOT logged in, show bottom CTA. When logged in, hide completely as requested */}
      {!user && (
        <div className="faq-register">
          <h4>{t.faqCta}</h4>
          <form className="hero-form" onSubmit={handleSubmit}>
            <input
              type="email"
              placeholder={t.emailPlaceholder}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <button type="submit">
              {t.getStarted} <i className="fa-solid fa-greater-than"></i>
            </button>
          </form>
        </div>
      )}
    </section>
  );
}
