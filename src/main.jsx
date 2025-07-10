import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import AdminDashboard from './pages/AdminDashboard';
import Analytics from './pages/Analytics';
import LowStockItems from './pages/LowStockItems';
import ProtectedRoute from './ProtectedRoute';
import './styles.css';

// function ProtectedRoute({ children }) {
//   const token = localStorage.getItem('token'); // Replace with actual authentication logic
//   return token ? children : <Navigate to="/login"/>;
// }



ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/dashboard" element={<AdminDashboard />} />
      {/* <Route 
        path="/dashboard" element={
          <ProtectedRoute>
            <AdminDashboard />
          </ProtectedRoute>
        } /> */}
      <Route path="/analytics" element={
        <ProtectedRoute>
          <Analytics />
        </ProtectedRoute>
      } />
      <Route path="/lowstockplants" element={
        <ProtectedRoute>
          <LowStockItems />
        </ProtectedRoute>
      } />
      {/* Add more routes as needed */}
    </Routes>
  </BrowserRouter>
);
