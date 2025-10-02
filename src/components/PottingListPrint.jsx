import React, { forwardRef } from "react";

const PottingListPrint = forwardRef(function PottingListPrint({ header, items }, ref) {
  return (
    <div ref={ref} className="bg-white text-black p-6">
      <style>{`
        @media print {
          @page { size: Letter portrait; margin: 12mm; }
          thead { display: table-header-group; }
          tfoot { display: table-footer-group; }
        }
      `}</style>

      <div className="flex items-start justify-between mb-4">
        <div className="space-y-0.5">
          <div className="text-xl font-semibold">Potting List</div>
            {header.estimateId ? <div className="text-sm">Estimate#: {header.docNumber}</div> : null}
          <div className="text-sm">Customer: {header.customerName}</div>
          <div className="text-sm">Year/Season: {header.year} · {header.season}</div>
          {header.reference ? <div className="text-sm">Reference: {header.reference}</div> : null}
          {header.status ? <div className="text-sm">Status: {header.status}</div> : null}
          {/* {header.docNumber ? <div className="text-sm">Doc#: {header.docNumber}</div> : null} */}
        
          {/* <div className="text-xs mt-1">
            Printed: {new Date().toLocaleString("en-CA", { timeZone: "America/Vancouver" })}
          </div> */}
        </div>
        {header.logoUrl ? <img src={header.logoUrl} alt="Logo" className="h-12" /> : null}
      </div>

      <table className="w-full border text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="border px-2 py-1 text-left w-10">#</th>
            <th className="border px-2 py-1 text-left">Item Name</th>
            <th className="border px-2 py-1 text-left w-28">Size</th>
            <th className="border px-2 py-1 text-right w-20">Qty</th>
            <th className="border px-2 py-1 text-left w-40">Status</th>
          </tr>
        </thead>
        <tbody>
          {items.map((r, i) => (
            <tr key={i}>
              <td className="border px-2 py-1 align-middle">{i + 1}</td>
              <td className="border px-2 py-1 align-middle">{r.name}</td>
              <td className="border px-2 py-1 align-middle">{r.size || "—"}</td>
              <td className="border px-2 py-1 align-middle text-right">{Number(r.quantity) || 0}</td>
              <td className="border px-2 py-1 align-middle">{r.status || "Pending"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
});

export default PottingListPrint;
