// src/pages/PaymentsListPage.jsx
// import React, { useEffect, useState } from "react";
// import PaymentsTable from "../components/PaymentsTable";

// export default function PaymentsListPage() {
//     const today = new Date().toISOString().substring(0, 10);
//     const [from, setFrom] = useState(today);
//     const [to, setTo] = useState(today);
//     const [entries, setEntries] = useState([]);
//     const [loading, setLoading] = useState(false);
//     const [error, setError] = useState(null);

//     const API_BASE = import.meta.env.VITE_API_BASE_URL;

//     const fetchEntries = async () => {
//         setLoading(true);
//         setError(null);
//         try {
//             const params = new URLSearchParams({
//                 from,
//                 to,
//             }).toString();

//             const res = await fetch(`${API_BASE}/admin/payments?${params}`, {
//                 method: 'GET',
//                 headers: {
//                     Authorization: `Bearer ${localStorage.getItem('token')}`,
//                     // 'Content-Type' is optional here since there's no body
//                 },
//             });
//            const data = await res.json();
//             setEntries(data|| []);
//         } catch (err) {
//             console.error(err);
//             setError("Error loading payments.");
//         } finally {
//             setLoading(false);
//         }
//     };

//     useEffect(() => {
//         // load for today by default
//         fetchEntries();
//         // eslint-disable-next-line react-hooks/exhaustive-deps
//     }, []);

//     return (
//         <div className="max-w-6xl mx-auto px-4 py-6 space-y-4">
//             <header className="flex items-center justify-between gap-4">
//                 <div>
//                     <h1 className="text-xl md:text-2xl font-bold">
//                         Payments – Entered Cash & eTransfers
//                     </h1>
//                     <p className="text-xs text-slate-500 mt-1">
//                         Filter by date range to see all payment entries in InvTrack.
//                     </p>
//                 </div>
//             </header>

//             <div className="bg-white rounded-xl border border-slate-200 p-4 md:p-6">
//                 <div className="flex flex-wrap items-end gap-4 justify-between">
//                     <div className="flex flex-wrap gap-4">
//                         <div>
//                             <label className="block text-xs font-medium mb-1">From</label>
//                             <input
//                                 type="date"
//                                 value={from}
//                                 onChange={(e) => setFrom(e.target.value)}
//                                 className="rounded-md border-slate-300 text-sm"
//                             />
//                         </div>
//                         <div>
//                             <label className="block text-xs font-medium mb-1">To</label>
//                             <input
//                                 type="date"
//                                 value={to}
//                                 onChange={(e) => setTo(e.target.value)}
//                                 className="rounded-md border-slate-300 text-sm"
//                             />
//                         </div>
//                     </div>

//                     <div className="flex items-center gap-3">
//                         <button
//                             type="button"
//                             onClick={fetchEntries}
//                             disabled={loading}
//                             className="inline-flex items-center rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
//                         >
//                             {loading ? "Loading..." : "Refresh"}
//                         </button>
//                     </div>
//                 </div>

//                 {error && <p className="text-sm text-red-600 mt-3">{error}</p>}
//             </div>

//             <PaymentsTable entries={entries} />
//         </div>
//     );
// }

import { useEffect, useState } from "react";
import PaymentsTable from "../components/PaymentsTable";

const COMPANY_OPTIONS = [
  { id: "123146276399949", label: "Green Flow Nurseries"},
  { id: "9341454894464212", label: "Peels Native Plants"},
  { id: "a11", label: "A11 Contracting" },
];

export default function PaymentsListPage() {
  const today = new Date().toISOString().substring(0, 10);
  const [from, setFrom] = useState(today);
  const [to, setTo] = useState(today);
  const [companyId, setCompanyId] = useState("123146276399949"); // default company
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const API_BASE = import.meta.env.VITE_API_BASE_URL;

  const fetchEntries = async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        from,
        to,
        companyId, // 👈 pass companyId
      }).toString();

      const res = await fetch(`${API_BASE}/admin/payments?${params}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const data = await res.json();
      setEntries(data || []);
    } catch (err) {
      console.error("Error loading payments:", err);
      setError("Error loading payments.");
      setEntries([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // load for today by default
    fetchEntries();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-4">
      <header className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold">
            Payments – Entered Cash & eTransfers
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Filter by date range and company to see all payment entries in
            InvTrack.
          </p>
        </div>
      </header>

      {/* Filter bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 md:p-6">
        <div className="flex flex-wrap items-end gap-4 justify-between">
          <div className="flex flex-wrap gap-4">
            <div>
              <label className="block text-xs font-medium mb-1">Company</label>
              <select
                value={companyId}
                onChange={(e) => setCompanyId(e.target.value)}
                className="rounded-md border-slate-300 text-sm"
              >
                {COMPANY_OPTIONS.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

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
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={fetchEntries}
              disabled={loading}
              className="inline-flex items-center rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
            >
              {loading ? "Loading..." : "Refresh"}
            </button>
          </div>
        </div>

        {error && <p className="text-sm text-red-600 mt-3">{error}</p>}
      </div>

      <PaymentsTable entries={entries} />
    </div>
  );
}
