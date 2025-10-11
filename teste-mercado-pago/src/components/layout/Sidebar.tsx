'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import {
    LayoutDashboard,
    Stethoscope,
    Calendar,
    LogOut,
    HeartPulse,
    Settings,
    History,
    ClipboardList
} from 'lucide-react';

const patientRoutes = [
    { href: '/patient/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/on-call', label: 'Atendimentos', icon: Stethoscope },
    { href: '/patient/history', label: 'Histórico', icon: History },
    { href: '/appointments', label: 'Consultas', icon: Calendar },
];

const doctorRoutes = [
    { href: '/doctor/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/doctor/setup', label: 'Configuração', icon: Settings },
    { href: '/on-call/proposals', label: 'Propostas', icon: HeartPulse },
    { href: '/on-call/history', label: 'Histórico', icon: ClipboardList },
    { href: '/appointments', label: 'Consultas', icon: Calendar },
];

const SidebarSkeleton = () => (
    <aside className="w-64 h-screen p-4 border-r flex flex-col">
        <div className="mb-8">
            <Skeleton className="h-8 w-32" />
        </div>
        <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
        </div>
        <div className="mt-auto space-y-2">
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-10 w-full" />
        </div>
    </aside>
);

export function Sidebar() {
    const { user, logout, isLoading } = useAuth();
    const pathname = usePathname();

    if (isLoading) {
        return <SidebarSkeleton />;
    }
    
    // Define as rotas com base no tipo de conta do usuário
    const routes = user?.accountType === 'PROFESSIONAL' ? doctorRoutes : patientRoutes;

    return (
        <aside className="w-64 h-screen p-4 bg-background border-r flex flex-col">
            <div className="mb-10">
                <h1 className="text-2xl font-bold text-primary">Teste</h1>
            </div>
            <nav className="flex-1">
                <ul className="space-y-2">
                    {routes.map((route) => (
                        <li key={route.href}>
                            <Link href={route.href}>
                                <span
                                    className={cn(
                                        'flex items-center gap-3 p-3 rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground',
                                        pathname === route.href && 'bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground'
                                    )}
                                >
                                    <route.icon className="h-5 w-5" />
                                    {route.label}
                                </span>
                            </Link>
                        </li>
                    ))}
                </ul>
            </nav>
            <div className="mt-auto">
                <div className='mb-4 text-center'>
                    <p className='text-sm font-medium'>{user?.email}</p>
                    <p className='text-xs text-muted-foreground'>{user?.accountType === 'PROFESSIONAL' ? 'Médico(a)' : 'Cliente'}</p>
                </div>
                <Button variant="outline" className="w-full" onClick={logout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Sair
                </Button>
            </div>
        </aside>
    );
}