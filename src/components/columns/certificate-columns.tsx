import * as React from 'react';
import { type ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Copy, Check } from 'lucide-react';
import type { Certificate } from '@/types';
import { toast } from 'sonner';

const CopyTokenButton = ({ token }: { token: string }) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(token);
      setCopied(true);
      toast.success('Token copiado para a área de transferência!');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Erro ao copiar token');
    }
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-8 w-8"
      onClick={handleCopy}
      title="Copiar token"
    >
      {copied ? (
        <Check className="h-4 w-4 text-green-600" />
      ) : (
        <Copy className="h-4 w-4" />
      )}
    </Button>
  );
};

export const createCertificateColumns = (): ColumnDef<Certificate>[] => [
  {
    accessorKey: 'verificationToken',
    header: 'Assinatura',
    cell: ({ row }) => {
      const token = row.getValue('verificationToken') as string;

      return (
        <div className="flex items-center gap-2">
          <code className="text-xs font-mono bg-muted px-2 py-1 rounded max-w-[250px] truncate text-center">
            {token}
          </code>
          <CopyTokenButton token={token} />
        </div>
      );
    },
  },
  {
    accessorKey: 'certificateNumber',
    header: 'Número do Certificado',
    cell: ({ row }) => (
      <div className="font-mono text-sm">{row.getValue('certificateNumber')}</div>
    ),
  },
  {
    id: 'eventName',
    accessorFn: (row) => row.event?.name || '',
    header: 'Evento',
    cell: ({ row }) => {
      const event = row.original.event;
      return (
        <div>
          <div className="font-medium">{event.name}</div>
          <div className="text-sm text-muted-foreground">
            {new Date(event.date).toLocaleDateString('pt-BR')}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: 'event.type',
    header: 'Tipo',
    cell: ({ row }) => {
      const type = row.getValue('event.type') as string;
      const isInternal = type === 'internal';
      const badgeClass = isInternal 
        ? 'bg-blue-500/80 text-white' 
        : 'bg-orange-500/80 text-white';
      return (
        <Badge className={badgeClass}>{isInternal ? 'Interno' : 'Externo'}</Badge>
      );
    },
  },
  {
    accessorKey: 'issuedAt',
    header: 'Emitido em',
    cell: ({ row }) => {
      const date = new Date(row.getValue('issuedAt'));
      return date.toLocaleString('pt-BR', {
        dateStyle: 'short',
        timeStyle: 'short',
      });
    },
  },
  {
    accessorKey: 'verificationCount',
    header: 'Verificações',
    cell: ({ row }) => {
      const count = row.getValue('verificationCount') as number;
      return <div className="text-center">{count}</div>;
    },
  },
  {
    accessorKey: 'verifiedAt',
    header: 'Última Verificação',
    cell: ({ row }) => {
      const verifiedAt = row.getValue('verifiedAt') as string | null;
      if (!verifiedAt) {
        return <span className="text-muted-foreground">Nunca verificado</span>;
      }
      return new Date(verifiedAt).toLocaleString('pt-BR', {
        dateStyle: 'short',
        timeStyle: 'short',
      });
    },
  },
];

