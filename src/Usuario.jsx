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
} from "@mui/material";
import Menu from "./Components/Menu";
import api from "./services/apiService";
import { useState, useEffect } from "react";
import { CircularProgress, Box, Typography } from "@mui/material";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import ManageAccountsIcon from "@mui/icons-material/ManageAccounts";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import ContactEmergencyIcon from "@mui/icons-material/ContactEmergency";
import Pagination from "./Components/Paginacao";

const UsuarioPage = () => {
  const [data, setData] = useState([]);
  const [paginacao, setPaginacao] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const [openDetailsModal, setOpenDetailsModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [motivo, setMotivo] = useState("");

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
        `/api/Admin/usuario/bloquear-desbloquear/${selectedUser.id}`,
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

  console.log(selectedUser);

  useEffect(() => {
    api
      .get(
        "/api/Admin/usuario/buscar-por-filtro?Paginacao.PageIndex=1&Paginacao.PageSize=10"
      )
      .then((response) => {
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
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  return (
    <div style={{ display: "flex" }}>
      <Menu />
      <TableContainer
        component={Paper}
        style={{ margin: "20px", padding: "20px" }}
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
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
        <Pagination {...paginacao} />
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
    </div>
  );
};

export default UsuarioPage;
