// src/components/PackagesList.jsx
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useReactToPrint } from "react-to-print";
import PackagePrint from "./PackagePrint";
import formatQBOAddress from "../helpers/FormatAddress";
// const BASE_URL = import.meta.env.PROD
//     ? "https://inventory-management-server-vue1.onrender.com"
//     : "http://localhost:4000";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const tz = "America/Vancouver";

function formatDate(d) {
    if (!d) return "-";
    return new Date(d).toLocaleString("en-CA", {
        timeZone: tz,
        year: "numeric",
        month: "short",
        day: "2-digit",
    });
}

export default function PackagesList({ realmId, onEstimateUpdate }) {
    const [rows, setRows] = useState([]);
    const [search, setSearch] = useState("");
    const [from, setFrom] = useState(""); // yyyy-mm-dd
    const [to, setTo] = useState("");     // yyyy-mm-dd
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(20);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    const [deletingId, setDeletingId] = useState(null);
    const [printData, setPrintData] = useState({ pkg: null, items: [] });
    const confirmIdRef = useRef(null)
    const navigate = useNavigate();

      const companyDetails =
    realmId === "9341454894464212"
      ? {
        name: "Peels Native Plants Ltd.",
        address: "22064 64 Ave, Langley, BC V2Y 2H1",
        phone: "(236) 591-8781",
        email: "info@peelsnativeplants.com",
        website: "www.peelsnativeplants.com",
      }
      : {
        name: "Green Flow Nurseries Ltd.",
        address: "35444 Hartley Rd, Mission, BC V2V 0A8",
        phone: "(604) 217-1351",
        email: "info@greenflownurseries.com",
        website: "www.greenflownurseries.com",
      };

     

    // Debounce search/filtering
    const debounceRef = useRef(null);
    function triggerFetch(newPage = 1) {
        setPage(newPage);
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(fetchData, 300);
    }

    async function fetchData() {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: String(page),
                limit: String(limit),
            });
            if (realmId) params.set("realmId", realmId);
            if (search) params.set("search", search);
            if (from) params.set("from", from);
            if (to) params.set("to", to);

            const res = await fetch(`${BASE_URL}/admin/packages/packagelist?` + params.toString(), {
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem('token')}` },
            });
            const json = await res.json();
            setRows(json.data || []);
            setTotal(json.total || 0);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page, limit]); // fetch on page/limit changes

    // Re-fetch when filters change (debounced)
    useEffect(() => {
        triggerFetch(1);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [search, from, to, realmId]);

    const totalPages = useMemo(
        () => Math.max(1, Math.ceil(total / limit)),
        [total, limit]
    );

    // show a confirm toast
    const confirmDeletePackage = (id) => {
        // Save toast id so we can dismiss it programmatically
        confirmIdRef.current = toast.warning("Delete this package?", {
            description: "Package will be deleted permanently.",
            duration: Infinity, // stays until user acts
            action: {
                label: "Delete",
                onClick: () => {
                    // 🔸 Hide the confirm toast right away
                    toast.dismiss(confirmIdRef.current);
                    doDelete(id);
                },
            },
            cancel: {
                label: "Cancel",
                onClick: () => toast.dismiss(confirmIdRef.current),
            },
        });
    };

    // actual delete (with optimistic UI + toast.promise)
    const doDelete = (id) => {
        // Extra safety: ensure confirm toast is gone even if action handler didn’t run
        toast.dismiss(confirmIdRef.current);
        setDeletingId(id);

        return toast.promise(
            (async () => {
                const res = await fetch(`${BASE_URL}/admin/packages/${id}`, {
                    method: "DELETE",
                    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
                });
                if (!res.ok) throw new Error(await res.text());
                const data = await res.json().catch(() => ({}));
                if (data?.estimate && typeof onEstimateUpdate === "function") {
                    onEstimateUpdate(data.estimate);
                }
                // Optimistically remove from UI if you keep local list:
                setRows((list) => list.filter((p) => p._id !== id));
                return "Package deleted";
            })(),
            {
                loading: "Deleting…",
                success: (msg) => msg,
                error: (err) => err.message || "Delete failed",
            },
            { duration: SUCCESS_TIMEOUT } // success/error auto-dismiss
        ).finally(() => setDeletingId(null));
    };
  const contentRef = useRef(null);
  const printNow = useReactToPrint({ contentRef, documentTitle: "Package" });
 

    const onPrintClick = (row) => {

 const shipTo =
        formatQBOAddress(row.snapshot?.shipTo) ||
        formatQBOAddress(row.snapshot?.billTo);

        const pkgForPrint = {
            packageId: row.packageCode,
            estimateId: row.estimateId,
            shipTo,
            shipmentDate: row.shipmentDate || row.packageDate,
            notes: row.notes,
            customerName: row.snapshot.customerName,
            driverName: row.driverName,
            quantities: row.quantities,
        };
        const itemsForPrint = row.lines ?? [];
        setPrintData({ pkg: pkgForPrint, items: itemsForPrint });
        setTimeout(() => printNow(contentRef), 0);
    };


    return (
        <div className="w-full space-y-4">
            {/* Filters */}
            <div className="flex flex-col md:flex-row md:items-end md:gap-3 gap-2">
                <div className="flex-1">
                    <label className="block text-xs font-bold text-gray-500 mb-1">
                        Search (Customer or Estimate #)
                    </label>
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="e.g., Geeta or 189"
                        className="w-full rounded-lg border px-3 py-2 outline-none focus:ring focus:ring-blue-200 bg-white"
                    />
                </div>

                <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">
                        Ship Date From
                    </label>
                    <input
                        type="date"
                        value={from}
                        onChange={(e) => setFrom(e.target.value)}
                        className="rounded-lg border px-3 py-2 bg-white"
                    />
                </div>

                <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">
                        Ship Date To
                    </label>
                    <input
                        type="date"
                        value={to}
                        onChange={(e) => setTo(e.target.value)}
                        className="rounded-lg border px-3 py-2 bg-white"
                    />
                </div>

                <div className="flex items-end gap-2">
                    <button
                        onClick={() => {
                            setSearch("");
                            setFrom("");
                            setTo("");
                            triggerFetch(1);
                        }}
                        className="rounded-xl border px-3 py-2 hover:bg-gray-50"
                    >
                        Clear
                    </button>

                    <select
                        value={limit}
                        onChange={(e) => setLimit(Number(e.target.value))}
                        className="rounded-lg border px-3 py-2 bg-white"
                        title="Rows per page"
                    >
                        {[10, 20, 50, 100].map((n) => (
                            <option key={n} value={n}>{n}/page</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="rounded-xl border overflow-x-auto bg-white">
                <table className="min-w-full text-sm">
                    <thead className="bg-gray-50 sticky top-0">
                        <tr className="text-left text-gray-600">

                            <th className="px-3 py-2">Package #</th>
                            <th className="px-3 py-2">Estimate #</th>
                            <th className="px-3 py-2">Ship Date</th>
                            <th className="px-3 py-2">Customer</th>
                            <th className="px-3 py-2">Driver</th>
                            <th className="px-3 py-2">Items</th>

                            <th className="px-3 py-2 w-24 text-right"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {loading ? (
                            <tr>
                                <td colSpan={6} className="px-3 py-6 text-center text-gray-500">
                                    Loading…
                                </td>
                            </tr>
                        ) : rows.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-3 py-6 text-center text-gray-500">
                                    No packages found
                                </td>
                            </tr>
                        ) : (
                            rows.map((p) => (
                                <tr key={p._id} className="hover:bg-gray-50">

                                    <td className="px-3 py-2">{p.packageCode || "-"}</td>
                                    <td className="px-3 py-2">{p.estimateId || "-"}</td>
                                    <td className="px-3 py-2">{formatDate(p.shipmentDate || p.packageDate)}</td>
                                    <td className="px-3 py-2">{p.snapshot.customerName || "-"}</td>
                                    <td className="px-3 py-2">{p.driverName || "-"}</td>
                                    <td className="px-3 py-2">
                                        {Array.isArray(p.lines) ? p.lines.reduce((sum, it) => sum + (Number(it.quantity) || 0), 0) : 0}
                                    </td>

                                    <td className="px-3 py-2 text-right">
                                        {/* <a
                      href={`/packages/${p._id}`}
                      className="inline-flex items-center rounded-lg bg-blue-600 text-white px-3 py-1.5 hover:bg-blue-700"
                    >
                      View
                    </a> */}
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => navigate(`/package/edit/${p._id}`)}
                                                className="rounded-md border border-gray-300 px-2 py-1 text-xs text-gray-700 hover:bg-gray-50"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => onPrintClick(p)}
                                                className="rounded-md border border-gray-300 px-2 py-1 text-xs text-gray-700 hover:bg-gray-50"
                                            >
                                                Print
                                            </button>

                                            <button
                                                onClick={() => confirmDeletePackage(p._id)}
                                                disabled={deletingId === p._id}
                                                className={`rounded-md border px-2 py-1 text-xs ${deletingId === p._id
                                                    ? "border-gray-200 text-gray-400 cursor-not-allowed"
                                                    : "border-gray-300 text-gray-700 hover:bg-gray-50"
                                                    }`}
                                            >
                                                {deletingId === p._id ? "Deleting…" : "Delete"}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
                <div style={{ position: "absolute", left: "-99999px", top: 0 }}>
                    {printData.pkg && (
                        <PackagePrint
                            ref={contentRef}
                            company={companyDetails}
                            pkg={printData.pkg}
                            items={printData.items}
                            taxRate={0.05}
                        />
                    )}
                </div>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between">
                <div className="text-xs text-gray-500">
                    Showing {(rows.length ? (page - 1) * limit + 1 : 0)}–
                    {(page - 1) * limit + rows.length} of {total}
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => page > 1 && setPage(page - 1)}
                        disabled={page <= 1}
                        className="rounded-lg border px-3 py-1.5 disabled:opacity-40"
                    >
                        Prev
                    </button>
                    <span className="text-sm px-1 pt-1.5">
                        {page} / {totalPages}
                    </span>
                    <button
                        onClick={() => page < totalPages && setPage(page + 1)}
                        disabled={page >= totalPages}
                        className="rounded-lg border px-3 py-1.5 disabled:opacity-40"
                    >
                        Next
                    </button>
                </div>
            </div>
        </div>
    );
}
