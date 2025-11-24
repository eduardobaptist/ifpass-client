import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '@/lib/axios';
import type { User } from '@/types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';
import { DataTable } from '@/components/data-table';
import { createUserColumns } from '@/components/columns/user-columns';

export default function Users() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();

  const isAdmin = currentUser?.role === 'admin';

  useEffect(() => {
    if (isAdmin) {
      loadUsers();
    } else {
      navigate('/eventos');
    }
  }, [isAdmin, navigate]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/users');
      setUsers(response.data.users);
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!userToDelete) return;

    try {
      await api.delete(`/users/${userToDelete.id}`);
      toast.success('Usuário excluído com sucesso!');
      setDeleteDialogOpen(false);
      setUserToDelete(null);
      loadUsers();
    } catch (error) {
      console.error('Erro ao excluir usuário:', error);
    }
  };

  const openDeleteDialog = (user: User) => {
    setUserToDelete(user);
    setDeleteDialogOpen(true);
  };

  if (!isAdmin) {
    return null;
  }

  if (loading) {
    return (
      <div className="p-6">
        <p>Carregando usuários...</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Usuários</h1>
          <p className="text-muted-foreground">Gerencie os usuários do sistema</p>
        </div>
        <Button onClick={() => navigate('/usuarios/novo')}>
          <Plus className="mr-2 h-4 w-4" />
          Novo usuário
        </Button>
      </div>

      <Card className="p-6">
        <DataTable
          columns={createUserColumns({
            onEdit: (id) => navigate(`/usuarios/${id}/editar`),
            onDelete: openDeleteDialog,
          })}
          data={users}
          searchKey="fullName"
          searchPlaceholder="Filtrar por nome..."
        />
      </Card>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir Usuário</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir o usuário "{userToDelete?.fullName}"? Esta ação não
              pode ser desfeita.
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

