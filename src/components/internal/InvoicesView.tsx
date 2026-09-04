import React, { useState } from 'react';
import {
  Receipt,
  Plus,
  Send,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Trash2,
  X,
  CreditCard,
  FileSpreadsheet,
} from 'lucide-react';
import { Invoice, Client, Project, GoogleWorkspaceState } from '../../types';

interface InvoicesViewProps {
  invoices: Invoice[];
  clients: Client[];
  projects: Project[];
  googleWorkspace: GoogleWorkspaceState;
  onCreateInvoice: (data: {
    clientId: string;
    projectId?: string;
    lineItems: { label: string; amount: number }[];
    dueDate: string;
  }) => void;
  onSendInvoice: (invoiceId: string) => void;
  onMarkInvoicePaid: (invoiceId: string) => void;
  onOpenRazorpayCheckout: (invoice: Invoice) => void;
  onExportToGoogleSheets?: (invoices: Invoice[]) => void;
}

export const InvoicesView: React.FC<InvoicesViewProps> = ({
  invoices,
  clients,
  projects,
  googleWorkspace,
  onCreateInvoice,
  onSendInvoice,
  onMarkInvoicePaid,
  onOpenRazorpayCheckout,
  onExportToGoogleSheets,
}) => {
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(
    invoices[0]?.id || null
  );
  const [statusFilter, setStatusFilter] = useState<'all' | Invoice['status']>('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Form state
  const [targetClientId, setTargetClientId] = useState(clients[0]?.id || '');
  const [targetProjectId, setTargetProjectId] = useState<string>('');
  const [dueDate, setDueDate] = useState('2026-10-15');
  const [lineItems, setLineItems] = useState<{ id: string; label: string; amount: number }[]>([
    { id: 'item-1', label: 'Milestone 1 Deliverable & Retainer', amount: 8000 },
  ]);

  const filteredInvoices = invoices.filter(
    (inv) => statusFilter === 'all' || inv.status === statusFilter
  );

  const selectedInvoice = invoices.find((i) => i.id === selectedInvoiceId) || invoices[0] || null;
  const invoiceClient = clients.find((c) => c.id === selectedInvoice?.clientId);
  const invoiceProject = projects.find((p) => p.id === selectedInvoice?.projectId);

  const clientProjects = projects.filter((p) => p.clientId === targetClientId);

  const handleAddLineItem = () => {
    setLineItems([
      ...lineItems,
      { id: `item-${Date.now()}`, label: 'Billing Item', amount: 3000 },
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
    if (!targetClientId || lineItems.length === 0) return;

    onCreateInvoice({
      clientId: targetClientId,
      projectId: targetProjectId || undefined,
      dueDate,
      lineItems: lineItems.map((li) => ({ label: li.label, amount: Number(li.amount) || 0 })),
    });

    setIsCreateModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col justify-between gap-4 border-b border-slate-200 pb-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-xl font-medium text-slate-900">Billing, Invoices & Razorpay</h1>
          <p className="mt-1 text-xs font-normal text-slate-500">
            Internal ledger, invoice generator, automated conversion receipts, and payment links.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          {onExportToGoogleSheets && (
            <button
              id="export-sheets-btn"
              type="button"
              onClick={() => onExportToGoogleSheets(invoices)}
              className="flex items-center gap-1.5 rounded border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
            >
              <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-700" />
              <span>Export to Google Sheets</span>
            </button>
          )}
          <button
            id="open-create-invoice-modal-btn"
            type="button"
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-1.5 rounded bg-slate-900 px-3.5 py-1.5 text-xs font-medium text-white hover:bg-slate-800"
          >
            <Plus className="h-3.5 w-3.5" />
            Issue New Invoice
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto border-b border-slate-200 pb-2 text-xs">
        <span className="font-normal text-slate-500 mr-2">Filter status:</span>
        {(['all', 'draft', 'sent', 'paid', 'overdue'] as const).map((st) => (
          <button
            key={st}
            id={`filter-invoice-${st}`}
            type="button"
            onClick={() => setStatusFilter(st)}
            className={`rounded px-2.5 py-1 transition-colors ${
              statusFilter === st
                ? 'bg-slate-900 font-medium text-white'
                : 'bg-slate-100 font-normal text-slate-600 hover:bg-slate-200'
            }`}
          >
            {st.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Two Column Layout: Invoices List on Left, Selected Invoice Document on Right */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column: Invoices List */}
        <div className="space-y-2.5 lg:col-span-1">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-normal text-slate-500">
              {filteredInvoices.length} Invoices
            </span>
          </div>

          <div className="space-y-2">
            {filteredInvoices.map((inv) => {
              const client = clients.find((c) => c.id === inv.clientId);
              const isSelected = inv.id === selectedInvoice?.id;

              return (
                <div
                  key={inv.id}
                  id={`invoice-item-${inv.id}`}
                  onClick={() => setSelectedInvoiceId(inv.id)}
                  className={`cursor-pointer rounded-lg border p-4 transition-colors ${
                    isSelected
                      ? 'border-slate-900 bg-slate-50 shadow-xs'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="font-mono text-xs font-medium text-slate-900">
                        {inv.invoiceNumber}
                      </span>
                      <p className="mt-0.5 text-[11px] font-normal text-slate-500">
                        {client?.companyName}
                      </p>
                    </div>
                    <span
                      className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${
                        inv.status === 'paid'
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : inv.status === 'sent'
                          ? 'bg-blue-50 text-blue-800 border border-blue-200'
                          : inv.status === 'overdue'
                          ? 'bg-red-50 text-red-800 border border-red-200'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {inv.status}
                    </span>
                  </div>

                  <div className="mt-3 flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-900">
                      ${inv.totalAmount.toLocaleString()}
                    </span>
                    <span className="text-[11px] font-normal text-slate-500">
                      Due {inv.dueDate}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Invoice Document Preview */}
        <div className="lg:col-span-2">
          {selectedInvoice ? (
            <div
              id="invoice-document-card"
              className="space-y-6 rounded-lg border border-slate-200 bg-white p-6"
            >
              {/* Top Document Header */}
              <div className="flex flex-col justify-between gap-4 border-b border-slate-200 pb-5 sm:flex-row sm:items-start">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-normal text-slate-500 uppercase tracking-wider">
                      Tax Invoice
                    </span>
                    <span className="rounded bg-slate-100 px-2 py-0.5 font-mono text-[10px] text-slate-700">
                      {selectedInvoice.invoiceNumber}
                    </span>
                  </div>
                  <h2 className="mt-1 text-lg font-medium text-slate-900">
                    Algotricz Technologies Inc.
                  </h2>
                  <p className="text-xs font-normal text-slate-500">
                    High-performance systems engineering & architecture
                  </p>
                </div>

                <div className="flex flex-col items-end gap-2">
                  <span
                    className={`rounded px-2.5 py-1 text-xs font-medium ${
                      selectedInvoice.status === 'paid'
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : selectedInvoice.status === 'sent'
                        ? 'bg-blue-50 text-blue-800 border border-blue-200'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    STATUS: {selectedInvoice.status.toUpperCase()}
                  </span>
                  {selectedInvoice.status === 'paid' && selectedInvoice.paidAt && (
                    <span className="text-[10px] font-normal text-slate-500">
                      Paid on {new Date(selectedInvoice.paidAt).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>

              {/* Billed To & Project info */}
              <div className="grid grid-cols-2 gap-4 rounded border border-slate-200 bg-slate-50/70 p-4 text-xs">
                <div>
                  <span className="font-normal text-slate-500">Billed Entity:</span>
                  <p className="mt-1 font-medium text-slate-900">{invoiceClient?.companyName}</p>
                  <p className="font-normal text-slate-600">{invoiceClient?.contactName}</p>
                  <p className="font-normal text-slate-600">{invoiceClient?.contactEmail}</p>
                </div>
                <div>
                  <span className="font-normal text-slate-500">Invoice Metadata:</span>
                  <p className="mt-1 font-normal text-slate-700">
                    Associated Project:{' '}
                    <span className="font-medium text-slate-900">
                      {invoiceProject?.name || 'General Retainer'}
                    </span>
                  </p>
                  <p className="font-normal text-slate-700">Due Date: {selectedInvoice.dueDate}</p>
                  <p className="font-normal text-slate-700">
                    Razorpay Link ID:{' '}
                    <span className="font-mono text-[11px] text-slate-600">
                      {selectedInvoice.razorpayPaymentLinkId || 'unassigned'}
                    </span>
                  </p>
                </div>
              </div>

              {/* Line Items Table */}
              <div className="overflow-hidden rounded border border-slate-200">
                <table className="min-w-full divide-y divide-slate-200 text-xs">
                  <thead className="bg-slate-50 font-medium text-slate-700">
                    <tr>
                      <th className="px-4 py-2.5 text-left">Item Description</th>
                      <th className="px-4 py-2.5 text-right">Amount (USD)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white font-normal text-slate-700">
                    {selectedInvoice.lineItems.map((li) => (
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
                      <td className="px-4 py-2.5 text-left">Total Invoice Payable</td>
                      <td className="px-4 py-2.5 text-right font-mono text-sm">
                        ${selectedInvoice.totalAmount.toLocaleString()}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Actions: Send to client, test Razorpay payment, mark paid */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-4">
                <div className="flex items-center gap-2">
                  <button
                    id={`test-razorpay-btn-${selectedInvoice.id}`}
                    type="button"
                    onClick={() => onOpenRazorpayCheckout(selectedInvoice)}
                    className="flex items-center gap-1.5 rounded border border-blue-300 bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-800 hover:bg-blue-100"
                  >
                    <CreditCard className="h-3.5 w-3.5" />
                    Open Razorpay Gateway Checkout
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  {selectedInvoice.status === 'draft' && (
                    <button
                      id={`send-invoice-btn-${selectedInvoice.id}`}
                      type="button"
                      onClick={() => onSendInvoice(selectedInvoice.id)}
                      className="flex items-center gap-1.5 rounded bg-blue-700 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-800"
                    >
                      <Send className="h-3.5 w-3.5" />
                      Send to Client
                    </button>
                  )}

                  {selectedInvoice.status !== 'paid' && (
                    <button
                      id={`mark-paid-btn-${selectedInvoice.id}`}
                      type="button"
                      onClick={() => onMarkInvoicePaid(selectedInvoice.id)}
                      className="flex items-center gap-1.5 rounded border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-emerald-700 hover:bg-slate-50"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Mark Paid Manually
                    </button>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex h-64 items-center justify-center rounded-lg border border-dashed border-slate-300 p-6 text-center text-xs font-normal text-slate-500">
              Select an invoice from the list to preview the document and initiate Razorpay checkout.
            </div>
          )}
        </div>
      </div>

      {/* Modal: Create Invoice */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-lg border border-slate-300 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h2 className="text-sm font-medium text-slate-900">Issue New Invoice</h2>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="rounded p-1 text-slate-400 hover:text-slate-700"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block font-normal text-slate-700">Client Organization *</label>
                <select
                  value={targetClientId}
                  onChange={(e) => setTargetClientId(e.target.value)}
                  className="mt-1 w-full rounded border border-slate-300 bg-white px-3 py-1.5 font-normal text-slate-800"
                >
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.companyName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-normal text-slate-700">
                  Associated Project (Optional)
                </label>
                <select
                  value={targetProjectId}
                  onChange={(e) => setTargetProjectId(e.target.value)}
                  className="mt-1 w-full rounded border border-slate-300 bg-white px-3 py-1.5 font-normal text-slate-800"
                >
                  <option value="">-- None / General Retainer --</option>
                  {clientProjects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-normal text-slate-700">Payment Due Date *</label>
                <input
                  type="date"
                  required
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="mt-1 w-full rounded border border-slate-300 px-3 py-1.5 font-normal text-slate-800"
                />
              </div>

              {/* Dynamic Line Items */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block font-medium text-slate-800">Invoice Line Items</label>
                  <button
                    type="button"
                    onClick={handleAddLineItem}
                    className="flex items-center gap-1 text-xs font-normal text-blue-700 hover:underline"
                  >
                    <Plus className="h-3 w-3" />
                    Add Item
                  </button>
                </div>

                <div className="space-y-2">
                  {lineItems.map((li) => (
                    <div key={li.id} className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="Item description"
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
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="rounded border border-slate-300 px-3 py-1.5 font-medium text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded bg-slate-900 px-4 py-1.5 font-medium text-white hover:bg-slate-800"
                >
                  Generate Invoice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
