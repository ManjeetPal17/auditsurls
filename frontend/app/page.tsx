'use client';

import React from 'react';
import Link from 'next/link';
import { useTheme } from '../components/ThemeContext';
import { 
  ShieldCheck, Zap, Activity, Globe, ArrowRight, CheckCircle, BarChart, 
  Menu, Sun, Moon, Cpu, Server, Lock, SearchCode
} from 'lucide-react';

export default function Home() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-200 selection:bg-primary selection:text-primary-foreground">
      
      {/* Navigation */}
      <nav className="border-b border-border bg-background/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-extrabold text-lg shadow">
              P
            </div>
            <span className="font-bold text-sm tracking-wide">PAGE PULSE PRO</span>
          </div>

          <div className="hidden md:flex items-center gap-8 text-xs font-semibold tracking-wide text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-foreground transition-colors">How It Works</a>
            <a href="https://digitalheroesco.com" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">Digital Heroes</a>
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={toggleTheme} 
              className="p-2 hover:bg-secondary rounded-lg transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-slate-800" />}
            </button>
            <Link 
              href="/dashboard" 
              className="bg-primary text-primary-foreground hover:bg-primary/95 text-xs font-bold px-4 py-2 rounded-lg shadow-sm transition-all"
            >
              Launch Dashboard
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="relative py-20 lg:py-32 overflow-hidden border-b border-border">
        {/* Animated Background Gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full pointer-events-none z-0">
          <div className="absolute top-10 left-10 w-96 h-96 bg-blue-500/10 rounded-full filter blur-3xl opacity-70 animate-pulse"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-purple-500/10 rounded-full filter blur-3xl opacity-70 animate-pulse"></div>
        </div>

        <div className="max-w-5xl mx-auto px-6 text-center space-y-8 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-secondary/80 border border-border rounded-full text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            <Zap className="w-3.5 h-3.5 text-amber-500" />
            <span>INSTANT WEBSITE AUDITS IN SECONDS</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-tight max-w-4xl mx-auto">
            Analyze website vitals, SEO meta indexers, and accessibility.
          </h1>

          <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Gain full clarity on your website performance. Parse robots policies, heading outlines, alternative content descriptors, open graph components and loading parameters instantly.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link 
              href="/dashboard"
              className="w-full sm:w-auto bg-primary text-primary-foreground hover:bg-primary/90 text-sm font-bold px-8 py-3.5 rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all"
            >
              <span>Start Free Audit</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <a 
              href="#features"
              className="w-full sm:w-auto bg-secondary hover:bg-secondary/80 border border-border text-sm font-bold px-8 py-3.5 rounded-xl flex items-center justify-center transition-all"
            >
              Learn More
            </a>
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section id="features" className="py-20 lg:py-28 max-w-7xl mx-auto px-6 space-y-16 border-b border-border">
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Everything you need to optimize web presence</h2>
          <p className="text-xs sm:text-sm text-muted-foreground">Page Pulse Pro audits structural, visual, and technical configuration items using standards-aligned extractors.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-card border border-border p-8 rounded-2xl space-y-4 shadow-sm hover:shadow-md transition-shadow relative">
            <div className="p-3 bg-blue-500/10 text-blue-500 rounded-xl w-fit">
              <Globe className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold">SEO Crawler</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">Extract and analyze canonical links, metadata, keywords, robots, open graph descriptions and twitter card setups.</p>
          </div>

          <div className="bg-card border border-border p-8 rounded-2xl space-y-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="p-3 bg-purple-500/10 text-purple-500 rounded-xl w-fit">
              <Cpu className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold">Technical Insights</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">Calculate exact HTTP status, latency response times, page payload byte-sizes, host server signatures, content types and headers.</p>
          </div>

          <div className="bg-card border border-border p-8 rounded-2xl space-y-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="p-3 bg-amber-500/10 text-amber-500 rounded-xl w-fit">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold">Accessibility Inspector</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">Scan image alternate content descriptors, structural heading hierarchies, metadata language tags, and encoding attributes.</p>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section id="how-it-works" className="py-20 lg:py-28 max-w-6xl mx-auto px-6 space-y-16">
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Audit flow in three simple steps</h2>
          <p className="text-xs sm:text-sm text-muted-foreground">Our crawler performs live requests to supply technical insights instantly.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          <div className="space-y-4 relative">
            <div className="w-10 h-10 rounded-full bg-secondary border border-border flex items-center justify-center font-black text-sm">1</div>
            <h3 className="text-sm font-bold">Submit Target URL</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">Enter any valid HTTP or HTTPS address in the audit search bar. Our validator ensures formatting is correct.</p>
          </div>

          <div className="space-y-4">
            <div className="w-10 h-10 rounded-full bg-secondary border border-border flex items-center justify-center font-black text-sm">2</div>
            <h3 className="text-sm font-bold">HTML Node Parsing</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">Axios fetches the content and Cheerio parses images, headers, structure outline lists, meta tags, and open graph schemas.</p>
          </div>

          <div className="space-y-4">
            <div className="w-10 h-10 rounded-full bg-secondary border border-border flex items-center justify-center font-black text-sm">3</div>
            <h3 className="text-sm font-bold">Analyze and Export</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">Review the structured analytics widgets, toggle light/dark modes, inspect JSON data structure, or download reports.</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12 bg-card/25 text-center space-y-4">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-muted-foreground">
          <div className="flex items-center gap-2 font-bold text-foreground">
            <div className="w-5 h-5 rounded bg-primary text-primary-foreground flex items-center justify-center text-xs">P</div>
            <span>Page Pulse Pro</span>
          </div>

          <p>
            Built for <a href="https://digitalheroesco.com" target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground font-semibold text-primary transition-colors">Digital Heroes Training Task</a>
          </p>

          <p className="font-medium">© {new Date().getFullYear()} Page Pulse Pro. All rights reserved.</p>
        </div>
      </footer>

    </div>
  );
}
