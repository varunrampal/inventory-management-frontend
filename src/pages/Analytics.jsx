import React from 'react';
import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import Layout from '../components/Layout';

 const BASE_URL = import.meta.env.PROD 
? 'https://inventory-management-server-vue1.onrender.com' 
: 'http://localhost:4000';
export default function Dashboard() {

const [inventory, setInventory] = useState([]);
 
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    fetch(`${BASE_URL}/admin/inventory`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then(res => {
        if (res.status === 401) navigate('/login');
        return res.json();
      })
      .then(data => setInventory(data))
      .catch(err => console.error('Fetch error:', err));
  }, []);



  return (
    <Layout>
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
</div>
     </Layout>
  );
}