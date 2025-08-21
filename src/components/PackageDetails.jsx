import { useEffect, useState } from 'react';
import AssociatedEstimate from '../components/AssociatedEstimate';

export default function PackageDetails({packageId}) {
 
  const [pkg, setPkg] = useState(null);
  const [loading, setLoading] = useState(true);

const BASE_URL = import.meta.env.PROD
    ? 'https://inventory-management-server-vue1.onrender.com'
    : 'http://localhost:4000';

  useEffect(() => {
    fetch(`${BASE_URL}/admin/packages/${packageId}`)
      .then(r => r.json())
      .then(d => { setPkg(d.package); console.log('pckg:', d.package); })
      .finally(() => setLoading(false));
  }, [packageId]);

  if (loading) return <p>Loading…</p>;
  if (!pkg) return <p>Package not found.</p>;

  return (
    
<>
<div>
     <strong> {pkg.packageCode}</strong>
<AssociatedEstimate estimateId={pkg.estimateId} />
   </div>
      <table className="w-full border text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="border px-2 py-1 text-left">Item</th>
            <th className="border px-2 py-1 text-right">Qty</th>
            {/* <th className="border px-2 py-1 text-right">Rate</th>
            <th className="border px-2 py-1 text-right">Amount</th> */}
          </tr>
        </thead>
        <tbody>
          {pkg.lines.map((l, idx) => (
            <tr key={idx}>
              <td className="border px-2 py-1">{l.name}</td>
              <td className="border px-2 py-1 text-right">{l.quantity}</td>
              {/* <td className="border px-2 py-1 text-right">${Number(l.rate || 0).toFixed(2)}</td>
              <td className="border px-2 py-1 text-right">${Number(l.amount || 0).toFixed(2)}</td> */}
            </tr>
          ))}
        </tbody>
      </table>
        {/* <div className="mt-4">
            <p className="text-sm">Total Amount: ${Number(pkg.totalAmount || 0).toFixed(2)}</p>
            <Link to={`/edit-package/${pkg.packageId}`} className="text-blue-600 hover:underline">Edit Package</Link>
          </div> */}
          </>
  );
}