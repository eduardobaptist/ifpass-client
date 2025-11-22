import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import NotFound from '@/pages/NotFound';
import NotAuthorized from '@/pages/NotAuthorized';
import Events from '@/pages/Events';
import EventDetail from '@/pages/EventDetail';
import CreateEvent from '@/pages/events/CreateEvent';
import EditEvent from '@/pages/events/EditEvent';
import Users from '@/pages/Users';
import CreateUser from '@/pages/users/CreateUser';
import EditUser from '@/pages/users/EditUser';
import MySubscriptions from '@/pages/MySubscriptions';
import { Toaster } from '@/components/ui/sonner';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Rotas públicas */}
          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={<Register />} />
          <Route path="/nao-encontrado" element={<NotFound />} />
          <Route path="/nao-autorizado" element={<NotAuthorized />} />

          {/* Rotas protegidas com layout */}
          <Route
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            {/* Eventos */}
            <Route path="/eventos" element={<Events />} />
            <Route
              path="/eventos/novo"
              element={
                <ProtectedRoute requireAdmin>
                  <CreateEvent />
                </ProtectedRoute>
              }
            />
            <Route path="/eventos/:id" element={<EventDetail />} />
            <Route
              path="/eventos/:id/editar"
              element={
                <ProtectedRoute requireAdmin>
                  <EditEvent />
                </ProtectedRoute>
              }
            />

            {/* Minhas Inscrições */}
            <Route path="/minhas-inscricoes" element={<MySubscriptions />} />

            {/* Usuários (apenas admin) */}
            <Route
              path="/usuarios"
              element={
                <ProtectedRoute requireAdmin>
                  <Users />
                </ProtectedRoute>
              }
            />
            <Route
              path="/usuarios/novo"
              element={
                <ProtectedRoute requireAdmin>
                  <CreateUser />
                </ProtectedRoute>
              }
            />
            <Route
              path="/usuarios/:id/editar"
              element={
                <ProtectedRoute requireAdmin>
                  <EditUser />
                </ProtectedRoute>
              }
            />

            {/* Rota padrão - redireciona para eventos */}
            <Route path="/" element={<Navigate to="/eventos" replace />} />
          </Route>

          {/* Rota catch-all - 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
      <Toaster />
    </AuthProvider>
  );
}

export default App;
