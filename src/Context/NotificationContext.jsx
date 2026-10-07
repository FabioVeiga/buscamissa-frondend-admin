/* eslint-disable react/prop-types, react-refresh/only-export-components */
import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { Alert, Button, IconButton, Snackbar } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

const NotificationContext = createContext({
  sucesso: () => {},
  erro: () => {},
  aviso: () => {},
  info: () => {},
});

/** Notificações globais (Snackbar) no lugar de alert() do navegador. */
export const NotificationProvider = ({ children }) => {
  const [aberta, setAberta] = useState(false);
  const [notificacao, setNotificacao] = useState({ mensagem: "", severidade: "info", acao: null });

  // opcoes.acao: { rotulo, onClick } — botão de ação na notificação (ex.: "Cadastrar outra")
  const mostrar = useCallback((severidade) => (mensagem, opcoes) => {
    setNotificacao({ mensagem, severidade, acao: opcoes?.acao ?? null });
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
        autoHideDuration={notificacao.acao ? 12000 : notificacao.severidade === "error" ? 8000 : 5000}
        onClose={fechar}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={notificacao.acao ? undefined : fechar}
          severity={notificacao.severidade}
          variant="filled"
          sx={{ width: "100%" }}
          action={
            notificacao.acao ? (
              <>
                <Button
                  color="inherit"
                  size="small"
                  onClick={() => {
                    setAberta(false);
                    notificacao.acao.onClick();
                  }}
                >
                  {notificacao.acao.rotulo}
                </Button>
                <IconButton aria-label="Fechar" color="inherit" size="small" onClick={fechar}>
                  <CloseIcon fontSize="small" />
                </IconButton>
              </>
            ) : undefined
          }
        >
          {notificacao.mensagem}
        </Alert>
      </Snackbar>
    </NotificationContext.Provider>
  );
};

export const useNotificar = () => useContext(NotificationContext);
