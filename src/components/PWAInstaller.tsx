
import { useEffect } from 'react';
import { usePWA } from '@/hooks/usePWA';

export const PWAInstaller = () => {
  // We call usePWA inside a component where React hooks can be safely used
  const pwa = usePWA();
  
  return null; // This is a utility component with no UI
};
