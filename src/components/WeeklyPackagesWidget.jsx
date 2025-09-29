// src/components/dashboard/WeeklyPackagesWidget.jsx
import { useEffect, useMemo, useState } from "react";
import { useParams, Link, useNavigate } from 'react-router-dom';

const TZ = "America/Vancouver";
const DEFAULT_BASE_URL = import.meta.env.VITE_API_BASE_URL;

function useWeeksData({ realmId, baseUrl = DEFAULT_BASE_URL }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    if (!realmId) return;
    const ac = new AbortController();
    (async () => {
      try {
        setLoading(true);
        setErr("");
        const url = new URL(`${baseUrl}/admin/packages/weeks`);
        url.searchParams.set("realmId", realmId);
        const res = await fetch(url, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
          },
          signal: ac.signal,
        });
        if (!res.ok) throw new Error(await res.text());
        const json = await res.json();
        setData(json);
      } catch (e) {
        if (e.name !== "AbortError") setErr(String(e.message || e));
      } finally {
        setLoading(false);
      }
    })();
    return () => ac.abort();
  }, [realmId, baseUrl]);

  return { data, loading, err };
}

function DayLabel({ ymd }) {
  const label = useMemo(() => {
    if (!ymd) return "-";
    const [y, m, d] = ymd.split("-").map(Number);
    // Render as Vancouver local date
    const dt = new Date(Date.UTC(y, m - 1, d));
    return dt.toLocaleDateString("en-CA", {
      timeZone: TZ,
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  }, [ymd]);
  return <span>{label}</span>;
}

function PackagesByDay({ block }) {
  if (!block?.grouped?.length) {
    return <div className="text-sm text-gray-500">No packages scheduled.</div>;
  }
  return (
    <div className="space-y-3">
      {block.grouped.map((g) => (
        <div key={g.shipDay} className="rounded-xl border p-3">
          <div className="mb-1 flex items-center justify-between">
            <div className="font-medium">
              <DayLabel ymd={g.shipDay} />
            </div>
            <div className="text-xs text-gray-500">{g.count} package(s)</div>
          </div>
          <div className="divide-y">
            {g.packages.map((p) => (
              <div key={p._id} className="py-2 flex items-start justify-between gap-3">
                <div>
                  <div className="text-sm font-medium">{p.packageCode || p._id}</div>
                  <div className="text-sm text-gray-800">
                    {p.customerName || "—"} · Est #{p.docNumber || "—"} ·{" "}
                    {p.shipmentDate ? p.shipmentDate.slice(0, 10) : "-"}
                  </div>
                  {p.notes && (
                    <div className="text-xs text-gray-600 mt-1 line-clamp-2">{p.notes}</div>
                  )}
                </div>
                <a
                  href={`/package/edit/${p._id}`}
                  className="shrink-0 rounded-lg border px-2 py-1 text-xs hover:bg-gray-50"
                >
                  Open
                </a>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * WeeklyPackagesWidget
 * Props:
 * - realmId?: string  (falls back to localStorage 'selectedRealmId')
 * - baseUrl?: string  (defaults to VITE_API_BASE_URL)
 * - className?: string
 * - layout?: 'two-column' | 'stack'   (default: 'two-column')
 */
export default function WeeklyPackagesWidget({
  realmId: realmIdProp,
  baseUrl = DEFAULT_BASE_URL,
  className = "",
  layout = "two-column",
}) {
  const realmId = realmIdProp || localStorage.getItem("selectedRealmId") || "";
  const { data, loading, err } = useWeeksData({ realmId, baseUrl });

  return (
    <div className={`w-full ${className}`}>
  <section className="rounded-2xl border p-4">
    {/* Header row */}
    <div className="mb-4 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
      <div>
        <h2 className="text-lg font-semibold">DELIVERIES/PICKUPS — This Week & Next Week</h2>
        {data?.current?.range && data?.next?.range && (
          <div className="text-xs text-gray-500">
            This week: {data.current.range.from} → {data.current.range.to} · Next week: {data.next.range.from} → {data.next.range.to}
          </div>
        )}
      </div>

      {/* Link on the right */}
      <Link
        to="/shippingschedule"
        className="self-start xs:self-auto  text-xs text-blue-500 hover:underline"
      >
        View full schedule
      </Link>
    </div>

    {loading ? (
      <div className="rounded-2xl border p-4 text-sm text-gray-500">Loading…</div>
    ) : err ? (
      <div className="rounded-2xl border p-4 text-sm text-red-600">Error: {err}</div>
    ) : (
      <div className={layout === "stack" ? "grid grid-cols-1 gap-4" : "grid grid-cols-1 lg:grid-cols-2 gap-4"}>
        <section className="rounded-2xl border p-4">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-base font-semibold">This Week</h3>
            <span className="text-xs text-gray-500">{data.current?.total ?? 0} total</span>
          </div>
          <PackagesByDay block={data.current} />
        </section>

        <section className="rounded-2xl border p-4">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-base font-semibold">Next Week</h3>
            <span className="text-xs text-gray-500">{data.next?.total ?? 0} total</span>
          </div>
          <PackagesByDay block={data.next} />
        </section>
      </div>
    )}
  </section>
</div>

   
  );
}
