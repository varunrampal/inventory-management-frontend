import { useEffect, useState, useMemo, useRef } from 'react';
import { useParams, useNavigate } from "react-router-dom";
import { useRealm } from "../context/RealmContext";
import { useReactToPrint } from "react-to-print";
import AssociatedEstimate from '../components/AssociatedEstimate';
import formatQBOAddress from "../helpers/FormatAddress";

export default function PackageDetails({ packageId: propId }) {
 const navigate = useNavigate();
  const [pkg, setPkg] = useState(null);
  const [loading, setLoading] = useState(true);
  const { id: paramId } = useParams();                   // /package/edit/:id
  const idRaw = propId ?? paramId;                       // prefer prop, else route
  const { realmId } = useRealm();
    let companyDetails = {};
  // Handles Mongo shapes: _id or {$oid: "..."}
  const id = useMemo(() => (idRaw?.$oid ?? idRaw ?? null), [idRaw]);
  // const BASE_URL = import.meta.env.PROD
  //   ? 'https://inventory-management-server-vue1.onrender.com'
  //   : 'http://localhost:4000';

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const token = localStorage.getItem('token');

  
  if (realmId === "9341454894464212") {
    companyDetails = {
      name: "Peels Native Plants Ltd.",
      address: "22064 64 Ave, Langley, BC V2Y 2H1",
      phone: "(236) 591-8781",
      email: "info@peelsnativeplants.com",
      website: "www.peelsnativeplants.com",
    };
  } else {
    companyDetails = {
      name: "Green Flow Nurseries Ltd.",
      address: "35444 Hartley Rd, Mission, BC V2V 0A8",
      phone: "(604) 217-1351",
      email: "info@greenflownurseries.com",
      website: "www.greenflownurseries.com",
    };
  }

   const contentRef = useRef(null);
  
    const printNow = useReactToPrint({
      contentRef,                          // <-- v3 API
      documentTitle: "Package",
    });// v3: call with ref later
    const [printData, setPrintData] = useState({ pkg: null, items: [] });
  
   // const shipTo = formatQBOAddress(estimate?.raw?.ShipAddr) || formatQBOAddress(estimate?.raw?.BillAddr);
    // const onPrintClick = (row) => {
    //   // Shape data exactly as PackagePrint expects
    //   const pkgForPrint = {
    //     packageId: row.packageCode,
    //     estimateId: row.estimateId,
    //     shipTo: shipTo,
    //     shipmentDate: row.shipmentDate || row.packageDate,
    //     notes: row.notes,
    //     customerName: estimate.customerName,
    //     driverName: row.driverName,
    //     quantities:row.quantities
    //   };
  
    //   const itemsForPrint = row.lines ?? []; // or fetch items here if not present
  
    //   setPrintData({ pkg: pkgForPrint, items: itemsForPrint });
  
    //   // wait a tick so hidden component re-renders with the new data, then print
    //   setTimeout(() => printNow(contentRef), 0);
    // };
  

  useEffect(() => {

    fetch(`${BASE_URL}/admin/packages/${encodeURIComponent(id)}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      }
    })
      .then(r => r.json())
      .then(d => { setPkg(d); console.log('pckg:', d); })
      .finally(() => setLoading(false));
  }, [id, BASE_URL]);

  if (loading) return <p>Loading…</p>;
  if (!pkg) return <p>Package not found.</p>;

  return (

    <>
      <div>
        <strong> {pkg.packageCode}</strong>
        <AssociatedEstimate estimateId={pkg.estimateId} />
      </div>
      <table className="w-full border text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="border px-2 py-1 text-left">Item</th>
            <th className="border px-2 py-1 text-right">Qty</th>
            {/* <th className="border px-2 py-1 text-right">Rate</th>
            <th className="border px-2 py-1 text-right">Amount</th> */}
          </tr>
        </thead>
        <tbody>
          {pkg.lines.map((l, idx) => (
            <tr key={idx}>
              <td className="border px-2 py-1">{l.name}</td>
              <td className="border px-2 py-1 text-right">{l.quantity}</td>
              {/* <td className="border px-2 py-1 text-right">${Number(l.rate || 0).toFixed(2)}</td>
              <td className="border px-2 py-1 text-right">${Number(l.amount || 0).toFixed(2)}</td> */}
            </tr>
          ))}
        </tbody>
      </table>
          {/* <div style={{ position: "absolute", left: "-99999px", top: 0 }}>
                  {printData.pkg && (
                    <PackagePrint
                      ref={contentRef}
                      company={companyDetails}
                      pkg={printData.pkg}
                      items={printData.items}
                      taxRate={0.05}
                    />
                  )}
                </div> */}
      {/* <div className="mt-4">
            <p className="text-sm">Total Amount: ${Number(pkg.totalAmount || 0).toFixed(2)}</p>
            <Link to={`/edit-package/${pkg.packageId}`} className="text-blue-600 hover:underline">Edit Package</Link>
          </div> */}

            <div className="md:col-span-2 flex items-center justify-end gap-3">
                       

                        <button
                            type="submit"
                              onClick={() => navigate(`/package/edit/${pkg._id }`)}
                            className="rounded-md bg-green-600 px-4 py-2 text-white hover:bg-green-700"
                        >
                          Edit
                        </button>
                        {/* <button
                            onClick={() => onPrintClick(pkg)}
                      
                            className="rounded-md bg-green-600 px-4 py-2 text-white hover:bg-green-700"
                        >
                          Print
                        </button> */}
                        <button
                            type="button"
                            onClick={() => navigate(-1)}
                            className="rounded-md bg-gray-300 px-4 py-2 text-black hover:bg-gray-200"
                        >
                            Cancel
                        </button>
                    </div>
    </>
  );
}