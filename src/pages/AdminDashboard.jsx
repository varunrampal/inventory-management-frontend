import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import LowStockWidget from '../components/LowStockWidget';
import WeeklyPackagesWidget from '../components/WeeklyPackagesWidget';
import DashboardCashSummarySmall from "../CashRegister/components/DashboardCashSummarySmall.jsx";
import DashboardCashTotalsToDate from "../CashRegister/components/DashboardCashTotalsToDate.jsx";
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
    <div className="p-4">
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* Left: shipping widgets */}
      <section className="lg:col-span-2 space-y-4">
        {/* <UpcomingWeekPackages realmId={realmId} /> */}
        <WeeklyPackagesWidget realmId={realmId} className="mb-6" />
                {/* Finance: Today (small) + Totals To-Date */}
       
        {/* <DashboardCashTotalsToDate /> */}
        {/* Or constrain to fiscal year start: */}
        <DashboardCashTotalsToDate startDate="2025-01-01" />
      </section>

      {/* Right: side column — low stock + finance cards */}
      <aside className="space-y-4">
        <LowStockWidget realmId={realmId} groupBy="band" threshold={10} />
      </aside>
    </div>
  </div>
    </Layout>
  );
}