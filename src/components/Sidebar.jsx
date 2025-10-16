// src/components/Sidebar.jsx
import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { hasAnyRole } from "../auth/roles";

function Chevron({ open }) {
  return (
    <svg className={`h-4 w-4 transition-transform ${open ? "rotate-90" : ""}`} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path d="M7.05 4.55a1 1 0 0 0 0 1.41L10.09 9 7.05 12.04a1 1 0 1 0 1.41 1.41l3.54-3.54a1 1 0 0 0 0-1.41L8.46 4.55a1 1 0 0 0-1.41 0Z" />
    </svg>
  );
}

// ---- Guard helpers
function canSee(user, roles) {
  // no roles prop => visible to any logged-in user
  if (!roles || roles.length === 0) return !!user;
  return hasAnyRole(user, roles);
}

// ---- Guarded SubMenu
function SubMenu({ label, children, defaultOpen = false, activeWhen = [], roles }) {
  const auth = useAuth();
  const user = auth?.user ?? null;
  if (!canSee(user, roles)) return null;

  const [userOpen, setUserOpen] = useState(defaultOpen);
  const ref = useRef(null);
  const [height, setHeight] = useState(0);
  const { pathname } = useLocation();

  const isActiveGroup = activeWhen?.length > 0 && activeWhen.some((prefix) => pathname.startsWith(prefix));
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
        <Chevron open={open} />
      </button>

      <div style={{ height }} className="overflow-hidden transition-[height] duration-300">
        <ul ref={ref} className="pl-3 py-1 space-y-1 text-sm">{children}</ul>
      </div>
    </li>
  );
}

// ---- Guarded NavItem
function NavItem({ to, label, activeWhen, roles }) {
  const auth = useAuth();
  const user = auth?.user ?? null;
  if (!canSee(user, roles)) return null;

  const { pathname } = useLocation();
  const ensureArray = (v) => (v == null ? [] : Array.isArray(v) ? v : [v]);
  const patterns = ensureArray(activeWhen);

  const matches = (pattern) => {
    if (pattern instanceof RegExp) return pattern.test(pathname);
    if (typeof pattern === "string") return pathname.startsWith(pattern);
    return false;
  };

  const active = pathname === to || pathname.startsWith(to + "/") || patterns.some(matches);

  return (
    <li>
      <Link
        to={to}
        className={`block rounded-md px-3 py-2 transition ${
          active ? "bg-gray-700/70 font-medium text-white" : "text-white hover:bg-gray-700/60"
        }`}
      >
        {label}
      </Link>
    </li>
  );
}

export default function Sidebar({ open, setOpen }) {
  const auth = useAuth();
  const user = auth?.user ?? null;

  console.log('user in sidebar:', user);

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
            {/* Visible to any authenticated user */}
            <NavItem to="/dashboard" label="Dashboard" roles={["manager","admin"]} />

            {/* INVENTORY (example: viewer+, tweak as needed) */}
            <SubMenu label="Inventory" activeWhen={["/inventory", "/lowstockplants"]} roles={["manager","admin"]}>
              <NavItem to="/inventory" label="Inventory" activeWhen={["/inventory/"]} roles={["manager","admin"]} />
              <NavItem to="/lowstockplants" label="Low Stock Plants" activeWhen={["/lowstockplants/"]} roles={["manager","admin"]} />
            </SubMenu>

            {/* SALES (example: manager/admin) */}
            <SubMenu label="Sales" activeWhen={["/estimates", "/estimate/", "/packages", "/package/", "/list-pottinglists"]} roles={["manager","admin"]}>
              <NavItem to="/estimates" label="Estimates" activeWhen={["/estimate/"]} roles={["manager","admin"]} />
              <NavItem to="/packages" label="Packages" activeWhen={["/package/"]} roles={["manager","admin"]} />
              <NavItem to="/list-pottinglists" label="Potting Lists" activeWhen={["/list-pottinglists/"]} roles={["manager","admin"]} />
            </SubMenu>

            {/* SCHEDULE (example: viewer+) */}
            <NavItem to="/shippingschedule" label="Schedule" activeWhen={["/shippingschedule/"]} roles={["manager","admin"]} />

            {/* PAYROLL */}
            <SubMenu label="Payroll" activeWhen={["/time-sheet", "/employees", "employee-allotment","/employee-payout"]} roles={["supervisor","manager","admin","payroll"]}>
              {/* Timesheet: employees & above */}
              <NavItem to="/time-sheet" label="Time Sheet" activeWhen={["/time-sheet/"]} roles={["supervisor","manager","admin"]} />
              {/* Employees admin/manager only */}
               <NavItem to="/employee-payout" label="Employee Payout" activeWhen={["/employee-payout/"]} roles={["manager","admin"]} />
            <NavItem to="/employees" label="Manage Employees"  activeWhen={["/employees/"]} />
              <NavItem to="/employee-allotment" label="Employee Allotment"  activeWhen={["/employee-allotment/"]} />
            </SubMenu>

            {/* REPORTS */}
            <SubMenu label="Reports" activeWhen={["/potting-report-by-size","/payroll-report"]} roles={["manager","admin","payroll"]}>
              <NavItem to="/potting-report-by-size" label="Potting Report" roles={["manager","admin"]} />
              <NavItem to="/payroll-report" label="Payroll Report" roles={["manager","admin","payroll"]} />
            </SubMenu>

            {/* QUICKBOOKS */}
            <SubMenu label="QuickBooks" activeWhen={["/connect-qb"]} roles={["manager","admin"]}>
              {/* fixed a small typo: /conncet-qb -> /connect-qb */}
              <NavItem to="/connect-qb" label="Connect QuickBooks" roles={["manager","admin"]} />
            </SubMenu>
          </ul>
        </nav>

        {/* Optional footer: show who is logged in */}
        <div className="mt-6 p-3 text-xs text-gray-300 border-t border-gray-700">
          <div className="font-medium">{user?.name ?? "Guest"}</div>
          <div className="flex flex-wrap gap-1 mt-1">
            {(user?.roles ?? []).map((r) => (
              <span key={r} className="px-2 py-0.5 rounded bg-gray-700">{r}</span>
            ))}
          </div>
        </div>
      </aside>
    </>
  );
}
