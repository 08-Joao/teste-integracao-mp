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
import { useSignUp } from '@/lib/hooks/use-auth';
import { SignupPatientDto } from '@/models/dtos/signup-patient.dto';
import { SignupDoctorDto } from '@/models/dtos/signup-doctor.dto';

// Componente reutilizável para o formulário de cadastro
const SignUpForm = ({ userType }: { userType: 'patient' | 'doctor' }) => {
    const { mutate: signUp, isPending } = useSignUp();
    const { register, handleSubmit } = useForm<SignupPatientDto | SignupDoctorDto>();

    const onSubmit = (data: SignupPatientDto | SignupDoctorDto) => {
        signUp({ credentials: data, userType });
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
             <div className="space-y-2">
                <Label htmlFor="name">Nome Completo</Label>
                <Input
                    id="name"
                    type="text"
                    placeholder="Seu nome"
                    required
                    {...register('name')}
                />
            </div>
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
             {/* Adicione mais campos aqui se o DTO de médico for diferente, ex: CRM */}
            {userType === 'doctor' && (
                <div className="space-y-2">
                    <Label htmlFor="crm">CRM</Label>
                    <Input id="crm" type="text" placeholder="123456" required {...register('crm' as any)} />
                </div>
            )}
            <Button type="submit" className="w-full" disabled={isPending}>
                {isPending ? 'Criando conta...' : 'Criar Conta'}
            </Button>
        </form>
    );
};

// Página principal de Cadastro
export default function SignUpPage() {
    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-950">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl">Criar Nova Conta</CardTitle>
                    <CardDescription>
                        Selecione seu tipo de perfil para começar
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Tabs defaultValue="patient" className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="patient">Sou Paciente</TabsTrigger>
                            <TabsTrigger value="doctor">Sou Médico</TabsTrigger>
                        </TabsList>
                        <TabsContent value="patient" className="mt-4">
                            <SignUpForm userType="patient" />
                        </TabsContent>
                        <TabsContent value="doctor" className="mt-4">
                            <SignUpForm userType="doctor" />
                        </TabsContent>
                    </Tabs>
                    <div className="mt-4 text-center text-sm">
                        Já tem uma conta?{' '}
                        <Link href="/signin" className="underline font-medium">
                            Entrar
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}