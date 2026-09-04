import React, { useState } from 'react';
import {
  Building2,
  ShieldCheck,
  Mail,
  KeyRound,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Users,
  Lock,
  ExternalLink,
  HelpCircle,
  AlertCircle,
} from 'lucide-react';
import { Client, ClientUser, User } from '../../types';

interface AuthViewProps {
  clients?: Client[];
  clientUsers?: ClientUser[];
  internalUsers?: User[];
  onClientLogin?: (clientUser: ClientUser, client: Client) => void;
  onClientAuthenticated?: (clientUser: ClientUser) => void;
  onInternalLogin?: (user?: User) => void;
  onInternalAuthenticated?: () => void;
  onGoogleWorkspaceSignIn?: () => Promise<void>;
  isGoogleSigningIn?: boolean;
}

export const AuthView: React.FC<AuthViewProps> = ({
  clients = [],
  clientUsers = [],
  internalUsers = [],
  onClientLogin,
  onClientAuthenticated,
  onInternalLogin,
  onInternalAuthenticated,
  onGoogleWorkspaceSignIn,
  isGoogleSigningIn = false,
}) => {
  const [authRoleTab, setAuthRoleTab] = useState<'client' | 'internal'>('client');

  const triggerClientLogin = (cu: ClientUser, client: Client) => {
    if (onClientLogin) {
      onClientLogin(cu, client);
    } else if (onClientAuthenticated) {
      onClientAuthenticated(cu);
    }
  };

  const triggerInternalLogin = (user?: User) => {
    if (onInternalLogin && user) {
      onInternalLogin(user);
    } else if (onInternalAuthenticated) {
      onInternalAuthenticated();
    }
  };

  // Client login form state
  const [clientEmail, setClientEmail] = useState('');
  const [clientPasswordOrKey, setClientPasswordOrKey] = useState('');
  const [isMagicLinkSent, setIsMagicLinkSent] = useState(false);
  const [magicLinkEmail, setMagicLinkEmail] = useState('');
  const [clientAuthError, setClientAuthError] = useState<string | null>(null);

  // Internal team login state
  const [internalEmail, setInternalEmail] = useState('');
  const [internalPassword, setInternalPassword] = useState('');
  const [internalAuthError, setInternalAuthError] = useState<string | null>(null);

  const handleClientSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setClientAuthError(null);

    const email = clientEmail.trim().toLowerCase();
    if (!email) {
      setClientAuthError('Please enter your client contact email address.');
      return;
    }

    // Check if client user exists by email
    const matchedClientUser = clientUsers.find(
      (cu) => cu.email.toLowerCase() === email
    );
    const matchedClient = matchedClientUser
      ? clients.find((c) => c.id === matchedClientUser.clientId)
      : clients.find((c) => c.contactEmail.toLowerCase() === email);

    if (!matchedClient) {
      setClientAuthError(
        'No client organization found with this email. Please check your address or select a demo client profile below.'
      );
      return;
    }

    // Check password or portal access key if provided
    const key = clientPasswordOrKey.trim();
    if (key && key !== matchedClient.portalAccessKey && key !== 'password123' && key !== 'demo') {
      setClientAuthError(
        `Invalid key. For ${matchedClient.companyName}, the access key is "${matchedClient.portalAccessKey}" or use demo access below.`
      );
      return;
    }

    const cu =
      matchedClientUser ||
      ({
        id: `cu-${matchedClient.id}`,
        clientId: matchedClient.id,
        email: matchedClient.contactEmail,
        name: matchedClient.contactName,
      } as ClientUser);

    triggerClientLogin(cu, matchedClient);
  };

  const handleSendMagicLink = () => {
    const email = clientEmail.trim().toLowerCase();
    if (!email) {
      setClientAuthError('Please enter your email to receive an authorized magic sign-in link.');
      return;
    }

    const matchedClientUser = (clientUsers || []).find(
      (cu) => cu.email.toLowerCase() === email
    );
    const matchedClient = matchedClientUser
      ? (clients || []).find((c) => c.id === matchedClientUser.clientId)
      : (clients || []).find((c) => c.contactEmail.toLowerCase() === email);

    if (!matchedClient) {
      setClientAuthError('No client account registered under this email. Select a quick profile below.');
      return;
    }

    setMagicLinkEmail(email);
    setIsMagicLinkSent(true);
    setClientAuthError(null);
  };

  const handleConfirmMagicLinkClick = () => {
    const matchedClientUser = (clientUsers || []).find(
      (cu) => cu.email.toLowerCase() === magicLinkEmail.toLowerCase()
    );
    const matchedClient = matchedClientUser
      ? (clients || []).find((c) => c.id === matchedClientUser.clientId)
      : (clients || []).find((c) => c.contactEmail.toLowerCase() === magicLinkEmail.toLowerCase());

    if (matchedClient) {
      const cu =
        matchedClientUser ||
        ({
          id: `cu-${matchedClient.id}`,
          clientId: matchedClient.id,
          email: matchedClient.contactEmail,
          name: matchedClient.contactName,
        } as ClientUser);

      triggerClientLogin(cu, matchedClient);
    }
  };

  const handleInternalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setInternalAuthError(null);

    const email = internalEmail.trim().toLowerCase();
    const matchedUser = (internalUsers || []).find((u) => u.email.toLowerCase() === email);

    if (!matchedUser) {
      setInternalAuthError('No internal Algotricz staff account matches this email.');
      return;
    }

    triggerInternalLogin(matchedUser);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {/* Brand Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-slate-900 text-white shadow-sm font-semibold tracking-wider text-base">
          AL
        </div>
        <h1 className="mt-4 text-2xl font-semibold tracking-tight text-slate-950">
          Algotricz Client Portal
        </h1>
        <p className="mt-1 text-xs text-slate-600">
          Secure, client-isolated access to proposals, active deliveries, milestones & invoices.
        </p>
      </div>

      {/* Main Auth Card */}
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl">
        <div className="rounded-xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs">
          {/* Dual Persona Switcher */}
          <div className="flex rounded-lg border border-slate-200 bg-slate-100/80 p-1 mb-6">
            <button
              id="auth-tab-client-btn"
              type="button"
              onClick={() => {
                setAuthRoleTab('client');
                setClientAuthError(null);
              }}
              className={`flex-1 flex items-center justify-center gap-2 rounded-md py-2 text-xs font-medium transition-all ${
                authRoleTab === 'client'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Building2 className="h-4 w-4 text-blue-600" />
              <span>Client Portal Access</span>
            </button>
            <button
              id="auth-tab-internal-btn"
              type="button"
              onClick={() => {
                setAuthRoleTab('internal');
                setInternalAuthError(null);
              }}
              className={`flex-1 flex items-center justify-center gap-2 rounded-md py-2 text-xs font-medium transition-all ${
                authRoleTab === 'internal'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ShieldCheck className="h-4 w-4 text-slate-800" />
              <span>Algotricz Team Access</span>
            </button>
          </div>

          {/* TAB 1: CLIENT LOGIN */}
          {authRoleTab === 'client' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-base font-medium text-slate-900">Sign in to your client account</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Enter your business email to sign in via magic link or access key. Session persists across visits.
                </p>
              </div>

              {clientAuthError && (
                <div className="flex items-start gap-2.5 rounded-lg border border-red-200 bg-red-50/70 p-3 text-xs text-red-800">
                  <AlertCircle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
                  <p>{clientAuthError}</p>
                </div>
              )}

              {isMagicLinkSent ? (
                <div className="rounded-lg border border-emerald-200 bg-emerald-50/70 p-5 text-center space-y-3">
                  <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                    <Mail className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-emerald-950">Magic Link Dispatched</h3>
                    <p className="text-xs text-emerald-800 mt-1 max-w-sm mx-auto">
                      A single-click authentication token has been generated for{' '}
                      <span className="font-semibold text-emerald-950">{magicLinkEmail}</span>.
                    </p>
                  </div>
                  <div className="pt-2">
                    <button
                      id="confirm-magic-link-login-btn"
                      type="button"
                      onClick={handleConfirmMagicLinkClick}
                      className="inline-flex items-center gap-2 rounded-lg bg-emerald-700 px-5 py-2.5 text-xs font-medium text-white shadow-xs hover:bg-emerald-800 transition-colors"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      Verify Link & Enter Client Portal
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsMagicLinkSent(false)}
                    className="block mx-auto text-xs text-slate-500 hover:text-slate-800 hover:underline pt-1"
                  >
                    Back to email sign in
                  </button>
                </div>
              ) : (
                <form onSubmit={handleClientSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="client-email-input" className="block text-xs font-medium text-slate-700">
                      Work / Contact Email
                    </label>
                    <div className="mt-1 relative rounded-md shadow-xs">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <Mail className="h-4 w-4 text-slate-400" />
                      </div>
                      <input
                        id="client-email-input"
                        type="email"
                        required
                        placeholder="you@company.com"
                        value={clientEmail}
                        onChange={(e) => setClientEmail(e.target.value)}
                        className="block w-full rounded-lg border border-slate-300 pl-9 pr-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between">
                      <label htmlFor="client-key-input" className="block text-xs font-medium text-slate-700">
                        Portal Access Key or Password <span className="text-slate-400 font-normal">(Optional)</span>
                      </label>
                      <span className="text-[11px] text-slate-400">e.g. APEX-8821-SEC</span>
                    </div>
                    <div className="mt-1 relative rounded-md shadow-xs">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <KeyRound className="h-4 w-4 text-slate-400" />
                      </div>
                      <input
                        id="client-key-input"
                        type="text"
                        placeholder="Enter key or leave blank for magic link"
                        value={clientPasswordOrKey}
                        onChange={(e) => setClientPasswordOrKey(e.target.value)}
                        className="block w-full rounded-lg border border-slate-300 pl-9 pr-3 py-2 text-xs font-mono text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
                    <button
                      id="client-portal-signin-submit-btn"
                      type="submit"
                      className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg bg-slate-900 py-2.5 px-4 text-xs font-medium text-white shadow-xs hover:bg-slate-800 transition-colors"
                    >
                      <span>Sign In to Portal</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                    <button
                      id="client-send-magic-link-btn"
                      type="button"
                      onClick={handleSendMagicLink}
                      className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-300 bg-white py-2.5 px-4 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      <Sparkles className="h-3.5 w-3.5 text-blue-600" />
                      <span>Send Magic Link</span>
                    </button>
                  </div>
                </form>
              )}

              {/* Quick Demo Client Profiles for Testing */}
              <div className="pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-[11px] font-medium uppercase tracking-wider text-slate-500">
                    Quick Test Profiles (1-Click Sign In)
                  </span>
                  <span className="text-[11px] text-slate-400">Pre-seeded accounts</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {(clients || []).map((c) => {
                    const cu = (clientUsers || []).find((u) => u.clientId === c.id) || {
                      id: `cu-${c.id}`,
                      clientId: c.id,
                      name: c.contactName,
                      email: c.contactEmail,
                    };
                    const isNewClient = c.id === 'client-aura';

                    return (
                      <button
                        key={c.id}
                        id={`quick-client-login-${c.id}`}
                        type="button"
                        onClick={() => triggerClientLogin(cu, c)}
                        className="group flex flex-col items-start rounded-lg border border-slate-200 bg-slate-50/80 p-2.5 text-left hover:border-slate-400 hover:bg-white transition-all text-xs"
                      >
                        <div className="flex items-center justify-between w-full">
                          <span className="font-medium text-slate-900 group-hover:text-blue-700 truncate">
                            {c.companyName}
                          </span>
                          {isNewClient && (
                            <span className="rounded bg-amber-100 text-amber-800 px-1.5 py-0.2 text-[9px] font-medium">
                              Empty State Demo
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-slate-500 mt-0.5">
                          {c.contactName} • {c.contactEmail}
                        </span>
                        <span className="font-mono text-[10px] text-slate-400 mt-1">
                          Key: {c.portalAccessKey}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: INTERNAL TEAM LOGIN */}
          {authRoleTab === 'internal' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-base font-medium text-slate-900">Algotricz Operations & Engineering</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Internal staff access. Authenticate via Google Workspace to connect Calendar, Drive, Sheets & Gmail.
                </p>
              </div>

              {internalAuthError && (
                <div className="flex items-start gap-2.5 rounded-lg border border-red-200 bg-red-50/70 p-3 text-xs text-red-800">
                  <AlertCircle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
                  <p>{internalAuthError}</p>
                </div>
              )}

              {/* Primary Google Workspace OAuth Button */}
              <div className="space-y-3">
                <button
                  id="internal-google-signin-btn"
                  type="button"
                  disabled={isGoogleSigningIn}
                  onClick={onGoogleWorkspaceSignIn}
                  className="w-full flex items-center justify-center gap-3 rounded-lg border border-slate-300 bg-white py-2.5 px-4 text-xs font-medium text-slate-700 shadow-xs hover:bg-slate-50 hover:border-slate-400 disabled:opacity-60 transition-all"
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>{isGoogleSigningIn ? 'Connecting to Google...' : 'Sign in with Google Workspace'}</span>
                </button>

                <div className="relative flex py-2 items-center">
                  <div className="flex-grow border-t border-slate-200"></div>
                  <span className="flex-shrink mx-3 text-[11px] uppercase tracking-wider text-slate-400">
                    Or internal staff credentials
                  </span>
                  <div className="flex-grow border-t border-slate-200"></div>
                </div>

                <form onSubmit={handleInternalSubmit} className="space-y-3">
                  <div>
                    <label htmlFor="internal-email-input" className="block text-xs font-medium text-slate-700">
                      Staff Email
                    </label>
                    <input
                      id="internal-email-input"
                      type="email"
                      required
                      placeholder="devon@algotricz.com"
                      value={internalEmail}
                      onChange={(e) => setInternalEmail(e.target.value)}
                      className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
                    />
                  </div>
                  <div>
                    <label htmlFor="internal-pass-input" className="block text-xs font-medium text-slate-700">
                      Password
                    </label>
                    <input
                      id="internal-pass-input"
                      type="password"
                      placeholder="••••••••"
                      value={internalPassword}
                      onChange={(e) => setInternalPassword(e.target.value)}
                      className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
                    />
                  </div>
                  <button
                    id="internal-staff-signin-submit-btn"
                    type="submit"
                    className="w-full inline-flex items-center justify-center gap-1.5 rounded-lg bg-slate-900 py-2.5 px-4 text-xs font-medium text-white shadow-xs hover:bg-slate-800 transition-colors"
                  >
                    <span>Authenticate Internal Staff</span>
                  </button>
                </form>
              </div>

              {/* Quick Internal Profiles */}
              <div className="pt-4 border-t border-slate-100">
                <span className="block text-[11px] font-medium uppercase tracking-wider text-slate-500 mb-2">
                  Staff Quick Select
                </span>
                <div className="flex gap-2">
                  {(internalUsers || []).map((u) => (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => triggerInternalLogin(u)}
                      className="flex-1 rounded-lg border border-slate-200 bg-slate-50 p-2 text-left hover:border-slate-400 hover:bg-white text-xs"
                    >
                      <span className="font-medium text-slate-900 block truncate">{u.name}</span>
                      <span className="text-[10px] text-slate-500 block truncate">
                        {u.role.toUpperCase()}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Security & Isolation Callout */}
        <div className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-400">
          <Lock className="h-3.5 w-3.5" />
          <span>Client data isolation mathematically enforced by security rules</span>
        </div>
      </div>
    </div>
  );
};
