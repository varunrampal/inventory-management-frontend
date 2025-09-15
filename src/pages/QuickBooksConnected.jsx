// pages/QuickBooksConnected.jsx
import React, { useMemo } from "react";
import { useNavigate, useParams, useSearchParams, Link } from "react-router-dom";
import Modal from "../components/Modal";

export default function QuickBooksConnected() {
  const { realmId: paramRealmId } = useParams();
  const [search] = useSearchParams();
  const navigate = useNavigate();

  const realmId = useMemo(
    () => paramRealmId || search.get("realmId") || "",
    [paramRealmId, search]
  );

  const close = () => {
    const bg = sessionStorage.getItem("qb_bg");
    sessionStorage.removeItem("qb_bg");
   if (realmId) {
      navigate(`/sync/${encodeURIComponent(realmId)}?connected=1`, { replace: true });
    } else {
      navigate("/", { replace: true });
    }
    
  };

  if (!realmId) {
    return (
      <Modal open title="QuickBooks Connection" onClose={close}>
        <div className="text-sm text-red-700 bg-red-50 p-3 rounded">
          Couldn’t find <strong>realmId</strong> in the URL.
        </div>
        <div className="mt-3">
          <button onClick={close} className="rounded border px-3 py-1.5">
            Close
          </button>
        </div>
      </Modal>
    );
  }

  return (
    <Modal open title="QuickBooks Connected" onClose={close}>
      <div className="space-y-3">
        <div className="rounded bg-green-50 p-3 text-green-800">
          ✅ Connection successful.
        </div>
        <div className="text-sm text-gray-700">
          <div className="font-medium">Realm ID</div>
          <div className="mt-0.5 select-all">{realmId}</div>
        </div>
        <div className="pt-2 flex items-center gap-2">
          <button onClick={close} className="rounded border px-3 py-1.5 hover:bg-gray-50">
            Close
          </button>
          {/* <Link
            to={`/company-info?realmId=${encodeURIComponent(realmId)}`}
            className="rounded bg-blue-600 px-3 py-1.5 text-white hover:bg-blue-700"
          >
            View Company Info
          </Link> */}
        </div>
      </div>
    </Modal>
  );
}
