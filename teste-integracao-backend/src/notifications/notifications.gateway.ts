import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  accountId?: string;
  accountType?: string;
}

@Injectable()
@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  },
  namespace: '/notifications',
})
export class NotificationsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private connectedClients: Map<string, AuthenticatedSocket> = new Map();

  constructor(
    private jwtService: JwtService,
    private prisma: PrismaService,
  ) {}

  afterInit(server: Server) {
    console.log('🔌 [Gateway] WebSocket Gateway initialized');
    
    server.use(async (socket: any, next: any) => {
      try {
        console.log('🔌 [Gateway] New connection attempt:', socket.id);
        
        // Extrair token do cookie
        const cookieHeader = socket.handshake.headers.cookie;
        console.log('🔌 [Gateway] Cookie header:', cookieHeader ? 'present' : 'missing');
        
        if (!cookieHeader) {
          console.log('❌ [Gateway] No cookie header found');
          return next(new Error('Authentication error'));
        }

        const cookies = cookieHeader
          .split(';')
          .map((cookie: string) => cookie.trim())
          .reduce((acc: any, cookie: string) => {
            const [key, value] = cookie.split('=');
            acc[key] = value;
            return acc;
          }, {});

        const accessToken = cookies.accessToken;
        console.log('🔌 [Gateway] Access token:', accessToken ? 'found' : 'not found');

        if (!accessToken) {
          console.log('❌ [Gateway] No access token in cookies');
          return next(new Error('Authentication error'));
        }

        // Verificar token
        let decodedToken;
        try {
          decodedToken = this.jwtService.verify(accessToken, {
            secret: process.env.JWT_SECRET,
          });
          console.log('✅ [Gateway] Token verified for user:', decodedToken.email);
        } catch (error) {
          console.log('❌ [Gateway] Token verification failed:', error.message);
          return next(new Error('Authentication error'));
        }

        // Buscar usuário no banco
        const account = await this.prisma.account.findUnique({
          where: { id: decodedToken.accountId },
          include: { user: true },
        });

        if (!account) {
          console.log('❌ [Gateway] Account not found');
          return next(new Error('User not found'));
        }

        // Adicionar dados ao socket
        socket.accountId = account.id;
        socket.accountType = account.type;
        socket.userId = account.userId;
        socket.data.user = decodedToken;
        socket.data.dbUser = account.user;

        console.log('✅ [Gateway] Authentication successful for:', account.user.email);
        next();
      } catch (error) {
        console.log('❌ [Gateway] Middleware error:', error.message);
        next(new Error('Internal server error'));
      }
    });
  }

  handleConnection(client: AuthenticatedSocket) {
    console.log('🔌 [Gateway] Client connected:', client.id);
    
    try {
      const accountId = client.accountId;
      const accountType = client.accountType;

      if (!accountId) {
        console.log('❌ [Gateway] No accountId, disconnecting');
        client.disconnect();
        return;
      }

      this.connectedClients.set(accountId, client);
      console.log(`✅ [Gateway] Client registered: ${accountId} (${accountType})`);
      console.log(`📊 [Gateway] Total connected: ${this.connectedClients.size}`);

      // Juntar a sala do usuário
      client.join(`user_${accountId}`);

      client.emit('connected', {
        message: 'Successfully connected to notifications',
        accountId,
        accountType,
      });
    } catch (error) {
      console.error('❌ [Gateway] Connection error:', error);
      client.disconnect();
    }
  }

  handleDisconnect(client: AuthenticatedSocket) {
    if (client.accountId) {
      this.connectedClients.delete(client.accountId);
      client.leave(`user_${client.accountId}`);
      console.log(`🔌 [Gateway] Client disconnected: ${client.accountId}`);
      console.log(`📊 [Gateway] Total connected: ${this.connectedClients.size}`);
    }
  }

  // Notificar médico sobre novo request
  notifyDoctorNewRequest(doctorAccountId: string, requestData: any) {
    console.log('🔔 [Gateway] Attempting to notify doctor:', doctorAccountId);
    console.log('🔔 [Gateway] Connected clients:', Array.from(this.connectedClients.keys()));
    
    const client = this.connectedClients.get(doctorAccountId);
    if (client) {
      console.log('🔔 [Gateway] Client found! Sending notification...');
      client.emit('new-request', {
        type: 'NEW_REQUEST',
        message: 'Nova solicitação de atendimento disponível',
        data: requestData,
        timestamp: new Date().toISOString(),
      });
      console.log('🔔 [Gateway] Notification sent successfully');
    } else {
      console.log('❌ [Gateway] Client NOT connected:', doctorAccountId);
    }
  }

  // Notificar todos os médicos sobre novo request (broadcast)
  notifyAllDoctorsNewRequest(requestData: any) {
    this.connectedClients.forEach((client) => {
      if (client.accountType === 'PROFESSIONAL') {
        client.emit('new-request', {
          type: 'NEW_REQUEST',
          message: 'Nova solicitação de atendimento disponível',
          data: requestData,
          timestamp: new Date().toISOString(),
        });
      }
    });
  }

  // Notificar paciente sobre nova proposta
  notifyPatientNewProposal(patientAccountId: string, proposalData: any) {
    const client = this.connectedClients.get(patientAccountId);
    if (client) {
      client.emit('new-proposal', {
        type: 'NEW_PROPOSAL',
        message: 'Você recebeu uma nova proposta de atendimento',
        data: proposalData,
        timestamp: new Date().toISOString(),
      });
    }
  }

  // Notificar médico que sua proposta foi aceita
  notifyDoctorProposalAccepted(doctorAccountId: string, proposalData: any) {
    const client = this.connectedClients.get(doctorAccountId);
    if (client) {
      client.emit('proposal-accepted', {
        type: 'PROPOSAL_ACCEPTED',
        message: 'Sua proposta foi aceita pelo paciente!',
        data: proposalData,
        timestamp: new Date().toISOString(),
      });
    }
  }

  // Notificar médico que sua proposta foi rejeitada
  notifyDoctorProposalRejected(doctorAccountId: string, proposalData: any) {
    const client = this.connectedClients.get(doctorAccountId);
    if (client) {
      client.emit('proposal-rejected', {
        type: 'PROPOSAL_REJECTED',
        message: 'Sua proposta foi rejeitada',
        data: proposalData,
        timestamp: new Date().toISOString(),
      });
    }
  }

  // Notificar paciente que o pagamento foi aprovado
  notifyPaymentApproved(patientAccountId: string, paymentData: any) {
    console.log('💰 [Gateway] Notifying payment approved to:', patientAccountId);
    const client = this.connectedClients.get(patientAccountId);
    if (client) {
      client.emit('payment-approved', {
        type: 'PAYMENT_APPROVED',
        message: 'Seu pagamento foi aprovado!',
        data: paymentData,
        timestamp: new Date().toISOString(),
      });
      console.log('✅ [Gateway] Payment notification sent');
    } else {
      console.log('⚠️ [Gateway] Patient not connected:', patientAccountId);
    }
  }

  // Método para teste (opcional)
  @SubscribeMessage('ping')
  handlePing(@ConnectedSocket() client: AuthenticatedSocket) {
    return { event: 'pong', data: { accountId: client.accountId } };
  }
}
