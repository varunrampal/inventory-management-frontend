// src/pages/PottingListsPage.jsx
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useRealm } from '../context/RealmContext';
import Layout from '../components/Layout';

const API_BASE = import.meta.env.VITE_API_BASE_URL;

const seasons = ["Spring", "Summer", "Fall", "Winter"];
const sizes = ["#1", "#2", "#3", "10 cm", "15 cm"]; // adjust to your catalog

export default function ListPottingListsPage() {
  const { realmId } = useRealm();
  const [year, setYear] = useState("");
  const [season, setSeason] = useState("");
  const [customer, setCustomer] = useState("");
  const [size, setSize] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);

  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({ rows: [], total: 0, pages: 0 });

  const years = useMemo(() => {
    const now = new Date().getFullYear();
    return Array.from({ length: 6 }, (_, i) => now - i); // last 6 yrs
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    const run = async () => {
      setLoading(true);
      const params = new URLSearchParams();
      if (year) params.set("year", year);
      if (season) params.set("season", season);
      if (customer) params.set("customer", customer);
      if (size) params.set("size", size);
      params.set("realmId", realmId);
      params.set("page", page);
      params.set("limit", limit);

      try {
        const res = await fetch(`${API_BASE}/admin/pottinglists?${params.toString()}`, {
          credentials: "include",
          signal: controller.signal,
        });
        const json = await res.json();
        if (!controller.signal.aborted) setData(json);
      } catch (e) {
        if (!controller.signal.aborted) console.error(e);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };
    run();
    return () => controller.abort();
  }, [year, season, customer, size, page, limit]);

  return (
     <Layout>
                <h1 className="text-2xl font-semibold mb-4">Potting Lists</h1>
    <div className="p-4 space-y-4">
     

      {/* Filters */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-5">
        <select className="rounded-md border p-2"
          value={year} onChange={e => { setPage(1); setYear(e.target.value); }}>
          <option value="">All Years</option>
          {years.map(y => <option key={y} value={y}>{y}</option>)}
        </select>

        <select className="rounded-md border p-2"
          value={season} onChange={e => { setPage(1); setSeason(e.target.value); }}>
          <option value="">All Seasons</option>
          {seasons.map(s => <option key={s} value={s}>{s}</option>)}
        </select>

        <input
          className="rounded-md border p-2"
          placeholder="Customer name"
          value={customer}
          onChange={e => { setPage(1); setCustomer(e.target.value); }}
        />

        <select className="rounded-md border p-2"
          value={size} onChange={e => { setPage(1); setSize(e.target.value); }}>
          <option value="">All Sizes</option>
          {sizes.map(s => <option key={s} value={s}>{s}</option>)}
        </select>

        <select className="rounded-md border p-2"
          value={limit} onChange={e => { setPage(1); setLimit(Number(e.target.value)); }}>
          {[10, 20, 50, 100].map(n => <option key={n} value={n}>{n} / page</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-gray-700">
            <tr>
              <th className="px-3 py-2 text-left">#</th>
              
              <th className="px-3 py-2 text-left">Year</th>
              <th className="px-3 py-2 text-left">Season</th>
              <th className="px-3 py-2 text-left">Estimate#</th>
              <th className="px-3 py-2 text-left">Customer</th>
              <th className="px-3 py-2 text-left">Status</th>
              <th className="px-3 py-2 text-left">Reference</th>
              <th className="px-3 py-2 text-left">Updated</th>
              <th className="px-3 py-2"></th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {loading ? (
              <tr><td className="px-3 py-4" colSpan={8}>Loading…</td></tr>
            ) : data?.rows?.length ? (
              data.rows.map(r => (
                <tr key={r._id} className="hover:bg-gray-50">
                  <td className="px-3 py-2 font-medium">{r.code || r._id}</td>
                 
                  <td className="px-3 py-2">{r.year}</td>
                  <td className="px-3 py-2">{r.season}</td>
                   <td className="px-3 py-2">{r.docNumber || 'N/A'}</td>
                  <td className="px-3 py-2">{r.customerName}</td>
                  <td className="px-3 py-2">{r.status}</td>
                  <td className="px-3 py-2">{r.reference}</td>
                  <td className="px-3 py-2">{new Date(r.updatedAt).toLocaleString()}</td>
                  <td className="px-3 py-2">
                    <Link to={`/create-pottinglist/${r._id}`} 
                    state={{ realmId }}
                    className="text-blue-600 hover:underline">Open</Link>
                  </td>
                </tr>
              ))
            ) : (
              <tr><td className="px-3 py-4" colSpan={8}>No results</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600">
          Total: {data.total ?? 0}
        </div>
        <div className="flex items-center gap-2">
          <button
            className="rounded-md border px-3 py-1 disabled:opacity-50"
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page <= 1}
          >Prev</button>
          <span className="text-sm">Page {page} / {data.pages || 1}</span>
          <button
            className="rounded-md border px-3 py-1 disabled:opacity-50"
            onClick={() => setPage(p => Math.min((data.pages || 1), p + 1))}
            disabled={page >= (data.pages || 1)}
          >Next</button>
        </div>
      </div>
    </div>
    </Layout>
  );
}
