import React, { useMemo, useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from 'react-toastify';
import { useReactToPrint } from "react-to-print";
import PottingListPrint from "../components/PottingListPrint";

// CreatePottingList.jsx — wired to POST /pottinglists/create (no item-level reference)
// Expects your API base in VITE_API_BASE_URL
// Optional props realmId / estimateId (fallbacks derived from estimate)
export default function CreatePottingList({
  estimate = {},
  realmId: realmIdProp,
  estimateId: estimateIdProp,
  docNumber: docNumberProp,
  defaultYear,
  defaultSeason = "Spring",
  defaultStatus = "Pending",
  defaultReference = "",
  onSave,
}) {

  const navigate = useNavigate();
 // const { readOnly = false } = props;

  const SEASONS = ["","Spring", "Summer", "Fall", "Winter"];
  const LIST_STATUSES = ["Pending", "In Progress", "Completed"];
  const ITEM_STATUSES = ["Pending", "In Progress", "Completed"];
  const SIZE_OPTIONS = [
  "#1", "#2", "#3", "#5", "#7", "#10", "#15", "#20",
  "50 Plug", "72 Plug",
];
const docNumber =
    docNumberProp ??
    estimate?.DocNumber ??
    estimate?.docNumber ??
    undefined;

console.log("CreatePottingList docNumber:", docNumberProp);

  const now = new Date();
  const currentYear = now.getFullYear();
  const yearOptions = [currentYear - 1, currentYear, currentYear + 1, currentYear + 2];

  // Derive ids when not passed
  const realmId = realmIdProp ?? estimate?.realmId ?? undefined;
  const estimateId = estimateIdProp ?? estimate?.estimateId ?? estimate?.Id ?? estimate?.id ?? undefined;
  
 const contentRef = useRef(null);


  // Parse "Name - <size>" to prefill size, but allow edits
  const splitNameAndSize = (fullName = "") => {
    const parts = fullName.split(" - ");
    if (parts.length >= 2) {
      const size = parts.pop();
      return { baseName: parts.join(" - "), size };
    }
    return { baseName: fullName, size: "" };
  };

  const initialRows = useMemo(() => {
    const items = Array.isArray(estimate?.items) ? estimate.items : [];
    return items.map((it, idx) => {
      const { baseName, size: sizeFromName } = splitNameAndSize(it?.name || "");
      const size = it?.size ?? sizeFromName ?? "";
      return {
        id: `${idx}`,
        name: baseName,
        size,
        quantity: Number(it?.quantity ?? 0) || 0,
      };
    });
  }, [estimate]);

  const [rows, setRows] = useState(() => initialRows);
  useEffect(() => setRows(initialRows), [initialRows]);

  const [year, setYear] = useState(() => defaultYear || currentYear);
  const [season, setSeason] = useState(() => (SEASONS.includes(defaultSeason) ? defaultSeason : ""));
  const [status, setStatus] = useState(() => (LIST_STATUSES.includes(defaultStatus) ? defaultStatus : "Pending"));
  const [reference, setReference] = useState(() => String(defaultReference || ""));
  const [saving, setSaving] = useState(false);

  const customerName = estimate?.customerName || "—";

  const updateQty = (id, value) => {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, quantity: Math.max(0, Number(value) || 0) } : r)));
  };

  // Editable Size
  const updateSize = (id, value) => {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, size: value } : r)));
  };

  const payloadFromState = () => ({
    realmId,
    estimateId,
    docNumber,
    reference: reference.trim(), // list-level only
    customerName,
    year,
    season,
    status, // list-level status
    items: rows.map((r) => ({ name: r.name, size: r.size, quantity: Number(r.quantity) || 0 })),
  });

  const handleSave = async () => {
    try {
      setSaving(true);
      const payload = payloadFromState();

      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/admin/pottinglists/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg || "Failed to save potting list");
      }
      const created = await res.json();
      toast.success(`Potting list saved`);
      // Prefer callback if provided
      //if (typeof onSave === "function") onSave(created);
      // Navigate back by default
     // else navigate(-1);
    } catch (err) {
      console.error("Save potting list failed:", err);
      //alert(`Could not save potting list: ${err?.message || err}`);
        toast.error(`Potting list is not saved`);
    } finally {
      setSaving(false);
    }
  };

  // Build header + items for printing from current state
  const printHeader = {
    customerName,
    year,
    season,
    status,           // list-level status if you keep it
    reference,
    estimateId,
    docNumber:docNumber,     // include if you have it
    logoUrl: "/logo.png",               // or your brand logo path
  };
  const printItems = rows.map(r => ({
    name: r.name,
    size: r.size,
    quantity: r.quantity,
    status: r.status || "Pending",
  }));

 const handlePrint = useReactToPrint({
    contentRef,                             // ✅ v3 way
    documentTitle: `Potting List - ${customerName} - ${year}-${season}`,
    removeAfterPrint: true,
  });

  return (
    <div className="p-4 sm:p-6 space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <div className="text-sm text-gray-600 mt-1">
            Customer: <span className="font-medium">{customerName}</span>
          </div>
          {estimateId && (
            <div className="text-xs text-gray-500">Estimate# : {docNumber}</div>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <label className="text-sm">
            <span className="mr-2">Year</span>
            <select
              className="border rounded-md px-2 py-1 text-sm"
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
            >
              {yearOptions.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </label>

          <label className="text-sm">
            <span className="mr-2">Season</span>
            <select
              className="border rounded-md px-2 py-1 text-sm"
              value={season}
              onChange={(e) => setSeason(e.target.value)}
            >
              {SEASONS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </label>

          <label className="text-sm">
            <span className="mr-2">Status</span>
            <select
              className="border rounded-md px-2 py-1 text-sm"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              {LIST_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </label>

          <label className="text-sm">
            <span className="mr-2">Reference</span>
            <input
              type="text"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              placeholder="e.g., PL-2025-0007"
              className="border rounded-md px-2 py-1 text-sm w-40"
            />
          </label>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto border rounded-xl">
        <table className="w-full border text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-2 py-1 border text-left">#</th>
              <th className="px-3 py-2 border text-left">Item Name</th>
              <th className="px-3 py-2 border text-left">Size</th>
              <th className="px-3 py-2 border text-left">Quantity</th>
            </tr>
          </thead>
        <tbody>
  {rows.length === 0 && (
    <tr>
      <td colSpan={4} className="px-3 py-4 text-center text-gray-500">
        No items found.
      </td>
    </tr>
  )}

  {rows.map((r, idx) => {
    const dlId = `size-options-${r.id}`; // unique per row
    return (
      <tr key={r.id} className="border-t">
        <td className="px-3 py-2 align-middle text-gray-500">{idx + 1}</td>
        <td className="px-3 py-2 align-middle">
          <div className="font-medium">{r.name || "—"}</div>
        </td>

        {/* EDITABLE SIZE with its own datalist */}
        <td className="px-3 py-2 align-middle">
          <input
            type="text"
            value={r.size}
            onChange={(e) => updateSize(r.id, e.target.value)}
            list={dlId}
            autoComplete="off"
            placeholder="e.g., #1, #2, 10cm"
            className="w-36 border rounded-md px-2 py-1"
            onKeyDown={(e) => {
              // Tip: pressing ArrowDown opens suggestions in most browsers
              if (e.key === "ArrowDown") e.currentTarget.blur(), e.currentTarget.focus();
            }}
          />
          <datalist id={dlId}>
            {SIZE_OPTIONS.map((opt) => (
              <option key={opt} value={opt} />
            ))}
          </datalist>
        </td>

        <td className="px-3 py-2 align-middle">
          <input
            type="number"
            min="0"
            step="1"
            value={r.quantity}
            onChange={(e) => updateQty(r.id, e.target.value)}
            className="w-28 border rounded-md px-2 py-1"
          />
        </td>
      </tr>
    );
  })}
</tbody>
        </table>

        {/* Suggestions for size (free-form still allowed) */}
        {/* <datalist id="size-options">
          <option value="#1" />
          <option value="#2" />
          <option value="#3" />
          <option value="#5" />
          <option value="#7" />
          <option value="#10" />
          <option value="#15" />
          <option value="#20" />
          <option value="50 Plug" />
          <option value="72 Plug" />
        </datalist> */}
      </div>

      {/* Footer actions */}
      <div className="mt-4 flex justify-end gap-3">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving || rows.length === 0}
          className={`rounded-md px-4 py-2 text-white ${saving ? "bg-green-400" : "bg-green-600 hover:bg-green-700"}`}
        >
          {saving ? "Saving..." : "Save"}
        </button>
           <button type="button" onClick={handlePrint}
          className="rounded-md bg-green-600 px-4 py-2 text-white hover:bg-green-700">
          Print
        </button>
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="rounded-md bg-gray-300 px-4 py-2 text-black hover:bg-gray-200"
        >
          Cancel
        </button>
 {/* Hidden on screen, visible for printing */}
      <div className="hidden print:block">
        <PottingListPrint ref={contentRef} header={printHeader} items={printItems} />
      </div>

      </div>
    </div>
  );
}
