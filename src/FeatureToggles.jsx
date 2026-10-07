import { useState, useEffect } from "react";
import Menu from "./Components/Menu";
import { useNotificar } from "./Context/NotificationContext";
import PageHeader from "./Components/PageHeader";
import PageContainer from "./Components/PageContainer";
import DataTable from "./Components/DataTable";
import {
  Switch } from "@mui/material";
import api from "./services/apiService";

const FeatureTogglesPage = () => {
  const notificar = useNotificar();
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
      notificar.erro("Erro ao atualizar. Tente novamente.");
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
      <DataTable
        loading={isLoading}
        rows={toggles}
        getRowKey={(t) => t.chave}
        emptyTitle="Nenhum feature toggle cadastrado"
        columns={[
          { key: "chave", header: "Feature", render: (t) => <code>{t.chave}</code> },
          { key: "descricao", header: "Descrição" },
          {
            key: "habilitado",
            header: "Habilitado",
            align: "center",
            render: (t) => (
              <Switch
                checked={t.habilitado}
                disabled={savingChave === t.chave}
                onChange={() => handleToggle(t.chave, t.habilitado)}
              />
            ),
          },
          {
            key: "atualizadoEm",
            header: "Última alteração",
            render: (t) => `${new Date(t.atualizadoEm).toLocaleString("pt-BR")}${t.atualizadoPor ? ` — ${t.atualizadoPor}` : ""}`,
          },
        ]}
      />
      </PageContainer>
    </Menu>
  );
};

export default FeatureTogglesPage;
