import * as cheerio from 'cheerio';
import { URL } from 'url';

export function parseHtml(html: string, baseUrl: string): {
  title: string;
  description: string;
  keywords: string;
  canonical: string;
  language: string;
  charset: string;
  h1Count: number;
  h2Count: number;
  h3Count: number;
  missingAltImagesCount: number;
  totalImagesCount: number;
  externalLinksCount: number;
  internalLinksCount: number;
  approximateWordCount: number;
  ogTitle: string;
  ogDescription: string;
  twitterCard: string;
  robotsMeta: string;
  faviconUrl: string;
} {
  const $ = cheerio.load(html);
  
  // Title
  const title = $('title').first().text().trim() || '';

  // Meta tags
  const description = $('meta[name="description"]').attr('content')?.trim() || 
                      $('meta[property="og:description"]').attr('content')?.trim() || '';
  const keywords = $('meta[name="keywords"]').attr('content')?.trim() || '';
  const canonical = $('link[rel="canonical"]').attr('href')?.trim() || '';
  const language = $('html').attr('lang')?.trim() || '';
  const charset = $('meta[charset]').attr('charset')?.trim() || 
                  $('meta[http-equiv="Content-Type"]').attr('content')?.split('charset=')[1]?.trim() || '';

  // Headings
  const h1Count = $('h1').length;
  const h2Count = $('h2').length;
  const h3Count = $('h3').length;

  // Images
  const totalImagesCount = $('img').length;
  let missingAltImagesCount = 0;
  $('img').each((_, el) => {
    const alt = $(el).attr('alt');
    if (alt === undefined || alt === null || alt.trim() === '') {
      missingAltImagesCount++;
    }
  });

  // Links (Internal vs External)
  let externalLinksCount = 0;
  let internalLinksCount = 0;
  
  let baseHostname = '';
  try {
    baseHostname = new URL(baseUrl).hostname;
  } catch {
    // Fallback if baseUrl is invalid
  }

  $('a').each((_, el) => {
    const href = $(el).attr('href')?.trim();
    if (!href) return;

    if (href.startsWith('#') || href.startsWith('javascript:') || href.startsWith('mailto:') || href.startsWith('tel:')) {
      return;
    }

    try {
      const absoluteUrl = new URL(href, baseUrl);
      if (absoluteUrl.hostname === baseHostname) {
        internalLinksCount++;
      } else {
        externalLinksCount++;
      }
    } catch {
      // Relative URL or invalid URL format which typically resolves to internal if parsing fails but is valid relative path
      if (href.startsWith('/') || !href.includes('://')) {
        internalLinksCount++;
      } else {
        externalLinksCount++;
      }
    }
  });

  // Word Count approximation (text of body)
  const bodyText = $('body').text() || '';
  const words = bodyText.replace(/\s+/g, ' ').trim().split(' ');
  const approximateWordCount = words[0] === '' ? 0 : words.length;

  // Open Graph & Social
  const ogTitle = $('meta[property="og:title"]').attr('content')?.trim() || '';
  const ogDescription = $('meta[property="og:description"]').attr('content')?.trim() || '';
  const twitterCard = $('meta[name="twitter:card"]').attr('content')?.trim() || '';
  const robotsMeta = $('meta[name="robots"]').attr('content')?.trim() || '';

  // Favicon
  let faviconUrl = $('link[rel="icon"]').attr('href')?.trim() || 
                   $('link[rel="shortcut icon"]').attr('href')?.trim() || '';
  if (faviconUrl && !faviconUrl.startsWith('http') && !faviconUrl.startsWith('data:')) {
    try {
      faviconUrl = new URL(faviconUrl, baseUrl).toString();
    } catch {
      // Leave as is
    }
  } else if (!faviconUrl) {
    // Default fallback assumption
    try {
      faviconUrl = new URL('/favicon.ico', baseUrl).toString();
    } catch {
      faviconUrl = '';
    }
  }

  return {
    title,
    description,
    keywords,
    canonical,
    language,
    charset,
    h1Count,
    h2Count,
    h3Count,
    missingAltImagesCount,
    totalImagesCount,
    externalLinksCount,
    internalLinksCount,
    approximateWordCount,
    ogTitle,
    ogDescription,
    twitterCard,
    robotsMeta,
    faviconUrl
  };
}
