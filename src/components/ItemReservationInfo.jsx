import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import ReactPaginate from 'react-paginate';
import EstimateFilters from './EstimateFilters';
import { useRealm } from '../context/RealmContext';


// export default function ItemReservationInfo({ itemName, status = '' }) {
export default function ItemReservationInfo({ itemId, itemName,status = '', itemQuantity }) {
 const [data, setData] = useState({ details: [], totalPages: 1, page: 1 });
  const [loading, setLoading] = useState(true);
  const { realmId } = useRealm();
  const token = localStorage.getItem('token')
  const [filters, setFilters] = useState({
    status: 'All',
    dateRange: 'This Month',
    customStartDate: null,
    customEndDate: null
  });

     const BASE_URL = import.meta.env.PROD
  ? 'https://inventory-management-server-vue1.onrender.com'
  : 'http://localhost:4000';

  const fetchData = async (page = 1) => {
    const res = await fetch(`${BASE_URL}/admin/estimates/item-by-name/filter`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ ...filters, itemName, realmId,page, limit: 15 })
    });
     const json = await res.json();

     console.log('Fetched reservation data:', json);
    setData({ ...json, page });
    // }).then(res => res.json())
    // .then(res => {
    //   console.log('Fetched reservation data:', res);
    //   setData({ ...res, page });
    //   setLoading(false);
    // })
    // .catch(() => {
    //   setData(null);
    //   setLoading(false);
    // });

  };
  useEffect(() => {
     if (!token || !realmId) {
      navigate('/login');
      return;
    }
    fetchData(1);
     setLoading(false);
  }, [filters]);
//  }, [itemName, status]);
  const handlePageClick = (selectedItem) => {
    fetchData(selectedItem.selected + 1);
  };

//if (!itemName) return <p className="text-gray-400">No item selected</p>;
  if (!itemId) return <p className="text-gray-400">No item selected</p>;
  if (loading) return <p>Loading transaction info...</p>;
  if (!data) return <p className="text-red-500">Failed to fetch transaction data.</p>;

  return (
 <div className="bg-white border rounded p-4 shadow max-w-5xl mx-auto">
      <h2 className="text-2xl font-semibold mb-4">{itemName || 'Unnamed Item'}</h2>
   {import.meta.env.VITE_DEFAULT_INVENTORY_TYPE=== 'estimates' && (
  <EstimateFilters onFilterChange={setFilters} />
)}
     
<div className="flex justify-end items-center space-x-6 mb-4">
  <p><strong>In Stock:</strong> {itemQuantity ?? 0}</p>
  <p><strong>Total Reserved:</strong> {data?.totalReserved ?? 0}</p>
</div>


      {data.details.length > 0 ? (
        <>
          <table className="w-full text-sm text-left text-gray-700 border mt-4">
            <thead className="bg-gray-100">
              <tr>
                <th className="py-2 px-3 border">#</th>
                <th className="py-2 px-3 border">Estimate ID</th>
                <th className="py-2 px-3 border">Customer</th>
                <th className="py-2 px-3 border">Quantity</th>
                <th className="py-2 px-3 border">Txn Date</th>
              </tr>
            </thead>
            <tbody>
              {data.details.map((est, idx) => (
                <tr key={idx} className="border-t">
                  <td className="py-1 px-3">{(data.page - 1) * 5 + idx + 1}</td>
                  <td className="py-1 px-3">{est.estimateId}</td>
                  <td className="py-1 px-3">{est.customerName}</td>
                  <td className="py-1 px-3">{est.quantity}</td>
                  <td className="py-1 px-3">{new Date(est.txnDate).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="mt-4 flex justify-center">
            <ReactPaginate
              previousLabel="← Prev"
              nextLabel="Next →"
              breakLabel="..."
              onPageChange={handlePageClick}
              pageCount={data.totalPages}
              forcePage={data.page - 1}
              marginPagesDisplayed={1}
              pageRangeDisplayed={3}
              containerClassName="flex gap-2 text-sm"
              pageClassName="px-3 py-1 border rounded"
              activeClassName="bg-blue-500 text-white"
              previousClassName="px-3 py-1 border rounded"
              nextClassName="px-3 py-1 border rounded"
              disabledClassName="opacity-50 cursor-not-allowed"
            />
          </div>
        </>
      ) : (
        <p className="text-sm text-gray-500 mt-2">No transaction found.</p>
      )}
    </div>
  );
}
