import React from 'react';
import type { FormDocument } from '../types/form';
import { Button } from './ui/Button';
import {
  FolderOpen,
  Save,
  Printer,
  Sparkles,
  ShieldCheck,
  ShieldAlert,
  Shield,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Highlighter,
  PenTool,
  Play,
  RotateCcw,
  Layers,
  ChevronDown,
} from 'lucide-react';

interface ToolbarProps {
  document: FormDocument;
  mode: 'fill' | 'designer';
  onModeChange: (mode: 'fill' | 'designer') => void;
  zoom: number;
  onZoomChange: (newZoom: number) => void;
  highlightFields: boolean;
  onToggleHighlight: () => void;
  onOpenSecurityModal: () => void;
  onOpenLlmModal: () => void;
  onOpenFile: () => void;
  onSaveFile: () => void;
  onPrintPdf: () => void;
  printMarginMm: number;
  onPrintMarginChange: (mm: number) => void;
  onResetFields: () => void;
  onSelectSampleTemplate: (key: string) => void;
  onOpenLanding?: () => void;
}

import { MvLogo } from './MvLogo';

export const Toolbar: React.FC<ToolbarProps> = ({
  document: doc,
  mode,
  onModeChange,
  zoom,
  onZoomChange,
  highlightFields,
  onToggleHighlight,
  onOpenSecurityModal,
  onOpenLlmModal,
  onOpenFile,
  onSaveFile,
  onPrintPdf,
  printMarginMm,
  onPrintMarginChange,
  onResetFields,
  onSelectSampleTemplate,
  onOpenLanding,
}) => {
  const isVerified = doc.verification.status === 'verified';
  const isTampered = doc.verification.status === 'tampered';

  return (
    <header className="no-print w-full bg-slate-950 border-b border-slate-800 text-slate-200 select-none z-30 sticky top-0 shadow-md">
      {/* Top Bar */}
      <div className="h-14 px-4 flex items-center justify-between gap-3">
        {/* Left: Brand & Document Name */}
        <div className="flex items-center gap-3 min-w-0">
          <a
            href="/"
            onClick={(e) => {
              if (onOpenLanding) {
                e.preventDefault();
                onOpenLanding();
              }
            }}
            title="Open MDViewer Landing Page & Demo"
            className="flex items-center gap-2.5 group transition-all"
          >
            <MvLogo size={34} className="shrink-0 shadow-md shadow-blue-500/25 rounded-xl transition-transform group-hover:scale-105" />
            <div className="flex flex-col">
              <span className="font-bold text-sm tracking-tight text-white flex items-center gap-1.5 group-hover:text-blue-400 transition-colors">
                MDViewer
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 font-mono font-normal">
                  v0.1.0
                </span>
              </span>
              <span className="text-[11px] text-slate-400 truncate max-w-[200px]">
                {doc.metadata.title || 'Untitled Form Document'}
              </span>
            </div>
          </a>

          <div className="h-5 w-[1px] bg-slate-800 hidden sm:block" />

          {/* Mode Switcher: Fill & View (Locked) vs Template Designer */}
          <div className="flex bg-slate-900 p-0.5 rounded-lg border border-slate-800">
            <button
              onClick={() => onModeChange('fill')}
              className={`px-3 py-1 text-xs font-semibold rounded-md flex items-center gap-1.5 transition-all cursor-pointer ${
                mode === 'fill'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Play className="w-3 h-3" />
              <span>Fill Mode (Locked PDF)</span>
            </button>
            <button
              onClick={() => onModeChange('designer')}
              className={`px-3 py-1 text-xs font-semibold rounded-md flex items-center gap-1.5 transition-all cursor-pointer ${
                mode === 'designer'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <PenTool className="w-3 h-3" />
              <span>Template Designer</span>
            </button>
          </div>
        </div>

        {/* Center: View Controls & Security Status */}
        <div className="hidden md:flex items-center gap-2">
          {/* Cryptographic Checksum Pill */}
          <button
            onClick={onOpenSecurityModal}
            className={`px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 border transition-all cursor-pointer ${
              isVerified
                ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300 hover:bg-emerald-900/60'
                : isTampered
                ? 'bg-rose-950/80 border-rose-500 text-rose-200 animate-pulse hover:bg-rose-900'
                : 'bg-amber-950/60 border-amber-500/40 text-amber-300 hover:bg-amber-900/60'
            }`}
          >
            {isVerified ? (
              <>
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>SHA-256 Verified</span>
              </>
            ) : isTampered ? (
              <>
                <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                <span>TAMPER DETECTED</span>
              </>
            ) : (
              <>
                <Shield className="w-3.5 h-3.5 text-amber-400" />
                <span>Unsealed Template</span>
              </>
            )}
          </button>

          {/* Highlight Fillable Fields Toggle */}
          <button
            onClick={onToggleHighlight}
            className={`px-2.5 py-1 rounded-md text-xs font-medium flex items-center gap-1.5 border transition-colors cursor-pointer ${
              highlightFields
                ? 'bg-blue-600/20 border-blue-500/60 text-blue-300'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
            title="Highlight fillable form fields with blue tint (Acrobat style)"
          >
            <Highlighter className="w-3.5 h-3.5" />
            <span>Highlight Fields</span>
          </button>

          {/* Zoom Controls */}
          <div className="flex items-center bg-slate-900 rounded-md border border-slate-800 p-0.5">
            <button
              onClick={() => onZoomChange(Math.max(0.6, zoom - 0.1))}
              className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 cursor-pointer"
              title="Zoom out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-[11px] font-mono px-2 text-slate-300">
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={() => onZoomChange(Math.min(1.6, zoom + 0.1))}
              className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 cursor-pointer"
              title="Zoom in"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onZoomChange(1.0)}
              className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 cursor-pointer ml-0.5"
              title="Reset zoom to 100%"
            >
              <Maximize2 className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Right: Actions (LLM Extraction, File operations, Print) */}
        <div className="flex items-center gap-2">
          {/* Sample Templates Selector */}
          <div className="relative group">
            <button className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg text-xs font-medium text-slate-300 flex items-center gap-1.5 cursor-pointer">
              <Layers className="w-3.5 h-3.5 text-blue-400" />
              <span>Sample Forms</span>
              <ChevronDown className="w-3 h-3 text-slate-500" />
            </button>

            <div className="absolute right-0 top-full mt-1 w-56 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl py-1 hidden group-hover:block z-50">
              <button
                onClick={() => onSelectSampleTemplate('medical')}
                className="w-full text-left px-3 py-2 text-xs text-slate-300 hover:bg-slate-800 hover:text-white cursor-pointer"
              >
                🏥 Patient Medical Intake Form
              </button>
              <button
                onClick={() => onSelectSampleTemplate('nda')}
                className="w-full text-left px-3 py-2 text-xs text-slate-300 hover:bg-slate-800 hover:text-white cursor-pointer"
              >
                ⚖️ Mutual Non-Disclosure Agreement
              </button>
              <button
                onClick={() => onSelectSampleTemplate('job_application')}
                className="w-full text-left px-3 py-2 text-xs text-slate-300 hover:bg-slate-800 hover:text-white cursor-pointer"
              >
                💼 Software Engineer Application
              </button>
              <button
                onClick={() => onSelectSampleTemplate('safety_audit')}
                className="w-full text-left px-3 py-2 text-xs text-slate-300 hover:bg-slate-800 hover:text-white cursor-pointer"
              >
                🦺 Workplace Safety Audit Form
              </button>
            </div>
          </div>

          {/* Reset / Clear */}
          <Button variant="outline" size="sm" onClick={onResetFields} title="Clear all filled answers">
            <RotateCcw className="w-3.5 h-3.5 mr-1" />
            <span className="hidden sm:inline">Clear</span>
          </Button>

          {/* Open & Save File */}
          <Button variant="outline" size="sm" onClick={onOpenFile} title="Open .md form file from disk">
            <FolderOpen className="w-3.5 h-3.5 mr-1" />
            <span className="hidden sm:inline">Open</span>
          </Button>

          <Button variant="outline" size="sm" onClick={onSaveFile} title="Save filled .md form to disk">
            <Save className="w-3.5 h-3.5 mr-1" />
            <span className="hidden sm:inline">Save</span>
          </Button>

          {/* PDF Page Margin */}
          <div className="hidden lg:flex items-center bg-slate-900 rounded-md border border-slate-800 p-0.5" title="Page margin used when printing / exporting to PDF">
            <button
              onClick={() => onPrintMarginChange(Math.max(10, printMarginMm - 5))}
              className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 cursor-pointer"
              title="Decrease PDF margin"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-[11px] font-mono px-1.5 text-slate-300">{printMarginMm}mm</span>
            <button
              onClick={() => onPrintMarginChange(Math.min(60, printMarginMm + 5))}
              className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 cursor-pointer"
              title="Increase PDF margin"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Print / PDF Export */}
          <Button variant="outline" size="sm" onClick={onPrintPdf} title="Print or save as PDF">
            <Printer className="w-3.5 h-3.5 mr-1" />
            <span className="hidden sm:inline">PDF</span>
          </Button>

          {/* LLM Extraction Engine Button */}
          <Button
            variant="default"
            size="sm"
            onClick={onOpenLlmModal}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold text-xs shadow-md shadow-indigo-600/30"
          >
            <Sparkles className="w-3.5 h-3.5 mr-1.5" />
            Extract for LLM
          </Button>
        </div>
      </div>
    </header>
  );
};
