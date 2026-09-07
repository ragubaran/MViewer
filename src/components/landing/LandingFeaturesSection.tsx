import React from 'react';
import { ShieldCheck, Layers, Zap, Grid } from 'lucide-react';

export const LandingFeaturesSection: React.FC = () => {
  return (
    <>
      <hr className="border-t border-slate-800 my-0 max-w-[860px] mx-auto" />

      {/* Comparison Section */}
      <section id="compare" className="max-w-[860px] mx-auto px-6 py-14">
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-100 tracking-tight">
          One document, doing a PDF's job
        </h2>
        <p className="text-slate-400 text-sm mt-2">
          The template body is hashed at seal time; anything editing the questions or clauses afterward — even in a plain text editor — invalidates the checksum.
        </p>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-x-auto mt-5 shadow-md">
          <table className="w-full text-left text-xs sm:text-sm border-collapse">
            <thead>
              <tr className="bg-slate-850 border-b border-slate-800 text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
                <th className="p-3 sm:p-4">Challenge</th>
                <th className="p-3 sm:p-4">Fillable PDF</th>
                <th className="p-3 sm:p-4">MDViewer <code className="font-mono text-slate-300 font-normal">.form.md</code></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              <tr>
                <td className="p-3 sm:p-4 font-medium">File format</td>
                <td className="p-3 sm:p-4 text-slate-400">Opaque binary, 500KB–5MB</td>
                <td className="p-3 sm:p-4 text-emerald-400 font-semibold">Plain text, 5–25KB</td>
              </tr>
              <tr>
                <td className="p-3 sm:p-4 font-medium">Tamper protection</td>
                <td className="p-3 sm:p-4 text-slate-400">X.509 Adobe PKI certificates</td>
                <td className="p-3 sm:p-4 text-emerald-400 font-semibold">SHA-256 checksum in the frontmatter</td>
              </tr>
              <tr>
                <td className="p-3 sm:p-4 font-medium">Form filling</td>
                <td className="p-3 sm:p-4 text-slate-400">Acrobat Reader / proprietary viewer</td>
                <td className="p-3 sm:p-4 text-emerald-400 font-semibold">Typeform-style fields, any browser</td>
              </tr>
              <tr>
                <td className="p-3 sm:p-4 font-medium">LLM extraction</td>
                <td className="p-3 sm:p-4 text-slate-400">~2,800 tokens of OCR/vision, 5–15s</td>
                <td className="p-3 sm:p-4 text-emerald-400 font-semibold">~120 tokens, structured, &lt;10ms</td>
              </tr>
              <tr>
                <td className="p-3 sm:p-4 font-medium">Editing control</td>
                <td className="p-3 sm:p-4 text-slate-400">Locked by binary encryption</td>
                <td className="p-3 sm:p-4 text-emerald-400 font-semibold">Template locked, answers stay editable</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Features Grid Section */}
      <section id="features" className="max-w-[860px] mx-auto px-6 pb-14">
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-100 tracking-tight">
          What's in the seal
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-[1px] bg-slate-800 border border-slate-800 rounded-2xl overflow-hidden mt-5 shadow-md">
          <div className="bg-slate-900 p-5.5">
            <ShieldCheck className="w-5 h-5 text-blue-400" />
            <h3 className="text-base font-semibold text-slate-100 mt-3 mb-1.5">Tamper-proof sealing</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Seal a template and MDViewer raises a <em className="not-italic text-slate-200">CRITICAL INTEGRITY VIOLATION</em> the moment a word of the clauses changes outside the app.
            </p>
          </div>

          <div className="bg-slate-900 p-5.5">
            <Layers className="w-5 h-5 text-blue-400" />
            <h3 className="text-base font-semibold text-slate-100 mt-3 mb-1.5">Typeform-style fields</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Short text, choice chips, opinion scales, signature pad, file upload — 15 field types embedded directly in the markdown flow.
            </p>
          </div>

          <div className="bg-slate-900 p-5.5">
            <Zap className="w-5 h-5 text-blue-400" />
            <h3 className="text-base font-semibold text-slate-100 mt-3 mb-1.5">Instant LLM extraction</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              One click exports structured key-values, plus a ready prompt for Gemini, Claude, or ChatGPT — no vision tokens spent.
            </p>
          </div>

          <div className="bg-slate-900 p-5.5">
            <Grid className="w-5 h-5 text-blue-400" />
            <h3 className="text-base font-semibold text-slate-100 mt-3 mb-1.5">Triple deployment</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              One UI, shared by the web app, the Electron desktop build, and the Chrome extension's popup, side panel, and full-tab workspace.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-950">
        <div className="max-w-[860px] mx-auto px-6 py-5.5 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-400">
          <span>
            MDViewer · Release <span className="font-mono text-slate-300">v0.1.0</span>
          </span>
          <span className="font-mono text-slate-400">
            Web · Desktop · Chrome Extension — CHANGELOG.md / HELP.md in repository
          </span>
        </div>
      </footer>
    </>
  );
};
