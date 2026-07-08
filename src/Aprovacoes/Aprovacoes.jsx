/* eslint-disable react/prop-types */
import { useCallback, useEffect, useState } from "react";
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import EditIcon from "@mui/icons-material/Edit";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { useNavigate } from "react-router-dom";
import Menu from "../Components/Menu";
import Pagination from "../Components/Paginacao";
import api from "../services/apiService";
import ErrorSpan from "../ErrorSpan";
import MissaForm from "../Igreja/Components/MissaForm";
import { diasDaSemana } from "../utils";

// Espelha BuscaMissa.Enums.StatusEnum (backend) — enums são serializados como número.
const STATUS = {
  FINALIZADO: 1,
  REJEITADO: 2,
  IGREJA_CRIACAO: 100,
  IGREJA_CRIACAO_AGUARDANDO_CODIGO: 101,
  IGREJA_ATUALIZACAO_TEMPORARIA_INSERIDO: 200,
  IGREJA_ATUALIZACAO_AGUARDANDO_CODIGO: 201,
};

const STATUS_LABELS = {
  [STATUS.FINALIZADO]: "Finalizado",
  [STATUS.REJEITADO]: "Rejeitado",
  [STATUS.IGREJA_CRIACAO]: "Criação — rascunho",
  [STATUS.IGREJA_CRIACAO_AGUARDANDO_CODIGO]: "Criação — aguardando código",
  [STATUS.IGREJA_ATUALIZACAO_TEMPORARIA_INSERIDO]: "Alteração — rascunho",
  [STATUS.IGREJA_ATUALIZACAO_AGUARDANDO_CODIGO]: "Alteração — aguardando código",
};

// null = "todos os pendentes" (comportamento padrão do backend sem filtro de status).
const FILTROS_STATUS = [
  { valor: null, label: "Pendentes" },
  { valor: STATUS.IGREJA_CRIACAO, label: "Criação — rascunho" },
  { valor: STATUS.IGREJA_CRIACAO_AGUARDANDO_CODIGO, label: "Criação — aguardando código" },
  { valor: STATUS.IGREJA_ATUALIZACAO_TEMPORARIA_INSERIDO, label: "Alteração — rascunho" },
  { valor: STATUS.IGREJA_ATUALIZACAO_AGUARDANDO_CODIGO, label: "Alteração — aguardando código" },
  { valor: STATUS.FINALIZADO, label: "Finalizados" },
  { valor: STATUS.REJEITADO, label: "Rejeitados" },
];

const formatarData = (valor) => (valor ? new Date(valor).toLocaleString("pt-BR") : "-");

const buscarIgrejaCompletaPorId = async (id) => {
  const response = await api.get(`/api/v2/Igreja/admin/${id}`);
  return response.data?.data || response.data;
};

const normalizarIgrejaParaEdicao = (response) => {
  const igreja = response?.igreja || response?.item || response?.data || response;
  const endereco =
    igreja?.endereco || igreja?.dadosEndereco || igreja?.dados?.endereco || response?.endereco || {};

  return {
    id: igreja?.id,
    nome: igreja?.nome || "",
    nomeUnico: igreja?.nomeUnico || "",
    slug: igreja?.slug || "",
    paroco: igreja?.paroco || "",
    missas: igreja?.missas || [],
    contato: igreja?.contato || {},
    redesSociais: igreja?.redesSociais || [],
    endereco,
    ativo: igreja?.ativo ?? true,
    imagemUrl: igreja?.imagemUrl || igreja?.imagem || "",
  };
};

