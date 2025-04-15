import { useState, useEffect } from "react";
import Menu from "./Components/Menu";
import {  Table,  TableBody,  TableCell,  TableContainer,  TableHead,  TableRow,  Paper,  CircularProgress,  Box,  Typography,  Button,  Dialog,  DialogActions,  DialogContent,  DialogTitle,  TextField,  TableFooter} from "@mui/material";
import api from "./services/apiService";

const ContribuidoresPage = () => {
  const [contribuidores, setContribuidores] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const [nomes, setNomes] = useState(""); // Estado para armazenar os nomes



  // Fetch solicitações
  useEffect(() => {
    const fetchContribuidores = async () => {
      try {
        await getContribuidores()
      } catch {
        //console.error("Erro ao buscar solicitações:", error);
        setContribuidores([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchContribuidores();
  }, []);

  const getContribuidores = async () => {
    try {
      const response = await api.get("/api/Contribuidor/do-mes-vigente"); 
      setContribuidores(response.data); 
    } catch (error) {
      console.error("Erro ao buscar contribuidores:", error);
    }
  };

  // Abrir modal
  const handleOpenModal = () => {
    setOpenModal(true);
    setNomes("");
  };

  // Fechar modal
  const handleCloseModal = () => {
    setOpenModal(false);
  };

  // Confirmar solução
  const handleEntradaContribuidores = async () => {
    try {
      const response = await api.post("/api/Contribuidor/inserir-por-nomes", nomes, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.status === 200) {
        alert("Contribuidores inseridos com sucesso!");
        await getContribuidores();
      }
    } catch (error) {
      console.error("Erro ao inserir contribuidores:", error);
      alert("Erro ao inserir contribuidores. Tente novamente.");
    } finally {
      handleCloseModal();
    }
  };

  return (
    <div style={{ display: "flex" }}>
      <Menu />
      <TableContainer
        component={Paper}
        style={{ margin: "20px", padding: "20px" }}
      >
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          margin="20px"
        >
          <Typography variant="h5">Contribuidores</Typography>
        </Box>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          margin="20px"
        >
          <Button variant="contained" color="primary" onClick={handleOpenModal}>
          Inserir Contribuidores
        </Button>
        </Box>
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
              </TableRow>
            </TableHead>
            <TableBody>
              {contribuidores && contribuidores.length > 0 ? (
                contribuidores.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell>{row.id}</TableCell>
                    <TableCell>{row.nome}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    Não há dados disponíveis.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
            <TableFooter>
                <TableRow>
                  <TableCell colSpan={7} align="right">
                    Total de registros:{" "}
                    {contribuidores ? contribuidores.length : 0}
                  </TableCell>
                </TableRow>
              </TableFooter>
          </Table>
        )}
      </TableContainer>

       {/* Modal */}
       <Dialog open={openModal} onClose={handleCloseModal}>
        <DialogTitle>Inserir Contribuidores</DialogTitle>
        <DialogContent>
          <Typography>
            Insira os nomes dos contribuidores separados por ponto e vírgula (;).
          </Typography>
          <TextField
            autoFocus
            margin="dense"
            label="Nomes"
            type="text"
            fullWidth
            value={nomes}
            onChange={(e) => setNomes(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal} color="secondary">
            Cancelar
          </Button>
          <Button
            onClick={handleEntradaContribuidores}
            color="primary"
            disabled={!nomes.trim()} // Desabilitar se o campo estiver vazio
          >
            Confirmar
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default ContribuidoresPage;
