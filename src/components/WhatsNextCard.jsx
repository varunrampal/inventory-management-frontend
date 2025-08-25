import { useState, useRef, useEffect } from "react";
import { ChevronDown, Package, Truck, FileText } from "lucide-react";

export default function WhatsNextCard({
  onConvert,          // (type) => void   type: 'package' | 'shipment' | 'invoice'
  onCreatePackage,    // () => void
  className = "",
}) {
  const [open, setOpen] = useState(false);
  const btnRef = useRef(null);
  const menuRef = useRef(null);

  // close dropdown on outside click / ESC
  useEffect(() => {
    const onDocClick = (e) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target) &&
        !btnRef.current.contains(e.target)
      ) setOpen(false);
    };
    const onEsc = (e) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onEsc);
    };
  }, []);

  const Item = ({ icon: Icon, label, value }) => (
    <button
      className="flex w-full items-center gap-2 rounded px-3 py-2 text-left text-sm hover:bg-gray-100"
      onClick={() => { setOpen(false); onConvert?.(value); }}
    >
      <Icon size={16} />
      <span>{label}</span>
    </button>
  );

  return (
    <div className={`rounded-lg m-5 p-4 border border-gray-200 bg-white shadow-sm ${className}`}>
      <div className="flex flex-wrap items-center">
        {/* Left: icon + title */}
        <div className="flex items-center">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-fuchsia-500 text-white mr-2">
            {/* simple sparkle icon */}
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
              <path d="M12 2l2.1 5.9L20 10l-5.9 2.1L12 18l-2.1-5.9L4 10l5.9-2.1L12 2zM6 18l1 3 3 1-3 1-1 3-1-3-3-1 3-1 1-3zM18 6l1 3 3 1-3 1-1 3-1-3-3-1 3-1 1-3z"/>
            </svg>
          </span>
          <div className="text-xs font-semibold tracking-wider text-gray-900">WHAT’S NEXT?</div>
        </div>

        {/* Right: text + actions */}
        <div className="my-auto ml-3 flex items-center gap-3">
          <p className="m-0 text-sm text-gray-900">
            Convert the sales order into packages, shipments, or invoices.
          </p>

          {/* Convert dropdown */}
          <div className="relative">
            <button
              ref={btnRef}
              type="button"
              aria-haspopup="menu"
              aria-expanded={open}
              onClick={() => setOpen((v) => !v)}
              className="inline-flex items-center gap-1 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium hover:bg-gray-50"
            >
              <span>Convert</span>
              <ChevronDown size={16} />
            </button>

            {open && (
              <div
                ref={menuRef}
                role="menu"
                className="absolute right-0 z-20 mt-1 w-48 overflow-hidden rounded-md border border-gray-200 bg-white shadow-lg"
              >
                <Item icon={Package} label="To Package"  value="package" />
                <Item icon={Truck}   label="To Shipment" value="shipment" />
                <Item icon={FileText} label="To Invoice" value="invoice" />
              </div>
            )}
          </div>

          {/* Create Package button */}
          <button
            type="button"
            className="rounded-md bg-green-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-green-700"
            onClick={onCreatePackage}
          >
            Create Package
          </button>
        </div>
      </div>
    </div>
  );
}
