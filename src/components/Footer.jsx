// src/components/Footer.jsx
import React from "react";
import { Link } from "react-router-dom";
import logo from "../assets/logo.png"; // adjust path if logo.png is elsewhere

export default function Footer() {
  return (
    <footer className="border-t mt-10 py-4 px-6 flex flex-col sm:flex-row items-center justify-between text-sm text-gray-500">
      {/* Left side: logo & company */}
      <div className="flex items-center space-x-2 mb-2 sm:mb-0">
       
        <span>&copy; {new Date().getFullYear()} Green Flow Nurseries Ltd</span>
      </div>

      {/* Right side: links */}
      <div className="space-x-4">
        <Link to="/privacy" className="hover:underline">
          Privacy Policy
        </Link>
        <Link to="/eula" className="hover:underline">
          End-User License Agreement
        </Link>
      </div>
    </footer>
  );
}
