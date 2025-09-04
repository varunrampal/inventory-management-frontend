import { useEffect, useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Accordion from './Accordion';
import { useRealm } from '../context/RealmContext';

export default function AssociatedEstimate({ estimateId }) {
  const [estimate, setEstimate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');
  const { realmId } = useRealm();

  // const BASE_URL = useMemo(
  //   () => (import.meta.env.PROD
  //     ? 'https://inventory-management-server-vue1.onrender.com'
  //     : 'http://localhost:4000'),
  //   []
  // );

  const BASE_URL = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    const fetchEstimate = async () => {
      try {
        setLoading(true);
        setErr('');

        if (!estimateId || !realmId) {
          throw new Error('Estimate ID and Realm ID are required');
        }

        const headers = { };
        const token = localStorage.getItem('token');
        if (token) headers.Authorization = `Bearer ${token}`;

        const res = await fetch(
          `${BASE_URL}/admin/estimates/details/${encodeURIComponent(estimateId)}/${encodeURIComponent(realmId)}`,
          { headers }
        );

        if (!res.ok) throw new Error(`Failed to fetch estimate details (${res.status})`);
        const data = await res.json();

        const est =
          Array.isArray(data?.estimate) && data.estimate.length > 0
            ? data.estimate[0]
            : data?.estimate || null;

        if (!est) throw new Error('No estimate data found');

        setEstimate(est);
      } catch (e) {
        setErr(e.message || 'Unable to load estimate');
        setEstimate(null);
      } finally {
        setLoading(false);
      }
    };

    fetchEstimate();
  }, [estimateId, realmId, BASE_URL]);

  return (
    <Accordion title="Associated Estimate" defaultOpen={false}>
      {/* states */}
      {!estimateId ? (
        <p className="text-sm text-gray-500">No associated estimate.</p>
      ) : loading ? (
        <p className="text-sm text-gray-500">Loading…</p>
      ) : err ? (
        <p className="text-sm text-red-600">{err}</p>
      ) : !estimate ? (
        <p className="text-sm text-gray-500">No estimate found.</p>
      ) : (
        <div className="space-y-2 text-gray-700">
          <table className="w-full border text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="border px-2 py-1 text-left">Estimate ID</th>
                <th className="border px-2 py-1 text-left">Customer</th>
                <th className="border px-2 py-1 text-left">Txn Date</th>
                <th className="border px-2 py-1 text-left">Status</th>
                <th className="border px-2 py-1 text-left">Total</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b">
                <td className="px-2 py-1"><Link to={`/estimate/details/${estimate.estimateId}`} className="text-blue-500 hover:underline ml-2">
                      {estimate.estimateId}
                    </Link></td>
                <td className="px-2 py-1">{estimate?.customerName || 'N/A'}</td>
                <td className="px-2 py-1">
                  {estimate?.txnDate
                    ? new Date(estimate.txnDate).toLocaleDateString()
                    : 'N/A'}
                </td>
                <td className="px-2 py-1">{estimate?.txnStatus || 'N/A'}</td>
                <td className="px-2 py-1">
                  {'$' + (Number(estimate?.totalAmount ?? 0).toFixed(2))}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </Accordion>
  );
}