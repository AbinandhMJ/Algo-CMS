import React, { useState } from 'react';
import {
  Building2,
  FolderKanban,
  FileText,
  Receipt,
  CheckCircle2,
  XCircle,
  Clock,
  Download,
  MessageSquare,
  CreditCard,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  Send,
  X,
} from 'lucide-react';
import {
  Client,
  ClientUser,
  Project,
  Proposal,
  Invoice,
  Milestone,
  Task,
  ProjectFile,
  ProjectComment,
  ActivityEvent,
  SupportIssue,
  SupportIssueCategory,
  SupportIssueUrgency,
  ProjectFileCategory,
} from '../../types';
import { ClientViewTab } from '../Navbar';
import { ClientFileUploadZone } from './ClientFileUploadZone';
import { ClientSupportView } from './ClientSupportView';
import { ClientAccountSettingsView } from './ClientAccountSettingsView';

interface ClientPortalViewProps {
  client: Client;
  clientUser?: ClientUser | null;
  activeTab: ClientViewTab;
  onTabChange: (tab: ClientViewTab) => void;
  projects: Project[];
  proposals: Proposal[];
  invoices: Invoice[];
  milestones: Milestone[];
  tasks: Task[];
  files: ProjectFile[];
  comments: ProjectComment[];
  activity: ActivityEvent[];
  supportIssues?: SupportIssue[];
  onCreateSupportIssue?: (data: {
    clientId: string;
    projectId: string;
    clientUserId: string;
    clientUserName: string;
    subject: string;
    category: SupportIssueCategory;
    urgency: SupportIssueUrgency;
    description: string;
  }) => void;
  onAddFile?: (
    projectId: string,
    fileData: {
      name: string;
      url: string;
      sizeBytes: number;
      category: ProjectFileCategory;
      uploadedBy: string;
    }
  ) => void;
  onUpdateClientProfile?: (updated: {
    companyName: string;
    contactName: string;
    contactEmail: string;
    phone?: string;
  }) => void;
  onAcceptProposal: (proposalId: string) => void;
  onRejectProposal: (proposalId: string, reason: string) => void;
  onApproveMilestone: (milestoneId: string) => void;
  onRequestChangesMilestone: (milestoneId: string, notes: string) => void;
  onAddComment: (projectId: string, comment: string) => void;
  onOpenRazorpayModal: (invoice: Invoice) => void;
}

