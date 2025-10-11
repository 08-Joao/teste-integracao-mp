import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import Api from '@/services/Api'; // Ajuste o caminho se necessário
import { CreateOnCallRequestDto, CreateOnCallProposalDto } from '@/models/dtos/create-on-call.dto';
import { OnRequestStatus, OnProposalStatus } from '@/models/enums/on-call-status.enum';
import { ActivityDoctorLocation } from '@/models/entities/activity-doctor-location.entity';

// Supondo uma interface para o objeto de OnCall que a API retorna
export interface OnCallRequest {
    id: string;
    activityDoctorLocationId: string;
    activityDoctorLocation?: ActivityDoctorLocation;
    radius: number;
    status: OnRequestStatus;
    createdAt: string;
    updatedAt: string;
    proposals?: any[]; // Array de propostas de médicos
}

// Hook para buscar todas as solicitações de On-Call do usuário
export const useGetAllOnCalls = () => {
    return useQuery<OnCallRequest[]>({
        queryKey: ['on-calls'],
        queryFn: async () => {
            const response = await Api.getAllOnCalls();
            if (!response) {
                throw new Error("Failed to fetch on-call requests");
            }
            // Garante que sempre retorna um array, mesmo se a API retornar outra coisa
            const data = response.data;
            return Array.isArray(data) ? data : [];
        },
    });
};

// Hook para criar uma nova solicitação de On-Call
export const useCreateOnCallRequest = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: CreateOnCallRequestDto) => {
            console.log('Hook: Creating on-call request with data:', data);
            const response = await Api.createOnCallRequest(data);
            if (!response) {
                throw new Error("Failed to create on-call request");
            }
            console.log('Hook: Request created successfully:', response.data);
            return response.data;
        },
        onSuccess: () => {
            console.log('Hook: onSuccess called');
            toast.success('Solicitação de atendimento enviada com sucesso!');
            // Invalida a query para que a lista na página principal seja atualizada automaticamente
            queryClient.invalidateQueries({ queryKey: ['on-calls'] });
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Não foi possível enviar a solicitação.');
        },
    });
};

// Hook para criar uma proposta de On-Call
export const useCreateOnCallProposal = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: CreateOnCallProposalDto) => {
            const response = await Api.createOnCallProposal(data);
            if (!response) {
                throw new Error("Failed to create on-call proposal");
            }
            return response.data;
        },
        onSuccess: () => {
            toast.success('Proposta enviada com sucesso!');
            queryClient.invalidateQueries({ queryKey: ['on-calls'] });
            queryClient.invalidateQueries({ queryKey: ['open-on-calls'] });
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Não foi possível enviar a proposta.');
        },
    });
};

// Hook para aceitar proposta
export const useAcceptProposal = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ proposalId, selectedTime }: { proposalId: string; selectedTime: string }) => {
            const response = await Api.acceptProposal(proposalId, selectedTime);
            if (!response) {
                throw new Error("Failed to accept proposal");
            }
            return response.data;
        },
        onSuccess: () => {
            toast.success('Proposta aceita com sucesso!');
            queryClient.invalidateQueries({ queryKey: ['on-calls'] });
            queryClient.invalidateQueries({ queryKey: ['patient-on-calls'] });
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Não foi possível aceitar a proposta.');
        },
    });
};

// Hook para rejeitar proposta
export const useRejectProposal = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (proposalId: string) => {
            const response = await Api.rejectProposal(proposalId);
            if (!response) {
                throw new Error("Failed to reject proposal");
            }
            return response.data;
        },
        onSuccess: () => {
            toast.success('Proposta rejeitada.');
            queryClient.invalidateQueries({ queryKey: ['on-calls'] });
            queryClient.invalidateQueries({ queryKey: ['patient-on-calls'] });
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Não foi possível rejeitar a proposta.');
        },
    });
};

// Hook para buscar requests abertos
export const useGetOpenOnCallRequests = () => {
    return useQuery<OnCallRequest[]>({
        queryKey: ['open-on-calls'],
        queryFn: async () => {
            const response = await Api.getOpenOnCallRequests();
            return response?.data || [];
        },
    });
};

// Hook para buscar requests fechados (histórico)
export const useGetClosedOnCallRequests = () => {
    return useQuery<OnCallRequest[]>({
        queryKey: ['closed-on-calls'],
        queryFn: async () => {
            const response = await Api.getClosedOnCallRequests();
            return response?.data || [];
        },
    });
};

// Hook para buscar requests de um paciente
export const useGetPatientOnCallRequests = (patientAccountId?: string, status?: string) => {
    return useQuery<OnCallRequest[]>({
        queryKey: ['patient-on-calls', patientAccountId, status],
        queryFn: async () => {
            if (!patientAccountId) return [];
            const response = await Api.getPatientOnCallRequests(patientAccountId, status);
            return response?.data || [];
        },
        enabled: !!patientAccountId,
    });
};

// Hook para aceitar proposta
export const useAcceptOnCallProposal = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ proposalId, patientAccountId }: { proposalId: string; patientAccountId: string }) => {
            const response = await Api.acceptOnCallProposal(proposalId, patientAccountId);
            if (!response) {
                throw new Error("Failed to accept proposal");
            }
            return response.data;
        },
        onSuccess: () => {
            toast.success('Proposta aceita com sucesso!');
            queryClient.invalidateQueries({ queryKey: ['on-calls'] });
            queryClient.invalidateQueries({ queryKey: ['open-on-calls'] });
            queryClient.invalidateQueries({ queryKey: ['closed-on-calls'] });
            queryClient.invalidateQueries({ queryKey: ['patient-on-calls'] });
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Não foi possível aceitar a proposta.');
        },
    });
};

// Hook para rejeitar proposta
export const useRejectOnCallProposal = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ proposalId, patientAccountId }: { proposalId: string; patientAccountId: string }) => {
            const response = await Api.rejectOnCallProposal(proposalId, patientAccountId);
            if (!response) {
                throw new Error("Failed to reject proposal");
            }
            return response.data;
        },
        onSuccess: () => {
            toast.success('Proposta rejeitada.');
            queryClient.invalidateQueries({ queryKey: ['on-calls'] });
            queryClient.invalidateQueries({ queryKey: ['patient-on-calls'] });
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Não foi possível rejeitar a proposta.');
        },
    });
};