import React, { useEffect, useState } from 'react';
import { useRealm } from '../../context/RealmContext';
import { payrollSummary } from '../ApiFunctions/api.js';
import Layout from "../../components/Layout";


export default function PayrollReport() {
    const [from, setFrom] = useState(() => new Date().toISOString().slice(0, 10));
    const [to, setTo] = useState(() => new Date().toISOString().slice(0, 10));
    const [rows, setRows] = useState([]);
    const { realmId } = useRealm();

    async function run() {
        const data = await payrollSummary({ realmId, from, to });
        setRows(data);
    }


    useEffect(() => { run(); }, []);


    return (
        <Layout>
        <div className="p-6 space-y-4">
            <h1 className="text-xl font-semibold">Payroll Summary</h1>
            <div className="flex gap-2 items-end">
                <div className="flex flex-col">
                    <label>From</label>
                    <input type="date" value={from} onChange={e => setFrom(e.target.value)} className="border p-2 rounded" />
                </div>
                <div className="flex flex-col">
                    <label>To</label>
                    <input type="date" value={to} onChange={e => setTo(e.target.value)} className="border p-2 rounded" />
                </div>
                <button onClick={run} className="px-3 py-2 border rounded">Refresh</button>
            </div>


            <table className="w-full border text-sm">
                <thead>
                    <tr className="bg-gray-100">
                        <th className="border p-2 text-left">Employee</th>
                        <th className="border p-2 text-right">Hours</th>
                        <th className="border p-2 text-right">Rate</th>
                        <th className="border p-2 text-right">Amount</th>
                        {/* <th className="border p-2">Currency</th> */}
                    </tr>
                </thead>
                <tbody>
                    {rows.map(r => (
                        <tr key={r.employeeId}>
                            <td className="border p-2">{r.name}</td>
                            <td className="border p-2 text-right">{r.hours.toFixed(2)}</td>
                            <td className="border p-2 text-right">{r.cashHourlyRate.toFixed(2)}</td>
                            <td className="border p-2 text-right">{r.amount.toFixed(2)}</td>
                            {/* <td className="border p-2">{r.currency}</td> */}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
        </Layout>
    );
}