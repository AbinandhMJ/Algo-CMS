import React, { useState } from 'react';
import {
  User,
  Building,
  Mail,
  Phone,
  KeyRound,
  Shield,
  Receipt,
  CheckCircle2,
  Clock,
  AlertCircle,
  ExternalLink,
  Copy,
  Check,
  CreditCard,
} from 'lucide-react';
import { Client, ClientUser, Invoice } from '../../types';

interface ClientAccountSettingsViewProps {
  client: Client;
  clientUser?: ClientUser | null;
  invoices?: Invoice[];
  onUpdateClient?: (clientId: string, updates: Partial<Client>) => void;
  onUpdateClientUser?: (clientUserId: string, updates: Partial<ClientUser>) => void;
  onPayInvoice?: (invoiceId: string) => void;
  onUpdateProfile?: (updated: {
    companyName: string;
    contactName: string;
    contactEmail: string;
    phone?: string;
  }) => void;
  onOpenRazorpayModal?: (invoice: Invoice) => void;
}

export const ClientAccountSettingsView: React.FC<ClientAccountSettingsViewProps> = ({
  client,
  clientUser,
  invoices = [],
  onUpdateClient,
  onUpdateClientUser,
  onPayInvoice,
  onUpdateProfile,
  onOpenRazorpayModal,
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'invoices'>('profile');

  // Form states
  const [companyName, setCompanyName] = useState(client.companyName);
  const [contactName, setContactName] = useState(client.contactName);
  const [contactEmail, setContactEmail] = useState(client.contactEmail);
  const [phone, setPhone] = useState(client.phone || '');
  const [portalKey, setPortalKey] = useState(client.portalAccessKey || '');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);

  // Financial aggregates
  const safeInvoices = invoices || [];
  const totalBilled = safeInvoices.reduce((sum, inv) => sum + (inv.totalAmount || 0), 0);
  const totalPaid = safeInvoices
    .filter((inv) => inv.status === 'paid')
    .reduce((sum, inv) => sum + (inv.totalAmount || 0), 0);
  const totalOutstanding = totalBilled - totalPaid;

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onUpdateProfile) {
      onUpdateProfile({
        companyName,
        contactName,
        contactEmail,
        phone,
      });
    } else if (onUpdateClient) {
      onUpdateClient(client.id, {
        companyName,
        contactName,
        contactEmail,
        phone,
        portalAccessKey: portalKey,
      });
    }

    if (clientUser && onUpdateClientUser) {
      onUpdateClientUser(clientUser.id, {
        name: contactName,
        email: contactEmail,
      });
    }

    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3500);
  };

  const handleCopyKey = () => {
    navigator.clipboard.writeText(portalKey || client.portalAccessKey || '');
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const formatCurrency = (amt: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(amt);
  };

  return (
    <div className="space-y-6">
      {/* Settings Navigation Tabs */}
      <div className="flex border-b border-slate-200">
        <button
          type="button"
          onClick={() => setActiveTab('profile')}
          className={`flex items-center gap-2 py-3 px-4 text-xs font-medium border-b-2 transition-colors ${
            activeTab === 'profile'
              ? 'border-slate-900 text-slate-950 font-semibold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <User className="h-4 w-4" />
          <span>Organization Profile & Credentials</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('invoices')}
          className={`flex items-center gap-2 py-3 px-4 text-xs font-medium border-b-2 transition-colors ${
            activeTab === 'invoices'
              ? 'border-slate-900 text-slate-950 font-semibold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Receipt className="h-4 w-4" />
          <span>Consolidated Billing & Receipts ({invoices.length})</span>
        </button>
      </div>

      {/* TAB 1: PROFILE & CREDENTIALS */}
      {activeTab === 'profile' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Edit Form */}
          <div className="lg:col-span-2 rounded-xl border border-slate-200 bg-white p-6 shadow-xs">
            <div className="mb-5">
              <h3 className="text-sm font-semibold text-slate-900">Account Details</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Manage your organization’s primary contact info and credentials.
              </p>
            </div>

            {saveSuccess && (
              <div className="mb-4 flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>Profile settings successfully saved!</span>
              </div>
            )}

            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700">Company Name</label>
                  <div className="mt-1 relative rounded-md shadow-xs">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <Building className="h-4 w-4 text-slate-400" />
                    </div>
                    <input
                      type="text"
                      required
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="block w-full rounded-lg border border-slate-300 pl-9 pr-3 py-2 text-xs text-slate-900 focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700">Primary Contact Name</label>
                  <div className="mt-1 relative rounded-md shadow-xs">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <User className="h-4 w-4 text-slate-400" />
                    </div>
                    <input
                      type="text"
                      required
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      className="block w-full rounded-lg border border-slate-300 pl-9 pr-3 py-2 text-xs text-slate-900 focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700">Contact Email</label>
                  <div className="mt-1 relative rounded-md shadow-xs">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <Mail className="h-4 w-4 text-slate-400" />
                    </div>
                    <input
                      type="email"
                      required
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      className="block w-full rounded-lg border border-slate-300 pl-9 pr-3 py-2 text-xs text-slate-900 focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700">Phone Number</label>
                  <div className="mt-1 relative rounded-md shadow-xs">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <Phone className="h-4 w-4 text-slate-400" />
                    </div>
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="block w-full rounded-lg border border-slate-300 pl-9 pr-3 py-2 text-xs text-slate-900 focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <label className="block text-xs font-medium text-slate-700">
                  Portal Access Security Key
                </label>
                <div className="mt-1 flex gap-2">
                  <div className="relative flex-1 rounded-md shadow-xs">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <KeyRound className="h-4 w-4 text-slate-400" />
                    </div>
                    <input
                      type="text"
                      value={portalKey}
                      onChange={(e) => setPortalKey(e.target.value)}
                      className="block w-full rounded-lg border border-slate-300 pl-9 pr-3 py-2 text-xs font-mono text-slate-900 focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleCopyKey}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 transition-colors"
                  >
                    {copiedKey ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                    <span>{copiedKey ? 'Copied' : 'Copy Key'}</span>
                  </button>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Share this key with authorized team members at {client.companyName} to sign in.
                </p>
              </div>

              <div className="pt-3">
                <button
                  id="client-save-profile-btn"
                  type="submit"
                  className="rounded-lg bg-slate-900 px-5 py-2.5 text-xs font-medium text-white shadow-xs hover:bg-slate-800 transition-colors"
                >
                  Save Profile Changes
                </button>
              </div>
            </form>
          </div>

          {/* Right Info Box */}
          <div className="space-y-4">
            <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-5">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-900 mb-2">
                <Shield className="h-4 w-4 text-blue-600" />
                <span>Client Isolation Guarantee</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Your portal operates under strict row-level security tokens. Only stakeholders registered under{' '}
                <span className="font-semibold text-slate-900">{client.companyName}</span> can inspect your deliverables, invoices, and proposals.
              </p>

              <div className="mt-4 pt-3 border-t border-slate-200 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Client ID:</span>
                  <span className="font-mono text-slate-800">{client.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Account Onboarded:</span>
                  <span className="text-slate-800">
                    {new Date(client.createdAt).toLocaleDateString([], {
                      month: 'short',
                      year: 'numeric',
                    })}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: CONSOLIDATED INVOICES */}
      {activeTab === 'invoices' && (
        <div className="space-y-6">
          {/* Summary Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
              <span className="text-xs font-medium text-slate-500">Total Billed Across All Projects</span>
              <p className="mt-1 text-xl font-semibold text-slate-950">{formatCurrency(totalBilled)}</p>
              <span className="text-[11px] text-slate-400 mt-0.5 block">{invoices.length} total statements</span>
            </div>

            <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4 shadow-xs">
              <span className="text-xs font-medium text-emerald-800">Total Settled / Paid</span>
              <p className="mt-1 text-xl font-semibold text-emerald-950">{formatCurrency(totalPaid)}</p>
              <span className="text-[11px] text-emerald-700 mt-0.5 block">Verified by Razorpay</span>
            </div>

            <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-4 shadow-xs">
              <span className="text-xs font-medium text-amber-800">Outstanding Balance</span>
              <p className="mt-1 text-xl font-semibold text-amber-950">{formatCurrency(totalOutstanding)}</p>
              <span className="text-[11px] text-amber-700 mt-0.5 block">Due per active milestones</span>
            </div>
          </div>

          {/* Invoices Table */}
          <div className="rounded-xl border border-slate-200 bg-white shadow-xs overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h4 className="text-xs font-semibold text-slate-900">All Project Invoices</h4>
                <p className="text-[11px] text-slate-500">Consolidated history for {client.companyName}</p>
              </div>
            </div>

            {safeInvoices.length === 0 ? (
              <div className="p-8 text-center">
                <Receipt className="h-8 w-8 text-slate-300 mx-auto stroke-1" />
                <p className="mt-2 text-xs font-medium text-slate-700">No invoices issued yet</p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Billing statements will automatically appear here once proposals are converted to active projects.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-slate-200 bg-slate-50/70 text-slate-500">
                    <tr>
                      <th className="py-2.5 px-4 font-medium">Invoice #</th>
                      <th className="py-2.5 px-4 font-medium">Issued Date</th>
                      <th className="py-2.5 px-4 font-medium">Due Date</th>
                      <th className="py-2.5 px-4 font-medium">Amount</th>
                      <th className="py-2.5 px-4 font-medium">Status</th>
                      <th className="py-2.5 px-4 font-medium text-right">Payment</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {safeInvoices.map((inv) => (
                      <tr key={inv.id} className="hover:bg-slate-50/60">
                        <td className="py-3 px-4 font-mono font-medium text-slate-900">
                          {inv.invoiceNumber}
                        </td>
                        <td className="py-3 px-4 text-slate-600">
                          {new Date(inv.issuedDate).toLocaleDateString([], {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </td>
                        <td className="py-3 px-4 text-slate-600">
                          {new Date(inv.dueDate).toLocaleDateString([], {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </td>
                        <td className="py-3 px-4 font-semibold text-slate-900">
                          {formatCurrency(inv.totalAmount)}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${
                              inv.status === 'paid'
                                ? 'bg-emerald-100 text-emerald-800'
                                : inv.status === 'sent'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {inv.status === 'paid' && <Check className="h-2.5 w-2.5" />}
                            {inv.status.toUpperCase()}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          {inv.status === 'paid' ? (
                            <span className="text-[11px] text-emerald-700 font-medium">Settled</span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                if (onOpenRazorpayModal) {
                                  onOpenRazorpayModal(inv);
                                } else if (onPayInvoice) {
                                  onPayInvoice(inv.id);
                                }
                              }}
                              className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-700 px-3 py-1.5 text-[11px] font-medium text-white shadow-2xs hover:bg-emerald-800 transition-colors"
                            >
                              <CreditCard className="h-3 w-3" />
                              Pay Now
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
