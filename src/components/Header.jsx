import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import CompanySelector from "./CompanySelector";
import logout from "../assets/user-thumbnail.png"; // Adjust the path as necessary

export default function Header({ onMenuClick }) {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false); // kept if you want to expand later
  const [realmId, setRealmId] = useState(
    localStorage.getItem("selectedRealmId") || ""
  );
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const token = localStorage.getItem("token");
  const location = useLocation();
  const isEstimateDetailsPage =
    location.pathname.includes("/estimate/") &&
    location.pathname.includes("/details");
  console.log(isEstimateDetailsPage, location.pathname);

  // const BASE_URL = import.meta.env.PROD
  //   ? "https://inventory-management-server-vue1.onrender.com"
  //   : "http://localhost:4000";

  const BASE_URL = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    if (!token || !realmId) return;
    fetch(`${BASE_URL}/admin/inventory/${realmId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("Inventory:", data);
      })
      .catch((err) => console.error("Fetch error:", err));
  }, [realmId, token, BASE_URL]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    localStorage.removeItem("token");
    localStorage.removeItem("selectedRealmId");
    navigate("/login");
  };

  // Optional: derive a simple page title from the route
  const pageTitle =
    location.pathname === "/"
      ? "Dashboard"
      : location.pathname
          .replace(/^\//, "")
          .split("/")[0]
          .replace(/-/g, " ")
          .replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <header className="sticky top-0 z-30 bg-gray-800 text-white px-4 py-3 shadow border-b border-gray-700">
      <div className="flex items-center justify-between gap-3">
        {/* Left: Hamburger + Branding + Page title */}
        <div className="flex items-center gap-3">
          {/* Mobile hamburger */}
          <button
            onClick={onMenuClick}
            className="lg:hidden inline-flex items-center justify-center rounded-md border border-gray-600 px-3 py-2 text-sm hover:bg-gray-700"
            aria-label="Toggle navigation"
          >
            <svg
              viewBox="0 0 24 24"
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          {/* Logo + Brand */}
          <Link to="/dashboard" className="flex items-center gap-2">
            {/* If you have a file at /public/logo.png, uncomment: */}
            {/* <img src="/logo.png" alt="Logo" className="h-8 w-auto hidden sm:block" /> */}
            <h1 className="text-2xl sm:text-3xl font-bold leading-none">
              <span className="text-orange-500">Inv</span>
              <span className="text-white">Track</span>
            </h1>
          </Link>

          {/* Divider + Page title (hidden on small screens) */}
          <span className="hidden md:inline-block text-gray-400">/</span>
          <span className="hidden md:inline-block text-sm text-gray-200">
            {pageTitle}
          </span>
        </div>

        {/* Right: Company selector + Avatar dropdown */}
        <div className="relative flex items-center gap-3" ref={dropdownRef}>
          <CompanySelector
            disabled={isEstimateDetailsPage}
            onChange={setRealmId}
          />

          <img
            src={logout}
            alt="Avatar"
            className="h-10 w-10 rounded-full border border-gray-300 cursor-pointer hover:shadow"
            onClick={() => setDropdownOpen((prev) => !prev)}
          />

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-44 bg-white border border-gray-200 shadow-lg rounded-md z-50">
              <ul className="py-1 text-sm text-gray-700">
                <li>
                  <Link
                    to="/settings"
                    className="block px-4 py-2 hover:bg-gray-100"
                    onClick={() => setDropdownOpen(false)}
                  >
                    Settings
                  </Link>
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
      </div>
    </header>
  );
}
