import React, { useEffect } from 'react';
import { Info, CheckCircle2, AlertCircle } from 'lucide-react';
import './Toast.css';

export interface ToastProps {
  message: string;
  type?: 'info' | 'success' | 'warning';
  onClose: () => void;
  duration?: number;
}

export const Toast: React.FC<ToastProps> = ({
  message,
  type = 'info',
  onClose,
  duration = 3000,
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const renderIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle2 size={18} className="toast-icon success" />;
      case 'warning':
        return <AlertCircle size={18} className="toast-icon warning" />;
      case 'info':
      default:
        return <Info size={18} className="toast-icon info" />;
    }
  };

  return (
    <div className={`toast-container toast-${type}`}>
      {renderIcon()}
      <span className="toast-message">{message}</span>
    </div>
  );
};

