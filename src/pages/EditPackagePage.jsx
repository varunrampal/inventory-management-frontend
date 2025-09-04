// src/pages/EditPackagePage.jsx
import { useEffect, useMemo, useState, useCallback} from "react";
import { useNavigate, useParams } from "react-router-dom";
import Layout from '../components/Layout';

// const BASE_URL = import.meta.env.PROD
//     ? "https://inventory-management-server-vue1.onrender.com"
//     : "http://localhost:4000";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function EditPackagePage() {
  const { id } = useParams(); // packageId from route /edit-package/:id
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(""); // ✅ show "Saved" message
  const [pkg, setPkg] = useState(null);

  // Form state
  const [form, setForm] = useState({
    shipmentDate: "",
    driverName: "",
    notes: "",
    quantities: {},
  });

  // ✅ Make a reusable loader we can call on mount and after save
  const loadPackage = useCallback(async () => {
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const res = await fetch(`${BASE_URL}/admin/packages/${id}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (!res.ok) throw new Error(`Load failed: ${res.status}`);
      const data = await res.json();

      setPkg(data);

      // ✅ Normalize quantities using *data* (not the old pkg)
      const normalizedQuantities =
        data?.quantities instanceof Map
          ? Object.fromEntries(data.quantities)
          : { ...(data?.quantities || {}) };

      setForm({
        shipmentDate: data.shipmentDate?.slice(0, 10) || "",
        driverName: data.driverName || "",
        notes: data.notes || "",
        quantities: normalizedQuantities,
      });
    } catch (e) {
      setError(e.message || "Failed to load package.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  // Fetch existing package (and whenever id changes)
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (cancelled) return;
      await loadPackage();
    })();
    return () => {
      cancelled = true;
    };
  }, [loadPackage]);

  // Totals
  const totalQuantity = useMemo(
    () =>
      Object.values(form.quantities || {}).reduce(
        (sum, n) => sum + (Number(n) || 0),
        0
      ),
    [form.quantities]
  );

  // Validation
  const validate = () => {
    const errs = {};
    (pkg?.items || []).forEach((it) => {
      const v = Number(form.quantities[it.itemId] ?? 0);
      if (!Number.isFinite(v) || v < 0) {
        errs[`q_${it.itemId}`] = "Quantity must be 0 or more.";
      }
      if (typeof it.quantity === "number" && v > it.quantity) {
        errs[`q_${it.itemId}`] = `Cannot exceed ordered (${it.quantity}).`;
      }
    });
    return errs;
  };

  const [errors, setErrors] = useState({});

  const updateQuantity = (itemId, value) => {
    if (!itemId) return;
    const v = value === "" ? "" : Math.max(0, Number(value));
    setForm((prev) => ({
      ...prev,
      quantities: { ...prev.quantities, [String(itemId)]: v },
    }));
  };

  const keyOf = (row) =>
    String(row?.itemId ?? row?.ItemRef?.value ?? row?.name ?? "");

  const lineById = useMemo(
    () => Object.fromEntries((pkg?.lines || []).map((ln) => [keyOf(ln), ln])),
    [pkg?.lines]
  );

  const estById = useMemo(
    () => Object.fromEntries((pkg?.items || []).map((it) => [keyOf(it), it])),
    [pkg?.items]
  );

  const handleSave = async (e) => {
    e.preventDefault();
    const v = validate();
    setErrors(v);
    if (Object.keys(v).length) return;

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      // Cleaned quantities
      const cleaned = {};
      for (const [k, val] of Object.entries(form.quantities || {})) {
        if (!k || k === "undefined") continue;
        cleaned[String(k)] = Number(val || 0);
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
        const text = await res.text();
        throw new Error(text || `Save failed: ${res.status}`);
      }

      // If your API returns the updated package, you can do:
      // const updated = await res.json();
      // setPkg(updated);

      // ✅ Soft refresh: re-fetch the latest from server
      await loadPackage();
      setSuccess("Saved changes.");
      // If you prefer to leave this page and reload list/detail, do one of:
      // navigate(`/package/${id}`);   // go to detail page
      // navigate(0);                   // data router reload
      // window.location.reload();      // hard reload (not recommended)
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
          {!!success && (
            <div className="text-green-700 text-sm font-medium">{success}</div>
          )}
        </div>

        {/* Two-column layout */}
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
                onChange={(e) =>
                  setForm((p) => ({ ...p, shipmentDate: e.target.value }))
                }
                className="w-full border rounded px-3 py-2"
              />
              {errors.shipmentDate && (
                <div className="text-xs text-red-600 mt-1">{errors.shipmentDate}</div>
              )}
            </div>

            <div>
              <div className="mb-1 text-xs uppercase tracking-wider text-black">
                Driver Name
              </div>
              <input
                type="text"
                value={form.driverName}
                onChange={(e) =>
                  setForm((p) => ({ ...p, driverName: e.target.value }))
                }
                className="w-full border rounded px-3 py-2"
                placeholder="Driver"
              />
            </div>
          </div>

          {/* Right — Items table with editable quantities */}
          <div className="rounded-lg border p-3 overflow-auto">
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
                {(
                  pkg?.quantities instanceof Map
                    ? Array.from(pkg.quantities.entries())
                    : Object.entries(pkg?.quantities || {})
                ).map(([itemId, qty]) => {
                  const meta = estById[itemId] || lineById[itemId] || {};
                  const name = meta.name ?? itemId;
                  const ordered = Number(meta.quantity ?? 0);
                  const current = Number(meta.fulfilled ?? form.quantities[itemId] ?? 0);
                  const newVal = form.quantities[itemId] ?? Number(qty || 0);
                  const err = errors[`q_${itemId}`];

                  return (
                    <tr key={itemId} className="border-b last:border-0">
                      <td className="py-2 pr-3">
                        <div className="font-medium">{name}</div>
                      </td>
                      <td className="py-2 pr-3">{ordered}</td>
                      <td className="py-2 pr-3">{current}</td>
                      <td className="py-2 pr-3">
                        <input
                          type="number"
                          min={0}
                          step={1}
                          value={newVal}
                          name={`q_${itemId}`}
                          data-itemid={itemId}
                          onChange={(e) => updateQuantity(itemId, e.target.value)}
                          className={`w-24 border rounded px-2 py-1 ${
                            err ? "border-red-500" : ""
                          }`}
                        />
                        {err && (
                          <div className="text-xs text-red-600 mt-1">{err}</div>
                        )}
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
