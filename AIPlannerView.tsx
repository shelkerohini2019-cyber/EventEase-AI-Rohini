import React, { useState } from 'react';
import {
  Sparkles,
  Palette,
  Utensils,
  Lightbulb,
  Clock,
  Printer,
  Copy,
  Check,
  RotateCw,
  AlertCircle,
  HelpCircle,
  CheckCircle2,
  DollarSign,
  ChevronRight,
  HeartHandshake,
  Download,
} from 'lucide-react';
import { AIEventPlan, EventData } from '../types/event';

interface AIPlannerViewProps {
  event: EventData;
  onGeneratePlan: () => void;
  isGenerating: boolean;
  onPrint: () => void;
  onDownloadPDF: () => void;
}

export const AIPlannerView: React.FC<AIPlannerViewProps> = ({
  event,
  onGeneratePlan,
  isGenerating,
  onPrint,
  onDownloadPDF,
}) => {
  const [copiedHex, setCopiedHex] = useState<string | null>(null);
  const [copiedFullPlan, setCopiedFullPlan] = useState(false);

  const plan = event.plan;

  const copyToClipboard = (hex: string) => {
    navigator.clipboard.writeText(hex);
    setCopiedHex(hex);
    setTimeout(() => setCopiedHex(null), 2000);
  };

  const copyFullPlanText = () => {
    if (!plan) return;
    const text = `
EVENT PLAN: ${event.name}
Theme: ${plan.themeTitle} - ${plan.tagline}
Concept: ${plan.conceptDescription}

COLOR PALETTE:
${plan.colorPalette.map((c) => `- ${c.name} (${c.hex}) [${c.role}]`).join('\n')}

DECOR IDEAS:
${plan.decorIdeas.map((d) => `• [${d.area}] ${d.title}: ${d.description} (Tip: ${d.budgetFriendlyTip})`).join('\n')}

FOOD & DRINKS:
Appetizers: ${plan.foodSuggestions.appetizers.join(', ')}
Main Courses: ${plan.foodSuggestions.mainCourses.join(', ')}
Desserts: ${plan.foodSuggestions.desserts.join(', ')}
Drinks: ${plan.foodSuggestions.drinks.join(', ')}
Dietary: ${plan.foodSuggestions.dietaryTips}

SCHEDULE FLOW:
${plan.scheduleFlow.map((s) => `${s.time} - ${s.activity}: ${s.description}`).join('\n')}

PLANNING TIPS:
${plan.planningTips.map((t) => `[${t.priority.toUpperCase()}] ${t.category}: ${t.tip}`).join('\n')}
    `.trim();

    navigator.clipboard.writeText(text);
    setCopiedFullPlan(true);
    setTimeout(() => setCopiedFullPlan(false), 2500);
  };

  if (!plan) {
    return (
      <div className="text-center py-16 px-4 bg-white rounded-3xl border border-purple-100 shadow-sm max-w-2xl mx-auto">
        <div className="w-16 h-16 rounded-2xl bg-purple-100 text-purple-700 mx-auto flex items-center justify-center mb-4">
          <Sparkles className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">No AI Plan Generated Yet</h2>
        <p className="text-sm text-slate-600 mb-6">
          EventEase AI will create a cohesive theme, custom color palette, decor ideas with budget tips, menu suggestions, and an hourly run-of-show based on your {event.eventType} details.
        </p>
        <button
          onClick={onGeneratePlan}
          disabled={isGenerating}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold text-sm shadow-md shadow-purple-500/20 hover:from-purple-700 hover:to-indigo-700 transition cursor-pointer disabled:opacity-50"
        >
          <Sparkles className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
          <span>{isGenerating ? 'Generating Your Personalized Plan...' : 'Generate Plan with AI'}</span>
        </button>
      </div>
    );
  }

  const isDemo = plan.source === 'demo_mode';

  return (
    <div className="space-y-8">
      {/* Top Banner & Generation Status */}
      <div
        className={`p-4 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
          isDemo
            ? 'bg-amber-50/80 border-amber-200 text-amber-900'
            : 'bg-gradient-to-r from-purple-50 via-indigo-50/50 to-purple-50 border-purple-200 text-purple-950'
        }`}
      >
        <div className="flex items-start gap-3">
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
              isDemo ? 'bg-amber-100 text-amber-800' : 'bg-purple-100 text-purple-700'
            }`}
          >
            {isDemo ? <AlertCircle className="w-5 h-5" /> : <Sparkles className="w-5 h-5" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm">
                {isDemo ? 'Demo Mode Active' : 'Live GenAI Plan (Gemini 3.8 Flash)'}
              </span>
              <span
                className={`text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-full ${
                  isDemo
                    ? 'bg-amber-200/70 text-amber-900'
                    : 'bg-purple-200/80 text-purple-900'
                }`}
              >
                {isDemo ? 'Curated Template' : 'AI Generated'}
              </span>
            </div>
            <p className="text-xs mt-0.5 opacity-90">
              {isDemo
                ? 'Curated intelligence plan tailored to your inputs. To enable live real-time Gemini generation, configure your GEMINI_API_KEY in Settings > Secrets.'
                : `Customized specifically for ${event.guestCount} guests and a budget of ${event.currency} ${event.totalBudget}.`}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 justify-end">
          <button
            onClick={copyFullPlanText}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-white text-slate-700 text-xs font-semibold transition cursor-pointer bg-white/70"
            title="Copy plan to clipboard"
          >
            {copiedFullPlan ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedFullPlan ? 'Copied!' : 'Copy Plan'}</span>
          </button>

          <button
            onClick={onPrint}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-white text-slate-700 text-xs font-semibold transition cursor-pointer bg-white/70"
            title="Print blueprint"
          >
            <Printer className="w-3.5 h-3.5 text-slate-600" />
            <span className="hidden sm:inline">Print</span>
          </button>

          <button
            onClick={onDownloadPDF}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-purple-300 hover:bg-purple-50 text-purple-700 text-xs font-semibold transition cursor-pointer bg-purple-50/50"
            title="Download complete event plan as PDF file"
          >
            <Download className="w-3.5 h-3.5 text-purple-600" />
            <span>Download PDF</span>
          </button>

          <button
            onClick={onGeneratePlan}
            disabled={isGenerating}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold shadow-xs transition cursor-pointer disabled:opacity-50"
          >
            <RotateCw className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
            <span>{isGenerating ? 'Regenerating...' : 'Regenerate'}</span>
          </button>
        </div>
      </div>

      {/* Theme Concept Hero Card */}
      <div className="p-8 rounded-3xl bg-white border border-purple-100 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-purple-100/40 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-3xl space-y-3 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-200 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Curated Event Concept</span>
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            {plan.themeTitle}
          </h2>
          <p className="text-base text-purple-700 font-medium italic">
            "{plan.tagline}"
          </p>
          <p className="text-sm text-slate-600 leading-relaxed pt-1">
            {plan.conceptDescription}
          </p>
        </div>

        {/* Color Palette section */}
        <div className="mt-8 pt-6 border-t border-purple-50">
          <div className="flex items-center gap-2 mb-4">
            <Palette className="w-4 h-4 text-purple-600" />
            <h3 className="text-sm font-bold text-slate-900">Cohesive Color Palette</h3>
            <span className="text-xs text-slate-400">(Click any hex code to copy)</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {plan.colorPalette.map((color, idx) => (
              <button
                key={idx}
                onClick={() => copyToClipboard(color.hex)}
                className="group p-3 rounded-2xl border border-purple-100/80 bg-purple-50/20 hover:bg-white hover:border-purple-300 transition text-left cursor-pointer shadow-xs hover:shadow-md"
              >
                <div
                  className="w-full h-12 rounded-xl mb-2.5 shadow-inner border border-black/5 flex items-center justify-center transition group-hover:scale-102"
                  style={{ backgroundColor: color.hex }}
                >
                  <span className="opacity-0 group-hover:opacity-100 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded-full backdrop-blur-xs font-mono transition">
                    {copiedHex === color.hex ? 'Copied!' : color.hex}
                  </span>
                </div>
                <p className="text-xs font-bold text-slate-800 truncate">{color.name}</p>
                <p className="text-[11px] text-slate-500 truncate">{color.role}</p>
                <span className="text-[10px] font-mono text-purple-600 mt-1 inline-block">
                  {color.hex}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 2-Column: Decor & Design + Food & Drinks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Decor & Styling Ideas */}
        <div className="p-6 rounded-3xl bg-white border border-purple-100 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Decoration & Spatial Design</h3>
              <p className="text-xs text-slate-500">Styling for key zones with budget-friendly secrets</p>
            </div>
          </div>

          <div className="space-y-3.5">
            {plan.decorIdeas.map((decor, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-purple-50/40 border border-purple-100/70 hover:border-purple-200 transition space-y-2"
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-slate-800">{decor.title}</h4>
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800">
                    {decor.area}
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {decor.description}
                </p>
                <div className="p-2.5 rounded-xl bg-white border border-purple-100/90 text-[11px] text-purple-900 flex items-start gap-2">
                  <span className="font-bold text-purple-700 shrink-0">💡 Budget Tip:</span>
                  <span>{decor.budgetFriendlyTip}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Food & Beverage Suggestions */}
        <div className="p-6 rounded-3xl bg-white border border-purple-100 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
              <Utensils className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Food & Beverage Curation</h3>
              <p className="text-xs text-slate-500">Seasonal menu courses & signature refreshments</p>
            </div>
          </div>

          <div className="space-y-4">
            {/* Appetizers */}
            <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-100">
              <h5 className="text-xs font-bold uppercase tracking-wider text-purple-900 mb-2">
                Passed Canapés & Starters
              </h5>
              <ul className="space-y-1.5 text-xs text-slate-700">
                {plan.foodSuggestions.appetizers.map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-1.5 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Mains */}
            <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-100">
              <h5 className="text-xs font-bold uppercase tracking-wider text-purple-900 mb-2">
                Main Entrées & Feasts
              </h5>
              <ul className="space-y-1.5 text-xs text-slate-700">
                {plan.foodSuggestions.mainCourses.map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Desserts & Drinks */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 rounded-2xl bg-slate-50/80 border border-slate-100">
                <h5 className="text-xs font-bold uppercase tracking-wider text-purple-900 mb-1.5">
                  Dessert & Cake
                </h5>
                <ul className="space-y-1 text-xs text-slate-700">
                  {plan.foodSuggestions.desserts.map((item, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="w-1 h-1 rounded-full bg-pink-500 mt-1.5 shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50/80 border border-slate-100">
                <h5 className="text-xs font-bold uppercase tracking-wider text-purple-900 mb-1.5">
                  Signature Drinks
                </h5>
                <ul className="space-y-1 text-xs text-slate-700">
                  {plan.foodSuggestions.drinks.map((item, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="w-1 h-1 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Dietary note */}
            {plan.foodSuggestions.dietaryTips && (
              <div className="p-3 rounded-xl bg-purple-50/60 border border-purple-200/70 text-xs text-purple-950">
                <span className="font-bold">Dietary Protocol: </span>
                {plan.foodSuggestions.dietaryTips}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Schedule / Day Flow Timeline */}
      <div className="p-6 rounded-3xl bg-white border border-purple-100 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Event Day Schedule & Run of Show</h3>
            <p className="text-xs text-slate-500">Hourly coordination flow for effortless guest transitions</p>
          </div>
        </div>

        <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-purple-100">
          {plan.scheduleFlow.map((item, idx) => (
            <div key={idx} className="relative group">
              {/* Dot */}
              <div className="absolute -left-6 sm:-left-8 top-1 w-3.5 h-3.5 rounded-full bg-purple-600 border-2 border-white shadow-xs group-hover:scale-125 transition" />

              <div className="p-3.5 rounded-2xl bg-purple-50/30 border border-purple-100/70 hover:bg-white hover:border-purple-200 transition">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className="text-xs font-extrabold text-purple-900 bg-purple-100 px-2 py-0.5 rounded-md font-mono">
                    {item.time}
                  </span>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900">{item.activity}</h4>
                </div>
                <p className="text-xs text-slate-600">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Personalized Ideas & Planning Tips */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bespoke Personalized Ideas */}
        <div className="p-6 rounded-3xl bg-white border border-purple-100 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-pink-100 text-pink-700 flex items-center justify-center">
              <HeartHandshake className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Personalized Moments & Ideas</h3>
              <p className="text-xs text-slate-500">Creative touches that make this event uniquely yours</p>
            </div>
          </div>

          <div className="space-y-3">
            {plan.personalizedIdeas.map((idea, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-pink-50/30 border border-pink-100/60 space-y-1.5">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-900">{idea.title}</h4>
                  <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-pink-100 text-pink-700">
                    {idea.category}
                  </span>
                </div>
                <p className="text-xs text-slate-700">{idea.idea}</p>
                <p className="text-[11px] text-pink-900/80 italic">
                  <span className="font-semibold">Why it works: </span>{idea.whyItWorks}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Pro Planning Tips */}
        <div className="p-6 rounded-3xl bg-white border border-purple-100 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
              <Lightbulb className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Event Planner Insider Tips</h3>
              <p className="text-xs text-slate-500">Crucial advice to avoid common logistical headaches</p>
            </div>
          </div>

          <div className="space-y-3">
            {plan.planningTips.map((tip, idx) => {
              const badgeColor =
                tip.priority === 'pro'
                  ? 'bg-purple-100 text-purple-700'
                  : tip.priority === 'high'
                  ? 'bg-rose-100 text-rose-700'
                  : 'bg-blue-100 text-blue-700';

              return (
                <div key={idx} className="p-4 rounded-2xl bg-slate-50/70 border border-slate-100 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">{tip.category}</span>
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${badgeColor}`}>
                      {tip.priority === 'pro' ? '★ Pro Secret' : `${tip.priority} Priority`}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">{tip.tip}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
