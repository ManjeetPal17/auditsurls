import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '../components/ThemeContext';

export const metadata: Metadata = {
  title: 'Page Pulse Pro - Website Auditor & SEO Analytics',
  description: 'Analyze any webpage and inspect technical metrics, performance logs, accessibility, and SEO information instantly.',
  keywords: ['seo auditor', 'website scanner', 'seo analytics', 'accessibility audit', 'web metrics'],
  authors: [{ name: 'Digital Heroes Developer' }],
  openGraph: {
    title: 'Page Pulse Pro',
    description: 'Analyze any webpage and inspect technical metrics, performance logs, accessibility, and SEO information instantly.',
    type: 'website',
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-background text-foreground antialiased min-h-screen font-sans">
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
