'use client';

import { createContext, useContext, ReactNode } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import Api from '@/services/Api'; // Ajuste o caminho conforme necessário

// 1. Definir a tipagem do usuário com base no retorno da sua API
interface User {
    id: string;
    email: string;
    accountType: 'CLIENT' | 'PROFESSIONAL' | 'ADMIN';
    accountId: string;
    profileId: string | null; // ID do DoctorProfile ou PatientProfile
}

// 2. Definir a tipagem do valor que o contexto irá fornecer
interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    logout: () => void;
}

// 3. Criar o Contexto
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 4. Criar o Provedor (Provider) do Contexto
export function AuthProvider({ children }: { children: ReactNode }) {
    const queryClient = useQueryClient();
    const router = useRouter();

    // Usamos React Query para buscar e gerenciar o estado do usuário
    const { data: user, isLoading, isError } = useQuery({
        queryKey: ['user'],
        queryFn: async () => {
            const response = await Api.getMe();
            if (!response || !response.data.authenticated) {
                throw new Error("User not authenticated");
            }
            return response.data.user as User;
        },
        retry: false, // Não tenta novamente em caso de falha (ex: 401)
        refetchOnWindowFocus: false,
        staleTime: 5 * 60 * 1000, // 5 minutos - evita chamadas desnecessárias
        gcTime: 10 * 60 * 1000, // 10 minutos - mantém em cache
    });

    // Mutação para realizar o logout
    const { mutate: signOut } = useMutation({
        mutationFn: Api.signout,
        onSuccess: () => {
            queryClient.clear(); // Limpa todo o cache do React Query
            router.push('/signin');
        },
        onError: () => {
            toast.error('Não foi possível fazer logout. Tente novamente.');
        },
    });

    // Montamos o valor que será disponibilizado para toda a aplicação
    const value: AuthContextType = {
        user: user || null,
        isLoading,
        logout: signOut,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// 5. Criar um hook customizado para facilitar o uso do contexto
export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}