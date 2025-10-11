'use client';

import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSignIn } from '@/lib/hooks/use-auth';
import { SigninPatientDto } from '@/models/dtos/signin-patient.dto';

// Componente reutilizável para o formulário de loginW
const SignInForm = ({ userType }: { userType: 'patient' | 'doctor' }) => {
    const { mutate: signIn, isPending } = useSignIn();
    const { register, handleSubmit } = useForm<SigninPatientDto>(); // Usamos um DTO base

    const onSubmit = (data: SigninPatientDto) => {
        signIn({ credentials: data, userType });
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    required
                    {...register('email')}
                />
            </div>
            <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input id="password" type="password" required {...register('password')} />
            </div>
            <Button type="submit" className="w-full" disabled={isPending}>
                {isPending ? 'Entrando...' : 'Entrar'}
            </Button>
        </form>
    );
};

// Página principal de Login
export default function SignInPage() {
    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-950">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl">Acessar Conta</CardTitle>
                    <CardDescription>
                        Selecione seu tipo de perfil para continuar
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Tabs defaultValue="patient" className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="patient">Sou Paciente</TabsTrigger>
                            <TabsTrigger value="doctor">Sou Médico</TabsTrigger>
                        </TabsList>
                        <TabsContent value="patient" className="mt-4">
                            <SignInForm userType="patient" />
                        </TabsContent>
                        <TabsContent value="doctor" className="mt-4">
                            <SignInForm userType="doctor" />
                        </TabsContent>
                    </Tabs>
                    <div className="mt-4 text-center text-sm">
                        Não tem uma conta?{' '}
                        <Link href="/signup" className="underline font-medium">
                            Cadastre-se
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}