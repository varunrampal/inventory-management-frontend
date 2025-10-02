import { useState, useRef, useEffect } from "react";
import { ChevronDown, Package, Truck, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useRealm } from '../context/RealmContext';

const BASE_URL = import.meta.env.VITE_API_BASE_URL;
const LOOKUP_PATH = "/admin/pottinglists/for-estimate";   // or "/pottinglists/for-estimate"
const CREATE_PAGE = "/create-pottinglist";                 // your page that renders the form

export default function WhatsNextCard({
  estimate,            // <-- pass the current estimate here
  onConvert,           // (type) => void   type: 'package' | 'shipment' | 'invoice'
  onCreatePackage,     // () => void
  className = "",
}) {
  const [open, setOpen] = useState(false);
  const btnRef = useRef(null);
  const menuRef = useRef(null);
  const navigate = useNavigate();
  const { realmId } = useRealm();
  const [created, setCreated] = useState(null);
  const [plLoading, setPlLoading] = useState(false);

const estimateId =
  estimate?.estimateId ?? estimate?.Id ?? estimate?.id ?? "";

  // close dropdown on outside click / ESC
  // useEffect(() => {
  //   const onDocClick = (e) => {
  //     if (
  //       menuRef.current &&
  //       !menuRef.current.contains(e.target) &&
  //       btnRef.current &&
  //       !btnRef.current.contains(e.target)
  //     ) {
  //       setOpen(false);
  //     }
  //   };
  //   const onEsc = (e) => e.key === "Escape" && setOpen(false);
  //   document.addEventListener("mousedown", onDocClick);
  //   document.addEventListener("keydown", onEsc);
  //   return () => {
  //     document.removeEventListener("mousedown", onDocClick);
  //     document.removeEventListener("keydown", onEsc);
  //   };
  // }, []);
  useEffect(() => {
  // ===== 1) Check if a potting list already exists (setCreated) =====
  let ignore = false;
  const ac = new AbortController();

  async function checkExisting() {
    // If we don't have the basics, treat as not created so the user can create one
    if (!realmId || !estimateId) {
      setCreated(false);
      return;
    }

    try {
      setCreated(null); // "checking…" state to avoid flicker

      const params = new URLSearchParams({
        realmId: String(realmId),
        estimateId,
      }).toString();

      const resp = await fetch(`${BASE_URL}${LOOKUP_PATH}?${params}`, {
        signal: ac.signal,
      });

      if (ignore) return;

      if (resp.status === 404) {
        setCreated(false);
        return;
      }

      if (!resp.ok) {
        // On server error, default to not created so the button offers "Create"
        setCreated(false);
        return;
      }

      const data = await resp.json();

      // Accept common API shapes:
      //  A) { found: true, doc: {...} }
      //  B) { found: false }
      //  C) { ...document fields... } (the doc itself)
      const found =
        data?.found === true ||
        (!!data && data?.doc) ||
        (!!data && !("found" in data));

      setCreated(!!found);
    } catch (err) {
      if (!ignore) setCreated(false);
    }
  }

  checkExisting();

  // ===== 2) Outside-click + Escape close (only when open) =====
  const isInside = (target) => {
    const path =
      typeof target?.composedPath === "function" ? target.composedPath() : [];
    const inMenu =
      menuRef.current &&
      (path.includes(menuRef.current) ||
        menuRef.current.contains(target));
    const inButton =
      btnRef.current &&
      (path.includes(btnRef.current) ||
        btnRef.current.contains(target));
    return inMenu || inButton;
  };

  const onPointerDown = (e) => {
    // ignore right-click/context menu
    if (e.button === 2) return;
    if (!isInside(e.target)) setOpen(false);
  };

  const onKeyDown = (e) => {
    if (e.key === "Escape") {
      e.stopPropagation();
      setOpen(false);
      btnRef.current?.focus?.(); // return focus to trigger
    }
  };

  if (open) {
    // capture so we see events even if children stopPropagation
    document.addEventListener("pointerdown", onPointerDown, { capture: true });
    document.addEventListener("keydown", onKeyDown);
  }

  // ===== Cleanup =====
  return () => {
    ignore = true;
    ac.abort();
    if (open) {
      document.removeEventListener("pointerdown", onPointerDown, {
        capture: true,
      });
      document.removeEventListener("keydown", onKeyDown);
    }
  };
}, [open, realmId, estimateId, BASE_URL, LOOKUP_PATH, setOpen, setCreated]);

const onCreatePottingList = async () => {
  if (plLoading) return;
  setPlLoading(true);
  //console.log('Create Potting List clicked', { estimate, realmId });
  try {
    const estimateId = estimate?.estimateId ?? estimate?.Id ?? estimate?.id ?? "";
    const params = new URLSearchParams({
      realmId: String(realmId || ""),
      estimateId,
    }).toString();

    const resp = await fetch(`${BASE_URL}${LOOKUP_PATH}?${params}`);

    if (resp.status === 404) {
      // Not found → go create
      setCreated(false);
      navigate(CREATE_PAGE, { state: { estimate, realmId } });
      return;
    }

    if (!resp.ok) {
      // Unknown error → still allow create as fallback
      setCreated(false);
      navigate(CREATE_PAGE, { state: { estimate, realmId } });
      return;
    }

    // Parse common response shapes:
    //  A) { found: true, doc: {...} }
    //  B) { found: false }
    //  C) { ...document fields... } (doc itself)
    const data = await resp.json();

    const found = data?.found === true
      || (!!data && data?.doc)               // has doc wrapper
      || (!!data && !('found' in data));     // assume raw doc

    const existingDoc = data?.doc ?? (found && data);

    if (found && existingDoc) {
      setCreated(true);
      navigate(CREATE_PAGE, { state: { existing: existingDoc, realmId, estimate } });
    } else {
      setCreated(false);
      navigate(CREATE_PAGE, { state: { estimate, realmId } });
    }
  } catch (err) {
    console.error("Lookup potting list failed:", err);
    setCreated(false);
    navigate(CREATE_PAGE, { state: { estimate, realmId } });
  } finally {
    setPlLoading(false);
  }
};

  const Item = ({ icon: Icon, label, value }) => (
    <button
      className="flex w-full items-center gap-2 rounded px-3 py-2 text-left text-sm hover:bg-gray-100"
      onClick={async () => {
        setOpen(false);
        if (value === "pottinglist") {
          await onCreatePottingList();
        } else {
          onConvert?.(value);
        }
      }}
      type="button"
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
          <span className="mr-2 inline-flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-fuchsia-500 text-white">
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
              <path d="M12 2l2.1 5.9L20 10l-5.9 2.1L12 18l-2.1-5.9L4 10l5.9-2.1L12 2zM6 18l1 3 3 1-3 1-1 3-1-3-3-1 3-1 1-3zM18 6l1 3 3 1-3 1-1 3-1-3-3-1 3-1 1-3z" />
            </svg>
          </span>
          <div className="text-xs font-semibold tracking-wider text-gray-900">WHAT’S NEXT?</div>
        </div>

        {/* Right: text + actions */}
        <div className="my-auto ml-3 flex items-center gap-3">
          <p className="m-0 text-sm text-gray-900">
            Convert the sales order into packages, shipments, invoices, or a potting list.
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
                className="absolute right-0 z-20 mt-1 w-52 overflow-hidden rounded-md border border-gray-200 bg-white shadow-lg"
              >
                <Item icon={Package} label="To Package" value="package" />
                <Item icon={Truck} label="To Shipment" value="shipment" />
                <Item icon={FileText} label="To Invoice" value="invoice" />
                <Item icon={Package} label={created ? "Open Potting List" : "To Potting List"} value="pottinglist" />
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

          {/* Create/Open Potting List button */}
 <button
  type="button"
  className="rounded-md bg-green-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-60 disabled:cursor-not-allowed"
  onClick={onCreatePottingList}
  disabled={!estimate || plLoading}
  title={!estimate ? "No estimate loaded" : undefined}
>
  {created ? "View Potting List" : "Create Potting List"}
</button>
        </div>
      </div>
    </div>
  );
}
