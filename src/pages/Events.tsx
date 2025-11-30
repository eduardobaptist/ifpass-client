import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '@/lib/axios';
import type { Event } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { Plus, Calendar, MapPin, Users, Eye, Edit, Trash2, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { DataTable } from '@/components/data-table';
import { createEventColumns } from '@/components/columns/event-columns';
import {
  getCoreRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  useReactTable,
  type ColumnFiltersState,
  type ColumnDef,
} from '@tanstack/react-table';

export default function Events() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<Event | null>(null);
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('cards');
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const { user } = useAuth();
  const navigate = useNavigate();

  const isAdmin = user?.role === 'admin' || user?.role === 'organizer';

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const response = await api.get('/events');
      setEvents(response.data.events);
    } catch (error) {
      console.error('Erro ao carregar eventos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!eventToDelete) return;

    try {
      await api.delete(`/events/${eventToDelete.id}`);
      toast.success('Evento excluído com sucesso!');
      setDeleteDialogOpen(false);
      setEventToDelete(null);
      loadEvents();
    } catch (error) {
      console.error('Erro ao excluir evento:', error);
    }
  };

  const openDeleteDialog = (event: Event) => {
    setEventToDelete(event);
    setDeleteDialogOpen(true);
  };

  const formatDate = (dateString: string) => {
    const str : string = new Date(dateString).toLocaleString('pt-BR', {
      dateStyle: 'full',
      timeStyle: 'short',
    });
    
    return String(str).charAt(0).toUpperCase() + String(str).slice(1);
  };

  // Coluna simples para filtro por nome
  const cardsColumns: ColumnDef<Event>[] = [
    {
      accessorKey: 'name',
    },
  ];

  // Tabela para cards (filtro e paginação)
  const cardsTable = useReactTable({
    data: events,
    columns: cardsColumns,
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
        <p>Carregando eventos...</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Eventos</h1>
        </div>
        {isAdmin && (
          <Link to="/eventos/novo">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Novo Evento
            </Button>
          </Link>
        )}
      </div>

      <Card className="p-6">
        <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as 'table' | 'cards')}>
          <TabsList>
            <TabsTrigger value="cards">Cards</TabsTrigger>
            <TabsTrigger value="table">Tabela</TabsTrigger>
          </TabsList>

          <TabsContent value="table">
            <DataTable
              columns={createEventColumns({
                onView: (id) => navigate(`/eventos/${id}`),
                onEdit: (id) => navigate(`/eventos/${id}/editar`),
                onDelete: openDeleteDialog,
                canEdit: isAdmin,
              })}
              data={events}
              searchKey="name"
              searchPlaceholder="Filtrar por nome..."
            />
          </TabsContent>

          <TabsContent value="cards" className="space-y-4">
            <div className="flex items-center py-4">
              <Input
                placeholder="Filtrar por nome..."
                value={(cardsTable.getColumn('name')?.getFilterValue() as string) ?? ''}
                onChange={(event) => cardsTable.getColumn('name')?.setFilterValue(event.target.value)}
                className="max-w-sm"
              />
            </div>

            {cardsTable.getRowModel().rows.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                Nenhum evento encontrado.
              </div>
            ) : (
              <>
                <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {cardsTable.getRowModel().rows.map((row) => {
                    const event = row.original;
                    const isInternal = event.type === 'internal';
                    const gradientClass = 'from-green-500/5 via-emerald-500/5 to-teal-500/5 border-green-200/50 dark:border-green-800/50';
                    const badgeClass = isInternal 
                      ? 'bg-blue-500/80 text-white' 
                      : 'bg-orange-500/80 text-white';
                    const iconColor = 'text-green-600 dark:text-green-400';
                    
                    return (
                      <Card 
                        key={event.id}
                        className={`relative overflow-hidden border transition-all duration-200 hover:shadow-md hover:scale-[1.01] bg-gradient-to-br ${gradientClass} cursor-pointer`}
                        onClick={() => navigate(`/eventos/${event.id}`)}
                      >
                        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-green-400/60 to-emerald-500/60" />
                        <CardHeader className="pb-2 pt-3 px-4">
                          <div className="flex justify-between items-start gap-2">
                            <CardTitle className="text-base font-semibold text-foreground pr-2 line-clamp-1">
                              {event.name}
                            </CardTitle>
                            <Badge className={`${badgeClass} text-xs shrink-0`}>
                              {isInternal ? 'Interno' : 'Externo'}
                            </Badge>
                          </div>
                          <CardDescription className="text-xs mt-1.5 line-clamp-2">
                            {event.description}
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-1 pt-1 px-4 pb-4">
                          <div className="flex items-start gap-2 text-xs bg-background/30 rounded-md p-1.5">
                            <Calendar className={`h-3.5 w-3.5 mt-0.5 ${iconColor} flex-shrink-0`} />
                            <span className="text-foreground/90">{formatDate(event.date)}</span>
                          </div>
                          <div className="flex items-start gap-2 text-xs bg-background/30 rounded-md p-1.5">
                            <MapPin className={`h-3.5 w-3.5 mt-0.5 ${iconColor} flex-shrink-0`} />
                            <span className="text-foreground/90 line-clamp-1">{event.location}</span>
                          </div>
                          <div className="flex items-start gap-2 text-xs bg-background/30 rounded-md p-1.5">
                            <Users className={`h-3.5 w-3.5 mt-0.5 ${iconColor} flex-shrink-0`} />
                            <span className="text-foreground/90">Capacidade: {event.capacity}</span>
                          </div>
                          {isAdmin && (
                            <div className="flex gap-1.5 pt-2 border-t border-border/30" onClick={(e) => e.stopPropagation()}>
                              <Button
                                variant="outline"
                                size="sm"
                                className="border-blue-300/50 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/30 text-xs flex-1"
                                onClick={() => navigate(`/eventos/${event.id}/editar`)}
                              >
                                <Edit className="h-3 w-3 mr-1" />
                                Editar
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="border-red-300/50 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 text-xs flex-1"
                                onClick={() => openDeleteDialog(event)}
                              >
                                <Trash2 className="h-3 w-3 mr-1" />
                                Excluir
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
                    {cardsTable.getFilteredRowModel().rows.length} evento(s) encontrado(s).
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => cardsTable.setPageIndex(0)}
                      disabled={!cardsTable.getCanPreviousPage()}
                    >
                      <ChevronsLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => cardsTable.previousPage()}
                      disabled={!cardsTable.getCanPreviousPage()}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <div className="flex items-center justify-center text-sm font-medium">
                      Página {cardsTable.getState().pagination.pageIndex + 1} de{' '}
                      {cardsTable.getPageCount()}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => cardsTable.nextPage()}
                      disabled={!cardsTable.getCanNextPage()}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => cardsTable.setPageIndex(cardsTable.getPageCount() - 1)}
                      disabled={!cardsTable.getCanNextPage()}
                    >
                      <ChevronsRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </>
            )}
          </TabsContent>
        </Tabs>
      </Card>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir Evento</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir o evento "{eventToDelete?.name}"? Esta ação não pode
              ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

