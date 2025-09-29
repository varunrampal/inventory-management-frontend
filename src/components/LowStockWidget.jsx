import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom"

/**
 * LowStockWidget (grouped-card design)
 * ------------------------------------------------------------
 * Props:
 * - realmId (required unless demo)
 * - apiBaseUrl (optional; defaults to Vite/CRA envs)
 * - limit (default 50)         -> fetch enough so grouping makes sense
 * - threshold (default 10)     -> qty <= threshold is "low stock"
 * - groupBy: "category" | "band" (default "category")
 * - demo (default false)
 *
 * API expected: GET /inventory/low-stock?realmId=...&limit=50&threshold=10
 *   -> { items: [{ _id, name, sku, quantity, category, location }]}
 */
export default function LowStockWidget({
    realmId,
    apiBaseUrl,
    threshold = 10,
    demo = false,
    className = "",
}) {
    const baseUrl =
        apiBaseUrl ??
        ((typeof import.meta !== "undefined" && import.meta.env)
            ? import.meta.env.VITE_API_BASE_URL
            : undefined) ??
        (typeof process !== "undefined" ? process.env?.REACT_APP_API_BASE_URL : undefined) ??
        "";

    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState("");

    const url = useMemo(() => {
        if (demo) return "demo://low-stock-top5";
        if (!realmId || !baseUrl) return "";
        const q = new URLSearchParams({
            realmId: String(realmId),
            limit: "5",
            threshold: String(threshold),
        });
        return `${baseUrl.replace(/\/$/, "")}/inventory/lowstock/widget?${q.toString()}`;
    }, [realmId, baseUrl, threshold, demo]);

    useEffect(() => {
        let aborted = false;
        const ac = new AbortController();

        async function load() {
            if (!demo && (!realmId || !baseUrl)) {
                setLoading(false);
                return;
            }
            setLoading(true);
            setErr("");

            try {
                if (demo) {
                    const mock = [
                        { _id: "1", name: "Mahonia nervosa 1gal", sku: "MHN-1", quantity: 5, location: "Bay M1" },
                        { _id: "2", name: "Rosa nutkana 1gal", sku: "RSN-1", quantity: 6, location: "Bay R1" },
                        { _id: "3", name: "Spiraea douglasii 1g", sku: "SPD-1", quantity: 9, location: "Bay S2" },
                        { _id: "4", name: "Carex obnupta 10cm", sku: "CRX-10", quantity: 10, location: "Aisle G" },
                        { _id: "5", name: "Acer macrophyllum 7g", sku: "ACM-7", quantity: 11, location: "Row T3" },
                    ];
                    if (!aborted) setItems(mock.slice(0, 5).sort((a, b) => (a.quantity ?? 0) - (b.quantity ?? 0)));
                } else if (url) {
                    const res = await fetch(url, { signal: ac.signal });
                    if (!res.ok) throw new Error(`HTTP ${res.status}`);
                    const data = await res.json();
                    const rows = (data?.items || []).slice(0, 5).sort((a, b) => (a.quantity ?? 0) - (b.quantity ?? 0));
                    if (!aborted) setItems(rows);
                }
            } catch (e) {
                if (!aborted) setErr(e?.message || "Failed to load low stock items");
            } finally {
                if (!aborted) setLoading(false);
            }
        }

        load();
        return () => {
            aborted = true;
            ac.abort();
        };
    }, [url, demo, realmId, baseUrl]);

    return (
        <div className={`space-y-3 ${className}`}>
            <div className="rounded-xl border p-3">
                <div className="mb-1 flex items-center justify-between">
                    <div className="font-medium">LOW STOCK (Top 5)
                        <div className="text-xs text-gray-500">
                            Top 5 low stock items
                        </div>

                    </div>

                    <div className="text-xs text-gray-500">
                        {/* {loading ? "loading…" : `${items.length} item(s)`} */
                            <Link
                                to="/shippingschedule"
                                className="self-start sm:self-auto text-blue-500 hover:underline"
                            >
                                View all
                            </Link>

                        }
                    </div>

                </div>

                {err && (
                    <div className="text-sm text-rose-700 bg-rose-50 rounded-lg px-3 py-2 mb-2">
                        Error: {err}
                    </div>
                )}

                <div className="divide-y">
                    {loading
                        ? Array.from({ length: 5 }).map((_, i) => (
                            <div key={i} className="py-2 flex items-start justify-between gap-3">
                                <div className="space-y-1">
                                    <div className="h-4 w-44 bg-gray-200/80 dark:bg-zinc-800 rounded animate-pulse" />
                                    <div className="h-3 w-64 bg-gray-200/80 dark:bg-zinc-800 rounded animate-pulse" />
                                </div>
                                <div className="shrink-0 h-6 w-16 bg-gray-200/80 dark:bg-zinc-800 rounded-lg animate-pulse" />
                            </div>
                        ))
                        : items.length === 0
                            ? (
                                <div className="py-3 text-sm text-gray-600">No low stock items 🎉</div>
                            )
                            : items.map((it) => (
                                <div key={it._id} className="py-2 flex items-start justify-between gap-3">
                                    <div>
                                        <div className="text-sm font-medium">
                                            {it.name || it.sku || it._id}
                                        </div>
                                        {/* <div className="text-sm text-gray-800">
                                            {it.sku || "—"} · Qty {it.quantity ?? 0}
                                            {it.location ? <> · {it.location}</> : null}
                                        </div> */}
                                        <div className="text-sm text-gray-800">
                                            Qty {it.quantity ?? 0}
                                            {it.location ? <> · {it.location}</> : null}
                                        </div>
                                        {/* {it.notes && (
                                            <div className="text-xs text-gray-600 mt-1 line-clamp-2">
                                                {it.notes}
                                            </div>
                                        )} */}
                                    </div>

                                    {/* <a
                    href={`/inventory/edit/${it._id}`}
                    className="shrink-0 rounded-lg border px-2 py-1 text-xs hover:bg-gray-50"
                    title="Open item"
                  >
                    Open
                  </a> */}
                                </div>
                            ))}
                </div>
            </div>
        </div>
    );
}