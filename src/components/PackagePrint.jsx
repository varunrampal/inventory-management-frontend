// PackagePrint.jsx
// Printable-only component to be used with react-to-print.
// Render it off-screen and trigger printing from a parent.
// Usage (parent):
//   const printRef = useRef(null);
//   const handlePrint = useReactToPrint({ content: () => printRef.current });
//   <div style={{ position: "absolute", left: "-99999px" }}>
//     <PackagePrint ref={printRef} company={company} pkg={pkg} items={items} taxRate={0.05} />
//   </div>

// import React, { forwardRef, useMemo } from "react";
// import { useRealm } from "../context/RealmContext";
// import CompanyLogo from "./CompanyLogo"; // Assuming you have a CompanyLogo component



// const PackagePrint = forwardRef(function PackagePrint(
//     { company, pkg, items, taxRate, currency },
//     ref
// ) {
//     const { realmId } = useRealm();
//     const rows = useMemo(
//         () =>
//             (items || []).map((it) => ({
//                 ...it,
//                 quantity: Number(it.quantity || 0),
//                 rate: Number(it.rate || 0),
//                 amount: Number(it.quantity || 0) * Number(it.rate || 0),
//             })),
//         [items]
//     );

//     const subtotal = useMemo(
//         () => rows.reduce((s, r) => s + r.amount, 0),
//         [rows]
//     );
//     const tax = useMemo(() => subtotal * Number(taxRate || 0), [subtotal, taxRate]);
//     const total = useMemo(() => subtotal + tax, [subtotal, tax]);
//     const sumBy = (arr, key) =>
//         (arr || []).reduce((s, x) => s + Number(x?.[key] || 0), 0);
//     const totalQty = useMemo(() => sumBy(rows, "quantity"), [rows]);

//     const fmt = (n) =>
//         new Intl.NumberFormat("en-CA", {
//             style: "currency",
//             currency,
//             minimumFractionDigits: 2,
//             maximumFractionDigits: 2,
//         }).format(n || 0);

//     function Row({ label, value }) {
//         return (
//             <div className="grid grid-cols-[140px,1fr] items-start gap-3">
//                 <div className="text-xs uppercase tracking-wider text-gray-600">{label}</div>
//                 <div className="font-medium">{value ?? "—"}</div>
//             </div>
//         );
//     }

//     function Field({ label, children, className = "" }) {
//         return (
//             <div className={className} style={{ breakInside: "avoid" }}>
//                 <div className="text-xs uppercase tracking-wider text-gray-600">{label}</div>
//                 <div className="mt-1 font-medium">{children ?? "—"}</div>
//             </div>
//         );
//     }


//     return (
//         <div
//             ref={ref}
//             className="min-h-screen bg-white text-black"
//             style={{
//                 // Keep colors/logos crisp in print
//                 WebkitPrintColorAdjust: "exact",
//                 printColorAdjust: "exact",
//             }}
//         >
//             <div className="mx-auto max-w-4xl p-6">
//                 {/* Header */}
//                 <header className="flex items-start justify-between gap-4 border-b pb-4">
//                     <div className="flex items-center gap-4">
//                         <CompanyLogo companyId={realmId} height="30mm" />
//                         <div>
//                             <h1 className="text-xl font-bold">{company.name}</h1>
//                             {company.address && (
//                                 <p className="text-sm text-black">{company.address}</p>
//                             )}
//                             <p className="text-sm text-black">
//                                 {[company.phone, company.email, company.website].filter(Boolean).join(" · ")}
//                             </p>
//                         </div>
//                     </div>

//                     <div className="text-right">
//                         <div className="text-2xl uppercase tracking-wider text-black font-bold">Package</div>
//                         <div className="text-lg font-extrabold">{pkg.packageId}</div>
//                         {pkg.estimateId && (
//                             <div className="text-sm text-black">
//                                 Estimate: <span className="font-medium">{pkg.estimateId}</span>
//                             </div>
//                         )}
//                         <div className="text-lg text-black">
//                             Ship Date:{" "}
//                             <span className="font-medium">
//                                 {pkg.shipmentDate ? new Date(pkg.shipmentDate).toLocaleDateString() : "-"}
//                             </span>
//                         </div>
//                     </div>
//                 </header>

//                 {/* Parties — labels as headings, values below; side-by-side grid */}
//                 <section className="mt-4 rounded-lg border p-4">
//                     <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">
//                         <Field label="Customer">{pkg.customerName || "—"}</Field>
//                         <Field label="Ship Date">{pkg.shipmentDate ? new Date(pkg.shipmentDate).toLocaleDateString() : "-"}</Field>
//                         {/* <Field label="Package">{pkg.packageId || "—"}</Field> */}

