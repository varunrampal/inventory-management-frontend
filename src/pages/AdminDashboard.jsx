import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { useRealm } from '../context/RealmContext';

//const BASE_URL = import.meta.env.PROD
  // ? 'https://inventory-management-server-vue1.onrender.com'
  // : 'http://localhost:4000';
const BASE_URL = import.meta.env.VITE_API_BASE_URL;

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
      <div className="flex h-screen">
        {/* <aside className="w-64 bg-white shadow-md hidden md:block">
        <div className="p-4 font-bold text-xl border-b">Admin Panel</div>
        <nav className="p-4 space-y-2">
          <a href="#" className="block text-blue-600">Dashboard</a>
          <a href="/analytics" className="block">Analytics</a>
           <a href="/lowstockitems" className="block">Low Stock Items</a>
       
        </nav>
      </aside> */}

        <main className="flex-1 bg-gray-100 p-6">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold">Dashboard</h1>
            {/* <button className="bg-red-500 text-white px-4 py-1 rounded"  onClick={handleLogout}>Logout</button> */}
          </div>
 <div>
      <h2>Dashboard for Realm ID: {realmId}</h2>
    </div>
        </main>
         
      </div>
    </Layout>
  );
}
