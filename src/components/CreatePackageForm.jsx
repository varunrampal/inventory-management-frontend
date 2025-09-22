import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function CreatePackageForm({ estimateId, realmId }) {
  const [form, setForm] = useState({ shipmentDate: "", driverName: "" });
  const [estimate, setEstimate] = useState(null);
  const [quantities, setQuantities] = useState({});
  const [message, setMessage] = useState('');
  const [createdPackage, setCreatedPackage] = useState(null);
  const [pkgDate, setPkgDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [shipDate, setShipDate] = useState('');
  const [driverName, setDriverName] = useState('');
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  // const BASE_URL = import.meta.env.PROD
  //   ? 'https://inventory-management-server-vue1.onrender.com'
  //   : 'http://localhost:4000';

  const BASE_URL = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    fetch(`${BASE_URL}/admin/estimates/details/${estimateId}/${realmId}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    })
      .then((res) => res.json())
      .then((data) => {
        setEstimate(data.estimate);
        const initial = {};
        data.estimate.items.forEach((item) => {
          const remaining = item.quantity - (item.fulfilled || 0);
          const key = item.itemId ? String(item.itemId) : String(item.name);
          initial[key] = remaining > 0 ? remaining : 0;
        });
        setQuantities(initial);
        console.log('item quantities initialized:', initial);
      });
  }, [estimateId, realmId]);

  const handleQtyChange = (itemId, value) => {
    const val = Math.max(0, Number(value));
    setQuantities((prev) => ({ ...prev, [itemId]: val }));
    console.log('Updated quantity for item', itemId, 'to', val);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('Submitting...');

    // Normalize values from your form state

    console.log('Submitting package with details:', { shipDate, driverName });
    // Validate required fields
    const nextErrors = {};
    if (!shipDate) nextErrors.shipmentDate = "Shipment date is required.";
    if (!driverName) nextErrors.driverName = "Driver name is required.";

    setErrors(nextErrors);

    // Abort if any errors
    if (Object.keys(nextErrors).length > 0) {
      setMessage("Please fix the required fields.");
      return;
    }

    try {
      const res = await fetch(`${BASE_URL}/admin/packages/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ estimateId, realmId, quantities, notes: '', packageDate: pkgDate, shipmentDate: shipDate || undefined, driverName }),
      });

      const data = await res.json();
      if (data.success) {
        navigate(`/package/details/${data.packageId}`);
        //setCreatedPackage({ id: data.packageId, code: data.packageCode });
        // setMessage(`✅ Package and invoice created! Invoice ID: ${data.invoiceId}`);
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


  const handleQtyKeyUp = (item, key) => (e) => {
    const ordered = Number(item.quantity || 0);
    const fulfilled = Number(item.fulfilled || 0);
    const remaining = Math.max(0, ordered - fulfilled);
    const val = Number(e.currentTarget.value);

    if (!Number.isFinite(val)) return;

    if (val > remaining || val > ordered) {
      alert(`Selected quantity cannot exceed remaining (${remaining}). Ordered: ${ordered}.`);
      const clamped = Math.min(remaining, ordered);
      // clamp UI + state
      e.currentTarget.value = clamped;
      setQuantities((prev) => ({ ...prev, [key]: clamped }));
    }
  };

  if (!estimate) return <p>Loading estimate...</p>;

  return (
    <form onSubmit={handleSubmit} className="bg-white border rounded shadow p-4 space-y-4 w-full max-w-none">
      <h2 className="text-lg font-semibold">Estimate #{estimate.estimateId}</h2>
      {message && <p className="text-sm text-blue-600">{message}</p>}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium">Package Date</label>
          <input
            type="date"
            value={pkgDate}
            onChange={(e) => setPkgDate(e.target.value)}
            className="w-full border rounded px-2 py-1"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium"> Shipment Date <span className="text-red-600">*</span></label>
          <input
            type="date"
            value={shipDate}
            name="shipmentDate"
            onChange={(e) => setShipDate(e.target.value)}
            className="w-full border rounded px-2 py-1"
            required
          />
          {errors.shipmentDate && (
            <p className="mt-1 text-xs text-red-600">{errors.shipmentDate}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium">Driver Name<span className="text-red-600">*</span></label>
          <input
            type="text"
            placeholder="e.g. Alex Johnson"
            value={driverName}
            onChange={(e) => setDriverName(e.target.value)}
            className="w-full border rounded px-2 py-1"
            required
          />
          {errors.driverName && (
            <p className="mt-1 text-xs text-red-600">{errors.driverName}</p>
          )}
        </div>
      </div>
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
          {(estimate.items || [])
            .filter(it => {
              const n = String(it?.name ?? '').trim().toLowerCase();
              return n && n !== 'unnamed'; // hide Unnamed/blank
            })
            .map((item) => {
              const fulfilled = item.fulfilled || 0;
              const remaining = item.quantity - fulfilled;
              const isDisabled = remaining <= 0
              const key = item.itemId ? String(item.itemId) : String(item.name);

              return (
                <tr key={key}>
                  <td className="px-2 py-1 border">{item.name}</td>
                  <td className="px-2 py-1 border text-right">{item.quantity}</td>
                  <td className="px-2 py-1 border text-right">{fulfilled}</td>
                  <td className="px-2 py-1 border text-right">{remaining}</td>
                  <td className="px-2 py-1 border text-right">
                    <input
                      type="number"
                      min="0"
                      max={remaining}
                      value={quantities[key] ?? 0}
                      onChange={(e) =>
                        setQuantities((prev) => ({ ...prev, [key]: Math.max(0, Number(e.target.value)) }
                        ))

                      }
                      onKeyUp={handleQtyKeyUp(item, key)}
                      // onChange={(e) => handleQtyChange(key, e.target.value)}
                      className={`w-20 border rounded px-2 py-1 text-right ${isDisabled ? 'bg-gray-200 text-gray-500' : ''}`}
                      disabled={isDisabled} // 🔹 Disable if no remaining qty
                    />
                  </td>
                </tr>
              );
            })}
        </tbody>
      </table>

      <div className="mt-4 flex justify-end gap-3">
        <button
          type="submit"
          className="rounded-md bg-green-600 px-4 py-2 text-white hover:bg-green-700"
        >
          Save
        </button>
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="rounded-md bg-gray-300 px-4 py-2 text-black hover:bg-gray-200"
        >
          Cancel
        </button>


      </div>
      {createdPackage && (
        <div className="mt-3 text-sm text-gray-700">
          <div><strong>Package Code:</strong> {createdPackage.code}</div>
          <div><strong>Package Doc ID:</strong> {createdPackage.id}</div>
        </div>
      )}
    </form>
  );
}
