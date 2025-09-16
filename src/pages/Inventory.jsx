import { useEffect, useMemo, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { useRealm } from '../context/RealmContext';

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function Inventory() {
  const [inventory, setInventory] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({});
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [sortAsc, setSortAsc] = useState(true);
  const [activeTab, setActiveTab] = useState('Items');
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const { realmId } = useRealm();
  const itemsPerPage = 15;
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  // ⏳ debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 200);
    return () => clearTimeout(handler);
  }, [search]);

  const lower = (v) => String(v ?? '').toLowerCase();
  const s = (v) => String(v ?? '');
  const q = lower(debouncedSearch);

  // Spinner
  const Spinner = () => (
    <div
      role="status"
      aria-label="Loading"
      className="h-12 w-12 animate-spin rounded-full border-4 border-gray-300 border-t-transparent"
    />
  );

  const LoadingOverlay = () =>
    loading ? (
      <div className="fixed inset-0 z-40 bg-black/20 backdrop-blur-[1px] flex items-center justify-center">
        <Spinner />
      </div>
    ) : null;

  // Skeleton pieces
  const Skel = ({ w = 'w-full', h = 'h-4' }) => (
    <div className={`${h} ${w} rounded bg-gray-200/80 animate-pulse`} />
  );

  const SkeletonTable = () => (
    <div className="w-full bg-white rounded shadow overflow-hidden">
      <div className="bg-gray-200">
        <div className="grid grid-cols-4">
          <div className="p-3"><Skel w="w-32" /></div>
          <div className="p-3"><Skel w="w-40" /></div>
          <div className="p-3"><Skel w="w-28" /></div>
          <div className="p-3"><Skel w="w-24" /></div>
        </div>
      </div>
      <div>
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="grid grid-cols-4 border-t">
            <div className="p-3"><Skel /></div>
            <div className="p-3"><Skel w="w-24" /></div>
            <div className="p-3"><Skel w="w-28" /></div>
            <div className="p-3"><Skel w="w-20" /></div>
          </div>
        ))}
      </div>
    </div>
  );

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    if (!realmId) return;

    const controller = new AbortController();

    (async () => {
      try {
        setLoading(true);
        setError('');
        const res = await fetch(`${BASE_URL}/admin/inventory/${realmId}`, {
          headers: { Authorization: `Bearer ${token}` },
          signal: controller.signal,
        });
        if (res.status === 401) {
          navigate('/login');
          return;
        }
        if (!res.ok) throw new Error('Failed to fetch inventory');
        const data = await res.json();
        setInventory(Array.isArray(data) ? data : []);
      } catch (err) {
        if (err.name !== 'AbortError') setError(err.message || 'Something went wrong');
      } finally {
        setLoading(false);
      }
    })();

    return () => controller.abort();
  }, [realmId, token, navigate]);

  const filtered = useMemo(() => {
    const base = (inventory ?? []).filter((item) => lower(item?.name).includes(q));
    base.sort((a, b) => {
      const res = s(a?.name).localeCompare(s(b?.name), undefined, {
        sensitivity: 'base',
        numeric: true,
      });
      return sortAsc ? res : -res;
    });
    return base;
  }, [inventory, q, sortAsc]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
  const paginatedItems = useMemo(
    () => filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage),
    [filtered, currentPage]
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch]);

  const startEdit = (item) => {
    setEditingId(item._id);
    setFormData({ name: item.name, quantity: item.quantity, location: item.location });
  };

  const handleUpdate = async () => {
    const tokenNow = localStorage.getItem('token');
    if (!tokenNow) {
      navigate('/login');
      return;
    }
    try {
      setLoading(true);
      const res = await fetch(`${BASE_URL}/admin/inventory/${editingId}/${realmId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${tokenNow}`,
        },
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error('Failed to update item');

      const updated = inventory.map((it) =>
        it._id === editingId ? { ...it, ...formData } : it
      );
      setInventory(updated);
      setEditingId(null);
      setFormData({});
    } catch (err) {
      setError(err.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <Layout>
      <LoadingOverlay />

      <div className="flex h-screen">
        <main className="flex-1 bg-gray-100 p-6">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold">Inventory</h1>
          </div>

          {error && (
            <div className="mb-4 rounded-md border border-red-200 bg-red-50 p-3 text-red-700">
              {error}
            </div>
          )}

          <div className="flex gap-4 border-b mb-6">
            {['Items', 'Overview'].map((tab) => (
              <button
                key={tab}
                onClick={() => !loading && setActiveTab(tab)}
                className={`pb-2 border-b-2 text-sm font-medium transition-colors ${
                  activeTab === tab
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-blue-500'
                } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={loading}
              >
                {tab}
              </button>
            ))}
          </div>

          <div>
            {activeTab === 'Items' && (
              <>
                <div className="flex justify-between items-center mb-4">
                  <input
                    type="text"
                    placeholder="Search..."
                    className="border p-2 rounded w-full max-w-xs"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    disabled={loading}
                  />
                </div>

                {loading ? (
                  <SkeletonTable />
                ) : (
                  <div className="w-full bg-white rounded shadow overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-gray-200">
                        <tr>
                          <th
                            className="p-3 text-left cursor-pointer select-none"
                            onClick={() => setSortAsc((v) => !v)}
                          >
                            Name {sortAsc ? '▲' : '▼'}
                          </th>
                          <th className="p-3 text-left">Quantity In Stock</th>
                          <th className="p-3 text-left">Location</th>
                          <th className="p-3 text-left">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedItems.length === 0 ? (
                          <tr>
                            <td className="p-4 text-gray-500" colSpan={4}>
                              No items found.
                            </td>
                          </tr>
                        ) : (
                          paginatedItems.map((item) => (
                            <tr key={item._id} className="border-t">
                              <td className="p-3">
                                {editingId === item._id ? (
                                  <input
                                    value={formData.name || ''}
                                    onChange={(e) =>
                                      setFormData({ ...formData, name: e.target.value })
                                    }
                                    className="border px-2 py-1"
                                  />
                                ) : (
                                  <Link
                                    to={`/items/${item._id}`}
                                    className="text-blue-600 hover:underline"
                                  >
                                    {item.name}
                                  </Link>
                                )}
                              </td>
                              <td className="p-3">
                                {editingId === item._id ? (
                                  <input
                                    type="number"
                                    value={formData.quantity ?? 0}
                                    onChange={(e) =>
                                      setFormData({
                                        ...formData,
                                        quantity: Number(e.target.value),
                                      })
                                    }
                                    className="border px-2 py-1"
                                  />
                                ) : (
                                  item.quantity
                                )}
                              </td>
                              <td className="p-3">
                                {editingId === item._id ? (
                                  <input
                                    type="text"
                                    value={formData.location || ''}
                                    onChange={(e) =>
                                      setFormData({
                                        ...formData,
                                        location: e.target.value,
                                      })
                                    }
                                    className="border px-2 py-1"
                                  />
                                ) : (
                                  item.location
                                )}
                              </td>
                              <td className="p-3">
                                {editingId === item._id ? (
                                  <button
                                    onClick={handleUpdate}
                                    className="bg-green-500 text-white px-3 py-1 rounded mr-2 disabled:opacity-50"
                                    disabled={loading}
                                  >
                                    Save
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => startEdit(item)}
                                    className="bg-blue-500 text-white px-3 py-1 rounded disabled:opacity-50"
                                    disabled={loading}
                                  >
                                    Edit
                                  </button>
                                )}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                )}

                {!loading && (
                  <div className="flex justify-center items-center gap-2 mt-4">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                      className="px-3 py-1 bg-gray-300 rounded disabled:opacity-50"
                      disabled={currentPage === 1}
                    >
                      Prev
                    </button>
                    <span>
                      Page {currentPage} of {totalPages}
                    </span>
                    <button
                      onClick={() =>
                        setCurrentPage((p) => Math.min(p + 1, totalPages))
                      }
                      className="px-3 py-1 bg-gray-300 rounded disabled:opacity-50"
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}

            {activeTab === 'Overview' && (
              <div className="p-6 bg-white rounded shadow-md">
                {loading ? (
                  <div className="space-y-3">
                    <Skel w="w-1/3" />
                    <Skel />
                    <Skel w="w-2/3" />
                  </div>
                ) : (
                  <p>Overview goes here</p>
                )}
              </div>
            )}
          </div>
        </main>
      </div>
    </Layout>
  );
}
