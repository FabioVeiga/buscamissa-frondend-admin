import { useState, useEffect, useCallback } from "react";
import Menu from "./Components/Menu";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Box,
  Typography,
  Tabs,
  Tab,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip,
  Tooltip,
  Alert,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import BlockIcon from "@mui/icons-material/Block";
import api from "./services/apiService";

const STATUS_META = {
  PendenteVerificacao: { label: "Pendente", color: "warning" },
  Aprovado: { label: "Aprovado", color: "success" },
  Rejeitado: { label: "Rejeitado", color: "default" },
  Revogado: { label: "Revogado", color: "error" },
};

// Abas: 0 = fila de pendentes, 1 = histórico completo
const ResponsaveisPage = () => {
  const [aba, setAba] = useState(0);
  const [registros, setRegistros] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Dialog de revisão (aprovar não pede motivo; rejeitar/revogar pedem)
  const [dialogAcao, setDialogAcao] = useState(null); // { registro, acao: 'aprovar'|'rejeitar'|'revogar' }
  const [motivo, setMotivo] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [erroDialog, setErroDialog] = useState(null);

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

  return (
    <Menu>
      <TableContainer component={Paper} sx={{ p: 2, borderRadius: 2, overflow: "auto" }}>
        <Box sx={{ mb: 2 }}>
          <Typography variant="h5" fontWeight={600}>
            Responsáveis Verificados
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Solicitações de responsáveis pelas igrejas (pároco/secretaria). Toda
            decisão notifica o usuário por e-mail. Aprovado vira perfil Dono e
            pode editar os dados da igreja direto pelo site.
          </Typography>
        </Box>

        <Tabs value={aba} onChange={(_, v) => setAba(v)} sx={{ mb: 1 }}>
          <Tab label="Fila de pendentes" />
          <Tab label="Histórico completo" />
        </Tabs>

        {isLoading ? (
          <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" py={4}>
            <CircularProgress size={60} />
            <Typography variant="h6" mt={2}>
              Carregando...
            </Typography>
          </Box>
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Igreja</TableCell>
                <TableCell>Solicitante</TableCell>
                <TableCell>Cargo / Observação</TableCell>
                <TableCell>Solicitado em</TableCell>
                <TableCell align="center">Status</TableCell>
                <TableCell align="center">Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {registros.length > 0 ? (
                registros.map((r) => {
                  const meta = STATUS_META[r.status] || { label: r.status, color: "default" };
                  return (
                    <TableRow key={r.id}>
                      <TableCell>
                        {r.igrejaNome}
                        <Typography variant="caption" display="block" color="text.secondary">
                          {[r.igrejaCidade, r.igrejaUf].filter(Boolean).join(" — ")}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {r.usuarioNome}
                        <Typography variant="caption" display="block" color="text.secondary">
                          {r.usuarioEmail}
                        </Typography>
                      </TableCell>
                      <TableCell>
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
                      </TableCell>
                      <TableCell>
                        {new Date(r.dataSolicitacao).toLocaleString("pt-BR")}
                      </TableCell>
                      <TableCell align="center">
                        <Chip size="small" label={meta.label} color={meta.color} />
                      </TableCell>
                      <TableCell align="center" sx={{ whiteSpace: "nowrap" }}>
                        {r.status === "PendenteVerificacao" && (
                          <>
                            <Tooltip title="Aprovar (envia e-mail)">
                              <Button
                                size="small"
                                color="success"
                                startIcon={<CheckCircleIcon />}
                                onClick={() => abrirAcao(r, "aprovar")}
                              >
                                Aprovar
                              </Button>
                            </Tooltip>
                            <Tooltip title="Rejeitar com motivo (envia e-mail)">
                              <Button
                                size="small"
                                color="inherit"
                                startIcon={<CancelIcon />}
                                onClick={() => abrirAcao(r, "rejeitar")}
                              >
                                Rejeitar
                              </Button>
                            </Tooltip>
                          </>
                        )}
                        {r.status === "Aprovado" && (
                          <Tooltip title="Revogar acesso com motivo (envia e-mail)">
                            <Button
                              size="small"
                              color="error"
                              startIcon={<BlockIcon />}
                              onClick={() => abrirAcao(r, "revogar")}
                            >
                              Revogar
                            </Button>
                          </Tooltip>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    {aba === 0
                      ? "Nenhuma solicitação pendente. 🎉"
                      : "Nenhum registro."}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </TableContainer>

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
    </Menu>
  );
};

export default ResponsaveisPage;
