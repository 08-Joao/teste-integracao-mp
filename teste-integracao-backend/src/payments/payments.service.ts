import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MercadoPagoConfig, Payment } from 'mercadopago';
import { PaymentStatus } from 'generated/prisma';

@Injectable()
export class PaymentsService {
  private client: MercadoPagoConfig;
  private payment: Payment;

  constructor(private prisma: PrismaService) {
    const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN;
    
    if (!accessToken) {
      throw new Error('MERCADO_PAGO_ACCESS_TOKEN is not defined in environment variables');
    }

    // Log para debug - mostra apenas os primeiros caracteres
    console.log('🔑 [Payment] Access Token prefix:', accessToken.substring(0, 15));
    console.log('🔑 [Payment] Is TEST token:', accessToken.startsWith('TEST-'));
    
    if (!accessToken.startsWith('TEST-')) {
      console.warn('⚠️ [Payment] WARNING: Credentials do not start with TEST-');
      console.warn('⚠️ [Payment] If these are test credentials from the "Teste" tab, this is OK');
    }

    // Configurar o SDK com opções para ambiente de teste
    this.client = new MercadoPagoConfig({
      accessToken,
      options: {
        timeout: 10000,
        // Forçar modo de teste se as credenciais forem da aba "Teste"
        // mesmo que não comecem com TEST-
      },
    });
    this.payment = new Payment(this.client);
  }

  async createPaymentForProposal(proposalId: string, paymentData: any) {
    console.log('💳 [Payment] Creating payment for proposal:', proposalId);

    // Buscar proposta
    const proposal = await this.prisma.onCallProposal.findUnique({
      where: { id: proposalId },
      include: {
        request: {
          include: {
            activity: true,
          },
        },
        doctor: {
          include: {
            user: true,
          },
        },
        practiceLocation: true,
      },
    });

    if (!proposal) {
      throw new NotFoundException('Proposal not found');
    }

    try {
      // Criar pagamento no Mercado Pago
      const paymentResponse = await this.payment.create({
        body: {
          transaction_amount: proposal.price,
          description: `${proposal.request.activity.name} - Dr(a). ${proposal.doctor.user.name}`,
          payment_method_id: paymentData.payment_method_id,
          payer: {
            email: paymentData.payer.email,
            identification: {
              type: paymentData.payer.identification.type,
              number: paymentData.payer.identification.number,
            },
          },
          token: paymentData.token,
          installments: paymentData.installments,
          metadata: {
            proposal_id: proposalId,
          },
        },
      });

      console.log('💳 [Payment] Payment created:', paymentResponse.id);
      console.log('💳 [Payment] Status:', paymentResponse.status);

      // Salvar pagamento no banco de dados
      const paymentRecord = await this.prisma.payment.create({
        data: {
          proposalId,
          mercadoPagoPaymentId: paymentResponse.id?.toString(),
          amount: proposal.price,
          status: this.mapPaymentStatus(paymentResponse.status || 'pending'),
          paymentMethod: paymentData.payment_method_id,
          installments: paymentData.installments,
          payerEmail: paymentData.payer.email,
          payerDocType: paymentData.payer.identification.type,
          payerDocNumber: paymentData.payer.identification.number,
          statusDetail: paymentResponse.status_detail || null,
          transactionAmount: paymentResponse.transaction_amount || null,
          netReceivedAmount: paymentResponse.transaction_details?.net_received_amount || null,
          paidAt: paymentResponse.status === 'approved' ? new Date() : null,
        },
      });

      return {
        id: paymentResponse.id,
        status: paymentResponse.status,
        status_detail: paymentResponse.status_detail,
        proposal_id: proposalId,
        payment_record_id: paymentRecord.id,
      };
    } catch (error) {
      console.error('❌ [Payment] Error creating payment:', error);
      throw new BadRequestException('Failed to process payment: ' + error.message);
    }
  }

  private mapPaymentStatus(mpStatus: string): PaymentStatus {
    const statusMap: Record<string, PaymentStatus> = {
      'approved': PaymentStatus.APPROVED,
      'pending': PaymentStatus.PENDING,
      'rejected': PaymentStatus.REJECTED,
      'cancelled': PaymentStatus.CANCELLED,
      'refunded': PaymentStatus.REFUNDED,
    };
    return statusMap[mpStatus] || PaymentStatus.PENDING;
  }

  async handlePaymentWebhook(paymentId: string) {
    console.log('🔔 [Payment] Webhook received for payment:', paymentId);

    try {
      // Buscar informações do pagamento
      const paymentInfo = await this.payment.get({ id: paymentId });

      console.log('💳 [Payment] Payment status:', paymentInfo.status);
      console.log('💳 [Payment] Proposal ID:', paymentInfo.metadata?.proposal_id);

      if (paymentInfo.status === 'approved' && paymentInfo.metadata?.proposal_id) {
        // Atualizar proposta para CONFIRMED
        const proposalId = paymentInfo.metadata.proposal_id as string;
        
        await this.prisma.onCallProposal.update({
          where: { id: proposalId },
          data: { status: 'CONFIRMED' },
        });

        // Fechar request
        const proposal = await this.prisma.onCallProposal.findUnique({
          where: { id: proposalId },
          include: { request: true },
        });

        if (proposal) {
          await this.prisma.onCallRequest.update({
            where: { id: proposal.requestId },
            data: { status: 'CLOSED' },
          });

          // Cancelar outras propostas
          await this.prisma.onCallProposal.updateMany({
            where: {
              requestId: proposal.requestId,
              id: { not: proposalId },
              status: 'PROPOSAL_SENT',
            },
            data: { status: 'CANCELLED' },
          });

          console.log('✅ [Payment] Proposal confirmed after payment approval');
        }
      }

      return { received: true };
    } catch (error) {
      console.error('❌ [Payment] Error handling webhook:', error);
      throw error;
    }
  }

