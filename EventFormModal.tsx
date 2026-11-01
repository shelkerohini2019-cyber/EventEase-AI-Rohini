import React, { useState, useEffect } from 'react';
import {
  Heart,
  PartyPopper,
  Building2,
  Calendar,
  MapPin,
  Users,
  DollarSign,
  Sparkles,
  Check,
  AlertCircle,
  HelpCircle,
  HeartHandshake,
} from 'lucide-react';
import { EventData, EventType } from '../types/event';
import {
  createDefaultBudgetCategories,
  generateDefaultTimeline,
  generateDefaultVendors,
  generateDefaultGuests,
} from '../data/eventDefaults';

interface EventFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (event: EventData, shouldGenerateAIPlan: boolean) => void;
  initialEvent?: EventData | null;
}

export const EventFormModal: React.FC<EventFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialEvent,
}) => {
  const isEditing = Boolean(initialEvent);

  const [eventType, setEventType] = useState<EventType>(initialEvent?.eventType || 'wedding');
  const [name, setName] = useState(initialEvent?.name || '');
  const [subtype, setSubtype] = useState(initialEvent?.subtype || '');
  const [date, setDate] = useState(initialEvent?.date || '');
  const [time, setTime] = useState(initialEvent?.time || '17:00');
  const [location, setLocation] = useState(initialEvent?.location || '');
  const [locationType, setLocationType] = useState<EventData['locationType']>(
    initialEvent?.locationType || 'indoor'
  );
  const [guestCount, setGuestCount] = useState<number>(initialEvent?.guestCount || 80);
  const [totalBudget, setTotalBudget] = useState<number>(initialEvent?.totalBudget || 15000);
  const [currency, setCurrency] = useState(initialEvent?.currency || 'USD');
  const [vibePreference, setVibePreference] = useState(initialEvent?.vibePreference || '');
  const [specialNotes, setSpecialNotes] = useState(initialEvent?.specialNotes || '');
  const [autoGenerateAI, setAutoGenerateAI] = useState(true);

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialEvent) {
      setEventType(initialEvent.eventType);
      setName(initialEvent.name);
      setSubtype(initialEvent.subtype || '');
      setDate(initialEvent.date);
      setTime(initialEvent.time || '17:00');
      setLocation(initialEvent.location);
      setLocationType(initialEvent.locationType);
      setGuestCount(initialEvent.guestCount);
      setTotalBudget(initialEvent.totalBudget);
      setCurrency(initialEvent.currency || 'USD');
      setVibePreference(initialEvent.vibePreference || '');
      setSpecialNotes(initialEvent.specialNotes || '');
      setAutoGenerateAI(false);
    } else {
      // Default new wedding
      setEventType('wedding');
      setName('Sarah & Liam’s Lavender Garden Wedding');
      setSubtype('Romantic Outdoor Estate');
      const nextYear = new Date();
      nextYear.setMonth(nextYear.getMonth() + 6);
      setDate(nextYear.toISOString().split('T')[0]);
      setTime('16:30');
      setLocation('Blossom Vineyard, Napa Valley, CA');
      setLocationType('outdoor');
      setGuestCount(120);
      setTotalBudget(25000);
      setCurrency('USD');
      setVibePreference('Soft lavender, delicate eucalyptus greens, warm fairy lights, and timeless romance.');
      setSpecialNotes('');
      setAutoGenerateAI(true);
    }
    setErrors({});
  }, [initialEvent, isOpen]);

  // When changing event type for a brand new event, offer contextual defaults
  const handleEventTypeChange = (type: EventType) => {
    setEventType(type);
    if (!isEditing) {
      if (type === 'wedding') {
        setName('Sarah & Liam’s Lavender Garden Wedding');
        setSubtype('Romantic Outdoor Estate');
        setGuestCount(120);
        setTotalBudget(25000);
        setVibePreference('Soft lavender, eucalyptus, warm fairy lights, and timeless elegance.');
      } else if (type === 'anniversary') {
        setName('Victoria & Henry’s 30th Pearl & Silver Anniversary');
        setSubtype('Intimate Dinner & Vow Renewal');
        setGuestCount(65);
        setTotalBudget(16000);
        setVibePreference('Timeless pearl white, brushed silver, soft candlelight, acoustic jazz, and champagne toast.');
      } else if (type === 'birthday') {
        setName('Lucas’s 30th Milestone Sunset Bash');
        setSubtype('Rooftop Lounge & Cocktails');
        setGuestCount(50);
        setTotalBudget(4500);
        setVibePreference('Chic boho terracotta, neon sign backdrop, deep house beats, and craft sliders.');
      } else {
        setName('Oakridge Annual Spring Arts & Food Fair');
        setSubtype('Community Street Festival');
        setGuestCount(300);
        setTotalBudget(12000);
        setVibePreference('Warm, welcoming community atmosphere, local acoustic music, food trucks, and eco-friendly bunting.');
      }
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = 'Please provide an event name.';
    }
    if (!date) {
      newErrors.date = 'Event date is required.';
    }
    if (!location.trim()) {
      newErrors.location = 'Please specify a venue or city location.';
    }
    if (!guestCount || guestCount <= 0) {
      newErrors.guestCount = 'Guest count must be at least 1.';
    }
    if (!totalBudget || totalBudget <= 0) {
      newErrors.totalBudget = 'Total budget must be greater than 0.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const eventId = initialEvent?.id || `event-${Date.now()}`;
    const budgetCategories =
      initialEvent?.budgetCategories && initialEvent.eventType === eventType
        ? initialEvent.budgetCategories
        : createDefaultBudgetCategories(eventType, totalBudget);

    const timeline =
      initialEvent?.timeline && initialEvent.eventType === eventType
        ? initialEvent.timeline
        : generateDefaultTimeline(date, eventType);

    const vendors =
      initialEvent?.vendors && initialEvent.eventType === eventType
        ? initialEvent.vendors
        : generateDefaultVendors(eventType);

    const eventData: EventData = {
      id: eventId,
      name: name.trim(),
      eventType,
      subtype: subtype.trim() || undefined,
      date,
      time,
      location: location.trim(),
      locationType,
      guestCount: Number(guestCount),
      totalBudget: Number(totalBudget),
      currency,
      vibePreference: vibePreference.trim(),
      specialNotes: specialNotes.trim() || undefined,
      createdAt: initialEvent?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      plan: initialEvent?.plan,
      budgetCategories,
      timeline,
      vendors,
      guests: initialEvent?.guests && initialEvent.guests.length > 0
        ? initialEvent.guests
        : generateDefaultGuests(eventType),
    };

    onSave(eventData, autoGenerateAI && !isEditing);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-purple-100 my-8 animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between pb-4 border-b border-purple-50">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
              {isEditing ? 'Edit Event Details' : 'Create New Event'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Specify your event parameters to power budget benchmarks & AI planning
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 text-sm font-bold cursor-pointer"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 mt-6">
          {/* Event Type Cards */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
              Select Event Type *
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {[
                {
                  type: 'wedding' as EventType,
                  title: 'Wedding',
                  desc: 'Ceremony, reception, banquet',
                  icon: <Heart className="w-4 h-4 text-purple-600" />,
                },
                {
                  type: 'birthday' as EventType,
                  title: 'Birthday',
                  desc: 'Milestones, parties, soirées',
                  icon: <PartyPopper className="w-4 h-4 text-pink-600" />,
                },
                {
                  type: 'anniversary' as EventType,
                  title: 'Anniversary',
                  desc: 'Vow renewals, jubilees, galas',
                  icon: <HeartHandshake className="w-4 h-4 text-indigo-600" />,
                },
                {
                  type: 'community' as EventType,
                  title: 'Community',
                  desc: 'Fairs, charity, festivals',
                  icon: <Building2 className="w-4 h-4 text-emerald-600" />,
                },
              ].map((item) => (
                <button
                  type="button"
                  key={item.type}
                  onClick={() => handleEventTypeChange(item.type)}
                  className={`p-3 rounded-2xl border text-left transition cursor-pointer flex flex-col justify-between ${
                    eventType === item.type
                      ? 'border-purple-600 bg-purple-50/70 shadow-sm ring-2 ring-purple-500/20'
                      : 'border-slate-200 hover:border-purple-300 hover:bg-purple-50/20'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="p-1.5 rounded-xl bg-white shadow-2xs border border-slate-100">
                      {item.icon}
                    </span>
                    {eventType === item.type && (
                      <span className="w-4 h-4 rounded-full bg-purple-600 text-white flex items-center justify-center text-[10px]">
                        <Check className="w-2.5 h-2.5" />
                      </span>
                    )}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">{item.title}</h4>
                    <p className="text-[10px] text-slate-500 mt-0.5 leading-tight">{item.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Event Name & Subtype */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Event Title *
              </label>
              <input
                type="text"
                placeholder="e.g. Maya & Julian’s Vineyard Wedding"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (errors.name) setErrors({ ...errors, name: '' });
                }}
                className={`w-full px-3.5 py-2 text-xs rounded-xl border ${
                  errors.name ? 'border-rose-400 bg-rose-50/20' : 'border-purple-200'
                } focus:outline-none focus:ring-2 focus:ring-purple-400`}
              />
              {errors.name && <p className="text-[11px] text-rose-600 mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Theme / Subtype
              </label>
              <input
                type="text"
                placeholder="e.g. Rustic Garden"
                value={subtype}
                onChange={(e) => setSubtype(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-400"
              />
            </div>
          </div>

          {/* Date, Time, Location */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Event Date *
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => {
                  setDate(e.target.value);
                  if (errors.date) setErrors({ ...errors, date: '' });
                }}
                className={`w-full px-3 py-2 text-xs rounded-xl border ${
                  errors.date ? 'border-rose-400 bg-rose-50/20' : 'border-purple-200'
                } focus:outline-none focus:ring-2 focus:ring-purple-400`}
              />
              {errors.date && <p className="text-[11px] text-rose-600 mt-1">{errors.date}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Event Start Time
              </label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Setting Type
              </label>
              <select
                value={locationType}
                onChange={(e) => setLocationType(e.target.value as any)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white"
              >
                <option value="indoor">Indoor Venue</option>
                <option value="outdoor">Outdoor / Garden</option>
                <option value="hybrid">Indoor + Outdoor</option>
                <option value="destination">Destination</option>
              </select>
            </div>
          </div>

          {/* Location details */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Venue / Location Details *
            </label>
            <input
              type="text"
              placeholder="e.g. Meadowood Estate, Napa Valley or City Park Pavilion"
              value={location}
              onChange={(e) => {
                setLocation(e.target.value);
                if (errors.location) setErrors({ ...errors, location: '' });
              }}
              className={`w-full px-3.5 py-2 text-xs rounded-xl border ${
                errors.location ? 'border-rose-400 bg-rose-50/20' : 'border-purple-200'
              } focus:outline-none focus:ring-2 focus:ring-purple-400`}
            />
            {errors.location && <p className="text-[11px] text-rose-600 mt-1">{errors.location}</p>}
          </div>

          {/* Guest Count & Budget */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Estimated Guest Count *
              </label>
              <input
                type="number"
                min="1"
                value={guestCount}
                onChange={(e) => {
                  setGuestCount(parseInt(e.target.value) || 0);
                  if (errors.guestCount) setErrors({ ...errors, guestCount: '' });
                }}
                className={`w-full px-3.5 py-2 text-xs rounded-xl border ${
                  errors.guestCount ? 'border-rose-400 bg-rose-50/20' : 'border-purple-200'
                } focus:outline-none focus:ring-2 focus:ring-purple-400`}
              />
              {errors.guestCount && <p className="text-[11px] text-rose-600 mt-1">{errors.guestCount}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Total Budget *
              </label>
              <input
                type="number"
                min="1"
                value={totalBudget}
                onChange={(e) => {
                  setTotalBudget(parseFloat(e.target.value) || 0);
                  if (errors.totalBudget) setErrors({ ...errors, totalBudget: '' });
                }}
                className={`w-full px-3.5 py-2 text-xs rounded-xl border ${
                  errors.totalBudget ? 'border-rose-400 bg-rose-50/20' : 'border-purple-200'
                } focus:outline-none focus:ring-2 focus:ring-purple-400`}
              />
              {errors.totalBudget && <p className="text-[11px] text-rose-600 mt-1">{errors.totalBudget}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Currency
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white"
              >
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="CAD">CAD (CA$)</option>
                <option value="AUD">AUD (AU$)</option>
                <option value="INR">INR (₹)</option>
              </select>
            </div>
          </div>

          {/* Vibe / Theme Preferences */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Desired Vibe, Color Palette, or Styling Notes
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Soft lavender and cream florals, warm candlelight, indie-folk acoustic playlist, signature cocktails"
              value={vibePreference}
              onChange={(e) => setVibePreference(e.target.value)}
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-400"
            />
          </div>

          {/* Checkbox for auto-generating AI Plan */}
          {!isEditing && (
            <label className="flex items-center gap-2.5 p-3 rounded-xl bg-purple-50/70 border border-purple-200 cursor-pointer">
              <input
                type="checkbox"
                checked={autoGenerateAI}
                onChange={(e) => setAutoGenerateAI(e.target.checked)}
                className="w-4 h-4 accent-purple-600 rounded"
              />
              <div className="text-xs">
                <span className="font-bold text-purple-950 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                  Generate AI Event Plan Automatically
                </span>
                <p className="text-slate-500 text-[11px]">
                  Uses Gemini AI to immediately draft theme concepts, decor styling, menu courses, and hourly flow.
                </p>
              </div>
            </label>
          )}

          {/* Submit Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-purple-50">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-xs sm:text-sm font-semibold shadow-md shadow-purple-500/20 transition cursor-pointer flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>{isEditing ? 'Save Changes' : 'Create & Plan Event'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
