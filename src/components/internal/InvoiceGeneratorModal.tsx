import React, { useState, useMemo } from 'react';
import {
  Receipt,
  Plus,
  Trash2,
  Printer,
  X,
  CreditCard,
  Building2,
  FileCheck2,
  Download,
  Send,
  Sparkles,
  Layers,
} from 'lucide-react';
import { Client, Project, Milestone, Task, Invoice } from '../../types';

interface InvoiceGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  clients: Client[];
  projects: Project[];
  milestones: Milestone[];
  tasks: Task[];
  onSaveInvoice: (invoiceData: {
    clientId: string;
    projectId?: string | null;
    invoiceNumber: string;
    issuedDate: string;
    dueDate: string;
    lineItems: { label: string; amount: number; quantity?: number; unitPrice?: number }[];
    subtotal: number;
    taxRate: number;
    taxAmount: number;
    discountAmount: number;
    notes: string;
    currency: string;
    status: Invoice['status'];
  }) => void;
}

interface GeneratorLineItem {
  id: string;
  label: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

export const InvoiceGeneratorModal: React.FC<InvoiceGeneratorModalProps> = ({
  isOpen,
  onClose,
  clients,
  projects,
  milestones,
  tasks,
  onSaveInvoice,
}) => {
  const [activeTab, setActiveTab] = useState<'editor' | 'preview'>('editor');

  // Core Form State
  const [selectedClientId, setSelectedClientId] = useState<string>(clients[0]?.id || '');
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [invoiceNumber, setInvoiceNumber] = useState<string>(() => {
    return `INV-ALG-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;
  });
  const [currency, setCurrency] = useState<string>('USD');
  const [issuedDate, setIssuedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [terms, setTerms] = useState<'due_on_receipt' | 'net15' | 'net30' | 'net60'>('net15');
  const [dueDate, setDueDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 15);
    return d.toISOString().split('T')[0];
  });

  const [lineItems, setLineItems] = useState<GeneratorLineItem[]>([
    {
      id: 'li-gen-1',
      label: 'Technical Architecture & Deployment Retainer',
      quantity: 1,
      unitPrice: 6500,
      amount: 6500,
    },
    {
      id: 'li-gen-2',
      label: 'Streaming Ingestion Engine Engineering Sprint',
      quantity: 40,
      unitPrice: 150,
      amount: 6000,
    },
  ]);

  const [taxRate, setTaxRate] = useState<number>(0);
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [notes, setNotes] = useState<string>(
    'Payment can be made via Razorpay gateway or corporate wire transfer. Please quote invoice number upon remittance.'
  );

  // Auto calculate due date when terms change
  const handleTermsChange = (newTerms: 'due_on_receipt' | 'net15' | 'net30' | 'net60') => {
    setTerms(newTerms);
    const d = new Date(issuedDate);
    if (newTerms === 'due_on_receipt') {
      // same day
    } else if (newTerms === 'net15') {
      d.setDate(d.getDate() + 15);
    } else if (newTerms === 'net30') {
      d.setDate(d.getDate() + 30);
    } else if (newTerms === 'net60') {
      d.setDate(d.getDate() + 60);
    }
    setDueDate(d.toISOString().split('T')[0]);
  };

  // Selected client & filtered projects
  const currentClient = clients.find((c) => c.id === selectedClientId) || clients[0];
  const clientProjects = useMemo(() => {
    return projects.filter((p) => p.clientId === selectedClientId);
  }, [projects, selectedClientId]);

  // Unbilled milestones and tasks for quick-import
  const projectMilestones = useMemo(() => {
    if (!selectedProjectId) return [];
    return milestones.filter((m) => m.projectId === selectedProjectId);
  }, [milestones, selectedProjectId]);

  const projectTasks = useMemo(() => {
    if (!selectedProjectId) return [];
    return tasks.filter((t) => t.projectId === selectedProjectId);
  }, [tasks, selectedProjectId]);

  // Calculations
  const subtotal = useMemo(() => {
    return lineItems.reduce((acc, item) => acc + item.amount, 0);
  }, [lineItems]);

  const taxAmount = useMemo(() => {
    return Math.round((subtotal * (Number(taxRate) || 0)) / 100);
  }, [subtotal, taxRate]);

  const totalAmount = useMemo(() => {
    return Math.max(0, subtotal + taxAmount - (Number(discountAmount) || 0));
  }, [subtotal, taxAmount, discountAmount]);

  // Line item handlers
  const updateLineItem = (
    id: string,
    field: 'label' | 'quantity' | 'unitPrice',
    val: any
  ) => {
    setLineItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const updated = { ...item, [field]: val };
        const q = field === 'quantity' ? Number(val) || 0 : item.quantity;
        const u = field === 'unitPrice' ? Number(val) || 0 : item.unitPrice;
        updated.amount = q * u;
        return updated;
      })
    );
  };

  const addLineItem = () => {
    setLineItems((prev) => [
      ...prev,
      {
        id: `li-${Date.now()}`,
        label: 'Engineering Deliverable',
        quantity: 1,
        unitPrice: 2500,
        amount: 2500,
      },
    ]);
  };

  const removeLineItem = (id: string) => {
    if (lineItems.length > 1) {
      setLineItems((prev) => prev.filter((item) => item.id !== id));
    }
  };

  const importMilestoneAsLineItem = (milestone: Milestone) => {
    setLineItems((prev) => [
      ...prev,
      {
        id: `li-${Date.now()}`,
        label: `${milestone.title}: ${milestone.description.substring(0, 70)}`,
        quantity: 1,
        unitPrice: 5000,
        amount: 5000,
      },
    ]);
  };

  const handleSave = (status: Invoice['status']) => {
    onSaveInvoice({
      clientId: selectedClientId,
      projectId: selectedProjectId || null,
      invoiceNumber,
      issuedDate,
      dueDate,
      lineItems: lineItems.map((li) => ({
        label: li.label,
        amount: li.amount,
        quantity: li.quantity,
        unitPrice: li.unitPrice,
      })),
      subtotal,
      taxRate: Number(taxRate) || 0,
      taxAmount,
      discountAmount: Number(discountAmount) || 0,
      notes,
      currency,
      status,
    });
    onClose();
  };

  const handlePrint = () => {
    window.print();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-3 sm:p-4 backdrop-blur-xs overflow-y-auto">
      <div className="flex flex-col w-full max-w-4xl max-h-[92vh] rounded-md border border-slate-300 bg-white shadow-xl overflow-hidden">
        {/* Modal Top Header */}
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-5 py-3.5">
          <div className="flex items-center gap-2.5">
            <Receipt className="h-4 w-4 text-slate-700" />
            <h2 className="text-sm font-medium text-slate-900 tracking-tight">
              Enterprise Invoice Generator
            </h2>
            <span className="rounded-xs border border-slate-200 bg-white px-2 py-0.5 text-[11px] font-medium text-slate-600">
              {invoiceNumber}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Tab switch */}
            <div className="inline-flex rounded-md border border-slate-200 bg-white p-0.5 text-xs">
              <button
                type="button"
                onClick={() => setActiveTab('editor')}
                className={`rounded px-2.5 py-1 transition-colors ${
                  activeTab === 'editor'
                    ? 'bg-slate-900 font-medium text-white'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Invoice Editor
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('preview')}
                className={`rounded px-2.5 py-1 transition-colors ${
                  activeTab === 'preview'
                    ? 'bg-slate-900 font-medium text-white'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Official PDF Preview
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="rounded p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-700"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 text-xs text-slate-700">
          {activeTab === 'editor' ? (
            <div className="space-y-6">
              {/* Section 1: Client & Project Setup */}
              <div className="grid grid-cols-1 gap-4 rounded-md border border-slate-200 bg-slate-50/50 p-4 sm:grid-cols-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Client Organization *
                  </label>
                  <select
                    value={selectedClientId}
                    onChange={(e) => {
                      setSelectedClientId(e.target.value);
                      setSelectedProjectId('');
                    }}
                    className="w-full rounded-md border border-slate-300 bg-white p-2 text-xs font-normal text-slate-800"
                  >
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.companyName} ({c.contactName})
                      </option>
                    ))}
                  </select>
                  {currentClient && (
                    <p className="mt-1 text-[11px] text-slate-500">
                      Billing Contact: {currentClient.contactEmail}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Associated Project (Optional)
                  </label>
                  <select
                    value={selectedProjectId}
                    onChange={(e) => setSelectedProjectId(e.target.value)}
                    className="w-full rounded-md border border-slate-300 bg-white p-2 text-xs font-normal text-slate-800"
                  >
                    <option value="">General Retainer / No specific project</option>
                    {clientProjects.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Invoice Number
                  </label>
                  <input
                    type="text"
                    value={invoiceNumber}
                    onChange={(e) => setInvoiceNumber(e.target.value)}
                    className="w-full rounded-md border border-slate-300 bg-white p-2 text-xs font-normal text-slate-800"
                  />
                </div>
              </div>

              {/* Section 2: Dates & Payment Terms */}
              <div className="grid grid-cols-1 gap-4 rounded-md border border-slate-200 bg-white p-4 sm:grid-cols-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Issue Date
                  </label>
                  <input
                    type="date"
                    value={issuedDate}
                    onChange={(e) => setIssuedDate(e.target.value)}
                    className="w-full rounded-md border border-slate-300 p-2 text-xs font-normal text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Payment Terms
                  </label>
                  <select
                    value={terms}
                    onChange={(e) => handleTermsChange(e.target.value as any)}
                    className="w-full rounded-md border border-slate-300 p-2 text-xs font-normal text-slate-800"
                  >
                    <option value="net15">Net 15 Days</option>
                    <option value="net30">Net 30 Days</option>
                    <option value="net60">Net 60 Days</option>
                    <option value="due_on_receipt">Due on Receipt</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Due Date</label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full rounded-md border border-slate-300 p-2 text-xs font-normal text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Currency</label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="w-full rounded-md border border-slate-300 p-2 text-xs font-normal text-slate-800"
                  >
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                    <option value="INR">INR (₹)</option>
                  </select>
                </div>
              </div>

              {/* Quick Import Milestones Shelf (if project has milestones) */}
              {projectMilestones.length > 0 && (
                <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
                  <div className="flex items-center gap-1.5 text-xs font-medium text-slate-700 mb-2">
                    <Layers className="h-3.5 w-3.5 text-slate-500" />
                    <span>Import Project Milestones as Line Items:</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {projectMilestones.map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => importMilestoneAsLineItem(m)}
                        className="inline-flex items-center gap-1 rounded-xs border border-slate-300 bg-white px-2 py-1 text-[11px] font-normal text-slate-700 hover:bg-slate-100 transition-colors"
                      >
                        <Plus className="h-3 w-3 text-slate-500" />
                        <span className="truncate max-w-[200px]">{m.title}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Section 3: Line Items Table */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-medium text-slate-900 tracking-tight uppercase">
                    Billable Deliverables & Line Items
                  </h3>
                  <button
                    type="button"
                    onClick={addLineItem}
                    className="inline-flex items-center gap-1 rounded-md border border-slate-300 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
                  >
                    <Plus className="h-3.5 w-3.5 text-slate-500" />
                    Add Item
                  </button>
                </div>

                <div className="overflow-x-auto rounded-md border border-slate-200 bg-white">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-medium text-slate-600">
                        <th className="py-2.5 px-3">Item Description</th>
                        <th className="py-2.5 px-3 w-20 text-center">Qty / Hrs</th>
                        <th className="py-2.5 px-3 w-28 text-right">Unit Rate ({currency})</th>
                        <th className="py-2.5 px-3 w-28 text-right">Total ({currency})</th>
                        <th className="py-2.5 px-3 w-10 text-center"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs">
                      {lineItems.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-50/50">
                          <td className="p-2.5">
                            <input
                              type="text"
                              value={item.label}
                              onChange={(e) => updateLineItem(item.id, 'label', e.target.value)}
                              placeholder="Description of deliverable or service"
                              className="w-full rounded-md border border-slate-200 p-1.5 text-xs font-normal text-slate-800"
                            />
                          </td>
                          <td className="p-2.5">
                            <input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) => updateLineItem(item.id, 'quantity', e.target.value)}
                              className="w-full rounded-md border border-slate-200 p-1.5 text-center text-xs font-normal text-slate-800"
                            />
                          </td>
                          <td className="p-2.5">
                            <input
                              type="number"
                              min="0"
                              value={item.unitPrice}
                              onChange={(e) => updateLineItem(item.id, 'unitPrice', e.target.value)}
                              className="w-full rounded-md border border-slate-200 p-1.5 text-right text-xs font-normal text-slate-800"
                            />
                          </td>
                          <td className="p-2.5 text-right font-medium text-slate-900">
                            ${item.amount.toLocaleString()}
                          </td>
                          <td className="p-2.5 text-center">
                            <button
                              type="button"
                              onClick={() => removeLineItem(item.id)}
                              disabled={lineItems.length <= 1}
                              className="rounded p-1 text-slate-400 hover:text-red-600 disabled:opacity-30"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Section 4: Taxes, Discounts & Notes */}
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 pt-2">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Invoice Notes & Payment Instructions
                  </label>
                  <textarea
                    rows={4}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full rounded-md border border-slate-300 p-2 text-xs font-normal text-slate-800 leading-relaxed"
                  />
                  <div className="mt-2 flex items-center gap-1.5 text-[11px] text-slate-500">
                    <CreditCard className="h-3.5 w-3.5 text-slate-400" />
                    <span>Razorpay automated payment link will be assigned upon save.</span>
                  </div>
                </div>

                <div className="rounded-md border border-slate-200 bg-slate-50/80 p-4 space-y-2.5">
                  <div className="flex justify-between text-xs text-slate-600">
                    <span>Subtotal:</span>
                    <span className="font-medium text-slate-800">
                      ${subtotal.toLocaleString()}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-600">
                    <div className="flex items-center gap-1">
                      <span>Tax / GST / VAT (%):</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={taxRate}
                        onChange={(e) => setTaxRate(Number(e.target.value))}
                        className="w-16 rounded-md border border-slate-300 bg-white p-1 text-right text-xs"
                      />
                      <span className="w-16 text-right font-medium text-slate-800">
                        +${taxAmount.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-600">
                    <span>Discount ($):</span>
                    <input
                      type="number"
                      min="0"
                      value={discountAmount}
                      onChange={(e) => setDiscountAmount(Number(e.target.value))}
                      className="w-24 rounded-md border border-slate-300 bg-white p-1 text-right text-xs"
                    />
                  </div>

                  <div className="border-t border-slate-200 pt-2 flex justify-between text-sm font-medium text-slate-900">
                    <span>Total Amount Due:</span>
                    <span>${totalAmount.toLocaleString()} {currency}</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* ================= FORMAL PRINT / PDF PREVIEW TAB ================= */
            <div
              id="printable-invoice-container"
              className="mx-auto max-w-2xl rounded-md border border-slate-200 bg-white p-8 shadow-xs text-slate-900"
            >
              {/* Header */}
              <div className="flex justify-between items-start border-b border-slate-200 pb-6">
                <div>
                  <div className="text-xl font-medium tracking-tight text-slate-900">
                    Algotricz Technologies Inc.
                  </div>
                  <p className="mt-1 text-xs text-slate-500">
                    High-Performance Systems & Engineering
                  </p>
                  <p className="text-xs text-slate-500">operations@algotricz.com</p>
                </div>
                <div className="text-right">
                  <span className="text-xs uppercase tracking-widest font-medium text-slate-400">
                    Official Invoice
                  </span>
                  <div className="text-base font-medium text-slate-900 mt-0.5">
                    {invoiceNumber}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">Issued: {issuedDate}</p>
                  <p className="text-xs font-medium text-slate-800">Due Date: {dueDate}</p>
                </div>
              </div>

              {/* Bill To */}
              <div className="grid grid-cols-2 gap-4 py-6 border-b border-slate-200">
                <div>
                  <span className="text-[10px] uppercase tracking-wider font-medium text-slate-400">
                    Billed To
                  </span>
                  <div className="mt-1 text-xs font-medium text-slate-900">
                    {currentClient?.companyName}
                  </div>
                  <div className="text-xs text-slate-600">Attn: {currentClient?.contactName}</div>
                  <div className="text-xs text-slate-600">{currentClient?.contactEmail}</div>
                  <div className="text-xs text-slate-600">{currentClient?.phone}</div>
                </div>
                <div>
                  <span className="text-[10px] uppercase tracking-wider font-medium text-slate-400">
                    Project Context
                  </span>
                  <div className="mt-1 text-xs font-medium text-slate-900">
                    {clientProjects.find((p) => p.id === selectedProjectId)?.name ||
                      'Retainer & Operations Scope'}
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    Terms: {terms.replace('_', ' ').toUpperCase()}
                  </div>
                </div>
              </div>

              {/* Line items table */}
              <div className="py-6 border-b border-slate-200">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-[11px] font-medium text-slate-500 pb-2">
                      <th className="py-2">Item Description</th>
                      <th className="py-2 text-center">Qty</th>
                      <th className="py-2 text-right">Rate</th>
                      <th className="py-2 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {lineItems.map((item) => (
                      <tr key={item.id}>
                        <td className="py-2.5 font-normal text-slate-800">{item.label}</td>
                        <td className="py-2.5 text-center text-slate-600">{item.quantity}</td>
                        <td className="py-2.5 text-right text-slate-600">
                          ${item.unitPrice.toLocaleString()}
                        </td>
                        <td className="py-2.5 text-right font-medium text-slate-900">
                          ${item.amount.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Summary Calculation */}
              <div className="py-6 border-b border-slate-200 flex justify-end">
                <div className="w-64 space-y-1.5 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Subtotal:</span>
                    <span className="font-medium text-slate-800">${subtotal.toLocaleString()}</span>
                  </div>
                  {taxAmount > 0 && (
                    <div className="flex justify-between text-slate-600">
                      <span>Tax ({taxRate}%):</span>
                      <span className="font-medium text-slate-800">+${taxAmount.toLocaleString()}</span>
                    </div>
                  )}
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-emerald-700">
                      <span>Discount:</span>
                      <span>-${discountAmount.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="border-t border-slate-200 pt-2 flex justify-between text-sm font-medium text-slate-900">
                    <span>Total Balance Due:</span>
                    <span>${totalAmount.toLocaleString()} {currency}</span>
                  </div>
                </div>
              </div>

              {/* Notes & Remittance */}
              <div className="pt-4 text-xs text-slate-500">
                <span className="font-medium text-slate-700 block mb-1">Remittance & Notes:</span>
                <p className="leading-relaxed">{notes}</p>
                <div className="mt-4 rounded-xs border border-slate-200 bg-slate-50 p-2.5 text-[11px] text-slate-600 flex items-center justify-between">
                  <span>Online Payments: Authorized via Razorpay Gateway</span>
                  <span className="font-mono text-[10px] text-slate-500">
                    plink_{selectedClientId.replace(/[^a-zA-Z0-9]/g, '')}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Bottom Actions */}
        <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-5 py-3.5">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 transition-colors"
          >
            Cancel
          </button>

          <div className="flex items-center gap-2">
            {activeTab === 'preview' && (
              <button
                type="button"
                onClick={handlePrint}
                className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <Printer className="h-3.5 w-3.5 text-slate-500" />
                Print / Save PDF
              </button>
            )}

            <button
              type="button"
              onClick={() => handleSave('draft')}
              className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 transition-colors"
            >
              Save as Draft
            </button>

            <button
              type="button"
              onClick={() => handleSave('sent')}
              className="inline-flex items-center gap-1.5 rounded-md bg-slate-900 px-3.5 py-1.5 text-xs font-medium text-white hover:bg-slate-800 transition-colors"
            >
              <Send className="h-3.5 w-3.5" />
              Save & Send with Razorpay Link
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
