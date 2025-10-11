import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import Api from '@/services/Api';
import { CreateActivityDto } from '@/models/dtos/create-activity.dto';
import { UpdateActivityDto } from '@/models/dtos/update-activity.dto';

export const useGetAllActivities = () => {
    return useQuery({
        queryKey: ['activities'],
        queryFn: async () => {
            const response = await Api.getAllActivities();
            return response?.data || [];
        },
    });
};

export const useCreateActivity = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: CreateActivityDto) => {
            const response = await Api.createActivity(data);
            if (!response) {
                throw new Error("Failed to create activity");
            }
            return response.data;
        },
        onSuccess: () => {
            toast.success('Atividade criada com sucesso!');
            queryClient.invalidateQueries({ queryKey: ['activities'] });
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Não foi possível criar a atividade.');
        },
    });
};