// Bloco comparativo (usado tanto para "Atual" quanto "Proposto" no modal de detalhe).
const BlocoDados = ({ titulo, dados }) => (
  <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, height: "100%" }}>
    <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>
      {titulo}
    </Typography>
    {!dados ? (
      <Typography variant="body2" color="text.secondary">
        Não se aplica (igreja ainda não publicada).
      </Typography>
    ) : (
      <Stack spacing={1}>
        {dados.nome && <Typography variant="body2"><strong>Nome:</strong> {dados.nome}</Typography>}
        <Typography variant="body2"><strong>Pároco:</strong> {dados.paroco || "-"}</Typography>
        {dados.endereco && (
          <Typography variant="body2">
            <strong>Endereço:</strong> {[dados.endereco.logradouro, dados.endereco.bairro, dados.endereco.localidade, dados.endereco.uf].filter(Boolean).join(", ")}
          </Typography>
        )}
        <Typography variant="body2" fontWeight={600}>Missas:</Typography>
        {dados.missas?.length > 0 ? (
          dados.missas.map((m, i) => (
            <Typography key={i} variant="body2" color="text.secondary">
              {diasDaSemana.find((d) => d.value === m.diaSemana)?.label || m.diaSemana} às {m.horario}{m.observacao ? ` — ${m.observacao}` : ""}
            </Typography>
          ))
        ) : (
          <Typography variant="body2" color="text.secondary">Nenhuma missa.</Typography>
        )}
      </Stack>
    )}
  </Paper>
);

