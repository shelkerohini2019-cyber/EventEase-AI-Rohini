import React, { useState } from 'react';
import {
  DollarSign,
  Plus,
  Trash2,
  AlertTriangle,
  CheckCircle,
  HelpCircle,
  RotateCcw,
  Sparkles,
  PieChart,
  ArrowUpDown,
  Tag,
  Check,
  TrendingDown,
  TrendingUp,
  Receipt,
  Users,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { BudgetCategory, BudgetLineItem, EventData } from '../types/event';
import { formatCurrency } from '../utils/formatters';
import { DEFAULT_BUDGET_PERCENTAGES } from '../data/eventDefaults';
import { aiAllocateBudget } from '../services/api';

interface BudgetPlannerViewProps {
  event: EventData;
  onUpdateBudgetCategories: (categories: BudgetCategory[]) => void;
  onUpdateTotalBudget: (newBudget: number) => void;
}

export const BudgetPlannerView: React.FC<BudgetPlannerViewProps> = ({
  event,
  onUpdateBudgetCategories,
  onUpdateTotalBudget,
}) => {
  const [editingBudgetValue, setEditingBudgetValue] = useState<string>(event.totalBudget.toString());
  const [isEditingBudget, setIsEditingBudget] = useState(false);
  const [activeCategoryIdForNewItem, setActiveCategoryIdForNewItem] = useState<string | null>(null);
  const [isAutoAllocating, setIsAutoAllocating] = useState(false);
  const [aiNotice, setAiNotice] = useState<string | null>(null);

  // New item form state
  const [newItemName, setNewItemName] = useState('');
  const [newItemEstimated, setNewItemEstimated] = useState('');
  const [newItemActual, setNewItemActual] = useState('');
  const [newItemStatus, setNewItemStatus] = useState<BudgetLineItem['status']>('pending');
  const [newItemNotes, setNewItemNotes] = useState('');
  const [formError, setFormError] = useState('');

  // Calculations
  const totalBudget = event.totalBudget || 0;
  const categories = event.budgetCategories;

  const totalAllocated = categories.reduce((sum, c) => sum + (c.allocatedAmount || 0), 0);
  const totalEstimatedItems = categories.reduce(
    (sum, c) => sum + c.items.reduce((s, it) => s + (it.estimatedCost || 0), 0),
    0
  );
  const totalActualSpent = categories.reduce(
    (sum, c) => sum + c.items.reduce((s, it) => s + (it.actualCost || 0), 0),
    0
  );
  const remainingBudget = totalBudget - totalActualSpent;
  const isOverBudget = remainingBudget < 0;

  // Headcount cost calculations
  const costPerGuestPlanned = event.guestCount > 0 ? Math.round(totalBudget / event.guestCount) : 0;
  const costPerGuestActual = event.guestCount > 0 ? Math.round(totalActualSpent / event.guestCount) : 0;

  // Handle saving new total budget
  const handleSaveTotalBudget = () => {
    const parsed = parseFloat(editingBudgetValue);
    if (isNaN(parsed) || parsed < 0) return;
    onUpdateTotalBudget(parsed);

    // Recalculate allocatedAmounts based on category percentages
    const updated = categories.map((cat) => ({
      ...cat,
      allocatedAmount: Math.round((parsed * cat.percentage) / 100),
    }));
    onUpdateBudgetCategories(updated);
    setIsEditingBudget(false);
  };

  // AI Auto-Allocate Budget
  const handleAIAutoAllocate = async () => {
    setIsAutoAllocating(true);
    setAiNotice(null);
    try {
      const res = await aiAllocateBudget({
        eventType: event.eventType,
        totalBudget: event.totalBudget,
        currency: event.currency,
        guestCount: event.guestCount,
        location: event.location,
        vibePreference: event.vibePreference,
      });

      if (res.categories && res.categories.length > 0) {
        // Merge with existing icon references
        const mergedCategories: BudgetCategory[] = res.categories.map((aiCat: any) => {
          const existing = categories.find((c) => c.id === aiCat.id);
          return {
            id: aiCat.id,
            name: aiCat.name || existing?.name || aiCat.id,
            icon: existing?.icon || 'PieChart',
            percentage: Number(aiCat.percentage) || existing?.percentage || 15,
            allocatedAmount: Number(aiCat.allocatedAmount) || Math.round((totalBudget * (aiCat.percentage || 15)) / 100),
            items: Array.isArray(aiCat.items) && aiCat.items.length > 0
              ? aiCat.items.map((it: any, i: number) => ({
                  id: it.id || `ai-${aiCat.id}-${i}`,
                  name: it.name,
                  estimatedCost: Number(it.estimatedCost) || 0,
                  actualCost: Number(it.actualCost) || 0,
                  status: it.status || 'pending',
                }))
              : existing?.items || [],
          };
        });

        onUpdateBudgetCategories(mergedCategories);
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 },
        });
        setAiNotice(res.message || 'Budget auto-allocated by Gemini AI with custom line-item estimates!');
      } else {
        // Fallback to benchmarks
        handleResetToDefaults();
        setAiNotice('Budget allocations updated based on verified market benchmarks for your event type.');
      }
    } catch (err: any) {
      handleResetToDefaults();
      setAiNotice('Market benchmark allocations applied.');
    } finally {
      setIsAutoAllocating(false);
      setTimeout(() => setAiNotice(null), 5000);
    }
  };

  // Handle adding an item to a category
  const handleAddItem = (categoryId: string) => {
    if (!newItemName.trim()) {
      setFormError('Item name is required');
      return;
    }
    const est = parseFloat(newItemEstimated) || 0;
    const act = parseFloat(newItemActual) || 0;

    const newItem: BudgetLineItem = {
      id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      name: newItemName.trim(),
      estimatedCost: est,
      actualCost: act,
      status: newItemStatus,
      notes: newItemNotes.trim() || undefined,
    };

    const updated = categories.map((cat) => {
      if (cat.id === categoryId) {
        return {
          ...cat,
          items: [...cat.items, newItem],
        };
      }
      return cat;
    });

    onUpdateBudgetCategories(updated);
    // Reset form
    setNewItemName('');
    setNewItemEstimated('');
    setNewItemActual('');
    setNewItemNotes('');
    setNewItemStatus('pending');
    setActiveCategoryIdForNewItem(null);
    setFormError('');
  };

  // Handle updating an existing line item
  const handleUpdateItem = (
    categoryId: string,
    itemId: string,
    changes: Partial<BudgetLineItem>
  ) => {
    const updated = categories.map((cat) => {
      if (cat.id === categoryId) {
        return {
          ...cat,
          items: cat.items.map((it) => (it.id === itemId ? { ...it, ...changes } : it)),
        };
      }
      return cat;
    });
    onUpdateBudgetCategories(updated);
  };

  // Handle deleting an item
  const handleDeleteItem = (categoryId: string, itemId: string) => {
    const updated = categories.map((cat) => {
      if (cat.id === categoryId) {
        return {
          ...cat,
          items: cat.items.filter((it) => it.id !== itemId),
        };
      }
      return cat;
    });
    onUpdateBudgetCategories(updated);
  };

  // Handle resetting budget allocation to defaults
  const handleResetToDefaults = () => {
    const defaults = DEFAULT_BUDGET_PERCENTAGES[event.eventType] || DEFAULT_BUDGET_PERCENTAGES.wedding;
    const updated = categories.map((cat) => {
      const match = defaults.find((d) => d.id === cat.id);
      const percentage = match ? match.percentage : cat.percentage;
      return {
        ...cat,
        percentage,
        allocatedAmount: Math.round((totalBudget * percentage) / 100),
      };
    });
    onUpdateBudgetCategories(updated);
  };

  // Category percentage slider update
  const handleCategoryPercentageChange = (categoryId: string, newPercentage: number) => {
    const updated = categories.map((cat) => {
      if (cat.id === categoryId) {
        return {
          ...cat,
          percentage: newPercentage,
          allocatedAmount: Math.round((totalBudget * newPercentage) / 100),
        };
      }
      return cat;
    });
    onUpdateBudgetCategories(updated);
  };

  const getStatusBadge = (status: BudgetLineItem['status']) => {
    switch (status) {
      case 'paid':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'booked':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'quoted':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'pending':
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-8">
      {/* Header & Financial Control Panel */}
      <div className="p-6 rounded-3xl bg-white border border-purple-100 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-6 border-b border-purple-50">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-purple-100 text-purple-700">
                <PieChart className="w-5 h-5" />
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                AI Budget Planner & Expense Tracker
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Automatic expense calculations, planned vs actual tracking, and per-guest metrics
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleAIAutoAllocate}
              disabled={isAutoAllocating}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-xs sm:text-sm font-semibold shadow-xs transition cursor-pointer disabled:opacity-50"
              title="Automatically distribute budget and calculate line items with Gemini AI"
            >
              <Sparkles className={`w-4 h-4 ${isAutoAllocating ? 'animate-spin' : ''}`} />
              <span>{isAutoAllocating ? 'Optimizing...' : 'AI Auto-Allocate'}</span>
            </button>

            <button
              onClick={handleResetToDefaults}
              className="text-xs font-semibold text-slate-600 hover:text-purple-700 flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 hover:bg-purple-50 transition cursor-pointer"
              title="Reset percentage allocations to standard industry benchmarks"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reset Benchmarks</span>
            </button>
          </div>
        </div>

        {/* AI Notice Banner */}
        {aiNotice && (
          <div className="mb-6 p-3.5 rounded-2xl bg-purple-50 border border-purple-200 text-xs font-semibold text-purple-900 flex items-center gap-2 animate-in fade-in">
            <Sparkles className="w-4 h-4 text-purple-600 shrink-0" />
            <span>{aiNotice}</span>
          </div>
        )}

        {/* 4 Financial Stat Blocks */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Budget Card */}
          <div className="p-4 rounded-2xl bg-purple-50/50 border border-purple-100">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span className="font-semibold">Target Budget</span>
              <button
                onClick={() => {
                  setEditingBudgetValue(totalBudget.toString());
                  setIsEditingBudget(!isEditingBudget);
                }}
                className="text-[11px] font-bold text-purple-700 hover:underline cursor-pointer"
              >
                {isEditingBudget ? 'Cancel' : 'Edit'}
              </button>
            </div>

            {isEditingBudget ? (
              <div className="flex items-center gap-1.5 mt-1">
                <input
                  type="number"
                  value={editingBudgetValue}
                  onChange={(e) => setEditingBudgetValue(e.target.value)}
                  className="w-full px-2 py-1 text-sm border border-purple-300 rounded-lg bg-white"
                  min="0"
                />
                <button
                  onClick={handleSaveTotalBudget}
                  className="px-2 py-1 bg-purple-600 text-white rounded-lg text-xs font-bold hover:bg-purple-700 cursor-pointer"
                >
                  Save
                </button>
              </div>
            ) : (
              <p className="text-xl font-extrabold text-slate-900">
                {formatCurrency(totalBudget, event.currency)}
              </p>
            )}
            <p className="text-[11px] text-slate-500 mt-1">
              Est. {formatCurrency(costPerGuestPlanned, event.currency)} / guest
            </p>
          </div>

          {/* Planned Allocations */}
          <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-100">
            <span className="text-xs font-semibold text-slate-500">Planned Allocations</span>
            <p className="text-xl font-extrabold text-slate-900 mt-1">
              {formatCurrency(totalAllocated, event.currency)}
            </p>
            <p className="text-[11px] text-slate-500 mt-1">
              Item estimates: {formatCurrency(totalEstimatedItems, event.currency)}
            </p>
          </div>

          {/* Actual Spend */}
          <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-100">
            <span className="text-xs font-semibold text-slate-500">Actual Total Spend</span>
            <p className="text-xl font-extrabold text-slate-900 mt-1">
              {formatCurrency(totalActualSpent, event.currency)}
            </p>
            <p className="text-[11px] text-slate-500 mt-1">
              Actual {formatCurrency(costPerGuestActual, event.currency)} / guest
            </p>
          </div>

          {/* Remaining Balance */}
          <div
            className={`p-4 rounded-2xl border ${
              isOverBudget
                ? 'bg-rose-50/60 border-rose-200 text-rose-900'
                : 'bg-emerald-50/50 border-emerald-200 text-emerald-950'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold">Remaining Funds</span>
              {isOverBudget && <AlertTriangle className="w-4 h-4 text-rose-600" />}
            </div>
            <p
              className={`text-xl font-extrabold mt-1 ${
                isOverBudget ? 'text-rose-600' : 'text-emerald-700'
              }`}
            >
              {formatCurrency(remainingBudget, event.currency)}
            </p>
            <p className="text-[11px] opacity-80 mt-1">
              {isOverBudget ? 'Exceeds budget target' : 'Available balance'}
            </p>
          </div>
        </div>

        {/* Global Progress Bar */}
        <div className="mt-6">
          <div className="flex items-center justify-between text-xs mb-1.5 font-medium text-slate-600">
            <span>Budget Spent: {Math.round((totalActualSpent / (totalBudget || 1)) * 100)}%</span>
            <span>Max Cap: {formatCurrency(totalBudget, event.currency)}</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden flex border border-slate-200/60">
            {categories.map((cat, idx) => {
              const catSpent = cat.items.reduce((s, it) => s + (it.actualCost || 0), 0);
              const catRatio = totalBudget > 0 ? (catSpent / totalBudget) * 100 : 0;
              const colors = [
                'bg-purple-600',
                'bg-indigo-500',
                'bg-pink-500',
                'bg-amber-500',
                'bg-emerald-500',
                'bg-teal-500',
              ];
              const color = colors[idx % colors.length];

              if (catRatio <= 0) return null;
              return (
                <div
                  key={cat.id}
                  title={`${cat.name}: ${formatCurrency(catSpent, event.currency)}`}
                  className={`h-full ${color}`}
                  style={{ width: `${catRatio}%` }}
                />
              );
            })}
          </div>
        </div>
      </div>

      {/* Category Breakdown Cards */}
      <div className="space-y-6">
        {categories.map((category) => {
          const catEstimated = category.items.reduce((s, it) => s + (it.estimatedCost || 0), 0);
          const catActual = category.items.reduce((s, it) => s + (it.actualCost || 0), 0);
          const catDiff = category.allocatedAmount - catActual;
          const isCatOver = catDiff < 0;

          return (
            <div
              key={category.id}
              className="p-6 rounded-3xl bg-white border border-purple-100 shadow-sm space-y-4"
            >
              {/* Category Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-purple-50">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-base sm:text-lg font-bold text-slate-900">
                      {category.name}
                    </h3>
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-700 border border-purple-200">
                      {category.percentage}% Allocation
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    Allocated: <span className="font-semibold text-slate-800">{formatCurrency(category.allocatedAmount, event.currency)}</span> •
                    Spent: <span className="font-semibold text-slate-800">{formatCurrency(catActual, event.currency)}</span> •
                    Balance:{' '}
                    <span className={`font-semibold ${isCatOver ? 'text-rose-600' : 'text-emerald-700'}`}>
                      {formatCurrency(catDiff, event.currency)}
                    </span>
                  </p>
                </div>

                {/* Percentage slider & Add Button */}
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-slate-400">Share:</span>
                    <input
                      type="range"
                      min="0"
                      max="60"
                      value={category.percentage}
                      onChange={(e) => handleCategoryPercentageChange(category.id, parseInt(e.target.value))}
                      className="w-24 accent-purple-600 cursor-pointer"
                    />
                    <span className="font-bold text-purple-700 w-8">{category.percentage}%</span>
                  </div>

                  <button
                    onClick={() => {
                      setActiveCategoryIdForNewItem(
                        activeCategoryIdForNewItem === category.id ? null : category.id
                      );
                      setFormError('');
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-semibold transition cursor-pointer border border-purple-200"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Item</span>
                  </button>
                </div>
              </div>

              {/* Inline Add Item Form if opened */}
              {activeCategoryIdForNewItem === category.id && (
                <div className="p-4 rounded-2xl bg-purple-50/50 border border-purple-200 space-y-3 animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-purple-950">
                      Add New Line Item to {category.name}
                    </span>
                    <button
                      onClick={() => setActiveCategoryIdForNewItem(null)}
                      className="text-xs text-slate-400 hover:text-slate-600"
                    >
                      Cancel
                    </button>
                  </div>

                  {formError && (
                    <p className="text-xs text-rose-600 font-medium">{formError}</p>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Item / Vendor Description *
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Centerpiece Florals or DJ Deposit"
                        value={newItemName}
                        onChange={(e) => setNewItemName(e.target.value)}
                        className="w-full px-3 py-1.5 text-xs rounded-lg border border-purple-200 bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Estimated ({event.currency})
                      </label>
                      <input
                        type="number"
                        placeholder="0"
                        value={newItemEstimated}
                        onChange={(e) => setNewItemEstimated(e.target.value)}
                        className="w-full px-3 py-1.5 text-xs rounded-lg border border-purple-200 bg-white"
                        min="0"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Actual Cost ({event.currency})
                      </label>
                      <input
                        type="number"
                        placeholder="0"
                        value={newItemActual}
                        onChange={(e) => setNewItemActual(e.target.value)}
                        className="w-full px-3 py-1.5 text-xs rounded-lg border border-purple-200 bg-white"
                        min="0"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Status
                      </label>
                      <select
                        value={newItemStatus}
                        onChange={(e) => setNewItemStatus(e.target.value as any)}
                        className="w-full px-3 py-1.5 text-xs rounded-lg border border-purple-200 bg-white"
                      >
                        <option value="pending">Pending</option>
                        <option value="quoted">Quoted</option>
                        <option value="booked">Booked</option>
                        <option value="paid">Paid</option>
                      </select>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Notes / Vendor Reference
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Optional notes or invoice #"
                          value={newItemNotes}
                          onChange={(e) => setNewItemNotes(e.target.value)}
                          className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-purple-200 bg-white"
                        />
                        <button
                          onClick={() => handleAddItem(category.id)}
                          className="px-4 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold transition cursor-pointer"
                        >
                          Save Item
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Items Table / List */}
              {category.items.length === 0 ? (
                <div className="text-center py-6 text-xs text-slate-400 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                  No line items yet. Click "+ Add Item" to itemize your {category.name} expenses.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-purple-50 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        <th className="py-2 px-3">Expense Item</th>
                        <th className="py-2 px-3">Estimated</th>
                        <th className="py-2 px-3">Actual Cost</th>
                        <th className="py-2 px-3">Status</th>
                        <th className="py-2 px-3">Notes</th>
                        <th className="py-2 px-2 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-purple-50">
                      {category.items.map((item) => (
                        <tr key={item.id} className="hover:bg-purple-50/30 transition">
                          <td className="py-2.5 px-3 font-semibold text-slate-800">
                            {item.name}
                          </td>
                          <td className="py-2.5 px-3 text-slate-600">
                            {formatCurrency(item.estimatedCost, event.currency)}
                          </td>
                          <td className="py-2.5 px-3">
                            <input
                              type="number"
                              value={item.actualCost || ''}
                              placeholder="0"
                              onChange={(e) =>
                                handleUpdateItem(category.id, item.id, {
                                  actualCost: parseFloat(e.target.value) || 0,
                                })
                              }
                              className="w-20 px-2 py-0.5 border border-purple-200 rounded text-xs font-medium text-slate-800 bg-white"
                              min="0"
                            />
                          </td>
                          <td className="py-2.5 px-3">
                            <select
                              value={item.status}
                              onChange={(e) =>
                                handleUpdateItem(category.id, item.id, {
                                  status: e.target.value as any,
                                })
                              }
                              className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border cursor-pointer capitalize ${getStatusBadge(
                                item.status
                              )}`}
                            >
                              <option value="pending">Pending</option>
                              <option value="quoted">Quoted</option>
                              <option value="booked">Booked</option>
                              <option value="paid">Paid</option>
                            </select>
                          </td>
                          <td className="py-2.5 px-3 text-slate-500 max-w-xs truncate">
                            {item.notes || '—'}
                          </td>
                          <td className="py-2.5 px-2 text-right">
                            <button
                              onClick={() => handleDeleteItem(category.id, item.id)}
                              className="p-1 text-slate-400 hover:text-rose-600 transition cursor-pointer"
                              title="Delete item"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
