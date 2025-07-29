import { createContext, useContext, useState, useEffect } from 'react';

const RealmContext = createContext();

export function RealmProvider({ children }) {
  const [realmId, setRealmId] = useState(
    localStorage.getItem('selectedRealmId') || ''
  );

  useEffect(() => {
    if (realmId) {
      localStorage.setItem('selectedRealmId', realmId);
    }
  }, [realmId]);

  return (
    <RealmContext.Provider value={{ realmId, setRealmId }}>
      {children}
    </RealmContext.Provider>
  );
}

export function useRealm() {
  const context = useContext(RealmContext);
  if (!context) throw new Error('useRealm must be used within RealmProvider');
  return context;
}