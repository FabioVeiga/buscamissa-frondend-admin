import { useState, useEffect, useCallback } from "react";
import Menu from "./Components/Menu";
import PageHeader from "./Components/PageHeader";
import PageContainer from "./Components/PageContainer";
import DataTable from "./Components/DataTable";
import RowActions from "./Components/RowActions";
import StatusChip from "./Components/StatusChip";
import {
  Typography,
  Tabs,
  Tab,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import api from "./services/apiService";

const STATUS_META = {
  Pendente: { label: "Pendente", color: "warning" },
  Aprovado: { label: "Aprovado", color: "success" },
  Rejeitado: { label: "Rejeitado", color: "default" },
};

// Abas: 0 = fila de pendentes, 1 = histórico completo
const SolicitacoesVinculoCapelaPage = () => {
  const [aba, setAba] = useState(0);
  const [registros, setRegistros] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Dialog de revisão (aprovar não pede motivo; rejeitar pede)
  const [dialogAcao, setDialogAcao] = useState(null); // { registro, acao: 'aprovar'|'rejeitar' }
  const [motivo, setMotivo] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [erroDialog, setErroDialog] = useState(null);

  const carregar = useCallback(async () => {
    setIsLoading(true);
    try {
      const url =
        aba === 0
          ? "/api/v1/admin/solicitacoes-vinculo-capela/pendentes"
          : "/api/v1/admin/solicitacoes-vinculo-capela";
      const response = await api.get(url);
      setRegistros(response.data?.data || []);
    } catch (error) {
      console.error("Erro ao buscar solicitações de vínculo de capela:", error);
      setRegistros([]);
    } finally {
      setIsLoading(false);
    }
  }, [aba]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const abrirAcao = (registro, acao) => {
    setDialogAcao({ registro, acao });
    setMotivo("");
    setErroDialog(null);
  };

  const confirmarAcao = async () => {
    const { registro, acao } = dialogAcao;
    if (acao === "rejeitar" && !motivo.trim()) {
      setErroDialog("Informe o motivo da rejeição.");
      return;
    }
    setSalvando(true);
    setErroDialog(null);
    try {
      await api.post(
        `/api/v1/admin/solicitacoes-vinculo-capela/${registro.id}/${acao}`,
        acao === "aprovar" ? {} : { motivo: motivo.trim() }
      );
      setDialogAcao(null);
      carregar();
    } catch (error) {
      const mensagem = error.response?.data?.data ?? "Erro ao processar. Tente novamente.";
      setErroDialog(typeof mensagem === "string" ? mensagem : "Erro ao processar. Tente novamente.");
    } finally {
      setSalvando(false);
    }
  };

  const tituloAcao = {
    aprovar: "Aprovar vínculo",
    rejeitar: "Rejeitar solicitação",
  };

  return (
    <Menu>
      <PageContainer>
      <PageHeader
        title="Solicitações de Vínculo de Capela"
        subtitle={`Pedidos de responsáveis para anexar uma capela/comunidade órfã à própria paróquia (Fase 4 do vínculo Igreja↔Diocese). Aprovar seta Igreja.IgrejaPaiId da capela para a paróquia solicitante.`}
      />
      <Tabs value={aba} onChange={(_, v) => setAba(v)} sx={{ mb: 1.5 }}>
        <Tab label="Fila de pendentes" />
        <Tab label="Histórico completo" />
      </Tabs>

      <DataTable
        loading={isLoading}
        rows={registros}
        getRowKey={(r) => r.id}
        pageSize={25}
        emptyTitle="Nenhuma solicitação encontrada"
        columns={[
          { key: "capelaNome", header: "Capela/comunidade", sortable: true },
          { key: "paroquiaNome", header: "Paróquia solicitante", sortable: true },
          {
            key: "usuario",
            header: "Solicitante",
            render: (r) => (
              <>
                {r.usuarioNome}
                <Typography variant="caption" display="block" color="text.secondary">
                  {r.usuarioEmail}
                </Typography>
                {r.observacao && (
                  <Typography variant="caption" display="block" color="text.secondary">
                    {r.observacao}
                  </Typography>
                )}
                {r.motivoRevisao && (
                  <Typography variant="caption" display="block" color="error.main">
                    Motivo: {r.motivoRevisao} ({r.revisadoPor})
                  </Typography>
                )}
              </>
            ),
          },
          { key: "dataSolicitacao", header: "Solicitado em", sortable: true, sortValue: (r) => new Date(r.dataSolicitacao), render: (r) => new Date(r.dataSolicitacao).toLocaleString("pt-BR") },
          {
            key: "status",
            header: "Status",
            align: "center",
            render: (r) => {
              const meta = STATUS_META[r.status] || { label: r.status, color: "default" };
              return <StatusChip label={meta.label} color={meta.color} />;
            },
          },
          {
            key: "acoes",
            header: "Ações",
            align: "center",
            render: (r) => (
              <RowActions
                actions={[
                  { label: "Aprovar", icon: <CheckCircleIcon fontSize="small" />, color: "success", hidden: r.status !== "Pendente", onClick: () => abrirAcao(r, "aprovar") },
                  { label: "Rejeitar", icon: <CancelIcon fontSize="small" />, color: "error", hidden: r.status !== "Pendente", onClick: () => abrirAcao(r, "rejeitar") },
                ]}
              />
            ),
          },
        ]}
      />

      <Dialog open={!!dialogAcao} onClose={() => setDialogAcao(null)} maxWidth="sm" fullWidth>
        <DialogTitle>{dialogAcao && tituloAcao[dialogAcao.acao]}</DialogTitle>
        <DialogContent>
          {erroDialog && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {erroDialog}
            </Alert>
          )}
          <Typography variant="body2" sx={{ mb: 2 }}>
            {dialogAcao?.registro?.capelaNome} → {dialogAcao?.registro?.paroquiaNome}
          </Typography>
          {dialogAcao?.acao === "rejeitar" && (
            <TextField
              label="Motivo"
              fullWidth
              multiline
              rows={3}
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogAcao(null)}>Cancelar</Button>
          <Button variant="contained" onClick={confirmarAcao} disabled={salvando}>
            Confirmar
          </Button>
        </DialogActions>
      </Dialog>
      </PageContainer>
    </Menu>
  );
};

export default SolicitacoesVinculoCapelaPage;
