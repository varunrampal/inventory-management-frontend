import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';

export default function ProtectedRoute({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
// const BASE_URL = import.meta.env.PROD 
// ? 'https://inventory-management-server-vue1.onrender.com' 
// : 'http://localhost:4000';


  const BASE_URL = import.meta.env.VITE_API_BASE_URL;
  // useEffect(() => {
  //   fetch(`${BASE_URL}/admin/auth-check`, { method: 'GET',credentials: 'include' })
  //     .then(res => setIsAuthenticated(res.ok))
  //     .catch(() => setIsAuthenticated(false));
  // }, []);

 useEffect(() => {
   const token = localStorage.getItem('token');
    fetch(`${BASE_URL}/admin/auth-check`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
      })
      .then(res => setIsAuthenticated(res.ok))
      .catch(() => setIsAuthenticated(false));
  }, []);

  // Check if the user is authenticated
  if (isAuthenticated === null) return <div>Loading...</div>;

  return isAuthenticated ? children : <Navigate to="/login" replace />;
}
