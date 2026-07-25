export interface AuditData {
  status: number;
  responseTime: number;
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
  contentType: string;
  contentLength: number;
  serverHeader: string;
  dateHeader: string;
}

export interface AuditResponse {
  success: boolean;
  data?: AuditData;
  error?: string;
}
