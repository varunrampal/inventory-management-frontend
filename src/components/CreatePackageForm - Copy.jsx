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
  const [custName, setCustName] = useState(''); // NEW

  //Site contact + editable shipping address
  const [siteContact, setSiteContact] = useState({ name: "", phone: "", email: "" }); // NEW
  const [shippingAddress, setShippingAddress] = useState(""); // NEW

  const navigate = useNavigate();

  // const BASE_URL = import.meta.env.PROD
  //   ? 'https://inventory-management-server-vue1.onrender.com'
  //   : 'http://localhost:4000';

  const BASE_URL = import.meta.env.VITE_API_BASE_URL;

   // NEW: helper to stringify QBO ShipAddr into multiline text
  const toAddressString = (addr = {}) => { // NEW
    const {
      Line1, Line2, Line3, Line4, Line5,
      City, CountrySubDivisionCode, PostalCode, Country
    } = addr || {};
    const lines = [
      Line1, Line2, Line3, Line4, Line5,
      [City, CountrySubDivisionCode, PostalCode].filter(Boolean).join(", "),
      Country
    ].filter(Boolean);
    return lines.join("\n");
  };

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

       // NEW: initialize editable shipping address from QBO ShipAddr (fallback to BillAddr/Customer)
        const raw = data.estimate?.raw || {};
        const shipAddr = raw?.ShipAddr || raw?.BillAddr || {};
        setShippingAddress(toAddressString(shipAddr));

        // NEW (optional): default site contact hints from estimate/customer if available
        const custName = raw?.CustomerRef?.name || "";
        setSiteContact((s) => ({ ...s, name: s.name || custName }));
        setCustName(custName); // NEW: store customer name for display

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

  // NEW: basic validation for site contact
    if (!siteContact.name?.trim()) nextErrors.siteContactName = "Site contact name is required."; // NEW
    if (siteContact.phone && !/^[0-9+()\-\s]{7,}$/.test(siteContact.phone)) { // simple sanity check // NEW
      nextErrors.siteContactPhone = "Please enter a valid phone number."; // NEW
    }

    // NEW: ensure there’s at least one nonzero quantity
    const totalSelected = Object.values(quantities).reduce((a, b) => a + (Number(b) || 0), 0); // NEW
    if (totalSelected <= 0) nextErrors.quantities = "Select at least one quantity to pack."; // NEW


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
        body: JSON.stringify({ estimateId, realmId, quantities, notes: '', 
          packageDate: pkgDate, 
          shipmentDate: shipDate || undefined, 
          driverName,
          siteContact,    
          shippingAddress   // NEW
        
        }),
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
      <h2 className="text-lg font-semibold">Estimate #{estimate.raw.DocNumber}</h2>
      {message && <p className="text-sm text-blue-600">{message}</p>}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
          <label className="block text-sm font-medium">Customer Name</label>
          <input
            type="text"
            placeholder="e.g. Alex Johnson"
            value={custName}
            onChange={(e) => setCustName(e.target.value)}
            className="w-full border rounded px-2 py-1"
            disabled
          />
         
        </div>
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

        {/* NEW: Site Contact + Shipping Address */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4"> {/* NEW */}
        <div className="border rounded p-3"> {/* NEW */}
          <div className="text-sm font-medium mb-2">Site Contact</div>
          <label className="block text-xs text-gray-600 mb-1">Name <span className="text-red-600">*</span></label>
          <input
            type="text"
            value={siteContact.name}
            onChange={(e) => setSiteContact({ ...siteContact, name: e.target.value })}
            className="w-full border rounded px-2 py-1 mb-2"
            placeholder="Contact name"
          />
          {errors.siteContactName && (
            <p className="mt-1 text-xs text-red-600">{errors.siteContactName}</p>
          )}
          <label className="block text-xs text-gray-600 mb-1">Phone</label>
          <input
            type="tel"
            value={siteContact.phone}
            onChange={(e) => setSiteContact({ ...siteContact, phone: e.target.value })}
            className="w-full border rounded px-2 py-1 mb-2"
            placeholder="e.g. 604-555-0123"
          />
          {errors.siteContactPhone && (
            <p className="mt-1 text-xs text-red-600">{errors.siteContactPhone}</p>
          )}
          <label className="block text-xs text-gray-600 mb-1">Email</label>
          <input
            type="email"
            value={siteContact.email}
            onChange={(e) => setSiteContact({ ...siteContact, email: e.target.value })}
            className="w-full border rounded px-2 py-1"
            placeholder="name@example.com"
          />
        </div>

        <div className="border rounded p-3"> {/* NEW */}
          <div className="text-sm font-medium mb-2">Shipping Address</div>
          <textarea
            rows={8}
            value={shippingAddress}
            onChange={(e) => setShippingAddress(e.target.value)}
            className="w-full border rounded px-2 py-1 font-mono"
            placeholder={`Street\nSuite/Unit\nCity, Province, Postal Code\nCountry`}
          />
          <p className="text-xs text-gray-500 mt-1">
            Prefilled from the estimate’s Ship Address. You can edit it before saving.
          </p>
        </div>
      </div>
      {/* END NEW */}

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
