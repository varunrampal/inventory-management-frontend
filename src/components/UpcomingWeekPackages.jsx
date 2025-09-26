// src/components/dashboard/UpcomingWeekPackages.jsx
import { useEffect, useState } from "react";

const tz = "America/Vancouver";
const BASE_URL = import.meta.env.VITE_API_BASE_URL;

function formatDayLabel(ymd) {
  const [y, m, d] = ymd.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  return dt.toLocaleDateString("en-CA", {
    timeZone: tz,
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

export default function UpcomingWeekPackages({ realmId }) {
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [data, setData] = useState({ range: null, grouped: [] });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setErr("");
        const url = new URL(`${BASE_URL}/admin/packages/upcoming`);
        url.searchParams.set("realmId", realmId);
        const res = await fetch(url, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
          },
        });
        if (!res.ok) throw new Error(await res.text());
        const json = await res.json();
        if (!cancelled) setData(json);
      } catch (e) {
        if (!cancelled) setErr(String(e.message || e));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => (cancelled = true);
  }, [realmId]);

  if (loading) {
    return (
      <div className="rounded-2xl border p-4">
        <div className="text-sm text-gray-500">Loading next week’s packages…</div>
      </div>
    );
  }

  if (err) {
    return (
      <div className="rounded-2xl border p-4">
        <div className="text-sm text-red-600">Error: {err}</div>
      </div>
    );
  }

  const total = data.grouped.reduce((a, g) => a + (g?.count || 0), 0);

  return (
    <div className="rounded-2xl border p-4">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Upcoming Deliveries/Pickups</h3>
          {data.range && (
            <div className="text-xs text-gray-500">
              {data.range.from} → {data.range.to}
            </div>
          )}
        </div>
        <span className="inline-flex items-center rounded-full border px-2 py-1 text-xs">
          {total} total
        </span>
      </div>

      {data.grouped.length === 0 ? (
        <div className="text-sm text-gray-500">No packages scheduled next week.</div>
      ) : (
        <div className="space-y-4">
          {data.grouped.map((g) => (
            <div key={g.shipDay} className="rounded-xl border p-3">
              <div className="mb-2 flex items-center justify-between">
                <div className="font-medium">{formatDayLabel(g.shipDay)}</div>
                <span className="text-xs text-gray-500">{g.count} package(s)</span>
              </div>
              <div className="divide-y">
                {g.packages.map((p) => (
                  <div key={p._id} className="py-2 flex items-start justify-between gap-3">
                    <div>
                      <div className="text-sm font-medium">
                        {p.packageCode || p._id}
                      </div>
                      <div className="text-xs text-gray-500">
                        {p.customerName || "—"} · Est #{p.estimateId || "—"}
                      </div>
                      {p.notes ? (
                        <div className="mt-1 text-xs text-gray-600 line-clamp-2">{p.notes}</div>
                      ) : null}
                    </div>
                    <a
                      href={`/edit-package/${p._id}`}
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
      )}
    </div>
  );
}
