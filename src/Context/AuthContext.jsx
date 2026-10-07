 
/* eslint-disable react/prop-types */
/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api, { setAuthToken, setUnauthorizedHandler } from "../services/apiService";
import { perfilDoToken, tokenExpirado, PERFIL_ADMIN } from "../utils/jwt";

// Criação do contexto de autenticação
const AuthContext = createContext();


export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [perfil, setPerfil] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  // Configurar o handler para token expirado
  useEffect(() => {
    setUnauthorizedHandler(() => {
      setUser(null);
      setIsAuthenticated(false);
      navigate('/login');
    });
  }, [navigate]);

  // Verificar token ao montar
  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    const perfilToken = token ? perfilDoToken(token) : null;
    const sessaoValida = !!token && perfilToken === PERFIL_ADMIN && !tokenExpirado(token);

    if (sessaoValida) {
      setAuthToken(token);
      if (storedUser) {
        setUser(JSON.parse(storedUser));
        setPerfil(perfilToken);
        setIsAuthenticated(true);
      }
    } else if (token) {
      // Sessão de quem não é administrador (ou token vencido): encerra
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setAuthToken(null);
    }
    setLoading(false);
  }, []);

  // Função para login
  const login = async (email, senha) => {
    try {
      setError(null);
      setLoading(true);
      const response = await api.post("/api/v1/Usuario/autenticar", {
        email: email,
        senha: senha,
      });

      if (response.status === 200) {
        const userData = response.data.data.usuario;
        const token = userData.acessToken.token;
        const perfilToken = perfilDoToken(token);

        if (perfilToken !== PERFIL_ADMIN) {
          setError({ mensagemTela: 'Acesso restrito a administradores.' });
          setIsAuthenticated(false);
          return false;
        }

        setUser(userData);
        setPerfil(perfilToken);
        setIsAuthenticated(true);
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userData));
        setAuthToken(token);
        return true;
      }
    } catch (err) {
      console.error('Erro ao fazer login:', err);
      const errorData = err.response?.data?.data?.mensagemTela 
        ? err.response.data.data 
        : err.response?.data?.errors || { mensagemTela: 'Erro ao fazer login' };
      
      setError(errorData);
      setIsAuthenticated(false);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Função para logout
  const logout = () => {
    setUser(null);
    setPerfil(null);
    setIsAuthenticated(false);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setAuthToken(null);
    setError(null);
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, perfil, login, logout, error, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook personalizado para usar o AuthContext
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  }
  return context;
};
