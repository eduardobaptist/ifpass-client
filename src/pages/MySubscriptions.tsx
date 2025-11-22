import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '@/lib/axios';
import type { Subscription } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ArrowRight, Calendar, MapPin, Users, X, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  getCoreRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  useReactTable,
  type ColumnFiltersState,
  type ColumnDef,
} from '@tanstack/react-table';

export default function MySubscriptions() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [subscriptionToCancel, setSubscriptionToCancel] = useState<Subscription | null>(null);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const navigate = useNavigate();

  useEffect(() => {
    loadSubscriptions();
  }, []);

  const loadSubscriptions = async () => {
    try {
      setLoading(true);
      const response = await api.get('/subscriptions/my-subscriptions');
      console.log("sub", response.data.subscriptions)
      setSubscriptions(response.data.subscriptions);
    } catch (error) {
      console.error('Erro ao carregar inscrições:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!subscriptionToCancel) return;

    try {
      await api.post(`/subscriptions/${subscriptionToCancel.id}/cancel`);
      toast.success('Inscrição cancelada com sucesso!');
      setCancelDialogOpen(false);
      setSubscriptionToCancel(null);
      loadSubscriptions();
    } catch (error: any) {
      const message = error.response?.data?.message || 'Erro ao cancelar inscrição.';
      toast.error(message);
    }
  };

  const openCancelDialog = (subscription: Subscription) => {
    setSubscriptionToCancel(subscription);
    setCancelDialogOpen(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR', {
      dateStyle: 'full',
      timeStyle: 'short',
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <Badge className="bg-green-500/80 text-white">Confirmada</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-500/80 text-white">Pendente</Badge>;
      case 'cancelled':
        return <Badge className="bg-gray-500/80 text-white">Cancelada</Badge>;
      case 'attended':
        return <Badge className="bg-blue-500/80 text-white">Compareceu</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  // Coluna simples para filtro por nome do evento
  const subscriptionsColumns: ColumnDef<Subscription>[] = [
    {
      id: 'eventName',
      accessorFn: (row) => row.event?.name || '',
    },
  ];

  // Tabela para cards (filtro e paginação)
  const subscriptionsTable = useReactTable({
    data: subscriptions,
    columns: subscriptionsColumns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    initialState: {
      pagination: {
        pageSize: 9,
      },
    },
    state: {
      columnFilters,
    },
  });

  if (loading) {
    return (
      <div className="p-6">
        <p>Carregando suas inscrições...</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Minhas inscrições</h1>
        <p className="text-muted-foreground">Gerencie suas inscrições em eventos</p>
      </div>

      {subscriptions.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center text-muted-foreground">
            Você ainda não se inscreveu em nenhum evento.
            <Link to="/eventos" className="block mt-4">
              <Button variant="link">Ver eventos disponíveis <ArrowRight /></Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="flex items-center py-4">
            <Input
              placeholder="Filtrar por nome do evento..."
              value={(subscriptionsTable.getColumn('eventName')?.getFilterValue() as string) ?? ''}
              onChange={(event) => subscriptionsTable.getColumn('eventName')?.setFilterValue(event.target.value)}
              className="max-w-sm"
            />
          </div>

          {subscriptionsTable.getRowModel().rows.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              Nenhuma inscrição encontrada.
            </div>
          ) : (
            <>
              <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {subscriptionsTable.getRowModel().rows.map((row) => {
                  const subscription = row.original;
                  const event = subscription.event;
                  const gradientClass = 'from-green-500/5 via-emerald-500/5 to-teal-500/5 border-green-200/50 dark:border-green-800/50';
                  const iconColor = 'text-green-600 dark:text-green-400';
                  
                  return (
                    <Card 
                      key={subscription.id}
                      className={`relative overflow-hidden border transition-all duration-200 hover:shadow-md hover:scale-[1.01] bg-gradient-to-br ${gradientClass} cursor-pointer`}
                      onClick={() => navigate(`/eventos/${subscription.eventId}`)}
                    >
                      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-green-400/60 to-emerald-500/60" />
                      <CardHeader className="pb-2 pt-3 px-4">
                        <div className="flex justify-between items-start gap-2">
                          <CardTitle className="text-base font-semibold text-foreground pr-2 line-clamp-1">
                            {event?.name || 'Evento'}
                          </CardTitle>
                          <div onClick={(e) => e.stopPropagation()}>
                            {getStatusBadge(subscription.status)}
                          </div>
                        </div>
                        <CardDescription className="text-xs mt-1.5 line-clamp-2">
                          {event?.description || 'Sem descrição'}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-1 pt-1 px-4 pb-4">
                        <div className="flex items-start gap-2 text-xs bg-background/30 rounded-md p-1.5">
                          <Calendar className={`h-3.5 w-3.5 mt-0.5 ${iconColor} flex-shrink-0`} />
                          <span className="text-foreground/90">
                            {event?.date ? formatDate(event.date) : 'N/A'}
                          </span>
                        </div>
                        <div className="flex items-start gap-2 text-xs bg-background/30 rounded-md p-1.5">
                          <MapPin className={`h-3.5 w-3.5 mt-0.5 ${iconColor} flex-shrink-0`} />
                          <span className="text-foreground/90 line-clamp-1">{event?.location || 'N/A'}</span>
                        </div>
                        <div className="flex items-start gap-2 text-xs bg-background/30 rounded-md p-1.5">
                          <Users className={`h-3.5 w-3.5 mt-0.5 ${iconColor} flex-shrink-0`} />
                          <span className="text-foreground/90">Capacidade: {event?.capacity || 'N/A'}</span>
                        </div>
                        {subscription.status !== 'cancelled' && subscription.status !== 'attended' && (
                          <div className="flex gap-1.5 pt-2 border-t border-border/30" onClick={(e) => e.stopPropagation()}>
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-red-300/50 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 h-7 text-xs flex-1"
                              onClick={() => openCancelDialog(subscription)}
                            >
                              <X className="h-3 w-3 mr-1" />
                              Cancelar
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              <div className="flex items-center justify-end space-x-2 py-4">
                <div className="flex-1 text-sm text-muted-foreground">
                  {subscriptionsTable.getFilteredRowModel().rows.length} inscrição(ões) encontrada(s).
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => subscriptionsTable.setPageIndex(0)}
                    disabled={!subscriptionsTable.getCanPreviousPage()}
                  >
                    <ChevronsLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => subscriptionsTable.previousPage()}
                    disabled={!subscriptionsTable.getCanPreviousPage()}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <div className="flex items-center justify-center text-sm font-medium">
                    Página {subscriptionsTable.getState().pagination.pageIndex + 1} de{' '}
                    {subscriptionsTable.getPageCount()}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => subscriptionsTable.nextPage()}
                    disabled={!subscriptionsTable.getCanNextPage()}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => subscriptionsTable.setPageIndex(subscriptionsTable.getPageCount() - 1)}
                    disabled={!subscriptionsTable.getCanNextPage()}
                  >
                    <ChevronsRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </>
      )}

      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancelar inscrição</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja cancelar sua inscrição no evento "
              {subscriptionToCancel?.event?.name}"? Esta ação pode não ser reversível.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelDialogOpen(false)}>
              Não, manter inscrição
            </Button>
            <Button variant="destructive" onClick={handleCancel}>
              Sim, cancelar inscrição
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

