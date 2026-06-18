import axios from 'axios';

// Configuração base do Axios
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://busca-missa.azurewebsites.net',
  timeout: 10000, // Tempo limite para as requisições
  headers: {
    'Content-Type': 'application/json',
  },
});

// Função para configurar o token
export const setAuthToken = (token) => {
  if (token) {
    // Define o token no header de todas as requisições
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    // Remove o header Authorization
    delete api.defaults.headers.common['Authorization'];
  }
};

// Registrar um callback para lidar com logout em caso de token expirado
let handleUnauthorized = null;

export const setUnauthorizedHandler = (callback) => {
  handleUnauthorized = callback;
};

// Interceptor de resposta para lidar com token expirado (401)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expirado ou inválido
      console.warn('Token expirado ou inválido');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setAuthToken(null);
      
      // Chamar o callback de logout se registrado
      if (handleUnauthorized) {
        handleUnauthorized();
      }
    }
    return Promise.reject(error);
  }
);

export default api;
