import React, { useState } from 'react';
import { useTender } from '../../context/TenderContext';
import { useAuth } from '../../context/AuthContext';
import { UploadCloud, Building2, ChevronDown, CheckCircle2, User as UserIcon, LogOut } from 'lucide-react';

export const Header: React.FC = () => {
  const { 
    currentPage, 
    setCurrentPage, 
    tenders, 
    activeTenderId, 
    setActiveTenderId, 
    activeTender 
  } = useTender();
  const { user, logout } = useAuth();
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);

  const handleSelectTender = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setActiveTenderId(e.target.value);
  };

  const userInitial = user?.displayName
    ? user.displayName.charAt(0).toUpperCase()
    : user?.email
    ? user.email.charAt(0).toUpperCase()
    : 'U';

  return (
    <header className="h-14 border-b border-slate-800 bg-[#0B0F17]/95 backdrop-blur px-5 flex items-center justify-between gap-6 shrink-0 z-20 sticky top-0">
      {/* Zone 1: Single text element wordmark + context */}
      <div className="flex items-center gap-3 shrink-0">
        <a 
          href="#dashboard"
          onClick={(e) => { e.preventDefault(); setCurrentPage('dashboard'); }}
          className="text-base font-bold tracking-tight text-slate-100 flex items-center gap-2 whitespace-nowrap hover:text-amber-400 transition-colors"
        >
          <span className="w-2.5 h-2.5 bg-amber-400 rounded-sm inline-block" />
          <span>TenderAI</span>
          <span className="text-xs font-mono font-normal text-slate-500">v1.0-ENG</span>
        </a>

        {/* Separator */}
        <span className="text-slate-700 hidden sm:inline" aria-hidden="true">/</span>

        {/* Project Selector / Active Document Breadcrumb */}
        <div className="hidden sm:flex items-center gap-2 text-xs">
          <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <div className="relative">
            <select
              value={activeTenderId}
              onChange={handleSelectTender}
              disabled={tenders.length === 0}
              className="bg-slate-900 border border-slate-800 text-slate-300 text-xs rounded px-2.5 py-1 pr-6 appearance-none focus:outline-none focus:border-cyan-500 cursor-pointer font-mono disabled:opacity-60"
            >
              {tenders.length === 0 ? (
                <option value="">No Tenders in Workspace</option>
              ) : (
                tenders.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.authority} : {t.nitNumber}
                  </option>
                ))
              )}
            </select>
            <ChevronDown className="w-3 h-3 text-slate-500 absolute right-1.5 top-2 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Zone 2: Navigation Links */}
      <nav className="hidden lg:flex items-center gap-6 text-xs font-medium text-slate-400">
        <button
          onClick={() => setCurrentPage('dashboard')}
          className={`hover:text-slate-100 transition-colors whitespace-nowrap ${currentPage === 'dashboard' ? 'text-amber-400 font-semibold' : ''}`}
        >
          Dashboard
        </button>
        <button
          onClick={() => setCurrentPage('analysis')}
          className={`hover:text-slate-100 transition-colors whitespace-nowrap ${currentPage === 'analysis' ? 'text-amber-400 font-semibold' : ''}`}
        >
          Analysis
        </button>
        <button
          onClick={() => setCurrentPage('boq')}
          className={`hover:text-slate-100 transition-colors whitespace-nowrap ${currentPage === 'boq' ? 'text-amber-400 font-semibold' : ''}`}
        >
          BOQ Sheet
        </button>
        <button
          onClick={() => setCurrentPage('estimator')}
          className={`hover:text-slate-100 transition-colors whitespace-nowrap ${currentPage === 'estimator' ? 'text-amber-400 font-semibold' : ''}`}
        >
          Estimator
        </button>
        <button
          onClick={() => setCurrentPage('clauses')}
          className={`hover:text-slate-100 transition-colors whitespace-nowrap ${currentPage === 'clauses' ? 'text-amber-400 font-semibold' : ''}`}
        >
          Clauses
        </button>
        <button
          onClick={() => setCurrentPage('reports')}
          className={`hover:text-slate-100 transition-colors whitespace-nowrap ${currentPage === 'reports' ? 'text-amber-400 font-semibold' : ''}`}
        >
          Reports
        </button>
      </nav>

      {/* Zone 3: Actions + User Profile Menu */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={() => setCurrentPage('upload')}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded transition-colors whitespace-nowrap shadow-sm"
        >
          <UploadCloud className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Upload Tender</span>
        </button>

        {/* User Account Menu */}
        {user && (
          <div className="relative">
            <button
              onClick={() => setAccountMenuOpen(!accountMenuOpen)}
              className="flex items-center gap-2 py-1 px-1.5 rounded-lg hover:bg-slate-800/60 transition-colors text-left"
              title={user.email || 'User Account'}
            >
              <div className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-amber-400 shrink-0">
                {user.photoURL ? (
                  <img src={user.photoURL} alt="Avatar" className="w-full h-full rounded-full object-cover" />
                ) : (
                  userInitial
                )}
              </div>
              <div className="hidden xl:block max-w-[120px] truncate text-xs">
                <span className="text-slate-200 font-medium truncate block">
                  {user.displayName || user.email?.split('@')[0]}
                </span>
              </div>
              <ChevronDown className="w-3 h-3 text-slate-500" />
            </button>

            {accountMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-[#0E1726] border border-slate-700 rounded-lg shadow-2xl py-1 text-xs z-50 animate-in fade-in slide-in-from-top-1">
                <div className="px-3 py-2 border-b border-slate-800">
                  <div className="font-semibold text-slate-200 truncate">
                    {user.displayName || 'Contractor Account'}
                  </div>
                  <div className="text-[11px] font-mono text-slate-400 truncate mt-0.5">
                    {user.email}
                  </div>
                  <div className="text-[10px] font-mono text-cyan-400 mt-1">
                    UID: {user.uid.slice(0, 8)}...
                  </div>
                </div>

                <button
                  onClick={() => {
                    setAccountMenuOpen(false);
                    setCurrentPage('settings');
                  }}
                  className="w-full text-left px-3 py-2 text-slate-300 hover:bg-slate-800/80 hover:text-slate-100 flex items-center gap-2"
                >
                  <Building2 className="w-3.5 h-3.5 text-slate-400" />
                  <span>Workspace Settings</span>
                </button>

                <div className="border-t border-slate-800 my-1" />

                <button
                  onClick={() => {
                    setAccountMenuOpen(false);
                    logout();
                  }}
                  className="w-full text-left px-3 py-2 text-rose-400 hover:bg-rose-950/30 flex items-center gap-2"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};
