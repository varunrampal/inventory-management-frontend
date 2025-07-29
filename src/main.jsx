import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import LoginPage from './pages/LoginPage';
import AdminDashboard from './pages/AdminDashboard';
import Analytics from './pages/Analytics';
import LowStockItems from './pages/LowStockItems';
import ItemDetails from './pages/ItemDetails';
import Inventory from './pages/Inventory';
import SyncQuickbooks from './pages/SyncQuickbooks';
import Tab from './pages/Tab';
import ProtectedRoute from './ProtectedRoute';
import { RealmProvider } from './context/RealmContext';
import './styles.css';

// function ProtectedRoute({ children }) {
//   const token = localStorage.getItem('token'); // Replace with actual authentication logic
//   return token ? children : <Navigate to="/login"/>;
// }



ReactDOM.createRoot(document.getElementById('root')).render(
  <>
  <RealmProvider>
  <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} closeOnClick pauseOnHover draggable pauseOnFocusLoss /> 
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/login" element={<LoginPage />} />
      {/* <Route path="/dashboard" element={<AdminDashboard />} /> */}
      <Route 
        path="/dashboard" element={
          <ProtectedRoute>
            <AdminDashboard />
          </ProtectedRoute>
        } />
        <Route 
        path="/inventory" element={
          <ProtectedRoute>
            <Inventory />
          </ProtectedRoute>
        } />
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

      <Route path="/items/:id" element={
        <ProtectedRoute>
          <ItemDetails />
        </ProtectedRoute>
      } />

      <Route path="/tab" element={
        <ProtectedRoute>
          <Tab />
        </ProtectedRoute>
      } />
     <Route 
        path="/sync" element={
          <ProtectedRoute>
            <SyncQuickbooks />
          </ProtectedRoute>
        } />
    </Routes>
  </BrowserRouter>
  </RealmProvider>
  </>
);
