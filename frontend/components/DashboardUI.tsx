'use client';

import React, { useState, useEffect } from 'react';
import { useTheme } from './ThemeContext';
import { 
  Search, Sun, Moon, Link2, Clock, Globe, ArrowRight, FileText, CheckCircle2, AlertTriangle, 
  ExternalLink, ChevronRight, RefreshCw, Copy, Check, Download, Share2, SearchCode, History,
  Info, Cpu, BarChart3, Database, ShieldAlert, Accessibility, Key, BookOpen
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Types matched to backend response structure
interface AuditData {
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

interface HistoricalAudit {
  url: string;
  timestamp: string;
  data: AuditData;
}

export default function DashboardUI() {
  const { theme, toggleTheme } = useTheme();
  
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentAudit, setCurrentAudit] = useState<AuditData | null>(null);
  const [history, setHistory] = useState<HistoricalAudit[]>([]);
  const [copied, setCopied] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Helper for safe hostname parsing
  const getHostname = (inputUrl: string) => {
    try {
      return new URL(inputUrl).hostname || inputUrl;
    } catch {
      return inputUrl || 'report';
    }
  };

  // Active view switcher inside audit results
  const [activeTab, setActiveTab] = useState<'overview' | 'seo' | 'technical' | 'accessibility' | 'raw'>('overview');

  // Load history from local storage on mount
  useEffect(() => {
    const stored = localStorage.getItem('audit_history');
    if (stored) {
      try {
        setHistory(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to parse history', e);
      }
    }
  }, []);

  // Keyboard shortcut listener: Ctrl + Enter to run audit, Esc to close errors
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'Enter') {
        e.preventDefault();
        triggerAudit();
      }
      if (e.key === 'Escape') {
        setError(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [url]);

  const triggerAudit = async (targetUrl = url) => {
    if (!targetUrl.trim()) return;
    
    // Add protocol if missing
    let finalUrl = targetUrl.trim();
    if (!/^https?:\/\//i.test(finalUrl)) {
      finalUrl = 'https://' + finalUrl;
    }
    setUrl(finalUrl);

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: finalUrl }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || `Server responded with ${res.status}`);
      }

      const auditData: AuditData = json.data;
      setCurrentAudit(auditData);

      // Save to history
      const newHistoryItem: HistoricalAudit = {
        url: finalUrl,
        timestamp: new Date().toLocaleTimeString() + ' ' + new Date().toLocaleDateString(),
        data: auditData
      };
      
      const updatedHistory = [newHistoryItem, ...history.filter(item => item.url !== finalUrl)].slice(0, 15);
      setHistory(updatedHistory);
      localStorage.setItem('audit_history', JSON.stringify(updatedHistory));
    } catch (err: any) {
      setError(err.message || 'Failed to complete audit.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (!currentAudit) return;
    navigator.clipboard.writeText(JSON.stringify(currentAudit, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadJson = () => {
    if (!currentAudit) return;
    const blob = new Blob([JSON.stringify(currentAudit, null, 2)], { type: 'application/json' });
    const u = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = u;
    a.download = `audit-${getHostname(url)}.json`;
    a.click();
    URL.revokeObjectURL(u);
  };

  const downloadPdfReport = () => {
    if (!currentAudit) return;
    // Premium formatted text-based report
    const textReport = `
PAGE PULSE PRO - AUDIT REPORT
================================================
Target URL: ${url}
Audited On: ${new Date().toLocaleString()}
Status Code: ${currentAudit.status}
Response Time: ${currentAudit.responseTime}ms
Page Size: ${(currentAudit.contentLength / 1024).toFixed(2)} KB

TECHNICAL SEO METRICS:
- Title: ${currentAudit.title || 'N/A'}
- Description: ${currentAudit.description || 'N/A'}
- Keywords: ${currentAudit.keywords || 'N/A'}
- Language: ${currentAudit.language || 'N/A'}
- Charset: ${currentAudit.charset || 'N/A'}
- Canonical: ${currentAudit.canonical || 'N/A'}
- Robots Meta: ${currentAudit.robotsMeta || 'N/A'}

HEADING HIERARCHY:
- H1 Tags: ${currentAudit.h1Count}
- H2 Tags: ${currentAudit.h2Count}
- H3 Tags: ${currentAudit.h3Count}

IMAGERY & ACCESSIBILITY:
- Total Images: ${currentAudit.totalImagesCount}
- Images Missing ALT Text: ${currentAudit.missingAltImagesCount}

HYPERLINK PROFILE:
- Internal Links: ${currentAudit.internalLinksCount}
- External Links: ${currentAudit.externalLinksCount}

SOCIAL METRICS:
- Open Graph Title: ${currentAudit.ogTitle || 'N/A'}
- Open Graph Description: ${currentAudit.ogDescription || 'N/A'}
- Twitter Card Type: ${currentAudit.twitterCard || 'N/A'}

================================================
Generated by Page Pulse Pro website auditor.
    `;
    const blob = new Blob([textReport], { type: 'text/plain' });
    const u = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = u;
    a.download = `audit-report-${getHostname(url)}.txt`;
    a.click();
    URL.revokeObjectURL(u);
  };

  const shareAudit = () => {
    const shareUrl = `${window.location.origin}/dashboard?url=${encodeURIComponent(url)}`;
    navigator.clipboard.writeText(shareUrl);
    setShareCopied(true);
    setTimeout(() => setShareCopied(false), 2000);
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem('audit_history');
  };

  const filteredHistory = history.filter(item => 
    item.url.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground transition-colors duration-200">
      
      {/* Sidebar - Audit History List */}
      <aside className="w-80 border-r border-border bg-card/40 flex flex-col hidden md:flex">
        <div className="p-6 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg shadow-sm">
              P
            </div>
            <div>
              <h1 className="font-bold text-sm tracking-wide">PAGE PULSE</h1>
              <p className="text-[10px] text-muted-foreground font-semibold">VERSION 1.0.0</p>
            </div>
          </div>
          <button 
            onClick={toggleTheme} 
            className="p-2 hover:bg-secondary rounded-lg transition-colors"
            title="Toggle color theme"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-slate-800" />}
          </button>
        </div>

        <div className="p-4 border-b border-border">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search history..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-secondary/80 border border-border pl-9 pr-4 py-2 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          <div className="flex items-center justify-between px-2 text-[10px] uppercase font-bold tracking-widest text-muted-foreground mb-2">
            <span>Recent Audits</span>
            {history.length > 0 && (
              <button 
                onClick={clearHistory} 
                className="hover:text-destructive transition-colors text-[9px]"
              >
                Clear
              </button>
            )}
          </div>

          {filteredHistory.length === 0 ? (
            <div className="text-center py-8 text-xs text-muted-foreground">
              <History className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p>No recent audits found.</p>
            </div>
          ) : (
            filteredHistory.map((item, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setUrl(item.url);
                  setCurrentAudit(item.data);
                }}
                className={`w-full text-left p-3 rounded-xl border border-transparent transition-all hover:bg-secondary/70 flex flex-col gap-1 ${url === item.url ? 'bg-secondary border-border shadow-sm font-semibold' : ''}`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="text-[10px] px-2 py-0.5 bg-green-500/10 text-green-500 rounded-full font-medium">
                    {item.data.status}
                  </span>
                  <span className="text-[9px] text-muted-foreground">
                    {item.data.responseTime}ms
                  </span>
                </div>
                <span className="text-xs truncate font-medium text-foreground block w-full mt-1">
                  {item.url}
                </span>
                <span className="text-[9px] text-muted-foreground">
                  {item.timestamp}
                </span>
              </button>
            ))
          )}
        </div>

        <div className="p-4 border-t border-border bg-secondary/20">
          <div className="text-xs text-center text-muted-foreground flex flex-col gap-1">
            <p>Built for <a href="https://digitalheroesco.com" target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground transition-colors font-medium">Digital Heroes Training Task</a></p>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        
        {/* Top Header */}
        <header className="h-16 border-b border-border px-6 flex items-center justify-between bg-card/20 backdrop-blur-md z-10">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold">Dashboard</span>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground truncate max-w-[200px] md:max-w-xs">{url || 'New Audit'}</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden lg:flex items-center gap-2 text-xs text-muted-foreground bg-secondary/80 px-3 py-1.5 rounded-lg border border-border">
              <span className="font-mono bg-background px-1.5 py-0.5 rounded border border-border">Ctrl + Enter</span>
              <span>Audit Run</span>
            </div>
            
            {/* Small Screen Theme Switcher */}
            <button 
              onClick={toggleTheme} 
              className="p-2 hover:bg-secondary rounded-lg transition-colors md:hidden"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-slate-800" />}
            </button>
          </div>
        </header>

        {/* Dynamic Inner Container */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8">
          
          {/* Main URL Bar and Actions */}
          <section className="bg-card border border-border p-6 rounded-2xl shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full filter blur-3xl pointer-events-none"></div>
            
            <div className="max-w-3xl mx-auto space-y-4">
              <div className="space-y-1">
                <h2 className="text-xl font-bold tracking-tight">Run Real-time Audit</h2>
                <p className="text-xs text-muted-foreground">Submit any website to extract critical technical indicators, check accessibility compliance, and profile basic SEO setups.</p>
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <Link2 className="absolute left-4 top-3.5 w-5 h-5 text-muted-foreground" />
                  <input
                    type="url"
                    placeholder="https://example.com"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && triggerAudit()}
                    className="w-full bg-secondary/40 border border-border pl-12 pr-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-sm"
                  />
                </div>
                <button
                  onClick={() => triggerAudit()}
                  disabled={loading || !url.trim()}
                  className="bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-3 rounded-xl font-medium text-sm flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Auditing...</span>
                    </>
                  ) : (
                    <>
                      <span>Analyze Page</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>

              {/* Status & Friendly Errors */}
              <AnimatePresence>
                {error && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="p-4 bg-destructive/10 border border-destructive/20 text-destructive rounded-xl text-xs flex items-start gap-3"
                  >
                    <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-semibold">Verification Interrupted</p>
                      <p className="mt-1 opacity-90">{error}</p>
                    </div>
                    <button 
                      onClick={() => triggerAudit()} 
                      className="px-3 py-1 bg-destructive/20 rounded hover:bg-destructive/30 transition-all font-semibold"
                    >
                      Retry
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </section>

          {/* Results Grid Dashboard */}
          {loading ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-24 bg-card border border-border animate-pulse rounded-2xl"></div>
                ))}
              </div>
              <div className="h-96 bg-card border border-border animate-pulse rounded-2xl"></div>
            </div>
          ) : currentAudit ? (
            <div className="space-y-6">
              
              {/* Audit Meta Controls */}
              <div className="flex flex-wrap items-center justify-between gap-4 bg-card border border-border px-6 py-4 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-500/10 text-green-500 flex items-center justify-center font-bold">
                    {currentAudit.status}
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold truncate max-w-xs">{getHostname(url)}</h3>
                    <p className="text-[10px] text-muted-foreground font-mono">Parsed content type: {currentAudit.contentType}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button 
                    onClick={copyToClipboard}
                    className="p-2 hover:bg-secondary rounded-lg border border-border flex items-center gap-1.5 text-xs transition-colors"
                    title="Copy response body JSON to clipboard"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>Copy JSON</span>
                  </button>

                  <button 
                    onClick={downloadJson}
                    className="p-2 hover:bg-secondary rounded-lg border border-border flex items-center gap-1.5 text-xs transition-colors"
                    title="Download audit result as raw JSON"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>JSON</span>
                  </button>

                  <button 
                    onClick={downloadPdfReport}
                    className="p-2 hover:bg-secondary rounded-lg border border-border flex items-center gap-1.5 text-xs transition-colors"
                    title="Export styled summary document format"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Report</span>
                  </button>

                  <button 
                    onClick={shareAudit}
                    className="p-2 hover:bg-secondary rounded-lg border border-border flex items-center gap-1.5 text-xs transition-colors"
                    title="Copy unique link to dashboard with URL predefined"
                  >
                    {shareCopied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Share2 className="w-3.5 h-3.5" />}
                    <span>Share</span>
                  </button>
                </div>
              </div>

              {/* Stat KPI Highlights */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-card border border-border p-5 rounded-2xl flex items-center gap-4 shadow-sm">
                  <div className="p-3 bg-blue-500/10 text-blue-500 rounded-xl">
                    <Clock className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground font-medium">Response Speed</p>
                    <h4 className="text-xl font-extrabold mt-0.5">{currentAudit.responseTime}ms</h4>
                  </div>
                </div>

                <div className="bg-card border border-border p-5 rounded-2xl flex items-center gap-4 shadow-sm">
                  <div className="p-3 bg-purple-500/10 text-purple-500 rounded-xl">
                    <SearchCode className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground font-medium">Headings Tag Count</p>
                    <h4 className="text-xl font-extrabold mt-0.5">{currentAudit.h1Count + currentAudit.h2Count + currentAudit.h3Count}</h4>
                  </div>
                </div>

                <div className="bg-card border border-border p-5 rounded-2xl flex items-center gap-4 shadow-sm">
                  <div className="p-3 bg-amber-500/10 text-amber-500 rounded-xl">
                    <Accessibility className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground font-medium">Accessibility Alerts</p>
                    <h4 className="text-xl font-extrabold mt-0.5 text-amber-500">{currentAudit.missingAltImagesCount} <span className="text-[10px] font-normal text-muted-foreground">missing alt</span></h4>
                  </div>
                </div>

                <div className="bg-card border border-border p-5 rounded-2xl flex items-center gap-4 shadow-sm">
                  <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl">
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground font-medium">Page Size & Content</p>
                    <h4 className="text-xl font-extrabold mt-0.5">{(currentAudit.contentLength / 1024).toFixed(1)} <span className="text-xs font-normal text-muted-foreground">KB</span></h4>
                  </div>
                </div>
              </div>

              {/* Tabs Switcher */}
              <div className="border-b border-border flex gap-4 overflow-x-auto">
                {(['overview', 'seo', 'technical', 'accessibility', 'raw'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`py-3 px-1 text-sm font-medium border-b-2 capitalize whitespace-nowrap transition-all -mb-px ${activeTab === tab ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Tab Contents */}
              <div className="bg-card border border-border rounded-2xl p-6 shadow-sm min-h-[300px]">
                
                {activeTab === 'overview' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-base font-bold mb-4">Core Metadata Summary</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div>
                            <span className="text-xs text-muted-foreground block font-medium">Page Title ({currentAudit.title?.length || 0} chars)</span>
                            <span className="text-sm font-semibold text-foreground mt-1 block p-3 bg-secondary/40 rounded-lg border border-border">
                              {currentAudit.title || <span className="text-destructive font-normal">Title is missing!</span>}
                            </span>
                          </div>
                          <div>
                            <span className="text-xs text-muted-foreground block font-medium">Meta Description ({currentAudit.description?.length || 0} chars)</span>
                            <span className="text-sm font-normal text-foreground mt-1 block p-3 bg-secondary/40 rounded-lg border border-border leading-relaxed">
                              {currentAudit.description || <span className="text-destructive font-normal">Description is missing!</span>}
                            </span>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div>
                            <span className="text-xs text-muted-foreground block font-medium">Canonical Address</span>
                            <span className="text-sm font-mono text-foreground mt-1 block p-3 bg-secondary/40 rounded-lg border border-border truncate">
                              {currentAudit.canonical || <span className="text-muted-foreground font-normal">Not configured</span>}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <span className="text-xs text-muted-foreground block font-medium">Language code</span>
                              <span className="text-sm font-semibold text-foreground mt-1 block px-3 py-2 bg-secondary/40 rounded-lg border border-border capitalize">
                                {currentAudit.language || 'unknown'}
                              </span>
                            </div>
                            <div>
                              <span className="text-xs text-muted-foreground block font-medium">Encoding Charset</span>
                              <span className="text-sm font-mono text-foreground mt-1 block px-3 py-2 bg-secondary/40 rounded-lg border border-border uppercase">
                                {currentAudit.charset || 'unknown'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-border pt-6">
                      <h4 className="text-sm font-bold mb-3">Links overview</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="p-4 bg-secondary/30 rounded-xl border border-border">
                          <span className="text-xs text-muted-foreground">Internal Links</span>
                          <p className="text-xl font-bold mt-1">{currentAudit.internalLinksCount}</p>
                        </div>
                        <div className="p-4 bg-secondary/30 rounded-xl border border-border">
                          <span className="text-xs text-muted-foreground">External Links</span>
                          <p className="text-xl font-bold mt-1">{currentAudit.externalLinksCount}</p>
                        </div>
                        <div className="p-4 bg-secondary/30 rounded-xl border border-border">
                          <span className="text-xs text-muted-foreground">Total Headings</span>
                          <p className="text-xl font-bold mt-1">{currentAudit.h1Count + currentAudit.h2Count + currentAudit.h3Count}</p>
                        </div>
                        <div className="p-4 bg-secondary/30 rounded-xl border border-border">
                          <span className="text-xs text-muted-foreground">Word Count</span>
                          <p className="text-xl font-bold mt-1">{currentAudit.approximateWordCount}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'seo' && (
                  <div className="space-y-6">
                    <h3 className="text-base font-bold mb-4">SEO & Social Meta Analyzers</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="p-4 bg-secondary/20 rounded-xl border border-border space-y-3">
                          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Open Graph Details</span>
                          <div>
                            <span className="text-[10px] text-muted-foreground block font-mono">og:title</span>
                            <span className="text-sm font-medium">{currentAudit.ogTitle || 'N/A'}</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-muted-foreground block font-mono">og:description</span>
                            <span className="text-sm font-medium">{currentAudit.ogDescription || 'N/A'}</span>
                          </div>
                        </div>

                        <div className="p-4 bg-secondary/20 rounded-xl border border-border space-y-2">
                          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Keywords Meta</span>
                          <p className="text-sm">{currentAudit.keywords || 'No keywords tags found.'}</p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="p-4 bg-secondary/20 rounded-xl border border-border space-y-3">
                          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Twitter & Indexing</span>
                          <div>
                            <span className="text-[10px] text-muted-foreground block font-mono">twitter:card</span>
                            <span className="text-sm font-medium">{currentAudit.twitterCard || 'N/A'}</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-muted-foreground block font-mono">robots meta</span>
                            <span className="text-sm font-medium">{currentAudit.robotsMeta || 'N/A'}</span>
                          </div>
                        </div>

                        {currentAudit.faviconUrl && (
                          <div className="p-4 bg-secondary/20 rounded-xl border border-border flex items-center gap-3">
                            <img src={currentAudit.faviconUrl} alt="Favicon" className="w-8 h-8 object-contain rounded" onError={(e) => (e.currentTarget.style.display = 'none')} />
                            <div>
                              <span className="text-xs font-bold text-muted-foreground">Favicon URL</span>
                              <a href={currentAudit.faviconUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 break-all flex items-center gap-1 hover:underline mt-0.5">
                                <span>{currentAudit.faviconUrl}</span>
                                <ExternalLink className="w-3 h-3 shrink-0" />
                              </a>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'technical' && (
                  <div className="space-y-6">
                    <h3 className="text-base font-bold mb-4">Technical Header Profiles</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="p-4 bg-secondary/20 rounded-xl border border-border">
                          <span className="text-xs font-bold text-muted-foreground">Server Header</span>
                          <p className="text-sm font-mono mt-1 font-semibold text-foreground">{currentAudit.serverHeader}</p>
                        </div>
                        <div className="p-4 bg-secondary/20 rounded-xl border border-border">
                          <span className="text-xs font-bold text-muted-foreground">Response Date Header</span>
                          <p className="text-sm font-mono mt-1 text-foreground">{currentAudit.dateHeader}</p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="p-4 bg-secondary/20 rounded-xl border border-border">
                          <span className="text-xs font-bold text-muted-foreground">Heading Level Counts</span>
                          <div className="grid grid-cols-3 gap-2 mt-2">
                            <div className="text-center bg-background p-2 rounded-lg border border-border">
                              <span className="text-[10px] text-muted-foreground font-bold">H1</span>
                              <p className="text-lg font-black mt-0.5">{currentAudit.h1Count}</p>
                            </div>
                            <div className="text-center bg-background p-2 rounded-lg border border-border">
                              <span className="text-[10px] text-muted-foreground font-bold">H2</span>
                              <p className="text-lg font-black mt-0.5">{currentAudit.h2Count}</p>
                            </div>
                            <div className="text-center bg-background p-2 rounded-lg border border-border">
                              <span className="text-[10px] text-muted-foreground font-bold">H3</span>
                              <p className="text-lg font-black mt-0.5">{currentAudit.h3Count}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'accessibility' && (
                  <div className="space-y-6">
                    <h3 className="text-base font-bold mb-4">Accessibility Compliance</h3>
                    
                    <div className="p-4 bg-secondary/20 rounded-xl border border-border space-y-4">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${currentAudit.missingAltImagesCount === 0 ? 'bg-green-500/10 text-green-500' : 'bg-amber-500/10 text-amber-500'}`}>
                          <ShieldAlert className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold">Image Alt tags Audit</h4>
                          <p className="text-xs text-muted-foreground mt-0.5">Images need an alt property to be descriptive for screen reader clients.</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 pt-2">
                        <div className="bg-background p-3 rounded-lg border border-border text-center">
                          <span className="text-xs text-muted-foreground">Total Images Detected</span>
                          <p className="text-xl font-bold mt-1">{currentAudit.totalImagesCount}</p>
                        </div>
                        <div className="bg-background p-3 rounded-lg border border-border text-center">
                          <span className="text-xs text-muted-foreground">Images Missing ALT</span>
                          <p className={`text-xl font-bold mt-1 ${currentAudit.missingAltImagesCount > 0 ? 'text-amber-500' : 'text-green-500'}`}>
                            {currentAudit.missingAltImagesCount}
                          </p>
                        </div>
                      </div>

                      {currentAudit.missingAltImagesCount > 0 ? (
                        <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-500 text-xs rounded-lg">
                          <strong>Warning:</strong> {currentAudit.missingAltImagesCount} images on this page lack explanatory alt attributes. Adding them is crucial for SEO and web accessibility standard compatibility.
                        </div>
                      ) : (
                        <div className="p-3 bg-green-500/10 border border-green-500/20 text-green-500 text-xs rounded-lg">
                          <strong>Pass:</strong> All image tags parsed on this page include alt tags!
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {activeTab === 'raw' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-base font-bold">Raw Audit JSON Output</h3>
                      <button 
                        onClick={copyToClipboard}
                        className="text-xs text-muted-foreground hover:text-foreground font-semibold flex items-center gap-1"
                      >
                        {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copied ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                    <pre className="p-4 bg-secondary/50 border border-border rounded-xl font-mono text-xs overflow-x-auto max-h-[400px] text-foreground">
                      {JSON.stringify(currentAudit, null, 2)}
                    </pre>
                  </div>
                )}

              </div>

            </div>
          ) : (
            /* Empty State */
            <div className="py-20 text-center space-y-4 max-w-md mx-auto">
              <div className="w-16 h-16 bg-secondary rounded-2xl flex items-center justify-center mx-auto border border-border">
                <SearchCode className="w-8 h-8 text-muted-foreground" />
              </div>
              <div>
                <h3 className="text-base font-bold">No Audit Performed Yet</h3>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">Enter a webpage URL at the top to initiate an instant full technical scan, metadata parsing, and SEO audit report.</p>
              </div>
            </div>
          )}

        </div>
      </main>

    </div>
  );
}
