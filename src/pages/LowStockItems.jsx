import React from 'react';
import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import TableWithPagination from '../components/TableWithPagination';



const BASE_URL = import.meta.env.PROD 
? 'https://inventory-management-server-vue1.onrender.com' 
: 'http://localhost:4000';

export default function LowStockItems() {

    // const [inventory, setInventory] = useState([]);
    // const LOW_STOCK_THRESHOLD = 100;
 
    // useEffect(() => {
    //   const token = localStorage.getItem('token');
    //   if (!token) {
    //     navigate('/login');
    //     return;
    //   }
    //   fetch(`${BASE_URL}/admin/inventory/${realmId}`, {
    //     headers: {
    //       Authorization: `Bearer ${token}`
    //     }
    //   })
    //     .then(res => {
    //       if (res.status === 401) navigate('/login');
    //       return res.json();
    //     })
    //         .then(data => setInventory(data))
    //         .catch(err => console.error('Fetch error:', err));
    // }, [realmId]);

    // const lowStockItems = inventory.filter(item => item.quantity < LOW_STOCK_THRESHOLD);

    return (
      <Layout>
      <div className="min-h-screen bg-gray-100 p-6">
            <header className="mb-6 flex justify-between items-center">
                <h1 className="text-2xl font-bold">Low Stock Plants</h1>
                <button className="bg-red-500 text-white px-4 py-1 rounded">Logout</button>
            </header>

         {/*  {lowStockItems.length > 0 && (
        <section className="bg-yellow-50 border-l-4 border-yellow-400 text-yellow-900 p-5 mb-6 rounded-md shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <svg className="w-6 h-6 text-yellow-500" fill="none" stroke="currentColor" strokeWidth="2"
              viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M12 9v2m0 4h.01M4.93 4.93a10 10 0 0114.14 0M4.93 19.07a10 10 0 010-14.14M19.07 4.93a10 10 0 010 14.14M12 5v.01" />
            </svg>
            <h3 className="text-xl font-semibold">⚠️ Low Stock Alert</h3>
          </div>
          <ul className="list-disc list-inside pl-4">
            {lowStockItems.map(item => (
              <li key={item.name} className="text-base">
                <strong>{item.name}</strong> has only <span className="text-red-600 font-bold">{item.quantity}</span> in stock.
              </li>
            ))}
          </ul>
        </section>
      )}


          
        </div> */}

        <TableWithPagination fetchData={async ({ page, limit, search, realmId }) => {
  const res = await fetch(
    `${BASE_URL}/admin/inventory/lowstock/${realmId}?search=${search}&page=${page}&limit=${limit}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      }
  );

  return await res.json(); // must return { items: [], total: number }
}} />
</div>
        </Layout>
    );
}