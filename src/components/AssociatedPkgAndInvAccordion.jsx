import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useReactToPrint } from "react-to-print";
import PackagePrint from "./PackagePrint"; // Import the printable component
import { useRealm } from "../context/RealmContext";
import formatQBOAddress from "../helpers/FormatAddress"; // Adjust the import path as needed


function AccordionArrow({ open, className = "" }) {
  return (
    <svg
      viewBox="0 0 410.8 322.9"
      aria-hidden="true"
      className={`h-4 w-4 transition-transform duration-200 ${open ? "rotate-180" : ""} ${className}`}
    >
      <path
        d="M248.1 295.5c-17.1 23.6-50 28.8-73.5 11.8-4.5-3.3-8.5-7.3-11.8-11.8l-84-116-66.2-91.4c-25.3-34.8-.4-83.6 42.6-83.6h300.3c43 0 67.9 48.7 42.7 83.5L332 179.5l-83.9 116z"
        fill="currentColor"
      />
    </svg>
  );
}

function SectionHeader({ title, isOpen, onToggle, count }) {

  const onKey = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onToggle?.();
    }
  };



  return (
    <>

      <div className="flex items-center justify-between px-4 py-3 bg-white">
        <div className="flex items-center gap-3">
          <h3 className="text-base font-semibold text-gray-800">{title}</h3>
          {typeof count === "number" && (
            <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-gray-100 text-gray-700">
              {count}
            </span>
          )}
        </div>

        <button
          onClick={onToggle}
          className="inline-flex items-center gap-2 rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none"
        >
          {/* {isOpen ? "Hide" : "Show"} */}
          <svg
            className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M5.23 7.21a.75.75 0 011.06.02L10 10.173l3.71-2.943a.75.75 0 111.06 1.06l-4.24 3.364a.75.75 0 01-.94 0L5.25 8.29a.75.75 0 01-.02-1.08z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>
    </>
  );
}

const BASE_URL = import.meta.env.PROD
  ? 'https://inventory-management-server-vue1.onrender.com'
  : 'http://localhost:4000';

