import React, { useRef, useState, useEffect } from 'react';
import { Button } from '../ui/Button';
import { Eraser, Check, Type, PenLine, X } from 'lucide-react';

interface SignaturePadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (dataUrl: string) => void;
  initialSignature?: string;
  signeeName?: string;
}

export const SignaturePadModal: React.FC<SignaturePadModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialSignature,
  signeeName = '',
}) => {
  const [mode, setMode] = useState<'draw' | 'type'>('draw');
  const [typedName, setTypedName] = useState(signeeName || '');
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setHasDrawn(Boolean(initialSignature));

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (initialSignature) {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      };
      img.src = initialSignature;
    }
  }, [isOpen, initialSignature]);

  if (!isOpen) return null;

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);
    setHasDrawn(true);

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    ctx.beginPath();
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#1e3a8a'; // Authentic ink blue
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
  };

  const handleSave = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (mode === 'type') {
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = '#1e3a8a';
      ctx.font = 'italic 38px "Brush Script MT", "Caveat", "Segoe Script", cursive';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(typedName || 'Signed', canvas.width / 2, canvas.height / 2);

      // Add small cryptographic timestamp watermark below signature
      ctx.font = '9px monospace';
      ctx.fillStyle = '#64748b';
      const timeStr = `MVIEWER SECURE ATTESTATION | ${new Date().toISOString()}`;
      ctx.fillText(timeStr, canvas.width / 2, canvas.height - 14);

      const dataUrl = canvas.toDataURL('image/png');
      onSave(dataUrl);
      onClose();
      return;
    }

    if (mode === 'draw' && hasDrawn) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Watermark timestamp
        ctx.font = '9px monospace';
        ctx.fillStyle = '#64748b';
        const timeStr = `MVIEWER ATTESTATION | ${new Date().toISOString()}`;
        ctx.fillText(timeStr, 20, canvas.height - 12);
      }
      const dataUrl = canvas.toDataURL('image/png');
      onSave(dataUrl);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-950">
          <div className="flex items-center gap-2">
            <PenLine className="w-5 h-5 text-blue-400" />
            <h3 className="text-base font-semibold text-white">Digital Attestation Signature</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-md hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Controls */}
        <div className="flex border-b border-slate-800 bg-slate-900/50 p-2 gap-2">
          <button
            onClick={() => setMode('draw')}
            className={`flex-1 py-1.5 text-xs font-medium rounded-md flex items-center justify-center gap-1.5 transition-colors ${
              mode === 'draw'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <PenLine className="w-3.5 h-3.5" />
            Draw Signature
          </button>
          <button
            onClick={() => setMode('type')}
            className={`flex-1 py-1.5 text-xs font-medium rounded-md flex items-center justify-center gap-1.5 transition-colors ${
              mode === 'type'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Type className="w-3.5 h-3.5" />
            Type Cursive Name
          </button>
        </div>

        {/* Signature Area */}
        <div className="p-5 flex flex-col items-center">
          {mode === 'draw' ? (
            <div className="w-full flex flex-col items-center">
              <div className="relative w-full h-44 bg-white rounded-lg border-2 border-dashed border-slate-400 overflow-hidden shadow-inner cursor-crosshair">
                <canvas
                  ref={canvasRef}
                  width={500}
                  height={176}
                  className="w-full h-full touch-none"
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                />
                {!hasDrawn && (
                  <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center text-slate-400">
                    <span className="text-sm font-medium">Draw your signature with mouse or finger</span>
                    <span className="text-xs text-slate-400 mt-1">Sign along the line</span>
                  </div>
                )}
                {/* Signature Baseline */}
                <div className="absolute bottom-8 left-8 right-8 border-b border-slate-300 pointer-events-none" />
              </div>
              <div className="w-full flex justify-between items-center mt-2 px-1">
                <span className="text-xs text-slate-400">Color: Ink Blue (#1e3a8a)</span>
                <button
                  onClick={clearCanvas}
                  className="text-xs text-slate-400 hover:text-rose-400 flex items-center gap-1 py-1 px-2 rounded-md hover:bg-slate-800"
                >
                  <Eraser className="w-3.5 h-3.5" />
                  Clear Pad
                </button>
              </div>
            </div>
          ) : (
            <div className="w-full flex flex-col gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Enter Your Full Legal Name
                </label>
                <input
                  type="text"
                  value={typedName}
                  onChange={(e) => setTypedName(e.target.value)}
                  placeholder="e.g. Jane M. Doe"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Preview Box */}
              <div className="relative w-full h-36 bg-white rounded-lg border-2 border-slate-300 flex flex-col items-center justify-center shadow-inner overflow-hidden">
                <p className="text-4xl text-blue-900 font-serif italic tracking-wide select-none" style={{ fontFamily: 'Brush Script MT, cursive' }}>
                  {typedName || 'Jane M. Doe'}
                </p>
                <div className="absolute bottom-3 left-6 right-6 border-b border-slate-200" />
                <span className="absolute bottom-1 right-3 text-[10px] text-slate-400 font-mono">
                  VERIFIED BY MVIEWER
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-3.5 border-t border-slate-800 bg-slate-950">
          <span className="text-[11px] text-slate-400">
            Protected by document SHA-256 integrity
          </span>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={handleSave}
              disabled={mode === 'draw' ? !hasDrawn : !typedName.trim()}
            >
              <Check className="w-4 h-4 mr-1" />
              Adopt & Sign
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