//                         <Field label="Estimate">{pkg.estimateId || "—"}</Field>
//                         {pkg.driverName && <Field label="Driver">{pkg.driverName}</Field>}
//                         {pkg.customerEmail && <Field label="Email">{pkg.customerEmail}</Field>}

//                         <Field label="Total Qty">{totalQty || "—"}</Field>
//                         <Field label="Ship To">
//                             <span className="whitespace-pre-wrap">{pkg.shipTo || "—"}</span>
//                         </Field>

//                         {/* Notes spans full width */}
//                         {pkg.notes && (
//                             <Field className="sm:col-span-2 lg:col-span-3" label="Notes">
//                                 <span className="whitespace-pre-wrap">{pkg.notes}</span>
//                             </Field>
//                         )}
//                     </div>
//                 </section>

//                 {/* Items */}
//                 <section className="mt-6">
//                     <table className="w-full border-collapse text-sm">
//                         <thead>
//                             <tr className="bg-gray-100">
//                                 <th className="border px-2 py-2 text-left">#</th>
//                                 <th className="border px-2 py-2 text-left">Plant Name</th>
//                                 <th className="border px-2 py-2 text-right">Qty</th>
//                                 {/* <th className="border px-2 py-2 text-right">Rate</th>
//                 <th className="border px-2 py-2 text-right">Amount</th> */}
//                             </tr>
//                         </thead>
//                         <tbody>
//                             {rows.map((r, idx) => (
//                                 <tr
//                                     key={r.itemId || `${r.name}-${idx}`}
//                                     style={{ pageBreakInside: "avoid" }}
//                                 >
//                                     <td className="border px-2 py-1 align-top">{idx + 1}</td>
//                                     <td className="border px-2 py-1">
//                                         <div className="font-medium">{r.name}</div>
//                                         {r.sku && <div className="text-xs text-gray-600">SKU: {r.sku}</div>}
//                                         {r.description && (
//                                             <div className="text-xs text-gray-600 whitespace-pre-wrap">
//                                                 {r.description}
//                                             </div>
//                                         )}
//                                     </td>
//                                     <td className="border px-2 py-1 text-right">{r.quantity}</td>
//                                     {/* <td className="border px-2 py-1 text-right">{fmt(r.rate)}</td>
//                   <td className="border px-2 py-1 text-right">{fmt(r.amount)}</td> */}
//                                 </tr>
//                             ))}
//                             {rows.length === 0 && (
//                                 <tr>
//                                     <td className="border px-2 py-4 text-center text-gray-600" colSpan={5}>
//                                         No items in this package.
//                                     </td>
//                                 </tr>
//                             )}
//                         </tbody>
//                         <tfoot>
//                             {/* Total quantity row */}
//                             <tr className="bg-gray-50">
//                                 <td className="border px-2 py-2 text-right" colSpan={2}>Total Qty</td>
//                                 <td className="border px-2 py-2 text-right font-semibold">{totalQty}</td>
                              
//                             </tr>
//                         </tfoot>
//                         {/* <tfoot>
//               <tr>
//                 <td className="border px-2 py-2" colSpan={3}></td>
//                 <td className="border px-2 py-2 text-right font-medium">Subtotal</td>
//                 <td className="border px-2 py-2 text-right">{fmt(subtotal)}</td>
//               </tr>
//               {taxRate > 0 && (
//                 <tr>
//                   <td className="border px-2 py-2" colSpan={3}></td>
//                   <td className="border px-2 py-2 text-right font-medium">
//                     Tax ({Math.round(Number(taxRate) * 100)}%)
//                   </td>
//                   <td className="border px-2 py-2 text-right">{fmt(tax)}</td>
//                 </tr>
//               )}
//               <tr>
//                 <td className="border px-2 py-2" colSpan={3}></td>
//                 <td className="border px-2 py-2 text-right font-semibold">Total</td>
//                 <td className="border px-2 py-2 text-right font-semibold">{fmt(total)}</td>
//               </tr>
//             </tfoot> */}
//                     </table>
//                 </section>

//                 {/* Notes */}
//                 {(pkg.notes?.trim()?.length ?? 0) > 0 && (
//                     <section className="mt-4">
//                         <div className="mb-1 text-xs uppercase tracking-wider text-gray-600">Notes</div>
//                         <p className="whitespace-pre-wrap text-sm">{pkg.notes}</p>
//                     </section>
//                 )}

//                 {/* Footer */}
//                 <footer className="mt-8 flex items-center justify-between text-xs text-gray-600">
//                     <div>{company.name}</div>
//                     {/* <div>Printed on {new Date().toLocaleString()}</div> */}
//                 </footer>
//             </div>

