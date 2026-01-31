import React, { createContext, useContext, ReactNode } from 'react';

// Everything is free - no tiers
interface TierContextType {
  canAccess: () => boolean;
}

const TierContext = createContext<TierContextType | undefined>(undefined);

export function TierProvider({ children }: { children: ReactNode }) {
  // Always return true - everything is free
  const canAccess = (): boolean => true;

  return (
    <TierContext.Provider value={{ canAccess }}>
      {children}
    </TierContext.Provider>
  );
}

export function useTier() {
  const context = useContext(TierContext);
  if (context === undefined) {
    // Return default that allows everything
    return { canAccess: () => true };
  }
  return context;
}
