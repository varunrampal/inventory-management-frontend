import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import ItemReservationInfo from '../components/ItemReservationInfo';
import { useRealm } from '../context/RealmContext';
import AssociatedPkgAndInvAccordion from '../components/AssociatedPkgAndInvAccordion';
import ItemsAccordion from '../components/ItemsAccordion';
import WhatsNextCard from '../components/WhatsNextCard';

// This component fetches and displays details of a specific estimate
// based on the ID from the URL parameters.
export default function EstimateDetails() {
    
    // const BASE_URL = import.meta.env.PROD
    //     ? 'https://inventory-management-server-vue1.onrender.com'
    //     : 'http://localhost:4000';

    const BASE_URL = import.meta.env.VITE_API_BASE_URL;

    const { estimateId } = useParams();
    const [estimate, setEstimate] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showItems, setShowItems] = useState(false);
    const { realmId } = useRealm();
    const navigate = useNavigate();

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
                console.log('Fetched estimate details:', data.estimate);
                if (!data) throw new Error('No estimate data found');
                setEstimate(data.estimate);
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
                    {/* <div className="flex justify-end">
                        <button
                            onClick={() => navigate(`/create-package/${estimate.estimateId}`)}
                            className="bg-orange-600 text-white px-2 py-1 rounded hover:bg-gray-700"
                        >
                            Create Package
                        </button>
                    </div> */}
                    <WhatsNextCard    
  onConvert={(type) => {
    if (type === "package")  navigate(`/create-package/${estimateId}`);
    if (type === "shipment") navigate(`/create-shipment/${estimateId}`);
    if (type === "invoice")  navigate(`/create-invoice/${estimateId}`);
  }}
  onCreatePackage={() => navigate(`/create-package/${estimateId}`)}
/>
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

                </div>
                {/* <div className="flex justify-end">
                    <button
                        onClick={() => setShowItems(!showItems)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-blue-600 border border-blue-200 rounded-md hover:bg-blue-50 hover:border-blue-300 transition-colors"
                    >
                        {showItems ? "Hide Items" : "Show Items"}
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            className={`w-4 h-4 transition-transform duration-200 ${showItems ? 'rotate-180' : ''}`}
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                        </svg>
                    </button>
                </div> */}

            </div>
            <div className="mt-6 space-y-6">
                <div>
     <ItemsAccordion
                    items={estimate.items || []}
                    totalAmount={estimate.totalAmount} // optional
                    estimateId={estimate.estimateId}
                    defaultOpen={true}
                />

                </div>
           

                <div>
                    <AssociatedPkgAndInvAccordion
                        estimateId={estimate.estimateId}
                        packages={estimate.packages || []}
                        estimate = {estimate}
                        // invoices={estimate.invoices || []}
                        defaultOpen=""
                    />

                </div>
                <div className="mt-4">
                    <Link to="/estimates" className="text-blue-500 hover:underline block mt-4">← Back to Estimates</Link>
                </div>

            </div>

        </Layout>

    );
};

