import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Layout from '../components/Layout';
import ItemReservationInfo from '../components/ItemReservationInfo';
import { useRealm } from '../context/RealmContext';

export default function ItemDetails() {
  const BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const { id } = useParams();
  const { realmId } = useRealm();

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const tabs = ['Overview', 'Transactions'];
  const [activeTab, setActiveTab] = useState('Overview');

  useEffect(() => {
    const controller = new AbortController();

    const fetchItem = async () => {
      try {
        setLoading(true);
        setError('');

        // Need BOTH params
        if (!id || !realmId) throw new Error('Item ID and Realm ID are required');

        const res = await fetch(`${BASE_URL}/admin/items/${id}/${realmId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
          signal: controller.signal,
        });
        if (!res.ok) throw new Error('Failed to fetch item details');

        const data = await res.json();
        setItem(data);
      } catch (err) {
        if (err.name !== 'AbortError') setError(err.message || 'Something went wrong');
      } finally {
        setLoading(false);
      }
    };

    fetchItem();
    return () => controller.abort();
  }, [id, realmId, BASE_URL]);

  // Reusable CSS spinner (no GIF needed)
  const Spinner = () => (
    <div
      role="status"
      aria-label="Loading"
      className="h-12 w-12 animate-spin rounded-full border-4 border-gray-300 border-t-transparent"
    />
  );

  // Skeleton line
  const Skel = ({ w = 'w-full' }) => (
    <div className={`h-4 ${w} rounded bg-gray-200/80 animate-pulse`} />
  );

  // Page-dim overlay while loading
  const LoadingOverlay = () =>
    loading ? (
      <div className="fixed inset-0 z-40 bg-black/20 backdrop-blur-[1px] flex items-center justify-center">
        <Spinner />
      </div>
    ) : null;

  // Error view
  if (error) {
    return (
      <Layout>
        <div className="rounded-md border border-red-200 bg-red-50 p-4 text-red-700">
          Error: {error}
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Dim overlay while loading */}
      <LoadingOverlay />

      <h1 className="text-2xl font-semibold mb-4">Item</h1>

      {/* Tab Menu */}
      <div className="flex gap-4 border-b mb-6">
        {tabs.map((tab) => (
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

      {/* Content */}
      <div>
        {activeTab === 'Overview' && (
          <div className="p-6 bg-white rounded shadow-md">
            {/* When loading: skeletons */}
            {loading ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Skel w="w-1/3" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3 mt-2">
                  <Skel w="w-2/3" />
                  <Skel w="w-1/2" />
                  <Skel w="w-1/3" />
                  <Skel w="w-1/3" />
                  <Skel w="w-1/2" />
                  <Skel w="w-3/4" />
                  <Skel w="w-1/2" />
                  <Skel w="w-1/2" />
                </div>

                <div className="mt-5">
                  <Skel w="w-40" />
                </div>
              </div>
            ) : item ? (
              <>
                <h2 className="text-2xl font-semibold mb-4">
                  {item.name || 'Unnamed Item'}
                </h2>

                <div className="space-y-2 text-gray-700">
                  <p>
                    <strong>Category:</strong> {item.category || 'N/A'}
                  </p>
                  <p>
                    <strong>SKU:</strong> {item.sku || 'N/A'}
                  </p>
                  <p>
                    <strong>Quantity:</strong> {item.quantity ?? 0}
                  </p>
                  <p>
                    <strong>Price:</strong> $
                    {item.price?.toFixed(2) ?? '0.00'}
                  </p>
                  <p>
                    <strong>Location:</strong> {item.location || 'Not specified'}
                  </p>
                  <p>
                    <strong>Description:</strong> {item.description || 'No description'}
                  </p>
                  <p>
                    <strong>Created At:</strong>{' '}
                    {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : '—'}
                  </p>
                  <p>
                    <strong>Updated At:</strong>{' '}
                    {item.updatedAt ? new Date(item.updatedAt).toLocaleDateString() : '—'}
                  </p>
                </div>

                <div className="mt-4">
                  <Link
                    to="/inventory"
                    className="text-blue-500 hover:underline block mt-4"
                  >
                    ← Back to Inventory
                  </Link>
                </div>
              </>
            ) : (
              <div className="rounded-md border p-4">No item found.</div>
            )}
          </div>
        )}

        {activeTab === 'Transactions' && !loading && item && (
          <ItemReservationInfo
            itemId={id}
            itemName={item.name}
            status="All"
            itemQuantity={item.quantity}
          />
        )}

        {/* Optional: disabled placeholder for Transactions while loading */}
        {activeTab === 'Transactions' && loading && (
          <div className="p-6 bg-white rounded shadow-md">
            <div className="space-y-3">
              <Skel w="w-1/4" />
              <Skel />
              <Skel />
              <Skel />
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
