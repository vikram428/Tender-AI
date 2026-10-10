import React, { useState } from 'react';
import { useTender } from '../context/TenderContext';
import { calculateDaysRemaining } from '../utils/calculations';
import { TenderDeadline } from '../types/tender';
import { EmptyState } from '../components/common/EmptyState';
import {
  CalendarClock,
  Clock,
  Plus,
  Download,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  X,
  MapPin
} from 'lucide-react';

export const DeadlineTracker: React.FC = () => {
  const { activeTender, updateTender, showNotification, setCurrentPage } = useTender();

  const [showAddModal, setShowAddModal] = useState(false);
  const [newMilestone, setNewMilestone] = useState('');
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('11:00 AM IST');
  const [newType, setNewType] = useState<TenderDeadline['type']>('submission');
  const [newNotes, setNewNotes] = useState('');
  const [newLocation, setNewLocation] = useState('');

  if (!activeTender) {
    return (
      <EmptyState
        title="No Active Tender in Workspace"
        description="Select a tender to view its critical procurement dates, or upload your first tender."
        actionLabel="Upload New Tender"
        onAction={() => setCurrentPage('upload')}
      />
    );
  }

  const deadlines = activeTender.deadlines || [];

  const handleAddMilestone = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMilestone.trim() || !newDate.trim()) {
      showNotification('Please provide milestone title and date.', 'warning');
      return;
    }

    const created: TenderDeadline = {
      id: `dl-custom-${Date.now()}`,
      milestone: newMilestone,
      date: newDate,
      time: newTime,
      type: newType,
      status: 'upcoming',
      notes: newNotes,
      location: newLocation || activeTender.workLocation
    };

    updateTender({
      ...activeTender,
      deadlines: [...deadlines, created]
    });

    setShowAddModal(false);
    setNewMilestone('');
    setNewDate('');
    setNewNotes('');
    showNotification('Procurement milestone added.', 'success');
  };

  const exportICal = () => {
    const calendarEvents = deadlines.map(d => {
      const cleanDate = d.date.replace(/-/g, '');
      return `BEGIN:VEVENT
SUMMARY:${d.milestone} [${activeTender.nitNumber}]
DESCRIPTION:${d.notes || ''}
LOCATION:${d.location || activeTender.workLocation}
DTSTART;VALUE=DATE:${cleanDate}
DTEND;VALUE=DATE:${cleanDate}
STATUS:CONFIRMED
END:VEVENT`;
    }).join('\n');

    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//TenderAI//Civil Engineering Milestones//EN
CALSCALE:GREGORIAN
${calendarEvents}
END:VCALENDAR`;

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Deadlines_${activeTender.nitNumber.replace(/[\/\\]/g, '_')}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showNotification('Exported iCal schedule for Google Calendar / Outlook.', 'success');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-slate-800 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 mb-1">
            <span>PROCUREMENT TIMELINE</span>
            <span className="text-slate-600">/</span>
            <span>{activeTender.nitNumber}</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-100">
            Critical Tender Deadlines & Milestones
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Track statutory deadlines, pre-bid clarification cutoffs, EMD physical deposits, and technical bid openings.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={exportICal}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded transition-colors whitespace-nowrap"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span>Export iCal Calendar (.ics)</span>
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded transition-colors whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Milestone</span>
          </button>
        </div>
      </div>

      {/* Deadlines List */}
      <div className="space-y-3">
        {deadlines.map((dl) => {
          const daysInfo = calculateDaysRemaining(dl.date);

          return (
            <div
              key={dl.id}
              className="p-4 bg-[#0E1726] border border-slate-800 rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-slate-700 transition-colors"
            >
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-100">{dl.milestone}</span>
                  <span className="text-[11px] font-mono text-slate-500 uppercase">
                    [{dl.type}]
                  </span>
                </div>

                <div className="flex items-center gap-4 text-xs text-slate-400">
                  <div className="flex items-center gap-1.5 font-mono text-slate-300">
                    <Calendar className="w-3.5 h-3.5 text-amber-400" />
                    <span>{dl.date}</span>
                    {dl.time && <span>· {dl.time}</span>}
                  </div>

                  {dl.location && (
                    <div className="flex items-center gap-1 text-slate-400 text-[11px]">
                      <MapPin className="w-3 h-3 text-slate-500" />
                      <span>{dl.location}</span>
                    </div>
                  )}
                </div>

                {dl.notes && (
                  <p className="text-[11px] text-slate-400 pt-0.5">
                    {dl.notes}
                  </p>
                )}
              </div>

              {/* Status pill-free indicator */}
              <div className="text-right shrink-0">
                <div className={`text-sm font-bold font-mono tabular-nums ${daysInfo.isOverdue ? 'text-rose-400' : daysInfo.days <= 7 ? 'text-amber-400' : 'text-cyan-400'}`}>
                  {daysInfo.label}
                </div>
                <div className="text-[10px] font-mono text-slate-500 mt-0.5 uppercase">
                  {daysInfo.isOverdue ? 'EXPIRED' : daysInfo.days <= 7 ? 'URGENT ATTENTION' : 'SCHEDULED'}
                </div>
              </div>
            </div>
          );
        })}

        {deadlines.length === 0 && (
          <EmptyState
            title="No Milestones Defined"
            description="Add procurement milestones or upload a tender notice containing scheduling provisions."
            actionLabel="Add First Milestone"
            onAction={() => setShowAddModal(true)}
          />
        )}
      </div>

      {/* Add Milestone Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0E1726] border border-slate-700 rounded-lg max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-semibold text-slate-100">Add Procurement Milestone</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-200">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddMilestone} className="space-y-3 text-xs">
              <div>
                <label className="text-[11px] font-mono text-slate-400 block mb-1">MILESTONE EVENT</label>
                <input
                  type="text"
                  value={newMilestone}
                  onChange={(e) => setNewMilestone(e.target.value)}
                  placeholder="e.g. Joint Site Inspection with EE"
                  className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-slate-200 font-mono focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-mono text-slate-400 block mb-1">DATE</label>
                  <input
                    type="date"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-slate-200 font-mono focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-mono text-slate-400 block mb-1">TIME</label>
                  <input
                    type="text"
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    placeholder="11:00 AM IST"
                    className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-slate-200 font-mono focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-mono text-slate-400 block mb-1">TYPE</label>
                <select
                  value={newType}
                  onChange={(e) => setNewType(e.target.value as any)}
                  className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-slate-200 font-mono focus:outline-none focus:border-amber-400"
                >
                  <option value="submission">Submission Deadline</option>
                  <option value="prebid">Pre-Bid Meeting</option>
                  <option value="clarification">Query Clarification Cutoff</option>
                  <option value="emd">EMD Hardcopy Deposit</option>
                  <option value="opening">Technical / Financial Bid Opening</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-mono text-slate-400 block mb-1">LOCATION / VENUE</label>
                <input
                  type="text"
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
                  placeholder="e.g. Office of the SE, CPWD"
                  className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-slate-200 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="text-[11px] font-mono text-slate-400 block mb-1">REMARKS / INSTRUCTIONS</label>
                <textarea
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="Mandatory documents to bring, fee instruments..."
                  rows={2}
                  className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-slate-200 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-semibold rounded"
                >
                  Save Milestone
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
