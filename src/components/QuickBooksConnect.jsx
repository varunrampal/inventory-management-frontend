import { useEffect, useState } from "react";

export default function QuickBooksConnect() {
  const [env, setEnv] = useState("…");
  const [connected, setConnected] = useState(false);
  const [realmId, setRealmId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  // If not set, default to same origin (useful in prod)
  const BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

  // helper for auth header (if your backend requires admin token)
  const authHeaders = () => {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  useEffect(() => {
    // 1) pick up realmId from query
    const params = new URLSearchParams(window.location.search);
    const r = params.get("realmId");
    if (r) {
      localStorage.setItem("qb_realmId", r);
      setRealmId(r);
      // optional: clean URL param after storing
      params.delete("realmId");
      const clean = `${window.location.pathname}?${params.toString()}`.replace(/\?$/, "");
      window.history.replaceState({}, "", clean);
    } else {
      // 2) fallback to stored realmId
      const saved = localStorage.getItem("qb_realmId");
      if (saved) setRealmId(saved);
    }

    // 3) status
    (async () => {
      try {
        setLoading(true);
        const res = await fetch(`${BASE_URL}/admin/qb/status`, { headers: authHeaders() });
        if (!res.ok) throw new Error(`Status ${res.status}`);
        const j = await res.json();
        setEnv(j.environment || "unknown");
        setConnected(!!j.connected);
        setErr("");
      } catch (e) {
        setErr("Unable to reach QuickBooks status. Check CORS, route path, and auth.");
      } finally {
        setLoading(false);
      }
    })();
  }, [BASE_URL]);

  const connect = () => {
    // Use BASE_URL so it also works when API is on a different domain
    window.location.href = `${BASE_URL}/admin/qb/connect`;
  };

  const fetchCompany = async () => {
    try {
      if (!realmId) return alert("Not connected (no realmId).");
      const r = await fetch(
        `${BASE_URL}/admin/qb/company-info?realmId=${encodeURIComponent(realmId)}`,
        { headers: { ...authHeaders(), Accept: "application/json" } }
      );
      if (!r.ok) throw new Error(`Company info ${r.status}`);
      const j = await r.json();
      alert(`Company: ${j?.CompanyInfo?.CompanyName || "Unknown"}`);
    } catch (e) {
      alert("Failed to load company info. See console for details.");
      console.error(e);
    }
  };

  return (
    <div className="rounded-lg border p-4 space-y-4 bg-white">
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-700">
          {/* QuickBooks environment: <b>{env}</b> */}
          <p className="mb-4 text-sm text-gray-700">Connect your QuickBooks account to sync data.</p>
        </div>
        {loading && <div className="text-xs text-gray-500">Checking status…</div>}
      </div>

      {err && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded p-2">
          {err}
        </div>
      )}

      {!connected ? (
        <button
          onClick={connect}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg"
        >
          Connect QuickBooks
        </button>
      ) : (
        <div className="space-y-2">
          <div className="text-sm text-gray-700">
            Connected {realmId && <>• realmId: <code>{realmId}</code></>}
          </div>
          <div className="flex gap-2">
            <button
              onClick={fetchCompany}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded-lg"
            >
              Test Company Info
            </button>
            <button
              onClick={() => {
                localStorage.removeItem("qb_realmId");
                setRealmId(null);
                setConnected(false);
              }}
              className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-3 py-2 rounded-lg border"
              title="Forget saved realmId locally (does not disconnect on server)"
            >
              Forget realmId (local)
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
