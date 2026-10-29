import React from 'react';
import './MobileAppShell.css';

interface MobileAppShellProps {
  children: React.ReactNode;
}

export const MobileAppShell: React.FC<MobileAppShellProps> = ({ children }) => {
  return (
    <div className="app-canvas">
      <div className="shell-container">
        {children}
      </div>
    </div>
  );
};

