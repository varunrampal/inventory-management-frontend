import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import LoginPage from './pages/LoginPage';
import AdminDashboard from './pages/AdminDashboard';
import Connect from './pages/ConnectQB';
import Analytics from './pages/Analytics';
import LowStockItems from './pages/LowStockItems';
import ItemDetails from './pages/ItemDetails';
import Inventory from './pages/Inventory';
import SyncQuickbooks from './pages/SyncQuickbooks';
import Tab from './pages/Tab';
import ProtectedRoute from './ProtectedRoute';
import { RealmProvider } from './context/RealmContext';
import './styles.css';
import EstimatesList from './pages/EstimatesList';
import EstimateDetails from './pages/EstimateDetails';
import CreatePackage from './pages/CreatePackage';
import PackageDetailsPage from './pages/PackageDetailsPage';
import EditPackagePage from './pages/EditPackagePage';
import PackagesPage from './pages/PackagesPage';
import Eula from './pages/Eula';
import Privacy from './pages/Privacy';
import QuickBooksConnected from './pages/QuickBooksConnected';
import ShippingSchedulePage from './pages/ShippingSchedulePage';


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
          <Route 
        path="/sync/:realmId" element={
          <ProtectedRoute>
            <SyncQuickbooks />
          </ProtectedRoute>
        } />
        <Route path="/estimates" element={
          <ProtectedRoute>
            <EstimatesList/>
          </ProtectedRoute>
        } />
        <Route path="/estimates/:estimateId" element={
          <ProtectedRoute>
            <EstimatesList />
          </ProtectedRoute>
        } />
      <Route path="/estimate/details/:DocNumber" element={
        <ProtectedRoute>
          <EstimateDetails />
        </ProtectedRoute>
      } />
      <Route path="/create-package/:estimateId" element={
        <ProtectedRoute>
          <CreatePackage />
        </ProtectedRoute>
      } />
      <Route path="/package/details/:id" element={
        <ProtectedRoute>
          <PackageDetailsPage />
        </ProtectedRoute>
      } />
      <Route path="/package/edit/:id" element={
        <ProtectedRoute>
          <EditPackagePage />
        </ProtectedRoute>
      } />
      <Route path='/packages' element={
        <ProtectedRoute>
          <PackagesPage />
        </ProtectedRoute>
      } />
      <Route
        path="/connect-qb"
        element={
          <ProtectedRoute>
            <Connect />
          </ProtectedRoute>
        }
      />
      <Route
  path="/qb-connected"
  element={
    <ProtectedRoute>
      <QuickBooksConnected />
    </ProtectedRoute>
  }
/>
      <Route
        path="/qb-connected/:realmId"
        element={
          <ProtectedRoute>
            <QuickBooksConnected />
          </ProtectedRoute>
        }
      />
        <Route path="/shippingschedule" element={
        <ProtectedRoute>
          <ShippingSchedulePage />
        </ProtectedRoute>
      } />
      <Route
          path="/eula"
          element={
            <Eula
              appName="InvTrack"
              companyName="Green Flow Nurseries Ltd."
              effectiveDate="September 3, 2025"
              privacyUrl="/privacy"
              contactEmail="info@greenflownurseries.com"
              address="35444 Hartley Rd, Mission, BC, V2V 0A8"
              jurisdiction="British Columbia, Canada"
            />
          }
        />
         <Route
          path="/privacy"
          element={
            <Privacy
              appName="InvTrack"
              companyName="Green Flow Nurseries Ltd."
              effectiveDate="September 3, 2025"
              contactEmail="support@greenflownurseries.com"
              address="35444 Hartley Rd, Mission, BC, V2V 0A8"
              jurisdiction="British Columbia, Canada"
            />
          }
        />
      {/* Redirect all other paths to dashboard */}
      <Route path="*" element={<Navigate to="/dashboard" />} />
    </Routes>
  </BrowserRouter>
  </RealmProvider>
  </>
);
