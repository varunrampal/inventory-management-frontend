import React, { useEffect, useState } from "react";

export default function EmployeeForm({
  initial = {},
  onSubmit,
  onCancel,
  saving = false, // comes from parent (optional)
}) {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    cashHourlyRate: 0,
    currency: "CAD",
    isActive: true,
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setForm((f) => ({ ...f, ...initial }));
  }, [initial]);

  function setField(k, v) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function validate() {
    const e = {};
    if (!form.name?.trim()) e.name = "Name is required";
    if (form.cashHourlyRate < 0) e.cashHourlyRate = "Rate cannot be negative";
    // optional phone format check
    if (form.phone && !/^\+?[0-9\s().-]{7,}$/.test(form.phone)) e.phone = "Invalid phone";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function normalizePhone(s = "") {
    const trimmed = String(s).trim();
    if (!trimmed) return "";
    const plus = trimmed.startsWith("+") ? "+" : "";
    const digits = trimmed.replace(/[^\d]/g, "");
    return plus + digits;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;

    const payload = {
      ...form,
      name: form.name.trim(),
      phone: normalizePhone(form.phone),
    };

    try {
      setSubmitting(true);
      await onSubmit?.(payload);
    } catch (err) {
      const msg = err?.message || String(err) || "Failed to save employee";
      setErrors((prev) => ({ ...prev, _form: msg }));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {errors._form && (
        <div className="text-red-600 text-sm">{errors._form}</div>
      )}

      <div>
        <label className="block text-sm font-medium">Name *</label>
        <input
          type="text"
          value={form.name || ""}
          onChange={(e) => setField("name", e.target.value)}
          className="mt-1 w-full border rounded p-2"
          placeholder="Full name"
          required
        />
        {errors.name && (
          <div className="text-red-600 text-sm mt-1">{errors.name}</div>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium">Phone</label>
        <input
          type="tel"
          inputMode="tel"
          pattern="^\+?[0-9\s().-]{7,}$"
          value={form.phone || ""}
          onChange={(e) => setField("phone", e.target.value)}
          className="mt-1 w-full border rounded p-2"
          placeholder="+1 (604) 555-1234"
        />
        {errors.phone && (
          <div className="text-red-600 text-sm mt-1">{errors.phone}</div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium">Cash hourly rate</label>
          <input
            type="number"
            step="0.01"
            min={0}
            value={form.cashHourlyRate ?? 0}
            onChange={(e) =>
              setField("cashHourlyRate", Number(e.target.value))
            }
            className="mt-1 w-full border rounded p-2"
            placeholder="e.g., 22.50"
          />
          {errors.cashHourlyRate && (
            <div className="text-red-600 text-sm mt-1">
              {errors.cashHourlyRate}
            </div>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium">Currency</label>
          <select
            value={form.currency || "CAD"}
            onChange={(e) => setField("currency", e.target.value)}
            className="mt-1 w-full border rounded p-2"
          >
            <option>CAD</option>
            <option>USD</option>
          </select>
        </div>
      </div>

      <label className="inline-flex items-center gap-2">
        <input
          type="checkbox"
          checked={!!form.isActive}
          onChange={(e) => setField("isActive", e.target.checked)}
        />
        <span>Active</span>
      </label>

      <div className="flex gap-2 justify-end pt-2">
        <button
          type="button"
          className="px-4 py-2 border rounded"
          onClick={onCancel}
          disabled={saving || submitting}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 rounded bg-green-600 text-white disabled:opacity-50"
          disabled={saving || submitting}
        >
          {saving || submitting ? "Saving..." : "Save"}
        </button>
      </div>
    </form>
  );
}