import { useQuery } from '@tanstack/react-query';
import Api from '@/services/Api';
import { Service } from '@/models/entities/service.entity';

// Hook para buscar todos os serviços disponíveis
export const useGetAllServices = () => {
    return useQuery<Service[]>({
        queryKey: ['services'],
        queryFn: async () => {
            const response = await Api.getAllServices();
            if (!response) {
                throw new Error("Failed to fetch services");
            }
            const data = response.data;
            return Array.isArray(data) ? data : [];
        },
    });
};
