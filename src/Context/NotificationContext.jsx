/* eslint-disable react/prop-types, react-refresh/only-export-components */
import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { Alert, Snackbar } from "@mui/material";

const NotificationContext = createContext({
  sucesso: () => {},
  erro: () => {},
  aviso: () => {},
  info: () => {},
});

/** Notificações globais (Snackbar) no lugar de alert() do navegador. */
export const NotificationProvider = ({ children }) => {
  const [aberta, setAberta] = useState(false);
  const [notificacao, setNotificacao] = useState({ mensagem: "", severidade: "info" });

  const mostrar = useCallback((severidade) => (mensagem) => {
    setNotificacao({ mensagem, severidade });
    setAberta(true);
  }, []);

  const api = useMemo(
    () => ({
      sucesso: mostrar("success"),
      erro: mostrar("error"),
      aviso: mostrar("warning"),
      info: mostrar("info"),
    }),
    [mostrar]
  );

  const fechar = (_, motivo) => {
    if (motivo === "clickaway") return;
    setAberta(false);
  };

  return (
    <NotificationContext.Provider value={api}>
      {children}
      <Snackbar
        open={aberta}
        autoHideDuration={notificacao.severidade === "error" ? 8000 : 5000}
        onClose={fechar}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert onClose={fechar} severity={notificacao.severidade} variant="filled" sx={{ width: "100%" }}>
          {notificacao.mensagem}
        </Alert>
      </Snackbar>
    </NotificationContext.Provider>
  );
};

export const useNotificar = () => useContext(NotificationContext);
