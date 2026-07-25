import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { z } from 'zod';
import { parseHtml } from '@/lib/cheerioParser';

const urlSchema = z.object({
  url: z.string().trim().url({ message: 'Invalid URL provided. Please enter a valid HTTP or HTTPS address.' }),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validation = urlSchema.safeParse(body);

    if (!validation.success) {
      const errorMsg = validation.error.errors[0]?.message || 'Invalid parameters';
      return NextResponse.json({ success: false, error: errorMsg }, { status: 400 });
    }

    const { url } = validation.data;
    const startTime = Date.now();

    try {
      const response = await axios.get(url, {
        timeout: 10000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36 PagePulseAuditor/1.0',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5'
        },
        maxRedirects: 5,
        validateStatus: () => true
      });

      const responseTime = Date.now() - startTime;
      const contentType = (response.headers['content-type'] as string) || '';

      if (!contentType.includes('text/html') && !contentType.includes('application/xhtml+xml')) {
        return NextResponse.json(
          { 
            success: false, 
            error: `Target server returned non-HTML content type (${contentType || 'Unknown'}). Only HTML web pages can be audited.` 
          }, 
          { status: 400 }
        );
      }

      const html = typeof response.data === 'string' ? response.data : String(response.data || '');
      const parsedData = parseHtml(html, url);

      const auditResult = {
        status: response.status,
        responseTime,
        ...parsedData,
        contentType,
        contentLength: response.headers['content-length'] 
          ? parseInt(response.headers['content-length'] as string, 10) 
          : Buffer.byteLength(html, 'utf8'),
        serverHeader: (response.headers['server'] as string) || 'N/A',
        dateHeader: (response.headers['date'] as string) || new Date().toUTCString(),
      };

      return NextResponse.json({
        success: true,
        data: auditResult
      });

    } catch (fetchErr: any) {
      const responseTime = Date.now() - startTime;

      if (fetchErr.code === 'ECONNABORTED' || fetchErr.message?.includes('timeout')) {
        return NextResponse.json(
          { success: false, error: 'Request timed out after 10 seconds. The target website took too long to respond.' },
          { status: 504 }
        );
      }

      if (fetchErr.code === 'ENOTFOUND' || fetchErr.code === 'EAI_AGAIN') {
        return NextResponse.json(
          { success: false, error: 'Domain name resolution failed. Could not find the specified host.' },
          { status: 404 }
        );
      }

      if (fetchErr.code === 'ECONNREFUSED') {
        return NextResponse.json(
          { success: false, error: 'Connection refused by the target web server.' },
          { status: 502 }
        );
      }

      return NextResponse.json(
        { success: false, error: fetchErr.message || 'Failed to fetch the target page.' },
        { status: 500 }
      );
    }

  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: 'Malformed JSON payload or server error.' },
      { status: 400 }
    );
  }
}
