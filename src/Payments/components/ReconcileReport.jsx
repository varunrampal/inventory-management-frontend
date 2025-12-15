// src/components/payments/ReconcileReport.jsx
import { useState } from "react";
export default function ReconcileReport() {
  const today = new Date().toISOString().substring(0, 10);
  const [from, setFrom] = useState(today);
  const [to, setTo] = useState(today);
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState(null);
  const [error, setError] = useState(null);

  const API_BASE = import.meta.env.VITE_API_BASE_URL;
 
 const fetchReport = async () => {
    setLoading(true);
    setError(null);
    setReport(null);
    try {
             const params = new URLSearchParams({
                from,
                to,
            }).toString();
         
          const res = await fetch(`${API_BASE}/admin/payments/reconcile?${params}`, {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                    // 'Content-Type' is optional here since there's no body
                },
            });
         
            const data = await res.json();


       setReport(data);

    } catch (err) {
      console.error(err);
      setError("Error generating reconcile report.");
    } finally {
      setLoading(false);
    }
  };

  const exportCSV = () => {
    if (!report) return;
    const rows = [
      ["Date", "Cash", "eTransfer", "Total"],
      ...(report.daily || []).map((d) => [
        d.date,
        d.cash.toFixed(2),
        d.etransfer.toFixed(2),
        d.total.toFixed(2),
      ]),
      [],
      ["Summary"],
      ["Cash Total", report.totals.cash.toFixed(2)],
      ["eTransfer Total", report.totals.etransfer.toFixed(2)],
      ["Overall Total", report.totals.overall.toFixed(2)],
    ];

    const csvContent = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `reconcile_${from}_to_${to}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white shadow-sm rounded-xl border border-slate-200 p-4 md:p-6 mt-6">
      <div className="flex flex-wrap items-end gap-4 justify-between">
        <div>
          <h2 className="text-lg font-semibold mb-1">
            Reconcile Report (Cash vs eTransfer)
          </h2>
          <p className="text-xs text-slate-500">
            Select date range and click &quot;Generate&quot;.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div>
            <label className="block text-xs font-medium mb-1">From</label>
            <input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="rounded-md border-slate-300 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">To</label>
            <input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="rounded-md border-slate-300 text-sm"
            />
          </div>

          <button
            type="button"
            onClick={fetchReport}
            disabled={loading}
            className="inline-flex items-center rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
          >
            {loading ? "Generating..." : "Generate"}
          </button>

          {report && (
            <button
              type="button"
              onClick={exportCSV}
              className="inline-flex items-center rounded-md border border-slate-300 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
            >
              Export CSV
            </button>
          )}
        </div>
      </div>

      {error && <p className="text-sm text-red-600 mt-3">{error}</p>}

      {report && (
        <div className="mt-6 space-y-4">
          {/* Summary */}
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div className="rounded-lg border border-slate-200 p-3">
              <p className="text-xs text-slate-500 uppercase tracking-wide">
                Cash Total
              </p>
              <p className="text-lg font-semibold">
                ${report.totals.cash.toFixed(2)}
              </p>
            </div>
            <div className="rounded-lg border border-slate-200 p-3">
              <p className="text-xs text-slate-500 uppercase tracking-wide">
                eTransfer Total
              </p>
              <p className="text-lg font-semibold">
                ${report.totals.etransfer.toFixed(2)}
              </p>
            </div>
            <div className="rounded-lg border border-slate-200 p-3">
              <p className="text-xs text-slate-500 uppercase tracking-wide">
                Overall Total
              </p>
              <p className="text-lg font-semibold">
                ${report.totals.overall.toFixed(2)}
              </p>
            </div>
          </div>

          {/* Daily table */}
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm border border-slate-200 rounded-lg overflow-hidden">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-3 py-2 text-left font-medium text-slate-600 border-b">
                    Date
                  </th>
                  <th className="px-3 py-2 text-right font-medium text-slate-600 border-b">
                    Cash
                  </th>
                  <th className="px-3 py-2 text-right font-medium text-slate-600 border-b">
                    eTransfer
                  </th>
                  <th className="px-3 py-2 text-right font-medium text-slate-600 border-b">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody>
                {report.daily.map((row) => (
                  <tr key={row.date} className="hover:bg-slate-50">
                    <td className="px-3 py-2 border-b">{row.date}</td>
                    <td className="px-3 py-2 border-b text-right">
                      ${row.cash.toFixed(2)}
                    </td>
                    <td className="px-3 py-2 border-b text-right">
                      ${row.etransfer.toFixed(2)}
                    </td>
                    <td className="px-3 py-2 border-b text-right font-semibold">
                      ${row.total.toFixed(2)}
                    </td>
                  </tr>
                ))}
                {report.daily.length === 0 && (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-3 py-4 text-center text-slate-500"
                    >
                      No payments in this period.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
