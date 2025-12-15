// src/components/payments/PaymentEntryForm.jsx
import { useState } from "react";


const COMPANY_OPTIONS = [
  { id: "123146276399949", label: "Green Flow Nurseries"},
  { id: "9341454894464212", label: "Peels Native Plants"},
  { id: "a11", label: "A11 Contracting" },
];

const initialForm = {
  companyId:"123146276399949",
  companyName: "Green Flow Nurseries",
  paymentDate: new Date().toISOString().substring(0, 10),
  customerName: "",
  invoiceNumber: "",
  paymentType: "cash",
  amount: "",
  receivedBy: "",
  bankAccount: "",
  bankReceivedDate: "",
  bankReference: "",
  depositSlipNumber: "",
  postedInAccounting: false,
  notes: "",
};
 const API_BASE = import.meta.env.VITE_API_BASE_URL;
 const API_URL = `${API_BASE}/admin/payments`;
export default function PaymentEntryForm() {
  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  // const handleChange = (e) => {
  //   const { name, value, type, checked } = e.target;
  //   setForm((prev) => ({
  //     ...prev,
  //     [name]: type === "checkbox" ? checked : value,
  //   }));
  // };


  const handleChange = (e) => {
  const { name, value } = e.target;
  if (name === "companyId") {
    const selected = COMPANY_OPTIONS.find((c) => c.id === value);
    setForm((prev) => ({
      ...prev,
      companyId: value,
      companyName: selected?.label || "",
    }));
  } else {
    setForm((prev) => ({ ...prev, [name]: value }));
  }
};

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    setError(null);
    try {
    //   const payload = {
    //     ...form,
    //     amount: Number(form.amount || 0),
    //     paymentDate: form.paymentDate,
    //     bankReceivedDate: form.bankReceivedDate || null,
    //   };
         const res = await fetch(`${API_URL}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({  ...form,
        amount: Number(form.amount || 0),
        paymentDate: form.paymentDate,
        bankReceivedDate: form.bankReceivedDate || null, // NEW
        
        }),
      });

       const data = await res.json();
       console.log(data);
      setMessage("Payment entry saved.");
      setForm(initialForm);
    } catch (err) {
      console.error(err);
      setError("Error saving payment entry.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white shadow-sm rounded-xl border border-slate-200 p-4 md:p-6">
      <h2 className="text-lg font-semibold mb-4">
        Cash / eTransfer Payment Entry
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
  <label className="block text-sm font-medium mb-1">
    Company <span className="text-red-500">*</span>
  </label>
  <select
    name="companyId"
    value={form.companyId}
    onChange={handleChange}
    className="w-full rounded-md border-slate-300 text-sm"
    required
  >
    {COMPANY_OPTIONS.map((c) => (
      <option key={c.id} value={c.id}>
        {c.label}
      </option>
    ))}
  </select>
</div>
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="paymentDate"
              value={form.paymentDate}
              onChange={handleChange}
              className="w-full rounded-md border-slate-300 text-sm"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Customer Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="customerName"
              value={form.customerName}
              onChange={handleChange}
              className="w-full rounded-md border-slate-300 text-sm"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Invoice #
            </label>
            <input
              type="text"
              name="invoiceNumber"
              value={form.invoiceNumber}
              onChange={handleChange}
              className="w-full rounded-md border-slate-300 text-sm"
            />
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Payment Type <span className="text-red-500">*</span>
            </label>
            <select
              name="paymentType"
              value={form.paymentType}
              onChange={handleChange}
              className="w-full rounded-md border-slate-300 text-sm"
              required
            >
              <option value="cash">Cash</option>
              <option value="etransfer">eTransfer</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Amount <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="amount"
              step="0.01"
              value={form.amount}
              onChange={handleChange}
              className="w-full rounded-md border-slate-300 text-sm"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Received By
            </label>
            <input
              type="text"
              name="receivedBy"
              value={form.receivedBy}
              onChange={handleChange}
              className="w-full rounded-md border-slate-300 text-sm"
            />
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Bank Account
            </label>
            <input
              type="text"
              name="bankAccount"
              value={form.bankAccount}
              onChange={handleChange}
              className="w-full rounded-md border-slate-300 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Bank Received Date
            </label>
            <input
              type="date"
              name="bankReceivedDate"
              value={form.bankReceivedDate}
              onChange={handleChange}
              className="w-full rounded-md border-slate-300 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Bank Ref / Deposit Slip #
            </label>
            <input
              type="text"
              name="bankReference"
              value={form.bankReference}
              onChange={handleChange}
              placeholder="Bank Ref / Deposit Slip"
              className="w-full rounded-md border-slate-300 text-sm"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input
            id="postedInAccounting"
            type="checkbox"
            name="postedInAccounting"
            checked={form.postedInAccounting}
            onChange={handleChange}
            className="rounded border-slate-300"
          />
          <label htmlFor="postedInAccounting" className="text-sm">
            Posted in accounting (QuickBooks / InvTrack)
          </label>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Notes</label>
          <textarea
            name="notes"
            value={form.notes}
            onChange={handleChange}
            rows={2}
            className="w-full rounded-md border-slate-300 text-sm"
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
        >
          {saving ? "Saving..." : "Save Payment"}
        </button>

        {message && (
          <p className="text-sm text-emerald-600 mt-2">{message}</p>
        )}
        {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
      </form>
    </div>
  );
}
