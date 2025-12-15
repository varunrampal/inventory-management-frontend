import React from "react";

export default function PaymentsTable({ entries = [] }) {
  return (
    <section className="bg-white rounded-xl border border-slate-200 p-4 md:p-6 mt-2">
      <h3 className="text-sm font-semibold mb-3">Payments Entered</h3>

      <div className="overflow-x-auto">
        <table className="min-w-full text-xs border border-slate-200 rounded-lg overflow-hidden">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-2 py-2 text-left border-b">Date</th>
              <th className="px-2 py-2 text-left border-b">Customer</th>
              <th className="px-2 py-2 text-left border-b">Invoice #</th>
              <th className="px-2 py-2 text-left border-b">Type</th>
              <th className="px-2 py-2 text-right border-b">Amount</th>
              <th className="px-2 py-2 text-left border-b">Bank Ref / Deposit</th>
              <th className="px-2 py-2 text-left border-b">Posted?</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((e) => (
              <tr key={e._id || e.id} className="hover:bg-slate-50">
                <td className="px-2 py-2 border-b">
                  {e.paymentDate
                    ? new Date(e.paymentDate).toISOString().substring(0, 10)
                    : ""}
                </td>
                <td className="px-2 py-2 border-b">{e.customerName}</td>
                <td className="px-2 py-2 border-b">{e.invoiceNumber}</td>
                <td className="px-2 py-2 border-b capitalize">{e.paymentType}</td>
                <td className="px-2 py-2 border-b text-right">
                  {typeof e.amount === "number"
                    ? `$${e.amount.toFixed(2)}`
                    : ""}
                </td>
                <td className="px-2 py-2 border-b">
                  {e.bankReference || e.depositSlipNumber}
                </td>
                <td className="px-2 py-2 border-b">
                  {e.postedInAccounting ? "Yes" : "No"}
                </td>
              </tr>
            ))}

            {entries.length === 0 && (
              <tr>
                <td
                  colSpan={7}
                  className="px-2 py-4 text-center text-slate-500"
                >
                  No payments found for this period.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
