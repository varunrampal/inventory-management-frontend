import React from 'react';
import { useState, useEffect, useRef} from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import CompanySelector from './CompanySelector';
import logout from '../assets/user-thumbnail.png'; // Adjust the path as necessary

export default function Header() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [realmId, setRealmId] = useState(
    localStorage.getItem('selectedRealmId') || ''
  );
   const [dropdownOpen, setDropdownOpen] = useState(false);
   const dropdownRef = useRef(null);
  const token = localStorage.getItem('token');
  const location = useLocation();
const isEstimateDetailsPage = location.pathname.includes('/estimate/') && location.pathname.includes('/details');
console.log(isEstimateDetailsPage, location.pathname);

  // const BASE_URL = import.meta.env.PROD
  //   ? 'https://inventory-management-server-vue1.onrender.com'
  //   : 'http://localhost:4000';

  const BASE_URL = import.meta.env.VITE_API_BASE_URL;


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
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {

    localStorage.removeItem('token');
    localStorage.removeItem('selectedRealmId');
    navigate('/login');
  };
  return (
    <header className="bg-gray-800 text-gray-800 px-4 py-3 shadow flex justify-between items-center">
      <div className="flex items-center gap-3">
        {/* <img
      src={logo}
      alt="Logo"
      className="w-24 sm:w-28 md:w-32 max-w-[140px] h-auto object-contain"
    /> */}
        <h1 className="text-3xl font-bold">
          <span className="text-orange-500">Inv</span>
          <span className="text-white">Track</span>
        </h1>

  
      </div>

      {/* <button
    onClick={handleLogout}
    className="bg-red-500 hover:bg-red-600 text-white text-sm px-4 py-2 rounded transition"
    aria-label="Logout"
  >
    Logout
  </button> */}

      {/* <div className="flex items-center gap-4">
        <CompanySelector onChange={setRealmId} />
        <button className="bg-red-500 text-white px-4 py-1 rounded" onClick={handleLogout}>Logout</button>
      </div> */}

{/* Right side: Avatar + Dropdown */}
      <div className="relative flex items-center gap-4" ref={dropdownRef}>
<CompanySelector disabled={isEstimateDetailsPage} onChange={setRealmId} />

        <img
          src={logout}
          alt="Avatar"
          className="h-10 w-10 rounded-full border border-gray-300 cursor-pointer hover:shadow"
          onClick={() => setDropdownOpen((prev) => !prev)}
        />

        {dropdownOpen && (
          <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 shadow-lg rounded-md z-50">
            <ul className="py-1 text-sm text-gray-700">
              <li>
                <a
                  href="/settings"
                  className="block px-4 py-2 hover:bg-gray-100"
                >
                  Settings
                </a>
              </li>
              <li>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100"
                >
                  Logout
                </button>
              </li>
            </ul>
          </div>
        )}
      </div>
    </header>
  );
}