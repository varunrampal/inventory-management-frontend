import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Layout from '../components/Layout';
import ItemReservationInfo from '../components/ItemReservationInfo';
import { useRealm } from '../context/RealmContext';

// This component fetches and displays details of a specific estimate
// based on the ID from the URL parameters.
export default function EstimateDetails() {
    const BASE_URL = import.meta.env.PROD
        ? 'https://inventory-management-server-vue1.onrender.com'
        : 'http://localhost:4000';
    const { estimateId } = useParams();
    const [estimate, setEstimate] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showItems, setShowItems] = useState(false);
    const { realmId } = useRealm();

    useEffect(() => {
        const fetchEstimate = async () => {
            try {
                setLoading(true);
                setError('');

                if (!estimateId && !realmId) throw new Error('Estimate ID and Realm ID are required');
                const response = await fetch(`${BASE_URL}/admin/estimates/details/${estimateId}/${realmId}`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                });
                if (!response.ok) throw new Error('Failed to fetch estimate details');
                const data = await response.json();
                console.log('Fetched estimate details:', data.estimate[0].estimateId);
                if (!data) throw new Error('No estimate data found');
                setEstimate(data.estimate[0]);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchEstimate();
    }, [estimateId, realmId]);


    const toggleItems = (index) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;
    if (!estimate) return <div>No estimate found.</div>;

    return (

        <Layout>
            <h1 className="text-2xl font-semibold mb-4">Estimate Details</h1>

            <div>
                {/* {activeTab === 'Overview' && <div className="p-6 bg-white rounded shadow-md"> */}

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
                                <td className="px-2 py-1">{estimate.estimateId}</td>
                                <td className="px-2 py-1">{estimate.customerName || 'N/A'}</td>
                                <td className="px-2 py-1">{estimate.txnDate || 'N/A'}</td>
                                <td className="px-2 py-1">{estimate.txnStatus || 'N/A'}</td>
                                <td className="px-2 py-1">{'$' + (estimate.totalAmount?.toFixed(2) ?? '0.00')}</td>
                            </tr>
                        </tbody>
                    </table>
                    <button
                        onClick={() => setShowItems(!showItems)}
                        className="text-blue-600 hover:underline"
                    >
                        {showItems ? "Hide Items" : "Show Items"}
                    </button>

                </div>
                {showItems && (
                    <div className="mt-4 overflow-x-auto">
                        <table className="min-w-full border-collapse border border-gray-300">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="border border-gray-300 px-4 py-2 text-left">Item Name</th>
                                    <th className="border border-gray-300 px-4 py-2 text-right">Quantity</th>
                                    <th className="border border-gray-300 px-4 py-2 text-right">Rate</th>
                                    <th className="border border-gray-300 px-4 py-2 text-right">Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                {estimate.items.map((item, index) => (
                                    <tr key={index} className="hover:bg-gray-50">
                                        <td className="border border-gray-300 px-4 py-2">{item.name}</td>
                                        <td className="border border-gray-300 px-4 py-2 text-right">{item.quantity}</td>
                                        <td className="border border-gray-300 px-4 py-2 text-right">${item.rate.toFixed(2)}</td>
                                        <td className="border border-gray-300 px-4 py-2 text-right">${item.amount.toFixed(2)}</td>
                                    </tr>
                                ))}
                                <tr className="font-semibold bg-gray-100">
                                    <td colSpan="3" className="border border-gray-300 px-4 py-2 text-right">Total:</td>
                                    <td className="border border-gray-300 px-4 py-2 text-right">${estimate.totalAmount.toFixed(2)}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                )}
            </div>            <div className="mt-6">

                <div className="mt-4">
                    <Link to="/estimates" className="text-blue-500 hover:underline block mt-4">← Back to Estimates</Link>
                </div>
            </div>

        </Layout>

    );
};

