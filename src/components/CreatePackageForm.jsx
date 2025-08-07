import { useEffect, useState } from 'react';

export default function CreatePackageForm({ estimateId, realmId }) {
  const [estimate, setEstimate] = useState(null);
  const [quantities, setQuantities] = useState({});
  const [message, setMessage] = useState('');

const BASE_URL = import.meta.env.PROD
    ? 'https://inventory-management-server-vue1.onrender.com'
    : 'http://localhost:4000';

  useEffect(() => {
    fetch(`${BASE_URL}/admin/estimates/${estimateId}?realmId=${realmId}`)
      .then((res) => res.json())
      .then((data) => {
        setEstimate(data);
        const initial = {};
        data.items.forEach((item) => {
          const remaining = item.quantity - (item.fulfilled || 0);
          initial[item.itemId] = remaining > 0 ? remaining : 0;
        });
        setQuantities(initial);
      });
  }, [estimateId, realmId]);

  const handleQtyChange = (itemId, value) => {
    const val = Math.max(0, Number(value));
    setQuantities((prev) => ({ ...prev, [itemId]: val }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('Submitting...');

    try {
      const res = await fetch('/admin/estimates/fulfill', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estimateId, realmId, quantities }),
      });

      const data = await res.json();
      if (data.success) {
        setMessage(`✅ Package and invoice created! Invoice ID: ${data.invoiceId}`);
      } else {
        setMessage('⚠️ ' + (data.message || 'No items could be fulfilled.'));
      }

      if (data.warnings) {
        data.warnings.forEach((w) => alert(w)); // or use toast
      }
    } catch (err) {
      console.error(err);
      setMessage('❌ Submission failed.');
    }
  };

  if (!estimate) return <p>Loading estimate...</p>;

  return (
    <form onSubmit={handleSubmit} className="bg-white border rounded shadow p-4 space-y-4 max-w-3xl">
      <h2 className="text-lg font-semibold">Fulfill Estimate #{estimate.estimateId}</h2>
      {message && <p className="text-sm text-blue-600">{message}</p>}

      <table className="w-full border text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-2 py-1 border text-left">Item</th>
            <th className="px-2 py-1 border text-right">Ordered</th>
            <th className="px-2 py-1 border text-right">Fulfilled</th>
            <th className="px-2 py-1 border text-right">Remaining</th>
            <th className="px-2 py-1 border text-right">Select Qty</th>
          </tr>
        </thead>
        <tbody>
          {estimate.items.map((item) => {
            const fulfilled = item.fulfilled || 0;
            const remaining = item.quantity - fulfilled;
            return (
              <tr key={item.itemId}>
                <td className="px-2 py-1 border">{item.name}</td>
                <td className="px-2 py-1 border text-right">{item.quantity}</td>
                <td className="px-2 py-1 border text-right">{fulfilled}</td>
                <td className="px-2 py-1 border text-right">{remaining}</td>
                <td className="px-2 py-1 border text-right">
                  <input
                    type="number"
                    min="0"
                    max={remaining}
                    value={quantities[item.itemId] ?? 0}
                    onChange={(e) => handleQtyChange(item.itemId, e.target.value)}
                    className="w-20 border rounded px-2 py-1 text-right"
                  />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <button
        type="submit"
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Create Package and Invoice
      </button>
    </form>
  );
}
