import React, { useState } from 'react';
import {
  Briefcase,
  Plus,
  Trash2,
  CheckCircle2,
  Phone,
  Mail,
  DollarSign,
  Filter,
  CheckSquare,
  Building,
  Utensils,
  Sparkles,
  Camera,
  Music,
  Truck,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { EventData, VendorCategoryType, VendorStatus, VendorTask } from '../types/event';
import { formatCurrency } from '../utils/formatters';

interface VendorChecklistViewProps {
  event: EventData;
  onUpdateVendors: (vendors: VendorTask[]) => void;
}

export const VendorChecklistView: React.FC<VendorChecklistViewProps> = ({
  event,
  onUpdateVendors,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);

  // New vendor task form
  const [newCategory, setNewCategory] = useState<VendorCategoryType>('caterer');
  const [newTask, setNewTask] = useState('');
  const [newVendorName, setNewVendorName] = useState('');
  const [newContactInfo, setNewContactInfo] = useState('');
  const [newQuoteAmount, setNewQuoteAmount] = useState('');
  const [newStatus, setNewStatus] = useState<VendorStatus>('not_started');
  const [newNotes, setNewNotes] = useState('');
  const [formError, setFormError] = useState('');

  const vendors = event.vendors;

  // Stats
  const completedVendors = vendors.filter((v) => v.isCompleted || v.status === 'completed');
  const bookedVendors = vendors.filter((v) => v.status === 'booked' || v.status === 'completed');
  const totalQuoteSum = vendors.reduce((sum, v) => sum + (v.quoteAmount || 0), 0);

  // Toggle complete
  const handleToggle = (id: string) => {
    const updated = vendors.map((v) => {
      if (v.id === id) {
        const nextState = !v.isCompleted;
        if (nextState) {
          confetti({
            particleCount: 35,
            spread: 50,
            origin: { y: 0.8 },
            colors: ['#a855f7', '#8b5cf6', '#c084fc'],
          });
        }
        return {
          ...v,
          isCompleted: nextState,
          status: nextState ? ('completed' as VendorStatus) : v.status,
        };
      }
      return v;
    });
    onUpdateVendors(updated);
  };

  // Update status or fields
  const handleUpdate = (id: string, changes: Partial<VendorTask>) => {
    const updated = vendors.map((v) => (v.id === id ? { ...v, ...changes } : v));
    onUpdateVendors(updated);
  };

  // Delete vendor task
  const handleDelete = (id: string) => {
    const updated = vendors.filter((v) => v.id !== id);
    onUpdateVendors(updated);
  };

  // Add new vendor task
  const handleAddVendor = () => {
    if (!newTask.trim()) {
      setFormError('Task or role title is required');
      return;
    }

    const categoryLabels: Record<VendorCategoryType, string> = {
      venue: 'Venue',
      caterer: 'Catering',
      decorator: 'Decor & Florals',
      photographer: 'Photography',
      entertainment: 'Entertainment',
      logistics: 'Logistics',
      other: 'Other Vendor',
    };

    const newVendor: VendorTask = {
      id: `vendor-${Date.now()}`,
      category: newCategory,
      categoryLabel: categoryLabels[newCategory] || 'Vendor',
      task: newTask.trim(),
      vendorName: newVendorName.trim() || undefined,
      contactInfo: newContactInfo.trim() || undefined,
      quoteAmount: parseFloat(newQuoteAmount) || 0,
      status: newStatus,
      notes: newNotes.trim() || undefined,
      isCompleted: newStatus === 'completed',
    };

    onUpdateVendors([...vendors, newVendor]);

    // Reset
    setNewTask('');
    setNewVendorName('');
    setNewContactInfo('');
    setNewQuoteAmount('');
    setNewNotes('');
    setNewStatus('not_started');
    setFormError('');
    setShowAddModal(false);
  };

  const getCategoryIcon = (category: VendorCategoryType) => {
    switch (category) {
      case 'venue':
        return <Building className="w-4 h-4 text-purple-600" />;
      case 'caterer':
        return <Utensils className="w-4 h-4 text-orange-600" />;
      case 'decorator':
        return <Sparkles className="w-4 h-4 text-pink-600" />;
      case 'photographer':
        return <Camera className="w-4 h-4 text-blue-600" />;
      case 'entertainment':
        return <Music className="w-4 h-4 text-indigo-600" />;
      default:
        return <Truck className="w-4 h-4 text-slate-600" />;
    }
  };

  const getStatusBadge = (status: VendorStatus) => {
    switch (status) {
      case 'booked':
      case 'completed':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'shortlisted':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'contacted':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const filteredVendors = vendors.filter((v) => {
    if (selectedCategory !== 'all' && v.category !== selectedCategory) return false;
    if (selectedStatus !== 'all') {
      if (selectedStatus === 'completed') return v.isCompleted || v.status === 'completed';
      if (selectedStatus === 'booked') return v.status === 'booked';
      if (selectedStatus === 'shortlisted') return v.status === 'shortlisted';
      if (selectedStatus === 'contacted') return v.status === 'contacted';
      if (selectedStatus === 'not_started') return v.status === 'not_started';
    }
    return true;
  });

  return (
    <div className="space-y-8">
      {/* Header & Stats */}
      <div className="p-6 rounded-3xl bg-white border border-purple-100 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-purple-50">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-purple-100 text-purple-700">
                <Briefcase className="w-5 h-5" />
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                Vendor Checklist & Coordinator
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Track caterers, decorators, photographers, venues, and entertainment contracts
            </p>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs sm:text-sm font-semibold shadow-xs transition cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Add Vendor Task</span>
          </button>
        </div>

        {/* 3 Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="p-4 rounded-2xl bg-purple-50/50 border border-purple-100">
            <span className="text-xs font-semibold text-slate-500">Total Vendors Tracked</span>
            <p className="text-2xl font-extrabold text-slate-900 mt-1">{vendors.length}</p>
            <p className="text-[11px] text-slate-500 mt-0.5">Across all core categories</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-100">
            <span className="text-xs font-semibold text-slate-500">Booked & Confirmed</span>
            <p className="text-2xl font-extrabold text-purple-700 mt-1">{bookedVendors.length}</p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {Math.round((bookedVendors.length / (vendors.length || 1)) * 100)}% of vendor roster
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-100">
            <span className="text-xs font-semibold text-slate-500">Committed Quotes</span>
            <p className="text-2xl font-extrabold text-slate-900 mt-1">
              {formatCurrency(totalQuoteSum, event.currency)}
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">Total contracted amounts</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs pt-4 border-t border-purple-50">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            <span className="text-slate-400 font-semibold mr-1 flex items-center gap-1">
              <Filter className="w-3 h-3" /> Filter:
            </span>
            {[
              { id: 'all', label: 'All' },
              { id: 'venue', label: 'Venues' },
              { id: 'caterer', label: 'Caterers' },
              { id: 'decorator', label: 'Decorators' },
              { id: 'photographer', label: 'Photographers' },
              { id: 'entertainment', label: 'Entertainment' },
              { id: 'logistics', label: 'Logistics' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedCategory(tab.id)}
                className={`px-3 py-1.5 rounded-xl font-medium whitespace-nowrap transition cursor-pointer ${
                  selectedCategory === tab.id
                    ? 'bg-purple-600 text-white font-semibold'
                    : 'bg-purple-50/50 text-slate-600 hover:bg-purple-100/70'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-purple-200 text-xs font-medium bg-white text-slate-700"
          >
            <option value="all">All Statuses</option>
            <option value="not_started">Not Started</option>
            <option value="contacted">Contacted</option>
            <option value="shortlisted">Shortlisted</option>
            <option value="booked">Booked</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

      {/* Add Vendor Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-purple-100 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-purple-50">
              <h3 className="text-lg font-bold text-slate-900">Add Vendor Checklist Task</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {formError && (
              <p className="text-xs text-rose-600 font-semibold mt-3">{formError}</p>
            )}

            <div className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Vendor Category
                </label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as VendorCategoryType)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-purple-200"
                >
                  <option value="venue">Venue</option>
                  <option value="caterer">Catering & Bar</option>
                  <option value="decorator">Decor & Florals</option>
                  <option value="photographer">Photography & Video</option>
                  <option value="entertainment">Music & DJ / Entertainment</option>
                  <option value="logistics">Logistics & Transportation</option>
                  <option value="other">Other / Miscellaneous</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Task / Role Required *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Book acoustic ceremony guitarist or cake bakery"
                  value={newTask}
                  onChange={(e) => setNewTask(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-purple-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Vendor Business Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Sweet Bloom Bakery"
                    value={newVendorName}
                    onChange={(e) => setNewVendorName(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-purple-200"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Quote Amount ({event.currency})
                  </label>
                  <input
                    type="number"
                    placeholder="0"
                    value={newQuoteAmount}
                    onChange={(e) => setNewQuoteAmount(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-purple-200"
                    min="0"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Contact Info (Phone / Email / Website)
                </label>
                <input
                  type="text"
                  placeholder="e.g. info@sweetbloom.example / (555) 234-5678"
                  value={newContactInfo}
                  onChange={(e) => setNewContactInfo(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-purple-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Initial Status
                  </label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as VendorStatus)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-purple-200"
                  >
                    <option value="not_started">Not Started</option>
                    <option value="contacted">Contacted</option>
                    <option value="shortlisted">Shortlisted</option>
                    <option value="booked">Booked</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Special Notes
                  </label>
                  <input
                    type="text"
                    placeholder="Contract conditions or tasting notes"
                    value={newNotes}
                    onChange={(e) => setNewNotes(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-purple-200"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-purple-50">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddVendor}
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold transition cursor-pointer"
                >
                  Save Vendor
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Vendor Cards List */}
      <div className="space-y-4">
        {filteredVendors.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-3xl border border-purple-100 text-slate-400 text-xs">
            No vendors match your current filter.
          </div>
        ) : (
          filteredVendors.map((v) => (
            <div
              key={v.id}
              className={`p-5 rounded-2xl bg-white border transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                v.isCompleted || v.status === 'completed'
                  ? 'border-slate-100 bg-slate-50/50 opacity-70'
                  : 'border-purple-100/90 hover:border-purple-300 shadow-xs hover:shadow-md'
              }`}
            >
              <div className="flex items-start gap-3.5 flex-1 min-w-0">
                <button
                  onClick={() => handleToggle(v.id)}
                  className="mt-0.5 text-purple-600 hover:text-purple-700 cursor-pointer shrink-0"
                  title={v.isCompleted ? 'Mark incomplete' : 'Mark task completed'}
                >
                  <CheckCircle2
                    className={`w-5 h-5 ${
                      v.isCompleted || v.status === 'completed'
                        ? 'fill-purple-600 text-white'
                        : 'text-slate-300 hover:text-purple-400'
                    }`}
                  />
                </button>

                <div className="space-y-1.5 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="p-1 rounded-md bg-purple-50 text-purple-700">
                      {getCategoryIcon(v.category)}
                    </span>
                    <span
                      className={`text-sm font-bold ${
                        v.isCompleted ? 'line-through text-slate-400' : 'text-slate-900'
                      }`}
                    >
                      {v.task}
                    </span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800">
                      {v.categoryLabel}
                    </span>
                  </div>

                  {v.vendorName && (
                    <p className="text-xs font-semibold text-slate-800">
                      Partner: <span className="text-purple-900">{v.vendorName}</span>
                    </p>
                  )}

                  {v.contactInfo && (
                    <p className="text-xs text-slate-500 flex items-center gap-1.5">
                      <span>Contact:</span>
                      <span className="font-mono text-purple-800">{v.contactInfo}</span>
                    </p>
                  )}

                  {v.notes && (
                    <p className="text-xs text-slate-600 italic bg-purple-50/40 px-2.5 py-1 rounded-lg inline-block border border-purple-100/60">
                      "{v.notes}"
                    </p>
                  )}
                </div>
              </div>

              {/* Status & Quote actions */}
              <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                {v.quoteAmount ? (
                  <div className="text-right">
                    <span className="text-xs font-extrabold text-slate-900">
                      {formatCurrency(v.quoteAmount, event.currency)}
                    </span>
                    <p className="text-[10px] text-slate-400">Quoted</p>
                  </div>
                ) : null}

                <select
                  value={v.status}
                  onChange={(e) => handleUpdate(v.id, { status: e.target.value as VendorStatus })}
                  className={`text-xs font-semibold px-2.5 py-1 rounded-full border cursor-pointer capitalize ${getStatusBadge(
                    v.status
                  )}`}
                >
                  <option value="not_started">Not Started</option>
                  <option value="contacted">Contacted</option>
                  <option value="shortlisted">Shortlisted</option>
                  <option value="booked">Booked</option>
                  <option value="completed">Completed</option>
                </select>

                <button
                  onClick={() => handleDelete(v.id)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition cursor-pointer"
                  title="Delete vendor task"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
