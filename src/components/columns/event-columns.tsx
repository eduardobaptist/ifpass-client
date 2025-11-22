import { type ColumnDef } from '@tanstack/react-table';
import { ArrowUpDown, Eye, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { Event } from '@/types';

interface EventColumnsProps {
  onView: (id: number) => void;
  onEdit: (id: number) => void;
  onDelete: (event: Event) => void;
  canEdit: boolean;
}

export const createEventColumns = ({
  onView,
  onEdit,
  onDelete,
  canEdit,
}: EventColumnsProps): ColumnDef<Event>[] => [
  {
    accessorKey: 'name',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Nome
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => <div className="font-medium">{row.getValue('name')}</div>,
  },
  {
    accessorKey: 'type',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Tipo
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const type = row.getValue('type') as string;
      const isInternal = type === 'internal';
      const badgeClass = isInternal 
        ? 'bg-blue-500/80 text-white' 
        : 'bg-orange-500/80 text-white';
      return (
        <Badge className={badgeClass}>{isInternal ? 'Interno' : 'Externo'}</Badge>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: 'date',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Data
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const date = new Date(row.getValue('date'));
      return date.toLocaleString('pt-BR', {
        dateStyle: 'short',
        timeStyle: 'short',
      });
    },
  },
  {
    accessorKey: 'location',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Local
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    accessorKey: 'capacity',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Capacidade
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      return <div className="text-right">{row.getValue('capacity')}</div>;
    },
  },
  {
    id: 'actions',
    header: () => <div className="text-right">Ações</div>,
    cell: ({ row }) => {
      const event = row.original;

      return (
        <div className="flex justify-end gap-2">
          <Button variant="ghost" size="icon" onClick={() => onView(event.id)}>
            <Eye className="h-4 w-4" />
          </Button>
          {canEdit && (
            <>
              <Button variant="ghost" size="icon" onClick={() => onEdit(event.id)}>
                <Edit className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => onDelete(event)}>
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </>
          )}
        </div>
      );
    },
  },
];

