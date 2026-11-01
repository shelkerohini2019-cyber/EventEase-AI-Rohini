import React from 'react';
import {
  DollarSign,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Briefcase,
  Sparkles,
  ArrowRight,
  ListTodo,
  Calendar,
  PieChart,
  Users,
} from 'lucide-react';
import { EventData } from '../types/event';
import { formatCurrency, formatDate } from '../utils/formatters';

interface DashboardViewProps {
  event: EventData;
  onNavigateTab: (tabId: string) => void;
  onToggleMilestone: (milestoneId: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  event,
  onNavigateTab,
  onToggleMilestone,
}) => {
  // Budget stats
  const totalBudget = event.totalBudget || 0;
  const plannedExpenses = event.budgetCategories.reduce((sum, cat) => sum + cat.allocatedAmount, 0);

  // Calculate actual spent across all line items
  const actualExpenses = event.budgetCategories.reduce(
    (sum, cat) => sum + cat.items.reduce((iSum, item) => iSum + (item.actualCost || 0), 0),
    0
  );

  // Total estimated from all items
  const totalItemEstimates = event.budgetCategories.reduce(
    (sum, cat) => sum + cat.items.reduce((iSum, item) => iSum + (item.estimatedCost || 0), 0),
    0
  );

  const remainingBudget = totalBudget - actualExpenses;
  const isOverBudget = remainingBudget < 0;
  const budgetUtilization = totalBudget > 0 ? Math.round((actualExpenses / totalBudget) * 100) : 0;

  // Task stats
  const pendingMilestones = event.timeline.filter((m) => !m.isCompleted);
  const completedMilestones = event.timeline.filter((m) => m.isCompleted);
  const pendingVendors = event.vendors.filter((v) => !v.isCompleted && v.status !== 'booked');
  const bookedVendors = event.vendors.filter((v) => v.isCompleted || v.status === 'booked');

  const totalActionItems = event.timeline.length + event.vendors.length;
  const completedActionItems = completedMilestones.length + bookedVendors.length;
  const completionRate = totalActionItems > 0 ? Math.round((completedActionItems / totalActionItems) * 100) : 0;

  // Upcoming 3 milestones
  const upcomingMilestones = [...event.timeline]
    .sort((a, b) => (b.targetDaysBefore || 0) - (a.targetDaysBefore || 0))
    .slice(0, 4);

  return (
    <div className="space-y-6">
      {/* 4 Core Financial & Readiness Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Budget */}
        <div className="p-5 rounded-2xl bg-white border border-purple-100/90 shadow-xs hover:shadow-md transition">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Total Budget
            </span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-slate-900">
            {formatCurrency(totalBudget, event.currency)}
          </p>
          <div className="flex items-center justify-between text-xs text-slate-500 mt-2">
            <span>Planned Allocations:</span>
            <span className="font-semibold text-purple-700">
              {formatCurrency(plannedExpenses, event.currency)}
            </span>
          </div>
        </div>

        {/* Planned Expenses */}
        <div className="p-5 rounded-2xl bg-white border border-purple-100/90 shadow-xs hover:shadow-md transition">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Itemized Estimates
            </span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-slate-900">
            {formatCurrency(totalItemEstimates, event.currency)}
          </p>
          <div className="flex items-center justify-between text-xs text-slate-500 mt-2">
            <span>Actual Spend To Date:</span>
            <span className="font-semibold text-slate-800">
              {formatCurrency(actualExpenses, event.currency)}
            </span>
          </div>
        </div>

        {/* Remaining Budget */}
        <div className={`p-5 rounded-2xl bg-white border shadow-xs hover:shadow-md transition ${
          isOverBudget ? 'border-rose-200 bg-rose-50/20' : 'border-purple-100/90'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Remaining Budget
            </span>
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
              isOverBudget ? 'bg-rose-100 text-rose-700' : 'bg-emerald-50 text-emerald-700'
            }`}>
              {isOverBudget ? <AlertTriangle className="w-4 h-4" /> : <DollarSign className="w-4 h-4" />}
            </div>
          </div>
          <p className={`text-2xl font-extrabold ${isOverBudget ? 'text-rose-600' : 'text-emerald-700'}`}>
            {formatCurrency(remainingBudget, event.currency)}
          </p>
          <div className="flex items-center justify-between text-xs text-slate-500 mt-2">
            <span>Utilization:</span>
            <span className={`font-semibold ${isOverBudget ? 'text-rose-600' : 'text-slate-800'}`}>
              {budgetUtilization}% of budget used
            </span>
          </div>
        </div>

        {/* Pending Tasks */}
        <div className="p-5 rounded-2xl bg-white border border-purple-100/90 shadow-xs hover:shadow-md transition">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Pending Tasks
            </span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center">
              <ListTodo className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-slate-900">
            {pendingMilestones.length + pendingVendors.length}
          </p>
          <div className="flex items-center justify-between text-xs text-slate-500 mt-2">
            <span>Overall Readiness:</span>
            <span className="font-semibold text-purple-700">{completionRate}% Ready</span>
          </div>
        </div>
      </div>

      {/* Main 2-Column Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Budget Category Overview & Visual Progress */}
        <div className="lg:col-span-2 space-y-6">
          <div className="p-6 rounded-2xl bg-white border border-purple-100 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Budget Breakdown by Category</h2>
                <p className="text-xs text-slate-500">Allocated percentages vs actual spending across core pillars</p>
              </div>
              <button
                onClick={() => onNavigateTab('budget')}
                className="text-xs font-semibold text-purple-700 hover:text-purple-800 flex items-center gap-1 cursor-pointer"
              >
                <span>Full Budget Planner</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-4">
              {event.budgetCategories.map((category) => {
                const catSpent = category.items.reduce((s, it) => s + (it.actualCost || 0), 0);
                const percentSpent = category.allocatedAmount > 0
                  ? Math.round((catSpent / category.allocatedAmount) * 100)
                  : 0;

                return (
                  <div key={category.id} className="p-3.5 rounded-xl bg-purple-50/40 border border-purple-100/60">
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-800">{category.name}</span>
                        <span className="text-[11px] font-medium text-purple-600 bg-purple-100/70 px-2 py-0.5 rounded-full">
                          {category.percentage}% ({formatCurrency(category.allocatedAmount, event.currency)})
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="font-semibold text-slate-800">
                          {formatCurrency(catSpent, event.currency)}
                        </span>
                        <span className="text-slate-400 text-[11px] ml-1">spent</span>
                      </div>
                    </div>

                    <div className="w-full bg-white rounded-full h-2.5 overflow-hidden border border-purple-100">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          percentSpent > 100
                            ? 'bg-rose-500'
                            : percentSpent > 80
                            ? 'bg-amber-500'
                            : 'bg-purple-600'
                        }`}
                        style={{ width: `${Math.min(percentSpent, 100)}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1.5">
                      <span>{category.items.length} line items planned</span>
                      <span className={percentSpent > 100 ? 'text-rose-600 font-medium' : 'text-slate-500'}>
                        {percentSpent}% allocated spent
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* AI Plan Teaser Banner */}
          {event.plan ? (
            <div className="p-6 rounded-2xl bg-gradient-to-r from-purple-900 via-indigo-950 to-purple-950 text-white shadow-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-purple-800/80 text-purple-200 text-xs font-semibold flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-purple-300" />
                      AI Theme Plan Ready
                    </span>
                    <span className="text-xs text-purple-300">
                      {event.plan.source === 'live_gemini' ? 'Generated by Gemini AI' : 'Curated Demo Plan'}
                    </span>
                  </div>
                  <button
                    onClick={() => onNavigateTab('ai-plan')}
                    className="text-xs font-semibold bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-lg transition flex items-center gap-1 cursor-pointer"
                  >
                    <span>View Full Plan</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <h3 className="text-xl font-extrabold text-white mb-1">
                  "{event.plan.themeTitle}"
                </h3>
                <p className="text-sm text-purple-200/90 italic mb-4">
                  {event.plan.tagline}
                </p>

                {/* Color palette chips */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs text-purple-300 font-medium">Palette:</span>
                  {event.plan.colorPalette.slice(0, 5).map((color, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 backdrop-blur-xs text-[11px]"
                    >
                      <span
                        className="w-3 h-3 rounded-full border border-white/40 shadow-xs"
                        style={{ backgroundColor: color.hex }}
                      />
                      <span className="text-white/90">{color.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-6 rounded-2xl bg-purple-50/70 border border-purple-200/80 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-purple-950">No AI Event Plan Generated Yet</h3>
                <p className="text-xs text-purple-800/80">Generate a comprehensive theme, decor guide, menu, and schedule tailored to your vibe.</p>
              </div>
              <button
                onClick={() => onNavigateTab('ai-plan')}
                className="shrink-0 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold shadow-sm transition flex items-center gap-1.5 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Generate Plan</span>
              </button>
            </div>
          )}
        </div>

        {/* Right Column: Upcoming Milestones & Vendor Readiness */}
        <div className="space-y-6">
          {/* Upcoming Timeline Milestones */}
          <div className="p-6 rounded-2xl bg-white border border-purple-100 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-slate-900">Upcoming Milestones</h2>
                <p className="text-xs text-slate-500">Next date-based tasks</p>
              </div>
              <button
                onClick={() => onNavigateTab('timeline')}
                className="text-xs font-semibold text-purple-700 hover:text-purple-800 flex items-center gap-1 cursor-pointer"
              >
                <span>All ({event.timeline.length})</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="space-y-3">
              {upcomingMilestones.map((m) => (
                <div
                  key={m.id}
                  className={`p-3 rounded-xl border transition flex items-start gap-3 ${
                    m.isCompleted
                      ? 'bg-slate-50/80 border-slate-100 opacity-60'
                      : 'bg-white border-purple-100 hover:border-purple-300'
                  }`}
                >
                  <button
                    onClick={() => onToggleMilestone(m.id)}
                    className="mt-0.5 text-purple-600 hover:text-purple-700 cursor-pointer"
                    title={m.isCompleted ? 'Mark pending' : 'Mark completed'}
                  >
                    <CheckCircle2
                      className={`w-4 h-4 ${
                        m.isCompleted ? 'fill-purple-600 text-white' : 'text-slate-300'
                      }`}
                    />
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs font-semibold ${m.isCompleted ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                      {m.title}
                    </p>
                    <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400">
                      <span className="font-medium text-purple-700">{m.phaseLabel}</span>
                      {m.calculatedDate && <span>• {formatDate(m.calculatedDate)}</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Vendor Readiness Summary */}
          <div className="p-6 rounded-2xl bg-white border border-purple-100 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-slate-900">Vendor Checklist</h2>
                <p className="text-xs text-slate-500">Core partner status</p>
              </div>
              <button
                onClick={() => onNavigateTab('vendors')}
                className="text-xs font-semibold text-purple-700 hover:text-purple-800 flex items-center gap-1 cursor-pointer"
              >
                <span>Manage</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="p-3 rounded-xl bg-purple-50/60 border border-purple-100 text-center">
                <span className="text-xl font-extrabold text-purple-900">{bookedVendors.length}</span>
                <p className="text-[11px] font-medium text-purple-700 mt-0.5">Booked / Paid</p>
              </div>
              <div className="p-3 rounded-xl bg-amber-50/60 border border-amber-100 text-center">
                <span className="text-xl font-extrabold text-amber-900">{pendingVendors.length}</span>
                <p className="text-[11px] font-medium text-amber-700 mt-0.5">In Discussion</p>
              </div>
            </div>

            <div className="space-y-2">
              {event.vendors.slice(0, 3).map((v) => (
                <div key={v.id} className="p-2.5 rounded-lg bg-slate-50/70 border border-slate-100 text-xs flex items-center justify-between">
                  <div className="truncate pr-2">
                    <span className="font-medium text-slate-800 capitalize">{v.categoryLabel}</span>
                    <p className="text-[10px] text-slate-400 truncate">{v.vendorName || v.task}</p>
                  </div>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-semibold capitalize shrink-0 ${
                      v.status === 'booked'
                        ? 'bg-purple-100 text-purple-700'
                        : v.status === 'contacted'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {v.status.replace('_', ' ')}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Guest RSVP Snapshot Card */}
          <div className="p-6 rounded-2xl bg-white border border-purple-100 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="text-base font-bold text-slate-900">Guest List & RSVPs</h2>
                <p className="text-xs text-slate-500">Attendee headcount status</p>
              </div>
              <button
                onClick={() => onNavigateTab('guests')}
                className="text-xs font-semibold text-purple-700 hover:text-purple-800 flex items-center gap-1 cursor-pointer"
              >
                <span>Manage</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-100">
                <span className="text-lg font-extrabold text-emerald-800">
                  {(event.guests || []).filter((g) => g.rsvpStatus === 'attending').length}
                </span>
                <p className="text-[10px] font-semibold text-emerald-700 mt-0.5">Attending</p>
              </div>
              <div className="p-2.5 rounded-xl bg-amber-50/70 border border-amber-100">
                <span className="text-lg font-extrabold text-amber-800">
                  {(event.guests || []).filter((g) => g.rsvpStatus === 'pending').length}
                </span>
                <p className="text-[10px] font-semibold text-amber-700 mt-0.5">Pending</p>
              </div>
              <div className="p-2.5 rounded-xl bg-purple-50/70 border border-purple-100">
                <span className="text-lg font-extrabold text-purple-800">
                  {event.guestCount}
                </span>
                <p className="text-[10px] font-semibold text-purple-700 mt-0.5">Target</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
