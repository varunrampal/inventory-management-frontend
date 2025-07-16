export default function Sidebar() {
  return (
    <aside className="bg-gray-100 p-4 w-64 min-h-screen">
      <nav>
        <ul className="space-y-2">
          <li><a href="/dashboard" className="text-blue-600">Dashboard</a></li>
           <li><a href="/inventory" className="text-blue-600">Inventory</a></li>
          <li><a href="/lowstockplants" className="text-blue-600">Low Stock Plants</a></li>
          <li><a href="/analytics" className="text-blue-600">Analytics</a></li>
        </ul>
      </nav>
    </aside>
  );
}