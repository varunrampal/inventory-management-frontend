import React, { useEffect, useMemo, useState } from "react";
import EmployeeForm from "../components/EmployeeForm";
import { listEmployees, createEmployee, updateEmployee } from "../ApiFunctions/api.js";
import { useRealm } from '../../context/RealmContext';
import Layout from "../../components/Layout";

function Modal({ open, onClose, children, title }) {
    if (!open) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/40" onClick={onClose} />
            <div className="relative w-full max-w-xl mx-4 rounded-2xl bg-white p-5 shadow-xl">
                <div className="flex items-center justify-between mb-3">
                    <h2 className="text-lg font-semibold">{title}</h2>
                    <button className="text-gray-500" onClick={onClose}>✕</button>
                </div>
                {children}
            </div>
        </div>
    );
}

export default function EmployeesPage(props) {
    const [rows, setRows] = useState([]);
    const [q, setQ] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState(null); // row or null
      // get realmId from hook or prop, safely
  const realmCtx = typeof useRealm === "function" ? useRealm() : null;
  const realmId = props.realmId ?? realmCtx?.realmId;

    async function refresh() {
        setLoading(true);
        const data = await listEmployees({ realmId, q, active: undefined });
        setRows(data);
        setLoading(false);
    }


    useEffect(() => { refresh(); }, []);


    useEffect(() => {
        const id = setTimeout(refresh, 250);
        return () => clearTimeout(id);
    }, [q]);


    async function handleCreate(values) {
        setSaving(true);
        console.log('payload', { ...values, realmId });

        await createEmployee({ ...values, realmId });
        setSaving(false);
        setModalOpen(false);
        await refresh();
    }

    async function handleUpdate(values) {
        setSaving(true);
        await updateEmployee(editing._id, values);
        setSaving(false);
        setModalOpen(false);
        setEditing(null);
        await refresh();
    }


    const filtered = useMemo(() => {
        const qq = q.trim().toLowerCase();
        if (!qq) return rows;
        return rows.filter(r =>
            r.name?.toLowerCase().includes(qq) ||
            r.email?.toLowerCase().includes(qq)
        );
    }, [rows, q]);

    return (
        <Layout>
        <div className="p-6 space-y-4">
            <h1 className="text-xl font-semibold">Manage Employees</h1>
            <div className="flex items-center gap-2">
                <input
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="Search employees..."
                    className="border rounded p-2 w-64"
                />
                <button
                    className="px-4 py-2 rounded bg-green-600 text-white"
                    onClick={() => { setEditing(null); setModalOpen(true); }}
                >
                    + New Employee
                </button>
            </div>


            <div className="border rounded overflow-hidden">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="bg-gray-50">
                            <th className="border p-2 text-left">Name</th>
                            <th className="border p-2 text-left">Phone</th>
                            <th className="border p-2 text-right">Cash Rate</th>
                            {/* <th className="border p-2">Currency</th> */}
                            <th className="border p-2 text-center">Active</th>
                            <th className="border p-2"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td className="p-4" colSpan={6}>Loading…</td></tr>
                        ) : filtered.length === 0 ? (
                            <tr><td className="p-4" colSpan={6}>No employees</td></tr>
                        ) : (
                            filtered.map((r) => (
                                <tr key={r._id} className="hover:bg-gray-50">
                                    <td className="border p-2">{r.name}</td>
                                    <td className="border p-2">{r.phone || "—"}</td>
                                    <td className="border p-2 text-right">{Number(r.cashHourlyRate || 0).toFixed(2)}</td>
                                    {/* <td className="border p-2 text-center">{r.currency || "CAD"}</td> */}
                                    <td className="border p-2 text-center">{r.isActive ? "Yes" : "No"}</td>
                                    <td className="border p-2 text-right">
                                        <button
                                            className="px-2 py-1 border rounded"
                                            onClick={() => { setEditing(r); setModalOpen(true); }}
                                        >
                                            Edit
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <Modal
                open={modalOpen}
                onClose={() => { if (!saving) { setModalOpen(false); setEditing(null); } }}
                title={editing ? "Edit Employee" : "New Employee"}
            >
                <EmployeeForm
                    initial={editing || { currency: "CAD", isActive: true, cashHourlyRate: 0 }}
                    saving={saving}
                    onCancel={() => { if (!saving) { setModalOpen(false); setEditing(null); } }}
                    onSubmit={editing ? handleUpdate : handleCreate}
                />
            </Modal>
        </div>
        </Layout>
    );
}