  async createPixPaymentForProposal(proposalId: string, paymentData: any) {
    console.log('💳 [Payment] Creating PIX payment for proposal:', proposalId);

    // Buscar proposta
    const proposal = await this.prisma.onCallProposal.findUnique({
      where: { id: proposalId },
      include: {
        request: {
          include: {
            activity: true,
          },
        },
        doctor: {
          include: {
            user: true,
          },
        },
        practiceLocation: true,
      },
    });

    if (!proposal) {
      throw new NotFoundException('Proposal not found');
    }

    // MODO SIMULAÇÃO - Para desenvolvimento quando PIX em teste não está disponível
    if (process.env.SIMULATE_PIX === 'true') {
      console.log('🔧 [Payment] SIMULATING PIX payment (SIMULATE_PIX=true)');
      
      const simulatedId = Date.now();
      const simulatedQRCode = '00020126360014br.gov.bcb.pix0114+55119999999990204000053039865802BR5913Teste Usuario6009SAO PAULO62070503***63041D3D';
      
      const paymentRecord = await this.prisma.payment.create({
        data: {
          proposalId,
          mercadoPagoPaymentId: simulatedId.toString(),
          amount: proposal.price,
          status: 'PENDING',
          paymentMethod: 'pix',
          installments: 1,
          payerEmail: paymentData.payer.email,
          payerDocType: paymentData.payer.identification.type,
          payerDocNumber: paymentData.payer.identification.number,
          statusDetail: 'pending_waiting_payment',
          transactionAmount: proposal.price,
          netReceivedAmount: null,
          paidAt: null,
        },
      });

      console.log('✅ [Payment] SIMULATED PIX Payment created:', simulatedId);
      
      return {
        id: simulatedId,
        status: 'pending',
        qr_code: simulatedQRCode,
        qr_code_base64: Buffer.from(simulatedQRCode).toString('base64'),
        ticket_url: `https://www.mercadopago.com.br/payments/${simulatedId}/ticket`,
        proposal_id: proposalId,
        payment_record_id: paymentRecord.id,
        simulated: true,
      };
    }

    try {
      // Criar pagamento PIX no Mercado Pago
      const paymentResponse = await this.payment.create({
        body: {
          transaction_amount: proposal.price,
          description: `${proposal.request.activity.name} - Dr(a). ${proposal.doctor.user.name}`,
          payment_method_id: 'pix',
          payer: {
            email: paymentData.payer.email,
            identification: {
              type: paymentData.payer.identification.type,
              number: paymentData.payer.identification.number,
            },
            first_name: paymentData.payer.first_name || 'Test',
            last_name: paymentData.payer.last_name || 'User',
          },
          notification_url: process.env.WEBHOOK_URL || 'https://webhook.site/unique-id',
          external_reference: proposalId,
          statement_descriptor: '123CONEX',
          metadata: {
            proposal_id: proposalId,
          },
        },
      });

      console.log('💳 [Payment] PIX Payment created:', paymentResponse.id);

      // Salvar pagamento no banco de dados
      const paymentRecord = await this.prisma.payment.create({
        data: {
          proposalId,
          mercadoPagoPaymentId: paymentResponse.id?.toString(),
          amount: proposal.price,
          status: this.mapPaymentStatus(paymentResponse.status || 'pending'),
          paymentMethod: 'pix',
          installments: 1,
          payerEmail: paymentData.payer.email,
          payerDocType: paymentData.payer.identification.type,
          payerDocNumber: paymentData.payer.identification.number,
          statusDetail: paymentResponse.status_detail || null,
          transactionAmount: paymentResponse.transaction_amount || null,
          netReceivedAmount: paymentResponse.transaction_details?.net_received_amount || null,
          paidAt: null,
        },
      });

      return {
        id: paymentResponse.id,
        status: paymentResponse.status,
        qr_code: paymentResponse.point_of_interaction?.transaction_data?.qr_code,
        qr_code_base64: paymentResponse.point_of_interaction?.transaction_data?.qr_code_base64,
        ticket_url: paymentResponse.point_of_interaction?.transaction_data?.ticket_url,
        proposal_id: proposalId,
        payment_record_id: paymentRecord.id,
      };
    } catch (error) {
      console.error('❌ [Payment] Error creating PIX payment:', error);
      throw new BadRequestException('Failed to process PIX payment: ' + error.message);
    }
  }
}
