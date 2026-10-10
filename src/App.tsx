/**
 * TenderAI: AI-Based Construction Tender Document Assistant
 * Main Application Shell with Firebase Auth Protection & View Routing
 */

import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { TenderProvider, useTender } from './context/TenderContext';
import { AuthPage } from './components/auth/AuthPage';
import { Header } from './components/common/Header';
import { Sidebar } from './components/common/Sidebar';
import { Dashboard } from './pages/Dashboard';
import { UploadTender } from './pages/UploadTender';
import { TenderAnalysis } from './pages/TenderAnalysis';
import { BOQManagement } from './pages/BOQManagement';
import { BudgetEstimator } from './pages/BudgetEstimator';
import { DeadlineTracker } from './pages/DeadlineTracker';
import { ClauseExplorer } from './pages/ClauseExplorer';
import { DocumentSearch } from './pages/DocumentSearch';
import { TenderComparison } from './pages/TenderComparison';
import { DraftGenerator } from './pages/DraftGenerator';
import { Reports } from './pages/Reports';
import { Settings } from './pages/Settings';
import { X, CheckCircle2, AlertCircle, Info, Loader2, HardHat } from 'lucide-react';

const AppContent: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const { currentPage, notification, clearNotification } = useTender();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // 1. Loading Authentication State
  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#0B0F17] flex flex-col items-center justify-center p-4 blueprint-grid text-center">
        <div className="w-12 h-12 rounded-lg bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400 mb-4 animate-pulse">
          <HardHat className="w-6 h-6" />
        </div>
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-100">
          <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
          <span>Initializing TenderAI Control Room...</span>
        </div>
        <p className="text-xs text-slate-400 font-mono mt-1">
          Verifying Cloud Firestore & Authentication Session
        </p>
      </div>
    );
  }

  // 2. Unauthenticated State: Mandatory Login/Registration Screen
  if (!user) {
    return <AuthPage />;
  }

  // 3. Authenticated State: Private Civil Tender Workspace
  return (
    <div className="min-h-screen bg-[#0B0F17] text-slate-100 flex flex-col font-sans selection:bg-amber-400 selection:text-black">
      {/* Top Bar Header */}
      <Header />

      {/* Main Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Desktop Sidebar */}
        <div className="hidden md:block">
          <Sidebar />
        </div>

        {/* Mobile Sidebar Drawer */}
        {mobileSidebarOpen && (
          <div className="fixed inset-0 z-40 flex md:hidden">
            <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setMobileSidebarOpen(false)} />
            <div className="relative z-50 w-72 bg-[#0E1726]">
              <Sidebar />
            </div>
          </div>
        )}

        {/* Workspace Canvas */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 blueprint-grid-subtle relative">
          {/* Notification Toast */}
          {notification && (
            <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-lg bg-slate-900 border border-slate-700 shadow-2xl text-xs font-mono text-slate-200 animate-in fade-in slide-in-from-bottom-2">
              {notification.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
              {notification.type === 'warning' && <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />}
              {notification.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />}
              {notification.type === 'info' && <Info className="w-4 h-4 text-cyan-400 shrink-0" />}
              
              <span>{notification.message}</span>

              <button 
                onClick={clearNotification}
                className="text-slate-500 hover:text-slate-300 ml-2"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Page Routing */}
          <div className="max-w-7xl mx-auto">
            {currentPage === 'dashboard' && <Dashboard />}
            {currentPage === 'upload' && <UploadTender />}
            {currentPage === 'analysis' && <TenderAnalysis />}
            {currentPage === 'boq' && <BOQManagement />}
            {currentPage === 'estimator' && <BudgetEstimator />}
            {currentPage === 'deadlines' && <DeadlineTracker />}
            {currentPage === 'clauses' && <ClauseExplorer />}
            {currentPage === 'search' && <DocumentSearch />}
            {currentPage === 'comparison' && <TenderComparison />}
            {currentPage === 'drafts' && <DraftGenerator />}
            {currentPage === 'reports' && <Reports />}
            {currentPage === 'settings' && <Settings />}
          </div>
        </main>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <TenderProvider>
        <AppContent />
      </TenderProvider>
    </AuthProvider>
  );
}
