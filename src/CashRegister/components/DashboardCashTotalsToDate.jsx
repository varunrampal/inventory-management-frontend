import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useRealm } from "../../context/RealmContext"; // adjust as needed


const fmt = new Intl.NumberFormat(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const toISO = (d) => {
    const dt = new Date(d);
    return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(dt.getDate()).padStart(2, "0")}`;
};


/**
* Props (optional):
* startDate: string YYYY-MM-DD (e.g., fiscal year start). If omitted, totals are from the beginning of time.
*/
export default function DashboardCashTotalsToDate({ startDate }) {
    const API_BASE = import.meta.env.VITE_API_BASE_URL;
    const { realmId } = useRealm();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [totals, setTotals] = useState({ totalIn: 0, totalOut: 0, balance: 0 });


    const today = useMemo(() => toISO(new Date()), []);


    useEffect(() => {
        let mounted = true;
        async function run() {
            setLoading(true); setError("");
            try {
                const qs = new URLSearchParams({ realmId, end: today });
                if (startDate) qs.set("start", startDate); // optional: constrain from a given date
                const res = await fetch(`${API_BASE}/admin/cashentries?${qs.toString()}`);
                if (!res.ok) throw new Error(await res.text());
                const data = await res.json();
                const t = data?.totals || { totalIn: 0, totalOut: 0, balance: 0 };
                if (mounted) setTotals(t);
            } catch (e) {
                if (mounted) setError("Failed to load totals");
                console.error(e);
            } finally {
                if (mounted) setLoading(false);
            }
        }
        if (realmId) run();
        return () => { mounted = false; };
    }, [realmId, startDate, today]);


    return (
        <div className="rounded-2xl border p-4 bg-white dark:bg-white">
            <div className="flex items-center justify-between mb-3">
  <h2 className="text-lg font-semibold">CASH REGISTER TO DATE</h2>
   <Link to="/cash-register" className="self-start xs:self-auto  text-xs text-blue-500 hover:underline">View</Link>
  </div>
  {loading ? (
    <div className="h-14 animate-pulse bg-gray-200 dark:bg-gray-300 rounded-xl" />
  ) : error ? (
    <div className="text-sm text-red-600">{error}</div>
  ) : (
    <div className="grid grid-cols-3 gap-3">
      <div className="rounded-xl border p-3">
        <div className="text-xs text-gray-500">Total In</div>
        <div className="text-xl font-semibold">{fmt.format(totals.totalIn)}</div>
      </div>
      <div className="rounded-xl border p-3">
        <div className="text-xs text-gray-500">Total Out</div>
        <div className="text-xl font-semibold">{fmt.format(totals.totalOut)}</div>
      </div>
      <div className="rounded-xl border p-3">
        <div className="text-xs text-gray-500">Balance</div>
        <div className="text-xl font-semibold">{fmt.format(totals.balance)}</div>
      </div>
    </div>
  )}
</div>
    );
}