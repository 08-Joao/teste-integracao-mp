'use client';

import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Activity, Clock, Heart, TrendingUp, AlertCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';

export default function PatientDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4003';
        const response = await fetch(`${backendUrl}/api/patients/stats`, {
          credentials: 'include',
        });
        
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchStats();
    }
  }, [user]);

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Consultas Realizadas',
      value: stats?.appointmentsThisMonth || 0,
      description: 'Nos últimos 30 dias',
      icon: Calendar,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Próximas Consultas',
      value: stats?.upcomingAppointments || 0,
      description: 'Agendadas',
      icon: Clock,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'Atividades Diferentes',
      value: stats?.differentActivities || 0,
      description: 'Tipos de consulta',
      icon: Activity,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      title: 'Médicos Consultados',
      value: stats?.differentDoctors || 0,
      description: 'Este ano',
      icon: Heart,
      color: 'text-pink-600',
      bgColor: 'bg-pink-100',
    },
  ];

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Meu Painel</h1>
        <p className="text-muted-foreground">
          Olá, {(user as any)?.name || user?.email?.split('@')[0]}! Aqui está um resumo da sua saúde.
        </p>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-full ${stat.bgColor}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Gasto Total e Frequência */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              Gasto com Saúde
            </CardTitle>
            <CardDescription>Investimento em bem-estar</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">
              R$ {stats?.totalSpent?.toFixed(2) || '0.00'}
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Este ano
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-pink-600" />
              Frequência de Consultas
            </CardTitle>
            <CardDescription>Sua regularidade</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {stats?.consultationFrequency || 0}
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Consultas por mês (média)
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Próximas Consultas */}
      <Card>
        <CardHeader>
          <CardTitle>Próximas Consultas</CardTitle>
          <CardDescription>Seus agendamentos</CardDescription>
        </CardHeader>
        <CardContent>
          {stats?.upcomingAppointmentsList?.length > 0 ? (
            <div className="space-y-3">
              {stats.upcomingAppointmentsList.map((appointment: any) => (
                <div
                  key={appointment.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex-1">
                    <p className="font-medium">Dr(a). {appointment.doctorName}</p>
                    <p className="text-sm text-muted-foreground">
                      {appointment.activityName}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {appointment.location}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">
                      {new Date(appointment.dateTime).toLocaleDateString('pt-BR')}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(appointment.dateTime).toLocaleTimeString('pt-BR', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                    <Badge variant="outline" className="mt-1">
                      {appointment.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground">
                Você não tem consultas agendadas
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Histórico Recente */}
      <Card>
        <CardHeader>
          <CardTitle>Histórico Recente</CardTitle>
          <CardDescription>Últimas consultas realizadas</CardDescription>
        </CardHeader>
        <CardContent>
          {stats?.recentAppointments?.length > 0 ? (
            <div className="space-y-3">
              {stats.recentAppointments.map((appointment: any) => (
                <div
                  key={appointment.id}
                  className="flex items-center justify-between p-3 border rounded-lg bg-muted/50"
                >
                  <div>
                    <p className="font-medium">Dr(a). {appointment.doctorName}</p>
                    <p className="text-sm text-muted-foreground">
                      {appointment.activityName}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm">
                      {new Date(appointment.dateTime).toLocaleDateString('pt-BR')}
                    </p>
                    <Badge variant="secondary" className="mt-1">
                      Concluída
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">
              Nenhuma consulta realizada ainda
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
