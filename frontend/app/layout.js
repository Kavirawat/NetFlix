import { Montserrat } from 'next/font/google';
import './globals.css';

const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  display: 'swap',
  variable: '--font-montserrat',
});

export const metadata = {
  title: 'Music India – Watch TV Shows Online, Watch Movies & Music Online',
  description: 'Music Streaming Platform built with Next.js and Express backend',
  icons: {
    icon: '/logo.png',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={montserrat.className}>
      <head>
        <link rel="stylesheet" href="/font-awesome.min.css" precedence="default" />
      </head>
      <body>{children}</body>
    </html>
  );
}
