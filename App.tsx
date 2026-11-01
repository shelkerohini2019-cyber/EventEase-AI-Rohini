/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  LayoutDashboard,
  PieChart,
  Calendar,
  Briefcase,
  Lightbulb,
  Check,
  AlertCircle,
  Users,
  Download,
} from 'lucide-react';
import { EventData, BudgetCategory, TimelineMilestone, VendorTask, GuestItem } from './types/event';
import { SAMPLE_EVENTS } from './data/sampleEvents';
import {
  loadEventsFromStorage,
  saveEventsToStorage,
  getActiveEventId,
  setActiveEventId,
} from './services/storage';
import { checkServerHealth, generateEventPlan } from './services/api';
import { Navbar } from './components/Navbar';
import { EventOverviewCard } from './components/EventOverviewCard';
import { DashboardView } from './components/DashboardView';
import { AIPlannerView } from './components/AIPlannerView';
import { BudgetPlannerView } from './components/BudgetPlannerView';
import { TimelineView } from './components/TimelineView';
import { VendorChecklistView } from './components/VendorChecklistView';
import { GuestManagementView } from './components/GuestManagementView';
import { PersonalizedIdeasView } from './components/PersonalizedIdeasView';
import { EventFormModal } from './components/EventFormModal';
import { DeployGuideModal } from './components/DeployGuideModal';
import { PrintExportView } from './components/PrintExportView';
import { generateEventPlanPDF } from './utils/pdfGenerator';