const Aprovacoes = () => {
  const navigate = useNavigate();
  const [statusFiltro, setStatusFiltro] = useState(null);
  const [itens, setItens] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ mensagem: "", severity: "", show: false });
  const [paginacao, setPaginacao] = useState({
    pageIndex: 1, pageSize: 20, totalPages: 1, hasPreviousPage: false, hasNextPage: false, totalItems: 0,
  });

  const [detalheAberto, setDetalheAberto] = useState(false);
  const [detalheLoading, setDetalheLoading] = useState(false);
  const [detalhe, setDetalhe] = useState(null);
  const [acaoLoading, setAcaoLoading] = useState(false);

  const [ajustarAberto, setAjustarAberto] = useState(false);
  const [ajustarForm, setAjustarForm] = useState({ paroco: "", imagem: null, missas: [] });

  const buscar = useCallback((pageIndex = 1) => {
    setIsLoading(true);
    const params = { "Paginacao.PageIndex": pageIndex, "Paginacao.PageSize": paginacao.pageSize };
    if (statusFiltro !== null) params.Status = statusFiltro;

    api.get("/api/v1/Aprovacao/pendentes", { params })
      .then((response) => {
        const data = response.data?.data || response.data;
        setItens(data?.items || []);
        setPaginacao((prev) => ({
          ...prev,
          pageIndex,
          totalPages: data?.totalPages ?? 1,
          hasPreviousPage: data?.hasPrevieusPage ?? false,
          hasNextPage: data?.hasNextPage ?? false,
          totalItems: data?.totalItems ?? 0,
        }));
      })
      .catch(() => setItens([]))
      .finally(() => setIsLoading(false));
  }, [statusFiltro, paginacao.pageSize]);

  useEffect(() => { buscar(1); }, [buscar]);

  const abrirDetalhe = async (item) => {
    setDetalheAberto(true);
    setDetalheLoading(true);
    setDetalhe(null);
    try {
      const response = await api.get(`/api/v1/Aprovacao/${item.controleId}/detalhe`);
      setDetalhe(response.data?.data || response.data);
    } catch {
      setMessage({ mensagem: "Não foi possível carregar o detalhe.", severity: "error", show: true });
      setDetalheAberto(false);
    } finally {
      setDetalheLoading(false);
    }
  };

  const fecharDetalhe = () => { setDetalheAberto(false); setDetalhe(null); };

  const aprovar = async (controleId) => {
    setAcaoLoading(true);
    try {
      await api.post(`/api/v1/Aprovacao/${controleId}/aprovar`);
      setMessage({ mensagem: "Aprovado com sucesso.", severity: "success", show: true });
      fecharDetalhe();
      buscar(paginacao.pageIndex);
    } catch (error) {
      setMessage({
        mensagem: error.response?.data?.data?.mensagemAplicacao || "Não foi possível aprovar.",
        severity: "error", show: true,
      });
    } finally {
      setAcaoLoading(false);
    }
  };

  const rejeitar = async (controleId) => {
    setAcaoLoading(true);
    try {
      await api.post(`/api/v1/Aprovacao/${controleId}/rejeitar`);
      setMessage({ mensagem: "Rejeitado.", severity: "success", show: true });
      fecharDetalhe();
      buscar(paginacao.pageIndex);
    } catch (error) {
      setMessage({
        mensagem: error.response?.data?.data?.mensagemAplicacao || "Não foi possível rejeitar.",
        severity: "error", show: true,
      });
    } finally {
      setAcaoLoading(false);
    }
  };

  // Alteração: modal leve (Pároco/Imagem/Missas). Criação: navega para a tela de edição completa.
  const ajustar = async (item) => {
    if (item.tipo === "Criacao") {
      try {
        const igrejaCompleta = await buscarIgrejaCompletaPorId(item.igrejaId);
        navigate("/igrejaEditar", { state: { row: normalizarIgrejaParaEdicao(igrejaCompleta) } });
      } catch {
        setMessage({ mensagem: "Não foi possível abrir a igreja para ajuste.", severity: "error", show: true });
      }
      return;
    }

    setDetalheLoading(true);
    try {
      const response = await api.get(`/api/v1/Aprovacao/${item.controleId}/detalhe`);
      const dados = response.data?.data || response.data;
      setDetalhe({ ...dados, controleId: item.controleId });
      setAjustarForm({
        paroco: dados.dadosPropostos?.paroco || "",
        imagem: null,
        missas: (dados.dadosPropostos?.missas || []).map((m) => ({
          diaSemana: m.diaSemana, horario: m.horario, observacao: m.observacao,
        })),
      });
      setAjustarAberto(true);
    } catch {
      setMessage({ mensagem: "Não foi possível carregar os dados para ajuste.", severity: "error", show: true });
    } finally {
      setDetalheLoading(false);
    }
  };

  const fecharAjustar = () => { setAjustarAberto(false); setAjustarForm({ paroco: "", imagem: null, missas: [] }); };

  const confirmarAjuste = async () => {
    if (!detalhe?.controleId) return;
    setAcaoLoading(true);
    try {
      await api.post(`/api/v1/Aprovacao/${detalhe.controleId}/ajustar`, {
        paroco: ajustarForm.paroco,
        imagem: ajustarForm.imagem,
        missas: ajustarForm.missas,
      });
      setMessage({ mensagem: "Ajuste concluído com sucesso.", severity: "success", show: true });
      fecharAjustar();
      fecharDetalhe();
      buscar(paginacao.pageIndex);
    } catch (error) {
      setMessage({
        mensagem: error.response?.data?.data?.mensagemAplicacao || "Não foi possível concluir o ajuste.",
        severity: "error", show: true,
      });
    } finally {
      setAcaoLoading(false);
    }
  };

  return (
    <Menu>
      <Stack spacing={2}>
        <Paper sx={{ p: 2, borderRadius: 2 }}>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            {FILTROS_STATUS.map((f) => (
              <Chip
                key={f.label}
                label={f.label}
                color={statusFiltro === f.valor ? "primary" : "default"}
                variant={statusFiltro === f.valor ? "filled" : "outlined"}
                onClick={() => setStatusFiltro(f.valor)}
              />
            ))}
          </Stack>
        </Paper>

        {message.show && (
          <ErrorSpan errorMessage={message.mensagem} severity={message.severity} />
        )}

        <TableContainer component={Paper} sx={{ p: 2, borderRadius: 2 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>Aprovações Pendentes</Typography>

          {isLoading ? (
            <Box display="flex" justifyContent="center" py={6}><CircularProgress /></Box>
          ) : (
            <>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Igreja</TableCell>
                    <TableCell>Cidade/UF</TableCell>
                    <TableCell>Tipo</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Data</TableCell>
                    <TableCell align="center">Ações</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {itens.length === 0 ? (
                    <TableRow><TableCell colSpan={6} align="center">Nenhum item encontrado.</TableCell></TableRow>
                  ) : (
                    itens.map((item) => (
                      <TableRow key={item.controleId} hover>
                        <TableCell>{item.nomeIgreja}</TableCell>
                        <TableCell>{[item.cidade, item.uf].filter(Boolean).join(" / ") || "-"}</TableCell>
                        <TableCell>{item.tipo === "Criacao" ? "Criação" : "Alteração"}</TableCell>
                        <TableCell>{STATUS_LABELS[item.status] || item.status}</TableCell>
                        <TableCell>{formatarData(item.dataCriacao)}</TableCell>
                        <TableCell align="center">
                          <Stack direction="row" spacing={0.5} justifyContent="center">
                            <Button size="small" startIcon={<VisibilityIcon />} onClick={() => abrirDetalhe(item)}>
                              Ver
                            </Button>
                            {item.status !== STATUS.FINALIZADO && item.status !== STATUS.REJEITADO && (
                              <>
                                <Button size="small" color="success" startIcon={<CheckCircleIcon />} onClick={() => aprovar(item.controleId)}>
                                  Aprovar
                                </Button>
                                <Button size="small" color="secondary" startIcon={<EditIcon />} onClick={() => ajustar(item)}>
                                  Ajustar
                                </Button>
                                <Button size="small" color="error" startIcon={<CancelIcon />} onClick={() => rejeitar(item.controleId)}>
                                  Rejeitar
                                </Button>
                              </>
                            )}
                          </Stack>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>

              <Pagination
                pageIndex={paginacao.pageIndex}
                totalPages={paginacao.totalPages}
                hasPreviousPage={paginacao.hasPreviousPage}
                hasNextPage={paginacao.hasNextPage}
                onPageChange={buscar}
              />
            </>
          )}
        </TableContainer>
      </Stack>

      {/* Modal de detalhe — comparativo antes/depois */}
      <Dialog open={detalheAberto} onClose={fecharDetalhe} maxWidth="md" fullWidth>
        <DialogTitle>Detalhe da solicitação</DialogTitle>
        <DialogContent>
          {detalheLoading || !detalhe ? (
            <Box display="flex" justifyContent="center" py={4}><CircularProgress /></Box>
          ) : (
            <Grid container spacing={2} sx={{ mt: 0.5 }}>
              <Grid item xs={12} md={detalhe.dadosAtuais ? 6 : 12}>
                <BlocoDados titulo="Atual (publicado)" dados={detalhe.dadosAtuais} />
              </Grid>
              {detalhe.dadosAtuais && <Grid item xs={12} md={6}>
                <BlocoDados titulo="Proposto" dados={detalhe.dadosPropostos} />
              </Grid>}
              {!detalhe.dadosAtuais && (
                <Grid item xs={12}>
                  <Divider sx={{ my: 1 }} />
                  <BlocoDados titulo="Dados da nova igreja" dados={detalhe.dadosPropostos} />
                </Grid>
              )}
            </Grid>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={fecharDetalhe}>Fechar</Button>
          {detalhe && detalhe.status !== STATUS.FINALIZADO && detalhe.status !== STATUS.REJEITADO && (
            <>
              <Button color="error" disabled={acaoLoading} onClick={() => rejeitar(detalhe.controleId)}>Rejeitar</Button>
              <Button color="success" variant="contained" disabled={acaoLoading} onClick={() => aprovar(detalhe.controleId)}>
                {acaoLoading ? <CircularProgress size={18} /> : "Aprovar"}
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>

      {/* Modal de ajuste (só alteração) */}
      <Dialog open={ajustarAberto} onClose={fecharAjustar} maxWidth="md" fullWidth>
        <DialogTitle>Ajustar alteração antes de concluir</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Pároco"
              value={ajustarForm.paroco}
              onChange={(e) => setAjustarForm((f) => ({ ...f, paroco: e.target.value }))}
              fullWidth
            />
            <MissaForm
              missas={ajustarForm.missas}
              setMissas={(updater) =>
                setAjustarForm((f) => ({
                  ...f,
                  missas: typeof updater === "function" ? updater(f.missas) : updater,
                }))
              }
              onError={(msg) => setMessage({ mensagem: msg, severity: "error", show: true })}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={fecharAjustar} disabled={acaoLoading}>Cancelar</Button>
          <Button variant="contained" onClick={confirmarAjuste} disabled={acaoLoading}>
            {acaoLoading ? <CircularProgress size={20} /> : "Concluir alteração"}
          </Button>
        </DialogActions>
      </Dialog>
    </Menu>
  );
};

export default Aprovacoes;
