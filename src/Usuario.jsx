import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Stack,
  Tooltip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Checkbox,
  MenuItem,
  Link,
  IconButton,
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import Menu from "./Components/Menu";
import api from "./services/apiService";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CircularProgress, Box, Typography } from "@mui/material";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import ManageAccountsIcon from "@mui/icons-material/ManageAccounts";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import ContactEmergencyIcon from "@mui/icons-material/ContactEmergency";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import LockResetIcon from "@mui/icons-material/LockReset";
import ChurchIcon from "@mui/icons-material/Church";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import Pagination from "./Components/Paginacao";
import { buscarIgrejaCompletaPorId, normalizarIgrejaParaEdicao } from "./services/igrejaHelpers";

const PERFIS = [
  { id: 1, nome: "Admin" },
  { id: 2, nome: "App" },
  { id: 3, nome: "Regular" },
  { id: 4, nome: "Dono" },
];

const FILTROS_PADRAO = {
  nome: "",
  email: "",
  perfil: "",
  bloqueado: "",
  criacaoInicio: "",
  criacaoFim: "",
};

const ORDENACAO_PADRAO = { ordenarPor: "nome", decrescente: false };

const OPCOES_ORDENACAO = [
  { value: "nome", label: "Nome" },
  { value: "email", label: "Email" },
  { value: "criacao", label: "Data de criação" },
];

