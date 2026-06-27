import { useState, useEffect, useCallback } from "react";
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
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
import Menu from "../Components/Menu";
import Pagination from "../Components/Paginacao";
import api from "../services/apiService";
import ErrorSpan from "../ErrorSpan";

const TIPOS_EMAIL = [
  { value: "", label: "Todos" },
  { value: "criacao", label: "Criação" },
  { value: "alteracao", label: "Alteração" },
];

const filtrosIniciais = {
  IgrejaId: "",
  Tipo: "",
  EmailDestino: "",
  Ativo: "",
  Enviado: "",
  DataCriacaoInicio: "",
  DataCriacaoFim: "",
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

const EmailEventoPage = () => {
  const [registros, setRegistros] = useState([]);
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

  const buscar = useCallback(
    async (pageIndex = 1) => {
      setIsLoading(true);
      try {
        const params = new URLSearchParams();
        params.append("PageIndex", pageIndex);
        params.append("PageSize", paginacao.pageSize);

        if (filtrosAplicados.IgrejaId) params.append("IgrejaId", filtrosAplicados.IgrejaId);
        if (filtrosAplicados.Tipo) params.append("Tipo", filtrosAplicados.Tipo);
        if (filtrosAplicados.EmailDestino) params.append("EmailDestino", filtrosAplicados.EmailDestino);
        if (filtrosAplicados.Ativo !== "") params.append("Ativo", filtrosAplicados.Ativo);
        if (filtrosAplicados.Enviado !== "") params.append("Enviado", filtrosAplicados.Enviado);
        if (filtrosAplicados.DataCriacaoInicio) params.append("DataCriacaoInicio", filtrosAplicados.DataCriacaoInicio);
        if (filtrosAplicados.DataCriacaoFim) params.append("DataCriacaoFim", filtrosAplicados.DataCriacaoFim);

        const response = await api.get(`/api/v1/Admin/email-evento/buscar-por-filtro?${params.toString()}`);
        const data = response.data?.data || response.data;

        setRegistros(data?.items || data?.data || []);
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

  useEffect(() => {
    buscar(1);
  }, [filtrosAplicados]);

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

  const abrirModalCriar = () => {
    setFormCriar(formInicialCriar);
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

  return (
    <Menu>
      <Stack spacing={2}>
        {/* Filtros */}
        <Paper sx={{ p: 2, borderRadius: 2 }}>
          <Typography variant="h6" mb={2}>
            Filtros
          </Typography>
          <Box display="flex" flexWrap="wrap" gap={2}>
            <TextField
              label="Igreja ID"
              value={filtros.IgrejaId}
              onChange={(e) => setFiltros((p) => ({ ...p, IgrejaId: e.target.value }))}
              size="small"
              type="number"
              sx={{ minWidth: 120 }}
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
            <TextField
              label="E-mail Destino"
              value={filtros.EmailDestino}
              onChange={(e) => setFiltros((p) => ({ ...p, EmailDestino: e.target.value }))}
              size="small"
              sx={{ minWidth: 200 }}
            />
            <FormControl size="small" sx={{ minWidth: 130 }}>
              <InputLabel>Ativo</InputLabel>
              <Select
                label="Ativo"
                value={filtros.Ativo}
                onChange={(e) => setFiltros((p) => ({ ...p, Ativo: e.target.value }))}
              >
                <MenuItem value="">Todos</MenuItem>
                <MenuItem value="true">Sim</MenuItem>
                <MenuItem value="false">Não</MenuItem>
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
              label="Data Criação Início"
              type="datetime-local"
              value={filtros.DataCriacaoInicio}
              onChange={(e) => setFiltros((p) => ({ ...p, DataCriacaoInicio: e.target.value }))}
              size="small"
              InputLabelProps={{ shrink: true }}
              sx={{ minWidth: 210 }}
            />
            <TextField
              label="Data Criação Fim"
              type="datetime-local"
              value={filtros.DataCriacaoFim}
              onChange={(e) => setFiltros((p) => ({ ...p, DataCriacaoFim: e.target.value }))}
              size="small"
              InputLabelProps={{ shrink: true }}
              sx={{ minWidth: 210 }}
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
            <Typography variant="h6">E-mails Evento</Typography>
            <Button variant="contained" startIcon={<AddIcon />} onClick={abrirModalCriar}>
              Novo
            </Button>
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
                    <TableCell>ID</TableCell>
                    <TableCell>Igreja ID</TableCell>
                    <TableCell>Tipo</TableCell>
                    <TableCell>E-mail Destino</TableCell>
                    <TableCell>Ativo</TableCell>
                    <TableCell>Enviado</TableCell>
                    <TableCell>Data Criação</TableCell>
                    <TableCell>Ações</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {registros.length > 0 ? (
                    registros.map((r) => (
                      <TableRow key={r.id}>
                        <TableCell>{r.id}</TableCell>
                        <TableCell>{r.igrejaId}</TableCell>
                        <TableCell>{r.tipo}</TableCell>
                        <TableCell>{r.emailDestino}</TableCell>
                        <TableCell>
                          <Chip
                            label={r.ativo ? "Sim" : "Não"}
                            color={r.ativo ? "success" : "default"}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={r.enviado ? "Sim" : "Não"}
                            color={r.enviado ? "info" : "default"}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>{formatarData(r.dataCriacao)}</TableCell>
                        <TableCell>
                          <Tooltip title="Editar">
                            <IconButton size="small" onClick={() => abrirModalEditar(r)}>
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={8} align="center">
                        Nenhum registro encontrado.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
                <TableFooter>
                  <TableRow>
                    <TableCell colSpan={8} align="right">
                      Total: {paginacao.totalItems ?? registros.length}
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
    </Menu>
  );
};

export default EmailEventoPage;
