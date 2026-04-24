import React, { createContext, useContext, useEffect, useState } from 'react';
import NetInfo from '@react-native-community/netinfo';

const NetworkContext = createContext();

export function NetworkProvider({ children }) {
  const [isOnline, setIsOnline] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsOnline(state.isConnected ?? true);
      setIsConnecting(state.isConnected === null);
    });

    // Check initial state
    NetInfo.fetch().then((state) => {
      setIsOnline(state.isConnected ?? true);
      setIsConnecting(state.isConnected === null);
    });

    return unsubscribe;
  }, []);

  return (
    <NetworkContext.Provider value={{ isOnline, isConnecting }}>
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
