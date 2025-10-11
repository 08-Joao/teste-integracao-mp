'use client';

import { useForm, Controller } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CreateOnCallProposalDto } from '@/models/dtos/create-on-call.dto';
import { useEffect, useState } from 'react';
import { useCreateOnCallProposal } from '@/lib/hooks/use-on-calls';
import { useAuth } from '@/contexts/AuthContext';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';

interface CreateProposalModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  request: any; // OnCallRequest
}

type FormData = {
  practiceLocationId: string;
  price: number;
  availableTimes: Date[];
};

export function CreateProposalModal({
  isOpen,
  onOpenChange,
  request,
}: CreateProposalModalProps) {
  const { user } = useAuth();
  const { mutate: createProposal, isPending, isSuccess } = useCreateOnCallProposal();
  const { register, handleSubmit, reset, control, watch, setValue } = useForm<FormData>();
  const [selectedTimes, setSelectedTimes] = useState<Date[]>([]);
  const [availableLocations, setAvailableLocations] = useState<any[]>([]);

  const selectedLocationId = watch('practiceLocationId');

  // Buscar PracticeLocations que têm a atividade vinculada
  useEffect(() => {
    if (!user?.profileId || !request?.activityId) return;

    const fetchLocations = async () => {
      try {
        // Buscar ActivityDoctorLocations que:
        // 1. Pertencem ao médico (via practiceLocation.doctorProfileId)
        // 2. Têm a atividade solicitada (via activityDoctor.activityId)
        const response = await fetch(
          `/api/activity-doctor-locations?doctorProfileId=${user.profileId}`,
          { credentials: 'include' }
        );
        
        if (response.ok) {
          const data = await response.json();
          
          // Filtrar apenas os que têm a atividade solicitada
          const filtered = data.filter((adl: any) => 
            adl.activityDoctor?.activityId === request.activityId
          );
          
          setAvailableLocations(filtered);
        }
      } catch (error) {
        console.error('Error fetching locations:', error);
      }
    };

    fetchLocations();
  }, [user?.profileId, request?.activityId]);

  const addTimeSlot = () => {
    const dateInput = document.getElementById('timeSlot') as HTMLInputElement;
    if (dateInput?.value) {
      const newTime = new Date(dateInput.value);
      setSelectedTimes([...selectedTimes, newTime]);
      dateInput.value = '';
    }
  };

  const removeTimeSlot = (index: number) => {
    setSelectedTimes(selectedTimes.filter((_, i) => i !== index));
  };

  const onSubmit = (data: FormData) => {
    if (!user?.accountId) return;
    if (selectedTimes.length === 0) {
      alert('Selecione pelo menos um horário disponível');
      return;
    }

    const dto: CreateOnCallProposalDto = {
      doctorAccountId: user.accountId,
      requestId: request.id,
      practiceLocationId: data.practiceLocationId,
      price: Number(data.price),
      availableTimes: selectedTimes.map(t => t.toISOString()),
    };

    createProposal(dto);
  };

  useEffect(() => {
    if (isSuccess) {
      onOpenChange(false);
      reset();
      setSelectedTimes([]);
    }
  }, [isSuccess, onOpenChange, reset]);

  const selectedLocation = availableLocations.find(
    (loc) => loc.id === selectedLocationId
  );

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>Enviar Proposta</DialogTitle>
            <DialogDescription>
              Atividade: {request?.activity?.name} - {request?.activity?.specialty?.name}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {/* Practice Location */}
            <div className="space-y-2">
              <Label htmlFor="practiceLocationId">Local de Atendimento</Label>
              <Controller
                name="practiceLocationId"
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o local" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableLocations.length > 0 ? (
                        availableLocations.map((adl: any) => (
                          <SelectItem key={adl.id} value={adl.practiceLocation.id}>
                            {adl.practiceLocation.street}, {adl.practiceLocation.city}
                            {' - R$ '}{adl.price.toFixed(2)}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="empty" disabled>
                          Nenhum local disponível para esta atividade
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                )}
              />
              {selectedLocation && (
                <p className="text-xs text-muted-foreground">
                  Duração estimada: {selectedLocation.activityDoctor?.estimatedDuration} minutos
                </p>
              )}
            </div>

            {/* Price */}
            <div className="space-y-2">
              <Label htmlFor="price">Preço (R$)</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                placeholder="Ex: 150.00"
                {...register('price', { required: true, min: 0 })}
              />
            </div>

            {/* Available Times */}
            <div className="space-y-2">
              <Label htmlFor="timeSlot">Horários Disponíveis</Label>
              <div className="flex gap-2">
                <Input
                  id="timeSlot"
                  type="datetime-local"
                  className="flex-1"
                />
                <Button type="button" onClick={addTimeSlot} variant="outline">
                  Adicionar
                </Button>
              </div>
              
              {selectedTimes.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {selectedTimes.map((time, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      {new Date(time).toLocaleString('pt-BR')}
                      <X
                        className="h-3 w-3 cursor-pointer"
                        onClick={() => removeTimeSlot(index)}
                      />
                    </Badge>
                  ))}
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                Adicione múltiplos horários em que você pode atender
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button type="submit" disabled={isPending || availableLocations.length === 0}>
              {isPending ? 'Enviando...' : 'Enviar Proposta'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
