'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Copy, Check } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import Image from 'next/image';

interface PixQRCodeProps {
  qrCode: string;
  qrCodeBase64?: string;
  amount: number;
}

export function PixQRCode({ qrCode, qrCodeBase64, amount }: PixQRCodeProps) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(qrCode);
    setCopied(true);
    toast.success('Código PIX copiado!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle>Pagamento via PIX</CardTitle>
        <CardDescription>
          Escaneie o QR Code ou copie o código
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* QR Code */}
        {qrCodeBase64 ? (
          <div className="flex justify-center p-4 bg-white rounded-lg">
            <Image
              src={`data:image/png;base64,${qrCodeBase64}`}
              alt="QR Code PIX"
              width={256}
              height={256}
              className="rounded"
            />
          </div>
        ) : (
          <div className="flex justify-center p-8 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">QR Code não disponível</p>
          </div>
        )}

        {/* Valor */}
        <div className="text-center">
          <p className="text-sm text-muted-foreground">Valor a pagar</p>
          <p className="text-2xl font-bold text-green-600">
            R$ {amount.toFixed(2)}
          </p>
        </div>

        {/* Código PIX */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Código PIX Copia e Cola</Label>
          <div className="flex gap-2">
            <div className="flex-1 p-3 bg-muted rounded-md text-xs font-mono break-all">
              {qrCode.substring(0, 50)}...
            </div>
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={copyToClipboard}
            >
              {copied ? (
                <Check className="h-4 w-4 text-green-600" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Instruções */}
        <div className="space-y-2 text-sm text-muted-foreground">
          <p className="font-medium text-foreground">Como pagar:</p>
          <ol className="list-decimal list-inside space-y-1">
            <li>Abra o app do seu banco</li>
            <li>Escolha pagar com PIX</li>
            <li>Escaneie o QR Code ou cole o código</li>
            <li>Confirme o pagamento</li>
          </ol>
        </div>

        {/* Aviso */}
        <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
          <p className="text-xs text-yellow-800 dark:text-yellow-200">
            ⏱️ Este QR Code expira em 30 minutos
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function Label({ children, className }: { children: React.ReactNode; className?: string }) {
  return <label className={className}>{children}</label>;
}
