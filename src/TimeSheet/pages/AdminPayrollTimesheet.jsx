import React, { useEffect, useMemo, useState } from "react";
import { useRealm } from "../../context/RealmContext";
import Layout from "../../components/Layout";
/**
 * AdminPayrollTimesheet.jsx
 *
 * Drop this into your app (e.g., src/pages/AdminPayrollTimesheet.jsx)
 * and route to it. Tailwind recommended.
 *
 * Expected backend (customize API_BASE):
 *  GET  /admin/payroll/periods                     -> [{ id, label, start, end }]
 *  GET  /admin/payroll/summary?periodId=PERIOD_ID  -> {
 *        period: { id, label, start, end },
 *        rows: [ { employeeId, employeeName, totalHours, hoursPaid, notes } ]
 *      }
 *  POST /admin/payroll/pay                          -> { ok: true }
 */

//const API_BASE = import.meta?.env?.VITE_API_BASE_URL || "";
const API_BASE = import.meta.env.VITE_API_BASE_URL;

export default function AdminPayrollTimesheet() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [periods, setPeriods] = useState([]);
  const [periodId, setPeriodId] = useState("");
  const [period, setPeriod] = useState(null);
  const [rows, setRows] = useState([]);
  const [globalNotes, setGlobalNotes] = useState("");
  const [error, setError] = useState("");
  const { realmId } = useRealm();

  // ---------------- Period helpers (UTC, biweekly, Saturday end) ----------------
  function buildBiweeklyPeriods({ count = 12 } = {}) {
    // Anchor is a Saturday that ends a valid period (inclusive)
    const anchorStr = import.meta?.env?.VITE_PAYROLL_ANCHOR_END || "2025-10-11"; // YYYY-MM-DD (Saturday)

    // Work in UTC to avoid DST edge cases
    const anchorEnd = new Date(`${anchorStr}T00:00:00.000Z`);
    const now = new Date();
    const todayEndUTC = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 23, 59, 59, 999));
    const MS14 = 14 * 24 * 3600 * 1000;

    // k gives the number of full 14-day steps from anchorEnd to todayEndUTC
    const k = Math.floor((todayEndUTC - anchorEnd) / MS14);
    const endRef = new Date(anchorEnd.getTime() + k * MS14); // most recent Saturday <= today

    const list = [];
    const half = Math.floor(count / 2);

    // Past periods
    for (let i = half; i >= 1; i--) {
      const end = new Date(endRef.getTime() - i * MS14);
      const start = new Date(end.getTime() - 13 * 24 * 3600 * 1000);
      list.push(periodFromRange(start, end));
    }
    // Current
    {
      const end = new Date(endRef);
      const start = new Date(end.getTime() - 13 * 24 * 3600 * 1000);
      list.push(periodFromRange(start, end));
    }
    // Future periods
    for (let i = 1; i <= half - 1; i++) {
      const end = new Date(endRef.getTime() + i * MS14);
      const start = new Date(end.getTime() - 13 * 24 * 3600 * 1000);
      list.push(periodFromRange(start, end));
    }
    return list;
  }

  function periodFromRange(start, end) {
    // Force UTC Y-M-D labels to match server
    const id = `${toYMDUTC(start)}_${toYMDUTC(end)}`;
    const label = `${fmtUTC(start)} → ${fmtUTC(end)} (Sat end)`;
    return { id, label, start: start.toISOString(), end: end.toISOString() };
  }

  function toYMDUTC(d) {
    const yr = d.getUTCFullYear();
    const mo = String(d.getUTCMonth() + 1).padStart(2, "0");
    const da = String(d.getUTCDate()).padStart(2, "0");
    return `${yr}-${mo}-${da}`;
  }

  function fmtUTC(d) {
    return `${d.toLocaleString(undefined, { month: 'short', day: '2-digit', timeZone: 'UTC' })} ${d.getUTCFullYear()}`;
  }

  // Pick the current period based on UTC date falling within [start..end]
  function pickCurrentPeriod(list) {
    if (!Array.isArray(list) || !list.length) return null;
    const now = new Date();
    const nowUTC = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 12, 0, 0, 0)); // noon UTC to be safe

    // First pass: explicit start/end
    for (const p of list) {
      const s = p.start ? new Date(p.start) : null;
      const e = p.end ? new Date(p.end) : null;
      if (s && e && s <= nowUTC && nowUTC <= e) return p;
    }
    // Second pass: infer from id (YYYY-MM-DD_YYYY-MM-DD)
    for (const p of list) {
      if (!p?.id || typeof p.id !== 'string') continue;
      const [sStr, eStr] = p.id.split('_');
      if (!sStr || !eStr) continue;
      const s = new Date(`${sStr}T00:00:00.000Z`);
      const e = new Date(`${eStr}T23:59:59.999Z`);
      if (s <= nowUTC && nowUTC <= e) return p;
    }
    // Fallback: nearest period that ended before now
    let best = list[0];
    let bestEnd = new Date(best.end || (best.id?.split('_')[1] ? `${best.id.split('_')[1]}T23:59:59.999Z` : 0));
    for (const p of list) {
      const e = new Date(p.end || (p.id?.split('_')[1] ? `${p.id.split('_')[1]}T23:59:59.999Z` : 0));
      if (e <= nowUTC && e > bestEnd) { best = p; bestEnd = e; }
    }
    return best || list[0];
  }
  // ------- Load periods -------
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError("");
      try {
        let list = [];
        if (API_BASE) {
          const res = await fetch(`${API_BASE}/admin/payroll/periods`, { headers: authHeaders() });
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          list = await res.json();
        }
        if (!list?.length) list = buildBiweeklyPeriods({ count: 12 });
        if (!cancelled) {
          setPeriods(list);
          const cur = pickCurrentPeriod(list);
          setPeriodId(cur?.id || list[0]?.id || "");
        }
      } catch (e) {
        if (!cancelled) {
          console.error(e);
          const list = buildBiweeklyPeriods({ count: 12 });
          setPeriods(list);
          const cur = pickCurrentPeriod(list);
          setPeriodId(cur?.id || list[0]?.id || "");
          setError("Could not load payroll periods. Using demo periods.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // ------- Load summary whenever period changes -------
  useEffect(() => {
    if (!periodId) return;
    let cancelled = false;
    console.log('realmId', realmId);
    (async () => {
      setLoading(true);
      setError("");
      try {
        if (API_BASE) {
          const res = await fetch(`${API_BASE}/admin/payroll/summary?periodId=${encodeURIComponent(periodId)}&realmId=${encodeURIComponent(realmId)}`,
            { headers: authHeaders(), "x-realm-id": realmId });
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          const data = await res.json();
          if (cancelled) return;
          setPeriod(data.period || periods.find(p => p.id === periodId) || null);
          setRows((data.rows || []).map(hydrateRow));
          setGlobalNotes(data.globalNotes || "");
        } else {
          // demo data
          const selected = periods.find(p => p.id === periodId) || null;
          if (cancelled) return;
          setPeriod(selected);
          setRows([
            { employeeId: "68e339877d37879df8bbf346", employeeName: "Amanpreet Kaur", totalHours: 76, hoursPaid: 40, notes: "Paid first week" },
            { employeeId: "68e339877d37879df8bbf347", employeeName: "Gurpreet Singh", totalHours: 82.5, hoursPaid: 60, notes: "OT pending" },
            { employeeId: "68e339877d37879df8bbf348", employeeName: "Navdeep Gill", totalHours: 68, hoursPaid: 0, notes: "Verify 10/03 shift" },
          ].map(hydrateRow));
          setGlobalNotes("");
        }
      } catch (e) {
        if (!cancelled) {
          console.error(e);
          setError("Could not load data for the selected period.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [periodId, API_BASE, periods.length]);

  function authHeaders() {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  }



  function hydrateRow(r) {
    const clean = {
      employeeId: r.employeeId,
      employeeName: r.employeeName,
      totalHours: Number(r.totalHours || 0),
      cashHourlyRate: r.cashHourlyRate != null ? Number(r.cashHourlyRate) : null,
      hoursPaid: Number(r.hoursPaid || 0),
      notes: r.notes || "",
    };
    const balanceHours = round2(clean.totalHours - clean.hoursPaid);
    const cashPaid = Number.isFinite(Number(clean.cashHourlyRate))
      ? round2(clean.hoursPaid * Number(clean.cashHourlyRate))
      : 0;
    return { ...clean, balance: balanceHours, cashPaid };
  }

  function round2(n) {
    return Math.round((Number(n) || 0) * 100) / 100;
  }

  function fmtCAD(n) {
    return Number.isFinite(Number(n))
      ? new Intl.NumberFormat("en-CA", { style: "currency", currency: "CAD" }).format(Number(n))
      : "—";
  }

function buildCSV(rows, periodMeta) {
const pStart = periodMeta?.start ? String(periodMeta.start).slice(0, 10) : "";
const pEnd = periodMeta?.end ? String(periodMeta.end).slice(0, 10) : "";
const pLabel = periodMeta?.label || "";


// Top metadata block (single header + single value row), then a blank line
const periodHeader = ["Period Start","Period End","Period Label"];
const periodValues = [pStart, pEnd, pLabel];


// Employee table (no period columns per row)
const empHeaders = [
"Employee ID","Employee Name","Total Hours","Cash Rate","Hours Paid","Balance","Cash Paid","Notes"
];
const empLines = rows.map(r => [
r.employeeId,
r.employeeName,
r.totalHours,
Number.isFinite(Number(r.cashHourlyRate)) ? Number(r.cashHourlyRate).toFixed(2) : "",
r.hoursPaid,
r.balance,
r.cashPaid,
(r.notes || "").replaceAll("", " ")
]);
const chunks = [periodHeader, periodValues, [], empHeaders, ...empLines];
return chunks.map(arr => arr.map(cell => toCSV(cell)).join(",")).join("");
}
  const totals = useMemo(() => {
    const totalHours = rows.reduce((s, r) => s + (Number(r.totalHours) || 0), 0);
    const totalPaid = rows.reduce((s, r) => s + (Number(r.hoursPaid) || 0), 0);
    const totalBal = round2(totalHours - totalPaid);
    const totalCashPaid = rows.reduce((s, r) => s + (Number(r.cashPaid) || 0), 0);
    return { totalHours: round2(totalHours), totalPaid: round2(totalPaid), totalBal, totalCashPaid: round2(totalCashPaid) };
  }, [rows]);

  function onEditHoursPaid(idx, val) {
    setRows(prev => prev.map((r, i) => i === idx ? hydrateRow({ ...r, hoursPaid: parseFloat(val || 0) }) : r));
  }

  function onEditNotes(idx, val) {
    setRows(prev => prev.map((r, i) => i === idx ? { ...r, notes: val } : r));
  }

  async function onSave() {
    setSaving(true);
    setError("");
    try {
      if (!periodId) throw new Error("No period selected");
      const payload = {
        periodId,
        realmId,
        rows: rows.map(r => ({ employeeId: r.employeeId, hoursPaid: Number(r.hoursPaid || 0), notes: r.notes || "" })),
        globalNotes,
      };
      if (API_BASE) {
        const res = await fetch(`${API_BASE}/admin/payroll/pay`, {
          method: "POST",
          headers: { "Content-Type": "application/json", ...authHeaders() },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
      } else {
        console.log("[DEMO] Would POST:", payload);
      }
    } catch (e) {
      console.error(e);
      setError(e.message || "Save failed");
    } finally {
      setSaving(false);
    }
  }


function exportCSV() {
const csv = buildCSV(rows, period);
const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
const url = URL.createObjectURL(blob);
const a = document.createElement("a");
a.href = url;
a.download = `Cash_payroll_${periodId||"period"}.csv`;
a.click();
URL.revokeObjectURL(url);
}

  function toCSV(v) {
    if (v == null) return "";
    const s = String(v);
    if (s.includes(",") || s.includes("\n") || s.includes('"')) {
      return '"' + s.replaceAll('"', '""') + '"';
    }
    return s;
  }

  function markAllPaid() {
    setRows(prev => prev.map(r => hydrateRow({ ...r, hoursPaid: r.totalHours })));
  }

  return (
    <Layout>
      <div className="p-4 md:p-6 max-w-6xl mx-auto">
        <div className="mb-6 flex items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold">Employee Payout</h1>
            {/* <p className="text-sm text-gray-500">Select a payroll period to review total hours, enter hours paid, and add notes.</p> */}
          </div>
          <div className="flex items-center gap-3">
            <button onClick={exportCSV} className="rounded-xl border px-3 py-2 text-sm hover:bg-gray-50">Export CSV</button>
            <button onClick={markAllPaid} className="rounded-xl border px-3 py-2 text-sm hover:bg-gray-50">Mark all paid</button>
            <button onClick={onSave} disabled={saving} className="rounded-xl bg-green-600 px-4 py-2 text-white shadow hover:bg-green-700 disabled:opacity-60">{saving ? "Saving..." : "Save"}</button>
          </div>
        </div>

        <div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-3">
          <label className="md:col-span-2">
            <div className="text-sm font-medium mb-1">Payroll period</div>
            <select
              className="w-full rounded-xl border px-3 py-2"
              value={periodId}
              onChange={(e) => setPeriodId(e.target.value)}
            >
              {periods.map(p => (
                <option key={p.id} value={p.id}>{p.label}</option>
              ))}
            </select>
          </label>
          <div className="rounded-2xl border p-3 bg-gray-50">
            <div className="text-xs text-gray-500">Totals (display only)</div>
            <div className="mt-1 flex justify-between text-sm"><span>Total hours</span><span className="font-medium">{totals.totalHours}</span></div>
            <div className="flex justify-between text-sm"><span>Hours paid</span><span className="font-medium">{totals.totalPaid}</span></div>
            <div className="flex justify-between text-sm"><span>Balance</span><span className="font-medium">{totals.totalBal}</span></div>
            <div className="flex justify-between text-sm"><span>Cash paid</span><span className="font-medium">{fmtCAD(totals.totalCashPaid)}</span></div>
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded-xl border border-red-300 bg-red-50 p-3 text-red-700 text-sm">{error}</div>
        )}

        <div className="overflow-auto rounded-2xl border">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-left">
              <tr>
                <th className="px-3 py-2">Employee</th>
                <th className="px-3 py-2">Total Hours</th>
                <th className="px-3 py-2">Cash Rate</th>
                <th className="px-3 py-2">Hours Paid</th>
                <th className="px-3 py-2">Balance</th>
                <th className="px-3 py-2">Cash Paid</th>
                <th className="px-3 py-2">Notes</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td className="px-3 py-6 text-center text-gray-500" colSpan={5}>Loading…</td></tr>
              ) : rows.length === 0 ? (
                <tr><td className="px-3 py-6 text-center text-gray-500" colSpan={5}>No records in this period.</td></tr>
              ) : (
                rows.map((r, idx) => (
                  <tr key={r.employeeId} className="border-t">
                    <td className="px-3 py-2 whitespace-nowrap">
                      <div className="font-medium">{r.employeeName}</div>
                      {/* <div className="text-xs text-gray-500">{r.employeeId}</div> */}
                    </td>
                    <td className="px-3 py-2">{r.totalHours}</td>
                    <td className="px-3 py-2">{Number.isFinite(Number(r.cashHourlyRate))
                      ? `$${Number(r.cashHourlyRate).toFixed(2)}`
                      : "—"}</td>
                    <td className="px-3 py-2">
                      <input
                        type="number"
                        step="0.25"
                        min="0"
                        value={r.hoursPaid}
                        onChange={(e) => onEditHoursPaid(idx, e.target.value)}
                        className="w-28 rounded-lg border px-2 py-1"
                      />
                    </td>
                    <td className="px-3 py-2 font-medium">{r.balance}</td>
                    <td className="px-3 py-2">{fmtCAD(r.cashPaid)}</td>
                    <td className="px-3 py-2">
                      <textarea
                        value={r.notes}
                        onChange={(e) => onEditNotes(idx, e.target.value)}
                        rows={2}
                        className="w-full rounded-lg border px-2 py-1"
                        placeholder="Notes (optional)"
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium mb-1">Notes (for the whole period)</label>
          <textarea
            value={globalNotes}
            onChange={(e) => setGlobalNotes(e.target.value)}
            rows={3}
            className="w-full rounded-xl border px-3 py-2"
            placeholder="Any overall notes or approvals for this payroll period"
          />
        </div>

        {period && (
          <div className="mt-6 text-xs text-gray-500">
            <div>Period: <span className="font-medium">{period.label || periodId}</span></div>
          </div>
        )}
      </div>
    </Layout>
  );
}
