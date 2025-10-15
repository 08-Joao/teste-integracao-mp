'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import Script from 'next/script';
import { CreditCardPreview } from './CreditCardPreview';
import { PixQRCode } from './PixQRCode';
import { maskCPF, maskCardNumber, maskExpirationDate, maskCVV, unmask } from '@/lib/utils/masks';

interface MercadoPagoCheckoutProps {
  proposalId: string;
  amount: number;
  description: string;
  onSuccess: () => void;
  onError: (error: any) => void;
}

declare global {
  interface Window {
    MercadoPago: any;
  }
}

export function MercadoPagoCheckout({
  proposalId,
  amount,
  description,
  onSuccess,
  onError,
}: MercadoPagoCheckoutProps) {
  const [mp, setMp] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'credit_card' | 'pix'>('credit_card');
  const [isCVVFocused, setIsCVVFocused] = useState(false);
  const [pixData, setPixData] = useState<any>(null);
  const [detectedPaymentMethod, setDetectedPaymentMethod] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    cardNumber: '',
    cardholderName: '',
    expirationDate: '',
    securityCode: '',
    installments: '1',
    email: '',
    docNumber: '',
  });

  useEffect(() => {
    if (scriptLoaded && window.MercadoPago) {
      const publicKey = process.env.NEXT_PUBLIC_MERCADO_PAGO_PUBLIC_KEY;
      const mercadopago = new window.MercadoPago(publicKey);
      setMp(mercadopago);
      console.log('💳 [MercadoPago] SDK initialized');
    }
  }, [scriptLoaded]);

  const detectPaymentMethod = async (cardNumber: string) => {
    if (!mp || cardNumber.length < 6) {
      return;
    }

    try {
      const bin = unmask(cardNumber).substring(0, 6);
      const paymentMethods = await mp.getPaymentMethods({ bin });
      
      if (paymentMethods.results && paymentMethods.results.length > 0) {
        const method = paymentMethods.results[0];
        setDetectedPaymentMethod(method.id);
        console.log('💳 [MercadoPago] Payment method detected:', method.id, method.name);
      }
    } catch (error) {
      console.error('❌ [MercadoPago] Error detecting payment method:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let maskedValue = value;

    if (name === 'docNumber') {
      maskedValue = maskCPF(value);
    } else if (name === 'cardNumber') {
      maskedValue = maskCardNumber(value);
      // Detectar método de pagamento quando o número do cartão mudar
      if (unmask(maskedValue).length >= 6) {
        detectPaymentMethod(maskedValue);
      }
    } else if (name === 'expirationDate') {
      maskedValue = maskExpirationDate(value);
    } else if (name === 'securityCode') {
      maskedValue = maskCVV(value);
    }

    setFormData(prev => ({ ...prev, [name]: maskedValue }));
  };

  const createCardToken = async () => {
    if (!mp) {
      toast.error('Mercado Pago não está carregado');
      return null;
    }

    try {
      const [month, year] = formData.expirationDate.split('/');
      
      const cardData = {
        cardNumber: unmask(formData.cardNumber),
        cardholderName: formData.cardholderName,
        cardExpirationMonth: month,
        cardExpirationYear: `20${year}`,
        securityCode: formData.securityCode,
        identificationType: 'CPF',
        identificationNumber: unmask(formData.docNumber),
      };

      console.log('💳 [MercadoPago] Creating card token...');
      const token = await mp.createCardToken(cardData);
      console.log('💳 [MercadoPago] Token created:', token.id);
      
      return token.id;
    } catch (error) {
      console.error('❌ [MercadoPago] Error creating token:', error);
      throw error;
    }
  };

  const handleCreditCardSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      // Validar se o método de pagamento foi detectado
      if (!detectedPaymentMethod) {
        toast.error('Aguarde a validação do cartão...');
        setIsProcessing(false);
        return;
      }

      const token = await createCardToken();
      
      if (!token) {
        throw new Error('Failed to create card token');
      }

      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4003';
      const response = await fetch(`${backendUrl}/api/payments/proposal/${proposalId}/process`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          token,
          payment_method_id: detectedPaymentMethod, // Usar o método detectado
          installments: parseInt(formData.installments),
          payer: {
            email: formData.email,
            identification: {
              type: 'CPF',
              number: unmask(formData.docNumber),
            },
          },
        }),
      });

      const result = await response.json();

      if (result.status === 'approved') {
        toast.success('Pagamento aprovado!');
        onSuccess();
      } else if (result.status === 'pending') {
        toast.info('Pagamento pendente de aprovação');
        onSuccess();
      } else {
        toast.error('Pagamento recusado: ' + result.status_detail);
        onError(result);
      }
    } catch (error: any) {
      console.error('❌ [Payment] Error:', error);
      toast.error('Erro ao processar pagamento: ' + error.message);
      onError(error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePixSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4003';
      const response = await fetch(`${backendUrl}/api/payments/proposal/${proposalId}/process-pix`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          payer: {
            email: formData.email,
            identification: {
              type: 'CPF',
              number: unmask(formData.docNumber),
            },
          },
        }),
      });

      const result = await response.json();

      if (result.qr_code) {
        setPixData(result);
        toast.success('QR Code PIX gerado!');
      }
    } catch (error: any) {
      console.error('❌ [Payment] Error:', error);
      toast.error('Erro ao gerar PIX: ' + error.message);
      onError(error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      <Script
        src="https://sdk.mercadopago.com/js/v2"
        onLoad={() => {
          console.log('💳 [MercadoPago] Script loaded');
          setScriptLoaded(true);
        }}
      />

      <Card>
        <CardHeader>
          <CardTitle>Pagamento</CardTitle>
          <CardDescription>
            Total: R$ {amount.toFixed(2)}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={paymentMethod} onValueChange={(v) => setPaymentMethod(v as any)}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="credit_card">Cartão de Crédito</TabsTrigger>
              <TabsTrigger value="pix">PIX</TabsTrigger>
            </TabsList>

            {/* Cartão de Crédito */}
            <TabsContent value="credit_card">
              <div className="space-y-6 mt-4">
                {/* Preview do Cartão */}
                <CreditCardPreview
                  cardNumber={formData.cardNumber}
                  cardholderName={formData.cardholderName}
                  expirationDate={formData.expirationDate}
                  securityCode={formData.securityCode}
                  showBack={isCVVFocused}
                />

                {/* Formulário */}
                <form onSubmit={handleCreditCardSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="seu@email.com"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="docNumber">CPF</Label>
                      <Input
                        id="docNumber"
                        name="docNumber"
                        placeholder="000.000.000-00"
                        value={formData.docNumber}
                        onChange={handleInputChange}
                        maxLength={14}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="cardNumber">Número do Cartão</Label>
                      <Input
                        id="cardNumber"
                        name="cardNumber"
                        placeholder="0000 0000 0000 0000"
                        value={formData.cardNumber}
                        onChange={handleInputChange}
                        maxLength={19}
                        required
                      />
                      {detectedPaymentMethod && (
                        <p className="text-xs text-green-600 flex items-center gap-1">
                          ✓ Cartão detectado: {detectedPaymentMethod.toUpperCase()}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="cardholderName">Nome no Cartão</Label>
                      <Input
                        id="cardholderName"
                        name="cardholderName"
                        placeholder="NOME COMPLETO"
                        value={formData.cardholderName}
                        onChange={handleInputChange}
                        style={{ textTransform: 'uppercase' }}
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="expirationDate">Validade</Label>
                        <Input
                          id="expirationDate"
                          name="expirationDate"
                          placeholder="MM/AA"
                          value={formData.expirationDate}
                          onChange={handleInputChange}
                          maxLength={5}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="securityCode">CVV</Label>
                        <Input
                          id="securityCode"
                          name="securityCode"
                          placeholder="123"
                          value={formData.securityCode}
                          onChange={handleInputChange}
                          onFocus={() => setIsCVVFocused(true)}
                          onBlur={() => setIsCVVFocused(false)}
                          maxLength={4}
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="installments">Parcelas</Label>
                      <Select
                        value={formData.installments}
                        onValueChange={(value) => setFormData(prev => ({ ...prev, installments: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((num) => (
                            <SelectItem key={num} value={num.toString()}>
                              {num}x de R$ {(amount / num).toFixed(2)}
                              {num === 1 ? ' à vista' : ''}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <Button
                      type="submit"
                      className="w-full"
                      disabled={isProcessing || !scriptLoaded}
                    >
                      {isProcessing ? 'Processando...' : `Pagar R$ ${amount.toFixed(2)}`}
                    </Button>
                  </form>
              </div>
            </TabsContent>

            {/* PIX */}
            <TabsContent value="pix">
              {!pixData ? (
                <form onSubmit={handlePixSubmit} className="space-y-4 mt-4 max-w-md mx-auto">
                  <div className="space-y-2">
                    <Label htmlFor="pix-email">Email</Label>
                    <Input
                      id="pix-email"
                      name="email"
                      type="email"
                      placeholder="seu@email.com"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="pix-cpf">CPF</Label>
                    <Input
                      id="pix-cpf"
                      name="docNumber"
                      placeholder="000.000.000-00"
                      value={formData.docNumber}
                      onChange={handleInputChange}
                      maxLength={14}
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isProcessing}
                  >
                    {isProcessing ? 'Gerando...' : `Gerar QR Code PIX - R$ ${amount.toFixed(2)}`}
                  </Button>
                </form>
              ) : (
                <div className="mt-4">
                  <PixQRCode
                    qrCode={pixData.qr_code}
                    qrCodeBase64={pixData.qr_code_base64}
                    amount={amount}
                  />
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </>
  );
}
