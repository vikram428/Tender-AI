import React from 'react';
import { useTender, AppPage } from '../../context/TenderContext';
import {
  LayoutDashboard,
  UploadCloud,
  FileSearch,
  Layers,
  Calculator,
  CalendarClock,
  Scale,
  Search,
  GitCompare,
  FileEdit,
  Printer,
  Settings,
  HardHat,
  RotateCcw,
  MessageSquareText
} from 'lucide-react';

interface NavItem {
  id: AppPage;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  section?: string;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, section: 'Core Overview' },
  { id: 'upload', label: 'Upload Tender', icon: UploadCloud },
  { id: 'analysis', label: 'Tender Analysis', icon: FileSearch, section: 'Extraction & Engineering' },
  { id: 'boq', label: 'BOQ Management', icon: Layers },
  { id: 'estimator', label: 'Budget Estimator', icon: Calculator },
  { id: 'deadlines', label: 'Deadline Tracker', icon: CalendarClock },
  { id: 'clauses', label: 'Clause Explorer', icon: Scale },
  { id: 'chat-with-tender', label: 'Chat with Tender', icon: MessageSquareText, section: 'Tools & Intelligence' },
  { id: 'search', label: 'Document Search', icon: Search },
  { id: 'comparison', label: 'Tender Comparison', icon: GitCompare },
  { id: 'drafts', label: 'Draft Generator', icon: FileEdit },
  { id: 'reports', label: 'Reports & Export', icon: Printer },
  { id: 'settings', label: 'Settings', icon: Settings, section: 'Configuration' },
];

export const Sidebar: React.FC = () => {
  const { currentPage, setCurrentPage } = useTender();

  return (
    <aside className="w-64 border-r border-slate-800 bg-[#0E1726] flex flex-col justify-between shrink-0 h-[calc(100vh-3.5rem)] sticky top-14">
      {/* Scrollable Nav Area */}
      <div className="py-4 px-3 overflow-y-auto space-y-5">
        <div>
          <div className="px-3 pb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500 font-mono">
            <HardHat className="w-3.5 h-3.5 text-amber-400" />
            <span>Control Room</span>
          </div>

          <div className="space-y-1">
            {NAV_ITEMS.map((item, idx) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;

              return (
                <React.Fragment key={item.id}>
                  {item.section && idx !== 0 && (
                    <div className="pt-3 pb-1 px-3 text-[10px] font-mono uppercase tracking-wider text-slate-500">
                      {item.section}
                    </div>
                  )}

                  <button
                    onClick={() => setCurrentPage(item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-medium rounded transition-colors text-left whitespace-nowrap ${
                      isActive
                        ? 'bg-amber-400/10 text-amber-300 border border-amber-400/30'
                        : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                    }`}
                  >
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-amber-400' : 'text-slate-400'}`} />
                    <span className="truncate">{item.label}</span>
                  </button>
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom technical info & Firestore status */}
      <div className="p-3 border-t border-slate-800/80 bg-[#0B0F17]/60">
        <div className="text-[11px] font-mono text-slate-400 mb-1 px-1">
          <span>Engine: Conventional NLP</span>
          <span className="text-slate-600"> · </span>
          <span>CPWD / FIDIC</span>
        </div>
        <div className="px-1 py-1 text-[10px] font-mono text-emerald-400 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          <span>Cloud Firestore · Isolated Workspace</span>
        </div>
      </div>
    </aside>
  );
};
