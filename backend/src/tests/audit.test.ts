import request from 'supertest';
import app from '../app';
import { parseHtml } from '../parser/cheerioParser';

describe('Cheerio HTML Parser tests', () => {
  it('should parse basic SEO, technical and metadata information correctly', () => {
    const rawHtml = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="utf-8" />
        <title>Page Pulse Pro - Audit</title>
        <meta name="description" content="A website auditor description" />
        <meta name="keywords" content="audit, seo, checker" />
        <link rel="canonical" href="https://example.com/audit" />
        <meta property="og:title" content="OG Title Example" />
        <meta property="og:description" content="OG Description Example" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="robots" content="index, follow" />
        <link rel="icon" href="/assets/favicon.png" />
      </head>
      <body>
        <h1>Main Title</h1>
        <h2>Section Title 1</h2>
        <h2>Section Title 2</h2>
        <h3>Subsection</h3>
        <img src="logo.png" alt="Logo" />
        <img src="ad.png" />
        <a href="https://example.com/other-page">Internal Link</a>
        <a href="https://google.com">External Link</a>
        <a href="#anchor">Hash Anchor</a>
        <p>This is a simple paragraph with some words to check word count logic.</p>
      </body>
      </html>
    `;

    const result = parseHtml(rawHtml, 'https://example.com');

    expect(result.title).toBe('Page Pulse Pro - Audit');
    expect(result.description).toBe('A website auditor description');
    expect(result.keywords).toBe('audit, seo, checker');
    expect(result.canonical).toBe('https://example.com/audit');
    expect(result.language).toBe('en');
    expect(result.charset).toBe('utf-8');
    expect(result.h1Count).toBe(1);
    expect(result.h2Count).toBe(2);
    expect(result.h3Count).toBe(1);
    expect(result.totalImagesCount).toBe(2);
    expect(result.missingAltImagesCount).toBe(1); // The second image doesn't have alt
    expect(result.internalLinksCount).toBe(1); // 'other-page' matches domain hostname
    expect(result.externalLinksCount).toBe(1); // 'google.com'
    expect(result.ogTitle).toBe('OG Title Example');
    expect(result.ogDescription).toBe('OG Description Example');
    expect(result.twitterCard).toBe('summary_large_image');
    expect(result.robotsMeta).toBe('index, follow');
    expect(result.faviconUrl).toBe('https://example.com/assets/favicon.png');
    expect(result.approximateWordCount).toBeGreaterThan(5);
  });
});

describe('POST /api/audit API endpoints verification', () => {
  it('should return error for invalid URL schema', async () => {
    const response = await request(app)
      .post('/api/audit')
      .send({ url: 'invalid-url' });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.error).toContain('Invalid URL format');
  });

  it('should return error for missing URL input', async () => {
    const response = await request(app)
      .post('/api/audit')
      .send({});

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });

  it('should handle unreachable DNS queries gracefully', async () => {
    const response = await request(app)
      .post('/api/audit')
      .send({ url: 'https://thisdomainwillneverexistforrealspagepulse.com' });

    // Since it will throw DNS error (ENOTFOUND), our custom controller catches it and translates to a clean 404 response.
    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
    expect(response.body.error).toContain('DNS Failure');
  });
});
