import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '@/lib/axios';
import type { Certificate } from '@/types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/data-table';
import { createCertificateColumns } from '@/components/columns/certificate-columns';
import { ShieldCheck } from 'lucide-react';

export default function Certificates() {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCertificates();
  }, []);

  const loadCertificates = async () => {
    try {
      setLoading(true);
      const response = await api.get('/certificates/my-certificates');
      setCertificates(response.data.certificates || []);
    } catch (error) {
      console.error('Erro ao carregar certificados:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <p>Carregando certificados...</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Meus certificados</h1>
          <p className="text-muted-foreground">Visualize e gerencie seus certificados de participação</p>
        </div>
        <Link to="/validar-certificado">
          <Button variant="outline" className="gap-2">
            <ShieldCheck className="h-4 w-4" />
            Validar um certificado
          </Button>
        </Link>
      </div>

      <Card className="p-6">
        <DataTable
          columns={createCertificateColumns()}
          data={certificates}
          searchKey="eventName"
          searchPlaceholder="Filtrar por nome do evento..."
        />
      </Card>
    </div>
  );
}

