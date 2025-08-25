// src/pages/EditPackagePage.jsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Layout from '../components/Layout';

const BASE_URL = import.meta.env.PROD
    ? "https://inventory-management-server-vue1.onrender.com"
    : "http://localhost:4000";

export default function EditPackagePage() {
    const { id } = useParams(); // packageId from route /edit-package/:id
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [pkg, setPkg] = useState(null);

    // Form state
    const [form, setForm] = useState({
        shipmentDate: "",
        driverName: "",
        notes: "",
        quantities: {}, // { itemId: number }
    });

    // Fetch existing package
    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                setLoading(true);
                setError("");
                const res = await fetch(`${BASE_URL}/admin/packages/${id}`, {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                });
                if (!res.ok) throw new Error(`Load failed: ${res.status}`);
                const data = await res.json();

                if (cancelled) return;

                setPkg(data);

                // normalize quantities {itemId: number}
                const q = {};
                (data.items || []).forEach((it) => {
                    q[it.itemId] = typeof it.fulfilled === "number" ? it.fulfilled : (data.quantities?.[it.itemId] ?? 0);
                });

                setForm({
                    shipmentDate: data.shipmentDate?.slice(0, 10) || "",
                    driverName: data.driverName || "",
                    notes: data.notes || "",
                    quantities: q,
                });
            } catch (e) {
                setError(e.message || "Failed to load package.");
            } finally {
                setLoading(false);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [id]);

    // Totals
    const totalQuantity = useMemo(
        () => Object.values(form.quantities || {}).reduce((sum, n) => sum + (Number(n) || 0), 0),
        [form.quantities]
    );

    // Validation
    const validate = () => {
        const errs = {};
        // Optional: require shipmentDate if you want
        // if (!form.shipmentDate) errs.shipmentDate = "Shipment date is required.";
        // Ensure no negative or over-allocations (if original quantity exists)
        (pkg?.items || []).forEach((it) => {
            const v = Number(form.quantities[it.itemId] ?? 0);
            if (!Number.isFinite(v) || v < 0) {
                errs[`q_${it.itemId}`] = "Quantity must be 0 or more.";
            }
            // Cap by ordered quantity if applicable
            if (typeof it.quantity === "number" && v > it.quantity) {
                errs[`q_${it.itemId}`] = `Cannot exceed ordered (${it.quantity}).`;
            }
        });
        return errs;
    };

    const [errors, setErrors] = useState({});

    // const updateQuantity = (itemId, value) => {
    //     const v = value === "" ? "" : Math.max(0, Number(value));
    //     setForm((prev) => ({
    //         ...prev,
    //         quantities: { ...prev.quantities, [itemId]: v },
    //     }));
    // };
    const updateQuantity = (itemId, value) => {
        if (!itemId) return; // ignore bad inputs
        const v = value === "" ? "" : Math.max(0, Number(value));
        setForm(prev => ({
            ...prev,
            quantities: { ...prev.quantities, [String(itemId)]: v },
        }));
    };


    const handleSave = async (e) => {
        e.preventDefault();
        const v = validate();
        setErrors(v);
        if (Object.keys(v).length) return;

        try {
            setSaving(true);
            setError("");

            // const payload = {
            //     shipmentDate: form.shipmentDate || undefined,
            //     driverName: form.driverName || "",
            //     notes: form.notes || "",
            //     quantities: Object.fromEntries(
            //         Object.entries(form.quantities).map(([k, val]) => [k, Number(val || 0)])
            //     ),
            // };

            const cleaned = {};
            for (const [k, v] of Object.entries(form.quantities || {})) {
                if (!k || k === "undefined") continue;
                cleaned[String(k)] = Number(v || 0);
            }

            const payload = {
                shipmentDate: form.shipmentDate || undefined,
                driverName: form.driverName || "",
                notes: form.notes || "",
                quantities: cleaned,
            };


            const res = await fetch(`${BASE_URL}/admin/packages/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                const t = await res.text();
                throw new Error(t || `Save failed: ${res.status}`);
            }

            // Optional: route back to detail/print page
            //navigate(`/package/${id}`);
        } catch (e) {
            setError(e.message || "Failed to save package.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="p-6">
                <div className="animate-pulse h-5 w-40 bg-gray-300 rounded mb-4" />
                <div className="animate-pulse h-5 w-80 bg-gray-300 rounded" />
            </div>
        );
    }

    if (error && !pkg) {
        return (
            <div className="p-6">
                <div className="text-red-600 font-medium">{error}</div>
            </div>
        );
    }

    return (

        <Layout>
            <div className="max-w-5xl mx-auto p-4">
                {/* Header / Breadcrumb */}
                <div className="flex items-center justify-between mb-4">
                    <h1 className="text-2xl font-semibold">Edit Package</h1>

                </div>

                {/* Two-column layout: Left labels, right values (as requested in earlier prints) */}
                <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Left */}

                    <div className="rounded-lg border p-3 space-y-3">
                        <div>

                            <div className="flex items-center justify-between text-sm uppercase tracking-wider text-black">
                                <div>
                                    Package# <span className="font-semibold">{pkg?.packageCode}</span>
                                </div>
                                <div className="text-right">
                                    Estimate# <span className="font-semibold">{pkg?.estimateId}</span>
                                </div>
                            </div>

                            <div className="mt-6 text-xs uppercase tracking-wider text-black">
                                Shipment Date
                            </div>
                            <input
                                type="date"
                                value={form.shipmentDate}
                                onChange={(e) => setForm((p) => ({ ...p, shipmentDate: e.target.value }))}
                                className="w-full border rounded px-3 py-2"
                            />
                            {errors.shipmentDate && (
                                <div className="text-xs text-red-600 mt-1">{errors.shipmentDate}</div>
                            )}
                        </div>

                        <div>
                            <div className="mb-1 text-xs uppercase tracking-wider text-black">Driver Name</div>
                            <input
                                type="text"
                                value={form.driverName}
                                onChange={(e) => setForm((p) => ({ ...p, driverName: e.target.value }))}
                                className="w-full border rounded px-3 py-2"
                                placeholder="Driver"
                            />
                        </div>

                        {/* <div>
            <div className="mb-1 text-xs uppercase tracking-wider text-gray-600">Notes</div>
            <textarea
              value={form.notes}
              onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
              className="w-full border rounded px-3 py-2 min-h-24"
              placeholder="Internal notes"
            />
          </div> */}

                        {/* <div className="pt-2 border-t">
            <div className="text-xs uppercase tracking-wider text-gray-600 mb-1">Totals</div>
            <div className="flex items-center gap-6 text-sm">
              <div>
                <div className="text-gray-500">Total Quantity</div>
                <div className="font-semibold">{totalQuantity}</div>
              </div>
              <div>
                <div className="text-gray-500">Items</div>
                <div className="font-semibold">{pkg?.items?.length || 0}</div>
              </div>
            </div>
          </div> */}
                    </div>

                    {/* Right — Items table with editable quantities */}
                    <div className="rounded-lg border p-3 overflow-auto">
                        {/* <div className="mb-2 text-xs uppercase tracking-wider text-gray-600">Items</div> */}
                        <table className="min-w-full text-sm">
                            <thead className="text-left border-b">
                                <tr className="text-black">
                                    <th className="py-2 pr-3">ITEM</th>
                                    <th className="py-2 pr-3 w-24">ORDERED</th>
                                    <th className="py-2 pr-3 w-28">PACKED</th>
                                    <th className="py-2 pr-3 w-28">QTY TO PACK</th>
                                </tr>
                            </thead>
                            <tbody>
                                {(pkg?.items ?? []).map((it, idx) => {
                                    const key = String(it?.itemId ?? it?._id ?? it?.ItemRef?.value ?? idx); // last-resort: idx
                                    const ordered = Number(it.quantity ?? 0);
                                    const current = Number(it.fulfilled ?? form.quantities[it.itemId] ?? 0);
                                    const newVal = form.quantities[it.itemId] ?? 0;
                                    const err = errors[`q_${it.itemId}`];

                                    return (
                                        <tr key={key} className="border-b last:border-0">
                                            <td className="py-2 pr-3">
                                                <div className="font-medium">{it.name}</div>
                                                {/* <div className="text-xs text-gray-500">ID: {it.itemId}</div> */}
                                            </td>
                                            <td className="py-2 pr-3">{ordered}</td>
                                            <td className="py-2 pr-3">{current}</td>
                                            <td className="py-2 pr-3">
                                                <input
                                                    // type="number"
                                                    // min={0}
                                                    // step={1}
                                                    // value={newVal}
                                                    // onChange={(e) => updateQuantity(it.itemId, e.target.value)}
                                                    type="number"
                                                    min={0}
                                                    step={1}
                                                    value={form.quantities[it.itemId] ?? 0}
                                                    name={`q_${it.itemId}`}
                                                    data-itemid={String(it.itemId)}        // <-- carry the real key here
                                                    onChange={(e) => updateQuantity(String(it.itemId), e.target.value)}
                                                    className={`w-24 border rounded px-2 py-1 ${err ? "border-red-500" : ""}`}
                                                />
                                                {err && <div className="text-xs text-red-600 mt-1">{err}</div>}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {/* Full-width actions */}
                    <div className="md:col-span-2 flex items-center justify-end gap-3">
                        {error && <div className="text-red-600 text-sm mr-auto">{error}</div>}

                        <button
                            type="submit"
                            disabled={saving}
                            className="rounded-md bg-green-600 px-4 py-2 text-white hover:bg-green-700"
                        >
                            {saving ? "Saving..." : "Save Changes"}
                        </button>
                        <button
                            type="button"
                            onClick={() => navigate(-1)}
                            className="rounded-md bg-gray-300 px-4 py-2 text-black hover:bg-gray-200"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </Layout>
    );
}
