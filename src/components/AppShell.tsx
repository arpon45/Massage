import React from 'react';

export default function AppShell({ children }: { children: React.ReactNode }) {
  // No sidebar or shell; just render children
  return <>{children}</>;
}
