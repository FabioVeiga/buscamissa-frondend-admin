 
/* eslint-disable react/prop-types */
/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect } from "react";
import api, { setAuthToken } from "../services/apiService";

// Criação do contexto de autenticação
const AuthContext = createContext();


export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setAuthToken(token); // Configura o token caso já exista
    }
  }, []);

  // Função para simular login
  const login = async (email, senha) => {
    try {
        const response = await api.post("/api/Usuario/autenticar", {
          email,
          senha,
        });
  
        if (response.status === 200) {
          setUser(response.data.data.usuario);
          setIsAuthenticated(true);
          localStorage.setItem('token', response.data.data.usuario.acessToken.token);
          setAuthToken(response.data.data.usuario.acessToken.token);
        }
      } catch (err) {
        console(err)
        if (err.response.data.data?.mensagemTela) {
          setError(err.response.data.data);
        } else {
          setError(err.response.data.errors);
        }
        setIsAuthenticated(false);
      }
  };

  // Função para logout
  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('token');
  };

  // Carregar estado inicial de autenticação, se necessário
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
      setIsAuthenticated(true);
    }
  }, []);

  // Salvar o usuário no localStorage quando logado
  useEffect(() => {
    if (isAuthenticated) {
      localStorage.setItem("user", JSON.stringify(user));
    } else {
      localStorage.removeItem("user");
      localStorage.removeItem('token');
    }
  }, [isAuthenticated, user]);

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout, error }}>
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
