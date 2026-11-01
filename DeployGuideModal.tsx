import React, { useState } from 'react';
import {
  Terminal,
  Server,
  Cloud,
  Key,
  Copy,
  Check,
  CheckCircle2,
  BookOpen,
  Sparkles,
} from 'lucide-react';

interface DeployGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  hasGeminiKey: boolean;
}

export const DeployGuideModal: React.FC<DeployGuideModalProps> = ({
  isOpen,
  onClose,
  hasGeminiKey,
}) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  if (!isOpen) return null;

  const copyCode = (code: string, idx: number) => {
    navigator.clipboard.writeText(code);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const steps = [
    {
      title: '1. Local Development Run',
      desc: 'Starts the full-stack Express server with Vite middleware on port 3000.',
      code: 'npm install\nnpm run dev',
    },
    {
      title: '2. Configure Real Generative AI Key',
      desc: 'Provide your Gemini API key in your environment or Settings > Secrets.',
      code: '# In your .env file or Cloud Environment:\nGEMINI_API_KEY="your-gemini-api-key-here"',
    },
    {
      title: '3. Build for Production',
      desc: 'Compiles the React TypeScript frontend into static assets in /dist.',
      code: 'npm run build\nnpm run start',
    },
    {
      title: '4. Docker & Cloud Run Ready',
      desc: 'Single command deployment for container runtimes.',
      code: `# Sample Docker run:\nFROM node:20-alpine\nWORKDIR /app\nCOPY package*.json ./\nRUN npm ci\nCOPY . .\nRUN npm run build\nEXPOSE 3000\nCMD ["npm", "run", "start"]`,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-purple-100 my-8 animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between pb-4 border-b border-purple-50">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-purple-100 text-purple-700">
              <BookOpen className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Run & Deploy Guide</h2>
              <p className="text-xs text-slate-500">How to run locally and deploy EventEase AI</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg text-sm font-bold cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* AI Key Status indicator */}
        <div
          className={`p-4 rounded-2xl border my-6 flex items-start gap-3 ${
            hasGeminiKey
              ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900'
              : 'bg-amber-50/80 border-amber-200 text-amber-900'
          }`}
        >
          <div
            className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
              hasGeminiKey ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
            }`}
          >
            {hasGeminiKey ? <CheckCircle2 className="w-4 h-4" /> : <Key className="w-4 h-4" />}
          </div>
          <div className="text-xs">
            <span className="font-bold">
              {hasGeminiKey ? 'Gemini AI Configured & Active' : 'Running in Curated Demo Mode'}
            </span>
            <p className="mt-0.5 opacity-90">
              {hasGeminiKey
                ? 'Your Gemini API key is securely loaded on the server. AI calls are utilizing gemini-3.8-flash.'
                : 'Demo mode is active with curated planner templates. To enable real-time dynamic AI generation, configure GEMINI_API_KEY in the Secrets panel.'}
            </p>
          </div>
        </div>

        {/* Steps List */}
        <div className="space-y-4">
          {steps.map((step, idx) => (
            <div key={idx} className="p-4 rounded-2xl bg-purple-50/30 border border-purple-100 space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs sm:text-sm font-bold text-slate-900">{step.title}</h4>
                <button
                  onClick={() => copyCode(step.code, idx)}
                  className="flex items-center gap-1 text-[11px] text-purple-700 hover:text-purple-900 font-semibold cursor-pointer"
                >
                  {copiedIndex === idx ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
              <p className="text-xs text-slate-600">{step.desc}</p>
              <pre className="p-3 rounded-xl bg-slate-900 text-purple-200 font-mono text-[11px] overflow-x-auto whitespace-pre leading-relaxed">
                {step.code}
              </pre>
            </div>
          ))}
        </div>

        <div className="flex justify-end pt-5 border-t border-purple-50 mt-6">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-purple-600 text-white text-xs font-semibold hover:bg-purple-700 transition cursor-pointer"
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
};
