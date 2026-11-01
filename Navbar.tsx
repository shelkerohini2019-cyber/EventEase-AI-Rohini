import React, { useState } from 'react';
import {
  Sparkles,
  Plus,
  BookOpen,
  Printer,
  ChevronDown,
  Layers,
  Calendar,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  RotateCcw,
  Download
} from 'lucide-react';
import { EventData, EventType } from '../types/event';
import { SAMPLE_EVENTS } from '../data/sampleEvents';

interface NavbarProps {
  events: EventData[];
  activeEvent: EventData;
  onSelectEvent: (id: string) => void;
  onOpenNewEventModal: () => void;
  onOpenDeployGuide: () => void;
  onPrintPlan: () => void;
  onDownloadPDF: () => void;
  onResetToSample: (sampleId: string) => void;
  hasGeminiKey: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  events,
  activeEvent,
  onSelectEvent,
  onOpenNewEventModal,
  onOpenDeployGuide,
  onPrintPlan,
  onDownloadPDF,
  onResetToSample,
  hasGeminiKey,
}) => {
  const [eventMenuOpen, setEventMenuOpen] = useState(false);
  const [sampleMenuOpen, setSampleMenuOpen] = useState(false);

  const getEventTypeBadge = (type: EventType) => {
    switch (type) {
      case 'wedding':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'birthday':
        return 'bg-pink-100 text-pink-700 border-pink-200';
      case 'anniversary':
        return 'bg-indigo-100 text-indigo-700 border-indigo-200';
      case 'community':
        return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-purple-100 shadow-xs no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-purple-400 flex items-center justify-center text-white shadow-md shadow-purple-500/20">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg sm:text-xl tracking-tight bg-gradient-to-r from-purple-950 via-purple-900 to-indigo-900 bg-clip-text text-transparent">
                  EventEase AI
                </span>
                <span className="text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200/80 hidden sm:inline-block">
                  Smart Planner
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden md:block">
                Weddings • Birthdays • Anniversaries • Community
              </p>
            </div>
          </div>

          {/* Active Event Selector & Switcher */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="relative">
              <button
                onClick={() => {
                  setEventMenuOpen(!eventMenuOpen);
                  setSampleMenuOpen(false);
                }}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-purple-200 bg-purple-50/60 hover:bg-purple-100/70 text-slate-800 text-xs sm:text-sm font-medium transition cursor-pointer max-w-[180px] sm:max-w-[260px] truncate"
                title="Switch active event"
              >
                <Calendar className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                <span className="truncate">{activeEvent?.name || 'Select Event'}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              </button>

              {eventMenuOpen && (
                <div className="absolute left-0 sm:right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-purple-100 py-2 z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 flex items-center justify-between">
                    <span>Your Saved Events</span>
                    <span className="text-purple-600">{events.length}</span>
                  </div>
                  <div className="max-h-60 overflow-y-auto py-1">
                    {events.map((evt) => (
                      <button
                        key={evt.id}
                        onClick={() => {
                          onSelectEvent(evt.id);
                          setEventMenuOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-purple-50/80 transition cursor-pointer ${
                          evt.id === activeEvent?.id ? 'bg-purple-50 font-semibold text-purple-900' : 'text-slate-700'
                        }`}
                      >
                        <div className="truncate pr-2">
                          <p className="truncate font-medium">{evt.name}</p>
                          <p className="text-[10px] text-slate-400 capitalize">{evt.eventType} • {evt.guestCount} guests</p>
                        </div>
                        <span className={`text-[9px] px-1.5 py-0.5 rounded border capitalize ${getEventTypeBadge(evt.eventType)}`}>
                          {evt.eventType}
                        </span>
                      </button>
                    ))}
                  </div>
                  <div className="pt-1 mt-1 border-t border-slate-100 px-2">
                    <button
                      onClick={() => {
                        setEventMenuOpen(false);
                        onOpenNewEventModal();
                      }}
                      className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-semibold text-purple-700 hover:bg-purple-50 transition"
                    >
                      <Plus className="w-3.5 h-3.5" /> Create New Event
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Load Sample Events Dropdown */}
            <div className="relative hidden md:block">
              <button
                onClick={() => {
                  setSampleMenuOpen(!sampleMenuOpen);
                  setEventMenuOpen(false);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-purple-700 hover:border-purple-200 hover:bg-purple-50/40 text-xs font-medium transition cursor-pointer"
                title="Load a pre-configured sample event to explore all features"
              >
                <Layers className="w-3.5 h-3.5 text-purple-500" />
                <span>Samples</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {sampleMenuOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-purple-100 py-2 z-50">
                  <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100">
                    Instant Demo Samples
                  </div>
                  {SAMPLE_EVENTS.map((sample) => (
                    <button
                      key={sample.id}
                      onClick={() => {
                        onResetToSample(sample.id);
                        setSampleMenuOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 text-xs hover:bg-purple-50/80 transition cursor-pointer flex flex-col gap-0.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-800 capitalize">{sample.eventType}</span>
                        <span className="text-[10px] text-purple-600 font-medium">Load & View</span>
                      </div>
                      <p className="text-[11px] text-slate-600 truncate">{sample.name}</p>
                      <p className="text-[10px] text-slate-400">${sample.totalBudget.toLocaleString()} • {sample.guestCount} guests</p>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* New Event Button */}
            <button
              onClick={onOpenNewEventModal}
              className="flex items-center gap-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-xs sm:text-sm font-semibold px-3 sm:px-4 py-2 rounded-lg shadow-sm shadow-purple-500/20 transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">New Event</span>
            </button>

            {/* AI Status Badge */}
            <div
              className={`hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border ${
                hasGeminiKey
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-amber-50 text-amber-700 border-amber-200'
              }`}
              title={
                hasGeminiKey
                  ? 'Gemini 3.8 Flash API key active for real-time generative intelligence'
                  : 'Running in Demo Mode. Connect GEMINI_API_KEY in Secrets for live AI generation.'
              }
            >
              {hasGeminiKey ? (
                <>
                  <Sparkles className="w-3 h-3 text-emerald-600" />
                  <span>Gemini 3.8 Flash AI</span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-3 h-3 text-amber-600" />
                  <span>Curated Demo Mode</span>
                </>
              )}
            </div>

            {/* Deploy & Run Guide Button */}
            <button
              onClick={onOpenDeployGuide}
              className="p-2 text-slate-500 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition cursor-pointer"
              title="Run & Deploy Guide"
            >
              <BookOpen className="w-4 h-4" />
            </button>

            {/* Print Plan Button */}
            <button
              onClick={onPrintPlan}
              className="p-2 text-slate-500 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition cursor-pointer"
              title="Print Event Blueprint"
            >
              <Printer className="w-4 h-4" />
            </button>

            {/* Download PDF Button */}
            <button
              onClick={onDownloadPDF}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-purple-200 text-purple-700 hover:bg-purple-50 transition cursor-pointer text-xs font-semibold"
              title="Download Complete Event Plan as PDF"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">PDF</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
