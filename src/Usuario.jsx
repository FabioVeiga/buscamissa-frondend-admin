import {  Table,  TableBody,  TableCell,  TableContainer,  TableHead,  TableRow,  Paper,  Button,  Stack,} from "@mui/material";
import Menu from "./Components/Menu";
import api from "./services/apiService";
import { useState, useEffect } from "react";
import { CircularProgress, Box, Typography } from "@mui/material";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import ManageAccountsIcon from "@mui/icons-material/ManageAccounts";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import ContactEmergencyIcon from "@mui/icons-material/ContactEmergency";
import Pagination from "./Components/Paginacao";

const IgrejaPage = () => {
  const [data, setData] = useState([]);
  const [paginacao, setPaginacao] = useState({});
  const [isLoading, setIsLoading] = useState(true);

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
                <TableCell>Ativo</TableCell>
                <TableCell>Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.items.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>{row.id}</TableCell>
                  <TableCell>{row.nome}</TableCell>
                  <TableCell>{perfil(row.perfil)}</TableCell>
                  <TableCell>{row.ativo ? "Sim" : "Não"}</TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={1}>
                      <Button variant="contained" color="primary" size="small">
                        Visualizar
                      </Button>
                      <Button
                        variant="contained"
                        color="secondary"
                        size="small"
                      >
                        Editar
                      </Button>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
        <Pagination {...paginacao} />
      </TableContainer>
    </div>
  );
};

export default IgrejaPage;
