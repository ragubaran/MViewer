import React from 'react';
import { MvLogo } from '../MvLogo';

interface LandingHeroSectionProps {
  onOpenApp?: () => void;
}

export const LandingHeroSection: React.FC<LandingHeroSectionProps> = ({ onOpenApp }) => {
  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      {/* Header Navigation */}
      <header className="max-w-[860px] mx-auto px-6 py-5.5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <a href="/" className="flex items-center gap-2.5 text-white no-underline group">
            <MvLogo size={34} className="shrink-0 shadow-md shadow-blue-600/35 rounded-xl transition-transform group-hover:scale-105" />
            <span className="font-bold text-xl tracking-tight text-slate-100 group-hover:text-blue-400 transition-colors">
              MDViewer
            </span>
          </a>
          <span className="font-mono text-[11px] font-medium text-blue-400 bg-blue-600/15 border border-blue-500/30 px-2 py-0.5 rounded-full tracking-wide">
            RELEASE v0.1.0
          </span>
        </div>

        <nav className="flex items-center gap-5 text-sm text-slate-400">
          <a
            href="#demo"
            onClick={(e) => scrollToSection(e, 'demo')}
            className="hover:text-slate-100 transition-colors no-underline"
          >
            Live demo
          </a>
          <a
            href="#compare"
            onClick={(e) => scrollToSection(e, 'compare')}
            className="hover:text-slate-100 transition-colors no-underline"
          >
            Why not PDF
          </a>
          <a
            href="#features"
            onClick={(e) => scrollToSection(e, 'features')}
            className="hover:text-slate-100 transition-colors no-underline"
          >
            Features
          </a>
          <a
            href="https://github.com/ragubaran/MViewer"
            target="_blank"
            rel="noopener noreferrer"
            className="text-slate-300 hover:text-white font-medium no-underline cursor-pointer flex items-center gap-1"
          >
            GitHub ↗
          </a>
        </nav>
      </header>

      {/* Hero Content */}
      <section className="max-w-[860px] mx-auto px-6 pt-3 pb-0">
        <p className="text-xs font-semibold uppercase tracking-wider text-blue-400 mb-3.5">
          Markdown documents, notarized
        </p>

        <h1 className="text-4xl sm:text-[44px] font-bold leading-[1.12] text-slate-100 tracking-tight max-w-[15ch]">
          Forms sealed like <em className="not-italic text-blue-400">paper</em>, priced like <em className="not-italic text-blue-400">text</em>.
        </h1>

        <p className="mt-4.5 max-w-[52ch] text-slate-400 text-[16.5px] leading-relaxed">
          MDViewer turns a plain <code className="font-mono text-sm text-slate-200 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">.form.md</code> file into a tamper-evident, fillable PDF-style form — sealed with a SHA-256 checksum instead of a certificate, and readable by an LLM in milliseconds instead of an OCR pipeline.
        </p>

        <div className="flex gap-3 mt-7 flex-wrap">
          <a
            href="#demo"
            onClick={(e) => scrollToSection(e, 'demo')}
            className="inline-flex items-center gap-2 text-sm font-semibold px-4.5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition-colors no-underline shadow-sm cursor-pointer"
          >
            Fill out the demo form ↓
          </a>
          <a
            href="#compare"
            onClick={(e) => scrollToSection(e, 'compare')}
            className="inline-flex items-center gap-2 text-sm font-semibold px-4.5 py-2.5 rounded-lg border border-slate-700 hover:border-slate-500 text-slate-200 hover:bg-slate-900 transition-colors no-underline cursor-pointer"
          >
            See the comparison
          </a>
          <a
            href="/MDViewer"
            onClick={(e) => {
              if (onOpenApp) {
                e.preventDefault();
                onOpenApp();
              }
            }}
            className="inline-flex items-center gap-2 text-sm font-semibold px-4.5 py-2.5 rounded-lg border border-slate-700 hover:border-slate-500 text-slate-200 hover:bg-slate-900 transition-colors cursor-pointer no-underline"
          >
            Open MDViewer app ↗
          </a>
        </div>

        {/* Metric Stats Banner */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-[1px] bg-slate-800 mt-10 border border-slate-800 rounded-xl overflow-hidden">
          <div className="bg-slate-900 p-4.5">
            <div className="text-2xl font-bold font-mono text-white">
              5–25<span className="text-sm font-normal text-slate-400">KB</span>
            </div>
            <div className="text-[11.5px] text-slate-400 mt-1">vs 500KB–5MB for a fillable PDF</div>
          </div>

          <div className="bg-slate-900 p-4.5">
            <div className="text-2xl font-bold font-mono text-white">
              &lt;10<span className="text-sm font-normal text-slate-400">ms</span>
            </div>
            <div className="text-[11.5px] text-slate-400 mt-1">to extract data — no OCR pass</div>
          </div>

          <div className="bg-slate-900 p-4.5">
            <div className="text-2xl font-bold font-mono text-white">
              95<span className="text-sm font-normal text-slate-400">%</span>
            </div>
            <div className="text-[11.5px] text-slate-400 mt-1">fewer LLM tokens per extraction</div>
          </div>
        </div>
      </section>
    </>
  );
};
