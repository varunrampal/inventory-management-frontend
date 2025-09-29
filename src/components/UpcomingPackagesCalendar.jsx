import { useCallback, useMemo, useRef } from "react";
import { useNavigate, Link } from 'react-router-dom';
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
/* CSS imports — add these in your app entry (pick ONE set based on your FullCalendar version)
// v6:
// import '@fullcalendar/core/index.css';
// import '@fullcalendar/daygrid/index.css';
// v5:
// import '@fullcalendar/common/main.css';
// import '@fullcalendar/daygrid/main.css';
*/

/**
 * UpcomingPackagesCalendar
 * --------------------------------------------------
 * A full calendar view showing ALL upcoming packages.
 * - Month/Week/Day switching
 * - Fetches events lazily for the visible range
 * - All-day events per shipmentDate
 * - Click event to open package details
 * - Status-based coloring & compact labels
 *
 * Backend expected: GET /admin/packages/calendar
 *   Query params: realmId, timeMin=ISO, timeMax=ISO
 *   Returns: [{
 *     id: string,             // package _id
 *     title: string,          // e.g., "PKG-0001 • Blue Pine Enterprises"
 *     start: string,          // "YYYY-MM-DD" for all-day event
 *     allDay: true,
 *     backgroundColor?: string,
 *     borderColor?: string,
 *     extendedProps: {
 *       packageCode, customerName, docNumber, estimateId, status, shipDay
 *     }
 *   }]
 *
 * Props:
 *  - realmId (required)
 *  - apiBase? (defaults to import.meta.env.VITE_API_BASE_URL)
 *  - initialView? (default: "dayGridMonth")
 *  - onOpenPackage? (pkgLike) => void // optional custom handler
 */
export default function UpcomingPackagesCalendar({
  realmId,
  apiBase,
  initialView = "dayGridMonth",
  onOpenPackage,
  className = "",
}) {
  const BASE_URL = apiBase || import.meta.env.VITE_API_BASE_URL;
  const calRef = useRef(null);

  const statusColors = useMemo(() => ({
    Created: { bg: "#dbeafe", border: "#93c5fd" }, // blue-ish
    Pending: { bg: "#fef9c3", border: "#fde047" }, // yellow-ish
    Accepted: { bg: "#dcfce7", border: "#86efac" }, // green-ish
    Closed: { bg: "#e5e7eb", border: "#9ca3af" }, // gray-ish
  }), []);

  const mapToEvent = useCallback((doc) => {
    const status = doc.status || "Created";
    const palette = statusColors[status] || { bg: "#e5e7eb", border: "#9ca3af" };
    return {
      id: doc._id,
      title: `${doc.packageCode || doc._id} • ${doc.customerName || "—"}`,
      start: doc.shipDay || doc.shipmentDate?.slice(0, 10), // prefer preformatted YYYY-MM-DD
      allDay: true,
      backgroundColor: palette.bg,
      borderColor: palette.border,
      extendedProps: {
        packageCode: doc.packageCode,
        customerName: doc.customerName,
        docNumber: doc.docNumber,
        estimateId: doc.estimateId,
        status: doc.status,
        shipDay: doc.shipDay || doc.shipmentDate?.slice(0, 10),
      },
    };
  }, [statusColors]);

  const fetchEvents = useCallback(async (info, success, failure) => {
    try {
      if (!realmId) return success([]);
      const url = new URL(`${BASE_URL}/admin/packages/calendar`);
      url.searchParams.set("realmId", realmId);
      url.searchParams.set("timeMin", info.startStr);
      url.searchParams.set("timeMax", info.endStr);
      const res = await fetch(url.toString(), {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
        },
      });
      if (!res.ok) throw new Error(await res.text());
      const json = await res.json();

      // If server already returns FullCalendar-formatted events (has 'start'), use them as-is.
      let events = [];
      if (Array.isArray(json)) {
        if (json.length && Object.prototype.hasOwnProperty.call(json[0], "start")) {
          events = json; // already event objects
        } else {
          events = json.map(mapToEvent); // map from raw package docs
        }
      }
      success(events);
    } catch (e) {
      console.error("calendar events error", e);
      failure(e);
    }
  }, [BASE_URL, realmId, mapToEvent]);

  const handleEventClick = useCallback((arg) => {
    const { id, extendedProps } = arg.event;
    const pkg = {
      _id: id,
      packageCode: extendedProps?.packageCode,
      customerName: extendedProps?.customerName,
      docNumber: extendedProps?.docNumber,
      estimateId: extendedProps?.estimateId,
      status: extendedProps?.status,
      shipmentDate: extendedProps?.shipDay,
    };
    if (typeof onOpenPackage === "function") return onOpenPackage(pkg);
    const url = new URL(`/package/edit/${id}`, window.location.origin).toString();
  window.open(url, '_blank', 'noopener,noreferrer');
  }, [onOpenPackage]);

  const renderEventContent = useCallback((arg) => {``
    const p = arg.event.extendedProps || {};
    return (
      <div className="text-[11px] leading-tight">
           <div className="opacity-100 truncate"> 
            <Link to={p.docNumber ? `/estimate/edit/${p.docNumber}` : '#' } target="_blank" rel="noopener noreferrer" className="text-white hover:underline">
             Est #{p.docNumber || "—"}
            </Link>


           </div>
        <div className="font-medium truncate">{arg.event.title}</div>
     
      </div>
    );
  }, []);

  // Helpful header with brand accent
  const headerToolbar = useMemo(() => ({
    left: "prev,next today",
    center: "title",
    right: "dayGridMonth,dayGridWeek,dayGridDay",
  }), []);

  return (
    <div className={`rounded-2xl border shadow-sm bg-white p-3 ${className}`}>
      <div className="mb-2 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Upcoming Shipping/Pickup – Calendar</h3>
          <p className="text-xs text-gray-500">All-day events by shipment date</p>
        </div>
        <Legend statusColors={statusColors} />
      </div>
      <style>{`
        /* Force white background for all calendar surfaces */
        .fc, .fc .fc-scrollgrid, .fc .fc-view-harness, .fc .fc-view-harness-active,
        .fc .fc-daygrid, .fc .fc-daygrid-body, .fc .fc-daygrid-day, .fc .fc-daygrid-day-frame {
          background: #ffffff !important;
        }
      `}</style>

      <FullCalendar
        ref={calRef}
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView={initialView}
        headerToolbar={headerToolbar}
        height="auto"
        fixedWeekCount={false}
        showNonCurrentDates={false}
        firstDay={1} // Monday
        events={(info, success, failure) => fetchEvents(info, success, failure)}
        eventClick={handleEventClick}
        eventContent={renderEventContent}
        eventDisplay="block"
        dayMaxEventRows={3}
        navLinks={true}
        nowIndicator={true}
      />
    </div>
  );
}

function Legend({ statusColors }) {
  const items = [
    { key: "Created", label: "Created" },
    { key: "Pending", label: "Pending" },
    { key: "Accepted", label: "Accepted" },
    { key: "Closed", label: "Closed" },
  ];
  return (
    <div className="hidden sm:flex items-center gap-3 text-xs">
      {items.map((it) => (
        <span key={it.key} className="inline-flex items-center gap-1">
          <span
            className="inline-block w-3 h-3 rounded"
            style={{ backgroundColor: statusColors[it.key]?.bg || "#e5e7eb", border: `1px solid ${statusColors[it.key]?.border || "#9ca3af"}` }}
          />
          {it.label}
        </span>
      ))}
    </div>
  );
}
