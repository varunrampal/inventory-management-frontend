import React, { useEffect, useMemo, useState } from "react";
import { startOfWeek,format } from "date-fns";
const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
const label = format(weekStart, "yyyy-MM-dd");
import { toast } from 'react-toastify';
import { listEmployees, getEntries, bulkUpsert } from "../ApiFunctions/api.js";

function addDays(d, n) { const x = new Date(d); x.setDate(x.getDate()+n); return x; }
function fmt(d) { return new Date(d).toISOString().slice(0,10); }


export default function TimesheetGrid({ realmId }) {
const [employees, setEmployees] = useState([]);
const [employeeId, setEmployeeId] = useState("");
const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date()));
const [cells, setCells] = useState({}); // { YYYY-MM-DD: hours }


const days = useMemo(() => Array.from({ length: 7 }, (_, i) => fmt(addDays(weekStart, i))), [weekStart]);


useEffect(() => { (async () => {
const emps = await listEmployees({ realmId, active: true });
setEmployees(emps);
if (emps[0] && !employeeId) setEmployeeId(emps[0]._id);
})(); }, [realmId]);


useEffect(() => { (async () => {
if (!employeeId) return;
const data = await getEntries({ realmId, employeeId, from: days[0], to: days[6] });
const next = {};
for (const e of data) next[fmt(e.date)] = e.hours;
setCells(next);
})(); }, [employeeId, days.join(","), realmId]);


const total = Object.values(cells).reduce((a,b)=>a+Number(b||0),0);


async function saveWeek() {
const entries = days.map(d => ({ date: d, hours: Number(cells[d]||0) }));
await bulkUpsert({ realmId, employeeId, entries });
toast.success("Saved" );
}

{/* ===== helpers for totals ===== */}
{/* Put these inside your component, above the return() */}
const dayTotals = React.useMemo(
  () => days.map(d => Number(cells[d] || 0)),
  [days, cells]
);

const runningTotals = React.useMemo(() => {
  let sum = 0;
  return days.map(d => (sum += Number(cells[d] || 0)));
}, [days, cells]);

return (
<div className="space-y-4">
  {/* Controls */}
  <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
    <div className="flex w-full items-center gap-2">
      <select
        className="w-full sm:w-64 border rounded-md p-2 text-sm"
        value={employeeId}
        onChange={(e) => setEmployeeId(e.target.value)}
        aria-label="Select employee"
      >
        {employees.map((e) => (
          <option key={e._id} value={e._id}>
            {e.name}
          </option>
        ))}
      </select>

      {/* On small screens, navigation sits on the right in the same row */}
      <div className="ml-auto flex items-center gap-2">
        <button
          className="px-3 py-2 border rounded-md text-sm"
          onClick={() => setWeekStart(addDays(weekStart, -7))}
        >
          ◀
        </button>
        <button
          className="px-3 py-2 border rounded-md text-sm"
          onClick={() => setWeekStart(addDays(weekStart, 7))}
        >
          ▶
        </button>
      </div>
    </div>

    {/* Week label + total */}
    <div className="flex w-full items-center gap-2 text-sm">
      <div className="font-medium">
        Week of <span className="whitespace-nowrap">{fmt(weekStart)}</span>
      </div>
      <div className="ml-auto font-semibold">Total: {total} h</div>
    </div>
  </div>

  {/* Mobile: cards (smaller than md) */}
  <div className="md:hidden space-y-3">
    {days.map((d) => (
      <div key={d} className="rounded-lg border p-3 shadow-sm">
        <div className="mb-2 flex items-center justify-between">
          <div className="text-sm font-medium">
            {new Date(d).toLocaleDateString(undefined, {
              weekday: "short",
              month: "short",
              day: "numeric",
            })}
          </div>
          <div className="text-xs text-gray-500">{d}</div>
        </div>
        <div className="flex items-center gap-3">
          <label htmlFor={`hours-${d}`} className="text-sm text-gray-600">
            Hours
          </label>
          <input
            id={`hours-${d}`}
            type="number"
            min={0}
            max={24}
            step="0.25"
            inputMode="decimal"
            value={cells[d] ?? ""}
            onChange={(e) =>
              setCells((prev) => ({ ...prev, [d]: e.target.value }))
            }
            className="flex-1 rounded-md border p-2 text-base"
          />
        </div>
      </div>
    ))}
  </div>

  {/* Desktop/tablet: table (md and up) */}
  <div className="hidden md:block">
    <div className="w-full overflow-x-auto rounded-lg border">
      <table className="min-w-[720px] w-full text-sm">
        <thead className="sticky top-0 z-10 bg-gray-50">
          <tr>
            {days.map((d) => (
              <th key={d} className="border-b p-2 text-center font-medium">
                <div className="flex flex-col items-center leading-tight">
                  <span className="text-xs text-gray-500">
                    {new Date(d).toLocaleDateString(undefined, {
                      weekday: "short",
                    })}
                  </span>
                  <span>{d}</span>
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr>
            {days.map((d) => (
              <td key={d} className="border-t p-0">
                <input
                  type="number"
                  min={0}
                  max={24}
                  step="0.25"
                  inputMode="decimal"
                  value={cells[d] ?? ""}
                  onChange={(e) =>
                    setCells((prev) => ({ ...prev, [d]: e.target.value }))
                  }
                  className="w-full p-2 text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                  aria-label={`Hours for ${d}`}
                />
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  </div>

  {/* Action bar: sticky on mobile, inline on desktop */}
  <div className="md:mt-4 md:flex md:justify-end">
    <div className="fixed inset-x-0 bottom-0 z-20 border-t bg-white/95 p-3 backdrop-blur md:static md:border-0 md:bg-transparent md:p-0">
      <div className="mx-auto flex max-w-3xl justify-end gap-3">
        <button
          className="w-full md:w-auto rounded-md bg-green-600 px-4 py-2 text-white shadow-sm hover:bg-green-700 active:translate-y-[1px]"
          onClick={saveWeek}
        >
          Save
        </button>
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="w-full md:w-auto rounded-md bg-gray-200 px-4 py-2 text-black hover:bg-gray-100"
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
</div>

);
}