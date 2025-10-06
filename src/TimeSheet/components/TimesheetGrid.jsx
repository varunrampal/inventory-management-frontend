import React, { useEffect, useMemo, useState } from "react";
import { startOfWeek,format } from "date-fns";
const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
const label = format(weekStart, "yyyy-MM-dd");
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
alert("Saved");
}


return (
<div className="space-y-4">
<div className="flex gap-2 items-center">
<select className="border rounded p-2" value={employeeId} onChange={e=>setEmployeeId(e.target.value)}>
{employees.map(e => <option key={e._id} value={e._id}>{e.name}</option>)}
</select>
<button className="px-3 py-2 border rounded" onClick={()=>setWeekStart(addDays(weekStart,-7))}>◀ Prev</button>
<div className="font-medium">Week of {fmt(weekStart)}</div>
<button className="px-3 py-2 border rounded" onClick={()=>setWeekStart(addDays(weekStart, 7))}>Next ▶</button>
<div className="ml-auto font-semibold">Total: {total} h</div>
<button className="px-4 py-2 rounded bg-green-600 text-white" onClick={saveWeek}>Save</button>
</div>


<table className="w-full border text-sm">
<thead>
<tr className="bg-gray-100">
{days.map(d => <th key={d} className="border p-2 text-center">{d}</th>)}
</tr>
</thead>
<tbody>
<tr>
{days.map(d => (
<td key={d} className="border p-0">
<input
type="number"
min={0}
max={24}
step="0.25"
value={cells[d] ?? ""}
onChange={e => setCells(prev => ({ ...prev, [d]: e.target.value }))}
className="w-full p-2 text-center"
/>
</td>
))}
</tr>
</tbody>
</table>
</div>
);
}