import { useEffect, useState } from 'react';
import ReactPaginate from 'react-paginate';
import { useRealm } from '../context/RealmContext';

export default function TableWithPagination({ fetchData }) {
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState('');
  const [pageCount, setPageCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [limit] = useState(10);
   const { realmId } = useRealm();
 
  useEffect(() => {
    loadData(currentPage);
  }, [currentPage, search, realmId]);

  const loadData = async (selectedPage) => {
    const res = await fetchData({ page: selectedPage + 1, limit, search, realmId });
    console.log(res);
    setItems(res.items);
    setPageCount(Math.ceil(res.total / limit));
  };

  const handlePageClick = ({ selected }) => {
    setCurrentPage(selected);
  };


  return (
    <div className="p-4">
      {/* <input
        type="text"
        placeholder="Search item..."
        className="border px-2 py-1 mb-4 w-full"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      /> */}


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
            <th className="p-3 text-left">Name</th>
            <th className="p-3 text-left">SKU</th>
            <th className="p-3 text-left">Category</th>
            <th className="p-3 text-left">Quantity</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, idx) => (
            <tr key={idx} className="border-t">
              <td className="p-3">{item.name}</td>
              <td className="p-3">{item.sku}</td>
              <td className="p-3">{item.category}</td>
              <td className="p-3">{item.quantity}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-4 flex justify-center">
        {/* <ReactPaginate
          previousLabel={'←'}
          nextLabel={'→'}
          breakLabel={'...'}
          breakClassName={'break-me'}
          pageCount={pageCount}
          marginPagesDisplayed={1}
          pageRangeDisplayed={5}
          onPageChange={handlePageClick}
          containerClassName={'pagination flex gap-2'}
          activeClassName={'font-bold'}
        /> */}


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
    </div>
  );
}
