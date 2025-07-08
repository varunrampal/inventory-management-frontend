import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';

export default function ProtectedRoute({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
const BASE_URL = import.meta.env.PROD 
? 'https://inventory-management-frontend-d8oi.onrender.com' 
: 'http://localhost:5173';
  useEffect(() => {
    fetch(`${BASE_URL}/admin/auth-check`, { credentials: 'include' })
      .then(res => setIsAuthenticated(res.ok))
      .catch(() => setIsAuthenticated(false));
  }, []);

  if (isAuthenticated === null) return <div>Loading...</div>;

  return isAuthenticated ? children : <Navigate to="/login" replace />;
}
