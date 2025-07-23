import { useEffect, useState } from 'react';

export default function ItemReservationInfo({ itemName, status = '' }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!itemName) return;

     const BASE_URL = import.meta.env.PROD
  ? 'https://inventory-management-server-vue1.onrender.com'
  : 'http://localhost:4000';

    const url = `${BASE_URL}/admin/estimates/item-by-name/${encodeURIComponent(itemName)}/reserved${
      status ? `?status=${encodeURIComponent(status)}` : ''
    }`;

    fetch(url, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    })
      .then(res => res.json())
      .then(data => {
        setData(data);
        console.log('Fetched reservation data:', data);
        setLoading(false);
      })
      .catch(() => {
        setData(null);
        setLoading(false);
      });
  }, [itemName, status]);

  if (!itemName) return <p className="text-gray-400">No item selected</p>;
  if (loading) return <p>Loading transaction info...</p>;
  if (!data) return <p className="text-red-500">Failed to fetch transaction data.</p>;

  return (
    <div className="bg-white border rounded p-4 shadow">
      <h2 className="text-2xl font-semibold mb-4">{itemName || 'Unnamed Item'}</h2>
      <h3 className="text-lg font-semibold mb-2">Reserved Quantity</h3>
      <p><strong>Total Reserved:</strong> {data.totalReserved}</p>
      <p><strong>Filter Status:</strong> {data.status}</p>

      <div className="mt-4">
        <h4 className="font-medium mb-1">Breakdown:</h4>
        <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
          {data.details.map((est, idx) => (
            <li key={idx}>
              <strong>{est.customerName}</strong> – {est.quantity} pcs ({est.txnDate})
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