const UsuarioPage = () => {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [paginacao, setPaginacao] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const [openDetailsModal, setOpenDetailsModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [motivo, setMotivo] = useState("");
  const [filtros, setFiltros] = useState({ ...FILTROS_PADRAO });
  const [filtrosAplicados, setFiltrosAplicados] = useState({ ...FILTROS_PADRAO });
  const [ordenacao, setOrdenacao] = useState({ ...ORDENACAO_PADRAO });
  const [openSenhaModal, setOpenSenhaModal] = useState(false);
  const [novaSenha, setNovaSenha] = useState("");
  const [senhaError, setSenhaError] = useState("");
  const [openIgrejasModal, setOpenIgrejasModal] = useState(false);
  const [igrejasUsuario, setIgrejasUsuario] = useState([]);
  const [igrejasLoading, setIgrejasLoading] = useState(false);

  const perfil = (idPerfil) => {
    switch (idPerfil) {
      case 1:
        return (
          <span>
            Admin <AdminPanelSettingsIcon />
          </span>
        );
      case 2:
        return (
          <span>
            App <ManageAccountsIcon />
          </span>
        );
      case 3:
        return (
          <span>
            Regular <PersonOutlineIcon />
          </span>
        );
      case 4:
        return (
          <span>
            Dono <ContactEmergencyIcon />
          </span>
        );
      default:
        return "Não existe";
    }
  };

  const handleOpenModal = (user) => {
    setSelectedUser(user);
    setMotivo("");
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedUser(null);
  };

  const handleOpenDetailsModal = (user) => {
    setSelectedUser(user);
    setOpenDetailsModal(true);
  };

  const handleCloseDetailsModal = () => {
    setOpenDetailsModal(false);
    setSelectedUser(null);
  };

  const handleConfirmBloquearDesbloquear = async () => {
    if (!selectedUser) return;

    try {
      await api.put(
        `/api/v1/Admin/usuario/bloquear-desbloquear/${selectedUser.id}`,
        {
          bloqueado: !selectedUser.bloqueado,
          motivoBloqueio: !selectedUser.bloqueado ? motivo : null,
        }
      );
      alert(
        `Usuário ${
          !selectedUser.bloqueado ? "bloqueado" : "desbloqueado"
        } com sucesso!`
      );
      setData((prevData) => ({
        ...prevData,
        items: prevData.items.map((user) =>
          user.id === selectedUser.id
            ? { ...user, bloqueado: !selectedUser.bloqueado }
            : user
        ),
      }));
    } catch (error) {
      console.error("Erro ao bloquear/desbloquear:", error);
      alert("Erro ao realizar a ação. Tente novamente.");
    } finally {
      handleCloseModal();
    }
  };

  const buildQueryParams = (pageIndex, pageSize, aplicados, ordem) => {
    const params = new URLSearchParams();
    params.set("Paginacao.PageIndex", pageIndex);
    params.set("Paginacao.PageSize", pageSize);
    if (aplicados.nome) params.set("Nome", aplicados.nome);
    if (aplicados.email) params.set("Email", aplicados.email);
    if (aplicados.perfil) params.set("Perfil", aplicados.perfil);
    if (aplicados.bloqueado !== "") params.set("Bloqueado", aplicados.bloqueado);
    if (aplicados.criacaoInicio) params.set("CriacaoInicio", aplicados.criacaoInicio);
    if (aplicados.criacaoFim) params.set("CriacaoFim", aplicados.criacaoFim);
    params.set("OrdenarPor", ordem.ordenarPor);
    params.set("OrdemDecrescente", ordem.decrescente);
    return params.toString();
  };

  const fetchUsuarios = async (pageIndex = 1, pageSize = 10, aplicados = filtrosAplicados, ordem = ordenacao) => {
    setIsLoading(true);
    try {
      const response = await api.get(
        `/api/v1/Admin/usuario/buscar-por-filtro?${buildQueryParams(pageIndex, pageSize, aplicados, ordem)}`
      );
      setData(response.data.data.usuarios);
      setPaginacao({
        pageIndex: response.data.data.usuarios.pageIndex,
        pageSize: response.data.data.usuarios.pageSize,
        totalItems: response.data.data.usuarios.totalItems,
        hasPreviousPage: response.data.data.usuarios.hasPreviousPage,
        hasNextPage: response.data.data.usuarios.hasNextPage,
        nextPage: response.data.data.usuarios.nextPage,
        previousPage: response.data.data.usuarios.previousPage,
        totalPages: response.data.data.usuarios.totalPages,
      });
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsuarios(1, 10, FILTROS_PADRAO);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePageChange = (newPageIndex) => {
    fetchUsuarios(newPageIndex, paginacao.pageSize, filtrosAplicados, ordenacao);
  };

  // Ordenação aplica na hora, sem precisar clicar em "Filtrar".
  const handleOrdenarPorChange = (event) => {
    const nova = { ...ordenacao, ordenarPor: event.target.value };
    setOrdenacao(nova);
    fetchUsuarios(1, paginacao.pageSize || 10, filtrosAplicados, nova);
  };

  const handleToggleDirecaoOrdenacao = () => {
    const nova = { ...ordenacao, decrescente: !ordenacao.decrescente };
    setOrdenacao(nova);
    fetchUsuarios(1, paginacao.pageSize || 10, filtrosAplicados, nova);
  };

  const handleFiltroChange = (campo) => (event) => {
    setFiltros((prev) => ({ ...prev, [campo]: event.target.value }));
  };

  const handleAplicarFiltros = () => {
    setFiltrosAplicados(filtros);
    fetchUsuarios(1, paginacao.pageSize || 10, filtros);
  };

  const handleLimparFiltros = () => {
    setFiltros({ ...FILTROS_PADRAO });
    setFiltrosAplicados({ ...FILTROS_PADRAO });
    fetchUsuarios(1, paginacao.pageSize || 10, FILTROS_PADRAO);
  };

  const handleOpenSenhaModal = (user) => {
    setSelectedUser(user);
    setNovaSenha("");
    setSenhaError("");
    setOpenSenhaModal(true);
  };

  const handleCloseSenhaModal = () => {
    setOpenSenhaModal(false);
    setSelectedUser(null);
    setNovaSenha("");
    setSenhaError("");
  };

  const handleConfirmResetarSenha = async () => {
    if (!selectedUser) return;
    if (novaSenha.length < 6) {
      setSenhaError("A senha deve ter no mínimo 6 caracteres.");
      return;
    }
    try {
      await api.put(`/api/v1/Admin/usuario/resetar-senha/${selectedUser.id}`, {
        novaSenha,
      });
      alert("Senha resetada com sucesso!");
      handleCloseSenhaModal();
    } catch (error) {
      console.error("Erro ao resetar senha:", error);
      alert("Erro ao resetar a senha. Tente novamente.");
    }
  };

  const handleOpenIgrejasModal = async (user) => {
    setSelectedUser(user);
    setOpenIgrejasModal(true);
    setIgrejasLoading(true);
    try {
      const response = await api.get(`/api/v1/Admin/usuario/${user.id}/igrejas`);
      setIgrejasUsuario(response.data.data.igrejas);
    } catch (error) {
      console.error("Erro ao buscar igrejas do usuário:", error);
      setIgrejasUsuario([]);
    } finally {
      setIgrejasLoading(false);
    }
  };

  const handleCloseIgrejasModal = () => {
    setOpenIgrejasModal(false);
    setSelectedUser(null);
    setIgrejasUsuario([]);
  };

  const handleEditarIgreja = async (igrejaId) => {
    try {
      const igrejaCompleta = await buscarIgrejaCompletaPorId(igrejaId);
      handleCloseIgrejasModal();
      navigate("/igrejaEditar", { state: { row: normalizarIgrejaParaEdicao(igrejaCompleta) } });
    } catch (error) {
      console.error("Erro ao abrir igreja para edição:", error);
    }
  };

  return (
    <Menu>
      <Paper sx={{ p: 2, borderRadius: 2, mb: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
            <TextField
              fullWidth
              size="small"
              label="Nome"
              value={filtros.nome}
              onChange={handleFiltroChange("nome")}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
            <TextField
              fullWidth
              size="small"
              label="Email"
              value={filtros.email}
              onChange={handleFiltroChange("email")}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
            <TextField
              select
              fullWidth
              size="small"
              label="Perfil"
              value={filtros.perfil}
              onChange={handleFiltroChange("perfil")}
            >
              <MenuItem value="">Todos</MenuItem>
              {PERFIS.map((p) => (
                <MenuItem key={p.id} value={p.id}>
                  {p.nome}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
            <TextField
              select
              fullWidth
              size="small"
              label="Bloqueado"
              value={filtros.bloqueado}
              onChange={handleFiltroChange("bloqueado")}
            >
              <MenuItem value="">Todos</MenuItem>
              <MenuItem value="true">Sim</MenuItem>
              <MenuItem value="false">Não</MenuItem>
            </TextField>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
            <TextField
              fullWidth
              size="small"
              type="date"
              label="Criado a partir de"
              InputLabelProps={{ shrink: true }}
              value={filtros.criacaoInicio}
              onChange={handleFiltroChange("criacaoInicio")}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
            <TextField
              fullWidth
              size="small"
              type="date"
              label="Criado até"
              InputLabelProps={{ shrink: true }}
              value={filtros.criacaoFim}
              onChange={handleFiltroChange("criacaoFim")}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Stack direction="row" spacing={0.5} alignItems="center">
              <TextField
                select
                fullWidth
                size="small"
                label="Ordenar por"
                value={ordenacao.ordenarPor}
                onChange={handleOrdenarPorChange}
              >
                {OPCOES_ORDENACAO.map((opcao) => (
                  <MenuItem key={opcao.value} value={opcao.value}>
                    {opcao.label}
                  </MenuItem>
                ))}
              </TextField>
              <Tooltip title={ordenacao.decrescente ? "Decrescente" : "Crescente"}>
                <IconButton onClick={handleToggleDirecaoOrdenacao}>
                  {ordenacao.decrescente ? <ArrowDownwardIcon /> : <ArrowUpwardIcon />}
                </IconButton>
              </Tooltip>
            </Stack>
          </Grid>
          <Grid size={{ xs: 12 }}>
            <Stack direction="row" spacing={1}>
              <Button
                variant="contained"
                startIcon={<SearchIcon />}
                onClick={handleAplicarFiltros}
              >
                Filtrar
              </Button>
              <Button
                variant="outlined"
                startIcon={<ClearIcon />}
                onClick={handleLimparFiltros}
              >
                Limpar
              </Button>
            </Stack>
          </Grid>
        </Grid>
      </Paper>
      <TableContainer
        component={Paper}
        sx={{ p: 2, borderRadius: 2, overflow: "auto" }}
      >
        {isLoading ? (
          <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            bgcolor="#f5f5f5"
          >
            <CircularProgress size={60} />
            <Typography variant="h6" mt={2}>
              Carregando...
            </Typography>
          </Box>
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Nome</TableCell>
                <TableCell>Perfil</TableCell>
                <TableCell>Bloqueado</TableCell>
                <TableCell>Igrejas</TableCell>
                <TableCell>Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.items.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>{row.id}</TableCell>
                  <TableCell>{row.nome}</TableCell>
                  <TableCell>{perfil(row.perfil)}</TableCell>
                  <TableCell>{row.bloqueado ? "Sim" : "Não"}</TableCell>
                  <TableCell>
                    <Tooltip title="Ver igrejas cadastradas por este usuário">
                      <Button
                        variant="text"
                        size="small"
                        startIcon={<ChurchIcon />}
                        onClick={() => handleOpenIgrejasModal(row)}
                      >
                        {row.totalIgrejas ?? 0}
                      </Button>
                    </Tooltip>
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={1}>
                      <Button
                        variant="contained"
                        color="primary"
                        size="small"
                        onClick={() => handleOpenDetailsModal(row)}
                      >
                        Visualizar
                      </Button>
                      <Tooltip
                        title={
                          row.bloqueado
                            ? "Clique para desbloquear o usuário"
                            : "Clique para bloquear o usuário"
                        }
                      >
                        <Button
                          variant="contained"
                          color={row.bloqueado ? "error" : "success"}
                          size="small"
                          onClick={() => handleOpenModal(row)}
                        >
                          {row.bloqueado ? "Desbloquear" : "Bloquear"}
                        </Button>
                      </Tooltip>
                      <Tooltip title="Definir uma nova senha para o usuário">
                        <Button
                          variant="outlined"
                          color="warning"
                          size="small"
                          startIcon={<LockResetIcon />}
                          onClick={() => handleOpenSenhaModal(row)}
                        >
                          Resetar senha
                        </Button>
                      </Tooltip>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
        <Pagination
          {...paginacao}
          onPageChange={handlePageChange}
        />
      </TableContainer>

      <Dialog open={openDetailsModal} onClose={handleCloseDetailsModal}>
        <DialogTitle>Detalhes do Usuário</DialogTitle>
        <DialogContent>
          {selectedUser && (
            <Table>
              <TableBody>
                <TableRow>
                  <TableCell>
                    <strong>ID</strong>
                  </TableCell>
                  <TableCell>{selectedUser.id}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>
                    <strong>Nome</strong>
                  </TableCell>
                  <TableCell>{selectedUser.nome}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>
                    <strong>Perfil</strong>
                  </TableCell>
                  <TableCell>{perfil(selectedUser.perfil)}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>
                    <strong>Email</strong>
                  </TableCell>
                  <TableCell>{selectedUser.email}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>
                    <strong>Bloqueado</strong>
                  </TableCell>
                  <TableCell>
                    {selectedUser.bloqueado ? "Sim" : "Não"}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>
                    <strong>Aceita Promoção</strong>
                  </TableCell>
                  <TableCell>
                    <Checkbox
                      checked={!!selectedUser.aceitarPromocao}
                      disabled
                    />
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>
                    <strong>Aceita Termo</strong>
                  </TableCell>
                  <TableCell>
                    <Checkbox checked={!!selectedUser.aceitarTermo} disabled />
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDetailsModal} color="primary">
            Fechar
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openModal} onClose={handleCloseModal}>
        <DialogTitle>
          {selectedUser?.bloqueado ? "Desbloquear Usuário" : "Bloquear Usuário"}
        </DialogTitle>
        <DialogContent>
          {!selectedUser?.bloqueado && (
            <TextField
              autoFocus
              margin="dense"
              label="Motivo do Bloqueio"
              type="text"
              fullWidth
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal} color="secondary">
            Cancelar
          </Button>
          <Button
            onClick={handleConfirmBloquearDesbloquear}
            color="primary"
            disabled={!selectedUser?.bloqueado && !motivo}
          >
            Confirmar
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openSenhaModal} onClose={handleCloseSenhaModal}>
        <DialogTitle>Resetar Senha</DialogTitle>
        <DialogContent>
          <Typography variant="body2" mb={2}>
            Definir uma nova senha para <strong>{selectedUser?.nome}</strong>{" "}
            ({selectedUser?.email}).
          </Typography>
          <TextField
            autoFocus
            margin="dense"
            label="Nova senha"
            type="password"
            fullWidth
            value={novaSenha}
            onChange={(e) => {
              setNovaSenha(e.target.value);
              setSenhaError("");
            }}
            error={!!senhaError}
            helperText={senhaError}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseSenhaModal} color="secondary">
            Cancelar
          </Button>
          <Button
            onClick={handleConfirmResetarSenha}
            color="primary"
            disabled={!novaSenha}
          >
            Confirmar
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openIgrejasModal} onClose={handleCloseIgrejasModal} fullWidth maxWidth="sm">
        <DialogTitle>
          Igrejas cadastradas por {selectedUser?.nome}
        </DialogTitle>
        <DialogContent>
          {igrejasLoading ? (
            <Box display="flex" justifyContent="center" py={3}>
              <CircularProgress size={32} />
            </Box>
          ) : igrejasUsuario.length === 0 ? (
            <Typography variant="body2" color="text.secondary" py={2}>
              Este usuário ainda não cadastrou nenhuma igreja.
            </Typography>
          ) : (
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Nome</TableCell>
                  <TableCell>UF</TableCell>
                  <TableCell>Cidade</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {igrejasUsuario.map((igreja) => (
                  <TableRow key={igreja.id} hover>
                    <TableCell>
                      <Link
                        component="button"
                        underline="hover"
                        onClick={() => handleEditarIgreja(igreja.id)}
                      >
                        {igreja.nome}
                      </Link>
                    </TableCell>
                    <TableCell>{igreja.uf}</TableCell>
                    <TableCell>{igreja.localidade}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseIgrejasModal} color="primary">
            Fechar
          </Button>
        </DialogActions>
      </Dialog>
    </Menu>
  );
};

export default UsuarioPage;
