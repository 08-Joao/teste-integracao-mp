'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from 'react-hook-form';
import { useGetAllSpecialties, useCreateSpecialty } from '@/lib/hooks/use-specialties';
import { Plus, Trash2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function AdminSpecialtiesPage() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Gerenciar Especialidades</h1>
        <p className="text-muted-foreground mt-2">
          Página de administração para criar e gerenciar especialidades médicas
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <CreateSpecialtyCard />
        <SpecialtiesListCard />
      </div>
    </div>
  );
}

function CreateSpecialtyCard() {
  const { register, handleSubmit, reset } = useForm();
  const { mutate: createSpecialty, isPending } = useCreateSpecialty();

  const onSubmit = (data: any) => {
    createSpecialty(data, {
      onSuccess: () => {
        reset();
      },
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Criar Nova Especialidade</CardTitle>
        <CardDescription>
          Adicione uma nova especialidade médica ao sistema
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome da Especialidade *</Label>
            <Input
              id="name"
              placeholder="Ex: Cardiologia"
              {...register('name', { required: true })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              placeholder="Descreva a especialidade..."
              rows={3}
              {...register('description')}
            />
          </div>

          <Button type="submit" className="w-full" disabled={isPending}>
            <Plus className="w-4 h-4 mr-2" />
            {isPending ? 'Criando...' : 'Criar Especialidade'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function SpecialtiesListCard() {
  const { data: specialties, isLoading } = useGetAllSpecialties();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Especialidades Cadastradas</CardTitle>
        <CardDescription>
          Lista de todas as especialidades no sistema
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        ) : Array.isArray(specialties) && specialties.length > 0 ? (
          <div className="space-y-3 max-h-[500px] overflow-y-auto">
            {specialties.map((specialty: any) => (
              <div key={specialty.id} className="p-4 border rounded-lg space-y-2">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-semibold">{specialty.name}</h3>
                  </div>
                  <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                {specialty.description && (
                  <p className="text-sm text-muted-foreground">{specialty.description}</p>
                )}
                <div className="text-xs">
                  <span className="px-2 py-1 rounded bg-blue-100 text-blue-700">
                    ID: {specialty.id}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <p>Nenhuma especialidade cadastrada ainda.</p>
            <p className="text-sm mt-2">Crie a primeira especialidade usando o formulário ao lado.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
