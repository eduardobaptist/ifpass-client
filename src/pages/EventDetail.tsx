import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '@/lib/axios';
import type { Event } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowLeft, Edit, Users, Calendar, MapPin, UserCheck } from 'lucide-react';
import { toast } from 'sonner';

export default function EventDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState(false);

  const isAdmin = user?.role === 'admin'

  useEffect(() => {
    if (id) {
      loadEvent();
    }
  }, [id, isAdmin]);

  const loadEvent = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/events/${id}`);
      setEvent(response.data.event);
    } catch (error) {
      console.error('Erro ao carregar evento:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async () => {
    if (!id) return;

    try {
      setSubscribing(true);
      await api.post('/subscriptions/subscribe', { eventId: parseInt(id) });
      toast.success('Inscrição realizada com sucesso!');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Erro ao realizar inscrição.';
      toast.error(message);
    } finally {
      setSubscribing(false);
    }
  };

  const formatDate = (dateString: string) => {
    const str : string = new Date(dateString).toLocaleString('pt-BR', {
      dateStyle: 'full',
      timeStyle: 'short',
    });
    
    return String(str).charAt(0).toUpperCase() + String(str).slice(1);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Carregando evento...</p>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center space-y-4">
            <p className="text-lg">Evento não encontrado.</p>
            <Button onClick={() => navigate('/eventos')} className="w-full">
              Voltar para Eventos
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      {/* Header com imagem de fundo */}
      <div className="relative bg-gradient-to-r from-primary/90 to-primary text-primary-foreground">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative max-w-6xl mx-auto px-6 py-12">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate('/eventos')}
            className="mb-4 text-primary-foreground"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          
          <div className="space-y-4">
            <div className="inline-block px-3 py-1 bg-primary-foreground/20 rounded-full text-sm font-medium">
              {event.type === 'internal' ? 'Evento Interno' : 'Evento Externo'}
            </div>
            <h1 className="text-4xl md:text-5xl font-bold leading-tight">{event.name}</h1>
            <p className="text-lg text-primary-foreground/90 max-w-3xl">{event.description}</p>
          </div>

          {isAdmin && (
            <div className="mt-6">
              <Link to={`/eventos/${id}/editar`}>
                <Button variant="secondary">
                  <Edit className="mr-2 h-4 w-4" />
                  Editar evento
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Conteúdo principal */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Informações principais - Layout para não-admin */}
          {!isAdmin && (
            <>
              {/* Detalhes do evento */}
              <div className="lg:col-span-2 space-y-6">
                <Card className="border-2">
                  <CardHeader>
                    <CardTitle className="text-2xl">Detalhes do Evento</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-start gap-4 p-4 rounded-lg bg-muted/50">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Calendar className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-muted-foreground">Data e Hora</p>
                        <p className="text-lg font-semibold">{formatDate(event.date)}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4 p-4 rounded-lg bg-muted/50">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <MapPin className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-muted-foreground">Local</p>
                        <p className="text-lg font-semibold">{event.location}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4 p-4 rounded-lg bg-muted/50">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Users className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-muted-foreground">Capacidade</p>
                        <p className="text-lg font-semibold">{event.capacity} pessoas</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Card de inscrição - Sticky */}
              <div className="lg:col-span-1">
                <Card className="border-2 border-primary/20 sticky top-6">
                  <CardHeader className="text-center pb-4">
                    <div className="mx-auto p-3 rounded-full bg-primary/10 w-fit mb-4">
                      <UserCheck className="h-8 w-8 text-primary" />
                    </div>
                    <CardTitle className="text-2xl">Garanta sua vaga!</CardTitle>
                    <CardDescription className="text-base">
                      Inscreva-se agora para participar deste evento
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Button
                      onClick={handleSubscribe}
                      disabled={subscribing}
                      className="w-full h-12 text-lg font-semibold"
                      size="lg"
                    >
                      {subscribing ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-foreground mr-2"></div>
                          Inscrevendo...
                        </>
                      ) : (
                        'Inscrever-se no Evento'
                      )}
                    </Button>
                    <p className="text-xs text-center text-muted-foreground">
                      Vagas limitadas a {event.capacity} participantes
                    </p>
                  </CardContent>
                </Card>
              </div>
            </>
          )}

          {/* Layout para admin */}
          {isAdmin && (
            <>
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Informações do Evento</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Descrição</p>
                    <p>{event.description}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Data e Hora</p>
                    <p>{formatDate(event.date)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Local</p>
                    <p>{event.location}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Capacidade</p>
                    <p>{event.capacity} pessoas</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Inscrições ({event.subscriptionsCount})
                  </CardTitle>
                  <CardDescription>
                    Total de {event.subscriptionsCount} inscrição{event.subscriptionsCount !== 1 ? 'ões' : ''}{' '}
                    neste evento
                  </CardDescription>
                </CardHeader>
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  );
}