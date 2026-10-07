import { useState, useEffect } from "react";
import Menu from "./Components/Menu";
import PageHeader from "./Components/PageHeader";
import PageContainer from "./Components/PageContainer";
import EmptyState from "./Components/EmptyState";
import LoadingState from "./Components/LoadingState";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Switch } from "@mui/material";
import api from "./services/apiService";

const FeatureTogglesPage = () => {
  const [toggles, setToggles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [savingChave, setSavingChave] = useState(null);

  useEffect(() => {
    getToggles();
  }, []);

  const getToggles = async () => {
    try {
      const response = await api.get("/api/v1/admin/feature-toggles");
      setToggles(response.data?.data || []);
    } catch (error) {
      console.error("Erro ao buscar feature toggles:", error);
      setToggles([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggle = async (chave, habilitadoAtual) => {
    setSavingChave(chave);
    const novoValor = !habilitadoAtual;

    setToggles((prev) =>
      prev.map((t) => (t.chave === chave ? { ...t, habilitado: novoValor } : t))
    );

    try {
      await api.put(`/api/v1/admin/feature-toggles/${chave}`, { habilitado: novoValor });
    } catch (error) {
      console.error("Erro ao atualizar feature toggle:", error);
      alert("Erro ao atualizar. Tente novamente.");
      setToggles((prev) =>
        prev.map((t) => (t.chave === chave ? { ...t, habilitado: habilitadoAtual } : t))
      );
    } finally {
      setSavingChave(null);
    }
  };

  return (
    <Menu>
      <PageContainer>
      <PageHeader
        title="Feature Toggles"
        subtitle={`Liga/desliga features do site público sem precisar de deploy. Alterações entram em vigor em até 1 minuto (cache do site).`}
      />
      <TableContainer component={Paper} sx={{ p: 2, borderRadius: 2, overflow: "auto" }}>
        {isLoading ? (
          <LoadingState />
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Feature</TableCell>
                <TableCell>Descrição</TableCell>
                <TableCell align="center">Habilitado</TableCell>
                <TableCell>Última alteração</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {toggles.length > 0 ? (
                toggles.map((t) => (
                  <TableRow key={t.chave}>
                    <TableCell>
                      <code>{t.chave}</code>
                    </TableCell>
                    <TableCell>{t.descricao}</TableCell>
                    <TableCell align="center">
                      <Switch
                        checked={t.habilitado}
                        disabled={savingChave === t.chave}
                        onChange={() => handleToggle(t.chave, t.habilitado)}
                      />
                    </TableCell>
                    <TableCell>
                      {new Date(t.atualizadoEm).toLocaleString("pt-BR")}
                      {t.atualizadoPor ? ` — ${t.atualizadoPor}` : ""}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4}>
                    <EmptyState title="Nenhum feature toggle cadastrado" />
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </TableContainer>
      </PageContainer>
    </Menu>
  );
};

export default FeatureTogglesPage;
