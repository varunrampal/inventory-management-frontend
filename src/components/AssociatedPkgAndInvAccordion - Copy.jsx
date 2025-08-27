import { useState, useRef } from "react";
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
        {isOpen ? "Hide" : "Show"}
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
}) {
  const [open, setOpen] = useState(defaultOpen);
  const navigate = useNavigate();
  const { realmId } = useRealm();
  const isOpen = (key) => open === key;
  const toggle = (key) => setOpen(isOpen(key) ? null : key);
  let companyDetails = {};
  const toDDMMYYYY_local = (input) => {
    const d = new Date(input);
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yyyy = d.getFullYear();
    return `${dd}-${mm}-${yyyy}`;
  };

  const contentRef = useRef(null);

  const printNow = useReactToPrint({
    contentRef,                          // <-- v3 API
    documentTitle: "Package",
  });// v3: call with ref later
  const [printData, setPrintData] = useState({ pkg: null, items: [] });

  const shipTo = formatQBOAddress(estimate?.raw?.ShipAddr) || formatQBOAddress(estimate?.raw?.BillAddr);
  const onPrintClick = (row) => {
    // Shape data exactly as PackagePrint expects
    const pkgForPrint = {
      packageId: row.packageCode,
      estimateId: row.estimateId,
      shipTo: shipTo,
      shipmentDate: row.shipmentDate || row.packageDate,
      notes: row.notes,
      customerName: estimate.customerName,
      driverName: row.driverName,
      quantities:row.quantities
    };

    const itemsForPrint = row.lines ?? []; // or fetch items here if not present

    setPrintData({ pkg: pkgForPrint, items: itemsForPrint });

    // wait a tick so hidden component re-renders with the new data, then print
    setTimeout(() => printNow(contentRef), 0);
  };


const handlePackageDelete = async (id) => {
  if (!window.confirm("Delete this package? Fulfilled counts will be adjusted.")) return;

  const res = await fetch(`${BASE_URL}/admin/packages/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  });

  if (!res.ok) {
    const msg = await res.text();
    alert(`Delete failed: ${msg}`);
    return;
  }

  const { estimate } = await res.json(); // updated estimate with corrected fulfilled
  // update local UI lists/state as needed
};


  const handlePrint = useReactToPrint({
    contentRef,                          // <-- v3 API
    documentTitle: "Package Slip",
  });

  if (realmId === "9341454894464212") {
    companyDetails = {
      name: "Peels Native Plants Ltd.",
      address: "22064 64 Ave, Langley, BC V2Y 2H1",
      phone: "(236) 591-8781",
      email: "info@peelsnativeplants.com",
      website: "www.peelsnativeplants.com",
    };
  } else {
    companyDetails = {
      name: "Green Flow Nurseries Ltd.",
      address: "35444 Hartley Rd, Mission, BC V2V 0A8",
      phone: "(604) 217-1351",
      email: "info@greenflownurseries.com",
      website: "www.greenflownurseries.com",
    };
  }


  return (
    <div className="rounded-lg border border-gray-200 overflow-hidden shadow-sm bg-white">
      {/* Associated Packages */}
      <div className="divide-y divide-gray-200">
        <SectionHeader
          title="📦 Packages"
          count={packages.length}
          isOpen={isOpen("packages")}
          onToggle={() => toggle("packages")}
        />
        
        {isOpen("packages") && (
          <div className="p-4 bg-gray-50">
            <div className="mb-3 flex items-center justify-between">
              {/* left content (optional) */}
              {/* <div className="ml-auto flex items-center gap-2">
                <button
                  onClick={() => navigate(`/create-package/${estimateId}`)}
                  className="rounded-md bg-green-600 px-2 py-1.5 text-sm font-medium text-white hover:bg-gray-700 focus:outline-none"
                >
                  Create Package
                </button>
              </div> */}
            </div>

            {packages.length ? (
              <div className="overflow-auto rounded-md border border-gray-200 bg-white">
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-100 text-gray-700">
                    <tr>
                      <th className="p-2 text-left">Package ID</th>
                      <th className="p-2 text-left">Package Date</th>
                      {/* <th className="p-2 text-left">Status</th>
                      <th className="p-2 text-left">Created</th>*/}
                      <th className="p-2 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {packages.map((pkg) => (
                      <tr key={pkg.id} className="hover:bg-gray-50">
                        <td className="p-2">{pkg.packageCode}</td>
                        <td className="p-2">{toDDMMYYYY_local(pkg.packageDate)}</td>
                        {/* <td className="p-2">
                          <span className="rounded-md bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700">
                            {pkg.status || "—"}
                          </span>
                        </td> */}
                        {/* <td className="p-2">{pkg.createdAt || "—"}</td> */}
                        <td className="p-2">
                          <div className="flex gap-2">

                            <button
                              onClick={() => navigate(`/package/edit/${pkg._id }`)}
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

                            <button
                              onClick={() => handlePackageDelete(pkg._id)}
                              className="rounded-md border border-gray-300 px-2 py-1 text-xs text-gray-700 hover:bg-gray-50"
                            >
                              Delete
                            </button>
                            {/* Render the print component off-screen but in the DOM */}

                          </div>
                        </td>
                      </tr>
                    ))}
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
            ) : (
              <p className="text-sm text-gray-500 italic">No packages found.</p>
            )}
          </div>
        )}
      </div>

      {/* Invoices */}
      <div className="border-t border-gray-200 divide-y divide-gray-200">
        <SectionHeader
          title="🧾 Invoices"
          count={invoices.length}
          isOpen={isOpen("invoices")}
          onToggle={() => toggle("invoices")}
        />

        {isOpen("invoices") && (
          <div className="p-4 bg-gray-50">
            {invoices.length ? (
              <div className="overflow-auto rounded-md border border-gray-200 bg-white">
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-100 text-gray-700">
                    <tr>
                      <th className="p-2 text-left">Invoice ID</th>
                      <th className="p-2 text-left">Date</th>
                      <th className="p-2 text-left">Amount</th>
                      <th className="p-2 text-left">Status</th>
                      <th className="p-2 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {invoices.map((inv) => (
                      <tr key={inv.id} className="hover:bg-gray-50">
                        <td className="p-2">{inv.id}</td>
                        <td className="p-2">{inv.date}</td>
                        <td className="p-2">${Number(inv.amount || 0).toFixed(2)}</td>
                        <td className="p-2">
                          <span className="rounded-md bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700">
                            {inv.status || "—"}
                          </span>
                        </td>
                        <td className="p-2">
                          <div className="flex gap-2">
                            <button
                              onClick={() => navigate(`/invoices/${inv.id}`)}
                              className="rounded-md border border-gray-300 px-2 py-1 text-xs text-gray-700 hover:bg-gray-50"
                            >
                              View
                            </button>
                            <button
                              onClick={() => navigate(`/invoices/${inv.id}/pdf`)}
                              className="rounded-md border border-gray-300 px-2 py-1 text-xs text-gray-700 hover:bg-gray-50"
                            >
                              Edit
                            </button>

                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-sm text-gray-500 italic">No invoices found.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
