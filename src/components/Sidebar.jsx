export default function Sidebar() {
  return (
    <aside className="bg-gray-800 p-4 w-64 min-h-screen">
      <nav>
        <ul className="space-y-2">
          <li><a href="/dashboard" className="text-white">Dashboard</a></li>
           <li><a href="/inventory" className="text-white">Inventory</a></li>
           <li><a href="/estimates" className="text-white">Estimates</a></li>
          <li><a href="/lowstockplants" className="text-white">Low Stock Plants</a></li>
          {/* <li><a href="/analytics" className="text-white">Analytics</a></li> */}
          <li><a href="/sync" className="text-white">Sync Quickbooks</a></li>
        </ul>
      </nav>
    </aside>
  );
}