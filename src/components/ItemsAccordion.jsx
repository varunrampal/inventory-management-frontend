import { useMemo, useState } from "react";

function SectionHeader({ title, isOpen, onToggle, count }) {
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
  );
}

export default function ItemsAccordion({
  items = [],
  totalAmount,           // optional: if you already have it on the estimate
  estimateId,            // optional: for context text
  defaultOpen = true,
}) {
  const [open, setOpen] = useState(defaultOpen);
  const totalQty = useMemo(
    () => items.reduce((sum, i) => sum + (Number(i?.quantity) || 0), 0),
    [items]
  );



  // Detect optional columns
  const hasRate = useMemo(() => items.some(i => typeof i?.rate === "number"), [items]);
  const hasAmount = useMemo(() => items.some(i => typeof i?.amount === "number"), [items]);

  // Compute totals if not provided
  const computedTotal = useMemo(() => {
    if (typeof totalAmount === "number") return totalAmount;
    if (hasAmount) return items.reduce((s, i) => s + (Number(i.amount) || 0), 0);
    if (hasRate) return items.reduce((s, i) => s + (Number(i.rate) * Number(i.quantity || 0) || 0), 0);
    return null;
  }, [items, hasAmount, hasRate, totalAmount]);

  return (
    <div className="rounded-lg border border-gray-200 overflow-hidden shadow-sm bg-white">
      <SectionHeader
        title="🧮 Items"
        count={items.length}
        isOpen={open}
        onToggle={() => setOpen(!open)}
      />

      {open && (
        <div className="p-4 bg-gray-50">
          {/* {estimateId && (
            <p className="mb-3 text-sm text-gray-600">
              Items for Estimate <span className="font-medium">#{estimateId}</span>
            </p>
          )} */}

          {items.length ? (
            <div className="overflow-auto rounded-md border border-gray-200 bg-white">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-100 text-gray-700">
                  <tr>
                    <th className="p-2 text-left">Item Name</th>
                    <th className="p-2 text-right">Quantity</th>
                    {hasRate && <th className="p-2 text-right">Rate</th>}
                    {hasAmount && <th className="p-2 text-right">Amount</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {items.map((item, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="p-2">{item.name}</td>
                      <td className="p-2 text-right">{item.quantity}</td>
                      {hasRate && (
                        <td className="p-2 text-right">
                          {typeof item.rate === "number" ? `$${item.rate.toFixed(2)}` : "—"}
                        </td>
                      )}
                      {hasAmount && (
                        <td className="p-2 text-right">
                          {typeof item.amount === "number" ? `$${item.amount.toFixed(2)}` : "—"}
                        </td>
                      )}
                    </tr>
                  ))}
<tr className="bg-gray-50 font-semibold">
  {/* empty first cell to align with Item Name column */}
  <td className="p-2"></td>

  {/* total quantity */}
  <td className="p-2 text-right">
    Qty: {totalQty}
  </td>

  {/* if you want rate column to stay aligned, leave it blank */}
  {hasRate && <td className="p-2"></td>}

  {/* total amount right next to quantity */}
  {hasAmount && (
    <td className="p-2 text-right">
      Total: {computedTotal !== null ? `$${computedTotal.toFixed(2)}` : "—"}
    </td>
  )}
</tr>
{/* 
                  {(hasAmount || hasRate || typeof totalAmount === "number") && (
                    <tr className="bg-gray-50 font-semibold">
                      <td className="p-2 text-right" colSpan={hasRate && hasAmount ? 3 : hasRate || hasAmount ? 2 : 1}>
                        Total:
                      </td>
                      <td className="p-2 text-right">
                        {computedTotal !== null ? `$${computedTotal.toFixed(2)}` : "—"}
                      </td>
                    </tr>
                  )} */}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-gray-500 italic">No items in this estimate.</p>
          )}
        </div>
      )}
    </div>
  );
}
