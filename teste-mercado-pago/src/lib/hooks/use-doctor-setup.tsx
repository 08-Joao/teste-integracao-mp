import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import Api from '@/services/Api';
import { CreatePracticeLocationDto } from '@/models/dtos/practice-location.dto';
import { CreateActivityDoctorDto } from '@/models/dtos/activity-doctor.dto';
import { CreateActivityDoctorLocationDto } from '@/models/dtos/activity-doctor-location.dto';

// Activities
export const useGetAllActivities = () => {
    return useQuery({
        queryKey: ['activities'],
        queryFn: async () => {
            const response = await Api.getAllActivities();
            return response?.data || [];
        },
    });
};

// Practice Locations
export const useGetPracticeLocations = (doctorProfileId?: string) => {
    return useQuery({
        queryKey: ['practice-locations', doctorProfileId],
        queryFn: async () => {
            const response = await Api.getPracticeLocations(doctorProfileId);
            return response?.data || [];
        },
        enabled: !!doctorProfileId,
    });
};

export const useCreatePracticeLocation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: CreatePracticeLocationDto) => {
            const response = await Api.createPracticeLocation(data);
            return response?.data;
        },
        onSuccess: () => {
            toast.success('Local cadastrado com sucesso!');
            queryClient.invalidateQueries({ queryKey: ['practice-locations'] });
        },
        onError: () => {
            toast.error('Erro ao cadastrar local');
        },
    });
};

// Activity Doctors
export const useGetActivityDoctors = (doctorProfileId?: string) => {
    return useQuery({
        queryKey: ['activity-doctors', doctorProfileId],
        queryFn: async () => {
            const response = await Api.getActivityDoctors(doctorProfileId);
            return response?.data || [];
        },
        enabled: !!doctorProfileId,
    });
};

export const useCreateActivityDoctor = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: CreateActivityDoctorDto) => {
            const response = await Api.createActivityDoctor(data);
            return response?.data;
        },
        onSuccess: () => {
            toast.success('Atividade cadastrada com sucesso!');
            queryClient.invalidateQueries({ queryKey: ['activity-doctors'] });
        },
        onError: () => {
            toast.error('Erro ao cadastrar atividade');
        },
    });
};

// Activity Doctor Locations
export const useGetActivityDoctorLocations = (doctorProfileId?: string) => {
    return useQuery({
        queryKey: ['activity-doctor-locations', doctorProfileId],
        queryFn: async () => {
            const response = await Api.getActivityDoctorLocations(doctorProfileId);
            return response?.data || [];
        },
        enabled: !!doctorProfileId, // Só busca se tiver doctorProfileId
    });
};

// Buscar todos os ActivityDoctorLocations disponíveis (para clientes selecionarem)
export const useGetAllActivityDoctorLocations = () => {
    return useQuery({
        queryKey: ['all-activity-doctor-locations'],
        queryFn: async () => {
            const response = await Api.getActivityDoctorLocations();
            return response?.data || [];
        },
    });
};

export const useCreateActivityDoctorLocation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: CreateActivityDoctorLocationDto) => {
            const response = await Api.createActivityDoctorLocation(data);
            return response?.data;
        },
        onSuccess: () => {
            toast.success('Vínculo criado com sucesso!');
            queryClient.invalidateQueries({ queryKey: ['activity-doctor-locations'] });
        },
        onError: () => {
            toast.error('Erro ao criar vínculo');
        },
    });
};
