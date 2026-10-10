import React, { useState } from 'react';
import { useTender } from '../context/TenderContext';
import { useAuth } from '../context/AuthContext';
import { AppSettings } from '../types/tender';
import { Settings as SettingsIcon, Save, Shield, HardHat, Database, Server, UserCheck } from 'lucide-react';

export const Settings: React.FC = () => {
  const { settings, updateSettings, showNotification } = useTender();
  const { user, logout } = useAuth();

  const [formData, setFormData] = useState<AppSettings>(settings);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(formData);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="border-b border-slate-800 pb-4">
        <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 mb-1">
          <span>SYSTEM CONFIGURATION</span>
          <span className="text-slate-600">/</span>
          <span>CIVIL ESTIMATION PARAMETERS</span>
        </div>
        <h1 className="text-xl font-bold tracking-tight text-slate-100">
          Organization & Engineering Settings
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Configure default corporate profile, DSR rate schedules, contingency reserves, and deterministic calculation thresholds.
        </p>
      </div>

      {/* Authenticated Account Card */}
      <div className="border border-slate-800 rounded-lg bg-[#0E1726] p-5 space-y-3">
        <h3 className="text-sm font-semibold text-slate-100 pb-2 border-b border-slate-800 flex items-center justify-between">
          <span className="flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-emerald-400" />
            <span>Authenticated Workspace Account</span>
          </span>
          <span className="text-[11px] font-mono text-emerald-400">SESSION VERIFIED</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs font-mono">
          <div className="p-2.5 bg-slate-900 border border-slate-800 rounded">
            <span className="text-slate-500 text-[10px] block">EMAIL</span>
            <span className="text-slate-200 truncate block mt-0.5">{user?.email || 'Not available'}</span>
          </div>
          <div className="p-2.5 bg-slate-900 border border-slate-800 rounded">
            <span className="text-slate-500 text-[10px] block">USER UID</span>
            <span className="text-slate-200 truncate block mt-0.5">{user?.uid || 'Not available'}</span>
          </div>
          <div className="p-2.5 bg-slate-900 border border-slate-800 rounded">
            <span className="text-slate-500 text-[10px] block">DATABASE REPOSITORY</span>
            <span className="text-cyan-400 truncate block mt-0.5">Cloud Firestore (Private)</span>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Organization Card */}
        <div className="border border-slate-800 rounded-lg bg-[#0E1726] p-5 space-y-4">
          <h3 className="text-sm font-semibold text-slate-100 pb-2 border-b border-slate-800 flex items-center gap-2">
            <HardHat className="w-4 h-4 text-amber-400" />
            <span>Contractor & Organization Profile</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="text-[11px] font-mono text-slate-400 block mb-1">
                ORGANIZATION / COMPANY NAME
              </label>
              <input
                type="text"
                value={formData.organizationName}
                onChange={(e) => setFormData({ ...formData, organizationName: e.target.value })}
                className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-slate-200 font-mono focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="text-[11px] font-mono text-slate-400 block mb-1">
                CONTRACTOR ENLISTMENT CLASS
              </label>
              <input
                type="text"
                value={formData.contractorLicenseClass}
                onChange={(e) => setFormData({ ...formData, contractorLicenseClass: e.target.value })}
                className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-slate-200 font-mono focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="text-[11px] font-mono text-slate-400 block mb-1">
                GSTIN REGISTRATION NUMBER
              </label>
              <input
                type="text"
                value={formData.gstin}
                onChange={(e) => setFormData({ ...formData, gstin: e.target.value })}
                className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-slate-200 font-mono focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="text-[11px] font-mono text-slate-400 block mb-1">
                SCHEDULE OF RATES STANDARD
              </label>
              <select
                value={formData.measurementStandard}
                onChange={(e) => setFormData({ ...formData, measurementStandard: e.target.value as any })}
                className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-slate-200 font-mono focus:outline-none focus:border-cyan-500"
              >
                <option value="CPWD DSR">CPWD Delhi Schedule of Rates (DSR 2023)</option>
                <option value="MoRTH">MoRTH Standard Data Book for Roads & Bridges</option>
                <option value="IS Codes">Bureau of Indian Standards (IS:1200 Method of Measurement)</option>
                <option value="FIDIC">FIDIC Red Book Conditions of Contract</option>
              </select>
            </div>
          </div>
        </div>

        {/* Financial & Bid Defaults */}
        <div className="border border-slate-800 rounded-lg bg-[#0E1726] p-5 space-y-4">
          <h3 className="text-sm font-semibold text-slate-100 pb-2 border-b border-slate-800">
            Default Financial & Estimating Factors
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="text-[11px] font-mono text-slate-400 block mb-1">
                DEFAULT CONTINGENCY (%)
              </label>
              <input
                type="number"
                step="0.1"
                value={formData.defaultContingencyPercent}
                onChange={(e) => setFormData({ ...formData, defaultContingencyPercent: Number(e.target.value) })}
                className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-slate-200 font-mono focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="text-[11px] font-mono text-slate-400 block mb-1">
                DEFAULT CONTRACTOR MARGIN (%)
              </label>
              <input
                type="number"
                step="0.1"
                value={formData.defaultMarginPercent}
                onChange={(e) => setFormData({ ...formData, defaultMarginPercent: Number(e.target.value) })}
                className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-slate-200 font-mono focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="text-[11px] font-mono text-slate-400 block mb-1">
                DEFAULT GST (%)
              </label>
              <input
                type="number"
                value={formData.defaultGstPercent}
                onChange={(e) => setFormData({ ...formData, defaultGstPercent: Number(e.target.value) })}
                className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-slate-200 font-mono focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="md:col-span-3">
              <label className="text-[11px] font-mono text-slate-400 block mb-1">
                3-YEAR AVERAGE ANNUAL CIVIL TURNOVER (A) (₹ INR)
              </label>
              <input
                type="number"
                value={formData.turnoverLast3YearsAvg}
                onChange={(e) => setFormData({ ...formData, turnoverLast3YearsAvg: Number(e.target.value) })}
                className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-slate-200 font-mono focus:outline-none focus:border-cyan-500"
              />
              <span className="text-[11px] text-slate-500 mt-1 block">
                Used automatically in the CPWD Bid Capacity Formula: Available Capacity = (2 × A × N) - B
              </span>
            </div>
          </div>
        </div>

        {/* Architectural Architecture & Engineering Invariants Card */}
        <div className="border border-slate-800 rounded-lg bg-[#0E1726] p-5 space-y-3">
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-mono">
            <Shield className="w-4 h-4" />
            <span>ENGINEERING VERIFICATION & DATA ARCHITECTURE</span>
          </div>
          <div className="text-xs text-slate-400 space-y-2 leading-relaxed">
            <p>
              • <strong className="text-slate-300">Deterministic Information Extraction:</strong> TenderAI avoids generative chatbot hallucinations by executing conventional NLP heuristics, regex tokenization, and strict CPWD/FIDIC legal keyword ontologies.
            </p>
            <p>
              • <strong className="text-slate-300">Deterministic Estimator:</strong> Bill of quantities multiplications, rate breakdowns, and bid capacity evaluations follow exact arithmetic formulations without speculative model calls.
            </p>
            <p>
              • <strong className="text-slate-300">Persistent Architecture:</strong> Built on modular data access layers with browser local persistence, pre-configured for future Firebase Firestore integration.
            </p>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-5 py-2 text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded transition-colors whitespace-nowrap shadow-sm"
          >
            <Save className="w-4 h-4" />
            <span>Save Engineering Preferences</span>
          </button>
        </div>
      </form>
    </div>
  );
};
