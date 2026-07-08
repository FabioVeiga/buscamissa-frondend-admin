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
  Paper,
  Radio,
  RadioGroup,
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
  Link,
} from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PhoneCallbackIcon from "@mui/icons-material/PhoneCallback";
import SendIcon from "@mui/icons-material/Send";
import Menu from "../Components/Menu";
import Pagination from "../Components/Paginacao";
import api from "../services/apiService";
import ErrorSpan from "../ErrorSpan";
import DashboardDivulgacao from "./DashboardDivulgacao";
import IgrejaDetalheModal from "../Igreja/IgrejaDetalhesModal";
import {
  gerarMensagemInstagram,
  gerarMensagemFacebook,
  construirLinkIgreja,
} from "../services/mensagemDivulgacao";

// CanalContatoEnum: Email=1, Instagram=2, Facebook=3
const MODOS_EMAIL = { SemContatoEmail: "criacao", SemEmailAlteracaoPendente: "alteracao" };
const MODOS_SOCIAL = { SemContatoFacebook: 3, SemContatoInstagram: 2 };

const filtrosVazios = { nome: "", cidade: "", uf: "" };

const formatarData = (valor) => {
  if (!valor) return "-";
  return new Date(valor).toLocaleString("pt-BR");
};

const DOMINIO_REDE = { SemContatoFacebook: "facebook.com", SemContatoInstagram: "instagram.com" };

