import React, { createContext, useContext } from 'react';

const NetworkContext = createContext();

// Fallback: her zaman online assume (Expo managed workflow uyumluluğu)
export function NetworkProvider({ children }) {
  return (
    <NetworkContext.Provider value={{ isOnline: true, isConnecting: false }}>
      {children}
    </NetworkContext.Provider>
  );
}

export function useNetwork() {
  const ctx = useContext(NetworkContext);
  if (!ctx) {
    throw new Error('useNetwork must be used within NetworkProvider');
  }
  return ctx;
}

