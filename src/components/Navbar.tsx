import React, { useState } from 'react';
import {
  Building2,
  Users,
  FileText,
  FolderKanban,
  Receipt,
  Share2,
  Bell,
  Check,
  LogOut,
  ChevronDown,
  CalendarRange,
  HelpCircle,
  Settings,
} from 'lucide-react';
import { Client, AppNotification, GoogleWorkspaceState } from '../types';
import { ClientNotificationCenter } from './client/ClientNotificationCenter';

export type InternalViewTab =
  | 'dashboard'
  | 'clients'
  | 'proposals'
  | 'projects'
  | 'timeline'
  | 'invoices'
  | 'workspace';

export type ClientViewTab =
  | 'overview'
  | 'proposals'
  | 'projects'
  | 'invoices'
  | 'support'
  | 'settings';

interface NavbarProps {
  currentMode: 'internal' | 'client';
  onModeChange: (mode: 'internal' | 'client') => void;
  activeInternalTab: InternalViewTab;
  onInternalTabChange: (tab: InternalViewTab) => void;
  activeClientTab: ClientViewTab;
  onClientTabChange: (tab: ClientViewTab) => void;
  clients: Client[];
  activeClientId: string;
  onClientSelect: (clientId: string) => void;
  notifications: AppNotification[];
  onMarkNotificationRead: (id: string) => void;
  onMarkAllNotificationsRead?: (recipientId: string) => void;
  recipientId?: string;
  onLogout?: () => void;
  googleWorkspace: GoogleWorkspaceState;
  onConnectGoogleWorkspace: () => void;
  onDisconnectGoogleWorkspace: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentMode,
  onModeChange,
  activeInternalTab,
  onInternalTabChange,
  activeClientTab,
  onClientTabChange,
  clients,
  activeClientId,
  onClientSelect,
  notifications,
  onMarkNotificationRead,
  onMarkAllNotificationsRead,
  recipientId,
  onLogout,
  googleWorkspace,
  onConnectGoogleWorkspace,
  onDisconnectGoogleWorkspace,
}) => {
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const activeClient = clients.find((c) => c.id === activeClientId) || clients[0];
  const unreadNotifications = notifications.filter((n) => !n.read);

  return (
    <header id="app-header" className="sticky top-0 z-40 border-b border-slate-200 bg-white">
      {/* Top utility row */}
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
        {/* Brand identity */}
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded border border-slate-900 bg-slate-900 text-xs font-medium text-white">
            AL
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium tracking-tight text-slate-900">
              Algotricz
            </span>
            <span className="text-[11px] font-normal text-slate-500">
              Client Portal Architecture
            </span>
          </div>
        </div>

        {/* Center Mode Switcher */}
        <div
          id="mode-switcher"
          className="flex items-center rounded-md border border-slate-200 bg-slate-100 p-0.5 text-xs"
        >
          <button
            id="switch-internal-mode-btn"
            type="button"
            onClick={() => onModeChange('internal')}
            className={`rounded px-3 py-1.5 transition-colors ${
              currentMode === 'internal'
                ? 'bg-white font-medium text-slate-900 shadow-xs'
                : 'font-normal text-slate-600 hover:text-slate-900'
            }`}
          >
            Internal Team
          </button>
          <button
            id="switch-client-mode-btn"
            type="button"
            onClick={() => onModeChange('client')}
            className={`rounded px-3 py-1.5 transition-colors ${
              currentMode === 'client'
                ? 'bg-white font-medium text-slate-900 shadow-xs'
                : 'font-normal text-slate-600 hover:text-slate-900'
            }`}
          >
            Client Portal
          </button>
        </div>

        {/* Right side controls */}
        <div className="flex items-center gap-3">
          {/* If in client mode, show client picker so the user can test all client accounts */}
          {currentMode === 'client' && (
            <div className="flex items-center gap-1.5 text-xs">
              <span className="hidden font-normal text-slate-500 sm:inline">Viewing as:</span>
              <select
                id="active-client-select"
                value={activeClientId}
                onChange={(e) => onClientSelect(e.target.value)}
                aria-label="Select active client view"
                className="rounded border border-slate-300 bg-white px-2.5 py-1 text-xs font-medium text-slate-800"
              >
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.companyName}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Google Workspace Connection status / action */}
          {googleWorkspace.isConnected ? (
            <div className="relative">
              <button
                id="workspace-status-menu-btn"
                type="button"
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2 rounded border border-emerald-300 bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-800 hover:bg-emerald-100"
              >
                <span className="h-2 w-2 rounded-full bg-emerald-600" />
                <span className="hidden md:inline">Workspace Synced</span>
                <span className="md:hidden">Google</span>
                <ChevronDown className="h-3 w-3 text-emerald-700" />
              </button>

              {isUserMenuOpen && (
                <div
                  id="workspace-dropdown"
                  className="absolute right-0 mt-2 w-64 rounded-md border border-slate-200 bg-white p-3 shadow-md"
                >
                  <p className="text-xs font-medium text-slate-800">Google Workspace Active</p>
                  <p className="mt-0.5 truncate text-[11px] font-normal text-slate-500">
                    {googleWorkspace.userEmail || 'OAuth Session Active'}
                  </p>
                  <div className="my-2 border-t border-slate-100" />
                  <div className="space-y-1 text-[11px] font-normal text-slate-600">
                    <p>Calendar Events: {googleWorkspace.calendarEventsCount}</p>
                    <p>Drive Documents: {googleWorkspace.driveFilesCount}</p>
                    <p>Gmail API: Ready</p>
                  </div>
                  <div className="mt-3 border-t border-slate-100 pt-2">
                    <button
                      id="disconnect-workspace-btn"
                      type="button"
                      onClick={() => {
                        onDisconnectGoogleWorkspace();
                        setIsUserMenuOpen(false);
                      }}
                      className="flex w-full items-center gap-1.5 rounded px-2 py-1 text-left text-xs font-normal text-red-600 hover:bg-red-50"
                    >
                      <LogOut className="h-3.5 w-3.5" />
                      Disconnect Workspace
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              id="connect-workspace-btn"
              type="button"
              onClick={onConnectGoogleWorkspace}
              className="flex items-center gap-1.5 rounded border border-slate-300 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900"
            >
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3.03h3.88c2.27-2.09 3.665-5.17 3.665-9.12z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.03c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.24v3.13C3.26 21.36 7.33 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.29c-.25-.72-.38-1.49-.38-2.29s.13-1.57.38-2.29V6.58H1.24C.45 8.15 0 9.99 0 12s.45 3.85 1.24 5.42l4.04-3.13z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.24 6.58l4.04 3.13c.95-2.83 3.6-4.96 6.72-4.96z"
                />
              </svg>
              <span>Connect Workspace</span>
            </button>
          )}

          {/* Scoped Notifications */}
          {currentMode === 'client' ? (
            <ClientNotificationCenter
              notifications={notifications}
              recipientId={recipientId || activeClientId}
              onMarkRead={onMarkNotificationRead}
              onMarkAllRead={(recId) => {
                if (onMarkAllNotificationsRead) {
                  onMarkAllNotificationsRead(recId);
                }
              }}
              onNavigateTab={(tab) => {
                onClientTabChange(tab as ClientViewTab);
              }}
            />
          ) : (
            <div className="relative">
              <button
                id="notifications-toggle-btn"
                type="button"
                onClick={() => setIsNotifOpen(!isNotifOpen)}
                className="relative rounded-lg border border-slate-200 bg-white p-2 text-slate-500 hover:bg-slate-50 hover:text-slate-800 shadow-2xs transition-colors"
                aria-label="View notifications"
              >
                <Bell className="h-4 w-4" />
                {unreadNotifications.length > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[9px] font-semibold text-white ring-2 ring-white">
                    {unreadNotifications.length}
                  </span>
                )}
              </button>

              {isNotifOpen && (
                <div
                  id="notifications-drawer"
                  className="absolute right-0 mt-2 w-80 rounded-xl border border-slate-200 bg-white shadow-lg z-50 overflow-hidden"
                >
                  <div className="flex items-center justify-between border-b border-slate-200 px-4 py-2.5 bg-slate-50/70">
                    <span className="text-xs font-medium text-slate-800">
                      Notifications ({unreadNotifications.length} unread)
                    </span>
                    <button
                      id="close-notifications-btn"
                      type="button"
                      onClick={() => setIsNotifOpen(false)}
                      className="text-xs font-normal text-slate-500 hover:text-slate-800"
                    >
                      Close
                    </button>
                  </div>
                  <div className="max-h-72 divide-y divide-slate-100 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center text-xs font-normal text-slate-500">
                        No notifications recorded
                      </div>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          className={`p-3 text-xs transition-colors ${
                            n.read ? 'bg-white opacity-70' : 'bg-slate-50'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <p className="font-medium text-slate-800">{n.title}</p>
                            {!n.read && (
                              <button
                                id={`mark-read-btn-${n.id}`}
                                type="button"
                                onClick={() => onMarkNotificationRead(n.id)}
                                className="text-[10px] font-normal text-blue-700 hover:underline"
                              >
                                Mark read
                              </button>
                            )}
                          </div>
                          <p className="mt-1 font-normal text-slate-600">{n.body}</p>
                          <span className="mt-1.5 block text-[10px] font-normal text-slate-400">
                            {new Date(n.createdAt).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Sign Out Action Button */}
          {onLogout && (
            <button
              id="app-signout-btn"
              type="button"
              onClick={onLogout}
              title="Sign out & return to login"
              className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors shadow-2xs"
            >
              <LogOut className="h-3.5 w-3.5 text-slate-500" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          )}
        </div>
      </div>

      {/* Sub-navigation bar depending on mode */}
      <div className="border-t border-slate-100 bg-slate-50/60 px-4 sm:px-6">
        <div className="mx-auto flex max-w-7xl items-center gap-1 overflow-x-auto py-1.5 text-xs">
          {currentMode === 'internal' ? (
            <>
              <button
                id="nav-internal-dashboard"
                type="button"
                onClick={() => onInternalTabChange('dashboard')}
                className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 transition-colors shrink-0 ${
                  activeInternalTab === 'dashboard'
                    ? 'bg-white font-medium text-slate-900 shadow-xs border border-slate-200'
                    : 'font-normal text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Building2 className="h-3.5 w-3.5" />
                Dashboard
              </button>
              <button
                id="nav-internal-clients"
                type="button"
                onClick={() => onInternalTabChange('clients')}
                className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 transition-colors shrink-0 ${
                  activeInternalTab === 'clients'
                    ? 'bg-white font-medium text-slate-900 shadow-xs border border-slate-200'
                    : 'font-normal text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Users className="h-3.5 w-3.5" />
                Clients ({clients.length})
              </button>
              <button
                id="nav-internal-proposals"
                type="button"
                onClick={() => onInternalTabChange('proposals')}
                className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 transition-colors shrink-0 ${
                  activeInternalTab === 'proposals'
                    ? 'bg-white font-medium text-slate-900 shadow-xs border border-slate-200'
                    : 'font-normal text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <FileText className="h-3.5 w-3.5" />
                Proposals
              </button>
              <button
                id="nav-internal-projects"
                type="button"
                onClick={() => onInternalTabChange('projects')}
                className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 transition-colors shrink-0 ${
                  activeInternalTab === 'projects'
                    ? 'bg-white font-medium text-slate-900 shadow-xs border border-slate-200'
                    : 'font-normal text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <FolderKanban className="h-3.5 w-3.5" />
                Projects
              </button>
              <button
                id="nav-internal-timeline"
                type="button"
                onClick={() => onInternalTabChange('timeline')}
                className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 transition-colors shrink-0 ${
                  activeInternalTab === 'timeline'
                    ? 'bg-white font-medium text-slate-900 shadow-xs border border-slate-200'
                    : 'font-normal text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <CalendarRange className="h-3.5 w-3.5" />
                Gantt Timeline
              </button>
              <button
                id="nav-internal-invoices"
                type="button"
                onClick={() => onInternalTabChange('invoices')}
                className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 transition-colors shrink-0 ${
                  activeInternalTab === 'invoices'
                    ? 'bg-white font-medium text-slate-900 shadow-xs border border-slate-200'
                    : 'font-normal text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Receipt className="h-3.5 w-3.5" />
                Invoices & Razorpay
              </button>
              <button
                id="nav-internal-workspace"
                type="button"
                onClick={() => onInternalTabChange('workspace')}
                className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 transition-colors shrink-0 ${
                  activeInternalTab === 'workspace'
                    ? 'bg-white font-medium text-slate-900 shadow-xs border border-slate-200'
                    : 'font-normal text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Share2 className="h-3.5 w-3.5" />
                Google Workspace
              </button>
            </>
          ) : (
            <>
              <div className="mr-2 flex items-center gap-1.5 border-r border-slate-200 pr-3 shrink-0">
                <span className="h-2 w-2 rounded-full bg-blue-600" />
                <span className="font-semibold text-slate-900">
                  {activeClient ? activeClient.companyName : 'Client Portal'}
                </span>
                <span className="rounded bg-slate-200 px-1.5 py-0.5 text-[10px] font-medium text-slate-700">
                  Client Portal
                </span>
              </div>
              <button
                id="nav-client-overview"
                type="button"
                onClick={() => onClientTabChange('overview')}
                className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 transition-colors shrink-0 ${
                  activeClientTab === 'overview'
                    ? 'bg-white font-medium text-slate-900 shadow-xs border border-slate-200'
                    : 'font-normal text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                Overview
              </button>
              <button
                id="nav-client-proposals"
                type="button"
                onClick={() => onClientTabChange('proposals')}
                className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 transition-colors shrink-0 ${
                  activeClientTab === 'proposals'
                    ? 'bg-white font-medium text-slate-900 shadow-xs border border-slate-200'
                    : 'font-normal text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                Proposals & Scope
              </button>
              <button
                id="nav-client-projects"
                type="button"
                onClick={() => onClientTabChange('projects')}
                className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 transition-colors shrink-0 ${
                  activeClientTab === 'projects'
                    ? 'bg-white font-medium text-slate-900 shadow-xs border border-slate-200'
                    : 'font-normal text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                Active Projects & Deliverables
              </button>
              <button
                id="nav-client-invoices"
                type="button"
                onClick={() => onClientTabChange('invoices')}
                className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 transition-colors shrink-0 ${
                  activeClientTab === 'invoices'
                    ? 'bg-white font-medium text-slate-900 shadow-xs border border-slate-200'
                    : 'font-normal text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                Invoices & Billing
              </button>
              <button
                id="nav-client-support"
                type="button"
                onClick={() => onClientTabChange('support')}
                className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 transition-colors shrink-0 ${
                  activeClientTab === 'support'
                    ? 'bg-white font-medium text-slate-900 shadow-xs border border-slate-200'
                    : 'font-normal text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <HelpCircle className="h-3.5 w-3.5 text-amber-600" />
                Support Channel
              </button>
              <button
                id="nav-client-settings"
                type="button"
                onClick={() => onClientTabChange('settings')}
                className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 transition-colors shrink-0 ${
                  activeClientTab === 'settings'
                    ? 'bg-white font-medium text-slate-900 shadow-xs border border-slate-200'
                    : 'font-normal text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Settings className="h-3.5 w-3.5 text-slate-500" />
                Account Settings
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
