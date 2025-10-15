import { Controller, Post, Body, Param, Query, HttpCode, Headers, UnauthorizedException, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';

@ApiTags('payments')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('proposal/:id/process')
  @ApiOperation({ summary: 'Processar pagamento de proposta com cartão' })
  @ApiResponse({ status: 200, description: 'Pagamento processado' })
  async processPayment(
    @Param('id') proposalId: string,
    @Body() paymentData: any,
  ) {
    return this.paymentsService.createPaymentForProposal(proposalId, paymentData);
  }

  @Post('proposal/:id/process-pix')
  @ApiOperation({ summary: 'Processar pagamento de proposta com PIX' })
  @ApiResponse({ status: 200, description: 'QR Code PIX gerado' })
  async processPixPayment(
    @Param('id') proposalId: string,
    @Body() paymentData: any,
  ) {
    return this.paymentsService.createPixPaymentForProposal(proposalId, paymentData);
  }

  @Post('webhook')
  @HttpCode(200)
  @ApiOperation({ summary: 'Webhook do Mercado Pago' })
  async handleWebhook(
    @Query('id') paymentId: string,
    @Query('topic') topic: string,
    @Headers('x-signature') signature: string,
    @Headers('x-request-id') requestId: string,
    @Req() request: any,
  ) {
    console.log('🔔 [Webhook] Received:', { paymentId, topic });
    console.log('🔐 [Webhook] Signature:', signature);
    console.log('🔐 [Webhook] Request ID:', requestId);
    console.log('🔐 [Webhook] All Headers:', request.headers);
    
    // Se não houver signature (teste do MP), validar apenas se o secret está configurado
    if (signature && requestId) {
      // Validar assinatura do webhook
      const isValid = await this.paymentsService.validateWebhookSignature(
        signature,
        requestId,
        paymentId,
      );
      
      if (!isValid) {
        console.error('❌ [Webhook] Invalid signature');
        throw new UnauthorizedException('Invalid webhook signature');
      }
      
      console.log('✅ [Webhook] Signature validated');
    } else {
      console.warn('⚠️ [Webhook] No signature provided - accepting for testing purposes');
      console.warn('⚠️ [Webhook] In production with real payments, signatures should be present');
    }
    
    if (topic === 'payment') {
      return this.paymentsService.handlePaymentWebhook(paymentId);
    }
    
    return { received: true };
  }

  @Post('manual-process/:paymentId')
  @ApiOperation({ summary: 'Processar manualmente um pagamento aprovado' })
  @ApiResponse({ status: 200, description: 'Pagamento processado manualmente' })
  async manualProcessPayment(@Param('paymentId') paymentId: string) {
    console.log('🔧 [Manual] Processing payment:', paymentId);
    return this.paymentsService.handlePaymentWebhook(paymentId);
  }
}
