import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Layout from '../components/Layout';

// This component fetches and displays details of a specific item
// based on the ID from the URL parameters.
export default function ItemDetails() {
    const BASE_URL = import.meta.env.PROD
  ? 'https://inventory-management-server-vue1.onrender.com'
  : 'http://localhost:4000';
    const { id } = useParams();
    const [item, setItem] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const tabs = ['Overview', 'Transactions'];
    const [activeTab, setActiveTab] = useState('Overview');

    useEffect(() => {
        const fetchItem = async () => {
            try {
                setLoading(true);
                setError('');
                console.log(`Fetching item with ID: ${id}`);
                if (!id) throw new Error('Item ID is required');
                const response = await fetch(`${BASE_URL}/admin/items/${id}`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                });
                if (!response.ok) throw new Error('Failed to fetch item details');
                const data = await response.json();
                setItem(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchItem();
    }, [id]);

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;
    if (!item) return <div>No item found.</div>;

    return (

 <Layout>
      <h1 className="text-2xl font-semibold mb-4">Item</h1>

      {/* Tab Menu */}
      <div className="flex gap-4 border-b mb-6">
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-2 border-b-2 text-sm font-medium ${
              activeTab === tab
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
        {activeTab === 'Overview' && <div className="p-6 bg-white rounded shadow-md">
  <h2 className="text-2xl font-semibold mb-4">{item.name || 'Unnamed Item'}</h2>

  <div className="space-y-2 text-gray-700">
    <p><strong>Category:</strong> {item.category || 'N/A'}</p>
    <p><strong>SKU:</strong> {item.sku || 'N/A'}</p>
    <p><strong>Quantity:</strong> {item.quantity ?? 0}</p>
    <p><strong>Price:</strong> ${item.price?.toFixed(2) ?? '0.00'}</p>
    <p><strong>Location:</strong> {item.location || 'Not specified'}</p>
    <p><strong>Description:</strong> {item.description || 'No description'}</p>
    <p><strong>Created At:</strong> {new Date(item.createdAt).toLocaleDateString()}</p>
    <p><strong>Updated At:</strong> {new Date(item.updatedAt).toLocaleDateString()}</p>
    
  </div>
  <div className="mt-4">
    <Link to="/dashboard" className="text-blue-500 hover:underline block mt-4">← Back to Inventory</Link>
  </div>
</div>
}
        {activeTab === 'Transactions' && <p>Transaction list goes here</p>}
      </div>
    </Layout>

        
    );
};

