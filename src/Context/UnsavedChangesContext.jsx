/* eslint-disable react/prop-types, react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import ConfirmDialog from "../Components/ConfirmDialog";

const UnsavedChangesContext = createContext({
  definirSujo: () => {},
  navegar: () => {},
});

/** Guarda a navegação interna enquanto há alterações não salvas e avisa ao fechar/recarregar a aba. */
export const UnsavedChangesProvider = ({ children }) => {
  const navigate = useNavigate();
  const sujoRef = useRef(false);
  const [sujo, setSujo] = useState(false);
  const [pendente, setPendente] = useState(null);

  const definirSujo = useCallback((valor) => {
    sujoRef.current = valor;
    setSujo(valor);
  }, []);

  const navegar = useCallback(
    (to, options) => {
      if (!sujoRef.current) {
        navigate(to, options);
        return;
      }
      setPendente({ to, options });
    },
    [navigate]
  );

  useEffect(() => {
    if (!sujo) return undefined;
    const aviso = (e) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", aviso);
    return () => window.removeEventListener("beforeunload", aviso);
  }, [sujo]);

  const confirmarSaida = () => {
    const destino = pendente;
    setPendente(null);
    definirSujo(false);
    if (destino) navigate(destino.to, destino.options);
  };

  return (
    <UnsavedChangesContext.Provider value={{ definirSujo, navegar }}>
      {children}
      <ConfirmDialog
        open={!!pendente}
        title="Sair sem salvar?"
        message="Você tem alterações não salvas. Se sair agora, elas serão perdidas."
        confirmLabel="Sair sem salvar"
        cancelLabel="Continuar editando"
        destructive
        onConfirm={confirmarSaida}
        onClose={() => setPendente(null)}
      />
    </UnsavedChangesContext.Provider>
  );
};

/** navigate() que pergunta antes de sair quando há alterações não salvas. */
export const useNavegacaoProtegida = () => useContext(UnsavedChangesContext).navegar;

/**
 * Compara o snapshot atual com o estado "salvo". `chave` reinicia a base (ex.: outra igreja
 * carregada); `marcarSalvo()` aceita o estado atual como salvo (chamar no sucesso do envio).
 * Declare este hook DEPOIS dos efeitos que carregam os dados iniciais.
 */
export const useAlteracoesNaoSalvas = (snapshot, chave) => {
  const { definirSujo } = useContext(UnsavedChangesContext);
  const snapshotRef = useRef(snapshot);
  snapshotRef.current = snapshot;
  const [base, setBase] = useState(null);
  const [captura, setCaptura] = useState(0);

  useEffect(() => {
    setCaptura((c) => c + 1);
  }, [chave]);

  useEffect(() => {
    if (captura > 0) setBase(snapshotRef.current);
  }, [captura]);

  const sujo = base !== null && snapshot !== base;

  useEffect(() => {
    definirSujo(sujo);
  }, [sujo, definirSujo]);

  useEffect(() => () => definirSujo(false), [definirSujo]);

  const marcarSalvo = useCallback(() => setCaptura((c) => c + 1), []);

  return { sujo, marcarSalvo };
};
