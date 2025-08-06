import { useState } from 'react';
import logo from '../assets/logo.png';

export default function SlidingSidebar({ handleLogout }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="relative min-h-screen flex">

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-white shadow-lg z-40 transform transition-transform duration-300 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <img src={logo} alt="Logo" className="h-8 w-auto" />
          <button onClick={() => setSidebarOpen(false)} className="text-gray-600 text-xl">✕</button>
        </div>

        <ul className="p-4 space-y-3 text-sm">
          <li><a href="/dashboard" className="block hover:text-blue-600">Dashboard</a></li>
          <li><a href="/items" className="block hover:text-blue-600">Items</a></li>
          <li><a href="/analytics" className="block hover:text-blue-600">Analytics</a></li>
          <li>
            <button
              onClick={handleLogout}
              className="text-left text-red-600 font-medium w-full"
            >
              Logout
            </button>
          </li>
        </ul>
      </div>

      {/* Page content */}
      <div className="flex-1 flex flex-col w-full">
        {/* Top header */}
        <header className="bg-gray-100 text-gray-800 px-4 py-3 shadow flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Hamburger button always visible */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-gray-700 focus:outline-none"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d={
                    sidebarOpen
                      ? 'M6 18L18 6M6 6l12 12'
                      : 'M4 6h16M4 12h16M4 18h16'
                  }
                />
              </svg>
            </button>
            <h1 className="text-lg font-semibold">Inventory Management</h1>
          </div>
        </header>

        {/* Main content area */}
        <main className="p-6">
          <p>This is your main content area.</p>
        </main>
      </div>

      {/* Optional backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-25 z-30"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}
