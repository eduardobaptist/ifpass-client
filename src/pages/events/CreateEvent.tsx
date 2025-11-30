import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import api from '@/lib/axios';
import { createEventSchema, type CreateEventFormData } from '@/schemas/event';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';

export default function CreateEvent() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin' || user?.role === 'organizer';

  const form = useForm<CreateEventFormData>({
    resolver: zodResolver(createEventSchema),
    defaultValues: {
      name: '',
      type: 'internal',
      description: '',
      date: '',
      location: '',
      capacity: 1,
    },
  });

  const onSubmit = async (data: CreateEventFormData) => {
    try {
      // Converte a data para o formato ISO esperado pela API
      const eventData = {
        ...data,
        date: new Date(data.date).toISOString(),
      };

      await api.post('/events', eventData);
      toast.success('Evento criado com sucesso!');
      navigate('/eventos');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Erro ao criar evento.';
      toast.error(message);
    }
  };

  if (!isAdmin) {
    return <Navigate to="/eventos" replace />;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/eventos')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Novo evento</h1>
          <p className="text-muted-foreground">Preencha os dados do novo evento</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informações do Evento</CardTitle>
          <CardDescription>Preencha todos os campos obrigatórios</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome *</FormLabel>
                    <FormControl>
                      <Input placeholder="Nome do evento" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o tipo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="internal">Interno</SelectItem>
                        <SelectItem value="external">Externo</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descrição *</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Descrição do evento"
                        rows={4}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data e Hora *</FormLabel>
                    <FormControl>
                      <Input type="datetime-local" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Local *</FormLabel>
                    <FormControl>
                      <Input placeholder="Local do evento" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="capacity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Capacidade *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="1"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex gap-2 pt-4">
                <Button type="submit" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting ? 'Criando...' : 'Criar evento'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/eventos')}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

