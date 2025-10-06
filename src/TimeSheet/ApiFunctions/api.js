const API_BASE = import.meta.env.VITE_API_BASE_URL;


export async function listEmployees(params = {}) {
const q = new URLSearchParams(params).toString();
const res = await fetch(`${API_BASE}/admin/employees?${q}`);
return res.json();
}


export async function createEmployee(payload) {
const res = await fetch(`${API_BASE}/admin/employees`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
return res.json();
}


export async function getEntries(params) {
const q = new URLSearchParams(params).toString();
const res = await fetch(`${API_BASE}/admin/timesheets?${q}`);
return res.json();
}


export async function upsertEntry(payload) {
const res = await fetch(`${API_BASE}/admin/timesheets/upsert`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
return res.json();
}


export async function bulkUpsert(payload) {
const res = await fetch(`${API_BASE}/admin/timesheets/bulk`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
return res.json();
}

export async function updateEmployee(id, payload) {
const res = await fetch(`${API_BASE}/admin/employees/${id}`, {
method: "PUT",
headers: { "Content-Type": "application/json" },
body: JSON.stringify(payload),
});
return res.json();
}

export async function payrollSummary(params) {
 const q = new URLSearchParams(params).toString();
 const res = await fetch(`${API_BASE}/admin/timesheets/summary/payroll?${q}`);
return res.json();
}