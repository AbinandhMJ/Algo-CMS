import React, { useState } from 'react';
import {
  Share2,
  Calendar,
  FolderKanban,
  FileSpreadsheet,
  Mail,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  RefreshCw,
  Send,
} from 'lucide-react';
import {
  GoogleWorkspaceState,
  Project,
  Milestone,
  Invoice,
  Client,
  Proposal,
} from '../../types';

interface WorkspaceSyncViewProps {
  workspace: GoogleWorkspaceState;
  projects: Project[];
  milestones: Milestone[];
  invoices: Invoice[];
  clients: Client[];
  proposals: Proposal[];
  onConnectWorkspace: () => void;
  onRequestCalendarSync: (milestoneId: string) => void;
  onRequestDriveFolderCreate: (projectId: string) => void;
  onRequestSheetsExport: () => void;
  onRequestGmailDispatch: (
    toEmail: string,
    subject: string,
    body: string
  ) => void;
}

export const WorkspaceSyncView: React.FC<WorkspaceSyncViewProps> = ({
  workspace,
  projects,
  milestones,
  invoices,
  clients,
  proposals,
  onConnectWorkspace,
  onRequestCalendarSync,
  onRequestDriveFolderCreate,
  onRequestSheetsExport,
  onRequestGmailDispatch,
}) => {
  // Gmail draft composer state
  const [selectedRecipientClientId, setSelectedRecipientClientId] = useState(
    clients[0]?.id || ''
  );
  const [emailSubject, setEmailSubject] = useState(
    'Algotricz Portal: Architecture Milestone Update'
  );
  const [emailBody, setEmailBody] = useState(
    'Hello,\n\nPlease log in to your Algotricz Client Portal to review the latest milestone deliverable and sign-off.\n\nBest regards,\nAlgotricz Operations'
  );

  const selectedClient = clients.find((c) => c.id === selectedRecipientClientId);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col justify-between gap-4 border-b border-slate-200 pb-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-xl font-medium text-slate-900">Google Workspace Integrations</h1>
          <p className="mt-1 text-xs font-normal text-slate-500">
            Automate client communications, Drive shared folders, Calendar milestone deadlines, and Sheets financial ledgers.
          </p>
        </div>
        {!workspace.isConnected && (
          <button
            id="connect-workspace-page-btn"
            type="button"
            onClick={onConnectWorkspace}
            className="flex items-center gap-1.5 rounded bg-slate-900 px-3.5 py-1.5 text-xs font-medium text-white hover:bg-slate-800"
          >
            <Share2 className="h-3.5 w-3.5" />
            Connect Google Workspace
          </button>
        )}
      </div>

      {/* Integration Status Card */}
      <div className="rounded-lg border border-slate-200 bg-white p-5">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex items-center gap-3">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded border ${
                workspace.isConnected
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                  : 'border-slate-300 bg-slate-100 text-slate-700'
              }`}
            >
              <Share2 className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-medium text-slate-900">
                  Google Workspace OAuth 2.0
                </h2>
                <span
                  className={`rounded px-2 py-0.5 text-[10px] font-medium ${
                    workspace.isConnected
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'bg-amber-50 text-amber-800 border border-amber-200'
                  }`}
                >
                  {workspace.isConnected ? 'Connected & Authorized' : 'Not Connected'}
                </span>
              </div>
              <p className="text-xs font-normal text-slate-500 mt-0.5">
                {workspace.isConnected
                  ? `Active Account: ${workspace.userEmail || 'Google User'}`
                  : 'Connect your Google account to enable real-time sync for Calendar, Drive, Sheets, and Gmail.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {workspace.isConnected && (
              <span className="text-xs font-normal text-slate-500">
                Scopes: Calendar, Drive, Sheets, Gmail
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 4 Workspace Modules Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Module 1: Google Calendar */}
        <div className="rounded-lg border border-slate-200 bg-white p-5 space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded border border-blue-200 bg-blue-50 text-blue-700">
                <Calendar className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-xs font-medium text-slate-900">Google Calendar</h3>
                <p className="text-[11px] font-normal text-slate-500">
                  Milestone deadlines & client demo scheduling
                </p>
              </div>
            </div>
            <span className="font-mono text-xs font-medium text-slate-800">
              {workspace.calendarEventsCount} synced
            </span>
          </div>

          <p className="text-xs font-normal text-slate-600 leading-relaxed">
            Push upcoming milestone delivery dates directly to your Google Calendar. Both the Algotricz delivery team and client representatives receive schedule updates.
          </p>

          <div className="border-t border-slate-100 pt-3">
            <span className="text-[11px] font-medium text-slate-700 block mb-2">
              Sync Milestone to Calendar:
            </span>
            <div className="space-y-1.5 max-h-36 overflow-y-auto">
              {milestones.slice(0, 3).map((m) => (
                <div
                  key={m.id}
                  className="flex items-center justify-between rounded border border-slate-200 px-2.5 py-1.5 text-xs"
                >
                  <span className="truncate max-w-[200px] font-normal text-slate-800">
                    {m.title}
                  </span>
                  <button
                    type="button"
                    onClick={() => onRequestCalendarSync(m.id)}
                    className="text-[11px] font-medium text-blue-700 hover:underline"
                  >
                    Sync Deadline ({m.dueDate})
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Module 2: Google Drive */}
        <div className="rounded-lg border border-slate-200 bg-white p-5 space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded border border-amber-200 bg-amber-50 text-amber-800">
                <FolderKanban className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-xs font-medium text-slate-900">Google Drive</h3>
                <p className="text-[11px] font-normal text-slate-500">
                  Project folders & deliverable artifacts
                </p>
              </div>
            </div>
            <span className="font-mono text-xs font-medium text-slate-800">
              {workspace.driveFilesCount} assets
            </span>
          </div>

          <p className="text-xs font-normal text-slate-600 leading-relaxed">
            Create structured Google Drive directories for each project automatically, storing system architecture specs, reports, and code deliverable packages.
          </p>

          <div className="border-t border-slate-100 pt-3">
            <span className="text-[11px] font-medium text-slate-700 block mb-2">
              Create Project Drive Folder:
            </span>
            <div className="space-y-1.5 max-h-36 overflow-y-auto">
              {projects.slice(0, 3).map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between rounded border border-slate-200 px-2.5 py-1.5 text-xs"
                >
                  <span className="truncate max-w-[200px] font-normal text-slate-800">
                    {p.name}
                  </span>
                  <button
                    type="button"
                    onClick={() => onRequestDriveFolderCreate(p.id)}
                    className="text-[11px] font-medium text-blue-700 hover:underline"
                  >
                    Provision Drive Folder
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Module 3: Google Sheets */}
        <div className="rounded-lg border border-slate-200 bg-white p-5 space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded border border-emerald-200 bg-emerald-50 text-emerald-800">
                <FileSpreadsheet className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-xs font-medium text-slate-900">Google Sheets</h3>
                <p className="text-[11px] font-normal text-slate-500">
                  Financial reconciliation & invoice ledger
                </p>
              </div>
            </div>
            <span className="font-mono text-xs font-medium text-slate-800">
              {invoices.length} invoices ready
            </span>
          </div>

          <p className="text-xs font-normal text-slate-600 leading-relaxed">
            Export the complete financial ledger, including invoice IDs, client names, payment statuses, and Razorpay links directly to a newly created Google Spreadsheet.
          </p>

          <div className="border-t border-slate-100 pt-3">
            <button
              id="sync-workspace-sheets-btn"
              type="button"
              onClick={onRequestSheetsExport}
              className="flex w-full items-center justify-center gap-1.5 rounded border border-emerald-300 bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-900 hover:bg-emerald-100"
            >
              <FileSpreadsheet className="h-4 w-4 text-emerald-700" />
              Create & Export Financial Ledger Spreadsheet
            </button>
          </div>
        </div>

        {/* Module 4: Gmail API */}
        <div className="rounded-lg border border-slate-200 bg-white p-5 space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded border border-red-200 bg-red-50 text-red-700">
                <Mail className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-xs font-medium text-slate-900">Gmail Dispatch</h3>
                <p className="text-[11px] font-normal text-slate-500">
                  Client transactional notices & reminders
                </p>
              </div>
            </div>
            <span className="text-[10px] font-normal text-slate-400">
              API Active
            </span>
          </div>

          <div className="space-y-2 text-xs">
            <div>
              <label className="block font-normal text-slate-600">Client Recipient</label>
              <select
                value={selectedRecipientClientId}
                onChange={(e) => setSelectedRecipientClientId(e.target.value)}
                className="mt-1 w-full rounded border border-slate-300 bg-white px-2.5 py-1 text-xs font-normal text-slate-800"
              >
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.companyName} — {c.contactEmail}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-normal text-slate-600">Subject Line</label>
              <input
                type="text"
                value={emailSubject}
                onChange={(e) => setEmailSubject(e.target.value)}
                className="mt-1 w-full rounded border border-slate-300 px-2.5 py-1 text-xs font-normal text-slate-800"
              />
            </div>

            <button
              id="dispatch-gmail-btn"
              type="button"
              onClick={() => {
                if (selectedClient) {
                  onRequestGmailDispatch(
                    selectedClient.contactEmail,
                    emailSubject,
                    emailBody
                  );
                }
              }}
              className="flex w-full items-center justify-center gap-1.5 rounded bg-slate-900 px-3 py-2 text-xs font-medium text-white hover:bg-slate-800"
            >
              <Send className="h-3.5 w-3.5" />
              Send Email via Gmail API
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
