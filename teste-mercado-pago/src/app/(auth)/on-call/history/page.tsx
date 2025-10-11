'use client';

import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useGetClosedOnCallRequests } from '@/lib/hooks/use-on-calls';
import { OnProposalStatus } from '@/models/enums/on-call-status.enum';
import { Calendar, MapPin, DollarSign, CheckCircle, XCircle } from 'lucide-react';

export default function HistoryPage() {
  const { user, isLoading: isLoadingUser } = useAuth();
  const { data: closedRequests, isLoading } = useGetClosedOnCallRequests();

  // Filtrar apenas requests onde o médico enviou proposta
  const myHistory = closedRequests?.filter((request: any) => {
    return request.proposals?.some(
      (proposal: any) => proposal.doctorAccountId === user?.accountId
    );
  });

  // Aguardar carregamento do usuário antes de verificar
  if (isLoadingUser) {
    return (
      <div className="container mx-auto p-6">
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (user?.accountType !== 'PROFESSIONAL') {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle>Acesso Negado</CardTitle>
            <CardDescription>
              Esta página é exclusiva para profissionais de saúde.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Histórico de Propostas</h1>
        <p className="text-muted-foreground mt-2">
          Veja o histórico das suas propostas enviadas
        </p>
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2 mt-2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : myHistory && myHistory.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {myHistory.map((request: any) => {
            const myProposal = request.proposals?.find(
              (p: any) => p.doctorAccountId === user?.accountId
            );
            return (
              <HistoryCard key={request.id} request={request} proposal={myProposal} />
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhum histórico</h3>
            <p className="text-sm text-muted-foreground text-center max-w-md">
              Você ainda não tem propostas finalizadas.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

interface HistoryCardProps {
  request: any;
  proposal: any;
}

function HistoryCard({ request, proposal }: HistoryCardProps) {
  const isConfirmed = proposal?.status === OnProposalStatus.CONFIRMED;
  const isCancelled = proposal?.status === OnProposalStatus.CANCELLED;

  return (
    <Card className={isConfirmed ? 'border-green-500' : isCancelled ? 'border-red-500' : ''}>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">
              {request.activityDoctorLocation?.activityDoctor?.activity?.name || 'Atividade'}
            </CardTitle>
            <CardDescription className="mt-1">
              {new Date(request.createdAt).toLocaleDateString('pt-BR')}
            </CardDescription>
          </div>
          <Badge variant={isConfirmed ? 'default' : 'secondary'}>
            {isConfirmed ? (
              <span className="flex items-center gap-1">
                <CheckCircle className="h-3 w-3" />
                Confirmado
              </span>
            ) : isCancelled ? (
              <span className="flex items-center gap-1">
                <XCircle className="h-3 w-3" />
                Cancelado
              </span>
            ) : (
              'Enviado'
            )}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-2 text-sm">
          {proposal?.practiceLocation && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>
                {proposal.practiceLocation.city} - {proposal.practiceLocation.state}
              </span>
            </div>
          )}

          <div className="flex items-center gap-2 text-muted-foreground">
            <DollarSign className="h-4 w-4" />
            <span>Seu preço: R$ {proposal?.price?.toFixed(2)}</span>
          </div>

          {proposal?.availableTimes && proposal.availableTimes.length > 0 && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>
                {new Date(proposal.availableTimes[0]).toLocaleString('pt-BR')}
              </span>
            </div>
          )}
        </div>

        {isConfirmed && (
          <div className="pt-3 border-t">
            <p className="text-sm font-medium text-green-600">
              ✓ Sua proposta foi aceita pelo paciente!
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
