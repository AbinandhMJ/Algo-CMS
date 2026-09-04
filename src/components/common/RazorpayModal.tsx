import React, { useState } from 'react';
import { CreditCard, CheckCircle2, ShieldCheck, X } from 'lucide-react';
import { Invoice } from '../../types';

interface RazorpayModalProps {
  invoice: Invoice | null;
  clientCompanyName: string;
  isOpen: boolean;
  onClose: () => void;
  onPaymentSuccess: (invoiceId: string, paymentMethod: string) => void;
}

export const RazorpayModal: React.FC<RazorpayModalProps> = ({
  invoice,
  clientCompanyName,
  isOpen,
  onClose,
  onPaymentSuccess,
}) => {
  const [selectedMethod, setSelectedMethod] = useState<'card' | 'upi' | 'netbanking'>('card');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen || !invoice) return null;

  const handleSimulatePayment = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setIsSuccess(true);
      setTimeout(() => {
        onPaymentSuccess(invoice.id, `Razorpay (${selectedMethod.toUpperCase()})`);
        setIsSuccess(false);
        onClose();
      }, 1200);
    }, 1400);
  };

  return (
    <div
      id="razorpay-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
    >
      <div
        id="razorpay-checkout-container"
        className="w-full max-w-lg overflow-hidden rounded-lg border border-slate-300 bg-white shadow-sm"
      >
        {/* Razorpay branded header (flat, accessible contrast) */}
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-900 px-6 py-4 text-white">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded bg-blue-600 text-xs font-medium text-white">
              RZP
            </div>
            <div>
              <p className="text-xs text-slate-400 font-normal uppercase tracking-wider">
                Razorpay Payment Gateway
              </p>
              <h2 className="text-sm font-medium text-white">
                Algotricz Technologies Inc.
              </h2>
            </div>
          </div>
          <button
            id="close-razorpay-button"
            type="button"
            onClick={onClose}
            className="rounded p-1 text-slate-400 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Invoice Summary */}
        <div className="border-b border-slate-200 bg-slate-50 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-normal text-slate-500">Invoice Reference</span>
              <p className="text-sm font-medium text-slate-800">{invoice.invoiceNumber}</p>
            </div>
            <div className="text-right">
              <span className="text-xs font-normal text-slate-500">Amount Due</span>
              <p className="text-lg font-medium text-slate-900">
                ${invoice.totalAmount.toLocaleString()}
              </p>
            </div>
          </div>
          <p className="mt-1 text-xs font-normal text-slate-600">
            Billing Entity: <span className="font-medium text-slate-800">{clientCompanyName}</span>
          </p>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {isSuccess ? (
            <div className="flex flex-col items-center justify-center py-6 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-800">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <h3 className="mt-3 text-base font-medium text-slate-900">Payment Captured</h3>
              <p className="mt-1 text-xs font-normal text-slate-600">
                Transaction ID: rzp_pay_{Math.random().toString(36).substring(2, 11)}
              </p>
              <p className="mt-2 text-xs font-normal text-slate-500">
                Receipt and reconciliation logs updated instantly.
              </p>
            </div>
          ) : (
            <div>
              <p className="text-xs font-normal text-slate-700">Choose Payment Method</p>
              <div className="mt-3 grid grid-cols-3 gap-2">
                <button
                  id="razorpay-method-card"
                  type="button"
                  onClick={() => setSelectedMethod('card')}
                  className={`flex flex-col items-center justify-center rounded border p-3 text-xs transition-colors ${
                    selectedMethod === 'card'
                      ? 'border-slate-900 bg-slate-100 text-slate-900 font-medium'
                      : 'border-slate-200 text-slate-600 font-normal hover:border-slate-300'
                  }`}
                >
                  <CreditCard className="mb-1.5 h-4 w-4" />
                  Card / Corporate
                </button>
                <button
                  id="razorpay-method-upi"
                  type="button"
                  onClick={() => setSelectedMethod('upi')}
                  className={`flex flex-col items-center justify-center rounded border p-3 text-xs transition-colors ${
                    selectedMethod === 'upi'
                      ? 'border-slate-900 bg-slate-100 text-slate-900 font-medium'
                      : 'border-slate-200 text-slate-600 font-normal hover:border-slate-300'
                  }`}
                >
                  <span className="mb-1.5 text-xs font-medium">UPI</span>
                  Instant Pay
                </button>
                <button
                  id="razorpay-method-netbanking"
                  type="button"
                  onClick={() => setSelectedMethod('netbanking')}
                  className={`flex flex-col items-center justify-center rounded border p-3 text-xs transition-colors ${
                    selectedMethod === 'netbanking'
                      ? 'border-slate-900 bg-slate-100 text-slate-900 font-medium'
                      : 'border-slate-200 text-slate-600 font-normal hover:border-slate-300'
                  }`}
                >
                  <span className="mb-1.5 text-xs font-medium">ACH / NEFT</span>
                  Direct Bank Wire
                </button>
              </div>

              {/* Payment details form */}
              <div className="mt-4 rounded border border-slate-200 p-4">
                {selectedMethod === 'card' && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-normal text-slate-700">
                        Card Number
                      </label>
                      <input
                        type="text"
                        readOnly
                        value="•••• •••• •••• 4242"
                        className="mt-1 w-full rounded border border-slate-300 bg-slate-50 px-3 py-1.5 text-xs font-normal text-slate-800"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-normal text-slate-700">
                          Expiry
                        </label>
                        <input
                          type="text"
                          readOnly
                          value="12 / 29"
                          className="mt-1 w-full rounded border border-slate-300 bg-slate-50 px-3 py-1.5 text-xs font-normal text-slate-800"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-normal text-slate-700">
                          CVV
                        </label>
                        <input
                          type="password"
                          readOnly
                          value="•••"
                          className="mt-1 w-full rounded border border-slate-300 bg-slate-50 px-3 py-1.5 text-xs font-normal text-slate-800"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {selectedMethod === 'upi' && (
                  <div>
                    <label className="block text-xs font-normal text-slate-700">
                      Virtual Payment Address (VPA)
                    </label>
                    <input
                      type="text"
                      readOnly
                      value="finance@apexfin.okhdfcbank"
                      className="mt-1 w-full rounded border border-slate-300 bg-slate-50 px-3 py-1.5 text-xs font-normal text-slate-800"
                    />
                    <p className="mt-1.5 text-[11px] font-normal text-slate-500">
                      Approved mandate will request authorization on your banking app.
                    </p>
                  </div>
                )}

                {selectedMethod === 'netbanking' && (
                  <div>
                    <label className="block text-xs font-normal text-slate-700">
                      Select Primary Corporate Account
                    </label>
                    <select
                      disabled
                      className="mt-1 w-full rounded border border-slate-300 bg-slate-50 px-3 py-1.5 text-xs font-normal text-slate-800"
                    >
                      <option>HDFC Bank Corporate NetBanking</option>
                      <option>J.P. Morgan Treasury Services</option>
                    </select>
                  </div>
                )}
              </div>

              <div className="mt-4 flex items-center justify-between text-xs text-slate-500 font-normal">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-700" />
                  256-bit TLS Encrypted
                </span>
                <span>Payment Link ID: {invoice.razorpayPaymentLinkId || 'live_chk'}</span>
              </div>

              <div className="mt-5 flex justify-end gap-2.5">
                <button
                  id="cancel-razorpay-payment-btn"
                  type="button"
                  onClick={onClose}
                  disabled={isProcessing}
                  className="rounded border border-slate-300 bg-white px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  id="submit-razorpay-payment-btn"
                  type="button"
                  onClick={handleSimulatePayment}
                  disabled={isProcessing}
                  className="flex items-center gap-2 rounded bg-blue-600 px-5 py-2 text-xs font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {isProcessing ? 'Processing Transaction...' : `Pay $${invoice.totalAmount.toLocaleString()}`}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
