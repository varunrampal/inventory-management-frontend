import React from 'react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CompanySelector from './CompanySelector';  
export default function Header() {
    const navigate = useNavigate();
    const [realmId, setRealmId] = useState(
    localStorage.getItem('selectedRealmId') || ''
  );
  const token = localStorage.getItem('token');
 const BASE_URL = import.meta.env.PROD
  ? 'https://inventory-management-server-vue1.onrender.com'
  : 'http://localhost:4000';


  useEffect(() => {
    if (!token || !realmId) return;

    fetch(`${BASE_URL}/admin/inventory/${realmId}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((res) => res.json())
      .then((data) => {
        console.log('Inventory:', data);
        // setInventory(data);
      })
      .catch((err) => console.error('Fetch error:', err));
  }, [realmId, token, BASE_URL]);

    const handleLogout = async () => {
  
     localStorage.removeItem('token');
     localStorage.removeItem('selectedRealmId');
    navigate('/login');
  };
  return (
<header className="bg-gray-800 text-white px-6 py-4 shadow flex justify-between items-center">
  <h1 className="text-xl font-semibold">Inventory Management</h1>

  {/* <button
    onClick={handleLogout}
    className="bg-red-500 hover:bg-red-600 text-white text-sm px-4 py-2 rounded transition"
    aria-label="Logout"
  >
    Logout
  </button> */}

   <div className="flex items-center gap-4">
        <CompanySelector onChange={setRealmId}/>
        <button className="bg-red-500 text-white px-4 py-1 rounded" onClick={handleLogout}>Logout</button>
      </div>
</header>
  );
}