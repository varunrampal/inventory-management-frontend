// src/context/AuthContext.jsx
import React, { createContext, useContext, useMemo, useState } from "react";

const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() =>
    JSON.parse(localStorage.getItem("user") || "null")
  );
  const value = useMemo(() => ({ user, setUser }), [user]);
  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

// Safe hook: return a default object if no provider is mounted
export function useAuth() {
  return useContext(AuthCtx) ?? { user: null, setUser: () => {} };
}
