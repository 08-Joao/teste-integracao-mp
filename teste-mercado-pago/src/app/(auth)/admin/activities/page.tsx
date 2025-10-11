'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useForm, Controller } from 'react-hook-form';
import { useGetAllSpecialties } from '@/lib/hooks/use-specialties';
import { useGetAllActivities, useCreateActivity } from '@/lib/hooks/use-activities';
import { Plus, Trash2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function AdminActivitiesPage() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Gerenciar Atividades</h1>
        <p className="text-muted-foreground mt-2">
          Página de administração para criar e gerenciar atividades médicas no sistema
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <CreateActivityCard />
        <ActivitiesListCard />
      </div>
    </div>
  );
}

function CreateActivityCard() {
  const { register, handleSubmit, reset, control } = useForm();
  const { data: specialties, isLoading: isLoadingSpecialties } = useGetAllSpecialties();
  const { mutate: createActivity, isPending } = useCreateActivity();

  const onSubmit = (data: any) => {
    createActivity(data, {
      onSuccess: () => {
        reset();
      },
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Criar Nova Atividade</CardTitle>
        <CardDescription>
          Adicione uma nova atividade médica ao sistema
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome da Atividade *</Label>
            <Input
              id="name"
              placeholder="Ex: Consulta de Rotina"
              {...register('name', { required: true })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              placeholder="Descreva a atividade..."
              rows={3}
              {...register('description')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="specialtyId">Especialidade *</Label>
            <Controller
              name="specialtyId"
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma especialidade" />
                  </SelectTrigger>
                  <SelectContent>
                    {isLoadingSpecialties ? (
                      <SelectItem value="loading" disabled>
                        Carregando...
                      </SelectItem>
                    ) : Array.isArray(specialties) && specialties.length > 0 ? (
                      specialties.map((specialty: any) => (
                        <SelectItem key={specialty.id} value={specialty.id}>
                          {specialty.name}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="empty" disabled>
                        Nenhuma especialidade disponível
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              )}
            />
            <p className="text-xs text-muted-foreground">
              Se não houver especialidades, crie uma primeiro em /admin/specialties
            </p>
          </div>

          <Button type="submit" className="w-full" disabled={isPending}>
            <Plus className="w-4 h-4 mr-2" />
            {isPending ? 'Criando...' : 'Criar Atividade'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function ActivitiesListCard() {
  const { data: activities, isLoading } = useGetAllActivities();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Atividades Cadastradas</CardTitle>
        <CardDescription>
          Lista de todas as atividades no sistema
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        ) : Array.isArray(activities) && activities.length > 0 ? (
          <div className="space-y-3 max-h-[500px] overflow-y-auto">
            {activities.map((activity: any) => (
              <div key={activity.id} className="p-4 border rounded-lg space-y-2">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-semibold">{activity.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {activity.specialty?.name || 'Sem especialidade'}
                    </p>
                  </div>
                  <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                {activity.description && (
                  <p className="text-sm text-muted-foreground">{activity.description}</p>
                )}
                <div className="flex gap-2 text-xs">
                  <span className="px-2 py-1 rounded bg-blue-100 text-blue-700">
                    ID: {activity.id}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <p>Nenhuma atividade cadastrada ainda.</p>
            <p className="text-sm mt-2">Crie a primeira atividade usando o formulário ao lado.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
