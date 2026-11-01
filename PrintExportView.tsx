import React from 'react';
import { EventData } from '../types/event';
import { formatCurrency, formatDate } from '../utils/formatters';

interface PrintExportViewProps {
  event: EventData;
}

export const PrintExportView: React.FC<PrintExportViewProps> = ({ event }) => {
  const plan = event.plan;
  const totalActual = event.budgetCategories.reduce(
    (sum, c) => sum + c.items.reduce((s, it) => s + (it.actualCost || 0), 0),
    0
  );

  return (
    <div className="hidden print:block p-8 bg-white text-black max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="border-b-2 border-black pb-4 text-center">
        <h1 className="text-3xl font-extrabold uppercase tracking-wide">
          EventEase AI – Event Blueprint
        </h1>
        <p className="text-sm font-semibold mt-1">{event.name}</p>
        <p className="text-xs text-slate-600">
          Type: {event.eventType.toUpperCase()} • Date: {formatDate(event.date)} • Location: {event.location} • Guests: {event.guestCount}
        </p>
      </div>

      {/* AI Theme Concept */}
      {plan && (
        <div className="space-y-3 pb-4 border-b border-slate-200">
          <h2 className="text-lg font-bold">1. Event Concept & Aesthetic</h2>
          <p className="text-sm font-bold">Theme: "{plan.themeTitle}" — {plan.tagline}</p>
          <p className="text-xs text-slate-700">{plan.conceptDescription}</p>

          <div className="mt-2">
            <p className="text-xs font-bold">Color Palette:</p>
            <p className="text-xs text-slate-600">
              {plan.colorPalette.map((c) => `${c.name} (${c.hex}) - ${c.role}`).join(' • ')}
            </p>
          </div>
        </div>
      )}

      {/* Budget Summary */}
      <div className="space-y-3 pb-4 border-b border-slate-200">
        <h2 className="text-lg font-bold">2. Budget Breakdown</h2>
        <p className="text-xs">
          Total Target Budget: <span className="font-bold">{formatCurrency(event.totalBudget, event.currency)}</span> |
          Spent to Date: <span className="font-bold">{formatCurrency(totalActual, event.currency)}</span> |
          Remaining: <span className="font-bold">{formatCurrency(event.totalBudget - totalActual, event.currency)}</span>
        </p>

        <table className="w-full text-xs text-left mt-2 border border-slate-300">
          <thead>
            <tr className="bg-slate-100 border-b border-slate-300">
              <th className="p-1.5 font-bold">Category</th>
              <th className="p-1.5 font-bold">Allocation</th>
              <th className="p-1.5 font-bold">Actual Spent</th>
              <th className="p-1.5 font-bold">Key Line Items</th>
            </tr>
          </thead>
          <tbody>
            {event.budgetCategories.map((cat) => {
              const spent = cat.items.reduce((s, it) => s + (it.actualCost || 0), 0);
              return (
                <tr key={cat.id} className="border-b border-slate-200">
                  <td className="p-1.5 font-semibold">{cat.name}</td>
                  <td className="p-1.5">{formatCurrency(cat.allocatedAmount, event.currency)} ({cat.percentage}%)</td>
                  <td className="p-1.5">{formatCurrency(spent, event.currency)}</td>
                  <td className="p-1.5 text-slate-600">
                    {cat.items.map((i) => `${i.name} (${formatCurrency(i.actualCost || i.estimatedCost, event.currency)})`).join(', ')}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Schedule */}
      {plan?.scheduleFlow && (
        <div className="space-y-2 pb-4 border-b border-slate-200">
          <h2 className="text-lg font-bold">3. Day-of Run of Show</h2>
          <table className="w-full text-xs text-left border border-slate-300">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-300">
                <th className="p-1.5 font-bold w-24">Time</th>
                <th className="p-1.5 font-bold">Activity</th>
                <th className="p-1.5 font-bold">Description</th>
              </tr>
            </thead>
            <tbody>
              {plan.scheduleFlow.map((s, i) => (
                <tr key={i} className="border-b border-slate-200">
                  <td className="p-1.5 font-bold font-mono">{s.time}</td>
                  <td className="p-1.5 font-semibold">{s.activity}</td>
                  <td className="p-1.5 text-slate-600">{s.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Key Vendors */}
      <div className="space-y-2 pb-4 border-b border-slate-200">
        <h2 className="text-lg font-bold">4. Key Vendor Contacts</h2>
        <table className="w-full text-xs text-left border border-slate-300">
          <thead>
            <tr className="bg-slate-100 border-b border-slate-300">
              <th className="p-1.5 font-bold">Role / Task</th>
              <th className="p-1.5 font-bold">Vendor Name</th>
              <th className="p-1.5 font-bold">Contact</th>
              <th className="p-1.5 font-bold">Quote</th>
              <th className="p-1.5 font-bold">Status</th>
            </tr>
          </thead>
          <tbody>
            {event.vendors.map((v) => (
              <tr key={v.id} className="border-b border-slate-200">
                <td className="p-1.5 font-semibold">{v.task}</td>
                <td className="p-1.5">{v.vendorName || 'TBD'}</td>
                <td className="p-1.5 font-mono text-[11px]">{v.contactInfo || '—'}</td>
                <td className="p-1.5">{v.quoteAmount ? formatCurrency(v.quoteAmount, event.currency) : '—'}</td>
                <td className="p-1.5 capitalize font-medium">{v.status.replace('_', ' ')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="pt-2 text-center text-[10px] text-slate-400">
        Generated by EventEase AI • Smart Event Planner
      </div>
    </div>
  );
};
