import React, { useState } from 'react';
import {
  HelpCircle,
  AlertTriangle,
  Send,
  CheckCircle2,
  Clock,
  MessageSquare,
  ShieldAlert,
  ChevronDown,
  Sparkles,
} from 'lucide-react';
import {
  Project,
  SupportIssue,
  SupportIssueCategory,
  SupportIssueUrgency,
  Client,
  ClientUser,
} from '../../types';

interface ClientSupportViewProps {
  client: Client;
  clientUser?: ClientUser | null;
  projects: Project[];
  supportIssues: SupportIssue[];
  onCreateSupportIssue: (data: {
    clientId: string;
    projectId: string;
    clientUserId: string;
    clientUserName: string;
    subject: string;
    category: SupportIssueCategory;
    urgency: SupportIssueUrgency;
    description: string;
  }) => void;
}

export const ClientSupportView: React.FC<ClientSupportViewProps> = ({
  client,
  clientUser,
  projects,
  supportIssues,
  onCreateSupportIssue,
}) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState(projects[0]?.id || '');
  const [category, setCategory] = useState<SupportIssueCategory>('technical_blocker');
  const [urgency, setUrgency] = useState<SupportIssueUrgency>('normal');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !description.trim() || !selectedProjectId) return;

    onCreateSupportIssue({
      clientId: client.id,
      projectId: selectedProjectId,
      clientUserId: clientUser?.id || `cu-${client.id}`,
      clientUserName: clientUser?.name || client.contactName,
      subject: subject.trim(),
      category,
      urgency,
      description: description.trim(),
    });

    setSubject('');
    setDescription('');
    setIsFormOpen(false);
    setSuccessNotice('Support ticket submitted! Algotricz engineering team has been notified.');
    setTimeout(() => setSuccessNotice(null), 4000);
  };

  const getCategoryLabel = (cat: SupportIssueCategory) => {
    switch (cat) {
      case 'feature_scope':
        return 'Feature Scope & Change Request';
      case 'technical_blocker':
        return 'Technical Blocker';
      case 'billing_query':
        return 'Billing / Invoice Query';
      case 'milestone_clarification':
        return 'Milestone Clarification';
      case 'general_support':
        return 'General Support';
    }
  };

  const getUrgencyBadge = (urg: SupportIssueUrgency) => {
    switch (urg) {
      case 'blocker':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'urgent':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Quick Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">Direct Support & Issue Tracking</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Submit questions, flag technical blockers, or request milestone scope clarifications directly to our lead engineers.
          </p>
        </div>

        <button
          id="open-raise-issue-form-btn"
          type="button"
          onClick={() => setIsFormOpen(!isFormOpen)}
          className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-4 py-2 text-xs font-medium text-white shadow-xs hover:bg-slate-800 transition-colors shrink-0"
        >
          <HelpCircle className="h-4 w-4" />
          <span>{isFormOpen ? 'Close Ticket Form' : 'Raise New Issue'}</span>
        </button>
      </div>

      {successNotice && (
        <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>{successNotice}</span>
        </div>
      )}

      {/* Ticket Submission Form */}
      {isFormOpen && (
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs animate-in fade-in duration-200">
          <div className="mb-4">
            <h4 className="text-xs font-semibold text-slate-900">Create Support Ticket</h4>
            <p className="text-[11px] text-slate-500">
              Your inquiry will be logged in the project activity feed and routed directly to the project lead.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700">Project Reference</label>
                <select
                  id="support-issue-project-select"
                  value={selectedProjectId}
                  onChange={(e) => setSelectedProjectId(e.target.value)}
                  className="mt-1 block w-full rounded-lg border border-slate-300 py-2 px-3 text-xs text-slate-900 focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
                >
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                  {projects.length === 0 && (
                    <option value="" disabled>
                      No active projects yet
                    </option>
                  )}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700">Category</label>
                <select
                  id="support-issue-category-select"
                  value={category}
                  onChange={(e) => setCategory(e.target.value as SupportIssueCategory)}
                  className="mt-1 block w-full rounded-lg border border-slate-300 py-2 px-3 text-xs text-slate-900 focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
                >
                  <option value="technical_blocker">Technical Blocker</option>
                  <option value="feature_scope">Feature Scope & Change</option>
                  <option value="milestone_clarification">Milestone Clarification</option>
                  <option value="billing_query">Billing / Invoice Query</option>
                  <option value="general_support">General Support</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700">Urgency Level</label>
                <select
                  id="support-issue-urgency-select"
                  value={urgency}
                  onChange={(e) => setUrgency(e.target.value as SupportIssueUrgency)}
                  className="mt-1 block w-full rounded-lg border border-slate-300 py-2 px-3 text-xs text-slate-900 focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
                >
                  <option value="normal">Normal (Standard response)</option>
                  <option value="urgent">Urgent (Impacts timeline)</option>
                  <option value="blocker">Blocker (Immediate review required)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700">Subject</label>
              <input
                id="support-issue-subject-input"
                type="text"
                required
                placeholder="e.g. Staging sandbox API keys required for security audit"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-slate-300 py-2 px-3 text-xs text-slate-900 focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700">Detailed Description</label>
              <textarea
                id="support-issue-desc-input"
                rows={3}
                required
                placeholder="Provide steps, context, or specific milestone deliverable IDs relevant to this ticket..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-slate-300 py-2 px-3 text-xs text-slate-900 focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
              />
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                id="submit-support-issue-btn"
                type="submit"
                className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-4 py-2 text-xs font-medium text-white shadow-xs hover:bg-slate-800"
              >
                <Send className="h-3.5 w-3.5" />
                Submit Issue Ticket
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Issues History List */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <span className="text-xs font-semibold text-slate-900">
            Support History ({supportIssues.length})
          </span>
          <span className="text-[11px] text-slate-400">Scoped to {client.companyName}</span>
        </div>

        {supportIssues.length === 0 ? (
          <div className="p-10 text-center">
            <HelpCircle className="h-8 w-8 text-slate-300 mx-auto stroke-1" />
            <p className="mt-2 text-xs font-medium text-slate-700">No support tickets logged</p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Have a question or encounter a blocker? Raise an issue above anytime.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {supportIssues.map((issue) => {
              const proj = projects.find((p) => p.id === issue.projectId);

              return (
                <div key={issue.id} className="p-4 hover:bg-slate-50/70 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-xs text-slate-900">{issue.subject}</span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-medium border ${getUrgencyBadge(
                          issue.urgency
                        )}`}
                      >
                        {issue.urgency.toUpperCase()}
                      </span>
                      <span className="rounded bg-slate-100 text-slate-600 px-1.5 py-0.5 text-[10px]">
                        {getCategoryLabel(issue.category)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${
                          issue.status === 'resolved'
                            ? 'bg-emerald-100 text-emerald-800'
                            : issue.status === 'in_review'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {issue.status === 'resolved' ? (
                          <CheckCircle2 className="h-3 w-3" />
                        ) : (
                          <Clock className="h-3 w-3" />
                        )}
                        {issue.status === 'in_review'
                          ? 'IN REVIEW'
                          : issue.status.toUpperCase()}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 mt-2 leading-relaxed">{issue.description}</p>

                  <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400">
                    <span>
                      Project: <span className="text-slate-700 font-medium">{proj?.name || 'Assigned Project'}</span> •
                      Logged by {issue.clientUserName}
                    </span>
                    <span>
                      {new Date(issue.createdAt).toLocaleDateString([], {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>

                  {issue.resolutionNotes && (
                    <div className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50/50 p-2.5 text-xs text-emerald-900">
                      <span className="font-semibold">Algotricz Resolution: </span>
                      {issue.resolutionNotes}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
