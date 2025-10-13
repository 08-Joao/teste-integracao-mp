'use client';

import { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Api from '@/services/Api';

// Definir a tipagem do usuário
interface User {
    id: string;
    email: string;
    accountType: 'CLIENT' | 'PROFESSIONAL' | 'ADMIN';
    accountId: string;
    profileId: string | null;
}

// Definir a tipagem do valor que o contexto irá fornecer
interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    logout: () => Promise<void>;
}

// Criar o Contexto
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Criar o Provedor (Provider) do Contexto
export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    // Buscar dados do usuário na montagem inicial
    useEffect(() => {
        let isMounted = true;

        const fetchUser = async () => {
            try {
                const response = await Api.getMe();
                if (isMounted && response && response.data.authenticated) {
                    setUser(response.data.user as User);
                }
            } catch (error) {
                // Usuário não autenticado, mantém user como null
                // O interceptor já vai redirecionar para /signin
                if (isMounted) {
                    setUser(null);
                }
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        };

        fetchUser();

        return () => {
            isMounted = false;
        };
    }, []);

    // Função de logout
    const logout = async () => {
        try {
            await Api.signout();
        } catch (error) {
            console.error('Erro no logout:', error);
        } finally {
            setUser(null);
            router.push('/signin');
        }
    };

    // Montamos o valor que será disponibilizado para toda a aplicação
    const value: AuthContextType = {
        user,
        isLoading,
        logout,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Criar um hook customizado para facilitar o uso do contexto
export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}