import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import UpcomingWeekMini from "../components/UpcomingWeekMini";
import UpcomingWeekPackages from "../components/UpcomingWeekPackages";
import WeeklyPackagesWidget from '../components/WeeklyPackagesWidget';
import Layout from '../components/Layout';
import { useRealm } from '../context/RealmContext';

//const BASE_URL = import.meta.env.PROD
  // ? 'https://inventory-management-server-vue1.onrender.com'
  // : 'http://localhost:4000';
const BASE_URL = import.meta.env.VITE_API_BASE_URL;

function useUpcomingWeek(realmId) {
  const [data, setData] = useState({ range: null, grouped: [] });
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    if (!realmId) return;
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setErr("");
        const url = new URL(`${BASE_URL}/admin/packages/upcoming`);
        url.searchParams.set("realmId", realmId);
        const res = await fetch(url, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
          },
        });
        if (!res.ok) throw new Error(await res.text());
        const json = await res.json();
        if (!cancelled) setData(json);
      } catch (e) {
        if (!cancelled) setErr(String(e.message || e));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => (cancelled = true);
  }, [realmId]);

  return { data, loading, err };
}


export default function AdminDashboard() {
  const [inventory, setInventory] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({});
  const [search, setSearch] = useState('');
  const [sortAsc, setSortAsc] = useState(true);
  const tabs = ['Physical Stock', 'Transactions'];
  const [activeTab, setActiveTab] = useState('Physical Stock');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const navigate = useNavigate();
  const { realmId } = useRealm();
   const { data, loading, err } = useUpcomingWeek(realmId);


  // useEffect(() => {
  //   const token = localStorage.getItem('token');
  //   if (!token) {
  //     navigate('/login');
  //     return;
  //   }
  //   fetch(`${BASE_URL}/admin/inventory`, {
  //     headers: {
  //       Authorization: `Bearer ${token}`
  //     }
  //   })
  //     .then(res => {
  //       if (res.status === 401) navigate('/login');
  //       return res.json();
  //     })
  //     .then(data => {
  //       console.log('Fetched inventory:', data);
  //       setInventory(data)

  //     })
  //     .catch(err => console.error('Fetch error:', err));
  // }, [navigate]);

  // const startEdit = (item) => {
  //   setEditingId(item._id);
  //   setFormData({ name: item.name, quantity: item.quantity, location: item.location });
  // };

  // const handleUpdate = async () => {
  //   const res = await fetch(`${BASE_URL}/admin/inventory/${editingId}`, {
  //     method: 'PUT',
  //     headers: { 'Content-Type': 'application/json' },
  //     credentials: 'include',
  //     body: JSON.stringify(formData)
  //   });
  //   if (res.ok) {
  //     const updated = inventory.map(item =>
  //       item._id === editingId ? { ...item, ...formData } : item
  //     );
  //     setInventory(updated);
  //     setEditingId(null);
  //     setFormData({});
  //   }
  // };


  const handleLogout = async () => {
    // await fetch(`${BASE_URL}/admin/logout`, {
    //   method: 'POST',
    //   credentials: 'include'
    // });
    // navigate('/login');
    localStorage.removeItem('token');
    navigate('/login');
  };


   return (
    <Layout>
      <div className="p-4 grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* If you also want the detailed card: */}
        <section className="lg:col-span-2">
          {/* <UpcomingWeekPackages realmId={realmId} /> */}
          <WeeklyPackagesWidget realmId={realmId} className="mb-6" />
        </section>

        {/* <aside className="lg:col-span-1 rounded-2xl border p-4">
          <div className="mb-3">
            <h3 className="text-lg font-semibold">Upcoming Deliveries/Pickups</h3>
            {data.range && (
              <div className="text-xs text-gray-500">
                {data.range.from} → {data.range.to} (exclusive)
              </div>
            )}
          </div>

          {loading ? (
            <div className="text-sm text-gray-500">Loading…</div>
          ) : err ? (
            <div className="text-sm text-red-600">Error: {err}</div>
          ) : (
           <UpcomingWeekPackages realmId={realmId} /> 
             
          )}
          
        </aside> */}
      </div>
    </Layout>
  );
}