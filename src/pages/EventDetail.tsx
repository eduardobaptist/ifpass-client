import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '@/lib/axios';
import type { Event, Subscription } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowLeft, Edit, Users } from 'lucide-react';
import { toast } from 'sonner';

export default function EventDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [event, setEvent] = useState<Event | null>(null);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState(false);

  const isAdmin = user?.role === 'admin' || user?.role === 'organizer';

  useEffect(() => {
    if (id) {
      loadEvent();
      if (isAdmin) {
        loadSubscriptions();
      }
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

  const loadSubscriptions = async () => {
    try {
      const response = await api.get(`/events/${id}/subscriptions`);
      setSubscriptions(response.data.subscriptions);
    } catch (error) {
      console.error('Erro ao carregar inscrições:', error);
    }
  };

  const handleSubscribe = async () => {
    if (!id) return;

    try {
      setSubscribing(true);
      await api.post('/subscriptions/subscribe', { eventId: parseInt(id) });
      toast.success('Inscrição realizada com sucesso!');
      if (isAdmin) {
        loadSubscriptions();
      }
    } catch (error: any) {
      const message = error.response?.data?.message || 'Erro ao realizar inscrição.';
      toast.error(message);
    } finally {
      setSubscribing(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR', {
      dateStyle: 'full',
      timeStyle: 'short',
    });
  };

  if (loading) {
    return (
      <div className="p-6">
        <p>Carregando evento...</p>
      </div>
    );
  }

  if (!event) {
      return (
        <div className="p-6">
          <p>Evento não encontrado.</p>
          <Button onClick={() => navigate('/eventos')} className="mt-4">
            Voltar para Eventos
          </Button>
        </div>
      );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/eventos')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">{event.name}</h1>
          <p className="text-muted-foreground">
            {event.type === 'internal' ? 'Interno' : 'Externo'}
          </p>
        </div>
        {isAdmin && (
          <Link to={`/eventos/${id}/editar`}>
            <Button variant="outline">
              <Edit className="mr-2 h-4 w-4" />
              Editar
            </Button>
          </Link>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
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

        {!isAdmin && (
          <Card>
            <CardHeader>
              <CardTitle>Inscrição</CardTitle>
            </CardHeader>
            <CardContent>
              <Button
                onClick={handleSubscribe}
                disabled={subscribing}
                className="w-full"
                size="lg"
              >
                {subscribing ? 'Inscrevendo-se...' : 'Inscrever-se no Evento'}
              </Button>
            </CardContent>
          </Card>
        )}

        {isAdmin && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Inscrições ({subscriptions.length})
              </CardTitle>
              <CardDescription>
                Total de {subscriptions.length} inscrição{subscriptions.length !== 1 ? 'ões' : ''}{' '}
                neste evento
              </CardDescription>
            </CardHeader>
          </Card>
        )}
      </div>
    </div>
  );
}

