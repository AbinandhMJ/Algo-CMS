import React, { useState } from 'react';
import {
  Users,
  Plus,
  Building2,
  Mail,
  Phone,
  Key,
  Calendar,
  ExternalLink,
  Search,
  X,
} from 'lucide-react';
import { Client, Project, Proposal, Invoice } from '../../types';

interface ClientsViewProps {
  clients: Client[];
  projects: Project[];
  proposals: Proposal[];
  invoices: Invoice[];
  onAddClient: (data: {
    companyName: string;
    contactName: string;
    contactEmail: string;
    phone: string;
  }) => void;
  onSwitchToClientView: (clientId: string) => void;
}

export const ClientsView: React.FC<ClientsViewProps> = ({
  clients,
  projects,
  proposals,
  invoices,
  onAddClient,
  onSwitchToClientView,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClientId, setSelectedClientId] = useState<string | null>(
    clients[0]?.id || null
  );
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // New Client form state
  const [companyName, setCompanyName] = useState('');
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [phone, setPhone] = useState('');

  const filteredClients = clients.filter(
    (c) =>
      c.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.contactName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.contactEmail.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedClient = clients.find((c) => c.id === selectedClientId) || null;
  const clientProjects = projects.filter((p) => p.clientId === selectedClientId);
  const clientProposals = proposals.filter((p) => p.clientId === selectedClientId);
  const clientInvoices = invoices.filter((i) => i.clientId === selectedClientId);

  const handleCreateClientSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName.trim() || !contactEmail.trim()) return;

    onAddClient({
      companyName: companyName.trim(),
      contactName: contactName.trim() || 'Primary Contact',
      contactEmail: contactEmail.trim(),
      phone: phone.trim() || '+1 (555) 000-0000',
    });

    setCompanyName('');
    setContactName('');
    setContactEmail('');
    setPhone('');
    setIsCreateModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header with Search and Create Action */}
      <div className="flex flex-col justify-between gap-4 border-b border-slate-200 pb-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-xl font-medium text-slate-900">Client Organizations</h1>
          <p className="mt-1 text-xs font-normal text-slate-500">
            Internal directory of onboarded clients, authorized representatives, and access keys.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute top-2.5 left-2.5 h-3.5 w-3.5 text-slate-400" />
            <input
              id="search-clients-input"
              type="text"
              placeholder="Search clients..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="rounded border border-slate-300 bg-white py-1.5 pr-3 pl-8 text-xs font-normal text-slate-800 placeholder-slate-400"
            />
          </div>
          <button
            id="open-add-client-modal-btn"
            type="button"
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-1.5 rounded bg-slate-900 px-3.5 py-1.5 text-xs font-medium text-white hover:bg-slate-800"
          >
            <Plus className="h-3.5 w-3.5" />
            Add Client
          </button>
        </div>
      </div>

      {/* Two Column Layout: Clients List on Left, Selected Client Detail on Right */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column: Clients List */}
        <div className="space-y-2.5 lg:col-span-1">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-normal text-slate-500">
              {filteredClients.length} Organizations
            </span>
          </div>

          <div className="space-y-2">
            {filteredClients.map((client) => {
              const isSelected = client.id === selectedClientId;
              const pCount = projects.filter((p) => p.clientId === client.id).length;
              return (
                <div
                  key={client.id}
                  id={`client-item-${client.id}`}
                  onClick={() => setSelectedClientId(client.id)}
                  className={`cursor-pointer rounded-lg border p-4 transition-colors ${
                    isSelected
                      ? 'border-slate-900 bg-slate-50 shadow-xs'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex h-7 w-7 items-center justify-center rounded border border-slate-300 bg-white text-xs font-medium text-slate-700">
                        {client.companyName.substring(0, 2).toUpperCase()}
                      </div>
                      <h3 className="text-xs font-medium text-slate-900">
                        {client.companyName}
                      </h3>
                    </div>
                    <span className="text-[10px] font-normal text-slate-500">
                      {pCount} {pCount === 1 ? 'project' : 'projects'}
                    </span>
                  </div>

                  <div className="mt-2.5 space-y-1 text-[11px] font-normal text-slate-600">
                    <div className="flex items-center gap-1.5">
                      <Users className="h-3 w-3 text-slate-400" />
                      <span>{client.contactName}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Mail className="h-3 w-3 text-slate-400" />
                      <span className="truncate">{client.contactEmail}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Client Detail Drawer / Dashboard */}
        <div className="lg:col-span-2">
          {selectedClient ? (
            <div
              id="client-detail-view"
              className="space-y-6 rounded-lg border border-slate-200 bg-white p-6"
            >
              {/* Client Detail Header */}
              <div className="flex flex-col justify-between gap-3 border-b border-slate-200 pb-5 sm:flex-row sm:items-start">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-normal text-slate-500 uppercase tracking-wider">
                      Client Profile
                    </span>
                    <span className="rounded bg-slate-100 px-2 py-0.5 font-mono text-[10px] text-slate-600">
                      ID: {selectedClient.id}
                    </span>
                  </div>
                  <h2 className="mt-1 text-lg font-medium text-slate-900">
                    {selectedClient.companyName}
                  </h2>
                </div>

                <button
                  id={`login-as-client-btn-${selectedClient.id}`}
                  type="button"
                  onClick={() => onSwitchToClientView(selectedClient.id)}
                  className="flex items-center gap-1.5 rounded border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-800 hover:bg-slate-50"
                >
                  <ExternalLink className="h-3.5 w-3.5 text-slate-500" />
                  View as Client Portal
                </button>
              </div>

              {/* Client Details Grid */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="rounded border border-slate-200 bg-slate-50/70 p-3.5">
                  <span className="text-xs font-normal text-slate-500">Contact Representative</span>
                  <p className="mt-1 text-xs font-medium text-slate-800">
                    {selectedClient.contactName}
                  </p>
                  <p className="mt-0.5 text-xs font-normal text-slate-600">
                    {selectedClient.contactEmail}
                  </p>
                  <p className="mt-0.5 text-xs font-normal text-slate-600">
                    {selectedClient.phone}
                  </p>
                </div>

                <div className="rounded border border-slate-200 bg-slate-50/70 p-3.5">
                  <span className="text-xs font-normal text-slate-500">Portal Security Key</span>
                  <p className="mt-1 font-mono text-xs font-medium text-slate-800">
                    {selectedClient.portalAccessKey}
                  </p>
                  <span className="mt-2 block text-[11px] font-normal text-slate-500">
                    Onboarded: {new Date(selectedClient.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* Client Projects */}
              <div>
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <h3 className="text-xs font-medium text-slate-900 uppercase tracking-wider">
                    Projects ({clientProjects.length})
                  </h3>
                </div>

                {clientProjects.length === 0 ? (
                  <p className="py-4 text-center text-xs font-normal text-slate-500">
                    No projects active for this client yet.
                  </p>
                ) : (
                  <div className="mt-3 space-y-2">
                    {clientProjects.map((p) => (
                      <div
                        key={p.id}
                        className="flex items-center justify-between rounded border border-slate-200 p-3 text-xs"
                      >
                        <div>
                          <p className="font-medium text-slate-800">{p.name}</p>
                          <p className="text-[11px] font-normal text-slate-500">
                            {p.proposalId ? 'Converted from Proposal' : 'Manual Contract'}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-700">
                            {p.status}
                          </span>
                          <p className="mt-1 text-[11px] font-normal text-slate-600">
                            ${p.budget.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Client Proposals */}
              <div>
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <h3 className="text-xs font-medium text-slate-900 uppercase tracking-wider">
                    Proposals History ({clientProposals.length})
                  </h3>
                </div>

                {clientProposals.length === 0 ? (
                  <p className="py-4 text-center text-xs font-normal text-slate-500">
                    No proposals drafted for this client.
                  </p>
                ) : (
                  <div className="mt-3 space-y-2">
                    {clientProposals.map((prop) => (
                      <div
                        key={prop.id}
                        className="flex items-center justify-between rounded border border-slate-200 p-3 text-xs"
                      >
                        <div>
                          <p className="font-medium text-slate-800">{prop.title}</p>
                          <p className="text-[11px] font-normal text-slate-500">
                            Total: ${prop.totalAmount.toLocaleString()} • {prop.lineItems.length} line items
                          </p>
                        </div>
                        <span
                          className={`rounded px-2 py-0.5 text-[10px] font-medium ${
                            prop.status === 'accepted'
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              : prop.status === 'sent'
                              ? 'bg-blue-50 text-blue-800 border border-blue-200'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {prop.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Client Invoices */}
              <div>
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <h3 className="text-xs font-medium text-slate-900 uppercase tracking-wider">
                    Invoices & Ledger ({clientInvoices.length})
                  </h3>
                </div>

                {clientInvoices.length === 0 ? (
                  <p className="py-4 text-center text-xs font-normal text-slate-500">
                    No invoices generated yet.
                  </p>
                ) : (
                  <div className="mt-3 space-y-2">
                    {clientInvoices.map((inv) => (
                      <div
                        key={inv.id}
                        className="flex items-center justify-between rounded border border-slate-200 p-3 text-xs"
                      >
                        <div>
                          <p className="font-medium text-slate-800">{inv.invoiceNumber}</p>
                          <p className="text-[11px] font-normal text-slate-500">
                            Due {inv.dueDate}
                          </p>
                        </div>
                        <div className="text-right">
                          <span
                            className={`rounded px-2 py-0.5 text-[10px] font-medium ${
                              inv.status === 'paid'
                                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {inv.status}
                          </span>
                          <p className="mt-1 font-medium text-slate-900">
                            ${inv.totalAmount.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex h-64 items-center justify-center rounded-lg border border-dashed border-slate-300 p-6 text-center text-xs font-normal text-slate-500">
              Select a client from the left directory to view full profile and history.
            </div>
          )}
        </div>
      </div>

      {/* Modal: Create Client */}
      {isCreateModalOpen && (
        <div
          id="create-client-modal"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
        >
          <div className="w-full max-w-md rounded-lg border border-slate-300 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h2 className="text-sm font-medium text-slate-900">Onboard New Client</h2>
              <button
                id="close-create-client-modal-btn"
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="rounded p-1 text-slate-400 hover:text-slate-700"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateClientSubmit} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block font-normal text-slate-700">Company Name *</label>
                <input
                  id="client-form-company"
                  type="text"
                  required
                  placeholder="e.g. Acme Corporation"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="mt-1 w-full rounded border border-slate-300 px-3 py-1.5 font-normal text-slate-800"
                />
              </div>

              <div>
                <label className="block font-normal text-slate-700">Contact Representative *</label>
                <input
                  id="client-form-contact"
                  type="text"
                  required
                  placeholder="e.g. Sarah Jenkins"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  className="mt-1 w-full rounded border border-slate-300 px-3 py-1.5 font-normal text-slate-800"
                />
              </div>

              <div>
                <label className="block font-normal text-slate-700">Contact Email *</label>
                <input
                  id="client-form-email"
                  type="email"
                  required
                  placeholder="sarah@acme.com"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  className="mt-1 w-full rounded border border-slate-300 px-3 py-1.5 font-normal text-slate-800"
                />
              </div>

              <div>
                <label className="block font-normal text-slate-700">Phone Number</label>
                <input
                  id="client-form-phone"
                  type="text"
                  placeholder="+1 (555) 000-0000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="mt-1 w-full rounded border border-slate-300 px-3 py-1.5 font-normal text-slate-800"
                />
              </div>

              <div className="mt-6 flex justify-end gap-2.5 pt-2 border-t border-slate-100">
                <button
                  id="cancel-create-client-btn"
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="rounded border border-slate-300 px-3 py-1.5 font-medium text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  id="submit-create-client-btn"
                  type="submit"
                  className="rounded bg-slate-900 px-4 py-1.5 font-medium text-white hover:bg-slate-800"
                >
                  Onboard Client
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
