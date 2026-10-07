import { useState, useEffect, useCallback } from "react";
import Menu from "./Components/Menu";
import PageHeader from "./Components/PageHeader";
import PageContainer from "./Components/PageContainer";
import DataTable from "./Components/DataTable";
import RowActions from "./Components/RowActions";
import StatusChip from "./Components/StatusChip";
import {
  CircularProgress,
  Typography,
  Tabs,
  Tab,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Snackbar } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import BlockIcon from "@mui/icons-material/Block";
import EditIcon from "@mui/icons-material/Edit";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import api from "./services/apiService";
import { useNavigate } from "react-router-dom";
import { buscarIgrejaCompletaPorId, normalizarIgrejaParaEdicao } from "./services/igrejaHelpers";

const STATUS_META = {
  PendenteVerificacao: { label: "Pendente", color: "warning" },
  Aprovado: { label: "Aprovado", color: "success" },
  Rejeitado: { label: "Rejeitado", color: "default" },
  Revogado: { label: "Revogado", color: "error" },
};

// Abas: 0 = fila de pendentes, 1 = histórico completo
const ResponsaveisPage = () => {
  const navigate = useNavigate();
  const [aba, setAba] = useState(0);
  const [registros, setRegistros] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Dialog de revisão (aprovar não pede motivo; rejeitar/revogar pedem)
  const [dialogAcao, setDialogAcao] = useState(null); // { registro, acao: 'aprovar'|'rejeitar'|'revogar' }
  const [motivo, setMotivo] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [erroDialog, setErroDialog] = useState(null);

  // Dialog de edição
  const [dialogEdicao, setDialogEdicao] = useState(null);
  const [formEdicao, setFormEdicao] = useState({ cargoInformado: "", observacaoSolicitacao: "" });
  const [salvandoEdicao, setSalvandoEdicao] = useState(false);
  const [erroEdicao, setErroEdicao] = useState(null);

  const [carregandoIgrejaId, setCarregandoIgrejaId] = useState(null);
  const [erroIgreja, setErroIgreja] = useState("");

  const handleIrParaIgreja = async (igrejaId) => {
    setCarregandoIgrejaId(igrejaId);
    try {
      const igreja = await buscarIgrejaCompletaPorId(igrejaId);
      navigate("/igrejaEditar", { state: { row: normalizarIgrejaParaEdicao(igreja) } });
    } catch (error) {
      console.error("Erro ao carregar igreja:", error);
      setErroIgreja("Não foi possível carregar os dados da igreja.");
    } finally {
      setCarregandoIgrejaId(null);
    }
  };

  const carregar = useCallback(async () => {
    setIsLoading(true);
    try {
      const url =
        aba === 0
          ? "/api/v1/admin/responsaveis/pendentes"
          : "/api/v1/admin/responsaveis";
      const response = await api.get(url);
      setRegistros(response.data?.data || []);
    } catch (error) {
      console.error("Erro ao buscar responsáveis:", error);
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
    if (acao !== "aprovar" && !motivo.trim()) {
      setErroDialog("Informe o motivo — ele será enviado por e-mail ao usuário.");
      return;
    }
    setSalvando(true);
    setErroDialog(null);
    try {
      await api.post(
        `/api/v1/admin/responsaveis/${registro.id}/${acao}`,
        acao === "aprovar" ? {} : { motivo: motivo.trim() }
      );
      setDialogAcao(null);
      carregar();
    } catch (error) {
      const mensagem =
        error.response?.data?.data ??
        "Erro ao processar. Tente novamente.";
      setErroDialog(typeof mensagem === "string" ? mensagem : "Erro ao processar. Tente novamente.");
    } finally {
      setSalvando(false);
    }
  };

  const tituloAcao = {
    aprovar: "Aprovar responsável",
    rejeitar: "Rejeitar solicitação",
    revogar: "Revogar acesso",
  };

  const abrirEdicao = (registro) => {
    setDialogEdicao(registro);
    setFormEdicao({
      cargoInformado: registro.cargoInformado || "",
      observacaoSolicitacao: registro.observacaoSolicitacao || "",
    });
    setErroEdicao(null);
  };

  const salvarEdicao = async () => {
    if (!dialogEdicao) return;

    setSalvandoEdicao(true);
    setErroEdicao(null);

    try {
      await api.put(`/api/v1/admin/responsaveis/${dialogEdicao.id}/editar`, formEdicao);
      setDialogEdicao(null);
      carregar();
    } catch (error) {
      const mensagem =
        error.response?.data?.data ??
        error.response?.data?.message ??
        "Erro ao atualizar. Tente novamente.";
      setErroEdicao(typeof mensagem === "string" ? mensagem : "Erro ao processar. Tente novamente.");
    } finally {
      setSalvandoEdicao(false);
    }
  };

  return (
    <Menu>
      <PageContainer>
      <PageHeader
        title="Responsáveis Verificados"
        subtitle={`Solicitações de responsáveis pelas igrejas (pároco/secretaria). Toda decisão notifica o usuário por e-mail. Aprovado vira perfil Dono e pode editar os dados da igreja direto pelo site.`}
      />
      <Tabs value={aba} onChange={(_, v) => setAba(v)} sx={{ mb: 1.5 }}>
        <Tab label="Fila de pendentes" />
        <Tab label="Histórico completo" />
      </Tabs>

      <DataTable
        loading={isLoading}
        rows={registros}
        getRowKey={(r) => r.id}
        emptyTitle={aba === 0 ? "Nenhuma solicitação pendente" : "Nenhum registro"}
        emptyDescription={aba === 0 ? "Tudo em dia por aqui." : undefined}
        columns={[
          {
            key: "igreja",
            header: "Igreja",
            render: (r) => (
              <>
                {r.igrejaNome}
                <Typography variant="caption" display="block" color="text.secondary">
                  {[r.igrejaCidade, r.igrejaUf].filter(Boolean).join(" — ")}
                </Typography>
              </>
            ),
          },
          {
            key: "usuario",
            header: "Solicitante",
            render: (r) => (
              <>
                {r.usuarioNome}
                <Typography variant="caption" display="block" color="text.secondary">
                  {r.usuarioEmail}
                </Typography>
              </>
            ),
          },
          {
            key: "cargo",
            header: "Cargo / Observação",
            render: (r) => (
              <>
                {r.cargoInformado || "—"}
                {r.observacaoSolicitacao && (
                  <Typography variant="caption" display="block" color="text.secondary">
                    {r.observacaoSolicitacao}
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
          { key: "dataSolicitacao", header: "Solicitado em", render: (r) => new Date(r.dataSolicitacao).toLocaleString("pt-BR") },
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
                  {
                    label: "Ir para edição da Igreja",
                    icon: carregandoIgrejaId === r.igrejaId ? <CircularProgress size={16} /> : <OpenInNewIcon fontSize="small" />,
                    color: "primary",
                    disabled: carregandoIgrejaId === r.igrejaId,
                    onClick: () => handleIrParaIgreja(r.igrejaId),
                  },
                  { label: "Editar informações", icon: <EditIcon fontSize="small" />, hidden: r.status !== "PendenteVerificacao" && r.status !== "Aprovado", onClick: () => abrirEdicao(r) },
                  { label: "Aprovar (envia e-mail)", icon: <CheckCircleIcon fontSize="small" />, color: "success", hidden: r.status !== "PendenteVerificacao", onClick: () => abrirAcao(r, "aprovar") },
                  { label: "Rejeitar com motivo (envia e-mail)", icon: <CancelIcon fontSize="small" />, hidden: r.status !== "PendenteVerificacao", onClick: () => abrirAcao(r, "rejeitar") },
                  { label: "Revogar acesso com motivo (envia e-mail)", icon: <BlockIcon fontSize="small" />, color: "error", hidden: r.status !== "Aprovado", onClick: () => abrirAcao(r, "revogar") },
                ]}
              />
            ),
          },
        ]}
      />

      <Dialog
        open={!!dialogAcao}
        onClose={() => !salvando && setDialogAcao(null)}
        maxWidth="sm"
        fullWidth
      >
        {dialogAcao && (
          <>
            <DialogTitle>{tituloAcao[dialogAcao.acao]}</DialogTitle>
            <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: "8px !important" }}>
              {erroDialog && <Alert severity="error">{erroDialog}</Alert>}
              <Typography variant="body2">
                {dialogAcao.acao === "aprovar" ? (
                  <>
                    Aprovar <strong>{dialogAcao.registro.usuarioNome}</strong> como
                    responsável por <strong>{dialogAcao.registro.igrejaNome}</strong>?
                    O usuário vira perfil Dono, recebe e-mail de confirmação e passa a
                    editar os dados da igreja (e das capelas sem responsável próprio).
                  </>
                ) : (
                  <>
                    {dialogAcao.acao === "rejeitar" ? "Rejeitar a solicitação de" : "Revogar o acesso de"}{" "}
                    <strong>{dialogAcao.registro.usuarioNome}</strong> para{" "}
                    <strong>{dialogAcao.registro.igrejaNome}</strong>? O motivo abaixo
                    será enviado por e-mail ao usuário.
                  </>
                )}
              </Typography>
              {dialogAcao.acao !== "aprovar" && (
                <TextField
                  label="Motivo (obrigatório)"
                  value={motivo}
                  onChange={(e) => setMotivo(e.target.value)}
                  multiline
                  minRows={2}
                  fullWidth
                  inputProps={{ maxLength: 500 }}
                />
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDialogAcao(null)} disabled={salvando}>
                Cancelar
              </Button>
              <Button
                variant="contained"
                color={dialogAcao.acao === "aprovar" ? "success" : "error"}
                onClick={confirmarAcao}
                disabled={salvando}
              >
                {salvando ? "Processando..." : tituloAcao[dialogAcao.acao]}
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      <Dialog
        open={!!dialogEdicao}
        onClose={() => !salvandoEdicao && setDialogEdicao(null)}
        maxWidth="sm"
        fullWidth
      >
        {dialogEdicao && (
          <>
            <DialogTitle>Editar responsável</DialogTitle>
            <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: "8px !important" }}>
              {erroEdicao && <Alert severity="error">{erroEdicao}</Alert>}
              <Typography variant="body2" color="text.secondary">
                Editando: <strong>{dialogEdicao.usuarioNome}</strong> — <strong>{dialogEdicao.igrejaNome}</strong>
              </Typography>
              <TextField
                label="Cargo Informado"
                value={formEdicao.cargoInformado}
                onChange={(e) => setFormEdicao({ ...formEdicao, cargoInformado: e.target.value })}
                fullWidth
                placeholder="ex: Pároco, Secretária, etc."
              />
              <TextField
                label="Observação da Solicitação"
                value={formEdicao.observacaoSolicitacao}
                onChange={(e) => setFormEdicao({ ...formEdicao, observacaoSolicitacao: e.target.value })}
                multiline
                minRows={3}
                fullWidth
                placeholder="Observações adicionais..."
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDialogEdicao(null)} disabled={salvandoEdicao}>
                Cancelar
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={salvarEdicao}
                disabled={salvandoEdicao}
              >
                {salvandoEdicao ? "Salvando..." : "Salvar"}
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      <Snackbar
        open={!!erroIgreja}
        autoHideDuration={5000}
        onClose={() => setErroIgreja("")}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert onClose={() => setErroIgreja("")} severity="error" variant="filled" sx={{ width: "100%" }}>
          {erroIgreja}
        </Alert>
      </Snackbar>
      </PageContainer>
    </Menu>
  );
};

export default ResponsaveisPage;
