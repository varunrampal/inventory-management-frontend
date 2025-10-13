// /web/src/pages/AllotmentsPage.jsx (excerpt)
import React, { useEffect, useMemo, useState } from "react";
import AllotmentsMultiSelect from "../components/AllotmentsMultiSelect";
import { listEmployees, listAllotments, addAllotment, deleteAllotment, listUsers } from "../ApiFunctions/api";
import { useAuth } from "../../context/AuthContext";
import { useRealm } from '../../context/RealmContext';
import Layout from '../../components/Layout';

export default function AllotmentsPage() {
  const { user } = useAuth();
  const isAdmin = user?.roles?.includes("admin");

  const [employees, setEmployees] = useState([]);
  const [supervisors, setSupervisors] = useState([]); // <- supply from Users API in your app
  const [selectedSup, setSelectedSup] = useState("");
  const [rows, setRows] = useState([]); // allotment rows for selected sup
  const { realmId } = useRealm();

  useEffect(() => {
    (async () => {
      if (!isAdmin) return;
    const [emps, sups] = await Promise.all([
      listEmployees({ realmId, active: true }),
      listUsers({ realmId, role: "supervisor" }),
    ]);
    setEmployees(emps);
    setSupervisors(sups);
      if (!selectedSup && sups[0]) setSelectedSup(String(sups[0]._id));
    })();
  }, [realmId, isAdmin]);

  useEffect(() => {
    (async () => {
      if (!selectedSup) return;
      const data = await listAllotments({ realmId, supervisorUserId: selectedSup });
      setRows(data);
    })();
  }, [realmId, selectedSup]);

  const assignedIds = useMemo(() => new Set(rows.map(r => String(r.employeeId))), [rows]);

  async function handleAddMany(ids) {
    // batch create allotments
    await Promise.all(ids.map(id => addAllotment({ realmId, supervisorUserId: selectedSup, employeeId: id })));
    const data = await listAllotments({ realmId, supervisorUserId: selectedSup });
    setRows(data);
  }

  async function handleRemoveMany(ids) {
    const map = new Map(rows.map(r => [String(r.employeeId), r._id])); // employeeId -> allotmentId
    const toDelete = ids.map(id => map.get(String(id))).filter(Boolean);
    await Promise.all(toDelete.map(aid => deleteAllotment(aid, realmId)));
    const data = await listAllotments({ realmId, supervisorUserId: selectedSup });
    setRows(data);
  }

  if (!isAdmin) return <div className="p-6">Forbidden</div>;

  return (
     <Layout>
    <h1 className="text-2xl font-semibold mb-4">Employee Allotment</h1>
    <div className="p-6 space-y-4">
      <div className="flex items-end gap-2">
        <div className="flex flex-col">
          <label className="text-sm text-gray-600">Supervisor</label>
          <select
            className="border rounded px-2 py-2"
            value={selectedSup}
            onChange={(e) => setSelectedSup(e.target.value)}
          >
            {supervisors.map(s => (
              <option key={s._id} value={s._id}>{s.name}</option>
            ))}
          </select>
        </div>
      </div>

      <AllotmentsMultiSelect
        employees={employees}
        assignedIds={assignedIds}
        onAddMany={handleAddMany}
        onRemoveMany={handleRemoveMany}
      />
    </div>
    </Layout>
  );
}
