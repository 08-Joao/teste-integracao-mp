'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useGetOpenOnCallRequests, useCreateOnCallProposal } from '@/lib/hooks/use-on-calls';
import { OnRequestStatus } from '@/models/enums/on-call-status.enum';
import { Calendar, MapPin, DollarSign, Clock, X } from 'lucide-react';
import { useForm, Controller } from 'react-hook-form';

export default function ProposalsPage() {
  const { user } = useAuth();
  const { data: onCallRequests, isLoading } = useGetOpenOnCallRequests();

  // Filtrar apenas requests que ainda não têm proposta deste médico
  const availableRequests = onCallRequests?.filter((request: any) => {
    // Verificar se o médico já enviou proposta
    const hasProposal = request.proposals?.some(
      (proposal: any) => proposal.doctorAccountId === user?.accountId
    );
    return !hasProposal;
  });

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
        <h1 className="text-3xl font-bold">Solicitações de Atendimento</h1>
        <p className="text-muted-foreground mt-2">
          Veja as solicitações de atendimento próximas a você e envie suas propostas
        </p>
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2 mt-2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : availableRequests && availableRequests.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {availableRequests.map((request: any) => (
            <OnCallRequestCard key={request.id} request={request} />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhuma solicitação disponível</h3>
            <p className="text-sm text-muted-foreground text-center max-w-md">
              No momento não há solicitações de atendimento na sua região ou você já enviou propostas para todas.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

interface OnCallRequestCardProps {
  request: any;
}

function OnCallRequestCard({ request }: OnCallRequestCardProps) {
  const { user } = useAuth();
  const [showProposalForm, setShowProposalForm] = useState(false);
  const [selectedTimes, setSelectedTimes] = useState<string[]>([]);
  const [availableLocations, setAvailableLocations] = useState<any[]>([]);
  const { register, handleSubmit, reset, control, watch } = useForm();
  const { mutate: createProposal, isPending } = useCreateOnCallProposal();
  
  const selectedLocationId = watch('practiceLocationId');

  // Buscar locais filtrados pela atividade
  useEffect(() => {
    console.log('📍 [Proposals] useEffect triggered');
    console.log('📍 [Proposals] User:', user);
    console.log('📍 [Proposals] Request:', request);
    
    if (!user?.profileId || !request?.activityId) {
      console.log('⚠️ [Proposals] Missing data:', { 
        profileId: user?.profileId, 
        activityId: request?.activityId,
        hasUser: !!user,
        hasRequest: !!request 
      });
      return;
    }

    const fetchLocations = async () => {
      try {
        console.log('📍 [Proposals] Fetching locations for doctor:', user.profileId);
        console.log('📍 [Proposals] Activity needed:', request.activityId);
        
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4003';
        const url = `${backendUrl}/api/activity-doctor-locations?doctorProfileId=${user.profileId}`;
        console.log('📍 [Proposals] Full URL:', url);
        
        const response = await fetch(url, { credentials: 'include' });
        
        console.log('📍 [Proposals] Response status:', response.status);
        console.log('📍 [Proposals] Response ok:', response.ok);
        
        if (response.ok) {
          const data = await response.json();
          console.log('📍 [Proposals] All locations received:', data.length);
          console.log('📍 [Proposals] Locations data:', JSON.stringify(data, null, 2));
          
          const filtered = data.filter((adl: any) => {
            const matches = adl.activityDoctor?.activityId === request.activityId;
            console.log('📍 [Proposals] Checking location:', {
              id: adl.id,
              activityDoctorId: adl.activityDoctorId,
              activityDoctor: adl.activityDoctor,
              activityIdFromDoctor: adl.activityDoctor?.activityId,
              requestActivityId: request.activityId,
              matches: matches
            });
            return matches;
          });
          
          console.log('📍 [Proposals] Filtered locations:', filtered.length);
          console.log('📍 [Proposals] Filtered data:', JSON.stringify(filtered, null, 2));
          setAvailableLocations(filtered);
        } else {
          const errorText = await response.text();
          console.error('📍 [Proposals] Failed to fetch:', response.status, errorText);
        }
      } catch (error) {
        console.error('📍 [Proposals] Error fetching locations:', error);
      }
    };

    fetchLocations();
  }, [user?.profileId, request?.activityId]);

  const addTimeSlot = () => {
    const dateInput = document.getElementById(`time-${request.id}`) as HTMLInputElement;
    if (dateInput?.value) {
      setSelectedTimes([...selectedTimes, dateInput.value]);
      dateInput.value = '';
    }
  };

  const removeTimeSlot = (index: number) => {
    setSelectedTimes(selectedTimes.filter((_, i) => i !== index));
  };

  const onSubmit = (data: any) => {
    if (!user?.accountId) return;
    if (selectedTimes.length === 0) {
      alert('Adicione pelo menos um horário disponível');
      return;
    }
    
    createProposal({
      doctorAccountId: user.accountId,
      requestId: request.id,
      price: Number(data.price),
      practiceLocationId: data.practiceLocationId,
      availableTimes: selectedTimes,
    }, {
      onSuccess: () => {
        setShowProposalForm(false);
        setSelectedTimes([]);
        reset();
      },
    });
  };

  const selectedLocation = availableLocations.find(
    (loc) => loc.practiceLocation?.id === selectedLocationId
  );

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">
              {request.activityDoctorLocation?.activityDoctor?.activity?.name || 'Atividade'}
            </CardTitle>
            <CardDescription className="mt-1">
              Solicitado em {new Date(request.createdAt).toLocaleDateString('pt-BR')}
            </CardDescription>
          </div>
          <Badge variant="secondary">
            {OnRequestStatus.OPEN}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span>Raio de {request.radius} km</span>
          </div>
          
          {request.activityDoctorLocation?.practiceLocation && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>
                {request.activityDoctorLocation.practiceLocation.city} - 
                {request.activityDoctorLocation.practiceLocation.state}
              </span>
            </div>
          )}

          {request.activityDoctorLocation?.price && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <DollarSign className="h-4 w-4" />
              <span>Preço sugerido: R$ {request.activityDoctorLocation.price.toFixed(2)}</span>
            </div>
          )}
        </div>

        <div className="pt-4 border-t">
          {!showProposalForm ? (
            <Button 
              className="w-full" 
              onClick={() => setShowProposalForm(true)}
            >
              Enviar Proposta
            </Button>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
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
                        {availableLocations.length > 0 ? (
                          availableLocations.map((adl: any) => (
                            <SelectItem key={adl.id} value={adl.practiceLocation.id}>
                              {adl.practiceLocation.street}, {adl.practiceLocation.city}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="empty" disabled>
                            Nenhum local vinculado a esta atividade
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  )}
                />
                {selectedLocation && (
                  <p className="text-xs text-muted-foreground">
                    Duração: {selectedLocation.activityDoctor?.estimatedDuration} min
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="price">Seu Preço (R$)</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  placeholder="Ex: 150.00"
                  {...register('price', { required: true })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor={`time-${request.id}`}>Horários Disponíveis</Label>
                <div className="flex gap-2">
                  <Input
                    id={`time-${request.id}`}
                    type="datetime-local"
                    className="flex-1"
                  />
                  <Button type="button" onClick={addTimeSlot} variant="outline" size="sm">
                    +
                  </Button>
                </div>
                {selectedTimes.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedTimes.map((time, index) => (
                      <Badge key={index} variant="secondary" className="flex items-center gap-1">
                        {new Date(time).toLocaleString('pt-BR', { 
                          day: '2-digit', 
                          month: '2-digit', 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                        <X
                          className="h-3 w-3 cursor-pointer"
                          onClick={() => removeTimeSlot(index)}
                        />
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <Button 
                  type="submit" 
                  className="flex-1"
                  disabled={isPending}
                >
                  {isPending ? 'Enviando...' : 'Enviar'}
                </Button>
                <Button 
                  type="button"
                  variant="outline" 
                  className="flex-1"
                  onClick={() => {
                    setShowProposalForm(false);
                    reset();
                  }}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
