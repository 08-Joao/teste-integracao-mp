import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import Api from '@/services/Api';
import { CreateSpecialtyDto } from '@/models/dtos/create-specialty.dto';
import { UpdateSpecialtyDto } from '@/models/dtos/update-specialty.dto';

export const useGetAllSpecialties = () => {
    return useQuery({
        queryKey: ['specialties'],
        queryFn: async () => {
            const response = await Api.getAllSpecialties();
            return response?.data || [];
        },
    });
};

export const useCreateSpecialty = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: CreateSpecialtyDto) => {
            const response = await Api.createSpecialty(data);
            if (!response) {
                throw new Error("Failed to create specialty");
            }
            return response.data;
        },
        onSuccess: () => {
            toast.success('Especialidade criada com sucesso!');
            queryClient.invalidateQueries({ queryKey: ['specialties'] });
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Não foi possível criar a especialidade.');
        },
    });
};
