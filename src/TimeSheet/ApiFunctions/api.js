const API_BASE = import.meta.env.VITE_API_BASE_URL;

function authHeaders() {
  const t = localStorage.getItem("token");
  return t ? { Authorization: `Bearer ${t}` } : {};
}

export async function listEmployees(params = {}) {
const q = new URLSearchParams(params).toString();
const res = await fetch(`${API_BASE}/admin/employees?${q}`, { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }});
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

export async function listAllotments(params) {
  const q = new URLSearchParams(params).toString();
  const res = await fetch(`${API_BASE}/admin/allotments?${q}`, { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }});
  return res.json();
}
export async function addAllotment(payload) {
  const res = await fetch(`${API_BASE}/admin/allotments`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("token")}` },
    body: JSON.stringify(payload),
  });
  return res.json();
}
export async function deleteAllotment(id, realmId) {
  const res = await fetch(
    `${API_BASE}/admin/allotments/${id}?realmId=${encodeURIComponent(realmId || "")}`,
    {
      method: "DELETE",
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    }
  );
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Failed to delete allotment");
  }
  return res.json();
}

export async function listUsers(params = {}) {
  const qs = new URLSearchParams(params).toString();
  const res = await fetch(`${API_BASE}/admin/users?${qs}`, { headers: { ...authHeaders() } });
  if (!res.ok) throw new Error((await res.json()).error || "Failed to list users");
  return res.json();
}