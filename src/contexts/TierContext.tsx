import React, { createContext, useContext, useState, ReactNode } from 'react';
import { SubscriptionTier, tierFeatures, TierFeatures } from '@/lib/mockData';

interface TierContextType {
  currentTier: SubscriptionTier;
  setCurrentTier: (tier: SubscriptionTier) => void;
  features: TierFeatures;
  canAccess: (feature: keyof TierFeatures) => boolean;
}

const TierContext = createContext<TierContextType | undefined>(undefined);

export function TierProvider({ children }: { children: ReactNode }) {
  const [currentTier, setCurrentTier] = useState<SubscriptionTier>('free');
  
  const features = tierFeatures[currentTier];
  
  const canAccess = (feature: keyof TierFeatures): boolean => {
    const value = features[feature];
    if (typeof value === 'boolean') return value;
    if (typeof value === 'number') return value > 0;
    return false;
  };

  return (
    <TierContext.Provider value={{ currentTier, setCurrentTier, features, canAccess }}>
      {children}
    </TierContext.Provider>
  );
}

export function useTier() {
  const context = useContext(TierContext);
  if (context === undefined) {
    throw new Error('useTier must be used within a TierProvider');
  }
  return context;
}
