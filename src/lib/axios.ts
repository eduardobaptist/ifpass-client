import axios from 'axios';
import { toast } from 'sonner';

// Configuração base do axios
// A URL da API vem da variável de ambiente VITE_API_URL
const apiBaseURL = import.meta.env.VITE_API_URL || 'http://localhost:3333';

const api = axios.create({
  baseURL: apiBaseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Envia cookies HTTP-only automaticamente em todas as requisições
});

// Interceptor de resposta - trata erros comuns
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Tratamento de erros HTTP
    if (error.response) {
      const { status } = error.response;
      const currentPath = window.location.pathname;

      switch (status) {
        case 401:
          // Não autorizado - redireciona para login apenas se não estiver já na página de login/registro/validação
          // O cookie já foi invalidado pelo servidor ou não existe
          if (currentPath !== '/login' && currentPath !== '/registro' && currentPath !== '/validar-certificado') {
            window.location.href = '/login';
            toast.error('Sessão expirada. Faça login novamente.');
          }
          // Se já estiver na página de login/registro/validação, apenas rejeita a promise
          // Não mostra toast para evitar mensagens desnecessárias na verificação inicial
          break;

        case 403:
          // Proibido - redireciona para página de não autorizado
          window.location.href = '/nao-autorizado';
          toast.error('Você não tem permissão para acessar esta página.');
          break;

        case 500:
          toast.error('Erro no servidor. Tente novamente mais tarde.');
          break;

        default:
          // Outros erros - mostra mensagem de erro se disponível
          const message = error.response?.data?.message || 'Ocorreu um erro.';
          toast.error(message);
      }
    } else if (error.request) {
      // Erro de rede
      toast.error('Erro de conexão. Verifique sua internet.');
    } else {
      // Erro ao configurar a requisição
      toast.error('Erro ao processar requisição.');
    }

    return Promise.reject(error);
  }
);

export default api;

