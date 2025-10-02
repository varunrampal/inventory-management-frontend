// import React from "react";
// import { useLocation, useNavigate } from "react-router-dom";
// import PottingList from "../components/CreatePottingList.jsx";
// import Layout from '../components/Layout';

// export default function PottingListPage() {
//     const { state } = useLocation();
//    const navigate = useNavigate();
//   const existing = state?.existing;
//   const estimate = state?.estimate || {};
//   const realmId = state?.realmId;// came from navigate(..., { state })

//  const docNumber =
//     existing?.docNumber ??
//     estimate?.raw.DocNumber ??     // QBO often uses PascalCase
//     estimate?.raw.DocNumber ?? "";

//    // console.log("doc:", estimate?.raw.DocNumber);

//  // If an existing list is present, build an "estimate-like" object from it
//   const estimateForUI = existing
//     ? { customerName: existing.customerName, items: existing.items } // items already have {name,size,quantity,status}
//     : estimate;

//   const defaults = existing
//     ? {
//         defaultYear: existing.year,
//         defaultSeason: existing.season,
//         defaultStatus: existing.status || "Draft",
//         defaultReference: existing.reference || "",
//       }
//     : {};

//   const handleSave = async (payload) => {
//     // optional: do your own POST here; CreatePottingList already posts to /pottinglists/create
//     // After save, return to estimate details:
//     navigate(-1);
//   };

//     if (!estimate) return <div className="p-6">No estimate provided.</div>;

//     return (
//         <Layout>
//             <h1 className="text-2xl font-semibold mb-4">Create Potting List </h1>
//             <div className="p-6">
//                 <PottingList estimate={estimateForUI}
//         realmId={realmId}
//         estimateId={existing?.estimateId || estimate?.estimateId || estimate?.Id || estimate?.id}
//          docNumber={estimate?.raw.DocNumber}
//         {...defaults} />
//            </div>
//         </Layout>
//     );
// }

// src/pages/PottingListPage.jsx
import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import Layout from "../components/Layout";
import PottingList from "../components/CreatePottingList.jsx";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

export default function PottingListPage() {
  const { id } = useParams();                // if present => view existing
  const { state } = useLocation();
  const navigate = useNavigate();

  const [existing, setExisting] = useState(state?.existing || null);
  const [loading, setLoading] = useState(!!id && !state?.existing);
  const [error, setError] = useState("");

  // realmId can come from state, header, or however you store it
  const realmId = state?.realmId || localStorage.getItem("realmId") || undefined;

  // When coming from "create from estimate"
  const estimate = state?.estimate || {};

  // Fetch the potting list if we navigated from the listing (id present, no preloaded state)
  useEffect(() => {
    if (!id || state?.existing) return;
    const ctl = new AbortController();
    (async () => {
      try {
        setLoading(true);
        const res = await fetch(
          `${API_BASE}/admin/pottinglists/${id}${realmId ? `?realmId=${encodeURIComponent(realmId)}` : ""}`,
          { credentials: "include", signal: ctl.signal }
        );
        if (!res.ok) {
          const msg = await res.text();
          throw new Error(msg || `HTTP ${res.status}`);
        }
        const json = await res.json();
        setExisting(json);
      } catch (e) {
        setError(String(e.message || e));
      } finally {
        setLoading(false);
      }
    })();
    return () => ctl.abort();
  }, [id, realmId, state?.existing]);

  // Compute shared props for the PottingList component
  const estimateForUI = existing
    ? { customerName: existing.customerName, items: existing.items }
    : estimate;

  const defaults = existing
    ? {
        defaultYear: existing.year,
        defaultSeason: existing.season,
        defaultStatus: existing.status || "Draft",
        defaultReference: existing.reference || "",
      }
    : {};

  const docNumber =
    existing?.docNumber ??
    estimate?.raw?.DocNumber ??
    estimate?.DocNumber ??
    estimate?.docNumber ??
    "";

  const mode = id ? "view" : "create";       // simple toggle
  const readOnly = mode === "view";

  const handleSave = async (_payload) => {
    // For "create" flow only — your CreatePottingList does the POST already
    navigate(-1);
  };

  if (loading) return <div className="p-6">Loading…</div>;
  if (error)   return <div className="p-6 text-red-600">Error: {error}</div>;

  // If we're in create mode and there is no estimate, show a guard
  if (mode === "create" && !estimate) {
    return <div className="p-6">No estimate provided.</div>;
  }

  return (
    <Layout>
      <div className="flex items-center justify-between p-6">
        <h1 className="text-2xl font-semibold">
          {mode === "view" ? `Potting List • ${existing?.code || existing?._id || ""}` : "Create Potting List"}
        </h1>

        <div className="flex gap-2">
          <button onClick={() => navigate(-1)} className="rounded-md border px-3 py-2">
            Back
          </button>
          {/* Optional: enable an edit mode toggle later */}
          {/* {mode === "view" && (
            <Link to={`/pottinglists/${id}/edit`} className="rounded-md bg-blue-600 px-3 py-2 text-white">Edit</Link>
          )} */}
        </div>
      </div>

      <div className="p-6">
        <PottingList
          estimate={estimateForUI}
          realmId={realmId}
          estimateId={existing?.estimateId || estimate?.estimateId || estimate?.Id || estimate?.id}
          docNumber={docNumber}
          readOnly={readOnly}          // ✅ make the form/components respect this
          onSave={handleSave}
          {...defaults}
        />
      </div>
    </Layout>
  );
}
