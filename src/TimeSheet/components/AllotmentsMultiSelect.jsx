// /web/src/components/AllotmentsMultiSelect.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";

function Panel({
  title,
  items,            // [{ _id, name, hint }]
  selectedIds,      // Set<string>
  onToggle,         // (id: string, next: boolean) => void
  onToggleAll,      // (next: boolean) => void
  query,
  setQuery,
}) {
  const allChecked = items.length > 0 && items.every(it => selectedIds.has(String(it._id)));
  const someChecked = items.some(it => selectedIds.has(String(it._id)));

  return (
    <div className="border rounded-lg flex-1 min-w-[260px]">
      <div className="flex items-center justify-between gap-2 border-b px-3 py-2 bg-gray-50">
        <div className="font-medium text-sm">{title}</div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onToggleAll(true)}
            className="text-xs px-2 py-1 border rounded"
          >
            Select all
          </button>
          <button
            type="button"
            onClick={() => onToggleAll(false)}
            className="text-xs px-2 py-1 border rounded"
          >
            Clear
          </button>
        </div>
      </div>

      <div className="p-2">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search…"
          className="w-full border rounded px-2 py-1.5 text-sm"
        />
      </div>

      <ul className="max-h-96 overflow-auto divide-y">
        {items.length === 0 ? (
          <li className="p-3 text-sm text-gray-500">No results</li>
        ) : (
          items.map((it) => {
            const id = String(it._id);
            const checked = selectedIds.has(id);
            return (
              <li key={id} className="flex items-center gap-2 px-3 py-2">
                <input
                  id={`chk-${title}-${id}`}
                  type="checkbox"
                  checked={checked}
                  onChange={(e) => onToggle(id, e.target.checked)}
                  className="h-4 w-4"
                />
                <label
                  htmlFor={`chk-${title}-${id}`}
                  className="flex-1 cursor-pointer select-none"
                >
                  <div className="text-sm">{it.name}</div>
                  {it.hint && <div className="text-xs text-gray-500">{it.hint}</div>}
                </label>
              </li>
            );
          })
        )}
      </ul>

      <div className="border-t px-3 py-2 text-xs text-gray-600 flex items-center justify-between">
        <div>
          {items.length} items • {Array.from(selectedIds).filter(id => items.find(i => String(i._id) === id)).length} selected
        </div>
        <div className="text-gray-400">
          {allChecked ? "All selected" : someChecked ? "Some selected" : "None selected"}
        </div>
      </div>
    </div>
  );
}

export default function AllotmentsMultiSelect({
  // Inputs
  employees = [],            // [{ _id, name, email?, phone? }]
  assignedIds = new Set(),   // Set<string> initially assigned
  // Actions
  onAddMany,                 // (ids: string[]) => Promise<void> | void
  onRemoveMany,              // (ids: string[]) => Promise<void> | void
}) {
  const [leftQuery, setLeftQuery] = useState("");
  const [rightQuery, setRightQuery] = useState("");
  const [leftSel, setLeftSel] = useState(new Set());   // selected in Available
  const [rightSel, setRightSel] = useState(new Set()); // selected in Assigned

  // Split employees
  const { available, assigned } = useMemo(() => {
    const a = [];
    const b = [];
    const assignedSet = new Set(Array.from(assignedIds).map(String));
    for (const e of employees) {
      const item = {
        _id: String(e._id),
        name: e.name,
        hint: e.email || e.phone || ""
      };
      if (assignedSet.has(String(e._id))) b.push(item);
      else a.push(item);
    }
    return { available: a, assigned: b };
  }, [employees, assignedIds]);

  // Filter by queries
  const leftItems = useMemo(() => {
    const q = leftQuery.trim().toLowerCase();
    if (!q) return available;
    return available.filter(
      (i) => i.name.toLowerCase().includes(q) || i.hint?.toLowerCase().includes(q)
    );
  }, [available, leftQuery]);

  const rightItems = useMemo(() => {
    const q = rightQuery.trim().toLowerCase();
    if (!q) return assigned;
    return assigned.filter(
      (i) => i.name.toLowerCase().includes(q) || i.hint?.toLowerCase().includes(q)
    );
  }, [assigned, rightQuery]);

  function toggleSet(setter) {
    return (id, next) =>
      setter((prev) => {
        const s = new Set(prev);
        if (next) s.add(id);
        else s.delete(id);
        return s;
      });
  }

  function toggleAll(setter, items, next) {
    setter(() => {
      if (!next) return new Set();
      const s = new Set();
      items.forEach((i) => s.add(String(i._id)));
      return s;
    });
  }

  async function addMany() {
    const ids = Array.from(leftSel);
    if (ids.length === 0) return;
    await onAddMany?.(ids);
    setLeftSel(new Set());
  }
  async function removeMany() {
    const ids = Array.from(rightSel);
    if (ids.length === 0) return;
    await onRemoveMany?.(ids);
    setRightSel(new Set());
  }

  return (
    <div className="space-y-3">
      <div className="grid gap-3 md:grid-cols-[1fr_auto_1fr]">
        <Panel
          title="Available employees"
          items={leftItems}
          selectedIds={leftSel}
          onToggle={toggleSet(setLeftSel)}
          onToggleAll={(next) => toggleAll(setLeftSel, leftItems, next)}
          query={leftQuery}
          setQuery={setLeftQuery}
        />

        {/* Buttons column */}
        <div className="flex md:flex-col items-center justify-center gap-2">
          <button
            type="button"
            onClick={addMany}
            className="w-full md:w-auto rounded border px-3 py-2 text-sm hover:bg-gray-50"
            title="Add selected →"
          >
            Add →
          </button>
          <button
            type="button"
            onClick={removeMany}
            className="w-full md:w-auto rounded border px-3 py-2 text-sm hover:bg-gray-50"
            title="← Remove selected"
          >
            ← Remove
          </button>
        </div>

        <Panel
          title="Assigned to supervisor"
          items={rightItems}
          selectedIds={rightSel}
          onToggle={toggleSet(setRightSel)}
          onToggleAll={(next) => toggleAll(setRightSel, rightItems, next)}
          query={rightQuery}
          setQuery={setRightQuery}
        />
      </div>
    </div>
  );
}
