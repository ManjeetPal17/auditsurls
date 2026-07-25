import { Request, Response, NextFunction } from 'express';
import axios from 'axios';
import { parseHtml } from '../parser/cheerioParser';
import { AuditData } from '../types';

export const runAudit = async (req: Request, res: Response, next: NextFunction) => {
  const { url } = req.body;

  const startTime = Date.now();

  try {
    // Custom axios client configuration to handle specific error criteria
    const response = await axios.get(url, {
      timeout: 10000, // 10 seconds timeout
      maxRedirects: 5, // Prevent infinite redirect loops
      headers: {
        'User-Agent': 'PagePulsePro-Auditor/1.0.0 (+https://pagepulsepro.com)',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br'
      },
      responseType: 'text', // Read text to parse HTML
      validateStatus: () => true // Allow handling non-200 responses inside custom controller
    });

    const responseTime = Date.now() - startTime;

    // Handle standard server error statuses gracefully without throwing uncaught exceptions
    if (response.status >= 400) {
      return res.status(response.status).json({
        success: false,
        error: `Target server returned error status ${response.status}`
      });
    }

    const contentTypeRaw = response.headers['content-type'] || '';
    const contentType = Array.isArray(contentTypeRaw) ? contentTypeRaw[0] : String(contentTypeRaw);
    if (!contentType.includes('text/html') && !contentType.includes('application/xhtml+xml')) {
      return res.status(400).json({
        success: false,
        error: `The URL did not return HTML content. Received Content-Type: ${contentType}`
      });
    }

    const html = response.data;
    const contentLength = html ? Buffer.byteLength(html, 'utf8') : 0;

    // Check size limit: 5MB to avoid memory overflow
    if (contentLength > 5 * 1024 * 1024) {
      return res.status(400).json({
        success: false,
        error: 'Target page is too large to audit (exceeds 5MB limits).'
      });
    }

    const parsedData = parseHtml(html, url);

    const auditResult: AuditData = {
      status: response.status,
      responseTime,
      title: parsedData.title,
      description: parsedData.description,
      keywords: parsedData.keywords,
      canonical: parsedData.canonical,
      language: parsedData.language,
      charset: parsedData.charset,
      h1Count: parsedData.h1Count,
      h2Count: parsedData.h2Count,
      h3Count: parsedData.h3Count,
      missingAltImagesCount: parsedData.missingAltImagesCount,
      totalImagesCount: parsedData.totalImagesCount,
      externalLinksCount: parsedData.externalLinksCount,
      internalLinksCount: parsedData.internalLinksCount,
      approximateWordCount: parsedData.approximateWordCount,
      ogTitle: parsedData.ogTitle,
      ogDescription: parsedData.ogDescription,
      twitterCard: parsedData.twitterCard,
      robotsMeta: parsedData.robotsMeta,
      faviconUrl: parsedData.faviconUrl,
      contentType,
      contentLength,
      serverHeader: (response.headers['server'] as string) || 'N/A',
      dateHeader: (response.headers['date'] as string) || new Date().toUTCString(),
    };

    return res.status(200).json({
      success: true,
      data: auditResult
    });

  } catch (error: any) {
    const responseTime = Date.now() - startTime;
    let errorMessage = 'An error occurred while auditing the website.';
    let status = 500;

    if (error.code === 'ECONNABORTED') {
      errorMessage = 'Request timeout. The server took too long to respond.';
      status = 408;
    } else if (error.code === 'ENOTFOUND') {
      errorMessage = 'DNS Failure. The domain name could not be resolved.';
      status = 404;
    } else if (error.code === 'ERR_BAD_SSL_CLIENT_ENTRY_KEY' || error.message?.includes('SSL')) {
      errorMessage = 'SSL Error. Could not establish a secure connection with the target server.';
      status = 495;
    } else if (error.response) {
      status = error.response.status;
      errorMessage = `Server responded with status ${status}: ${error.response.statusText}`;
    } else if (error.request) {
      errorMessage = 'Network Error. Could not connect to the remote server.';
      status = 503;
    } else {
      errorMessage = error.message || errorMessage;
    }

    return res.status(status).json({
      success: false,
      error: errorMessage
    });
  }
};
