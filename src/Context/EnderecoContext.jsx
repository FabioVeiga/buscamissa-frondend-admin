/* eslint-disable react/prop-types */
import { createContext, useContext, useState } from "react";

// Criação do contexto
const EnderecoContext = createContext();

// Provider para encapsular a aplicação
export const EnderecoProvider = ({ children }) => {
  const [endereco, setEndereco] = useState({});
  const resetEndereco = () => setEndereco({});
  
  return (
    <EnderecoContext.Provider value={{ endereco, setEndereco, resetEndereco }}>
      {children}
    </EnderecoContext.Provider>
  );
};

// Custom hook para acessar o contexto
export const useEndereco = () => {
  const context = useContext(EnderecoContext);
    if (!context) {
      throw new Error("useEndereco deve ser usado dentro de um EnderecoProvider");
    }
    return context;
};
