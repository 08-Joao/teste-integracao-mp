'use client';

import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { Sidebar } from '@/components/layout/Sidebar';
import { Navbar } from '@/components/layout/Navbar';
import { redirect } from 'next/navigation';
import { useEffect } from 'react';
import { useNotifications } from '@/lib/hooks/use-notifications';

// Criamos um componente interno para poder usar o hook useAuth
// depois que o AuthProvider já estiver no DOM.
function DashboardLayout({ children }: { children: React.ReactNode }) {
    const { isLoading, user } = useAuth();
    
    // Inicializar sistema de notificações
    useNotifications();

    // Efeito para redirecionar se o usuário não for encontrado após o carregamento
    useEffect(() => {
        if (!isLoading && !user) {
            redirect('/signin');
        }
    }, [isLoading, user]);

    // O skeleton da Sidebar já cobre o estado de loading inicial
    if (isLoading) {
        return (
            <div className="flex min-h-screen">
                <Sidebar />
                <main className="flex-1 p-8 bg-muted/40">
                    {/* Pode adicionar um skeleton para o conteúdo da página aqui também */}
                </main>
            </div>
        )
    }

    // Se o usuário existir, renderiza o layout completo
    if (user) {
        return (
            <div className="flex min-h-screen">
                <Sidebar />
                <div className="flex-1 flex flex-col">
                    <Navbar />
                    <main className="flex-1 p-8 bg-muted/40 overflow-y-auto">
                        {children}
                    </main>
                </div>
            </div>
        );
    }

    // Retorno nulo enquanto redireciona para evitar renderização indesejada
    return null;
}


// O export default envolve o layout com o provider
export default function AuthLayout({ children }: { children: React.ReactNode }) {
    return (
        <AuthProvider>
            <DashboardLayout>{children}</DashboardLayout>
        </AuthProvider>
    );
}