//             {/* Print CSS (scoped) */}
//             <style>{`
//         @media print {
//           @page { size: auto; margin: 12mm; } /* adjust for A4/Letter */
//           body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
//           table { page-break-inside: auto; }
//           tr, td, th { page-break-inside: avoid; }
//           thead { display: table-header-group; }
//           tfoot { display: table-footer-group; }
//         }
//       `}</style>
//         </div>
//     );
// });

// export default PackagePrint;

import React, { forwardRef, useMemo } from "react";
import { useRealm } from "../context/RealmContext";
import CompanyLogo from "./CompanyLogo"; 

const keyOf = (row) => String(row?.itemId ?? row?.ItemRef?.value ?? row?.name ?? "");

const fmtDate = (d) => {
  if (!d) return "—";
  // support ISO string or Mongo extended JSON { $date: "..." }
  const raw = typeof d === "string" ? d : d?.$date ?? d;
  const dt = new Date(raw);
  return isNaN(dt) ? "—" : dt.toLocaleDateString();
};

const PackagePrint = forwardRef(function PackagePrint(
  { company, pkg, items, taxRate, currency },
  ref
) {
  const { realmId } = useRealm();

  // Index lines by a stable key so we can enrich rows with names/rates if present
  const lineByKey = useMemo(() => {
    const lines = pkg?.lines || [];
    return Object.fromEntries(
      lines.map((ln) => {
        const k = keyOf(ln);
        return [k, { ...ln, itemId: k }];
      })
    );
  }, [pkg?.lines]);

  // Build rows primarily from pkg.quantities (source of truth for this package)
  const rows = useMemo(() => {
    const q = pkg?.quantities;
    console.log('quantities:', q);
    // Preferred path: quantities map → rows
    if (q && typeof q === "object" && Object.keys(q).length) {
      return Object.entries(q).map(([k, qty]) => {
        const fromLine = lineByKey[k];
        const name = fromLine?.name ?? k;
        const rate = Number(fromLine?.rate || 0);
        const quantity = Number(qty || 0);
        return {
          itemId: k,
          name,
          quantity,
          rate,
          amount: quantity * rate,
        };
      });
    }
    // Fallback: legacy items prop (keeps old behavior if needed)
    return (items || []).map((it) => ({
      ...it,
      itemId: keyOf(it),
      name: it.name ?? keyOf(it),
      quantity: Number(it.quantity || 0),
      rate: Number(it.rate || 0),
      amount: Number(it.quantity || 0) * Number(it.rate || 0),
    }));
  }, [pkg?.quantities, items, lineByKey]);

  const subtotal = useMemo(() => rows.reduce((s, r) => s + (r.amount || 0), 0), [rows]);
  const tax = useMemo(() => subtotal * Number(taxRate || 0), [subtotal, taxRate]);
  const total = useMemo(() => subtotal + tax, [subtotal, tax]);
  const totalQty = useMemo(() => rows.reduce((s, r) => s + (Number(r.quantity) || 0), 0), [rows]);

  const fmtMoney = (n) =>
    new Intl.NumberFormat("en-CA", {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(n || 0);

  function Field({ label, children, className = "" }) {
    return (
      <div className={className} style={{ breakInside: "avoid" }}>
        <div className="text-xs uppercase tracking-wider text-gray-600">{label}</div>
        <div className="mt-1 font-medium">{children ?? "—"}</div>
      </div>
    );
  }

  return (
    <div
      ref={ref}
      className="min-h-screen bg-white text-black"
      style={{ WebkitPrintColorAdjust: "exact", printColorAdjust: "exact" }}
    >
      <div className="mx-auto max-w-4xl p-6">
        {/* Header */}
        <header className="flex items-start justify-between gap-4 border-b pb-4">
          <div className="flex items-center gap-4">
            <CompanyLogo companyId={realmId} height="30mm" />
            <div>
              <h1 className="text-xl font-bold">{company?.name}</h1>
              {company?.address && <p className="text-sm text-black">{company.address}</p>}
              <p className="text-sm text-black">
                {[company?.phone, company?.email, company?.website].filter(Boolean).join(" · ")}
              </p>
            </div>
          </div>

          <div className="text-right">
            <div className="text-2xl uppercase tracking-wider text-black font-bold">Package</div>
            <div className="text-lg font-extrabold">
              {pkg?.packageCode || pkg?.packageId || "—"}
            </div>
            {pkg?.estimateId && (
              <div className="text-sm text-black">
                Estimate: <span className="font-medium">{pkg.estimateId}</span>
              </div>
            )}
            <div className="text-lg text-black">
              Ship Date: <span className="font-medium">{fmtDate(pkg?.shipmentDate)}</span>
            </div>
          </div>
        </header>

        {/* Info grid */}
        <section className="mt-4 rounded-lg border p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">
            <Field label="Customer">
              {pkg?.customerName || pkg?.snapshot?.customerName || "—"}
            </Field>
            <Field label="Ship Date">{fmtDate(pkg?.shipmentDate)}</Field>
            <Field label="Estimate">{pkg?.estimateId || "—"}</Field>
            {pkg?.driverName && <Field label="Driver">{pkg.driverName}</Field>}
            {pkg?.customerEmail && <Field label="Email">{pkg.customerEmail}</Field>}
            <Field label="Total Qty">{totalQty || "—"}</Field>
            <Field label="Ship To">
              <span className="whitespace-pre-wrap">{pkg?.shipTo || "—"}</span>
            </Field>

            {pkg?.notes && (
              <Field className="sm:col-span-2 lg:col-span-3" label="Notes">
                <span className="whitespace-pre-wrap">{pkg.notes}</span>
              </Field>
            )}
          </div>
        </section>

        {/* Items */}
        <section className="mt-6">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="border px-2 py-2 text-left">#</th>
                <th className="border px-2 py-2 text-left">Plant Name</th>
                <th className="border px-2 py-2 text-right">Qty</th>
                {/* Uncomment if you later want prices:
                <th className="border px-2 py-2 text-right">Rate</th>
                <th className="border px-2 py-2 text-right">Amount</th> */}
              </tr>
            </thead>
            <tbody>
              {rows.map((r, idx) => (
                <tr key={r.itemId || `${r.name}-${idx}`} style={{ pageBreakInside: "avoid" }}>
                  <td className="border px-2 py-1 align-top">{idx + 1}</td>
                  <td className="border px-2 py-1">
                    <div className="font-medium">{r.name}</div>
                    {r.sku && <div className="text-xs text-gray-600">SKU: {r.sku}</div>}
                    {r.description && (
                      <div className="text-xs text-gray-600 whitespace-pre-wrap">
                        {r.description}
                      </div>
                    )}
                  </td>
                  <td className="border px-2 py-1 text-right">{r.quantity}</td>
                  {/* <td className="border px-2 py-1 text-right">{fmtMoney(r.rate)}</td>
                  <td className="border px-2 py-1 text-right">{fmtMoney(r.amount)}</td> */}
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td className="border px-2 py-4 text-center text-gray-600" colSpan={5}>
                    No items in this package.
                  </td>
                </tr>
              )}
            </tbody>
            <tfoot>
              <tr className="bg-gray-50">
                <td className="border px-2 py-2 text-right" colSpan={2}>
                  Total Qty
                </td>
                <td className="border px-2 py-2 text-right font-semibold">{totalQty}</td>
              </tr>
              {/* If you re-enable pricing:
              <tr>
                <td className="border px-2 py-2" colSpan={3}></td>
                <td className="border px-2 py-2 text-right font-medium">Subtotal</td>
                <td className="border px-2 py-2 text-right">{fmtMoney(subtotal)}</td>
              </tr>
              {taxRate > 0 && (
                <tr>
                  <td className="border px-2 py-2" colSpan={3}></td>
                  <td className="border px-2 py-2 text-right font-medium">
                    Tax ({Math.round(Number(taxRate) * 100)}%)
                  </td>
                  <td className="border px-2 py-2 text-right">{fmtMoney(tax)}</td>
                </tr>
              )}
              <tr>
                <td className="border px-2 py-2" colSpan={3}></td>
                <td className="border px-2 py-2 text-right font-semibold">Total</td>
                <td className="border px-2 py-2 text-right font-semibold">{fmtMoney(total)}</td>
              </tr> */}
            </tfoot>
          </table>
        </section>

        {/* Notes (duplicate block kept for compatibility) */}
        {(pkg?.notes?.trim()?.length ?? 0) > 0 && (
          <section className="mt-4">
            <div className="mb-1 text-xs uppercase tracking-wider text-gray-600">Notes</div>
            <p className="whitespace-pre-wrap text-sm">{pkg.notes}</p>
          </section>
        )}

        {/* Footer */}
        <footer className="mt-8 flex items-center justify-between text-xs text-gray-600">
          <div>{company?.name}</div>
        </footer>
      </div>

      {/* Print CSS */}
      <style>{`
        @media print {
          @page { size: auto; margin: 12mm; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          table { page-break-inside: auto; }
          tr, td, th { page-break-inside: avoid; }
          thead { display: table-header-group; }
          tfoot { display: table-footer-group; }
        }
      `}</style>
    </div>
  );
});

export default PackagePrint;