export default function AssociatedPkgAndInvAccordion({
  estimateId,
  estimate,
  packages = [],
  invoices = [],
  defaultOpen = "packages", // "packages" | "invoices" | null
  onEstimateUpdate, // <-- OPTIONAL callback if you want parent to receive updated estimate
}) {

  const CONFIRM_TIMEOUT = 5000;  // confirm auto-hides after 5s if no action
  const SUCCESS_TIMEOUT = 2200;
  const confirmIdRef = useRef(null)
  const [open, setOpen] = useState(defaultOpen);
  const navigate = useNavigate();
  const { realmId } = useRealm();

  // 🔹 local state copy so we can remove just one package row
  const [pkgList, setPkgList] = useState(packages);
  useEffect(() => setPkgList(packages), [packages]);

  // track which package is being deleted
  const [deletingId, setDeletingId] = useState(null);

  const isOpen = (key) => open === key;
  const toggle = (key) => setOpen(isOpen(key) ? null : key);

  // (keep your helpers)
  const toDDMMYYYY_local = (input) => {
    const d = new Date(input);
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yyyy = d.getFullYear();
    return `${dd}-${mm}-${yyyy}`;
  };

  const contentRef = useRef(null);
  const printNow = useReactToPrint({ contentRef, documentTitle: "Package" });
  const [printData, setPrintData] = useState({ pkg: null, items: [] });

  const shipTo =
    formatQBOAddress(estimate?.raw?.ShipAddr) ||
    formatQBOAddress(estimate?.raw?.BillAddr);

  const onPrintClick = (row) => {
    const pkgForPrint = {
      packageId: row.packageCode,
      estimateId: row.estimateId,
      shipTo,
      shipmentDate: row.shipmentDate || row.packageDate,
      notes: row.notes,
      customerName: estimate.customerName,
      driverName: row.driverName,
      quantities: row.quantities,
    };
    const itemsForPrint = row.lines ?? [];
    setPrintData({ pkg: pkgForPrint, items: itemsForPrint });
    setTimeout(() => printNow(contentRef), 0);
  };

  // ✅ Delete handler with optimistic UI + rollback
  const handlePackageDelete = async (id) => {
    if (!window.confirm("Delete this package? Fulfilled counts will be adjusted.")) return;

    // optimistic remove
    const prev = pkgList;
    setPkgList((list) => list.filter((p) => p._id !== id));
    setDeletingId(id);

    try {
      const res = await fetch(`${BASE_URL}/admin/packages/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      if (!res.ok) {
        const msg = await res.text();
        // rollback UI
        setPkgList(prev);
        alert(`Delete failed: ${msg}`);
        return;
      }

      // if backend returns updated estimate, bubble it up
      const data = await res.json().catch(() => ({}));
      if (data?.estimate && typeof onEstimateUpdate === "function") {
        onEstimateUpdate(data.estimate);
      }
    } catch (err) {
      // rollback UI
      setPkgList(prev);
      alert(`Delete failed: ${err.message}`);
    } finally {
      setDeletingId(null);
    }
  };

  const handlePrint = useReactToPrint({
    contentRef,
    documentTitle: "Package Slip",
  });


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
        setPkgList((list) => list.filter((p) => p._id !== id));
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

  return (
    <div className="rounded-lg border border-gray-200 overflow-hidden shadow-sm bg-white">
      {/* Associated Packages */}
      <div className="divide-y divide-gray-200">
        <SectionHeader
          title="📦 Packages"
          count={pkgList.length}
          isOpen={isOpen("packages")}
          onToggle={() => toggle("packages")}
        />

        {isOpen("packages") && (
          <div className="p-4 bg-gray-50">
            {pkgList.length ? (
              <div className="overflow-auto rounded-md border border-gray-200 bg-white">
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-100 text-gray-700">
                    <tr>
                      <th className="p-2 text-left">Package ID</th>
                      <th className="p-2 text-left">Package Date</th>
                      <th className="p-2 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {pkgList.map((pkg) => (
                      <tr key={pkg._id ?? pkg.id} className="hover:bg-gray-50">
                        <td className="p-2">{pkg.packageCode}</td>
                        <td className="p-2">{toDDMMYYYY_local(pkg.packageDate)}</td>
                        <td className="p-2">
                          <div className="flex gap-2">
                            <button
                              onClick={() => navigate(`/package/edit/${pkg._id}`)}
                              className="rounded-md border border-gray-300 px-2 py-1 text-xs text-gray-700 hover:bg-gray-50"
                            >
                              Edit
                            </button>

                            <button
                              onClick={() => onPrintClick(pkg)}
                              className="rounded-md border border-gray-300 px-2 py-1 text-xs text-gray-700 hover:bg-gray-50"
                            >
                              Print
                            </button>

                            {/* <button
                              onClick={() => handlePackageDelete(pkg._id)}
                              disabled={deletingId === pkg._id}
                              className={`rounded-md border px-2 py-1 text-xs ${
                                deletingId === pkg._id
                                  ? "border-gray-200 text-gray-400 cursor-not-allowed"
                                  : "border-gray-300 text-gray-700 hover:bg-gray-50"
                              }`}
                              title={deletingId === pkg._id ? "Deleting..." : "Delete"}
                            >
                              {deletingId === pkg._id ? "Deleting…" : "Delete"}
                            </button> */}

                            <button
                              onClick={() => confirmDeletePackage(pkg._id)}
                              disabled={deletingId === pkg._id}
                              className={`rounded-md border px-2 py-1 text-xs ${deletingId === pkg._id
                                  ? "border-gray-200 text-gray-400 cursor-not-allowed"
                                  : "border-gray-300 text-gray-700 hover:bg-gray-50"
                                }`}
                            >
                              {deletingId === pkg._id ? "Deleting…" : "Delete"}
                            </button>

                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* hidden print component */}
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
            ) : (
              <p className="text-sm text-gray-500 italic">No packages found.</p>
            )}
          </div>
        )}
      </div>

      {/* Invoices (unchanged) */}
      {/* ... your existing invoice accordion ... */}
    </div>
  );
}

