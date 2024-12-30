import React, { ReactNode } from 'react';
import { useNotifications } from '../hooks/useNotifications';

interface AppWrapperProps {
  children: ReactNode;
}

export function AppWrapper({ children }: AppWrapperProps) {
  // Initialize notifications
  useNotifications();

  return <>{children}</>;
} 