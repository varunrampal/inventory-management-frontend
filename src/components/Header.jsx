import React from 'react';
import { useNavigate } from 'react-router-dom';
export default function Header() {
    const navigate = useNavigate();

    const handleLogout = async () => {
  
     localStorage.removeItem('token');
    navigate('/login');
  };
  return (
<header className="bg-gray-800 text-white px-6 py-4 shadow flex justify-between items-center">
  <h1 className="text-xl font-semibold">Inventory Management</h1>

  <button
    onClick={handleLogout}
    className="bg-red-500 hover:bg-red-600 text-white text-sm px-4 py-2 rounded transition"
    aria-label="Logout"
  >
    Logout
  </button>
</header>
  );
}