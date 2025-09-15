import { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams, Link } from "react-router-dom";
import { toast } from 'react-toastify';
import Layout from '../components/Layout';

export default function TokenDashboard() {
  const [companies, setCompanies] = useState([]);
  const [syncing, setSyncing] = useState(false);
  const [message, setMessage] = useState('');
  const [statusMessage, setStatusMessage] = useState('');

  // const BASE_URL = import.meta.env.PROD
  //   ? 'https://inventory-management-server-vue1.onrender.com'
  //   : 'http://localhost:4000';

  const BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const { realmId } = useParams();
console.log(realmId);
  // useEffect(() => {
  //   fetch('/companies.json')
  //     .then(res => res.json())
  //     .then(setCompanies)
  //     .catch(() => {
  //       setMessage('❌ Failed to load companies.');
  //     });
  // }, []);

  useEffect(() => {
    fetch(`${BASE_URL}/static/companies.json`)
      .then(res => res.json())
      .then(setCompanies)
      .catch(() => toast.error('Failed to load companies'));
  }, []);

  const handleConnect = async (realmId) => {
    try {
      console.log('Connecting to QuickBooks for realmId:', realmId);
      const res = await fetch(`${BASE_URL}/auth/initiate?realmId=${realmId}`);
      const data = await res.json();
      if (data.authUrl) {
        window.open(data.authUrl, '_blank');
      } else {
        alert('⚠️ No auth URL returned.');
      }
    } catch (err) {
      console.error(err);
      alert('❌ Auth initiation failed');
    }
  };
  const handleManualSync = async (realmId) => {
    setSyncing(true);
    setMessage('Syncing data, please wait...');
    try {
      console.log('Manual sync for realmId:', realmId);
      const res = await fetch(`${BASE_URL}/admin/sync/manual-sync/${realmId}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await res.json();
      if (data.message) {
        setMessage(data.message);
        toast.success(`✅ Synced ${realmId}`);
        // Update the lastSync timestamp on backend
        await fetch(`${BASE_URL}/admin/sync/update-sync-time`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ realmId })
        });

        // Re-fetch the updated companies.json
        const latest = await fetch(`${BASE_URL}/static/companies.json`).then(res => res.json());
        setCompanies(latest);
      }
    } catch (err) {
      console.error(err);
      toast.error(`❌ Sync failed for ${realmId}`);
      setMessage('❌ Sync failed. Admin has been notified via email.');
    } finally {
      setSyncing(false);
    }
  };



  return (
    <Layout>
      <div className="p-6 max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Connected Companies</h1>
        {message && <p className="mb-4 text-sm text-gray-700">{message}</p>}
        <table className="min-w-full table-auto border text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 text-left">Name</th>
              <th className="px-4 py-2 text-left">Company ID</th>
              <th className="px-4 py-2 text-left">Last Sync</th>
              <th className="px-4 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
{companies.map((c, i) =>
  String(c.realmId) === String(realmId) && (
    <tr key={i} className="border-t">
      <td className="px-4 py-2">{c.name}</td>
      <td className="px-4 py-2">{c.realmId}</td>
      <td className="px-4 py-2">
        {new Date(c.lastSync).toLocaleString()}
      </td>
      <td className="px-4 py-2 flex gap-2">
        {/* <button
          onClick={() => handleConnect(c.realmId)}
          className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
        >
          Connect
        </button> */}

        {/* <button
          onClick={() => handleManualSync(c.realmId)}
          disabled={syncing[c.realmId]}
          className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 disabled:opacity-50"
        >
          {syncing[c.realmId] ? 'Syncing...' : 'Sync Now'}
        </button> */}

        <button
          onClick={() => handleManualSync(c.realmId)}
          disabled={syncing[c.realmId]}
          className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 disabled:opacity-50"
        >
          {syncing[c.realmId] ? "Syncing..." : "Sync Now"}
        </button>
      </td>
    </tr>
  )
)}
          </tbody>
        </table>
      </div>
    </Layout>
  );
}
