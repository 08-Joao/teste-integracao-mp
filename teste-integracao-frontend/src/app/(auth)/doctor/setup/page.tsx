'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
  useGetAllActivities,
  useGetPracticeLocations,
  useCreatePracticeLocation,
  useGetActivityDoctors,
  useCreateActivityDoctor,
  useGetActivityDoctorLocations,
  useCreateActivityDoctorLocation,
} from '@/lib/hooks/use-doctor-setup';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import { toast } from 'sonner';
import { Building2, MapPin, Activity as ActivityIcon, Plus } from 'lucide-react';

export default function DoctorSetupPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('activities');

  if (user?.accountType !== 'PROFESSIONAL') {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle>Acesso Negado</CardTitle>
            <CardDescription>
              Esta página é exclusiva para profissionais de saúde.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Configuração do Perfil Profissional</h1>
        <p className="text-muted-foreground mt-2">
          Configure suas atividades, locais de atendimento e disponibilidade
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="activities">
            <ActivityIcon className="w-4 h-4 mr-2" />
            Atividades
          </TabsTrigger>
          <TabsTrigger value="locations">
            <MapPin className="w-4 h-4 mr-2" />
            Locais de Prática
          </TabsTrigger>
          <TabsTrigger value="activity-locations">
            <Building2 className="w-4 h-4 mr-2" />
            Atividades por Local
          </TabsTrigger>
        </TabsList>

        <TabsContent value="activities" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Minhas Atividades</CardTitle>
              <CardDescription>
                Vincule atividades médicas ao seu perfil. As atividades disponíveis são cadastradas pelos administradores do sistema.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ActivityManagement />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="locations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Locais de Atendimento</CardTitle>
              <CardDescription>
                Cadastre os endereços onde você atende
              </CardDescription>
            </CardHeader>
            <CardContent>
              <LocationManagement />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity-locations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Vincular Atividades aos Locais</CardTitle>
              <CardDescription>
                Defina preços e disponibilidade para cada atividade em cada local
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ActivityLocationManagement />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Component for Activity Management
function ActivityManagement() {
  const { user } = useAuth();
  const { register, handleSubmit, reset, control } = useForm();
  const { mutate: createActivity, isPending } = useCreateActivityDoctor();
  const { data: activities } = useGetActivityDoctors(user?.profileId || undefined);
  const { data: allActivities, isLoading: isLoadingActivities } = useGetAllActivities();

  const onSubmit = async (data: any) => {
    if (!user?.profileId) return;
    createActivity({
      ...data,
      doctorProfileId: user.profileId,
      estimatedDuration: Number(data.estimatedDuration),
    }, {
      onSuccess: () => reset(),
    });
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="activityId">Atividade</Label>
          <Controller
            name="activityId"
            control={control}
            rules={{ required: true }}
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma atividade" />
                </SelectTrigger>
                <SelectContent>
                  {isLoadingActivities ? (
                    <SelectItem value="loading" disabled>
                      Carregando...
                    </SelectItem>
                  ) : Array.isArray(allActivities) && allActivities.length > 0 ? (
                    allActivities.map((activity: any) => (
                      <SelectItem key={activity.id} value={activity.id}>
                        {activity.name} - {activity.specialty?.name}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="empty" disabled>
                      Nenhuma atividade disponível
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            )}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="estimatedDuration">Duração Estimada (minutos)</Label>
          <Input
            id="estimatedDuration"
            type="number"
            placeholder="Ex: 30"
            {...register('estimatedDuration', { required: true, valueAsNumber: true })}
          />
        </div>

        <Button type="submit" className="w-full" disabled={isPending}>
          <Plus className="w-4 h-4 mr-2" />
          {isPending ? 'Cadastrando...' : 'Adicionar Atividade'}
        </Button>
      </form>

      <div className="border-t pt-4">
        <h3 className="font-semibold mb-4">Atividades Cadastradas</h3>
        {Array.isArray(activities) && activities.length > 0 ? (
          <div className="space-y-2">
            {activities.map((activity: any) => (
              <div key={activity.id} className="p-3 border rounded-lg">
                <p className="font-medium">{activity.activity?.name}</p>
                <p className="text-sm text-muted-foreground">
                  Duração: {activity.estimatedDuration} min
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            Nenhuma atividade cadastrada ainda.
          </p>
        )}
      </div>
    </div>
  );
}

// Component for Location Management
function LocationManagement() {
  const { user } = useAuth();
  const { register, handleSubmit, reset } = useForm();
  const { mutate: createLocation, isPending } = useCreatePracticeLocation();
  const { data: locations } = useGetPracticeLocations(user?.profileId || undefined);

  // Debug
  console.log('User in LocationManagement:', user);
  console.log('ProfileId:', user?.profileId);

  const onSubmit = async (data: any) => {
    if (!user?.profileId) {
      console.error('ProfileId is missing!', user);
      return;
    }
    createLocation({
      ...data,
      doctorProfileId: user.profileId,
    }, {
      onSuccess: () => reset(),
    });
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="zipCode">CEP</Label>
            <Input
              id="zipCode"
              placeholder="00000-000"
              {...register('zipCode', { required: true })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="street">Rua</Label>
            <Input
              id="street"
              placeholder="Nome da rua"
              {...register('street', { required: true })}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="neighborhood">Bairro</Label>
            <Input
              id="neighborhood"
              placeholder="Nome do bairro"
              {...register('neighborhood', { required: true })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="complement">Complemento</Label>
            <Input
              id="complement"
              placeholder="Apto, sala, etc"
              {...register('complement')}
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="city">Cidade</Label>
            <Input
              id="city"
              placeholder="Cidade"
              {...register('city', { required: true })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="state">Estado</Label>
            <Input
              id="state"
              placeholder="UF"
              maxLength={2}
              {...register('state', { required: true })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="country">País</Label>
            <Input
              id="country"
              placeholder="Brasil"
              defaultValue="Brasil"
              {...register('country', { required: true })}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="coordinates">Coordenadas (lat,lng)</Label>
          <Input
            id="coordinates"
            placeholder="-23.550520,-46.633308"
            {...register('coordinates', { required: true })}
          />
          <p className="text-xs text-muted-foreground">
            Use o formato: latitude,longitude
          </p>
        </div>

        <Button type="submit" className="w-full" disabled={isPending}>
          <Plus className="w-4 h-4 mr-2" />
          {isPending ? 'Cadastrando...' : 'Adicionar Local'}
        </Button>
      </form>

      <div className="border-t pt-4">
        <h3 className="font-semibold mb-4">Locais Cadastrados</h3>
        {Array.isArray(locations) && locations.length > 0 ? (
          <div className="space-y-2">
            {locations.map((location: any) => (
              <div key={location.id} className="p-3 border rounded-lg">
                <p className="font-medium">{location.street}, {location.neighborhood}</p>
                <p className="text-sm text-muted-foreground">
                  {location.city} - {location.state}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            Nenhum local cadastrado ainda.
          </p>
        )}
      </div>
    </div>
  );
}

// Component for Activity-Location Management
function ActivityLocationManagement() {
  const { user } = useAuth();
  const { register, handleSubmit, reset, control } = useForm();
  const { mutate: createLink, isPending } = useCreateActivityDoctorLocation();
  const { data: links } = useGetActivityDoctorLocations(user?.profileId || undefined);
  const { data: activityDoctors } = useGetActivityDoctors(user?.profileId || undefined);
  const { data: practiceLocations } = useGetPracticeLocations(user?.profileId || undefined);

  const onSubmit = async (data: any) => {
    createLink({
      ...data,
      price: Number(data.price),
    }, {
      onSuccess: () => reset(),
    });
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="activityDoctorId">Atividade</Label>
          <Controller
            name="activityDoctorId"
            control={control}
            rules={{ required: true }}
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma atividade" />
                </SelectTrigger>
                <SelectContent>
                  {Array.isArray(activityDoctors) && activityDoctors.length > 0 ? (
                    activityDoctors.map((ad: any) => (
                      <SelectItem key={ad.id} value={ad.id}>
                        {ad.activity?.name} ({ad.estimatedDuration} min)
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="empty" disabled>
                      Cadastre uma atividade primeiro
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            )}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="practiceLocationId">Local de Atendimento</Label>
          <Controller
            name="practiceLocationId"
            control={control}
            rules={{ required: true }}
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um local" />
                </SelectTrigger>
                <SelectContent>
                  {Array.isArray(practiceLocations) && practiceLocations.length > 0 ? (
                    practiceLocations.map((location: any) => (
                      <SelectItem key={location.id} value={location.id}>
                        {location.street}, {location.neighborhood} - {location.city}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="empty" disabled>
                      Cadastre um local primeiro
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            )}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="price">Preço (R$)</Label>
          <Input
            id="price"
            type="number"
            step="0.01"
            placeholder="Ex: 150.00"
            {...register('price', { required: true, valueAsNumber: true })}
          />
        </div>

        <Button type="submit" className="w-full" disabled={isPending}>
          <Plus className="w-4 h-4 mr-2" />
          {isPending ? 'Criando...' : 'Criar Vínculo'}
        </Button>
      </form>

      <div className="border-t pt-4">
        <h3 className="font-semibold mb-4">Vínculos Criados</h3>
        {Array.isArray(links) && links.length > 0 ? (
          <div className="space-y-2">
            {links.map((link: any) => (
              <div key={link.id} className="p-3 border rounded-lg">
                <p className="font-medium">
                  {link.activityDoctor?.activity?.name}
                </p>
                <p className="text-sm text-muted-foreground">
                  Local: {link.practiceLocation?.city} - R$ {link.price?.toFixed(2)}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            Nenhum vínculo criado ainda.
          </p>
        )}
      </div>
    </div>
  );
}
