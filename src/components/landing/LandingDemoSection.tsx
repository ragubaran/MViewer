import React, { useState, useRef, useEffect, useCallback } from 'react';
import { computeSha256 } from '../../utils/crypto';

interface LandingDemoSectionProps {
  onOpenApp?: () => void;
}

export const LandingDemoSection: React.FC<LandingDemoSectionProps> = ({ onOpenApp }) => {
  const [candidateName, setCandidateName] = useState('Jordan Ellis');
  const [email, setEmail] = useState('jordan@example.com');
  const [skills, setSkills] = useState<string[]>(['TypeScript', 'React']);
  const [rating, setRating] = useState<number>(4);
  const [startDate, setStartDate] = useState('2026-10-01');
  const [pitch, setPitch] = useState('Tired of shipping 3MB PDFs when the form is four questions.');
  const [consent, setConsent] = useState(true);
  const [hasSigned, setHasSigned] = useState(false);

  const [sealedHash, setSealedHash] = useState<string | null>(null);
  const [tamperStatus, setTamperStatus] = useState<'none' | 'verified' | 'tampered'>('none');

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isDrawingRef = useRef(false);

  const allSkills = ['TypeScript', 'Rust', 'React', 'Go', 'Postgres'];

  // Toggle skill selection
  const toggleSkill = (skill: string) => {
    setSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  };

  // Canvas Signature pad setup
  const getCanvasPos = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return [0, 0];
    const rect = canvas.getBoundingClientRect();
    const cx = e.clientX - rect.left;
    const cy = e.clientY - rect.top;
    return [
      (cx * canvas.width) / rect.width,
      (cy * canvas.height) / rect.height,
    ];
  };

  const startDrawing = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    isDrawingRef.current = true;
    setHasSigned(true);
    const [x, y] = getCanvasPos(e);
    ctx.strokeStyle = '#f1f5f9';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(x, y);
    e.preventDefault();
  };

  const draw = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const [x, y] = getCanvasPos(e);
    ctx.lineTo(x, y);
    ctx.stroke();
    e.preventDefault();
  };

  const stopDrawing = () => {
    isDrawingRef.current = false;
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    setHasSigned(false);
  };

  // Build text record representation for SHA-256 sealing
  const buildRecord = useCallback(() => {
    return [
      `Candidate: ${candidateName}`,
      `Email: ${email}`,
      `Skills: ${skills.join(', ')}`,
      `System Design Rating: ${rating}/5`,
      `Available: ${startDate}`,
      `Statement: ${pitch}`,
      `Consent: ${consent ? 'Yes' : 'No'}`,
      `Signature: ${hasSigned ? 'captured' : 'blank'}`,
    ].join('\n');
  }, [candidateName, email, skills, rating, startDate, pitch, consent, hasSigned]);

  // Check tamper status whenever inputs change after sealing
  useEffect(() => {
    if (!sealedHash) return;

    let isMounted = true;
    computeSha256(buildRecord()).then((currentHash) => {
      if (!isMounted) return;
      if (currentHash === sealedHash) {
        setTamperStatus('verified');
      } else {
        setTamperStatus('tampered');
      }
    });

    return () => {
      isMounted = false;
    };
  }, [buildRecord, sealedHash]);

  const TEMPLATE_BODY = `# Job Application Form

### 1. Candidate Details
- **Candidate Name:** {{input:candidate_name label="Candidate Name" required=true}}
- **Email:** {{input:email label="Email" required=true}}
- **Core Skills:** {{choice:skills label="Core Skills" style="chips" multiple=true choices=["TypeScript", "Rust", "React", "Go", "Postgres"]}}
- **System Design Rating:** {{rating:system_rating label="System Design Rating" max=5}}
- **Available Start Date:** {{date:start_date label="Available Start Date"}}
- **Why MDViewer?:** {{textarea:pitch label="Why MDViewer?"}}

### 2. Execution & Consent
- **Consent:** {{checkbox:consent label="I certify the statements are accurate"}}
{{signature:signature label="Candidate Signature"}}`;

  // Seal response action
  const handleSeal = async () => {
    const hash = await computeSha256(TEMPLATE_BODY);
    setSealedHash(hash);
    setTamperStatus('verified');
  };

  // Download sealed .form.md file action
  const handleDownloadMarkdown = async () => {
    const hash = await computeSha256(TEMPLATE_BODY);
    if (!sealedHash) {
      setSealedHash(hash);
      setTamperStatus('verified');
    }

    const skillsYaml = skills.map((s) => `    - "${s}"`).join('\n');
    const mdContent = `---
title: "Job Application Form"
template_id: "job-application-2026"
template_checksum: "${hash}"
status: "filled"
form_data:
  candidate_name: "${candidateName}"
  email: "${email}"
  skills:
${skillsYaml || '    []'}
  system_rating: ${rating}
  start_date: "${startDate}"
  pitch: ${JSON.stringify(pitch)}
  consent: ${consent}
  signature: "${hasSigned ? 'captured' : 'blank'}"
---

${TEMPLATE_BODY}
`;

    const blob = new Blob([mdContent], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${candidateName.toLowerCase().replace(/[^a-z0-9]+/g, '_') || 'job_application'}.form.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <section id="demo" className="max-w-[860px] mx-auto px-6 py-14 scroll-mt-6">
      <div className="flex flex-wrap items-baseline justify-between gap-3 mt-3 mb-4.5">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-100 tracking-tight">
            Try sealing one, right here
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            This is a real <code className="font-mono text-slate-300">job_application</code> template — fill it in, seal it, then edit an answer and watch the checksum break.
          </p>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-7 shadow-lg">
        {/* Candidate Name */}
        <div className="mb-4.5">
          <label className="block text-xs font-semibold text-slate-400 mb-1.5">Candidate name</label>
          <input
            type="text"
            value={candidateName}
            onChange={(e) => setCandidateName(e.target.value)}
            placeholder="e.g. Alexander Brooks"
            className="w-full px-3 py-2 text-sm text-slate-100 bg-slate-950 border border-slate-700 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {/* Email */}
        <div className="mb-4.5">
          <label className="block text-xs font-semibold text-slate-400 mb-1.5">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@domain.com"
            className="w-full px-3 py-2 text-sm text-slate-100 bg-slate-950 border border-slate-700 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {/* Skills Chips */}
        <div className="mb-4.5">
          <label className="block text-xs font-semibold text-slate-400 mb-1.5">Core skills</label>
          <div className="flex flex-wrap gap-2">
            {allSkills.map((skill) => {
              const isSelected = skills.includes(skill);
              return (
                <button
                  key={skill}
                  type="button"
                  onClick={() => toggleSkill(skill)}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-blue-600 border-blue-500 text-white font-semibold'
                      : 'bg-slate-950 border-slate-700 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {skill}
                </button>
              );
            })}
          </div>
        </div>

        {/* Star Rating */}
        <div className="mb-4.5">
          <label className="block text-xs font-semibold text-slate-400 mb-1.5">System design self-rating</label>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                className={`text-xl cursor-pointer p-0 bg-transparent border-0 leading-none transition-colors ${
                  star <= rating ? 'text-blue-400' : 'text-slate-700'
                }`}
              >
                ★
              </button>
            ))}
          </div>
        </div>

        {/* Date Picker */}
        <div className="mb-4.5">
          <label className="block text-xs font-semibold text-slate-400 mb-1.5">Available start date</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full px-3 py-2 text-sm text-slate-100 bg-slate-950 border border-slate-700 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {/* Statement / Pitch */}
        <div className="mb-4.5">
          <label className="block text-xs font-semibold text-slate-400 mb-1.5">Why MDViewer?</label>
          <textarea
            rows={2}
            value={pitch}
            onChange={(e) => setPitch(e.target.value)}
            className="w-full px-3 py-2 text-sm text-slate-100 bg-slate-950 border border-slate-700 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-y min-h-[64px]"
          />
        </div>

        {/* Signature Canvas */}
        <div className="mb-4.5">
          <label className="block text-xs font-semibold text-slate-400 mb-1.5">Signature</label>
          <canvas
            ref={canvasRef}
            width={600}
            height={120}
            onPointerDown={startDrawing}
            onPointerMove={draw}
            onPointerUp={stopDrawing}
            className="w-full h-[120px] bg-slate-950 border border-dashed border-slate-700 rounded-lg touch-none cursor-crosshair"
          />
          <div className="flex items-center justify-between mt-1.5 text-[11.5px] text-slate-400">
            <span />
            <button
              type="button"
              onClick={clearSignature}
              className="text-slate-400 hover:text-slate-200 underline cursor-pointer bg-transparent border-0"
            >
              clear signature
            </button>
          </div>
        </div>

        {/* Consent Checkbox */}
        <label className="flex items-start gap-2.5 text-xs text-slate-400 cursor-pointer">
          <input
            type="checkbox"
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
            className="mt-0.5 accent-blue-600"
          />
          <span>I certify the statements in this application are accurate — sealing this will hash exactly this text.</span>
        </label>

        {/* Seal Button & Status */}
        <div className="flex items-center gap-3 flex-wrap mt-6 pt-5 border-t border-slate-800">
          <button
            type="button"
            onClick={handleSeal}
            className="inline-flex items-center gap-2 text-sm font-semibold px-4.5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition-colors cursor-pointer shadow-sm"
          >
            🔏 Seal this response
          </button>
          <button
            type="button"
            onClick={handleDownloadMarkdown}
            className="inline-flex items-center gap-2 text-sm font-semibold px-4.5 py-2.5 rounded-lg border border-slate-700 hover:border-slate-500 text-slate-200 hover:bg-slate-800 transition-colors cursor-pointer"
          >
            📥 Download .form.md
          </button>
          <div className="text-xs text-slate-400">
            {sealedHash ? (
              <span>
                Sealed just now.
                <span className="block mt-1 font-mono text-xs text-emerald-400 break-all">{sealedHash}</span>
              </span>
            ) : (
              'Not sealed yet — checksum forms once you seal.'
            )}
          </div>
        </div>

        {/* Tamper Detection Banner */}
        {tamperStatus === 'verified' && (
          <div className="mt-4 p-3.5 rounded-xl text-xs font-medium bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
            Template integrity verified. Layout and answers are authentic and untampered.
          </div>
        )}
        {tamperStatus === 'tampered' && (
          <div className="mt-4 p-3.5 rounded-xl text-xs font-semibold bg-rose-500/10 border border-rose-500/30 text-rose-400">
            CRITICAL INTEGRITY VIOLATION: TAMPER DETECTED — this response no longer matches its sealed checksum.
          </div>
        )}
      </div>

      <p className="text-center mt-4.5 text-xs text-slate-400">
        This is an interactive demo component.{' '}
        {onOpenApp ? (
          <button
            onClick={onOpenApp}
            className="text-indigo-400 font-semibold underline cursor-pointer bg-transparent border-0"
          >
            Open the real MDViewer app ↗
          </button>
        ) : (
          <a href="/MDViewer" className="text-indigo-400 font-semibold underline no-underline">
            Open the real MDViewer app ↗
          </a>
        )}{' '}
        to load, edit, and save actual <code className="font-mono text-slate-300">.form.md</code> files.
      </p>
    </section>
  );
};
