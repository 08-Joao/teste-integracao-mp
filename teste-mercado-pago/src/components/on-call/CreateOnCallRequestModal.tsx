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
import { CreateOnCallRequestDto } from '@/models/dtos/create-on-call.dto';
import { useEffect } from 'react';
import { useCreateOnCallRequest } from '@/lib/hooks/use-on-calls';
import { useGetAllActivities } from '@/lib/hooks/use-activities';

interface CreateOnCallRequestModalProps {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    patientAccountId: string; // Precisamos saber qual paciente está criando
}

type FormData = Omit<CreateOnCallRequestDto, 'patientAccountId'>;

export function CreateOnCallRequestModal({
    isOpen,
    onOpenChange,
    patientAccountId,
}: CreateOnCallRequestModalProps) {
    const { mutate: createRequest, isPending, isSuccess } = useCreateOnCallRequest();
    const { data: activities, isLoading: isLoadingActivities } = useGetAllActivities();
    const { register, handleSubmit, reset, control } = useForm<FormData>();

    const onSubmit = (data: FormData) => {
        console.log('Form data:', data);
        console.log('Patient Account ID:', patientAccountId);
        
        const fullDto: CreateOnCallRequestDto = {
            ...data,
            radius: Number(data.radius), // Garante que o raio é um número
            patientAccountId,
        };
        
        console.log('Full DTO being sent:', fullDto);
        createRequest(fullDto, {
            onError: (error: any) => {
                console.error('Error creating request:', error);
            }
        });
    };

    // Efeito para fechar o modal e resetar o form em caso de sucesso
    useEffect(() => {
        if (isSuccess) {
            onOpenChange(false);
            reset();
        }
    }, [isSuccess, onOpenChange, reset]);

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={handleSubmit(onSubmit)}>
                    <DialogHeader>
                        <DialogTitle>Solicitar Atendimento</DialogTitle>
                        <DialogDescription>
                            Selecione o serviço desejado e o raio de busca. Médicos próximos receberão sua solicitação.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="activityId">Tipo de Atendimento</Label>
                            <Controller
                                name="activityId"
                                control={control}
                                rules={{ required: true }}
                                render={({ field }) => (
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Selecione o tipo de atendimento" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {isLoadingActivities ? (
                                                <SelectItem value="loading" disabled>
                                                    Carregando...
                                                </SelectItem>
                                            ) : Array.isArray(activities) && activities.length > 0 ? (
                                                activities.map((activity: any) => (
                                                    <SelectItem key={activity.id} value={activity.id}>
                                                        {activity.name} - {activity.specialty?.name || 'Sem especialidade'}
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
                            <p className="text-xs text-muted-foreground">
                                Médicos que realizam este atendimento serão notificados
                            </p>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="radius">Raio de Busca (em km)</Label>
                            <Input
                                id="radius"
                                type="number"
                                placeholder="Ex: 5"
                                {...register('radius', { required: true, valueAsNumber: true })}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={isPending}>
                            {isPending ? 'Enviando...' : 'Enviar Solicitação'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}