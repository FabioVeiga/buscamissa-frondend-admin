import axios from 'axios';

// Configuração base do Axios
const api = axios.create({
  //baseURL: 'https://busca-missa-api-dev.azurewebsites.net',
  baseURL: 'https://localhost:7129',
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

export default api;
