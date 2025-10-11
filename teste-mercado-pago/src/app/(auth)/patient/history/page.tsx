'use client';

import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  useGetPatientOnCallRequests,
  useAcceptOnCallProposal,
  useRejectOnCallProposal,
} from '@/lib/hooks/use-on-calls';
import { OnRequestStatus, OnProposalStatus } from '@/models/enums/on-call-status.enum';
import { Calendar, MapPin, DollarSign, User, CheckCircle } from 'lucide-react';

export default function PatientHistoryPage() {
  const { user, isLoading: isLoadingUser } = useAuth();
  const { data: requests, isLoading } = useGetPatientOnCallRequests(user?.accountId);
  const { mutate: acceptProposal, isPending: isAccepting } = useAcceptOnCallProposal();
  const { mutate: rejectProposal, isPending: isRejecting } = useRejectOnCallProposal();

  const openRequests = requests?.filter((r: any) => r.status === OnRequestStatus.OPEN);
  const closedRequests = requests?.filter((r: any) => r.status === OnRequestStatus.CLOSED);

  const handleAccept = (proposalId: string) => {
    if (!user?.accountId) return;
    acceptProposal({ proposalId, patientAccountId: user.accountId });
  };

  const handleReject = (proposalId: string) => {
    if (!user?.accountId) return;
    rejectProposal({ proposalId, patientAccountId: user.accountId });
  };

  // Aguardar carregamento do usuário antes de verificar
  if (isLoadingUser) {
    return (
      <div className="container mx-auto p-6">
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!user || user.accountType !== 'CLIENT') {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle>Acesso Negado</CardTitle>
            <CardDescription>
              Esta página é exclusiva para clientes.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Minhas Solicitações</h1>
        <p className="text-muted-foreground mt-2">
          Gerencie suas solicitações de atendimento e propostas recebidas
        </p>
      </div>

      {/* Solicitações Abertas */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Solicitações Abertas</h2>
        {isLoading ? (
          <div className="grid gap-4">
            {[1, 2].map((i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-3/4" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-20 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : openRequests && openRequests.length > 0 ? (
          <div className="grid gap-4">
            {openRequests.map((request: any) => (
              <RequestCard
                key={request.id}
                request={request}
                onAccept={handleAccept}
                onReject={handleReject}
                isAccepting={isAccepting}
                isRejecting={isRejecting}
              />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-8">
              <p className="text-muted-foreground">Nenhuma solicitação aberta</p>
            </CardContent>
          </Card>
        )}
      </section>

      {/* Histórico */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Histórico</h2>
        {isLoading ? (
          <div className="grid gap-4">
            {[1, 2].map((i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-3/4" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-20 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : closedRequests && closedRequests.length > 0 ? (
          <div className="grid gap-4">
            {closedRequests.map((request: any) => (
              <HistoryCard key={request.id} request={request} />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-8">
              <p className="text-muted-foreground">Nenhum histórico</p>
            </CardContent>
          </Card>
        )}
      </section>
    </div>
  );
}

interface RequestCardProps {
  request: any;
  onAccept: (proposalId: string) => void;
  onReject: (proposalId: string) => void;
  isAccepting: boolean;
  isRejecting: boolean;
}

function RequestCard({ request, onAccept, onReject, isAccepting, isRejecting }: RequestCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>
              {request.activityDoctorLocation?.activityDoctor?.activity?.name || 'Atividade'}
            </CardTitle>
            <CardDescription className="mt-1">
              Solicitado em {new Date(request.createdAt).toLocaleDateString('pt-BR')}
            </CardDescription>
          </div>
          <Badge>{OnRequestStatus.OPEN}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span>Raio de busca: {request.radius} km</span>
          </div>
        </div>

        {request.proposals && request.proposals.length > 0 ? (
          <div className="space-y-3 pt-4 border-t">
            <h4 className="font-semibold">Propostas Recebidas ({request.proposals.length})</h4>
            {request.proposals.map((proposal: any) => (
              <div key={proposal.id} className="p-3 border rounded-lg space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium flex items-center gap-2">
                      <User className="h-4 w-4" />
                      {proposal.doctor?.user?.name || 'Médico'}
                    </p>
                    {proposal.practiceLocation && (
                      <p className="text-sm text-muted-foreground">
                        {proposal.practiceLocation.city} - {proposal.practiceLocation.state}
                      </p>
                    )}
                  </div>
                  <Badge variant={proposal.status === OnProposalStatus.PROPOSAL_SENT ? 'secondary' : 'default'}>
                    {proposal.status}
                  </Badge>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <DollarSign className="h-4 w-4" />
                  <span>R$ {proposal.price?.toFixed(2)}</span>
                </div>

                {proposal.availableTimes && proposal.availableTimes.length > 0 && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>{new Date(proposal.availableTimes[0]).toLocaleString('pt-BR')}</span>
                  </div>
                )}

                {proposal.status === OnProposalStatus.PROPOSAL_SENT && (
                  <div className="flex gap-2 pt-2">
                    <Button
                      size="sm"
                      onClick={() => onAccept(proposal.id)}
                      disabled={isAccepting || isRejecting}
                      className="flex-1"
                    >
                      {isAccepting ? 'Aceitando...' : 'Aceitar'}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onReject(proposal.id)}
                      disabled={isAccepting || isRejecting}
                      className="flex-1"
                    >
                      {isRejecting ? 'Rejeitando...' : 'Rejeitar'}
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground pt-4 border-t">
            Aguardando propostas de médicos...
          </p>
        )}
      </CardContent>
    </Card>
  );
}

interface HistoryCardProps {
  request: any;
}

function HistoryCard({ request }: HistoryCardProps) {
  const confirmedProposal = request.proposals?.find(
    (p: any) => p.status === OnProposalStatus.CONFIRMED
  );

  return (
    <Card className="border-green-500">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>
              {request.activityDoctorLocation?.activityDoctor?.activity?.name || 'Atividade'}
            </CardTitle>
            <CardDescription className="mt-1">
              {new Date(request.createdAt).toLocaleDateString('pt-BR')}
            </CardDescription>
          </div>
          <Badge variant="default">
            <CheckCircle className="h-3 w-3 mr-1" />
            Confirmado
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {confirmedProposal && (
          <div className="space-y-2">
            <p className="font-medium">Médico: {confirmedProposal.doctor?.user?.name}</p>
            {confirmedProposal.practiceLocation && (
              <p className="text-sm text-muted-foreground">
                Local: {confirmedProposal.practiceLocation.street}, {confirmedProposal.practiceLocation.city}
              </p>
            )}
            <p className="text-sm">Preço: R$ {confirmedProposal.price?.toFixed(2)}</p>
            {confirmedProposal.availableTimes && confirmedProposal.availableTimes.length > 0 && (
              <p className="text-sm">
                Horário: {new Date(confirmedProposal.availableTimes[0]).toLocaleString('pt-BR')}
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
