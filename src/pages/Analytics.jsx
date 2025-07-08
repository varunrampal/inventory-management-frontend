import React from 'react';
import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

 const BASE_URL = import.meta.env.PROD 
? 'https://inventory-management-server-vue1.onrender.com' 
: 'http://localhost:5173';
export default function Dashboard() {

const [inventory, setInventory] = useState([]);
 
  useEffect(() => {
    fetch(`${BASE_URL}/admin/inventory`, { credentials: 'include' })
      .then(res => {
        if (res.status === 401) navigate('/login');
        return res.json();
      })
      .then(data => setInventory(data))
      .catch(err => console.error('Fetch error:', err));
  }, []);



  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <header className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Inventory Analytics</h1>
        <button className="bg-red-500 text-white px-4 py-1 rounded">Logout</button>
      </header>

      <section className="bg-white p-4 rounded shadow mb-6">
        <h2 className="text-lg font-semibold mb-2">Inventory Overview</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={inventory}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="quantity" fill="#3B82F6" />
          </BarChart>
        </ResponsiveContainer>
      </section>

      <footer className="text-center text-gray-500 text-sm mt-10">
        © 2025 Green Flow Nurseries Ltd.
      </footer>
    </div>
  );
}