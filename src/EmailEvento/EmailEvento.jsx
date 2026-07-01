import { useState, useEffect, useCallback } from "react";
import {
  Box,
  Button,
  Checkbox,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Paper,
  Radio,
  RadioGroup,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableFooter,
  TableHead,
  TableRow,
  TextField,
  Typography,
  IconButton,
  Tooltip,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import AddIcon from "@mui/icons-material/Add";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import PhoneCallbackIcon from "@mui/icons-material/PhoneCallback";
import Menu from "../Components/Menu";
import Pagination from "../Components/Paginacao";
import api from "../services/apiService";
import ErrorSpan from "../ErrorSpan";
import DashboardDivulgacao from "./DashboardDivulgacao";
import FiltrosRapidos, { filtrosVazios } from "./FiltrosRapidos";
import {
  gerarMensagemInstagram,
  gerarMensagemFacebook,
  construirLinkIgreja,
} from "../services/mensagemDivulgacao";

const TIPOS_EMAIL = [
  { value: "", label: "Todos" },
  { value: "criacao", label: "Criação" },
  { value: "alteracao", label: "Alteração" },
  { value: "notificacao", label: "Notificação" },
  { value: "validacao", label: "Validação" },
  { value: "outro", label: "Outro" },
];

const TIPO_LABEL = {
  1: "Criação",
  2: "Alteração",
  3: "Notificação",
  4: "Validação",
  99: "Outro",
};

const CANAL_LABEL = {
  1: "E-mail",
  2: "Instagram",
  3: "Facebook",
};

const filtrosIniciais = {
  IgrejaId: "",
  IgrejaNome: "",
  Cidade: "",
  Tipo: "",
  Canal: "",
  EmailDestino: "",
  Enviado: "",
  DataEnvioInicio: "",
  DataEnvioFim: "",
};

const formInicialCriar = {
  igrejaId: "",
  tipo: "",
  emailDestino: "",
  ativo: true,
};

const formInicialAtualizar = {
  tipo: "",
  emailDestino: "",
  ativo: true,
};

const formatarData = (valor) => {
  if (!valor) return "-";
  return new Date(valor).toLocaleString("pt-BR");
};

// modos que mostram a listagem de contatos normalmente
const MODOS_CONTATO = new Set(["total", "com-email", "com-instagram"]);
// modos que buscam igrejas pendentes via endpoint separado
const MODOS_PENDENTES = new Set(["nunca-email", "nunca-instagram", "criadas", "alteradas"]);

const EmailEventoPage = () => {
  const [registros, setRegistros] = useState([]);
  const [selecionados, setSelecionados] = useState([]);

  // Dashboard
  const [dashboard, setDashboard] = useState(null);
  const [dashboardLoading, setDashboardLoading] = useState(true);
  const [modoCard, setModoCard] = useState("total");

  // Igrejas pendentes (modo "nunca-*", "criadas", "alteradas")
  const [igrejasPendentes, setIgrejasPendentes] = useState([]);
  const [pendentesLoading, setPendentesLoading] = useState(false);
  const [filtrosRapidos, setFiltrosRapidos] = useState(filtrosVazios);
  const [isLoading, setIsLoading] = useState(false);
  const [paginacao, setPaginacao] = useState({
    pageIndex: 1,
    pageSize: 10,
    totalPages: 1,
    hasPreviousPage: false,
    hasNextPage: false,
    totalItems: 0,
  });
  const [filtros, setFiltros] = useState(filtrosIniciais);
  const [filtrosAplicados, setFiltrosAplicados] = useState(filtrosIniciais);

  const [modalCriarAberto, setModalCriarAberto] = useState(false);
  const [modalEditarAberto, setModalEditarAberto] = useState(false);
  const [editarId, setEditarId] = useState(null);
  const [formCriar, setFormCriar] = useState(formInicialCriar);
  const [formEditar, setFormEditar] = useState(formInicialAtualizar);
  const [loadingAcao, setLoadingAcao] = useState(false);
  const [message, setMessage] = useState({ mensagem: "", severity: "", show: false });

  // Modal Registro Manual
  const modalRegistroManualVazio = { igrejaId: "", canal: "2", destinoContato: "", observacao: "" };
  const [modalRegistroManualAberto, setModalRegistroManualAberto] = useState(false);
  const [formRegistroManual, setFormRegistroManual] = useState(modalRegistroManualVazio);
  const [registroManualLoading, setRegistroManualLoading] = useState(false);

  const abrirModalRegistroManual = () => {
    setFormRegistroManual({ ...modalRegistroManualVazio, igrejaId: idSelecionado });
    setModalRegistroManualAberto(true);
  };

  const salvarRegistroManual = async () => {
    if (!formRegistroManual.igrejaId || !formRegistroManual.destinoContato.trim()) return;
    setRegistroManualLoading(true);
    try {
      await api.post("/api/v1/Admin/email-evento/registrar-contato", {
        igrejaId: Number(formRegistroManual.igrejaId),
        tipo: 99, // Outro
        canal: Number(formRegistroManual.canal),
        destinoContato: formRegistroManual.destinoContato.trim(),
        dataEnvio: new Date().toISOString(),
        observacao: formRegistroManual.observacao.trim() || null,
      });
      setModalRegistroManualAberto(false);
      buscar(1);
    } catch {
      // erro silencioso — backend retornará mensagem de validação
    } finally {
      setRegistroManualLoading(false);
    }
  };

  const buscar = useCallback(
    async (pageIndex = 1) => {
      setIsLoading(true);
      try {
        const params = new URLSearchParams();
        params.append("PageIndex", pageIndex);
        params.append("PageSize", paginacao.pageSize);

        if (filtrosAplicados.IgrejaId) params.append("IgrejaId", filtrosAplicados.IgrejaId);
        if (filtrosAplicados.IgrejaNome) params.append("IgrejaNome", filtrosAplicados.IgrejaNome);
        if (filtrosAplicados.Cidade) params.append("Cidade", filtrosAplicados.Cidade);
        if (filtrosAplicados.Tipo) params.append("Tipo", filtrosAplicados.Tipo);
        if (filtrosAplicados.Canal) params.append("Canal", filtrosAplicados.Canal);
        if (filtrosAplicados.EmailDestino) params.append("EmailDestino", filtrosAplicados.EmailDestino);
        if (filtrosAplicados.Enviado !== "") params.append("Enviado", filtrosAplicados.Enviado);
        if (filtrosAplicados.DataEnvioInicio) params.append("DataEnvioInicio", filtrosAplicados.DataEnvioInicio);
        if (filtrosAplicados.DataEnvioFim) params.append("DataEnvioFim", filtrosAplicados.DataEnvioFim);

        const response = await api.get(`/api/v1/Admin/email-evento/buscar-por-filtro?${params.toString()}`);
        const data = response.data?.data || response.data;

        setRegistros(data?.items || data?.data || []);
        setSelecionados([]);
        setPaginacao((prev) => ({
          ...prev,
          pageIndex,
          totalPages: data?.totalPages ?? 1,
          hasPreviousPage: data?.hasPreviousPage ?? false,
          hasNextPage: data?.hasNextPage ?? false,
          totalItems: data?.totalItems ?? 0,
        }));
      } catch {
        setRegistros([]);
      } finally {
        setIsLoading(false);
      }
    },
    [filtrosAplicados, paginacao.pageSize]
  );

  // Carrega dashboard uma vez
  useEffect(() => {
    api.get("/api/v1/Admin/divulgacao/dashboard")
      .then((res) => setDashboard(res.data?.data || null))
      .finally(() => setDashboardLoading(false));
  }, []);

  useEffect(() => {
    buscar(1);
  }, [filtrosAplicados]);

  const buscarIgrejasPendentes = (fr = filtrosRapidos, modo = modoCard) => {
    setPendentesLoading(true);
    setIgrejasPendentes([]);
    setSelecionados([]);

    const params = new URLSearchParams();
    if (MODOS_PENDENTES.has(modo)) params.append("Modo", modo);
    if (fr.nome) params.append("Nome", fr.nome);
    if (fr.cidade) params.append("Cidade", fr.cidade);
    if (fr.uf) params.append("Uf", fr.uf);
    if (fr.comEmail) params.append("ComEmail", "true");
    if (fr.comInstagram) params.append("ComInstagram", "true");
    if (fr.semContatoEmail) params.append("SemContatoEmail", "true");
    if (fr.semContatoInstagram) params.append("SemContatoInstagram", "true");
    if (fr.criadaRecentemente) params.append("CriadaRecentemente", "true");
    if (fr.alteradaRecentemente) params.append("AlteradaRecentemente", "true");

    api.get(`/api/v1/Admin/divulgacao/igrejas-pendentes?${params.toString()}`)
      .then((res) => setIgrejasPendentes(res.data?.data || []))
      .finally(() => setPendentesLoading(false));
  };

  const handleCardClick = (modo) => {
    setModoCard(modo);
    setSelecionados([]);

    if (MODOS_PENDENTES.has(modo)) {
      const fr = {
        ...filtrosVazios,
        semContatoEmail: modo === "nunca-email",
        semContatoInstagram: modo === "nunca-instagram",
        criadaRecentemente: modo === "criadas",
        alteradaRecentemente: modo === "alteradas",
      };
      setFiltrosRapidos(fr);
      buscarIgrejasPendentes(fr, modo);
      return;
    }

    // Modos de contato: aplica filtros na listagem de contatos
    const novosFiltros = { ...filtrosIniciais };
    if (modo === "com-email") novosFiltros.Canal = "1";
    if (modo === "com-instagram") novosFiltros.Canal = "2";
    setFiltros(novosFiltros);
    setFiltrosAplicados(novosFiltros);
  };

  const handleFiltrosRapidosBuscar = () => {
    const temFiltroRapido = Object.values(filtrosRapidos).some(Boolean);
    if (temFiltroRapido || MODOS_PENDENTES.has(modoCard)) {
      if (!MODOS_PENDENTES.has(modoCard)) setModoCard("nunca-email"); // força modo pendentes
      buscarIgrejasPendentes(filtrosRapidos, MODOS_PENDENTES.has(modoCard) ? modoCard : undefined);
    }
  };

  const handleFiltrosRapidosLimpar = () => {
    if (MODOS_PENDENTES.has(modoCard)) buscarIgrejasPendentes(filtrosVazios, modoCard);
  };

  const handlePesquisar = () => {
    setFiltrosAplicados({ ...filtros });
  };

  const handleLimpar = () => {
    setFiltros(filtrosIniciais);
    setFiltrosAplicados(filtrosIniciais);
  };

  const handlePageChange = (page) => {
    buscar(page);
  };

  const idSelecionado = selecionados.length === 1
    ? (registros.find((r) => r.id === selecionados[0])?.igrejaId ?? "")
    : "";

  const abrirModalCriar = () => {
    setFormCriar({ ...formInicialCriar, igrejaId: idSelecionado });
    setMessage({ mensagem: "", severity: "", show: false });
    setModalCriarAberto(true);
  };

  const abrirModalEditar = (registro) => {
    setEditarId(registro.id);
    setFormEditar({
      tipo: registro.tipo || "",
      emailDestino: registro.emailDestino || "",
      ativo: registro.ativo ?? true,
    });
    setMessage({ mensagem: "", severity: "", show: false });
    setModalEditarAberto(true);
  };

  const handleCriar = async () => {
    if (!formCriar.igrejaId || !formCriar.tipo || !formCriar.emailDestino) {
      setMessage({ mensagem: "Preencha Igreja ID, Tipo e E-mail Destino.", severity: "error", show: true });
      return;
    }
    setLoadingAcao(true);
    try {
      await api.post("/api/v1/Admin/email-evento/criar", {
        igrejaId: Number(formCriar.igrejaId),
        tipo: formCriar.tipo,
        emailDestino: formCriar.emailDestino,
        ativo: formCriar.ativo,
      });
      setModalCriarAberto(false);
      buscar(1);
    } catch (error) {
      setMessage({
        mensagem:
          error.response?.data?.data?.messagemAplicacao ||
          error.response?.data?.message ||
          "Erro ao criar e-mail evento.",
        severity: "error",
        show: true,
      });
    } finally {
      setLoadingAcao(false);
    }
  };

  const handleAtualizar = async () => {
    if (!formEditar.tipo || !formEditar.emailDestino) {
      setMessage({ mensagem: "Preencha Tipo e E-mail Destino.", severity: "error", show: true });
      return;
    }
    setLoadingAcao(true);
    try {
      await api.put(`/api/v1/Admin/email-evento/atualizar/${editarId}`, {
        tipo: formEditar.tipo,
        emailDestino: formEditar.emailDestino,
        ativo: formEditar.ativo,
      });
      setModalEditarAberto(false);
      buscar(paginacao.pageIndex);
    } catch (error) {
      setMessage({
        mensagem:
          error.response?.data?.data?.messagemAplicacao ||
          error.response?.data?.message ||
          "Erro ao atualizar e-mail evento.",
        severity: "error",
        show: true,
      });
    } finally {
      setLoadingAcao(false);
    }
  };

  const mostrarPendentes = MODOS_PENDENTES.has(modoCard);

  return (
    <Menu>
      <Stack spacing={2}>
        {/* Dashboard */}
        <DashboardDivulgacao
          dados={dashboard}
          loading={dashboardLoading}
          modoAtivo={modoCard}
          onCardClick={handleCardClick}
        />

        {/* Filtros rápidos e listagem de igrejas pendentes */}
        {mostrarPendentes && (
          <Paper sx={{ p: 2, borderRadius: 2 }}>
            <FiltrosRapidos
              filtros={filtrosRapidos}
              onChange={setFiltrosRapidos}
              onBuscar={handleFiltrosRapidosBuscar}
              onLimpar={handleFiltrosRapidosLimpar}
            />
            <Box mt={2}>
            {pendentesLoading ? (
              <Box display="flex" justifyContent="center" py={4}><CircularProgress /></Box>
            ) : (
              <>
                <Typography variant="subtitle2" fontWeight={600} mb={1}>
                  {igrejasPendentes.length} igreja(s) encontrada(s)
                </Typography>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Igreja</TableCell>
                      <TableCell>Cidade</TableCell>
                      <TableCell>UF</TableCell>
                      <TableCell>E-mail</TableCell>
                      <TableCell>Instagram</TableCell>
                      <TableCell>Facebook</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {igrejasPendentes.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} align="center">Nenhuma igreja encontrada.</TableCell>
                      </TableRow>
                    ) : igrejasPendentes.map((ig) => (
                      <TableRow key={ig.id} hover>
                        <TableCell>{ig.nome}</TableCell>
                        <TableCell>{ig.cidade || "-"}</TableCell>
                        <TableCell>{ig.uf?.toUpperCase() || "-"}</TableCell>
                        <TableCell>{ig.email || "-"}</TableCell>
                        <TableCell>{ig.instagram || "-"}</TableCell>
                        <TableCell>{ig.facebook || "-"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </>
            )}
            </Box>
          </Paper>
        )}

        {/* Filtros */}
        <Paper sx={{ p: 2, borderRadius: 2 }}>
          <Typography variant="h6" mb={2}>
            Filtros
          </Typography>
          <Box display="flex" flexWrap="wrap" gap={2}>
            <TextField
              label="Igreja"
              value={filtros.IgrejaNome}
              onChange={(e) => setFiltros((p) => ({ ...p, IgrejaNome: e.target.value }))}
              size="small"
              sx={{ minWidth: 180 }}
            />
            <TextField
              label="Cidade"
              value={filtros.Cidade}
              onChange={(e) => setFiltros((p) => ({ ...p, Cidade: e.target.value }))}
              size="small"
              sx={{ minWidth: 160 }}
            />
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Tipo</InputLabel>
              <Select
                label="Tipo"
                value={filtros.Tipo}
                onChange={(e) => setFiltros((p) => ({ ...p, Tipo: e.target.value }))}
              >
                {TIPOS_EMAIL.map((t) => (
                  <MenuItem key={t.value} value={t.value}>
                    {t.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 140 }}>
              <InputLabel>Canal</InputLabel>
              <Select
                label="Canal"
                value={filtros.Canal}
                onChange={(e) => setFiltros((p) => ({ ...p, Canal: e.target.value }))}
              >
                <MenuItem value="">Todos</MenuItem>
                <MenuItem value="1">E-mail</MenuItem>
                <MenuItem value="2">Instagram</MenuItem>
                <MenuItem value="3">Facebook</MenuItem>
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 130 }}>
              <InputLabel>Enviado</InputLabel>
              <Select
                label="Enviado"
                value={filtros.Enviado}
                onChange={(e) => setFiltros((p) => ({ ...p, Enviado: e.target.value }))}
              >
                <MenuItem value="">Todos</MenuItem>
                <MenuItem value="true">Sim</MenuItem>
                <MenuItem value="false">Não</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Data Envio Início"
              type="date"
              value={filtros.DataEnvioInicio}
              onChange={(e) => setFiltros((p) => ({ ...p, DataEnvioInicio: e.target.value }))}
              size="small"
              InputLabelProps={{ shrink: true }}
              sx={{ minWidth: 180 }}
            />
            <TextField
              label="Data Envio Fim"
              type="date"
              value={filtros.DataEnvioFim}
              onChange={(e) => setFiltros((p) => ({ ...p, DataEnvioFim: e.target.value }))}
              size="small"
              InputLabelProps={{ shrink: true }}
              sx={{ minWidth: 180 }}
            />
          </Box>
          <Box display="flex" gap={1} mt={2}>
            <Button variant="contained" onClick={handlePesquisar}>
              Pesquisar
            </Button>
            <Button variant="outlined" onClick={handleLimpar}>
              Limpar
            </Button>
          </Box>
        </Paper>

        {/* Tabela */}
        <TableContainer component={Paper} sx={{ p: 2, borderRadius: 2 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6">Divulgação das Igrejas</Typography>
            <Stack direction="row" spacing={1}>
              <Button
                variant="outlined"
                color="secondary"
                startIcon={<PhoneCallbackIcon />}
                onClick={abrirModalRegistroManual}
              >
                Registrar contato
              </Button>
              <Button variant="contained" startIcon={<AddIcon />} onClick={abrirModalCriar}>
                Novo
              </Button>
            </Stack>
          </Box>

          {isLoading ? (
            <Box display="flex" justifyContent="center" alignItems="center" py={6}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell padding="checkbox">
                      <Checkbox
                        size="small"
                        indeterminate={selecionados.length > 0 && selecionados.length < registros.length}
                        checked={registros.length > 0 && selecionados.length === registros.length}
                        onChange={(e) => setSelecionados(e.target.checked ? registros.map((r) => r.id) : [])}
                      />
                    </TableCell>
                    <TableCell>ID</TableCell>
                    <TableCell>Igreja</TableCell>
                    <TableCell>Cidade</TableCell>
                    <TableCell>Tipo</TableCell>
                    <TableCell>Canal</TableCell>
                    <TableCell>Destino</TableCell>
                    <TableCell>Data</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Ações</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {registros.length > 0 ? (
                    registros.map((r) => {
                      const selecionado = selecionados.includes(r.id);
                      return (
                        <TableRow key={r.id} selected={selecionado}>
                          <TableCell padding="checkbox">
                            <Checkbox
                              size="small"
                              checked={selecionado}
                              onChange={(e) =>
                                setSelecionados((prev) =>
                                  e.target.checked ? [...prev, r.id] : prev.filter((id) => id !== r.id)
                                )
                              }
                            />
                          </TableCell>
                          <TableCell sx={{ color: "text.secondary", fontSize: "0.75rem" }}>{r.igrejaId}</TableCell>
                          <TableCell>{r.igrejaNome || `#${r.igrejaId}`}</TableCell>
                          <TableCell>{r.igrejaCidade || "-"}</TableCell>
                          <TableCell>{TIPO_LABEL[r.tipo] ?? r.tipo}</TableCell>
                          <TableCell>{CANAL_LABEL[r.canal] ?? r.canal}</TableCell>
                          <TableCell sx={{ maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {r.destinoContato || r.emailDestino || "-"}
                          </TableCell>
                          <TableCell>{r.dataEnvio ? formatarData(r.dataEnvio) : "-"}</TableCell>
                          <TableCell>
                            <Chip
                              label={r.enviado ? "Enviado" : "Pendente"}
                              color={r.enviado ? "success" : "default"}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            <Box display="flex" alignItems="center" gap={0.5}>
                              {r.canal === 2 && r.destinoContato && (
                                <Tooltip title="Abrir Instagram">
                                  <IconButton size="small" onClick={() => {
                                    const url = r.destinoContato.startsWith("http") ? r.destinoContato : `https://${r.destinoContato}`;
                                    window.open(url, "_blank", "noopener,noreferrer");
                                  }}>
                                    <OpenInNewIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              )}
                              {r.canal === 3 && r.destinoContato && (
                                <Tooltip title="Abrir Facebook">
                                  <IconButton size="small" onClick={() => {
                                    const url = r.destinoContato.startsWith("http") ? r.destinoContato : `https://${r.destinoContato}`;
                                    window.open(url, "_blank", "noopener,noreferrer");
                                  }}>
                                    <OpenInNewIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              )}
                              {(r.canal === 2 || r.canal === 3) && (
                                <Tooltip title="Copiar mensagem">
                                  <IconButton size="small" onClick={() => {
                                    const igreja = {
                                      nome: r.igrejaNome,
                                      endereco: { uf: r.igrejaUf, cidadeSlug: r.igrejaCidadeSlug },
                                      slug: r.igrejaSlug,
                                    };
                                    const link = construirLinkIgreja(igreja);
                                    const msg = r.canal === 2
                                      ? gerarMensagemInstagram(r.igrejaNome, link)
                                      : gerarMensagemFacebook(r.igrejaNome, link);
                                    navigator.clipboard.writeText(msg).catch(() => {});
                                  }}>
                                    <ContentCopyIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              )}
                              <Tooltip title="Editar">
                                <IconButton size="small" onClick={() => abrirModalEditar(r)}>
                                  <EditIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </Box>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={10} align="center">
                        Nenhum registro encontrado.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
                <TableFooter>
                  <TableRow>
                    <TableCell colSpan={10} align="right">
                      {selecionados.length > 0
                        ? `${selecionados.length} selecionado(s) · Total: ${paginacao.totalItems ?? registros.length}`
                        : `Total: ${paginacao.totalItems ?? registros.length}`}
                    </TableCell>
                  </TableRow>
                </TableFooter>
              </Table>

              <Pagination
                pageIndex={paginacao.pageIndex}
                totalPages={paginacao.totalPages}
                hasPreviousPage={paginacao.hasPreviousPage}
                hasNextPage={paginacao.hasNextPage}
                onPageChange={handlePageChange}
              />
            </>
          )}
        </TableContainer>
      </Stack>

      {/* Modal Criar */}
      <Dialog open={modalCriarAberto} onClose={() => setModalCriarAberto(false)} fullWidth maxWidth="sm">
        <DialogTitle>Novo E-mail Evento</DialogTitle>
        <DialogContent>
          <Stack spacing={2} mt={1}>
            <TextField
              label="Igreja ID"
              type="number"
              value={formCriar.igrejaId}
              onChange={(e) => setFormCriar((p) => ({ ...p, igrejaId: e.target.value }))}
              fullWidth
              required
            />
            <FormControl fullWidth required>
              <InputLabel>Tipo</InputLabel>
              <Select
                label="Tipo"
                value={formCriar.tipo}
                onChange={(e) => setFormCriar((p) => ({ ...p, tipo: e.target.value }))}
              >
                <MenuItem value="criacao">Criação</MenuItem>
                <MenuItem value="alteracao">Alteração</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="E-mail Destino"
              type="email"
              value={formCriar.emailDestino}
              onChange={(e) => setFormCriar((p) => ({ ...p, emailDestino: e.target.value }))}
              fullWidth
              required
            />
            <FormControl fullWidth>
              <InputLabel>Ativo</InputLabel>
              <Select
                label="Ativo"
                value={formCriar.ativo}
                onChange={(e) => setFormCriar((p) => ({ ...p, ativo: e.target.value }))}
              >
                <MenuItem value={true}>Sim</MenuItem>
                <MenuItem value={false}>Não</MenuItem>
              </Select>
            </FormControl>
            {message.show && <ErrorSpan errorMessage={message.mensagem} severity={message.severity} />}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setModalCriarAberto(false)} disabled={loadingAcao}>
            Cancelar
          </Button>
          <Button variant="contained" onClick={handleCriar} disabled={loadingAcao}>
            {loadingAcao ? <CircularProgress size={20} /> : "Criar"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal Editar */}
      <Dialog open={modalEditarAberto} onClose={() => setModalEditarAberto(false)} fullWidth maxWidth="sm">
        <DialogTitle>Editar E-mail Evento #{editarId}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} mt={1}>
            <FormControl fullWidth required>
              <InputLabel>Tipo</InputLabel>
              <Select
                label="Tipo"
                value={formEditar.tipo}
                onChange={(e) => setFormEditar((p) => ({ ...p, tipo: e.target.value }))}
              >
                <MenuItem value="criacao">Criação</MenuItem>
                <MenuItem value="alteracao">Alteração</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="E-mail Destino"
              type="email"
              value={formEditar.emailDestino}
              onChange={(e) => setFormEditar((p) => ({ ...p, emailDestino: e.target.value }))}
              fullWidth
              required
            />
            <FormControl fullWidth>
              <InputLabel>Ativo</InputLabel>
              <Select
                label="Ativo"
                value={formEditar.ativo}
                onChange={(e) => setFormEditar((p) => ({ ...p, ativo: e.target.value }))}
              >
                <MenuItem value={true}>Sim</MenuItem>
                <MenuItem value={false}>Não</MenuItem>
              </Select>
            </FormControl>
            {message.show && <ErrorSpan errorMessage={message.mensagem} severity={message.severity} />}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setModalEditarAberto(false)} disabled={loadingAcao}>
            Cancelar
          </Button>
          <Button variant="contained" onClick={handleAtualizar} disabled={loadingAcao}>
            {loadingAcao ? <CircularProgress size={20} /> : "Salvar"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal: Registro Manual de Contato */}
      <Dialog open={modalRegistroManualAberto} onClose={() => setModalRegistroManualAberto(false)} fullWidth maxWidth="xs">
        <DialogTitle>Registrar contato</DialogTitle>
        <DialogContent>
          <Stack spacing={2} mt={1}>
            <TextField
              label="ID da Igreja"
              type="number"
              size="small"
              value={formRegistroManual.igrejaId}
              onChange={(e) => setFormRegistroManual((p) => ({ ...p, igrejaId: e.target.value }))}
              required
              fullWidth
            />
            <FormControl>
              <Typography variant="caption" color="text.secondary" mb={0.5}>Canal</Typography>
              <RadioGroup
                row
                value={formRegistroManual.canal}
                onChange={(e) => setFormRegistroManual((p) => ({ ...p, canal: e.target.value }))}
              >
                <FormControlLabel value="2" control={<Radio size="small" />} label="Instagram" />
                <FormControlLabel value="3" control={<Radio size="small" />} label="Facebook" />
              </RadioGroup>
            </FormControl>
            <TextField
              label="Destino (perfil ou URL)"
              size="small"
              value={formRegistroManual.destinoContato}
              onChange={(e) => setFormRegistroManual((p) => ({ ...p, destinoContato: e.target.value }))}
              required
              fullWidth
              placeholder={formRegistroManual.canal === "2" ? "@perfil ou URL do Instagram" : "URL ou nome da página"}
            />
            <TextField
              label="Observação"
              size="small"
              multiline
              rows={3}
              value={formRegistroManual.observacao}
              onChange={(e) => setFormRegistroManual((p) => ({ ...p, observacao: e.target.value }))}
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setModalRegistroManualAberto(false)} disabled={registroManualLoading}>Cancelar</Button>
          <Button
            variant="contained"
            color="secondary"
            onClick={salvarRegistroManual}
            disabled={registroManualLoading || !formRegistroManual.igrejaId || !formRegistroManual.destinoContato.trim()}
          >
            {registroManualLoading ? <CircularProgress size={20} /> : "Salvar"}
          </Button>
        </DialogActions>
      </Dialog>
    </Menu>
  );
};

export default EmailEventoPage;
