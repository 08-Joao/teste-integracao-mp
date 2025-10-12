'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { CreateOnCallRequestModal } from '@/components/on-call/CreateOnCallRequestModal';
import { OnCallRequestCard } from '@/components/on-call/OnCallRequestCard';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/contexts/AuthContext';
import { useGetPatientOnCallRequests } from '@/lib/hooks/use-on-calls';

// Componente de Skeleton para o estado de carregamento
const OnCallSkeleton = () => (
    <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="p-6 border rounded-lg space-y-3">
                <div className='flex justify-between'>
                    <Skeleton className="h-6 w-1/2" />
                    <Skeleton className="h-6 w-24" />
                </div>
                <Skeleton className="h-4 w-1/3" />
                <div className="flex justify-between pt-4">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-9 w-28" />
                </div>
            </div>
        ))}
    </div>
);

export default function OnCallPage() {
    const [isModalOpen, setModalOpen] = useState(false);
    const { user, isLoading: isUserLoading } = useAuth();
    const { data: onCallRequests, isLoading: isOnCallsLoading, isError } = useGetPatientOnCallRequests(user?.accountId);

    const isLoading = isUserLoading || isOnCallsLoading;

    // A conta do paciente é necessária para criar a solicitação
    // O backend retorna accountId e accountType diretamente no user
    const patientAccountId = user?.accountType === 'CLIENT' ? user?.accountId : undefined;

    return (
        <div className="container mx-auto py-8">
            <header className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">Meus Atendimentos</h1>
                <Button onClick={() => setModalOpen(true)} disabled={!patientAccountId}>
                    Solicitar Atendimento
                </Button>
            </header>

            <main>
                {isLoading && <OnCallSkeleton />}
                {isError && <p className='text-center text-red-500'>Falha ao carregar suas solicitações.</p>}

                {!isLoading && !isError && (
                    onCallRequests && onCallRequests.length > 0 ? (
                        <div className="space-y-4">
                            {onCallRequests.map(request => (
                                <OnCallRequestCard key={request.id} request={request} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-16 border-2 border-dashed rounded-lg">
                            <h2 className="text-xl font-semibold">Nenhuma solicitação encontrada</h2>
                            <p className="text-muted-foreground mt-2">
                                Clique em "Solicitar Atendimento" para encontrar um médico.
                            </p>
                        </div>
                    )
                )}
            </main>

            {/* O modal só é renderizado se tivermos o ID da conta do paciente */}
            {patientAccountId && (
                <CreateOnCallRequestModal
                    isOpen={isModalOpen}
                    onOpenChange={setModalOpen}
                    patientAccountId={patientAccountId}
                />
            )}
        </div>
    );
}