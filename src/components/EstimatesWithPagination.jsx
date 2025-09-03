import { useEffect, useState } from 'react';
import ReactPaginate from 'react-paginate';
import { useNavigate, Link } from 'react-router-dom';
import  EstimateFilters from './EstimateFilters';
import { useRealm } from '../context/RealmContext';

export default function EstimatesTableWithPagination() {
  const [estimates, setEstimates] = useState([]);
  const [total, setTotal] = useState(0);            // NEW
  const [currentPage, setCurrentPage] = useState(0); // 0-based
  const [loading, setLoading] = useState(false);
  const limit = 15;

  const { realmId } = useRealm();
  const DEFAULT_FILTERS = { status: "All", dateRange: "This Month" };

  const BASE_URL = import.meta.env.PROD
    ? 'https://inventory-management-server-vue1.onrender.com'
    : 'http://localhost:4000';

  const [filters, setFilters] = useState(() => {
    const saved = sessionStorage.getItem("estimates:filters");
    return saved ? JSON.parse(saved) : DEFAULT_FILTERS;
  });

  useEffect(() => {
    sessionStorage.setItem("estimates:filters", JSON.stringify(filters));
  }, [filters]);

  const loadEstimates = async (page) => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/admin/estimates/filter`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...filters, realmId, page, limit })
      });
      const data = await res.json();

      setEstimates(data.estimates || []);
      setTotal(data.total || 0); // NEW: remember total
    } catch (err) {
      console.error('Failed to load estimates:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // API expects 1-based page; convert from 0-based
    loadEstimates(currentPage + 1);
  }, [currentPage, filters, realmId]);

  // ---- Pager derived values ----
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const start = estimates.length ? currentPage * limit + 1 : 0;
  const end = currentPage * limit + estimates.length;

  const goPrev = () => setCurrentPage((p) => Math.max(0, p - 1));
  const goNext = () => setCurrentPage((p) => Math.min(totalPages - 1, p + 1));

  return (
    <div className="p-4">
      <EstimateFilters
        onFilterChange={(f) => {
          setFilters(f);
          setCurrentPage(0);
        }}
      />

      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          <div className="rounded-xl border overflow-x-auto bg-white">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 sticky top-0">
                <tr className="text-left text-gray-600">
                  <th className="px-3 py-2">Estimate#</th>
                  <th className="px-3 py-2">Customer</th>
                  <th className="px-3 py-2">Txn Date</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {estimates.map((est, idx) => (
                  <tr key={idx} className="border-b">
                    <td className="px-3 py-2">
                      <Link
                        to={`/estimate/details/${est.estimateId}`}
                        className="text-blue-600 hover:underline ml-2"
                      >
                        {est.estimateId}
                      </Link>
                    </td>
                    <td className="px-3 py-2">{est.customerName}</td>
                    <td className="px-3 py-2">
                      {new Date(est.txnDate).toLocaleDateString()}
                    </td>
                    <td className="px-3 py-2">{est.txnStatus || '-'}</td>
                    <td className="px-3 py-2">
                      ${Number(est.totalAmount || 0).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ---- Pager (matches your desired UI) ---- */}
          <div className="mt-4">
            <div className="flex items-center justify-between">
              <div className="text-xs text-gray-500">
                Showing {start}–{end} of {total}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={goPrev}
                  disabled={currentPage <= 0}
                  className="rounded-lg border px-3 py-1.5 disabled:opacity-40"
                >
                  Prev
                </button>
                <span className="text-sm px-1 pt-1.5">
                  {totalPages ? currentPage + 1 : 0} / {totalPages}
                </span>
                <button
                  onClick={goNext}
                  disabled={currentPage >= totalPages - 1}
                  className="rounded-lg border px-3 py-1.5 disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
