'use client';

import { CreditCard } from 'lucide-react';

interface CreditCardPreviewProps {
  cardNumber: string;
  cardholderName: string;
  expirationDate: string;
  securityCode: string;
  showBack: boolean;
}

export function CreditCardPreview({
  cardNumber,
  cardholderName,
  expirationDate,
  securityCode,
  showBack,
}: CreditCardPreviewProps) {
  const formatCardNumber = (number: string) => {
    const cleaned = number.replace(/\s/g, '');
    const formatted = cleaned.match(/.{1,4}/g)?.join(' ') || '';
    return formatted.padEnd(19, '•');
  };

  return (
    <div className="perspective-1000 w-full max-w-sm mx-auto mb-6">
      <div
        className={`relative w-full h-56 transition-transform duration-700 transform-style-3d ${
          showBack ? 'rotate-y-180' : ''
        }`}
      >
        {/* Frente do Cartão */}
        <div className="absolute w-full h-full backface-hidden">
          <div className="w-full h-full bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900 rounded-2xl shadow-2xl p-6 text-white flex flex-col justify-between">
            {/* Chip e Logo */}
            <div className="flex justify-between items-start">
              <div className="w-12 h-10 bg-gradient-to-br from-yellow-200 to-yellow-400 rounded-md"></div>
              <CreditCard className="h-8 w-8 opacity-80" />
            </div>

            {/* Número do Cartão */}
            <div className="space-y-4">
              <div className="text-2xl font-mono tracking-wider">
                {formatCardNumber(cardNumber) || '•••• •••• •••• ••••'}
              </div>

              {/* Nome e Validade */}
              <div className="flex justify-between items-end">
                <div>
                  <div className="text-xs opacity-70 uppercase">Nome</div>
                  <div className="font-medium uppercase text-sm">
                    {cardholderName || 'SEU NOME AQUI'}
                  </div>
                </div>
                <div>
                  <div className="text-xs opacity-70 uppercase">Validade</div>
                  <div className="font-medium text-sm">
                    {expirationDate || 'MM/AA'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Verso do Cartão */}
        <div className="absolute w-full h-full backface-hidden rotate-y-180">
          <div className="w-full h-full bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900 rounded-2xl shadow-2xl overflow-hidden">
            {/* Tarja Magnética */}
            <div className="w-full h-12 bg-black mt-6"></div>

            {/* CVV */}
            <div className="p-6 mt-4">
              <div className="bg-white h-10 rounded flex items-center justify-end px-4">
                <div className="text-black font-mono text-lg">
                  {securityCode || '•••'}
                </div>
              </div>
              <div className="text-xs text-white mt-2 opacity-70">CVV</div>
            </div>

            {/* Texto de segurança */}
            <div className="px-6 mt-4">
              <p className="text-xs text-white opacity-60">
                Este cartão é propriedade do titular. O uso indevido é crime.
              </p>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .perspective-1000 {
          perspective: 1000px;
        }
        .transform-style-3d {
          transform-style: preserve-3d;
        }
        .backface-hidden {
          backface-visibility: hidden;
        }
        .rotate-y-180 {
          transform: rotateY(180deg);
        }
      `}</style>
    </div>
  );
}
