import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { HardHat, Shield, Lock, Mail, ArrowRight, Loader2, AlertCircle } from 'lucide-react';

export const AuthPage: React.FC = () => {
  const { signInWithGoogle, signInWithEmail, signUpWithEmail, authError, clearAuthError } = useAuth();

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setSubmitting(true);
    try {
      if (mode === 'signin') {
        await signInWithEmail(email, password);
      } else {
        await signUpWithEmail(email, password, displayName);
      }
    } catch {
      // Handled in context
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogle = async () => {
    setSubmitting(true);
    try {
      await signInWithGoogle();
    } catch {
      // Handled in context
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0F17] flex items-center justify-center p-4 relative overflow-hidden blueprint-grid">
      {/* Background Architectural Accent */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-[#0E1726] border border-slate-800 rounded-xl p-8 relative shadow-2xl space-y-6">
        {/* Brand & Title */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-amber-400/10 border border-amber-400/30 text-amber-400 mb-1">
            <HardHat className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-100 flex items-center justify-center gap-2">
            <span>TenderAI</span>
            <span className="text-xs font-mono font-normal text-amber-400 px-1.5 py-0.5 bg-amber-400/10 border border-amber-400/20 rounded">
              CONTROL ROOM
            </span>
          </h1>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Private Civil Engineering Tender & BOQ Workspace. Authenticate to access your isolated tender repository.
          </p>
        </div>

        {/* Error Alert with Actionable Help */}
        {authError && (
          <div className="p-3.5 bg-rose-950/40 border border-rose-800/60 rounded-lg text-xs text-rose-300 space-y-3">
            <div className="flex items-start justify-between gap-2.5">
              <div className="flex items-start gap-2.5 flex-1">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <span className="font-semibold block text-rose-200">
                    {authError.includes('Firebase') || authError.includes('operation-not-allowed')
                      ? 'Firebase Provider Setup Notice'
                      : 'Authentication Notice'}
                  </span>
                  <span className="leading-relaxed mt-0.5 block text-slate-300 text-[11px]">{authError}</span>
                </div>
              </div>
              <button 
                type="button"
                onClick={clearAuthError}
                aria-label="Close notification"
                className="text-slate-400 hover:text-slate-200 p-1 rounded hover:bg-slate-800 transition-colors shrink-0"
                title="Close"
              >
                <span className="text-sm font-bold leading-none">&times;</span>
              </button>
            </div>

            {/* If operation-not-allowed or not enabled, give direct resolution */}
            {(authError.includes('operation-not-allowed') || authError.includes('not enabled') || authError.includes('not yet enabled')) && (
              <div className="p-3 bg-slate-900/90 border border-amber-500/30 rounded text-[11px] text-slate-300 space-y-2.5">
                <div className="text-amber-400 font-semibold flex items-center gap-1.5 font-mono">
                  <span>HOW TO ENABLE IN FIREBASE (1-TIME SETUP):</span>
                </div>
                
                <ol className="text-slate-300 space-y-1 list-decimal list-inside text-[11px]">
                  <li>Open the Firebase Authentication console below</li>
                  <li>Click on <strong className="text-amber-300">Email/Password</strong> under Sign-in providers</li>
                  <li>Toggle the <strong className="text-amber-300">Enable</strong> switch to ON and click <strong className="text-amber-300">Save</strong></li>
                  <li>Come back here and click Create Account again</li>
                </ol>

                <div className="pt-1 flex flex-col gap-2">
                  <a
                    href="https://console.firebase.google.com/project/gold-rope-6mzf6/authentication/providers"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2 px-3 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold rounded text-xs text-center transition-colors flex items-center justify-center gap-1.5"
                  >
                    <span>Open Firebase Console Sign-In Providers</span>
                    <span className="text-xs">↗</span>
                  </a>

                  <button
                    type="button"
                    onClick={handleGoogle}
                    className="w-full py-1.5 px-3 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded text-xs transition-colors"
                  >
                    Or Sign In with Google (Active &amp; Working Now)
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Google Authentication Button */}
        <div>
          <button
            onClick={handleGoogle}
            disabled={submitting}
            className="w-full flex items-center justify-center gap-3 py-2.5 px-4 bg-slate-900 hover:bg-slate-850 hover:border-slate-700 text-slate-100 border border-slate-750 rounded-lg text-xs font-semibold transition-all shadow-sm disabled:opacity-50"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
              />
            </svg>
            <span>Continue with Google</span>
          </button>
        </div>

        {/* Divider */}
        <div className="relative flex items-center justify-center">
          <div className="border-t border-slate-800 w-full" />
          <span className="bg-[#0E1726] px-3 text-[11px] font-mono text-slate-500 uppercase tracking-wider shrink-0">
            Or with email credentials
          </span>
        </div>

        {/* Form Mode Selector */}
        <div className="flex border border-slate-800 rounded-lg p-1 bg-slate-950/60">
          <button
            type="button"
            onClick={() => { setMode('signin'); clearAuthError(); }}
            className={`flex-1 py-1.5 text-xs font-medium rounded transition-colors ${
              mode === 'signin' ? 'bg-slate-800 text-amber-400 shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setMode('signup'); clearAuthError(); }}
            className={`flex-1 py-1.5 text-xs font-medium rounded transition-colors ${
              mode === 'signup' ? 'bg-slate-800 text-amber-400 shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Create Account
          </button>
        </div>

        {mode === 'signup' && (
          <div className="p-2.5 rounded bg-cyan-950/30 border border-cyan-800/50 text-[11px] text-cyan-300 flex items-start gap-2">
            <span className="text-cyan-400 font-bold shrink-0">ℹ</span>
            <span className="leading-tight">
              <strong>Quick Note:</strong> Google Sign-In is pre-activated and works instantly. To register with custom email/password, ensure the Email/Password provider is enabled in your Firebase Console.
            </span>
          </div>
        )}

        {/* Email & Password Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          {mode === 'signup' && (
            <div>
              <label className="text-[11px] font-mono text-slate-400 block mb-1">
                ENGINEER / ORGANIZATION NAME
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="e.g. Er. Vikrant Sharma / ABC Infra"
                className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-amber-400 font-mono"
              />
            </div>
          )}

          <div>
            <label className="text-[11px] font-mono text-slate-400 block mb-1">
              EMAIL ADDRESS
            </label>
            <div className="relative">
              <Mail className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="contractor@domain.com"
                className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-3 py-2.5 text-slate-200 focus:outline-none focus:border-amber-400 font-mono"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[11px] font-mono text-slate-400">
                PASSWORD
              </label>
              <span className="text-[10px] text-slate-500 font-mono">Min 6 characters</span>
            </div>
            <div className="relative">
              <Lock className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-3" />
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-3 py-2.5 text-slate-200 focus:outline-none focus:border-amber-400 font-mono"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full mt-2 flex items-center justify-center gap-2 py-2.5 px-4 bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50"
          >
            {submitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <span>{mode === 'signin' ? 'Access Private Workspace' : 'Initialize Workspace'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Security Assurance Badge */}
        <div className="pt-2 border-t border-slate-800/80 flex items-center justify-center gap-2 text-[11px] font-mono text-slate-500">
          <Shield className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span>Firebase Auth · Zero-Trust Isolated Storage</span>
        </div>
      </div>
    </div>
  );
};
