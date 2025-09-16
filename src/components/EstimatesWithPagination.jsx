import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import EstimateFilters from './EstimateFilters';
import { useRealm } from '../context/RealmContext';

export default function EstimatesTableWithPagination() {
  const [estimates, setEstimates] = useState([]);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(0); // 0-based
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const limit = 15;
  const { realmId } = useRealm();
  const BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const DEFAULT_FILTERS = { status: 'All', dateRange: 'This Month' };
  const [filters, setFilters] = useState(() => {
    const saved = sessionStorage.getItem('estimates:filters');
    return saved ? JSON.parse(saved) : DEFAULT_FILTERS;
  });

  useEffect(() => {
    sessionStorage.setItem('estimates:filters', JSON.stringify(filters));
  }, [filters]);

  // Thin loading bar (indeterminate)
  const LoadingBar = () =>
    loading ? (
      <div className="h-0.5 w-full overflow-hidden bg-gray-200 rounded">
        <div className="h-full w-1/3 bg-blue-500/70 animate-pulse rounded" />
      </div>
    ) : null;

  // Skeleton pieces
  const Skel = ({ w = 'w-full', h = 'h-4' }) => (
    <div className={`${h} ${w} rounded bg-gray-200/80 animate-pulse`} />
  );

  // Column widths (keep these in sync with your table content)
  const COL = {
    estNo: 'w-24',     // Estimate#
    cust: 'w-56',      // Customer
    date: 'w-24',      // Date
    status: 'w-20',    // Status
    total: 'w-24',     // Total
  };

  const SkeletonTable = () => (
    <div className="rounded-xl border overflow-x-auto bg-white">
      {/* header */}
      <div className="bg-gray-50 sticky top-0">
        <div className="grid grid-cols-5">
          <div className="px-3 py-2"><Skel w={COL.estNo} /></div>
          <div className="px-3 py-2"><Skel w={COL.cust} /></div>
          <div className="px-3 py-2"><Skel w={COL.date} /></div>
          <div className="px-3 py-2"><Skel w={COL.status} /></div>
          <div className="px-3 py-2"><Skel w={COL.total} /></div>
        </div>
      </div>
      {/* rows */}
      <div>
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="grid grid-cols-5 border-t">
            <div className="px-3 py-2"><Skel w={COL.estNo} /></div>
            <div className="px-3 py-2">
              {/* vary a bit so it feels natural */}
              <Skel w={i % 2 ? 'w-64' : COL.cust} />
            </div>
            <div className="px-3 py-2"><Skel w={COL.date} /></div>
            <div className="px-3 py-2"><Skel w={COL.status} /></div>
            <div className="px-3 py-2"><Skel w={COL.total} /></div>
          </div>
        ))}
      </div>
    </div>
  );

  // --- Data loader with cleanup ---
  useEffect(() => {
    if (!realmId) return;
    const controller = new AbortController();
    const load = async (page) => {
      setLoading(true);
      setError('');
      try {
        const res = await fetch(`${BASE_URL}/admin/estimates/filter`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...filters, realmId, page, limit }),
          signal: controller.signal,
        });
        if (!res.ok) throw new Error('Failed to load estimates');
        const data = await res.json();
        setEstimates(data.estimates || []);
        setTotal(data.total || 0);
      } catch (err) {
        if (err.name !== 'AbortError') setError(err.message || 'Something went wrong');
      } finally {
        setLoading(false);
      }
    };
    // API expects 1-based page; convert from 0-based
    load(currentPage + 1);
    return () => controller.abort();
  }, [currentPage, filters, realmId, BASE_URL]);

  // Derived
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const start = estimates.length ? currentPage * limit + 1 : 0;
  const end = currentPage * limit + estimates.length;

  const goPrev = () => setCurrentPage((p) => Math.max(0, p - 1));
  const goNext = () => setCurrentPage((p) => Math.min(totalPages - 1, p + 1));

  const formatDate = (d) => {
    if (!d) return '—';
    const ts = new Date(d);
    return Number.isNaN(ts.getTime()) ? d : ts.toLocaleDateString();
    // If server already formats yyyy-mm-dd, just return d
  };

  return (
    <div className="p-4 space-y-3">
      <EstimateFilters
        onFilterChange={(f) => {
          setFilters(f);
          setCurrentPage(0);
        }}
      />

      {/* Loading bar + error */}
      <LoadingBar />
      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <SkeletonTable />
      ) : (
        <>
          <div className="rounded-xl border overflow-x-auto bg-white">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 sticky top-0">
                <tr className="text-left text-gray-600">
                  <th className="px-3 py-2">Estimate#</th>
                  <th className="px-3 py-2">Customer</th>
                  <th className="px-3 py-2">Date</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {estimates.length === 0 ? (
                  <tr>
                    <td className="px-3 py-6 text-center text-gray-500" colSpan={5}>
                      No estimates found.
                    </td>
                  </tr>
                ) : (
                  estimates.map((est, idx) => (
                    <tr key={idx} className="border-b">
                      <td className="px-3 py-2">
                        <Link
                          to={`/estimate/details/${est.raw?.DocNumber ?? ''}`}
                          className="text-blue-600 hover:underline ml-2"
                        >
                          {est.raw?.DocNumber ?? '—'}
                        </Link>
                      </td>
                      <td className="px-3 py-2">{est.customerName || '—'}</td>
                      <td className="px-3 py-2">{formatDate(est.txnDate)}</td>
                      <td className="px-3 py-2">{est.txnStatus || '—'}</td>
                      <td className="px-3 py-2">
                        ${Number(est.totalAmount || 0).toFixed(2)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pager */}
          <div className="mt-4">
            <div className="flex items-center justify-between">
              <div className="text-xs text-gray-500">
                Showing {start}–{end} of {total}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={goPrev}
                  disabled={loading || currentPage <= 0}
                  className="rounded-lg border px-3 py-1.5 disabled:opacity-40"
                >
                  Prev
                </button>
                <span className="text-sm px-1 pt-1.5">
                  {totalPages ? currentPage + 1 : 0} / {totalPages}
                </span>
                <button
                  onClick={goNext}
                  disabled={loading || currentPage >= totalPages - 1}
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
