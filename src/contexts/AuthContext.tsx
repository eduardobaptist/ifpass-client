import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import api from '@/lib/axios';
import type { User, LoginRequest, RegisterRequest, RegisterInternalRequest, VerifyInternalRequest, AuthResponse } from '@/types';
import { toast } from 'sonner';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  registerInternal: (data: RegisterInternalRequest) => Promise<void>;
  verifyInternal: (data: VerifyInternalRequest) => Promise<void>;
  logout: () => Promise<void>;
  me: () => Promise<User>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Busca informações do usuário autenticado
  // O cookie auth_token é enviado automaticamente pelo navegador via withCredentials
  const me = useCallback(async () => {
    try {
      const response = await api.get<AuthResponse>('/auth/me');
      const userData = response.data.user || response.data;
      setUser(userData);
      return userData;
    } catch (error) {
      setUser(null);
      throw error;
    }
  }, []);

  // Verifica se o usuário está autenticado ao carregar
  // O cookie HTTP-only é enviado automaticamente pelo navegador
  useEffect(() => {
    let mounted = true;

    me()
      .then(() => {
        if (mounted) {
          setLoading(false);
        }
      })
      .catch(() => {
        // Se não houver cookie válido, o usuário não está autenticado
        // Não mostra erro, é esperado quando não há sessão (ex: página de login)
        if (mounted) {
          setUser(null);
          setLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, [me]);

  // Login
  // A API envia o cookie HTTP-only "auth_token" como resposta no Set-Cookie
  // O cookie é armazenado automaticamente pelo navegador
  const login = async (credentials: LoginRequest) => {
    try {
      await api.post('/auth/login', credentials);
      // Após login bem-sucedido, busca os dados do usuário
      await me();
      toast.success('Login realizado com sucesso!');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Erro ao fazer login.';
      toast.error(message);
      throw error;
    }
  };

  // Registro
  // A API envia o cookie HTTP-only "auth_token" como resposta no Set-Cookie
  // O cookie é armazenado automaticamente pelo navegador
  const register = async (data: RegisterRequest) => {
    try {
      await api.post('/auth/register', data);
      // Após registro bem-sucedido, busca os dados do usuário
      await me();
      toast.success('Registro realizado com sucesso!');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Erro ao se registrar.';
      toast.error(message);
      throw error;
    }
  };

  // Registro interno (envia código por e-mail)
  const registerInternal = async (data: RegisterInternalRequest) => {
    try {
      await api.post('/auth/register-internal', data);
      toast.success('Código de verificação enviado para seu e-mail!');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Erro ao enviar código de verificação.';
      toast.error(message);
      throw error;
    }
  };

  // Verificação interna (valida código e autentica)
  // A API envia o cookie HTTP-only "auth_token" como resposta no Set-Cookie
  // O cookie é armazenado automaticamente pelo navegador
  const verifyInternal = async (data: VerifyInternalRequest) => {
    try {
      await api.post('/auth/verify-internal', data);
      // Após verificação bem-sucedida, busca os dados do usuário
      await me();
      toast.success('Verificação realizada com sucesso!');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Erro ao verificar código.';
      toast.error(message);
      throw error;
    }
  };

  // Logout
  // A API remove o cookie no servidor
  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      // Continua mesmo se a requisição falhar
      console.error('Erro ao fazer logout:', error);
    } finally {
      // Limpa o estado do usuário
      setUser(null);
      toast.success('Logout realizado com sucesso!');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        registerInternal,
        verifyInternal,
        logout,
        me,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};

