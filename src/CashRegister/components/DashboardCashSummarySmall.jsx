import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useRealm } from "../../context/RealmContext"; // adjust as needed


const fmt = new Intl.NumberFormat(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
const toISO = (d) => {
    const dt = new Date(d);
    return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(dt.getDate()).padStart(2, "0")}`;
};


export default function DashboardCashSummarySmall() {
    const API_BASE = import.meta.env.VITE_API_BASE_URL;
    const { realmId } = useRealm();
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState("");
    const [totals, setTotals] = useState({ totalIn: 0, totalOut: 0, balance: 0 });
    const today = useMemo(() => toISO(new Date()), []);


    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                setLoading(true); setErr("");
                const qs = new URLSearchParams({ realmId, start: today, end: today, groupBy: "day" });
                const res = await fetch(`${API_BASE}/admin/cashentries/summary?${qs.toString()}`);
                if (!res.ok) throw new Error(await res.text());
                const rows = await res.json();
                const r = rows?.[0] || { totalIn: 0, totalOut: 0, balance: 0 };
                if (mounted) setTotals({ totalIn: r.totalIn || 0, totalOut: r.totalOut || 0, balance: r.balance || 0 });
            } catch (e) {
                if (mounted) setErr("Cash summary failed");
                console.error(e);
            } finally {
                if (mounted) setLoading(false);
            }
        })();
        return () => { mounted = false; };
    }, [realmId, today]);


    return (
        <div className="rounded-2xl border p-3 bg-white/50 dark:bg-slate-900/40">
            <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold">Today</h3>
                <Link to="/finance/cash-register" className="text-[11px] text-blue-600 hover:underline">Open →</Link>
            </div>
            {loading ? (
                <div className="h-10 animate-pulse bg-gray-200 dark:bg-gray-700 rounded-xl" />
            ) : err ? (
                <div className="text-xs text-red-600">{err}</div>
            ) : (
                <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className="rounded-xl border p-2">
                        <div className="text-[11px] text-gray-500">In</div>
                        <div className="text-base font-semibold">{fmt.format(totals.totalIn)}</div>
                    </div>
                    <div className="rounded-xl border p-2">
                        <div className="text-[11px] text-gray-500">Out</div>
                        <div className="text-base font-semibold">{fmt.format(totals.totalOut)}</div>
                    </div>
                    <div className="rounded-xl border p-2">
                        <div className="text-[11px] text-gray-500">Balance</div>
                        <div className="text-base font-semibold">{fmt.format(totals.balance)}</div>
                    </div>
                </div>
            )}
        </div>
    );
}