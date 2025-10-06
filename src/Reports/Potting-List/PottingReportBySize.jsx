// src/pages/PottingReportBySize.jsx
import { useEffect, useMemo, useState, useRef } from "react";
import { useReactToPrint } from "react-to-print";
import Layout from "../../components/Layout";
//import { useRealm } from '../../context/RealmContext';

const API_BASE = import.meta.env.VITE_API_BASE_URL;
const seasons = ["Spring", "Summer", "Fall", "Winter"];
const allSizes = ["#1", "#2", "#3", "#5", "#7", "#10", "#20", "10 cm", "50P", "72P"];
// const { realmId } = useRealm();

export default function PottingReportBySize() {
  const [year, setYear] = useState("");
  const [season, setSeason] = useState("");
  const [customer, setCustomer] = useState("");
  const [sort, setSort] = useState("totalDesc");
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [top, setTop] = useState(50);

  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState([]);

  const realmId = localStorage.getItem("selectedRealmId");

  const years = useMemo(() => {
    const now = new Date().getFullYear();
    return Array.from({ length: 6 }, (_, i) => now - i);
  }, []);

  useEffect(() => {
    const ctl = new AbortController();
    (async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (realmId) params.set("realmId", realmId);
        if (year) params.set("year", year);
        if (season) params.set("season", season);
        if (customer) params.set("customer", customer);
        if (sort) params.set("sort", sort);
        if (top) params.set("top", top);
        if (selectedSizes.length) {
          selectedSizes.forEach(sz => params.append("sizes", sz));
        }
        const res = await fetch(`${API_BASE}/admin/pottinglists/report/by-size?${params}`, {
          credentials: "include",
          signal: ctl.signal
        });
        const json = await res.json();
        if (!ctl.signal.aborted) setRows(json || []);
      } catch (e) {
        if (!ctl.signal.aborted) console.error(e);
      } finally {
        if (!ctl.signal.aborted) setLoading(false);
      }
    })();
    return () => ctl.abort();
  }, [realmId, year, season, customer, sort, top, selectedSizes]);


    // === PRINTING ===
  const printRef = useRef(null);
  const docTitle = `Potting Report by Size${year ? " - " + year : ""}${season ? " - " + season : ""}${customer ? " - " + customer : ""}`;
  const handlePrint = useReactToPrint({
    contentRef: printRef, documentTitle: docTitle,
    pageStyle: `
      @page { size: A4; margin: 16mm; }
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      thead { display: table-header-group; }
      tfoot { display: table-footer-group; }
      tr, td, th { break-inside: avoid; }
      .group-card { break-inside: avoid; page-break-inside: avoid; }
      .no-print { display: none !important; }
      .print-only { display: block !important; }
    `,
  });
 return (
      <Layout>
    <div className="p-4 space-y-4">
      {/* Top bar */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Potting Report • Grouped by Size</h1>
        <div className="flex gap-2 no-print">
          <button
            type="button"
            onClick={handlePrint}
            className="rounded-md bg-green-600 px-3 py-2 text-white hover:bg-green-700"
          >
            Print
          </button>
        </div>
      </div>

      {/* Filters */}


      <div className="grid grid-cols-1 gap-3 sm:grid-cols-6 no-print">
        <select className="rounded-md border p-2"
          value={year} onChange={(e) => setYear(e.target.value)}>
          <option value="">All years</option>
          {years.map(y => <option key={y} value={y}>{y}</option>)}
        </select>

        <select className="rounded-md border p-2"
          value={season} onChange={(e) => setSeason(e.target.value)}>
          <option value="">All seasons</option>
          {seasons.map(s => <option key={s} value={s}>{s}</option>)}
        </select>

        <input
          className="rounded-md border p-2"
          placeholder="Customer (contains)"
          value={customer}
          onChange={(e) => setCustomer(e.target.value)}
        />

        <select className="rounded-md border p-2" value={sort} onChange={(e) => setSort(e.target.value)}>
          <option value="totalDesc">Sort: Size total ↓</option>
          <option value="totalAsc">Sort: Size total ↑</option>
          <option value="size">Sort: Size A→Z</option>
        </select>

        <select className="rounded-md border p-2" value={top} onChange={(e) => setTop(Number(e.target.value))}>
          {[10, 25, 50, 100, 500].map(n => <option key={n} value={n}>Top {n}</option>)}
        </select>

        <div className="col-span-1 sm:col-span-6 no-print">
  <div className="flex flex-wrap gap-2">
  {allSizes.map(sz => {
      const on = selectedSizes.includes(sz);
      return (
        <label key={sz} className={`inline-flex items-center gap-2 rounded-md border px-2 py-1 cursor-pointer ${on ? "bg-blue-50 border-blue-300" : ""}`}>
          <input
            type="checkbox"
            className="accent-blue-600"
            checked={on}
            onChange={(e) =>
              setSelectedSizes(prev =>
                e.target.checked ? [...prev, sz] : prev.filter(s => s !== sz)
              )
            }
          />
          <span className="text-sm">{sz}</span>
        </label>
      );
    })}
  </div>
</div>


        <div className="p-2 text-sm text-gray-600 self-center">
          {loading ? "Loading…" : `${rows.length} size group(s)`}
        </div>
      </div>

      {/* Printable area */}
      <div ref={printRef} className="space-y-4">
        {/* Print header (hidden on screen, visible on print) */}
        <div className="hidden print:block mb-2">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-lg font-semibold">Potting Report — Grouped by Size</div>
              <div className="text-sm">
                Filters:&nbsp;
                Year: <strong>{year || "All"}</strong>,&nbsp;
                Season: <strong>{season || "All"}</strong>,&nbsp;
                Customer: <strong>{customer || "All"}</strong>,&nbsp;
                Sizes: <strong>{selectedSizes.length ? selectedSizes.join(", ") : "All"}</strong>
              </div>
              <div className="text-xs text-gray-600">
                Generated: {new Date().toLocaleString()}
              </div>
            </div>
            {/* Optional logo: replace with your asset path */}
            {/* <img src="/logo.svg" alt="Logo" className="h-10" /> */}
          </div>
          <hr className="my-2" />
        </div>

        {/* Report content */}
        <div className="space-y-4">
          {rows.map(group => (
            <div key={group.size} className="group-card rounded-xl border p-3">
              <div className="mb-2 flex items-center justify-between">
                <div className="text-lg font-semibold">{group.size || "Unknown size"}</div>
                <div className="text-sm text-gray-600">Total: {group.sizeTotal}</div>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-50 text-gray-700">
                    <tr>
                      <th className="px-3 py-2 text-left">Item</th>
                      <th className="px-3 py-2 text-left">Size</th>
                      <th className="px-3 py-2 text-right">Total Qty</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {group.items?.map((it, i) => (
                      <tr key={i}>
                        <td className="px-3 py-2">{it.name}</td>
                        <td className="px-3 py-2">{it.size}</td>
                        <td className="px-3 py-2 text-right">{it.totalQty}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}

          {!loading && rows.length === 0 && (
            <div className="text-sm text-gray-600">No data for the selected filters.</div>
          )}
        </div>
      </div>
    </div>
    </Layout>
  );
}