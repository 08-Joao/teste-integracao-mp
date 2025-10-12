import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { notificationService } from '@/services/NotificationService';

export const useNotifications = () => {
  const { user } = useAuth();

  useEffect(() => {
    // Conectar ao WebSocket quando o usuário estiver autenticado
    if (user) {
      console.log('🔌 [useNotifications] User detected:', user.email);
      console.log('🔌 [useNotifications] Connecting with httpOnly cookie...');
      
      notificationService.connect();
    } else {
      console.log('⚠️ [useNotifications] No user, disconnecting...');
      notificationService.disconnect();
    }

    // Desconectar quando o componente desmontar ou usuário sair
    return () => {
      // notificationService.disconnect(); // Comentado para manter conexão entre navegações
    };
  }, [user]);

  return {
    isConnected: notificationService.isConnected(),
  };
};
