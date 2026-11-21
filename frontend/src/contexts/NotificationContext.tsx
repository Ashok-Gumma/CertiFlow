import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api from '../services/api';
import { NotificationItem } from '../types';
import { useAuth } from './AuthContext';

interface Toast {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
}

interface NotificationContextType {
  notifications: NotificationItem[];
  unreadCount: number;
  toasts: Toast[];
  eventSignal: number;
  dismissToast: (id: string) => void;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  fetchNotifications: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [eventSignal, setEventSignal] = useState<number>(0);

  const addToast = (type: 'info' | 'success' | 'warning' | 'error', title: string, message: string) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, type, title, message }]);

    // Auto dismiss after 5s
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const fetchNotifications = async () => {
    if (!isAuthenticated) return;
    try {
      const res = await api.get('/notifications');
      if (res.data.success) {
        setNotifications(res.data.notifications);
        setUnreadCount(res.data.unreadCount);
      }
    } catch (e) {
      // ignore silently
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (e) {
      console.error(e);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.patch('/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();
    }
  }, [isAuthenticated]);

  // Connect to SSE stream
  useEffect(() => {
    const eventSource = new EventSource('/api/events');

    eventSource.addEventListener('BATCH_SUBMITTED', (e: any) => {
      try {
        const payload = JSON.parse(e.data);
        addToast('info', 'Batch Submitted', `Batch ${payload.data.batchNumber} was submitted for review.`);
        setEventSignal((s) => s + 1);
        fetchNotifications();
      } catch (err) {}
    });

    eventSource.addEventListener('APPROVAL_COMPLETED', (e: any) => {
      try {
        const payload = JSON.parse(e.data);
        addToast('success', 'Approval Recorded', `${payload.data.officerName} (${payload.data.role}) approved batch ${payload.data.batchNumber}.`);
        setEventSignal((s) => s + 1);
        fetchNotifications();
      } catch (err) {}
    });

    eventSource.addEventListener('BATCH_RETURNED', (e: any) => {
      try {
        const payload = JSON.parse(e.data);
        addToast('warning', 'Batch Returned', `Batch ${payload.data.batchNumber} returned by ${payload.data.officerName} for correction.`);
        setEventSignal((s) => s + 1);
        fetchNotifications();
      } catch (err) {}
    });

    eventSource.addEventListener('BATCH_REJECTED', (e: any) => {
      try {
        const payload = JSON.parse(e.data);
        addToast('error', 'Batch Rejected', `Batch ${payload.data.batchNumber} was rejected by ${payload.data.officerName}.`);
        setEventSignal((s) => s + 1);
        fetchNotifications();
      } catch (err) {}
    });

    eventSource.addEventListener('CERTIFICATES_GENERATED', (e: any) => {
      try {
        const payload = JSON.parse(e.data);
        addToast('success', 'Certificates Ready', `Generated ${payload.data.count} official certificates for batch ${payload.data.batchNumber}!`);
        setEventSignal((s) => s + 1);
        fetchNotifications();
      } catch (err) {}
    });

    eventSource.addEventListener('DELIVERY_UPDATED', (e: any) => {
      try {
        const payload = JSON.parse(e.data);
        if (payload.data.status === 'DELIVERED') {
          addToast('success', 'WhatsApp Delivered', `Certificate ${payload.data.certificateNumber} delivered to candidate!`);
        } else if (payload.data.status === 'FAILED') {
          addToast('warning', 'Delivery Failed', `WhatsApp delivery failed for ${payload.data.certificateNumber}.`);
        }
        setEventSignal((s) => s + 1);
        fetchNotifications();
      } catch (err) {}
    });

    eventSource.addEventListener('CERTIFICATE_REVOKED', (e: any) => {
      try {
        const payload = JSON.parse(e.data);
        addToast('error', 'Certificate Revoked', `Certificate ${payload.data.certificateNumber} has been officially revoked by State Office.`);
        setEventSignal((s) => s + 1);
        fetchNotifications();
      } catch (err) {}
    });

    return () => {
      eventSource.close();
    };
  }, [isAuthenticated]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        toasts,
        eventSignal,
        dismissToast,
        markAsRead,
        markAllAsRead,
        fetchNotifications,
      }}
    >
      {children}
      {/* Toast Notification Container */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl shadow-lg border text-sm transition-all transform animate-in slide-in-from-right duration-300 ${
              toast.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : toast.type === 'error'
                ? 'bg-rose-50 border-rose-200 text-rose-900'
                : toast.type === 'warning'
                ? 'bg-amber-50 border-amber-200 text-amber-900'
                : 'bg-indigo-50 border-indigo-200 text-indigo-900'
            }`}
          >
            <div className="flex-1">
              <h5 className="font-semibold text-xs uppercase tracking-wider mb-0.5 opacity-90">{toast.title}</h5>
              <p className="text-xs">{toast.message}</p>
            </div>
            <button
              onClick={() => dismissToast(toast.id)}
              className="opacity-60 hover:opacity-100 text-xs font-bold px-1"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
};

export const useNotifications = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
