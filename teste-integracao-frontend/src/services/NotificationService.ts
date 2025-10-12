import { io, Socket } from 'socket.io-client';
import { toast } from 'sonner';
import { useNotificationStore } from '@/stores/notification-store';

class NotificationService {
  private socket: Socket | null = null;
  private token: string | null = null;

  connect() {
    if (this.socket?.connected) {
      console.log('🔌 [NotificationService] Already connected');
      return;
    }

    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';

    console.log('🔌 [NotificationService] Connecting to:', `${backendUrl}/notifications`);
    console.log('🔌 [NotificationService] Using httpOnly cookie for auth');

    this.socket = io(`${backendUrl}/notifications`, {
      withCredentials: true, // Envia cookies httpOnly automaticamente
      transports: ['websocket'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
      forceNew: true,
    });

    this.setupListeners();
  }

  private setupListeners() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('✅ [NotificationService] Socket connected!');
    });

    this.socket.on('connected', (data) => {
      console.log('✅ [NotificationService] Server confirmed connection:', data);
    });

    this.socket.on('new-request', (notification) => {
      console.log('🔔 [NotificationService] NEW REQUEST received:', notification);
      
      // Adicionar ao store
      useNotificationStore.getState().addNotification({
        type: notification.type,
        message: notification.message,
        data: notification.data,
        timestamp: notification.timestamp,
      });
      
      toast.info(notification.message, {
        description: 'Clique para ver detalhes',
        action: {
          label: 'Ver',
          onClick: () => {
            window.location.href = '/on-call/proposals';
          },
        },
      });
    });

    this.socket.on('new-proposal', (notification) => {
      console.log('🔔 [NotificationService] NEW PROPOSAL received:', notification);
      
      // Adicionar ao store
      useNotificationStore.getState().addNotification({
        type: notification.type,
        message: notification.message,
        data: notification.data,
        timestamp: notification.timestamp,
      });
      
      toast.success(notification.message, {
        description: 'Clique para ver detalhes',
        action: {
          label: 'Ver',
          onClick: () => {
            window.location.href = '/on-call';
          },
        },
      });
    });


    this.socket.on('proposal-accepted', (notification) => {
      console.log('Proposal accepted notification:', notification);
      toast.success(notification.message, {
        description: 'Parabéns! Sua proposta foi aceita.',
        duration: 5000,
      });
    });

    this.socket.on('proposal-rejected', (notification) => {
      console.log('Proposal rejected notification:', notification);
      toast.info(notification.message, {
        description: 'O paciente rejeitou sua proposta.',
      });
    });

    this.socket.on('connect_error', (error) => {
      console.error('Connection error:', error);
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Disconnected:', reason);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }
}

export const notificationService = new NotificationService();
