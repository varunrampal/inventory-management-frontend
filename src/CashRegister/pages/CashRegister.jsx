// src/pages/Finance/CashRegister.jsx
import { useEffect, useMemo, useState } from "react";
// If you have a RealmContext:
import { useRealm } from "../../context/RealmContext"; // adjust import if different
// UI helpers (optional)
import { toast } from "react-toastify";
import Layout from "../../components/Layout";



const fmt = new Intl.NumberFormat(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const toISO = (d) => {
  const dt = new Date(d);
  return `${dt.getFullYear()}-${String(dt.getMonth()+1).padStart(2,"0")}-${String(dt.getDate()).padStart(2,"0")}`;
};

function useApi() {
  // we’ll call relative paths; Vite proxy sends to your server
  const get = async (path) => {
    const res = await fetch(path);
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  };
  const json = async (path, method, body) => {
    const res = await fetch(path, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  };
  return { get, json };
}

function Summary({ totals }) {
  const card = "rounded-2xl border p-4 flex-1 min-w-[220px]";
  const label = "text-sm text-gray-500";
  const val = "text-2xl font-semibold";
  const { totalIn = 0, totalOut = 0, balance = 0 } = totals || {};
  return (
    <div className="flex gap-3 my-3">
      <div className={card}><div className={label}>Total In</div><div className={val}>{fmt.format(totalIn)}</div></div>
      <div className={card}><div className={label}>Total Out</div><div className={val}>{fmt.format(totalOut)}</div></div>
      <div className={card}><div className={label}>Balance</div><div className={val}>{fmt.format(balance)}</div></div>
    </div>
  );
}

function EntryForm({ onSubmit, defaultDate }) {
  const [type, setType] = useState("in");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(defaultDate);
  const [note, setNote] = useState("");
  const [category, setCategory] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");

  const submit = (e) => {
    e.preventDefault();
    const num = Number(amount);
    if (!num || num < 0) return toast.error("Enter a valid amount");
    onSubmit({ type, amount: num, date, note, category, paymentMethod });
    setAmount(""); setNote(""); setCategory("");
  };

  const input = "px-3 py-2 rounded-lg border";
  const grid = "grid grid-cols-1 sm:grid-cols-6 gap-3 items-end";

  return (
    
    <form onSubmit={submit} className={grid}>
      <div className="flex flex-col gap-1">
        <label>Type</label>
        <select value={type} onChange={(e)=>setType(e.target.value)} className={input}>
          <option value="in">Cash In</option>
          <option value="out">Cash Out</option>
        </select>
      </div>
      <div className="flex flex-col gap-1">
        <label>Amount</label>
        <input type="number" step="0.01" value={amount} onChange={(e)=>setAmount(e.target.value)} className={input} placeholder="0.00" />
      </div>
      <div className="flex flex-col gap-1">
        <label>Date</label>
        <input type="date" value={date} onChange={(e)=>setDate(e.target.value)} className={input} />
      </div>
      <div className="flex flex-col gap-1">
        <label>Category</label>
        <input value={category} onChange={(e)=>setCategory(e.target.value)} className={input} placeholder="e.g. Sales, Fuel, Rent" />
      </div>
      <div className="flex flex-col gap-1">
        <label>Payment</label>
        <input value={paymentMethod} onChange={(e)=>setPaymentMethod(e.target.value)} className={input} placeholder="cash, card..." />
      </div>
      <div className="sm:col-span-5 flex gap-2">
        <input
          placeholder="Note (optional)"
          value={note}
          onChange={(e)=>setNote(e.target.value)}
          className={`${input} flex-1`}
        />
        <button type="submit" className="px-4 py-2 rounded-lg border bg-emerald-600 text-white font-semibold">
          Add Entry
        </button>
      </div>
    </form>
  );
}

function Filters({ start, end, type, search, onChange, onExport }) {
  const input = "px-3 py-2 rounded-lg border w-full";
  return (
    <div className="grid grid-cols-1 sm:grid-cols-6 gap-3 mt-3">
      <div>
        <label className="block mb-1">From</label>
        <input type="date" value={start} onChange={(e)=>onChange({ start: e.target.value })} className={input}/>
      </div>
      <div>
        <label className="block mb-1">To</label>
        <input type="date" value={end} onChange={(e)=>onChange({ end: e.target.value })} className={input}/>
      </div>
      <div>
        <label className="block mb-1">Type</label>
        <select value={type} onChange={(e)=>onChange({ type: e.target.value })} className={input}>
          <option value="">All</option>
          <option value="in">In</option>
          <option value="out">Out</option>
        </select>
      </div>
      <div className="sm:col-span-2">
        <label className="block mb-1">Search</label>
        <input value={search} onChange={(e)=>onChange({ search: e.target.value })} className={input} placeholder="Find in notes..."/>
      </div>
      {/* <div className="flex items-end">
        <button onClick={onExport} className="px-4 py-2 rounded-lg border bg-slate-800 text-white font-semibold w-full">
          Export CSV
        </button>
      </div> */}
    </div>
  );
}

function EntriesTable({ items, onDelete, onEdit }) {
  return (
    <div className="mt-4 overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b">
            <th className="text-left p-2">Date</th>
            <th className="text-left p-2">Type</th>
            <th className="text-left p-2">Amount</th>
            <th className="text-left p-2">Category</th>
            <th className="text-left p-2">Payment</th>
            <th className="text-left p-2">Note</th>
            <th className="text-right p-2"></th>
          </tr>
        </thead>
        <tbody>
          {items.map(e => (
            <tr key={e._id} className="border-b last:border-0">
              <td className="p-2">{new Date(e.date).toLocaleString()}</td>
              <td className="p-2">{e.type}</td>
              <td className="p-2">{fmt.format(e.amount)}</td>
              <td className="p-2">{e.category}</td>
              <td className="p-2">{e.paymentMethod}</td>
              <td className="p-2">{e.note}</td>
              <td className="p-2 text-right">
                <button onClick={()=>onEdit(e)} className="mr-2 text-blue-600 hover:underline">Edit</button>
                <button onClick={()=>onDelete(e._id)} className="text-red-600 hover:underline">Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function CashRegisterPage() {
  const API_BASE = import.meta.env.VITE_API_BASE_URL;
  const { realmId } = useRealm(); // fallback if missing: const realmId = localStorage.getItem("realmId")
  const api = useApi();

  const today = toISO(new Date());
  const [filters, setFilters] = useState({ start: today, end: today, type: "", search: "" });
  const [items, setItems] = useState([]);
  const [totals, setTotals] = useState({ totalIn: 0, totalOut: 0, balance: 0 });

  const q = (extra={}) => {
    const p = new URLSearchParams({ realmId, ...filters, ...extra });
    // remove empties
    for (const [k,v] of [...p.entries()]) if (v === "" || v == null) p.delete(k);
    return p.toString();
  };

  const fetchData = async () => {
    try {
      const data = await api.get(`${API_BASE}/admin/cashentries?${q()}`);
      setItems(data.items || []);
      setTotals(data.totals || { totalIn: 0, totalOut: 0, balance: 0 });
    } catch (e) {
      toast.error("Failed to load cash entries");
      console.error(e);
    }
  };

  useEffect(() => { fetchData(); /* eslint-disable-next-line */ }, [realmId, filters.start, filters.end, filters.type, filters.search]);

  const addEntry = async (payload) => {
    try {
      await api.json(`${API_BASE}/admin/cashentries?realmId=${encodeURIComponent(realmId)}`, "POST", payload);
      fetchData();
      toast.success("Entry added");
    } catch (e) {
      toast.error("Failed to add entry");
      console.error(e);
    }
  };

  const deleteEntry = async (id) => {
    if (!confirm("Delete this entry?")) return;
    try {
      await api.json(`${API_BASE}/admin/cashentries/${id}?realmId=${encodeURIComponent(realmId)}`, "DELETE");
      fetchData();
    } catch (e) {
      toast.error("Failed to delete");
      console.error(e);
    }
  };

  const editEntry = async (entry) => {
    const amount = prompt("New amount:", entry.amount);
    if (amount == null) return;
    const num = Number(amount);
    if (!num || num < 0) return toast.error("Invalid amount");
    try {
      await api.json(`${API_BASE}/admin/cashentries/${entry._id}?realmId=${encodeURIComponent(realmId)}`, "PUT", { amount: num });
      fetchData();
    } catch (e) {
      toast.error("Failed to update");
      console.error(e);
    }
  };

  const onExport = () => {
    const url = `${API_BASE}/admin/cashentries/export?${q()}`;
    window.open(url, "_blank");
  };

  return (
    <Layout>
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">Cash Register</h1>
        {/* <p className="text-gray-600">Record cash received and expenditures.</p> */}
      </div>
<div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
{/* Entry card */}
<div className="rounded-2xl lg:col-span-2 border bg-white p-4">
<div className="mb-3 text-sm font-semibold text-black">
Add Cash Entry
</div>
<EntryForm onSubmit={addEntry} defaultDate={today} />
</div>


{/* Vertical separator (optional on desktop) */}
<div className="hidden lg:block" aria-hidden>
<div className="h-full w-px bg-gray-200 dark:bg-gray-800 mx-auto rounded-full" />
</div>


{/* Filters card */}
<div className="rounded-2xl lg:col-span-2 border bg-white p-4  col-span-1">
<div className="mb-3 flex items-center justify-between">
<div className="text-sm font-semibold text-black">Filters</div>
{/* <button
onClick={onExport}
className="rounded-lg border px-3 py-1.5 text-sm bg-slate-800 text-white hover:bg-slate-700"
>
Export CSV
</button> */}
</div>
<Filters {...filters} onChange={(p)=>setFilters(f=>({ ...f, ...p }))} onExport={onExport} />
</div>
</div>
      <Summary totals={totals} />
      <EntriesTable items={items} onDelete={deleteEntry} onEdit={editEntry} />
    </div>
    </Layout>
  );
}
