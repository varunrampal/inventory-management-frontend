import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Layout from '../components/Layout';

const BASE_URL = import.meta.env.PROD
  ? 'https://inventory-management-server-vue1.onrender.com'
  : 'http://localhost:4000';
export default function Inventory() {
  const [inventory, setInventory] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({});
  const [search, setSearch] = useState('');
  const [sortAsc, setSortAsc] = useState(true);
  const tabs = ['Items', 'Overview'];
  const [activeTab, setActiveTab] = useState('Items');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const navigate = useNavigate();

  const filtered = inventory
    .filter(item => item.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) =>
      sortAsc
        ? a.name.localeCompare(b.name)
        : b.name.localeCompare(a.name)
    );

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginatedItems = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );



  // useEffect(() => {
  //   fetch(`${BASE_URL}/admin/inventory`, { credentials: 'include' })
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

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    fetch(`${BASE_URL}/admin/inventory`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then(res => {
        if (res.status === 401) navigate('/login');
        return res.json();
      })
      .then(data => {
        console.log('Fetched inventory:', data);
        setInventory(data)

      })
      .catch(err => console.error('Fetch error:', err));
  }, [navigate]);

  const startEdit = (item) => {
    setEditingId(item._id);
    setFormData({ name: item.name, quantity: item.quantity, location: item.location });
  };

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

  const handleUpdate = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    const res = await fetch(`${BASE_URL}/admin/inventory/${editingId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(formData)
    });
    if (res.ok) {
      const updated = inventory.map(item =>
        item._id === editingId ? { ...item, ...formData } : item
      );
      setInventory(updated);
      setEditingId(null);
      setFormData({});
    }
  };

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
            <h1 className="text-2xl font-bold">Inventory</h1>
            {/* <button className="bg-red-500 text-white px-4 py-1 rounded"  onClick={handleLogout}>Logout</button> */}
          </div>

          <div className="flex gap-4 border-b mb-6">
            {tabs.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-2 border-b-2 text-sm font-medium ${activeTab === tab
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-blue-500'
                  }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div>
            {activeTab === 'Items' &&
              <>
                <div className="flex justify-between items-center mb-4">
                  <input
                    type="text"
                    placeholder="Search..."
                    className="border p-2 rounded w-full max-w-xs"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                  />
                  {/* <button className="ml-4 bg-blue-500 text-white px-4 py-2 rounded">+ Add Item</button> */}
                </div>
                <table className="w-full bg-white rounded shadow">
                  <thead className="bg-gray-200">
                    <tr>
                      <th className="p-3 text-left cursor-pointer" onClick={() => setSortAsc(!sortAsc)}>
                        Name {sortAsc ? '▲' : '▼'}
                      </th>
                      <th className="p-3 text-left">Quantity In Stock</th>
                      <th className="p-3 text-left">Location</th>
                      <th className="p-3 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedItems.map(item => (
                      <tr key={item.id} className="border-t">
                        <td className="p-3">               {editingId === item._id ? (
                          <input
                            value={formData.name || ''}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                            className="border px-2 py-1" />
                        ) : (
                          <Link
                            to={`/items/${item._id}`}
                            className="text-blue-600 hover:underline"
                          >
                            {item.name}
                          </Link>
                        )}</td>
                        <td className="p-3">{editingId === item._id ? (
                          <input
                            type="number"
                            value={formData.quantity || 0}
                            onChange={e => setFormData({ ...formData, quantity: Number(e.target.value) })}
                            className="border px-2 py-1" />
                        ) : (
                          item.quantity
                        )}</td>
                        <td className="p-3">{editingId === item._id ? (
                          <input
                            type="text"
                            value={formData.location || ''}
                            onChange={e => setFormData({ ...formData, location: e.target.value })}
                            className="border px-2 py-1" />
                        ) : (
                          item.location
                        )}</td>
                        <td className="p-3">
                          {editingId === item._id ? (
                            <button
                              onClick={handleUpdate}
                              className="bg-green-500 text-white px-3 py-1 rounded mr-2"
                            >
                              Save
                            </button>
                          ) : (
                            <button
                              onClick={() => startEdit(item)}
                              className="bg-blue-500 text-white px-3 py-1 rounded"
                            >
                              Edit
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table><div className="flex justify-center items-center gap-2 mt-4">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                    className="px-3 py-1 bg-gray-300 rounded disabled:opacity-50"
                    disabled={currentPage === 1}
                  >
                    Prev
                  </button>
                  <span>
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                    className="px-3 py-1 bg-gray-300 rounded disabled:opacity-50"
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </button>
                </div></>
            }
            {activeTab === 'Overview' && <p>Overview goes here</p>}
          </div>
          {/* <footer className="text-center text-gray-500 text-sm mt-10">
          © 2025 Green Flow Nurseries Ltd.
        </footer> */}
        </main>
      </div>
    </Layout>
  );
}