const construirUrlPerfil = (perfil, modo) => {
  const valor = perfil.trim();
  if (/^https?:\/\//i.test(valor)) return valor;
  const handle = valor.replace(/^@/, "");
  return `https://${DOMINIO_REDE[modo]}/${handle}`;
};

const abrirUrl = (url) => {
  window.open(url, "_blank", "noopener,noreferrer");
};

const copiar = (texto) => navigator.clipboard.writeText(texto).catch(() => {});

const EmailEventoPage = () => {
  const [dashboard, setDashboard] = useState(null);
  const [dashboardLoading, setDashboardLoading] = useState(true);

  const [modo, setModo] = useState("SemContatoEmail");
  const [filtrosTexto, setFiltrosTexto] = useState(filtrosVazios);
  const [filtrosAplicados, setFiltrosAplicados] = useState(filtrosVazios);

  const [igrejas, setIgrejas] = useState([]);
  const [selecionados, setSelecionados] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [paginacao, setPaginacao] = useState({
    pageIndex: 1,
    pageSize: 20,
    totalPages: 1,
    hasPreviousPage: false,
    hasNextPage: false,
    totalItems: 0,
  });

  const [message, setMessage] = useState({ mensagem: "", severity: "", show: false });
  const [contatados, setContatados] = useState(new Set());
  const [registrandoId, setRegistrandoId] = useState(null);

  // Envio de e-mail em lote
  const [loteDialogAberto, setLoteDialogAberto] = useState(false);
  const [loteLoading, setLoteLoading] = useState(false);
  const [loteResultado, setLoteResultado] = useState(null);

  // Modal Registro Manual
  const modalRegistroManualVazio = { igrejaId: "", canal: "2", destinoContato: "", observacao: "" };
  const [modalRegistroManualAberto, setModalRegistroManualAberto] = useState(false);
  const [formRegistroManual, setFormRegistroManual] = useState(modalRegistroManualVazio);
  const [registroManualLoading, setRegistroManualLoading] = useState(false);

  const carregarDashboard = useCallback(() => {
    setDashboardLoading(true);
    api
      .get("/api/v1/Admin/divulgacao/dashboard")
      .then((res) => setDashboard(res.data?.data || null))
      .finally(() => setDashboardLoading(false));
  }, []);

  const buscar = useCallback(
    (pageIndex = 1) => {
      setIsLoading(true);
      const params = new URLSearchParams();
      params.append("Modo", modo);
      params.append("PageIndex", pageIndex);
      params.append("PageSize", paginacao.pageSize);
      if (filtrosAplicados.nome) params.append("Nome", filtrosAplicados.nome);
      if (filtrosAplicados.cidade) params.append("Cidade", filtrosAplicados.cidade);
      if (filtrosAplicados.uf) params.append("Uf", filtrosAplicados.uf);

      api
        .get(`/api/v1/Admin/divulgacao/igrejas?${params.toString()}`)
        .then((response) => {
          const data = response.data?.data || response.data;
          setIgrejas(data?.items || []);
          setSelecionados([]);
          setPaginacao((prev) => ({
            ...prev,
            pageIndex,
            totalPages: data?.totalPages ?? 1,
            hasPreviousPage: data?.hasPrevieusPage ?? false,
            hasNextPage: data?.hasNextPage ?? false,
            totalItems: data?.totalItems ?? 0,
          }));
        })
        .catch(() => setIgrejas([]))
        .finally(() => setIsLoading(false));
    },
    [modo, filtrosAplicados, paginacao.pageSize]
  );

  useEffect(() => {
    carregarDashboard();
  }, [carregarDashboard]);

  useEffect(() => {
    buscar(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modo, filtrosAplicados]);

  const handleCardClick = (novoModo) => {
    setModo(novoModo);
    setFiltrosTexto(filtrosVazios);
    setFiltrosAplicados(filtrosVazios);
    setContatados(new Set());
  };

  const handlePesquisar = () => setFiltrosAplicados({ ...filtrosTexto });
  const handleLimpar = () => {
    setFiltrosTexto(filtrosVazios);
    setFiltrosAplicados(filtrosVazios);
  };
  const handlePageChange = (page) => buscar(page);

  const isModoEmail = Object.prototype.hasOwnProperty.call(MODOS_EMAIL, modo);
  const isModoSocial = Object.prototype.hasOwnProperty.call(MODOS_SOCIAL, modo);

  const abrirDialogLote = () => {
    setLoteResultado(null);
    setLoteDialogAberto(true);
  };

  const confirmarEnvioLote = async () => {
    setLoteLoading(true);
    try {
      const response = await api.post("/api/v1/Admin/divulgacao/enviar-email-lote", {
        igrejaIds: selecionados,
        tipo: MODOS_EMAIL[modo],
      });
      const resultado = response.data?.data || response.data;
      setLoteResultado(resultado);
      carregarDashboard();
      buscar(paginacao.pageIndex);
    } catch (error) {
      setMessage({
        mensagem:
          error.response?.data?.data?.messagemAplicacao ||
          "Erro ao enviar e-mails em lote.",
        severity: "error",
        show: true,
      });
      setLoteDialogAberto(false);
    } finally {
      setLoteLoading(false);
    }
  };

  const marcarComoContatado = async (igreja) => {
    const perfil = modo === "SemContatoFacebook" ? igreja.facebook : igreja.instagram;
    if (!perfil) return;
    setRegistrandoId(igreja.id);
    try {
      await api.post("/api/v1/Admin/email-evento/registrar-contato", {
        igrejaId: igreja.id,
        tipo: 99,
        canal: MODOS_SOCIAL[modo],
        destinoContato: perfil,
        dataEnvio: new Date().toISOString(),
      });
      setContatados((prev) => new Set(prev).add(igreja.id));
      carregarDashboard();
    } catch {
      setMessage({ mensagem: "Não foi possível registrar o contato.", severity: "error", show: true });
    } finally {
      setRegistrandoId(null);
    }
  };

  const abrirModalRegistroManual = () => {
    setFormRegistroManual(modalRegistroManualVazio);
    setModalRegistroManualAberto(true);
  };

  const salvarRegistroManual = async () => {
    if (!formRegistroManual.igrejaId || !formRegistroManual.destinoContato.trim()) return;
    setRegistroManualLoading(true);
    try {
      await api.post("/api/v1/Admin/email-evento/registrar-contato", {
        igrejaId: Number(formRegistroManual.igrejaId),
        tipo: 99,
        canal: Number(formRegistroManual.canal),
        destinoContato: formRegistroManual.destinoContato.trim(),
        dataEnvio: new Date().toISOString(),
        observacao: formRegistroManual.observacao.trim() || null,
      });
      setModalRegistroManualAberto(false);
      carregarDashboard();
      buscar(paginacao.pageIndex);
    } catch {
      // erro silencioso — backend retornará mensagem de validação
    } finally {
      setRegistroManualLoading(false);
    }
  };

  const toggleSelecionado = (id) =>
    setSelecionados((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const [detalheIgrejaId, setDetalheIgrejaId] = useState(null);
  const abrirDetalheIgreja = (igrejaId) => setDetalheIgrejaId(igrejaId);
  const fecharDetalheIgreja = () => setDetalheIgrejaId(null);

  return (
    <Menu>
      <Stack spacing={2}>
        <DashboardDivulgacao
          dados={dashboard}
          loading={dashboardLoading}
          modoAtivo={modo}
          onCardClick={handleCardClick}
        />

        {/* Filtros */}
        <Paper sx={{ p: 2, borderRadius: 2 }}>
          <Box display="flex" flexWrap="wrap" gap={2} alignItems="center">
            <TextField
              label="Nome da igreja"
              size="small"
              value={filtrosTexto.nome}
              onChange={(e) => setFiltrosTexto((p) => ({ ...p, nome: e.target.value }))}
              onKeyDown={(e) => e.key === "Enter" && handlePesquisar()}
              sx={{ minWidth: 200 }}
            />
            <TextField
              label="Cidade"
              size="small"
              value={filtrosTexto.cidade}
              onChange={(e) => setFiltrosTexto((p) => ({ ...p, cidade: e.target.value }))}
              onKeyDown={(e) => e.key === "Enter" && handlePesquisar()}
              sx={{ minWidth: 160 }}
            />
            <TextField
              label="UF"
              size="small"
              value={filtrosTexto.uf}
              onChange={(e) => setFiltrosTexto((p) => ({ ...p, uf: e.target.value.toUpperCase().slice(0, 2) }))}
              onKeyDown={(e) => e.key === "Enter" && handlePesquisar()}
              sx={{ width: 90 }}
            />
            <Button variant="contained" size="small" onClick={handlePesquisar}>
              Pesquisar
            </Button>
            <Button variant="outlined" size="small" onClick={handleLimpar}>
              Limpar
            </Button>
            <Button
              variant="outlined"
              color="secondary"
              size="small"
              startIcon={<PhoneCallbackIcon />}
              onClick={abrirModalRegistroManual}
              sx={{ ml: "auto" }}
            >
              Registrar contato
            </Button>
          </Box>
        </Paper>

        {/* Tabela */}
        <TableContainer component={Paper} sx={{ p: 2, borderRadius: 2 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6">Divulgação das Igrejas</Typography>
            {isModoEmail && selecionados.length > 0 && (
              <Button variant="contained" startIcon={<SendIcon />} onClick={abrirDialogLote}>
                Enviar e-mail em lote ({selecionados.length})
              </Button>
            )}
          </Box>

          {message.show && (
            <Box mb={2}>
              <ErrorSpan errorMessage={message.mensagem} severity={message.severity} />
            </Box>
          )}

          {isLoading ? (
            <Box display="flex" justifyContent="center" alignItems="center" py={6}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    {isModoEmail && (
                      <TableCell padding="checkbox">
                        <Checkbox
                          size="small"
                          indeterminate={selecionados.length > 0 && selecionados.length < igrejas.length}
                          checked={igrejas.length > 0 && selecionados.length === igrejas.length}
                          onChange={(e) => setSelecionados(e.target.checked ? igrejas.map((i) => i.id) : [])}
                        />
                      </TableCell>
                    )}
                    <TableCell>Igreja</TableCell>
                    <TableCell>Cidade/UF</TableCell>
                    {modo === "SemContatoEmail" && (
                      <>
                        <TableCell>E-mail</TableCell>
                        <TableCell>Criada em</TableCell>
                      </>
                    )}
                    {modo === "SemEmailAlteracaoPendente" && (
                      <>
                        <TableCell>E-mail</TableCell>
                        <TableCell>Alterada em</TableCell>
                        <TableCell>Último e-mail enviado</TableCell>
                      </>
                    )}
                    {modo === "SemContatoFacebook" && (
                      <>
                        <TableCell>Facebook</TableCell>
                        <TableCell>Último contato</TableCell>
                      </>
                    )}
                    {modo === "SemContatoInstagram" && (
                      <>
                        <TableCell>Instagram</TableCell>
                        <TableCell>Último contato</TableCell>
                      </>
                    )}
                    {isModoSocial && <TableCell>Ações</TableCell>}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {igrejas.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center">
                        Nenhuma igreja encontrada.
                      </TableCell>
                    </TableRow>
                  ) : (
                    igrejas.map((ig) => {
                      const selecionado = selecionados.includes(ig.id);
                      const perfil = modo === "SemContatoFacebook" ? ig.facebook : ig.instagram;
                      const jaContatado = contatados.has(ig.id);
                      const link = construirLinkIgreja({
                        slug: ig.slug,
                        endereco: { uf: ig.uf, cidadeSlug: ig.cidadeSlug },
                      });
                      const mensagem =
                        modo === "SemContatoFacebook"
                          ? gerarMensagemFacebook(ig.nome, link)
                          : gerarMensagemInstagram(ig.nome, link);

                      return (
                        <TableRow key={ig.id} hover selected={selecionado}>
                          {isModoEmail && (
                            <TableCell padding="checkbox">
                              <Checkbox
                                size="small"
                                checked={selecionado}
                                onChange={() => toggleSelecionado(ig.id)}
                              />
                            </TableCell>
                          )}
                          <TableCell>
                            <Link component="button" underline="hover" onClick={() => abrirDetalheIgreja(ig.id)}>
                              {ig.nome}
                            </Link>
                          </TableCell>
                          <TableCell>{[ig.cidade, ig.uf?.toUpperCase()].filter(Boolean).join(" / ") || "-"}</TableCell>
                          {modo === "SemContatoEmail" && (
                            <>
                              <TableCell>{ig.email || "-"}</TableCell>
                              <TableCell>{formatarData(ig.criacao)}</TableCell>
                            </>
                          )}
                          {modo === "SemEmailAlteracaoPendente" && (
                            <>
                              <TableCell>{ig.email || "-"}</TableCell>
                              <TableCell>{formatarData(ig.alteracao)}</TableCell>
                              <TableCell>{formatarData(ig.ultimoContatoEmail)}</TableCell>
                            </>
                          )}
                          {(modo === "SemContatoFacebook" || modo === "SemContatoInstagram") && (
                            <>
                              <TableCell>{perfil || "-"}</TableCell>
                              <TableCell>
                                {formatarData(
                                  modo === "SemContatoFacebook" ? ig.ultimoContatoFacebook : ig.ultimoContatoInstagram
                                )}
                              </TableCell>
                            </>
                          )}
                          {isModoSocial && (
                            <TableCell>
                              <Box display="flex" alignItems="center" gap={0.5}>
                                {jaContatado ? (
                                  <Chip icon={<CheckCircleIcon />} label="Contatado" color="success" size="small" />
                                ) : (
                                  <>
                                    <Tooltip title="Copiar mensagem">
                                      <IconButton size="small" onClick={() => copiar(mensagem)}>
                                        <ContentCopyIcon fontSize="small" />
                                      </IconButton>
                                    </Tooltip>
                                    {perfil && (
                                      <Tooltip title="Abrir perfil">
                                        <IconButton size="small" onClick={() => abrirUrl(construirUrlPerfil(perfil, modo))}>
                                          <OpenInNewIcon fontSize="small" />
                                        </IconButton>
                                      </Tooltip>
                                    )}
                                    <Button
                                      size="small"
                                      variant="outlined"
                                      color="success"
                                      disabled={registrandoId === ig.id}
                                      onClick={() => marcarComoContatado(ig)}
                                    >
                                      {registrandoId === ig.id ? <CircularProgress size={16} /> : "Marcar contatado"}
                                    </Button>
                                  </>
                                )}
                              </Box>
                            </TableCell>
                          )}
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
                <TableFooter>
                  <TableRow>
                    <TableCell colSpan={6} align="right">
                      {selecionados.length > 0
                        ? `${selecionados.length} selecionado(s) · Total: ${paginacao.totalItems}`
                        : `Total: ${paginacao.totalItems}`}
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

      {/* Dialog: Envio de e-mail em lote */}
      <Dialog open={loteDialogAberto} onClose={() => !loteLoading && setLoteDialogAberto(false)} fullWidth maxWidth="xs">
        <DialogTitle>Enviar e-mail em lote</DialogTitle>
        <DialogContent>
          {!loteResultado ? (
            <Typography variant="body2">
              Confirma o envio real de e-mail de {MODOS_EMAIL[modo] === "criacao" ? "criação" : "alteração"} para{" "}
              <strong>{selecionados.length}</strong> igreja(s) selecionada(s)?
            </Typography>
          ) : (
            <Stack spacing={1}>
              <Typography variant="body2">
                {loteResultado.totalEnviado} de {loteResultado.totalSolicitado} e-mail(s) enviado(s) com sucesso.
              </Typography>
              {loteResultado.falhas?.length > 0 && (
                <Box>
                  <Typography variant="body2" color="error" fontWeight={600}>
                    Falhas ({loteResultado.falhas.length}):
                  </Typography>
                  {loteResultado.falhas.map((f) => (
                    <Typography key={f.igrejaId} variant="caption" display="block" color="text.secondary">
                      {f.nome}: {f.motivo}
                    </Typography>
                  ))}
                </Box>
              )}
            </Stack>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          {!loteResultado ? (
            <>
              <Button onClick={() => setLoteDialogAberto(false)} disabled={loteLoading}>
                Cancelar
              </Button>
              <Button variant="contained" onClick={confirmarEnvioLote} disabled={loteLoading}>
                {loteLoading ? <CircularProgress size={20} /> : "Enviar"}
              </Button>
            </>
          ) : (
            <Button variant="contained" onClick={() => setLoteDialogAberto(false)}>
              Fechar
            </Button>
          )}
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
              <Typography variant="caption" color="text.secondary" mb={0.5}>
                Canal
              </Typography>
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
          <Button onClick={() => setModalRegistroManualAberto(false)} disabled={registroManualLoading}>
            Cancelar
          </Button>
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

      <IgrejaDetalheModal
        open={!!detalheIgrejaId}
        handleClose={fecharDetalheIgreja}
        igrejaId={detalheIgrejaId}
      />
    </Menu>
  );
};

export default EmailEventoPage;
