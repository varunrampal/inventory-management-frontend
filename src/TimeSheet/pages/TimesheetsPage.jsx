import React, { useRef } from "react";
import Layout from "../../components/Layout";
import TimesheetGrid from "../components/TimesheetGrid";
import { utils, writeFile } from "xlsx";
import { useReactToPrint } from "react-to-print";
import { useRealm } from '../../context/RealmContext';


export default function TimesheetsPage() {
const gridRef = useRef();
const { realmId } = useRealm();


const onExport = () => {
// Simple demo export: read inputs and create a single-row sheet
const inputs = document.querySelectorAll("table input[type='number']");
const days = Array.from(inputs).map(i => Number(i.value || 0));
const ws = utils.aoa_to_sheet([[...days, days.reduce((a,b)=>a+b,0)]]);
const wb = utils.book_new();
utils.book_append_sheet(wb, ws, "Week");
writeFile(wb, `timesheet-week.xlsx`);
};


const onPrint = useReactToPrint({ content: () => gridRef.current });


return (
     <Layout>
<div className="p-6 space-y-4">
{/* <div className="flex gap-2 items-center">
<button className="px-3 py-2 border rounded" onClick={onExport}>Export CSV/XLSX</button>
<button className="px-3 py-2 border rounded" onClick={onPrint}>Print</button>
</div> */}
<h1 className="text-xl font-semibold">Time Sheet</h1>

<div ref={gridRef} className="print:p-4 print:text-black">
<TimesheetGrid realmId={realmId} />
</div>
</div>
</Layout>
);
}