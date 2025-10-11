import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import Api from '@/services/Api'; // Ajuste o caminho se necessário
import { SigninPatientDto } from '@/models/dtos/signin-patient.dto';
import { SigninDoctorDto } from '@/models/dtos/signin-doctor.dto';
import { SignupPatientDto } from '@/models/dtos/signup-patient.dto';
import { SignupDoctorDto } from '@/models/dtos/signup-doctor.dto';
import { User } from '@/models/entities/user.entity';


type UserType = 'patient' | 'doctor';

interface SignInParams {
    credentials: SigninPatientDto | SigninDoctorDto;
    userType: UserType;
}

interface SignUpParams {
    credentials: SignupPatientDto | SignupDoctorDto;
    userType: UserType;
}

// Hook para buscar dados do usuário logado
export const useUser = () => {
    return useQuery<User>({
        queryKey: ['user'],
        queryFn: async () => {
            const response = await Api.getMe();
            if (!response) throw new Error("Failed to fetch user");
            return response.data;
        },
        retry: 1,
    });
};

// Hook genérico para realizar login
export const useSignIn = () => {
    const router = useRouter();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ credentials, userType }: SignInParams) => {
            const apiCall = userType === 'patient' 
                ? Api.signinPatient(credentials as SigninPatientDto) 
                : Api.signinDoctor(credentials as SigninDoctorDto);
            
            const response = await apiCall;
            if (!response) throw new Error("Signin failed");
            
            // Supondo que o login não retorna dados, apenas o cookie httpOnly
            return response.status === 200 || response.status === 201;
        },
        onSuccess: () => {
            toast.success('Login realizado com sucesso!');
            // Invalida a query para que o useUser busque os novos dados
            queryClient.invalidateQueries({ queryKey: ['user'] });
            // Redireciona para um dashboard genérico, que por sua vez redirecionará para o específico
            router.push('/');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Falha no login. Verifique suas credenciais.');
        },
    });
};

// Hook genérico para criar uma nova conta
export const useSignUp = () => {
    const router = useRouter();

    return useMutation({
        mutationFn: async ({ credentials, userType }: SignUpParams) => {
            const apiCall = userType === 'patient'
                ? Api.signupPatient(credentials as SignupPatientDto)
                : Api.signupDoctor(credentials as SignupDoctorDto);
            
            const response = await apiCall;
            if (!response) throw new Error("Signup failed");
            return response.data;
        },
        onSuccess: () => {
            toast.success('Conta criada com sucesso! Faça o login para continuar.');
            router.push('/signin');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Não foi possível criar a conta.');
        },
    });
}