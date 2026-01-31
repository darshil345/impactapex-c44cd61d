import React from 'react';

interface LockedFeatureProps {
  children: React.ReactNode;
  className?: string;
  feature?: string;
  requiredTier?: string;
  showOverlay?: boolean;
}

// Everything is free - just render children directly
export function LockedFeature({ children }: LockedFeatureProps) {
  return <>{children}</>;
}

export function LockedBadge() {
  return null;
}
