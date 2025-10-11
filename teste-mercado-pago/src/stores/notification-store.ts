import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Notification {
  id: string;
  type: 'NEW_REQUEST' | 'NEW_PROPOSAL' | 'PROPOSAL_ACCEPTED' | 'PROPOSAL_REJECTED';
  message: string;
  data: any;
  timestamp: string;
  read: boolean;
}

interface NotificationStore {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, 'id' | 'read'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearAll: () => void;
}

export const useNotificationStore = create<NotificationStore>()(
  persist(
    (set) => ({
      notifications: [],
      unreadCount: 0,
      
      addNotification: (notification) =>
        set((state) => {
          const newNotification: Notification = {
            ...notification,
            id: `${Date.now()}-${Math.random()}`,
            read: false,
          };
          
          const newNotifications = [newNotification, ...state.notifications].slice(0, 50); // Manter apenas 50
          
          return {
            notifications: newNotifications,
            unreadCount: newNotifications.filter((n) => !n.read).length,
          };
        }),
      
      markAsRead: (id) =>
        set((state) => {
          const newNotifications = state.notifications.map((n) =>
            n.id === id ? { ...n, read: true } : n
          );
          
          return {
            notifications: newNotifications,
            unreadCount: newNotifications.filter((n) => !n.read).length,
          };
        }),
      
      markAllAsRead: () =>
        set((state) => ({
          notifications: state.notifications.map((n) => ({ ...n, read: true })),
          unreadCount: 0,
        })),
      
      clearAll: () =>
        set({
          notifications: [],
          unreadCount: 0,
        }),
    }),
    {
      name: 'notifications-storage',
    }
  )
);
