import { useEffect, useState } from 'react';
import ReactPaginate from 'react-paginate';
import { useNavigate, Link } from 'react-router-dom';
import  EstimateFilters from './EstimateFilters';
import { useRealm } from '../context/RealmContext';

export default function EstimatesTableWithPagination() {
  const [estimates, setEstimates] = useState([]);
  const [pageCount, setPageCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [filters, setFilters] = useState({});
  const [loading, setLoading] = useState(false);
  const limit = 15; // Number of items per page
    const { realmId } = useRealm();

      const BASE_URL = import.meta.env.PROD
  ? 'https://inventory-management-server-vue1.onrender.com'
  : 'http://localhost:4000';

  useEffect(() => {
    loadEstimates(currentPage + 1);
  }, [currentPage, filters, realmId]);

  const loadEstimates = async (page) => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/admin/estimates/filter`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...filters, realmId, page, limit: 15 })
      });
      const data = await res.json();
      setEstimates(data.estimates || []);
      setPageCount(Math.ceil(data.total / limit));
    } catch (err) {
      console.error('Failed to load estimates:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePageClick = (event) => {
    setCurrentPage(event.selected);
  };

  return (
    <div className="p-4">
      {/* <h2 className="text-xl font-semibold mb-4">Estimates</h2> */}

      <EstimateFilters onFilterChange={(f) => {
        setFilters(f);
        setCurrentPage(0);
      }} />

      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
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
              {estimates.map((est, idx) => (
                <tr key={idx} className="border-b">
                  <td className="px-2 py-1">
                    <Link to={`/estimate/details/${est.estimateId}`} className="text-blue-500 hover:underline ml-2">
                      {est.estimateId}
                    </Link>
                  </td>
                  <td className="px-2 py-1">{est.customerName}</td>
                  <td className="px-2 py-1">
                    {new Date(est.txnDate).toLocaleDateString()}
                  </td>
                  <td className="px-2 py-1">{est.txnStatus || '-'}</td>
                  <td className="px-2 py-1">${est.totalAmount?.toFixed(2)}</td>
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
              pageCount={pageCount}
              forcePage={currentPage}
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
      )}
    </div>
  );
}