import { useState, useEffect, useCallback } from 'react';
import type { FormDocument, FormDataValue, FormDataRecord } from './types/form';
import { parseFormDocument, serializeFormDocument } from './utils/parser';
import { getSealedSampleForm } from './data/sampleForms';
import { openMarkdownFile, saveMarkdownFile } from './utils/fileSystem';
import { Toolbar } from './components/Toolbar';
import { PdfPaperViewer } from './components/PdfPaperViewer';
import { TemplateEditor } from './components/TemplateEditor';
import { LlmExtractionModal } from './components/LlmExtractionModal';
import { SecurityModal } from './components/SecurityModal';
import { LandingPage } from './components/landing/LandingPage';
import confetti from 'canvas-confetti';

export function App() {
  const [viewMode, setViewMode] = useState<'app' | 'landing'>(() => {
    const path = window.location.pathname.toLowerCase();
    return path.includes('/mdviewer') ? 'app' : 'landing';
  });

  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname.toLowerCase();
      setViewMode(path.includes('/mdviewer') ? 'app' : 'landing');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const openApp = useCallback(() => {
    setViewMode('app');
    if (window.location.pathname.toLowerCase() !== '/mdviewer') {
      window.history.pushState({}, '', '/MDViewer');
    }
  }, []);

  const openLanding = useCallback(() => {
    setViewMode('landing');
    if (window.location.pathname !== '/') {
      window.history.pushState({}, '', '/');
    }
  }, []);
  const [doc, setDoc] = useState<FormDocument | null>(null);
  const [mode, setMode] = useState<'fill' | 'designer'>('fill');
  const [zoom, setZoom] = useState<number>(1.0);
  const [highlightFields, setHighlightFields] = useState<boolean>(true);
  const [printMarginMm, setPrintMarginMm] = useState<number>(50);
  const [isSecurityModalOpen, setIsSecurityModalOpen] = useState(false);
  const [isLlmModalOpen, setIsLlmModalOpen] = useState(false);
  const [originalTemplateBackup, setOriginalTemplateBackup] = useState<string>('');
  const [fileHandle, setFileHandle] = useState<FileSystemFileHandle | undefined>(undefined);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Load default sealed sample template on mount
  useEffect(() => {
    async function loadInitial() {
      const rawSample = await getSealedSampleForm('medical');
      const parsed = await parseFormDocument(rawSample);
      setDoc(parsed);
      setOriginalTemplateBackup(rawSample);
    }
    loadInitial();
  }, []);

  // Update a single form field value
  const handleFieldValueChange = useCallback(
    (fieldId: string, value: FormDataValue) => {
      if (!doc) return;

      const nextFormData = { ...doc.formData, [fieldId]: value };
      const nextDoc: FormDocument = {
        ...doc,
        formData: nextFormData,
      };

      setDoc(nextDoc);

      // Check if all required fields are now completed -> trigger celebration!
      const requiredFields = nextDoc.fields.filter((f) => f.required);
      if (requiredFields.length > 0) {
        const allCompleted = requiredFields.every((f) => {
          const val = nextFormData[f.id];
          return val !== null && val !== undefined && val !== '' && (Array.isArray(val) ? val.length > 0 : true);
        });

        if (allCompleted && doc.fields.filter((f) => f.required).some((f) => !doc.formData[f.id])) {
          confetti({
            particleCount: 80,
            spread: 60,
            origin: { y: 0.8 },
          });
          showToast('🎉 All required fields completed! Document ready for submission.');
        }
      }
    },
    [doc]
  );

  // Load a different pre-built sample template
  const handleSelectSample = async (key: string) => {
    const raw = await getSealedSampleForm(key);
    const parsed = await parseFormDocument(raw);
    setDoc(parsed);
    setOriginalTemplateBackup(raw);
    setFileHandle(undefined);
    showToast(`Loaded ${parsed.metadata.title}`);
  };

  // File Open
  const handleOpenFile = async () => {
    const opened = await openMarkdownFile();
    if (opened) {
      const parsed = await parseFormDocument(opened.content);
      setDoc(parsed);
      setOriginalTemplateBackup(opened.content);
      setFileHandle(opened.handle);
      showToast(`Opened ${opened.name}`);
    }
  };

  // File Save
  const handleSaveFile = async () => {
    if (!doc) return;
    const content = serializeFormDocument(doc);
    const filename = `${doc.metadata.template_id || 'document'}.form.md`;

    const res = await saveMarkdownFile(content, filename, fileHandle);
    if (res.success) {
      if (res.handle) setFileHandle(res.handle);
      showToast(`Saved ${res.filename} successfully!`);
    }
  };

  // Reset fields to empty
  const handleResetFields = () => {
    if (!doc) return;
    setDoc({
      ...doc,
      formData: {},
    });
    showToast('Form fields cleared.');
  };

  // Print to PDF
  const handlePrintPdf = () => {
    window.print();
  };

  // Tamper Simulation: Modify 1 word in template to trigger cryptographic violation
  const handleSimulateTamper = async () => {
    if (!doc) return;
    // Alter legal text or title slightly
    const tamperedBody = doc.templateBody.replace('Patient', 'Subject (Unauthorized Modified)');
    const tamperedDoc: FormDocument = {
      ...doc,
      templateBody: tamperedBody,
    };
    const serialized = serializeFormDocument(tamperedDoc);
    const reloaded = await parseFormDocument(serialized);
    setDoc(reloaded);
    showToast('⚠️ Tampered template injected! Notice the security status banner.');
  };

  // Restore Original Un-tampered Template
  const handleRestoreOriginal = async () => {
    if (!originalTemplateBackup) return;
    const restored = await parseFormDocument(originalTemplateBackup);
    setDoc(restored);
    showToast('🟢 Original authentic template restored.');
  };

  // AI Autofill apply
  const handleApplyAutofill = (data: FormDataRecord) => {
    if (!doc) return;
    setDoc({
      ...doc,
      formData: {
        ...doc.formData,
        ...data,
      },
    });
    showToast('✨ AI Autofill values applied to form fields!');
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        handleSaveFile();
      } else if ((e.metaKey || e.ctrlKey) && e.key === 'p') {
        e.preventDefault();
        handlePrintPdf();
      } else if ((e.metaKey || e.ctrlKey) && e.key === 'e') {
        e.preventDefault();
        setIsLlmModalOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleSaveFile]);

  if (!doc) {
    return (
      <div className="h-screen w-screen bg-slate-950 flex items-center justify-center text-slate-400">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-medium">Loading MDViewer Document...</span>
        </div>
      </div>
    );
  }

  if (viewMode === 'landing') {
    return <LandingPage onOpenApp={openApp} />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-900 text-slate-100 font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-medium shadow-2xl flex items-center gap-2 animate-in slide-in-from-bottom-5">
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Application Toolbar */}
      <Toolbar
        document={doc}
        mode={mode}
        onModeChange={setMode}
        zoom={zoom}
        onZoomChange={setZoom}
        highlightFields={highlightFields}
        onToggleHighlight={() => setHighlightFields((prev) => !prev)}
        onOpenSecurityModal={() => setIsSecurityModalOpen(true)}
        onOpenLlmModal={() => setIsLlmModalOpen(true)}
        onOpenFile={handleOpenFile}
        onSaveFile={handleSaveFile}
        onPrintPdf={handlePrintPdf}
        printMarginMm={printMarginMm}
        onPrintMarginChange={setPrintMarginMm}
        onResetFields={handleResetFields}
        onSelectSampleTemplate={handleSelectSample}
        onOpenLanding={openLanding}
      />

      {/* Main View Area */}
      <main className="flex-1 flex overflow-hidden">
        {mode === 'fill' ? (
          <div className="pdf-sheet-container flex-1 overflow-y-auto bg-slate-900/90 py-8 flex justify-center">
            <PdfPaperViewer
              document={doc}
              onFieldValueChange={handleFieldValueChange}
              highlightFields={highlightFields}
              zoom={zoom}
              onOpenSecurityModal={() => setIsSecurityModalOpen(true)}
              printMarginMm={printMarginMm}
            />
          </div>
        ) : (
          <TemplateEditor
            document={doc}
            onUpdateDocument={setDoc}
            onSwitchToFillMode={() => setMode('fill')}
          />
        )}
      </main>

      {/* LLM Extraction Modal */}
      <LlmExtractionModal
        isOpen={isLlmModalOpen}
        onClose={() => setIsLlmModalOpen(false)}
        document={doc}
        onApplyAutofill={handleApplyAutofill}
      />

      {/* Security & Cryptographic Integrity Modal */}
      <SecurityModal
        isOpen={isSecurityModalOpen}
        onClose={() => setIsSecurityModalOpen(false)}
        document={doc}
        onSimulateTamper={handleSimulateTamper}
        onRestoreOriginal={handleRestoreOriginal}
      />
    </div>
  );
}

export default App;