export default function App() {
  const [events, setEvents] = useState<EventData[]>([]);
  const [activeEventId, setCurrentEventId] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'dashboard' | 'ai-plan' | 'budget' | 'timeline' | 'vendors' | 'guests' | 'ideas'>('dashboard');

  // Modals state
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<EventData | null>(null);
  const [isDeployGuideOpen, setIsDeployGuideOpen] = useState(false);

  // AI & Server status
  const [hasGeminiKey, setHasGeminiKey] = useState(false);
  const [isGeneratingAIPlan, setIsGeneratingAIPlan] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' | 'error' } | null>(null);

  // Initialize data on mount
  useEffect(() => {
    const loadedEvents = loadEventsFromStorage();
    const storedActiveId = getActiveEventId();

    setEvents(loadedEvents);
    if (loadedEvents.some((e) => e.id === storedActiveId)) {
      setCurrentEventId(storedActiveId);
    } else if (loadedEvents.length > 0) {
      setCurrentEventId(loadedEvents[0].id);
      setActiveEventId(loadedEvents[0].id);
    }

    // Check backend health & Gemini API key presence
    checkServerHealth().then((health) => {
      setHasGeminiKey(health.hasGeminiKey);
    });
  }, []);

  const showToast = (text: string, type: 'success' | 'info' | 'error' = 'info') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const activeEvent = events.find((e) => e.id === activeEventId) || events[0] || SAMPLE_EVENTS[0];

  // Helper to persist event changes
  const updateCurrentEvent = (updated: EventData) => {
    const updatedEvents = events.map((e) => (e.id === updated.id ? updated : e));
    setEvents(updatedEvents);
    saveEventsToStorage(updatedEvents);
  };

  // Switch active event
  const handleSelectEvent = (id: string) => {
    setCurrentEventId(id);
    setActiveEventId(id);
    const selected = events.find((e) => e.id === id);
    if (selected) {
      showToast(`Switched to: ${selected.name}`, 'info');
    }
  };

  // Reset or load one of the built-in demo events
  const handleResetToSample = (sampleId: string) => {
    const sample = SAMPLE_EVENTS.find((s) => s.id === sampleId);
    if (!sample) return;

    // Check if it already exists or overwrite
    const existingIndex = events.findIndex((e) => e.id === sample.id);
    let updatedEvents: EventData[];
    if (existingIndex >= 0) {
      updatedEvents = events.map((e) => (e.id === sample.id ? { ...sample } : e));
    } else {
      updatedEvents = [sample, ...events];
    }

    setEvents(updatedEvents);
    saveEventsToStorage(updatedEvents);
    setCurrentEventId(sample.id);
    setActiveEventId(sample.id);
    showToast(`Loaded sample: ${sample.name}`, 'success');
  };

  // Trigger AI plan generation for active event
  const handleGenerateAIPlan = async (targetEvent?: EventData) => {
    const eventToPlan = targetEvent || activeEvent;
    if (!eventToPlan) return;

    setIsGeneratingAIPlan(true);
    try {
      const response = await generateEventPlan(eventToPlan);
      const updatedEvent: EventData = {
        ...eventToPlan,
        plan: response.plan,
        updatedAt: new Date().toISOString(),
      };

      updateCurrentEvent(updatedEvent);

      if (response.source === 'live_gemini') {
        showToast('Personalized AI Event Plan generated successfully with Gemini 3.8 Flash!', 'success');
      } else {
        showToast('Demo Mode Plan generated. Connect GEMINI_API_KEY in Secrets for live AI.', 'info');
      }

      // Switch to AI Plan tab to view results
      setActiveTab('ai-plan');
    } catch (err: any) {
      console.error('Plan generation failed:', err);
      showToast(err.message || 'Failed to generate plan', 'error');
    } finally {
      setIsGeneratingAIPlan(false);
    }
  };

  // Save new or edited event
  const handleSaveEvent = (savedEvent: EventData, shouldGenerateAI: boolean) => {
    const isExisting = events.some((e) => e.id === savedEvent.id);
    let updatedList: EventData[];

    if (isExisting) {
      updatedList = events.map((e) => (e.id === savedEvent.id ? savedEvent : e));
      showToast('Event details updated successfully.', 'success');
    } else {
      updatedList = [savedEvent, ...events];
      showToast(`Created new event: ${savedEvent.name}`, 'success');
    }

    setEvents(updatedList);
    saveEventsToStorage(updatedList);
    setCurrentEventId(savedEvent.id);
    setActiveEventId(savedEvent.id);
    setIsEventModalOpen(false);
    setEditingEvent(null);

    if (shouldGenerateAI) {
      handleGenerateAIPlan(savedEvent);
    }
  };

  // Budget updates
  const handleUpdateBudgetCategories = (categories: BudgetCategory[]) => {
    if (!activeEvent) return;
    const updated: EventData = {
      ...activeEvent,
      budgetCategories: categories,
      updatedAt: new Date().toISOString(),
    };
    updateCurrentEvent(updated);
  };

  const handleUpdateTotalBudget = (newBudget: number) => {
    if (!activeEvent) return;
    const updated: EventData = {
      ...activeEvent,
      totalBudget: newBudget,
      updatedAt: new Date().toISOString(),
    };
    updateCurrentEvent(updated);
  };

  // Timeline updates
  const handleUpdateTimeline = (timeline: TimelineMilestone[]) => {
    if (!activeEvent) return;
    const updated: EventData = {
      ...activeEvent,
      timeline,
      updatedAt: new Date().toISOString(),
    };
    updateCurrentEvent(updated);
  };

  const handleToggleMilestone = (milestoneId: string) => {
    if (!activeEvent) return;
    const updatedTimeline = activeEvent.timeline.map((m) =>
      m.id === milestoneId ? { ...m, isCompleted: !m.isCompleted } : m
    );
    handleUpdateTimeline(updatedTimeline);
  };

  // Vendor updates
  const handleUpdateVendors = (vendors: VendorTask[]) => {
    if (!activeEvent) return;
    const updated: EventData = {
      ...activeEvent,
      vendors,
      updatedAt: new Date().toISOString(),
    };
    updateCurrentEvent(updated);
  };

  // Save a sparker idea into active event plan
  const handleSaveIdeaToPlan = (idea: { title: string; category: any; idea: string; whyItWorks: string }) => {
    if (!activeEvent || !activeEvent.plan) {
      showToast('Generate an AI Plan first to attach personalized ideas.', 'info');
      return;
    }
    const updatedPlan = {
      ...activeEvent.plan,
      personalizedIdeas: [
        ...activeEvent.plan.personalizedIdeas,
        {
          title: idea.title,
          category: idea.category,
          idea: idea.idea,
          whyItWorks: idea.whyItWorks,
        },
      ],
    };
    const updated: EventData = {
      ...activeEvent,
      plan: updatedPlan,
      updatedAt: new Date().toISOString(),
    };
    updateCurrentEvent(updated);
    showToast(`Added "${idea.title}" to your Event Plan!`, 'success');
  };

  // Download PDF plan
  const handleDownloadPDF = () => {
    if (!activeEvent) return;
    try {
      generateEventPlanPDF(activeEvent);
      showToast('Downloading complete event blueprint as PDF...', 'success');
    } catch (err: any) {
      console.error('PDF export failed:', err);
      showToast('Failed to export PDF: ' + (err.message || 'Unknown error'), 'error');
    }
  };

  // Guest updates
  const handleUpdateGuests = (guests: GuestItem[]) => {
    if (!activeEvent) return;
    const updated: EventData = {
      ...activeEvent,
      guests,
      updatedAt: new Date().toISOString(),
    };
    updateCurrentEvent(updated);
  };

  // Print plan
  const handlePrint = () => {
    window.print();
  };

  // Navigation tab definitions
  const tabs = [
    { id: 'dashboard' as const, label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    {
      id: 'ai-plan' as const,
      label: 'AI Event Planner',
      icon: <Sparkles className="w-4 h-4 text-purple-600" />,
      badge: activeEvent?.plan ? 'Ready' : undefined,
    },
    { id: 'budget' as const, label: 'Smart Budget', icon: <PieChart className="w-4 h-4" /> },
    { id: 'timeline' as const, label: 'Timeline', icon: <Calendar className="w-4 h-4" /> },
    { id: 'vendors' as const, label: 'Vendor Checklist', icon: <Briefcase className="w-4 h-4" /> },
    {
      id: 'guests' as const,
      label: 'Guest List',
      icon: <Users className="w-4 h-4" />,
      badge: activeEvent?.guests?.length ? `${activeEvent.guests.length}` : undefined,
    },
    { id: 'ideas' as const, label: 'Personalized Ideas', icon: <Lightbulb className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-[#faf8ff] text-[#1e1b4b]">
      {/* Top Navigation */}
      <Navbar
        events={events}
        activeEvent={activeEvent}
        onSelectEvent={handleSelectEvent}
        onOpenNewEventModal={() => {
          setEditingEvent(null);
          setIsEventModalOpen(true);
        }}
        onOpenDeployGuide={() => setIsDeployGuideOpen(true)}
        onPrintPlan={handlePrint}
        onDownloadPDF={handleDownloadPDF}
        onResetToSample={handleResetToSample}
        hasGeminiKey={hasGeminiKey}
      />

      {/* Toast Alert Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-4 no-print">
          <div
            className={`px-4 py-3 rounded-2xl shadow-xl border text-xs sm:text-sm font-semibold flex items-center gap-2 ${
              toastMessage.type === 'success'
                ? 'bg-purple-900 text-white border-purple-700'
                : toastMessage.type === 'error'
                ? 'bg-rose-900 text-white border-rose-700'
                : 'bg-slate-900 text-white border-slate-700'
            }`}
          >
            {toastMessage.type === 'success' ? (
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
            )}
            <span>{toastMessage.text}</span>
          </div>
        </div>
      )}

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 no-print">
        {/* Event Overview Hero Banner */}
        <EventOverviewCard
          event={activeEvent}
          onEdit={() => {
            setEditingEvent(activeEvent);
            setIsEventModalOpen(true);
          }}
          onGenerateAIPlan={() => handleGenerateAIPlan(activeEvent)}
          isGenerating={isGeneratingAIPlan}
        />

        {/* Tab Navigation Navigation Bar */}
        <div className="border-b border-purple-100/90 mb-8 overflow-x-auto">
          <nav className="flex space-x-2 sm:space-x-4 min-w-max pb-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3 sm:px-4 py-2.5 text-xs sm:text-sm font-bold transition rounded-t-xl cursor-pointer ${
                  activeTab === tab.id
                    ? 'border-b-2 border-purple-600 text-purple-900 bg-purple-50/70'
                    : 'text-slate-500 hover:text-purple-800 hover:bg-purple-50/30'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-purple-200 text-purple-900 font-extrabold uppercase">
                    {tab.badge}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Active Tab View Rendering */}
        {activeTab === 'dashboard' && (
          <DashboardView
            event={activeEvent}
            onNavigateTab={(tabId) => setActiveTab(tabId as any)}
            onToggleMilestone={handleToggleMilestone}
          />
        )}

        {activeTab === 'ai-plan' && (
          <AIPlannerView
            event={activeEvent}
            onGeneratePlan={() => handleGenerateAIPlan(activeEvent)}
            isGenerating={isGeneratingAIPlan}
            onPrint={handlePrint}
            onDownloadPDF={handleDownloadPDF}
          />
        )}

        {activeTab === 'budget' && (
          <BudgetPlannerView
            event={activeEvent}
            onUpdateBudgetCategories={handleUpdateBudgetCategories}
            onUpdateTotalBudget={handleUpdateTotalBudget}
          />
        )}

        {activeTab === 'timeline' && (
          <TimelineView
            event={activeEvent}
            onUpdateTimeline={handleUpdateTimeline}
          />
        )}

        {activeTab === 'vendors' && (
          <VendorChecklistView
            event={activeEvent}
            onUpdateVendors={handleUpdateVendors}
          />
        )}

        {activeTab === 'guests' && (
          <GuestManagementView
            event={activeEvent}
            onUpdateGuests={handleUpdateGuests}
          />
        )}

        {activeTab === 'ideas' && (
          <PersonalizedIdeasView
            event={activeEvent}
            onSaveIdeaToPlan={handleSaveIdeaToPlan}
          />
        )}
      </main>

      {/* Clean Printable Export View (activated via window.print()) */}
      <PrintExportView event={activeEvent} />

      {/* Event Create / Edit Form Modal */}
      <EventFormModal
        isOpen={isEventModalOpen}
        onClose={() => {
          setIsEventModalOpen(false);
          setEditingEvent(null);
        }}
        onSave={handleSaveEvent}
        initialEvent={editingEvent}
      />

      {/* Deployment & Run Guide Modal */}
      <DeployGuideModal
        isOpen={isDeployGuideOpen}
        onClose={() => setIsDeployGuideOpen(false)}
        hasGeminiKey={hasGeminiKey}
      />
    </div>
  );
}
