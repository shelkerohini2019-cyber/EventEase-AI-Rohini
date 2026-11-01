import React from 'react';
import {
  Calendar,
  MapPin,
  Users,
  DollarSign,
  Clock,
  Sparkles,
  Edit3,
  Heart,
  PartyPopper,
  Building2,
  CheckCircle2,
  TrendingUp,
  HeartHandshake,
} from 'lucide-react';
import { EventData, EventType } from '../types/event';
import { formatCurrency, formatDate, calculateDaysRemaining } from '../utils/formatters';

interface EventOverviewCardProps {
  event: EventData;
  onEdit: () => void;
  onGenerateAIPlan: () => void;
  isGenerating: boolean;
}

export const EventOverviewCard: React.FC<EventOverviewCardProps> = ({
  event,
  onEdit,
  onGenerateAIPlan,
  isGenerating,
}) => {
  const countdown = calculateDaysRemaining(event.date);

  // Calculate budget stats
  const totalAllocated = event.budgetCategories.reduce((sum, cat) => sum + cat.allocatedAmount, 0);
  const totalSpent = event.budgetCategories.reduce(
    (sum, cat) => sum + cat.items.reduce((iSum, item) => iSum + (item.actualCost || 0), 0),
    0
  );
  const remainingBudget = event.totalBudget - totalSpent;
  const spentPercent = event.totalBudget > 0 ? Math.round((totalSpent / event.totalBudget) * 100) : 0;

  // Task stats
  const totalTasks = event.timeline.length + event.vendors.length;
  const completedTasks =
    event.timeline.filter((m) => m.isCompleted).length +
    event.vendors.filter((v) => v.isCompleted || v.status === 'booked' || v.status === 'completed').length;
  const progressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const getEventIcon = (type: EventType) => {
    switch (type) {
      case 'wedding':
        return <Heart className="w-5 h-5 text-purple-600 fill-purple-100" />;
      case 'birthday':
        return <PartyPopper className="w-5 h-5 text-pink-600" />;
      case 'anniversary':
        return <HeartHandshake className="w-5 h-5 text-indigo-600" />;
      case 'community':
        return <Building2 className="w-5 h-5 text-emerald-600" />;
    }
  };

  return (
    <div className="relative overflow-hidden rounded-2xl bg-white border border-purple-100 shadow-md shadow-purple-500/5 p-6 mb-8">
      {/* Background soft lavender accent glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-purple-100/50 via-indigo-50/30 to-transparent rounded-full blur-3xl -z-10 pointer-events-none" />

      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        {/* Main Info */}
        <div className="space-y-3 flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-purple-100/80 text-purple-800 border border-purple-200">
              {getEventIcon(event.eventType)}
              {event.eventType}
            </span>
            {event.subtype && (
              <span className="text-xs font-medium text-slate-500 bg-slate-100/80 px-2.5 py-0.5 rounded-full">
                {event.subtype}
              </span>
            )}
            <span
              className={`text-xs font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-1 ${
                countdown.isPast
                  ? 'bg-slate-100 text-slate-600'
                  : countdown.days <= 14
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-purple-100 text-purple-700'
              }`}
            >
              <Clock className="w-3 h-3" />
              {countdown.label}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {event.name}
          </h1>

          <div className="flex flex-wrap items-center gap-y-2 gap-x-5 text-xs sm:text-sm text-slate-600">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-purple-500 shrink-0" />
              <span className="font-medium">{formatDate(event.date)}</span>
              {event.time && <span className="text-slate-400">at {event.time}</span>}
            </div>
            <div className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-purple-500 shrink-0" />
              <span className="truncate max-w-[220px]">{event.location || 'Location TBD'}</span>
              <span className="text-slate-400 capitalize">({event.locationType})</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Users className="w-4 h-4 text-purple-500 shrink-0" />
              <span className="font-medium">{event.guestCount}</span> Guests
            </div>
          </div>

          {event.vibePreference && (
            <p className="text-xs text-purple-900/80 bg-purple-50/70 border border-purple-100/80 px-3 py-1.5 rounded-lg inline-block max-w-2xl italic">
              " {event.vibePreference} "
            </p>
          )}
        </div>

        {/* Quick Actions & Budget Snapshot */}
        <div className="flex flex-col sm:flex-row lg:flex-col items-stretch sm:items-center lg:items-end gap-3 w-full lg:w-auto shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={onEdit}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 hover:border-purple-300 hover:bg-purple-50/50 text-slate-700 text-xs sm:text-sm font-semibold transition cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5 text-slate-500" />
              <span>Edit Details</span>
            </button>

            <button
              onClick={onGenerateAIPlan}
              disabled={isGenerating}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 hover:from-purple-700 hover:to-indigo-800 text-white text-xs sm:text-sm font-semibold shadow-md shadow-purple-500/20 transition cursor-pointer disabled:opacity-50"
            >
              <Sparkles className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
              <span>{isGenerating ? 'Crafting AI Plan...' : event.plan ? 'Regenerate AI Plan' : 'Generate AI Plan'}</span>
            </button>
          </div>

          {/* Quick budget snapshot bar */}
          <div className="bg-slate-50/80 rounded-xl p-3 border border-slate-100 w-full lg:w-72">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="text-slate-500 font-medium">Budget Spent:</span>
              <span className="font-bold text-slate-800">
                {formatCurrency(totalSpent, event.currency)} / {formatCurrency(event.totalBudget, event.currency)}
              </span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden mb-1">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  spentPercent > 100
                    ? 'bg-rose-500'
                    : spentPercent > 85
                    ? 'bg-amber-500'
                    : 'bg-purple-600'
                }`}
                style={{ width: `${Math.min(spentPercent, 100)}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-500">Remaining</span>
              <span
                className={`font-semibold ${
                  remainingBudget < 0 ? 'text-rose-600' : 'text-emerald-700'
                }`}
              >
                {formatCurrency(remainingBudget, event.currency)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
