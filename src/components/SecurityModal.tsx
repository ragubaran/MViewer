import React from 'react';
import type { FormDocument } from '../types/form';
import { Button } from './ui/Button';
import {
  ShieldCheck,
  ShieldAlert,
  Shield,
  X,
  Bug,
} from 'lucide-react';

interface SecurityModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: FormDocument;
  onSimulateTamper: () => void;
  onRestoreOriginal: () => void;
}

export const SecurityModal: React.FC<SecurityModalProps> = ({
  isOpen,
  onClose,
  document: doc,
  onSimulateTamper,
  onRestoreOriginal,
}) => {
  if (!isOpen) return null;

  const isVerified = doc.verification.status === 'verified';
  const isTampered = doc.verification.status === 'tampered';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950">
          <div className="flex items-center gap-2.5">
            {isVerified ? (
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
            ) : isTampered ? (
              <ShieldAlert className="w-5 h-5 text-rose-500" />
            ) : (
              <Shield className="w-5 h-5 text-amber-400" />
            )}
            <h3 className="text-base font-bold text-white">Document Cryptographic Attestation</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-md hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {/* Status Card */}
          <div
            className={`p-4 rounded-xl border flex items-start gap-3 ${
              isVerified
                ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
                : isTampered
                ? 'bg-rose-950/40 border-rose-500/40 text-rose-200'
                : 'bg-amber-950/40 border-amber-500/40 text-amber-200'
            }`}
          >
            {isVerified ? (
              <ShieldCheck className="w-6 h-6 text-emerald-400 shrink-0 mt-0.5" />
            ) : isTampered ? (
              <ShieldAlert className="w-6 h-6 text-rose-400 shrink-0 mt-0.5" />
            ) : (
              <Shield className="w-6 h-6 text-amber-400 shrink-0 mt-0.5" />
            )}
            <div>
              <h4 className="text-sm font-bold">
                {isVerified
                  ? 'Cryptographic Integrity Verified (Authentic)'
                  : isTampered
                  ? 'CRITICAL ALERT: Unauthorized Document Tampering Detected!'
                  : 'Document Unsealed (Draft Mode)'}
              </h4>
              <p className="text-xs mt-1 leading-relaxed opacity-90">
                {doc.verification.message}
              </p>
            </div>
          </div>

          {/* Hash Breakdown */}
          <div className="space-y-3">
            <div>
              <span className="block text-xs font-semibold text-slate-400 mb-1">
                Embedded Sealed Checksum (from Frontmatter):
              </span>
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 font-mono text-xs text-slate-300 break-all select-all">
                {doc.metadata.template_checksum || '(None - Unsealed)'}
              </div>
            </div>

            <div>
              <span className="block text-xs font-semibold text-slate-400 mb-1">
                Calculated Runtime SHA-256 (over Markdown Template Body):
              </span>
              <div className={`p-2.5 rounded-lg border font-mono text-xs break-all select-all ${
                isVerified
                  ? 'bg-slate-950 border-emerald-500/50 text-emerald-400'
                  : isTampered
                  ? 'bg-slate-950 border-rose-500/50 text-rose-400'
                  : 'bg-slate-950 border-slate-800 text-slate-300'
              }`}>
                {doc.verification.computedHash}
              </div>
            </div>
          </div>

          {/* How It Works Explanation */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-400 space-y-2">
            <span className="font-semibold text-slate-200 block">How MViewer Protects Markdown Forms:</span>
            <ul className="list-disc list-inside space-y-1">
              <li>The Markdown template (contract terms, instructions, questions) is hashed using SHA-256.</li>
              <li>When end-users fill out the form, their answers are stored strictly in the <code className="text-indigo-400">form_data</code> frontmatter.</li>
              <li>The underlying template text remains untouched, preserving the SHA-256 hash.</li>
              <li>If anyone alters the legal terms or questions in a regular text editor (like VS Code), the hash fails, preventing fraud.</li>
            </ul>
          </div>

          {/* Interactive Simulation Controls */}
          <div className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-white block">Tamper Test Simulation</span>
              <span className="text-[11px] text-slate-400">
                Modify 1 character of legal text to verify that MViewer flags it immediately.
              </span>
            </div>
            <div className="flex gap-2">
              {isTampered ? (
                <Button variant="emerald" size="sm" onClick={onRestoreOriginal} className="text-xs">
                  Restore Original Template
                </Button>
              ) : (
                <Button variant="destructive" size="sm" onClick={onSimulateTamper} className="text-xs">
                  <Bug className="w-3.5 h-3.5 mr-1" />
                  Simulate Tampering
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950 flex justify-end">
          <Button variant="secondary" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};
