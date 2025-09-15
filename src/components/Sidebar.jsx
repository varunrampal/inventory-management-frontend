import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";

function Chevron({ open }) {
  return (
    <svg
      className={`h-4 w-4 transition-transform ${open ? "rotate-90" : ""}`}
      viewBox="0 0 20 20" fill="currentColor"
      aria-hidden="true"
    >
      <path d="M7.05 4.55a1 1 0 0 0 0 1.41L10.09 9 7.05 12.04a1 1 0 1 0 1.41 1.41l3.54-3.54a1 1 0 0 0 0-1.41L8.46 4.55a1 1 0 0 0-1.41 0Z" />
    </svg>
  );
}

function SubMenu({ label, children, defaultOpen = false, activeWhen = [] }) {
  const [userOpen, setUserOpen] = useState(defaultOpen);
  const ref = useRef(null);
  const [height, setHeight] = useState(0);
  const { pathname } = useLocation();

  // Open the group if current route matches any prefix in activeWhen
  const isActiveGroup =
    activeWhen?.length > 0 &&
    activeWhen.some((prefix) => pathname.startsWith(prefix));

  // We show the submenu if it is either user-open OR active due to route
  const open = userOpen || isActiveGroup;

  useEffect(() => {
    if (!ref.current) return;
    setHeight(open ? ref.current.scrollHeight : 0);
  }, [open, children]);

  return (
    <li className="text-white">
      <button
        onClick={() => setUserOpen((v) => !v)}
        aria-expanded={open}
        className="w-full flex items-center justify-between rounded-md px-3 py-2 hover:bg-gray-700/60 focus:outline-none focus:ring-2 focus:ring-indigo-500"
      >
        <span className="text-sm">{label}</span>
        <svg
          className={`h-4 w-4 transition-transform ${open ? "rotate-90" : ""}`}
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M7.05 4.55a1 1 0 0 0 0 1.41L10.09 9 7.05 12.04a1 1 0 1 0 1.41 1.41l3.54-3.54a1 1 0 0 0 0-1.41L8.46 4.55a1 1 0 0 0-1.41 0Z" />
        </svg>
      </button>

      <div
        style={{ height }}
        className="overflow-hidden transition-[height] duration-300"
      >
        <ul ref={ref} className="pl-3 py-1 space-y-1 text-sm">
          {children}
        </ul>
      </div>
    </li>
  );
}
 function NavItem({ to, label, activeWhen }) {
  const { pathname } = useLocation();

  // Convert `activeWhen` into array of matchers
  const ensureArray = (v) =>
    v == null ? [] : Array.isArray(v) ? v : [v];

  const patterns = ensureArray(activeWhen);

  const matches = (pattern) => {
    if (pattern instanceof RegExp) return pattern.test(pathname);
    if (typeof pattern === "string") return pathname.startsWith(pattern);
    return false;
  };

  // Highlight if pathname starts with `to`, or any extra rule matches
  const active =
    pathname === to ||
    pathname.startsWith(to + "/") ||
    patterns.some(matches);

  return (
    <li>
      <Link
        to={to}
        className={`block rounded-md px-3 py-2 transition ${
          active
            ? "bg-gray-700/70 font-medium text-white"
            : "text-white hover:bg-gray-700/60"
        }`}
      >
        {label}
      </Link>
    </li>
  );
}

export default function Sidebar({ open, setOpen }) {
  // close drawer on route change (mobile)
  const { pathname } = useLocation();
  useEffect(() => {
    setOpen?.(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  return (
    <>
      {/* Backdrop for mobile */}
      <div
        onClick={() => setOpen?.(false)}
        className={`fixed inset-0 bg-black/40 z-40 lg:hidden transition-opacity ${
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      />

      <aside
        className={`fixed z-50 lg:z-auto lg:static bg-gray-800 w-64 min-h-screen p-4 transition-transform duration-300
          ${open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
        aria-label="Sidebar"
      >
        <nav>
          <ul className="space-y-1">
            <NavItem to="/dashboard" label="Dashboard" />
            <NavItem to="/inventory" label="Inventory" />
            {/* Inventory group */}
            {/* <SubMenu label="Inventory" defaultOpen={false}>
              <NavItem to="/inventory" label="All Inventory" />
              <NavItem to="/lowstockplants" label="Low Stock Plants" />
              <NavItem to="/inventory/new" label="Add Item" />
              <NavItem to="/inventory/categories" label="Categories" />
            </SubMenu> */}

            {/* Sales group */}
            <SubMenu label="Sales" activeWhen={["/estimates","/estimate/", "/packages", "/package/"]}>
              <NavItem to="/estimates" label="Estimates"  activeWhen={["/estimate/"]}/>
              <NavItem to="/packages" label="Packages"  activeWhen={["/package/"]}  />
 
            </SubMenu>

            {/* QuickBooks / Sync group */}
            <SubMenu label="QuickBooks" activeWhen={["/conncet-qb"]}>
              <NavItem to="/connect-qb" label="Connect QuickBooks" />
              {/* <NavItem to="/sync/logs" label="Sync Logs" />
              <NavItem to="/sync/tokens" label="Tokens" /> */}
            </SubMenu>

            {/* You can add more groups here */}
          </ul>
        </nav>
      </aside>
    </>
  );
}


// export default function Sidebar() {
//   return (
//     <aside className="bg-gray-800 p-4 w-64 min-h-screen">
//       <nav>
//         <ul className="space-y-2">
//           <li><a href="/dashboard" className="text-white">Dashboard</a></li>
//            <li><a href="/inventory" className="text-white">Inventory</a></li>
//            <li><a href="/estimates" className="text-white">Estimates</a></li>
//           <li><a href="/lowstockplants" className="text-white">Low Stock Plants</a></li>
//           {/* <li><a href="/analytics" className="text-white">Analytics</a></li> */}
//           <li><a href="/sync" className="text-white">Sync Quickbooks</a></li>
//         </ul>
//       </nav>
//     </aside>
//   );
// }