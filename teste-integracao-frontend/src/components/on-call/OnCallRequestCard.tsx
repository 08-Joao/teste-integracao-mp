import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { OnRequestStatus } from '@/models/enums/on-call-status.enum';
import { OnCallRequest, useAcceptProposal, useRejectProposal } from '@/lib/hooks/use-on-calls';
import { useState } from 'react';
import { MapPin, Clock, User, QrCode } from 'lucide-react';
import { MercadoPagoCheckout } from '@/components/payments/MercadoPagoCheckout';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface OnCallRequestCardProps {
  request: OnCallRequest;
}

// Helper para estilizar o status
const StatusBadge = ({ status }: { status: OnRequestStatus }) => {
  const statusStyles = {
    [OnRequestStatus.OPEN]: 'bg-yellow-500 hover:bg-yellow-500/80',
    [OnRequestStatus.CLOSED]: 'bg-green-500 hover:bg-green-500/80',
  };

  return <Badge className={statusStyles[status]}>{status}</Badge>;
};

// Componente para exibir cada proposta
function ProposalCard({ proposal, requestStatus }: { proposal: any; requestStatus: string }) {
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [hasPendingPayment, setHasPendingPayment] = useState(false);
  const { mutate: acceptProposal, isPending: isAccepting } = useAcceptProposal();
  const { mutate: rejectProposal, isPending: isRejecting } = useRejectProposal();

  // Verificar se o request está fechado ou a proposta não está mais disponível
  const isClosed = requestStatus === 'CLOSED';
  const isProposalUnavailable = proposal.status !== 'PROPOSAL_SENT';
  const isDisabled = isClosed || isProposalUnavailable;

  const handleAccept = () => {
    if (!selectedTime) {
      alert('Por favor, selecione um horário');
      return;
    }
    // Abrir modal de pagamento
    setShowPaymentModal(true);
  };

  const handlePaymentSuccess = () => {
    // Após pagamento aprovado, aceitar a proposta
    acceptProposal({ proposalId: proposal.id, selectedTime: selectedTime! });
    setShowPaymentModal(false);
    setHasPendingPayment(false);
  };

  const handlePaymentError = (error: any) => {
    console.error('Payment error:', error);
    setShowPaymentModal(false);
  };

  const handlePixGenerated = (pixData: any) => {
    console.log('PIX gerado:', pixData);
    setHasPendingPayment(true);
  };

  const handleReject = () => {
    if (confirm('Tem certeza que deseja rejeitar esta proposta?')) {
      rejectProposal(proposal.id);
    }
  };

  return (
    <div className={`p-4 border rounded-lg space-y-3 ${isDisabled ? 'bg-muted opacity-60' : 'bg-card'}`}>
      {/* Informações do Médico */}
      <div className="flex items-start gap-2">
        <User className="h-5 w-5 text-muted-foreground mt-0.5" />
        <div>
          <p className="font-semibold">
            Dr(a). {proposal.doctor?.user?.name || 'Nome não disponível'}
          </p>
          <p className="text-sm text-muted-foreground">
            {proposal.doctor?.user?.email || ''}
          </p>
        </div>
      </div>

      {/* Endereço Completo */}
      <div className="flex items-start gap-2">
        <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
        <div className="text-sm">
          <p className="font-medium">Local de Atendimento:</p>
          <p className="text-muted-foreground">
            {proposal.practiceLocation?.street || 'Rua não informada'}
            {proposal.practiceLocation?.number ? `, ${proposal.practiceLocation.number}` : ''}
          </p>
          <p className="text-muted-foreground">
            {proposal.practiceLocation?.neighborhood || 'Bairro não informado'}
          </p>
          <p className="text-muted-foreground">
            {proposal.practiceLocation?.city || 'Cidade não informada'} - {proposal.practiceLocation?.state || 'UF'}
          </p>
          {proposal.practiceLocation?.zipCode && (
            <p className="text-muted-foreground">
              CEP: {proposal.practiceLocation.zipCode}
            </p>
          )}
        </div>
      </div>

      {/* Preço */}
      <div className="pt-2 border-t">
        <p className="text-lg font-bold text-green-600">
          R$ {proposal.price?.toFixed(2) || '0.00'}
        </p>
      </div>

      {/* Horários Disponíveis */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <p className="text-sm font-medium">Horários Disponíveis:</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {proposal.availableTimes?.map((time: string, index: number) => {
            const timeDate = new Date(time);
            const isSelected = selectedTime === time;
            return (
              <Button
                key={index}
                size="sm"
                variant={isSelected ? 'default' : 'outline'}
                onClick={() => setSelectedTime(time)}
                className="text-xs"
              >
                {timeDate.toLocaleDateString('pt-BR', {
                  day: '2-digit',
                  month: '2-digit',
                })}
                {' às '}
                {timeDate.toLocaleTimeString('pt-BR', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Button>
            );
          })}
        </div>
      </div>

      {/* Status da Proposta */}
      {isDisabled && (
        <div className="pt-2 border-t">
          <Badge variant="secondary" className="w-full justify-center">
            {isClosed ? 'Request Fechado' : 'Proposta Não Disponível'}
          </Badge>
        </div>
      )}

      {/* Botões de Ação */}
      {!isDisabled && (
        <div className="flex gap-2 pt-2">
          <Button 
            size="sm" 
            variant="default" 
            className="flex-1"
            onClick={handleAccept}
            disabled={!selectedTime || isAccepting || isRejecting}
          >
            {isAccepting ? 'Aceitando...' : 'Aceitar e Pagar'}
          </Button>
          <Button 
            size="sm" 
            variant="outline" 
            className="flex-1"
            onClick={handleReject}
            disabled={isAccepting || isRejecting}
          >
            {isRejecting ? 'Rejeitando...' : 'Rejeitar'}
          </Button>
        </div>
      )}

      {/* Botão para reabrir PIX pendente */}
      {hasPendingPayment && !isDisabled && (
        <div className="pt-2 border-t">
          <Button 
            size="sm" 
            variant="secondary" 
            className="w-full"
            onClick={() => setShowPaymentModal(true)}
          >
            <QrCode className="w-4 h-4 mr-2" />
            Ver QR Code do PIX
          </Button>
        </div>
      )}

      {/* Modal de Pagamento */}
      <Dialog open={showPaymentModal} onOpenChange={setShowPaymentModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Finalizar Pagamento</DialogTitle>
            <DialogDescription>
              Complete o pagamento para confirmar a consulta
            </DialogDescription>
          </DialogHeader>
          <MercadoPagoCheckout
            proposalId={proposal.id}
            amount={proposal.price}
            description={`Consulta - Dr(a). ${proposal.doctor?.user?.name}`}
            onSuccess={handlePaymentSuccess}
            onError={handlePaymentError}
            onPixGenerated={handlePixGenerated}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

export function OnCallRequestCard({ request }: OnCallRequestCardProps) {
  const proposalCount = request.proposals?.length || 0;

  console.log('📋 [OnCallRequestCard] Request:', request);
  console.log('📋 [OnCallRequestCard] Proposals:', request.proposals);

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
            <div>
                <CardTitle>
                  {(request as any).activity?.name || 'Atividade não encontrada'}
                </CardTitle>
                <CardDescription>
                    Solicitado em: {new Date(request.createdAt).toLocaleDateString('pt-BR')}
                </CardDescription>
            </div>
            <StatusBadge status={request.status} />
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          Buscando médicos em um raio de <strong>{request.radius} km</strong>.
        </p>
        
        {/* Mostrar propostas */}
        {proposalCount > 0 && (
          <div className="mt-4 space-y-3">
            <p className="text-sm font-semibold">Propostas recebidas:</p>
            {request.proposals?.map((proposal: any) => (
              <ProposalCard key={proposal.id} proposal={proposal} requestStatus={request.status} />
            ))}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <p className="text-sm font-semibold">
          {proposalCount} {proposalCount === 1 ? 'proposta recebida' : 'propostas recebidas'}
        </p>
      </CardFooter>
    </Card>
  );
}