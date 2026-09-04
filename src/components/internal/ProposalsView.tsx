import React, { useState } from 'react';
import {
  FileText,
  Plus,
  Send,
  CheckCircle2,
  XCircle,
  Clock,
  Trash2,
  Eye,
  Mail,
  ArrowRight,
  X,
  Building2,
} from 'lucide-react';
import { Proposal, Client, Project, GoogleWorkspaceState } from '../../types';

interface ProposalsViewProps {
  proposals: Proposal[];
  clients: Client[];
  projects: Project[];
  googleWorkspace: GoogleWorkspaceState;
  onCreateProposal: (
    clientId: string,
    title: string,
    description: string,
    lineItems: { label: string; amount: number }[]
  ) => void;
  onSendProposal: (proposalId: string) => void;
  onSimulateClientResponse: (
    proposalId: string,
    action: 'accept' | 'reject',
    reason?: string
  ) => void;
  onSendGmailProposalNotification?: (proposal: Proposal, client: Client) => void;
  onNavigateToProject?: (projectId: string) => void;
}

export const ProposalsView: React.FC<ProposalsViewProps> = ({
  proposals,
  clients,
  projects,
  googleWorkspace,
  onCreateProposal,
  onSendProposal,
  onSimulateClientResponse,
  onSendGmailProposalNotification,
  onNavigateToProject,
}) => {
  const [selectedProposalId, setSelectedProposalId] = useState<string | null>(
    proposals[0]?.id || null
  );
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // New proposal form state
  const [targetClientId, setTargetClientId] = useState(clients[0]?.id || '');
  const [proposalTitle, setProposalTitle] = useState('');
  const [proposalDescription, setProposalDescription] = useState('');
  const [lineItems, setLineItems] = useState<{ id: string; label: string; amount: number }[]>([
    { id: 'item-1', label: 'Architecture & Initial Technical Audit', amount: 8500 },
    { id: 'item-2', label: 'Implementation Workers & Integration', amount: 12000 },
  ]);

  const selectedProposal = proposals.find((p) => p.id === selectedProposalId) || null;
  const selectedProposalClient = clients.find((c) => c.id === selectedProposal?.clientId);
  const convertedProject = selectedProposal?.convertedProjectId
    ? projects.find((proj) => proj.id === selectedProposal.convertedProjectId)
    : null;

  const handleAddLineItem = () => {
    setLineItems([
      ...lineItems,
      { id: `item-${Date.now()}`, label: 'New Milestone / Deliverable', amount: 5000 },
    ]);
  };

  const handleRemoveLineItem = (id: string) => {
    if (lineItems.length > 1) {
      setLineItems(lineItems.filter((item) => item.id !== id));
    }
  };

  const handleLineItemChange = (
    id: string,
    field: 'label' | 'amount',
    val: string | number
  ) => {
    setLineItems(
      lineItems.map((item) => {
        if (item.id === id) {
          return {
            ...item,
            [field]: field === 'amount' ? Math.max(0, Number(val) || 0) : val,
          };
        }
        return item;
      })
    );
  };

  const currentTotal = lineItems.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!proposalTitle.trim() || !targetClientId) return;

    onCreateProposal(
      targetClientId,
      proposalTitle.trim(),
      proposalDescription.trim(),
      lineItems.map((li) => ({ label: li.label, amount: Number(li.amount) || 0 }))
    );

    setProposalTitle('');
    setProposalDescription('');
    setLineItems([
      { id: 'item-1', label: 'Architecture & Initial Technical Audit', amount: 8500 },
    ]);
    setIsCreateModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col justify-between gap-4 border-b border-slate-200 pb-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-xl font-medium text-slate-900">Proposals & Conversion Engine</h1>
          <p className="mt-1 text-xs font-normal text-slate-500">
            Lifecycle stage 1: Client proposals, line-item budgets, and automatic project conversion on acceptance.
          </p>
        </div>
        <button
          id="open-create-proposal-modal-btn"
          type="button"
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-1.5 rounded bg-slate-900 px-3.5 py-1.5 text-xs font-medium text-white hover:bg-slate-800"
        >
          <Plus className="h-3.5 w-3.5" />
          Draft New Proposal
        </button>
      </div>

      {/* Two Column Layout: Proposals list on Left, Proposal Inspector on Right */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column: Proposals List */}
        <div className="space-y-2.5 lg:col-span-1">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-normal text-slate-500">
              {proposals.length} Total Proposals
            </span>
          </div>

          <div className="space-y-2">
            {proposals.map((prop) => {
              const client = clients.find((c) => c.id === prop.clientId);
              const isSelected = prop.id === selectedProposalId;

              return (
                <div
                  key={prop.id}
                  id={`proposal-item-${prop.id}`}
                  onClick={() => setSelectedProposalId(prop.id)}
                  className={`cursor-pointer rounded-lg border p-4 transition-colors ${
                    isSelected
                      ? 'border-slate-900 bg-slate-50 shadow-xs'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <span className="text-[11px] font-normal text-slate-500">
                      {client?.companyName}
                    </span>
                    <span
                      className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${
                        prop.status === 'accepted'
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : prop.status === 'sent'
                          ? 'bg-blue-50 text-blue-800 border border-blue-200'
                          : prop.status === 'rejected'
                          ? 'bg-red-50 text-red-800 border border-red-200'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {prop.status}
                    </span>
                  </div>

                  <h3 className="mt-1 text-xs font-medium text-slate-900 line-clamp-1">
                    {prop.title}
                  </h3>

                  <div className="mt-3 flex items-center justify-between text-[11px] font-normal text-slate-600">
                    <span>${prop.totalAmount.toLocaleString()}</span>
                    <span>{new Date(prop.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Selected Proposal Detail & Conversion Simulator */}
        <div className="lg:col-span-2">
          {selectedProposal ? (
            <div
              id="proposal-detail-card"
              className="space-y-6 rounded-lg border border-slate-200 bg-white p-6"
            >
              {/* Proposal Header */}
              <div className="flex flex-col justify-between gap-3 border-b border-slate-200 pb-5 sm:flex-row sm:items-start">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-normal text-slate-500 uppercase tracking-wider">
                      Proposal Document
                    </span>
                    <span className="rounded bg-slate-100 px-2 py-0.5 font-mono text-[10px] text-slate-600">
                      ID: {selectedProposal.id}
                    </span>
                  </div>
                  <h2 className="mt-1 text-lg font-medium text-slate-900">
                    {selectedProposal.title}
                  </h2>
                  <p className="mt-0.5 text-xs font-normal text-slate-600">
                    Prepared for:{' '}
                    <span className="font-medium text-slate-800">
                      {selectedProposalClient?.companyName}
                    </span>{' '}
                    ({selectedProposalClient?.contactName})
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`rounded px-2.5 py-1 text-xs font-medium ${
                      selectedProposal.status === 'accepted'
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : selectedProposal.status === 'sent'
                        ? 'bg-blue-50 text-blue-800 border border-blue-200'
                        : selectedProposal.status === 'rejected'
                        ? 'bg-red-50 text-red-800 border border-red-200'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    Status: {selectedProposal.status.toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Status Banner & Action Workflow */}
              <div className="rounded border border-slate-200 bg-slate-50/70 p-4">
                <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                  <div>
                    <h3 className="text-xs font-medium text-slate-800">
                      Conversion Pipeline Status
                    </h3>
                    <p className="text-xs font-normal text-slate-600">
                      {selectedProposal.status === 'draft' &&
                        'Proposal drafted internally. Ready to dispatch to client portal.'}
                      {selectedProposal.status === 'sent' &&
                        `Sent to client on ${new Date(
                          selectedProposal.sentAt || ''
                        ).toLocaleDateString()}. Awaiting client decision.`}
                      {selectedProposal.status === 'accepted' &&
                        `Accepted on ${new Date(
                          selectedProposal.respondedAt || ''
                        ).toLocaleDateString()}. Project and initial invoice converted.`}
                      {selectedProposal.status === 'rejected' &&
                        `Declined by client. Reason: ${
                          selectedProposal.responseReason || 'None provided'
                        }`}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {selectedProposal.status === 'draft' && (
                      <button
                        id={`send-proposal-btn-${selectedProposal.id}`}
                        type="button"
                        onClick={() => onSendProposal(selectedProposal.id)}
                        className="flex items-center gap-1.5 rounded bg-blue-700 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-800"
                      >
                        <Send className="h-3.5 w-3.5" />
                        Send Proposal to Client
                      </button>
                    )}

                    {selectedProposal.status === 'sent' && (
                      <div className="flex items-center gap-2">
                        {onSendGmailProposalNotification && (
                          <button
                            id={`gmail-notify-btn-${selectedProposal.id}`}
                            type="button"
                            onClick={() =>
                              selectedProposalClient &&
                              onSendGmailProposalNotification(
                                selectedProposal,
                                selectedProposalClient
                              )
                            }
                            className="flex items-center gap-1.5 rounded border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                          >
                            <Mail className="h-3.5 w-3.5 text-slate-500" />
                            Email via Gmail
                          </button>
                        )}
                        <button
                          id={`simulate-accept-btn-${selectedProposal.id}`}
                          type="button"
                          onClick={() =>
                            onSimulateClientResponse(selectedProposal.id, 'accept')
                          }
                          className="flex items-center gap-1 rounded bg-emerald-700 px-2.5 py-1.5 text-xs font-medium text-white hover:bg-emerald-800"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Simulate Accept
                        </button>
                        <button
                          id={`simulate-reject-btn-${selectedProposal.id}`}
                          type="button"
                          onClick={() =>
                            onSimulateClientResponse(
                              selectedProposal.id,
                              'reject',
                              'Budget allocation deferred to next fiscal quarter'
                            )
                          }
                          className="flex items-center gap-1 rounded border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-medium text-red-700 hover:bg-red-50"
                        >
                          <XCircle className="h-3.5 w-3.5" />
                          Simulate Reject
                        </button>
                      </div>
                    )}

                    {selectedProposal.status === 'accepted' && convertedProject && (
                      <button
                        id={`view-converted-project-btn-${convertedProject.id}`}
                        type="button"
                        onClick={() =>
                          onNavigateToProject && onNavigateToProject(convertedProject.id)
                        }
                        className="flex items-center gap-1.5 rounded border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-800 hover:bg-slate-50"
                      >
                        <span>Open Converted Project</span>
                        <ArrowRight className="h-3.5 w-3.5 text-slate-500" />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <h3 className="text-xs font-medium text-slate-900 uppercase tracking-wider">
                  Scope & Deliverables
                </h3>
                <p className="mt-2 text-xs font-normal text-slate-700 leading-relaxed">
                  {selectedProposal.description || 'No detailed scope description provided.'}
                </p>
              </div>

              {/* Line Items Table */}
              <div>
                <h3 className="text-xs font-medium text-slate-900 uppercase tracking-wider mb-2">
                  Line Items & Financial Breakdown
                </h3>
                <div className="overflow-hidden rounded border border-slate-200">
                  <table className="min-w-full divide-y divide-slate-200 text-xs">
                    <thead className="bg-slate-50 font-medium text-slate-700">
                      <tr>
                        <th className="px-4 py-2.5 text-left">Item Description</th>
                        <th className="px-4 py-2.5 text-right">Amount (USD)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white font-normal text-slate-700">
                      {selectedProposal.lineItems.map((li) => (
                        <tr key={li.id}>
                          <td className="px-4 py-2.5">{li.label}</td>
                          <td className="px-4 py-2.5 text-right font-mono">
                            ${li.amount.toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-slate-50 font-medium text-slate-900">
                      <tr>
                        <td className="px-4 py-2.5 text-left">Total Amount</td>
                        <td className="px-4 py-2.5 text-right font-mono text-sm">
                          ${selectedProposal.totalAmount.toLocaleString()}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex h-64 items-center justify-center rounded-lg border border-dashed border-slate-300 p-6 text-center text-xs font-normal text-slate-500">
              Select a proposal to inspect its scope, budget breakdown, and lifecycle actions.
            </div>
          )}
        </div>
      </div>

      {/* Modal: Create Proposal */}
      {isCreateModalOpen && (
        <div
          id="create-proposal-modal"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
        >
          <div className="w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-lg border border-slate-300 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h2 className="text-sm font-medium text-slate-900">Draft New Client Proposal</h2>
              <button
                id="close-create-proposal-modal-btn"
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="rounded p-1 text-slate-400 hover:text-slate-700"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block font-normal text-slate-700">Target Client Organization *</label>
                <select
                  id="proposal-form-client"
                  value={targetClientId}
                  onChange={(e) => setTargetClientId(e.target.value)}
                  className="mt-1 w-full rounded border border-slate-300 bg-white px-3 py-1.5 font-normal text-slate-800"
                >
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.companyName} ({c.contactName})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-normal text-slate-700">Proposal Title *</label>
                <input
                  id="proposal-form-title"
                  type="text"
                  required
                  placeholder="e.g. Distributed Core Gateway v2"
                  value={proposalTitle}
                  onChange={(e) => setProposalTitle(e.target.value)}
                  className="mt-1 w-full rounded border border-slate-300 px-3 py-1.5 font-normal text-slate-800"
                />
              </div>

              <div>
                <label className="block font-normal text-slate-700">Scope Overview & Deliverables</label>
                <textarea
                  id="proposal-form-desc"
                  rows={3}
                  placeholder="Detailed architectural scope, deliverables, and technical requirements..."
                  value={proposalDescription}
                  onChange={(e) => setProposalDescription(e.target.value)}
                  className="mt-1 w-full rounded border border-slate-300 px-3 py-1.5 font-normal text-slate-800"
                />
              </div>

              {/* Dynamic Line Items */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block font-medium text-slate-800">
                    Line Items & Milestone Budget
                  </label>
                  <button
                    id="add-line-item-btn"
                    type="button"
                    onClick={handleAddLineItem}
                    className="flex items-center gap-1 text-xs font-normal text-blue-700 hover:underline"
                  >
                    <Plus className="h-3 w-3" />
                    Add Line Item
                  </button>
                </div>

                <div className="space-y-2">
                  {lineItems.map((li, idx) => (
                    <div key={li.id} className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="Deliverable description"
                        value={li.label}
                        onChange={(e) => handleLineItemChange(li.id, 'label', e.target.value)}
                        className="flex-1 rounded border border-slate-300 px-3 py-1.5 font-normal text-slate-800"
                      />
                      <div className="relative w-32">
                        <span className="absolute top-1.5 left-2.5 text-slate-400 font-normal">
                          $
                        </span>
                        <input
                          type="number"
                          min="0"
                          value={li.amount}
                          onChange={(e) => handleLineItemChange(li.id, 'amount', e.target.value)}
                          className="w-full rounded border border-slate-300 py-1.5 pr-2 pl-6 font-mono text-slate-800"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveLineItem(li.id)}
                        disabled={lineItems.length === 1}
                        className="rounded p-1 text-slate-400 hover:text-red-600 disabled:opacity-30"
                        title="Remove item"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="mt-3 flex justify-end text-xs font-medium text-slate-900 border-t border-slate-100 pt-2">
                  <span>Calculated Total: ${currentTotal.toLocaleString()}</span>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-2.5 pt-2 border-t border-slate-100">
                <button
                  id="cancel-create-proposal-btn"
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="rounded border border-slate-300 px-3 py-1.5 font-medium text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  id="submit-create-proposal-btn"
                  type="submit"
                  className="rounded bg-slate-900 px-4 py-1.5 font-medium text-white hover:bg-slate-800"
                >
                  Create Proposal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