export const ClientPortalView: React.FC<ClientPortalViewProps> = ({
  client,
  clientUser,
  activeTab,
  onTabChange,
  projects,
  proposals,
  invoices,
  milestones,
  tasks,
  files,
  comments,
  activity,
  supportIssues = [],
  onCreateSupportIssue,
  onAddFile,
  onUpdateClientProfile,
  onAcceptProposal,
  onRejectProposal,
  onApproveMilestone,
  onRequestChangesMilestone,
  onAddComment,
  onOpenRazorpayModal,
}) => {
  // Selected project for Project detail view
  const [selectedProjectId, setSelectedProjectId] = useState<string>(
    projects[0]?.id || ''
  );

  // Proposal reject modal state
  const [rejectingProposalId, setRejectingProposalId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  // Milestone review modal state
  const [reviewingMilestone, setReviewingMilestone] = useState<Milestone | null>(null);
  const [changeNotes, setChangeNotes] = useState('');

  // Client comment box
  const [clientCommentText, setClientCommentText] = useState('');

  const activeProjects = projects.filter((p) => p.status === 'active');
  const openInvoices = invoices.filter((i) => i.status === 'sent' || i.status === 'overdue');
  const totalDueAmount = openInvoices.reduce((sum, i) => sum + i.totalAmount, 0);

  const pendingMilestones = milestones.filter(
    (m) => m.status === 'submitted' || m.status === 'pending'
  );
  const nextMilestone = pendingMilestones[0] || null;

  const selectedProject =
    projects.find((p) => p.id === selectedProjectId) || projects[0] || null;
  const projectMilestones = milestones.filter((m) => m.projectId === selectedProject?.id);
  const projectTasks = tasks.filter((t) => t.projectId === selectedProject?.id);
  const projectFiles = files.filter((f) => f.projectId === selectedProject?.id);
  const projectComments = comments.filter((c) => c.projectId === selectedProject?.id);

  const handleConfirmRejectProposal = () => {
    if (!rejectingProposalId) return;
    onRejectProposal(rejectingProposalId, rejectionReason.trim() || 'Declined by client');
    setRejectingProposalId(null);
    setRejectionReason('');
  };

  const handleConfirmApproveMilestone = (milestoneId: string) => {
    onApproveMilestone(milestoneId);
    setReviewingMilestone(null);
  };

  const handleConfirmChangesMilestone = () => {
    if (!reviewingMilestone) return;
    onRequestChangesMilestone(
      reviewingMilestone.id,
      changeNotes.trim() || 'Modifications requested by client'
    );
    setReviewingMilestone(null);
    setChangeNotes('');
  };

  const handleClientCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientCommentText.trim() || !selectedProject) return;

    onAddComment(selectedProject.id, clientCommentText.trim());
    setClientCommentText('');
  };

  return (
    <div className="space-y-6">
      {/* Top Client Portal Banner */}
      <div className="rounded-lg border border-slate-200 bg-white p-5">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-700">
                Authorized Client Portal
              </span>
              <span className="font-mono text-xs font-normal text-slate-400">
                Key: {client.portalAccessKey}
              </span>
            </div>
            <h1 className="mt-1 text-xl font-medium text-slate-900">{client.companyName}</h1>
            <p className="text-xs font-normal text-slate-500">
              Representative: {client.contactName} ({client.contactEmail})
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="rounded border border-slate-200 bg-slate-50 px-4 py-2 text-right">
              <span className="block text-[10px] font-normal text-slate-500">Outstanding Balance</span>
              <span className="text-sm font-medium text-slate-900">
                ${totalDueAmount.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* VIEW 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div
              className="cursor-pointer rounded-lg border border-slate-200 bg-white p-5 hover:border-slate-300 transition-colors"
              onClick={() => onTabChange('projects')}
            >
              <span className="text-xs font-normal text-slate-500 uppercase tracking-wider">
                Active Deployments
              </span>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-medium text-slate-900">
                  {activeProjects.length}
                </span>
                <span className="text-xs font-normal text-slate-500">projects running</span>
              </div>
            </div>

            <div
              className="cursor-pointer rounded-lg border border-slate-200 bg-white p-5 hover:border-slate-300 transition-colors"
              onClick={() => onTabChange('projects')}
            >
              <span className="text-xs font-normal text-slate-500 uppercase tracking-wider">
                Milestones For Sign-off
              </span>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-medium text-slate-900">
                  {pendingMilestones.filter((m) => m.status === 'submitted').length}
                </span>
                <span className="text-xs font-normal text-slate-500">review required</span>
              </div>
            </div>

            <div
              className="cursor-pointer rounded-lg border border-slate-200 bg-white p-5 hover:border-slate-300 transition-colors"
              onClick={() => onTabChange('invoices')}
            >
              <span className="text-xs font-normal text-slate-500 uppercase tracking-wider">
                Unpaid Invoices
              </span>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-medium text-slate-900">
                  {openInvoices.length}
                </span>
                <span className="text-xs font-normal text-slate-500">
                  (${totalDueAmount.toLocaleString()})
                </span>
              </div>
            </div>

            <div
              className="cursor-pointer rounded-lg border border-slate-200 bg-white p-5 hover:border-slate-300 transition-colors"
              onClick={() => onTabChange('support')}
            >
              <span className="text-xs font-normal text-slate-500 uppercase tracking-wider">
                Open Support Tickets
              </span>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-medium text-slate-900">
                  {supportIssues.filter((s) => s.status !== 'resolved').length}
                </span>
                <span className="text-xs font-normal text-slate-500">direct queries</span>
              </div>
            </div>
          </div>

          {/* Pending Proposals Notification Card (if any sent) */}
          {proposals.filter((p) => p.status === 'sent').length > 0 && (
            <div className="rounded-lg border border-blue-200 bg-blue-50/70 p-4">
              <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                <div className="flex items-center gap-2.5">
                  <FileText className="h-5 w-5 text-blue-700" />
                  <div>
                    <h3 className="text-xs font-medium text-blue-900">
                      New Proposal Awaiting Your Decision
                    </h3>
                    <p className="text-xs font-normal text-blue-700">
                      Algotricz has submitted a formal scope document for your review.
                    </p>
                  </div>
                </div>
                <button
                  id="client-review-proposals-btn"
                  type="button"
                  onClick={() => onTabChange('proposals')}
                  className="rounded bg-blue-700 px-3.5 py-1.5 text-xs font-medium text-white hover:bg-blue-800"
                >
                  Review Proposals ({proposals.filter((p) => p.status === 'sent').length})
                </button>
              </div>
            </div>
          )}

          {/* Two Column Layout: Active Project Details & Live Client Activity */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="space-y-4 lg:col-span-2">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <h2 className="text-sm font-medium text-slate-900">Your Active Systems</h2>
                <button
                  type="button"
                  onClick={() => onTabChange('projects')}
                  className="text-xs font-normal text-blue-700 hover:underline"
                >
                  View full workspace
                </button>
              </div>

              {projects.length === 0 ? (
                <div className="rounded-lg border border-dashed border-slate-300 p-8 text-center text-xs font-normal text-slate-500">
                  No active projects currently provisioned for {client.companyName}.
                </div>
              ) : (
                <div className="space-y-3">
                  {projects.map((proj) => {
                    const pTasks = tasks.filter((t) => t.projectId === proj.id);
                    const completedTasks = pTasks.filter((t) => t.status === 'done');
                    const percent =
                      pTasks.length > 0
                        ? Math.round((completedTasks.length / pTasks.length) * 100)
                        : 0;

                    return (
                      <div
                        key={proj.id}
                        id={`client-project-card-${proj.id}`}
                        className="rounded-lg border border-slate-200 bg-white p-5"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-700">
                              {proj.status.toUpperCase()}
                            </span>
                            <h3 className="mt-1.5 text-sm font-medium text-slate-900">
                              {proj.name}
                            </h3>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedProjectId(proj.id);
                              onTabChange('projects');
                            }}
                            className="flex items-center gap-1 text-xs font-normal text-blue-700 hover:underline"
                          >
                            Details <ChevronRight className="h-3.5 w-3.5" />
                          </button>
                        </div>

                        <p className="mt-2 text-xs font-normal text-slate-600">
                          {proj.description || 'System deployment actively maintained by Algotricz.'}
                        </p>

                        <div className="mt-4 flex items-center justify-between text-xs text-slate-500 font-normal">
                          <span>
                            Progress: {completedTasks.length} / {pTasks.length} tasks completed ({percent}%)
                          </span>
                          {proj.targetDate && <span>Target: {proj.targetDate}</span>}
                        </div>

                        <div className="mt-1.5 h-1.5 w-full rounded-full bg-slate-100">
                          <div
                            className="h-1.5 rounded-full bg-slate-800 transition-all"
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Client Activity Stream */}
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <h2 className="text-sm font-medium text-slate-900">Activity Log</h2>
                <span className="text-[11px] font-normal text-slate-400">Scoped</span>
              </div>

              <div className="max-h-96 space-y-2.5 overflow-y-auto pr-1">
                {activity.length === 0 ? (
                  <p className="py-6 text-center text-xs font-normal text-slate-400">
                    No recent updates recorded
                  </p>
                ) : (
                  activity.map((act) => (
                    <div
                      key={act.id}
                      className="rounded border border-slate-200 bg-white p-3 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-slate-800">{act.payload.title}</span>
                        <span className="text-[10px] font-normal text-slate-400">
                          {new Date(act.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="mt-1 font-normal text-slate-600 leading-relaxed">
                        {act.payload.description}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: PROPOSALS & APPROVALS */}
      {activeTab === 'proposals' && (
        <div className="space-y-4">
          <div className="border-b border-slate-200 pb-3">
            <h2 className="text-base font-medium text-slate-900">Scope Proposals & Contracts</h2>
            <p className="mt-0.5 text-xs font-normal text-slate-500">
              Review deliverables, approve scope to authorize project initiation, or request revisions.
            </p>
          </div>

          {proposals.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                <FileText className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-sm font-semibold text-slate-900">
                No Proposals Pending for {client.companyName}
              </h3>
              <p className="mt-1.5 max-w-md mx-auto text-xs text-slate-500 leading-relaxed">
                When the Algotricz architecture team drafts a project scope, deliverables agreement, or milestone schedule, it will appear here for review and digital sign-off.
              </p>
              <div className="mt-5 flex justify-center">
                <button
                  type="button"
                  onClick={() => onTabChange('support')}
                  className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Contact Account Lead
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {proposals.map((prop) => (
                <div
                  key={prop.id}
                  id={`client-proposal-${prop.id}`}
                  className="rounded-lg border border-slate-200 bg-white p-6"
                >
                  <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                    <div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`rounded px-2 py-0.5 text-[10px] font-medium ${
                            prop.status === 'accepted'
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              : prop.status === 'sent'
                              ? 'bg-blue-50 text-blue-800 border border-blue-200'
                              : prop.status === 'rejected'
                              ? 'bg-red-50 text-red-800 border border-red-200'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {prop.status.toUpperCase()}
                        </span>
                        <span className="text-xs font-normal text-slate-500">
                          Ref: {prop.id}
                        </span>
                      </div>
                      <h3 className="mt-1 text-base font-medium text-slate-900">{prop.title}</h3>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-normal text-slate-500">Total Investment</span>
                      <p className="text-lg font-medium text-slate-900">
                        ${prop.totalAmount.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <p className="mt-3 text-xs font-normal text-slate-600 leading-relaxed">
                    {prop.description || 'Comprehensive architecture proposal and delivery schedule.'}
                  </p>

                  {/* Line items breakdown */}
                  <div className="mt-4 overflow-hidden rounded border border-slate-200">
                    <table className="min-w-full divide-y divide-slate-200 text-xs">
                      <thead className="bg-slate-50 font-medium text-slate-700">
                        <tr>
                          <th className="px-4 py-2 text-left">Deliverable Item</th>
                          <th className="px-4 py-2 text-right">Cost</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-normal text-slate-700">
                        {prop.lineItems.map((li) => (
                          <tr key={li.id}>
                            <td className="px-4 py-2">{li.label}</td>
                            <td className="px-4 py-2 text-right font-mono">
                              ${li.amount.toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Accept / Reject actions */}
                  <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
                    <span className="text-xs font-normal text-slate-500">
                      {prop.status === 'sent' && 'Awaiting your signature/approval'}
                      {prop.status === 'accepted' &&
                        `Accepted on ${new Date(prop.respondedAt || '').toLocaleDateString()}`}
                      {prop.status === 'rejected' &&
                        `Declined: ${prop.responseReason || 'Reason unspecified'}`}
                    </span>

                    {prop.status === 'sent' && (
                      <div className="flex items-center gap-2.5">
                        <button
                          id={`client-reject-btn-${prop.id}`}
                          type="button"
                          onClick={() => setRejectingProposalId(prop.id)}
                          className="flex items-center gap-1 rounded border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                        >
                          <XCircle className="h-3.5 w-3.5 text-red-600" />
                          Decline
                        </button>
                        <button
                          id={`client-accept-btn-${prop.id}`}
                          type="button"
                          onClick={() => onAcceptProposal(prop.id)}
                          className="flex items-center gap-1.5 rounded bg-emerald-700 px-4 py-1.5 text-xs font-medium text-white hover:bg-emerald-800"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Accept & Initialize Project
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* VIEW 3: PROJECTS & MILESTONES */}
      {activeTab === 'projects' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div>
              <h2 className="text-base font-medium text-slate-900">Projects & Milestone Sign-offs</h2>
              <p className="mt-0.5 text-xs font-normal text-slate-500">
                Track deliverable progress, approve milestones, download files, and correspond with Algotricz engineers.
              </p>
            </div>

            {projects.length > 1 && (
              <select
                value={selectedProject?.id}
                onChange={(e) => setSelectedProjectId(e.target.value)}
                className="rounded border border-slate-300 bg-white px-3 py-1 text-xs font-medium text-slate-800"
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          {selectedProject ? (
            <div className="space-y-6">
              {/* Project Header */}
              <div className="rounded-lg border border-slate-200 bg-white p-5">
                <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                  <div>
                    <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-700">
                      STATUS: {selectedProject.status.toUpperCase()}
                    </span>
                    <h3 className="mt-1.5 text-base font-medium text-slate-900">
                      {selectedProject.name}
                    </h3>
                    <p className="mt-1 text-xs font-normal text-slate-600">
                      {selectedProject.description || 'Deliverables and engineering verification portal.'}
                    </p>
                  </div>
                  {selectedProject.targetDate && (
                    <div className="text-right text-xs">
                      <span className="text-slate-500 font-normal">Target Delivery</span>
                      <p className="font-medium text-slate-800">{selectedProject.targetDate}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Milestones Approval Block */}
              <div className="space-y-3">
                <h3 className="text-xs font-medium text-slate-900 uppercase tracking-wider">
                  Milestones & Sign-off Gate ({projectMilestones.length})
                </h3>

                {projectMilestones.length === 0 ? (
                  <p className="rounded border border-slate-200 bg-white p-4 text-center text-xs font-normal text-slate-400">
                    No milestones defined yet.
                  </p>
                ) : (
                  projectMilestones.map((m) => (
                    <div
                      key={m.id}
                      id={`client-milestone-${m.id}`}
                      className="rounded-lg border border-slate-200 bg-white p-5"
                    >
                      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                        <div>
                          <div className="flex items-center gap-2">
                            <span
                              className={`rounded px-2 py-0.5 text-[10px] font-medium ${
                                m.status === 'approved'
                                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                  : m.status === 'submitted'
                                  ? 'bg-blue-50 text-blue-800 border border-blue-200'
                                  : m.status === 'changes_requested'
                                  ? 'bg-amber-50 text-amber-800 border border-amber-200'
                                  : 'bg-slate-100 text-slate-700'
                              }`}
                            >
                              {m.status.replace('_', ' ').toUpperCase()}
                            </span>
                            <span className="text-xs font-normal text-slate-500">
                              Target Date: {m.dueDate}
                            </span>
                          </div>
                          <h4 className="mt-1 text-sm font-medium text-slate-900">{m.title}</h4>
                          <p className="mt-1 text-xs font-normal text-slate-600 leading-relaxed">
                            {m.description}
                          </p>

                          {m.reviewNotes && (
                            <div className="mt-3 rounded border border-slate-200 bg-slate-50 p-2.5 text-xs">
                              <span className="font-medium text-slate-800">Review Note:</span>{' '}
                              <span className="font-normal text-slate-600">{m.reviewNotes}</span>
                            </div>
                          )}
                        </div>

                        {/* Milestone Actions for Client */}
                        {m.status === 'submitted' && (
                          <div className="flex flex-col gap-2 sm:items-end">
                            <span className="text-[11px] font-normal text-blue-800">
                              Ready for your review
                            </span>
                            <div className="flex items-center gap-2">
                              <button
                                id={`request-changes-btn-${m.id}`}
                                type="button"
                                onClick={() => setReviewingMilestone(m)}
                                className="rounded border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                              >
                                Request Changes
                              </button>
                              <button
                                id={`approve-milestone-btn-${m.id}`}
                                type="button"
                                onClick={() => handleConfirmApproveMilestone(m.id)}
                                className="flex items-center gap-1 rounded bg-emerald-700 px-3.5 py-1.5 text-xs font-medium text-white hover:bg-emerald-800"
                              >
                                <CheckCircle2 className="h-3.5 w-3.5" />
                                Approve Milestone
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* High-Level Task Status & Files */}
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* High Level Task Status */}
                <div className="rounded-lg border border-slate-200 bg-white p-5 space-y-3">
                  <h3 className="text-xs font-medium text-slate-900 uppercase tracking-wider">
                    Task Status Overview
                  </h3>
                  <div className="space-y-2">
                    {projectTasks.length === 0 ? (
                      <p className="text-xs font-normal text-slate-400">No active tasks</p>
                    ) : (
                      projectTasks.map((t) => (
                        <div
                          key={t.id}
                          className="flex items-center justify-between rounded border border-slate-200 px-3 py-2 text-xs"
                        >
                          <span className="font-normal text-slate-800 truncate max-w-[240px]">
                            {t.title}
                          </span>
                          <span
                            className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${
                              t.status === 'done'
                                ? 'bg-emerald-50 text-emerald-800'
                                : t.status === 'in_progress'
                                ? 'bg-blue-50 text-blue-800'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {t.status.replace('_', ' ')}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Downloadable Deliverable Files & Client Upload Zone */}
                <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-4">
                  <div>
                    <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wider">
                      Deliverables & Project Files ({projectFiles.length})
                    </h3>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Brand assets, specification documents, feedback screenshots, and milestone deliverables.
                    </p>
                  </div>

                  <div className="space-y-2">
                    {projectFiles.length === 0 ? (
                      <div className="rounded-lg border border-dashed border-slate-200 p-4 text-center text-xs text-slate-400">
                        No files uploaded yet for this project.
                      </div>
                    ) : (
                      projectFiles.map((f) => (
                        <div
                          key={f.id}
                          className="flex items-center justify-between rounded-lg border border-slate-200 px-3.5 py-2.5 text-xs hover:bg-slate-50/60 transition-colors"
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-slate-800 block truncate max-w-[240px]">
                                {f.name}
                              </span>
                              {f.category && (
                                <span className="rounded bg-slate-100 text-slate-700 px-1.5 py-0.5 text-[10px] font-medium uppercase">
                                  {f.category.replace('_', ' ')}
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] font-normal text-slate-500">
                              {(f.sizeBytes / 1024).toFixed(1)} KB • Uploaded by {f.uploadedBy || 'Team'} on {new Date(f.uploadedAt).toLocaleDateString()}
                            </span>
                          </div>
                          <a
                            href={f.url}
                            download={f.name}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-1.5 text-xs font-medium text-blue-700 hover:text-blue-900 hover:underline"
                          >
                            <Download className="h-3.5 w-3.5" />
                            Download
                          </a>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Client File Upload Box */}
                  {onAddFile && (
                    <div className="pt-3 border-t border-slate-100">
                      <ClientFileUploadZone
                        projectId={selectedProject.id}
                        projectName={selectedProject.name}
                        clientUserId={clientUser?.id || `cu-${client.id}`}
                        clientUserName={clientUser?.name || client.contactName}
                        onFileUploaded={(newFile) => {
                          onAddFile(selectedProject.id, newFile);
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Project Comments Thread */}
              <div className="rounded-lg border border-slate-200 bg-white p-5 space-y-4">
                <h3 className="text-xs font-medium text-slate-900 uppercase tracking-wider">
                  Project Communication Thread
                </h3>

                <form onSubmit={handleClientCommentSubmit} className="space-y-3">
                  <textarea
                    id="client-comment-textarea"
                    rows={2}
                    placeholder="Send a note or question to the Algotricz project team..."
                    value={clientCommentText}
                    onChange={(e) => setClientCommentText(e.target.value)}
                    className="w-full rounded border border-slate-300 p-2.5 text-xs font-normal text-slate-800"
                  />
                  <div className="flex justify-end">
                    <button
                      id="submit-client-comment-btn"
                      type="submit"
                      disabled={!clientCommentText.trim()}
                      className="flex items-center gap-1.5 rounded bg-slate-900 px-3.5 py-1.5 text-xs font-medium text-white hover:bg-slate-800 disabled:opacity-40"
                    >
                      <Send className="h-3.5 w-3.5" />
                      Send Note
                    </button>
                  </div>
                </form>

                <div className="space-y-2.5 border-t border-slate-100 pt-3">
                  {projectComments.length === 0 ? (
                    <p className="py-4 text-center text-xs font-normal text-slate-400">
                      No comments yet. Start a discussion above.
                    </p>
                  ) : (
                    projectComments.map((comm) => (
                      <div
                        key={comm.id}
                        className="rounded border border-slate-200 bg-slate-50/60 p-3 text-xs"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-slate-900">
                              {comm.authorName}
                            </span>
                            <span
                              className={`rounded px-1.5 py-0.2 text-[10px] font-normal ${
                                comm.authorType === 'client'
                                  ? 'bg-blue-100 text-blue-900'
                                  : 'bg-slate-200 text-slate-800'
                              }`}
                            >
                              {comm.authorType === 'client' ? 'You (Client)' : 'Algotricz Team'}
                            </span>
                          </div>
                          <span className="text-[10px] font-normal text-slate-400">
                            {new Date(comm.createdAt).toLocaleString([], {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                        <p className="mt-1 font-normal text-slate-700 leading-relaxed">
                          {comm.body}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                <FolderKanban className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-sm font-semibold text-slate-900">
                No Active Projects Initialized Yet
              </h3>
              <p className="mt-1.5 max-w-md mx-auto text-xs text-slate-500 leading-relaxed">
                Your engineering workspace, milestone sign-off gates, deliverable files, and communication thread activate once an initial architectural proposal is authorized.
              </p>
              <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => onTabChange('proposals')}
                  className="rounded-lg bg-slate-900 px-4 py-2 text-xs font-medium text-white hover:bg-slate-800 transition-colors"
                >
                  Review Pending Proposals ({proposals.length})
                </button>
                <button
                  type="button"
                  onClick={() => onTabChange('support')}
                  className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Open Support Inquiry
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* VIEW 4: INVOICES & PAYMENTS */}
      {activeTab === 'invoices' && (
        <div className="space-y-4">
          <div className="border-b border-slate-200 pb-3">
            <h2 className="text-base font-medium text-slate-900">Billing & Razorpay Payments</h2>
            <p className="mt-0.5 text-xs font-normal text-slate-500">
              Review line items, download tax invoices, and settle balances instantly via Razorpay.
            </p>
          </div>

          {invoices.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                <Receipt className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-sm font-semibold text-slate-900">
                No Invoices Issued for {client.companyName}
              </h3>
              <p className="mt-1.5 max-w-md mx-auto text-xs text-slate-500 leading-relaxed">
                You have no outstanding or pending payment items. When milestone invoices are released, you can review line items, download tax copies, and complete settlement via Razorpay.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {invoices.map((inv) => (
                <div
                  key={inv.id}
                  id={`client-invoice-${inv.id}`}
                  className="rounded-lg border border-slate-200 bg-white p-5"
                >
                  <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-medium text-slate-900">
                          {inv.invoiceNumber}
                        </span>
                        <span
                          className={`rounded px-2 py-0.5 text-[10px] font-medium ${
                            inv.status === 'paid'
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              : inv.status === 'sent'
                              ? 'bg-blue-50 text-blue-800 border border-blue-200'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {inv.status.toUpperCase()}
                        </span>
                      </div>
                      <p className="mt-1 text-xs font-normal text-slate-500">
                        Payment Due: <span className="text-slate-800">{inv.dueDate}</span>
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-normal text-slate-500">Payable Amount</span>
                      <p className="text-lg font-medium text-slate-900">
                        ${inv.totalAmount.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {/* Line Items Table */}
                  <div className="mt-4 overflow-hidden rounded border border-slate-200">
                    <table className="min-w-full divide-y divide-slate-200 text-xs">
                      <thead className="bg-slate-50 font-medium text-slate-700">
                        <tr>
                          <th className="px-4 py-2 text-left">Description</th>
                          <th className="px-4 py-2 text-right">Amount</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-normal text-slate-700">
                        {inv.lineItems.map((li) => (
                          <tr key={li.id}>
                            <td className="px-4 py-2">{li.label}</td>
                            <td className="px-4 py-2 text-right font-mono">
                              ${li.amount.toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Payment CTA via Razorpay */}
                  <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
                    <span className="text-xs font-normal text-slate-500">
                      {inv.status === 'paid'
                        ? `Paid in full on ${new Date(inv.paidAt || '').toLocaleDateString()}`
                        : 'Secure transaction processed via Razorpay'}
                    </span>

                    {inv.status !== 'paid' && (
                      <button
                        id={`client-pay-razorpay-btn-${inv.id}`}
                        type="button"
                        onClick={() => onOpenRazorpayModal(inv)}
                        className="flex items-center gap-1.5 rounded bg-blue-600 px-4 py-2 text-xs font-medium text-white hover:bg-blue-700"
                      >
                        <CreditCard className="h-3.5 w-3.5" />
                        Pay with Razorpay
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* VIEW 5: SUPPORT CHANNEL */}
      {activeTab === 'support' && (
        <ClientSupportView
          client={client}
          clientUser={clientUser}
          projects={projects}
          supportIssues={supportIssues}
          onCreateSupportIssue={(data) => {
            if (onCreateSupportIssue) {
              onCreateSupportIssue(data);
            }
          }}
        />
      )}

      {/* VIEW 6: ACCOUNT SETTINGS & CONSOLIDATED INVOICES */}
      {activeTab === 'settings' && (
        <ClientAccountSettingsView
          client={client}
          clientUser={clientUser}
          invoices={invoices}
          onUpdateProfile={(updated) => {
            if (onUpdateClientProfile) {
              onUpdateClientProfile(updated);
            }
          }}
          onOpenRazorpayModal={onOpenRazorpayModal}
        />
      )}

      {/* Modal: Decline Proposal */}
      {rejectingProposalId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-lg border border-slate-300 bg-white p-6 shadow-sm">
            <h2 className="text-sm font-medium text-slate-900">Decline Proposal</h2>
            <p className="mt-1 text-xs font-normal text-slate-600">
              Please share feedback or reasons so the Algotricz team can adjust scope or terms.
            </p>

            <textarea
              rows={3}
              placeholder="e.g. Requires adjustment in delivery timelines or revised milestones..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="mt-3 w-full rounded border border-slate-300 p-2 text-xs font-normal text-slate-800"
            />

            <div className="mt-4 flex justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setRejectingProposalId(null)}
                className="rounded border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmRejectProposal}
                className="rounded bg-red-700 px-3.5 py-1.5 text-xs font-medium text-white hover:bg-red-800"
              >
                Confirm Decline
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Request Changes on Milestone */}
      {reviewingMilestone && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-lg border border-slate-300 bg-white p-6 shadow-sm">
            <h2 className="text-sm font-medium text-slate-900">
              Request Changes: {reviewingMilestone.title}
            </h2>
            <p className="mt-1 text-xs font-normal text-slate-600">
              Specify the deliverables or adjustments required before formal sign-off.
            </p>

            <textarea
              rows={3}
              placeholder="Describe modifications or additional test assertions needed..."
              value={changeNotes}
              onChange={(e) => setChangeNotes(e.target.value)}
              className="mt-3 w-full rounded border border-slate-300 p-2 text-xs font-normal text-slate-800"
            />

            <div className="mt-4 flex justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setReviewingMilestone(null)}
                className="rounded border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmChangesMilestone}
                className="rounded bg-amber-700 px-3.5 py-1.5 text-xs font-medium text-white hover:bg-amber-800"
              >
                Send Change Request
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
