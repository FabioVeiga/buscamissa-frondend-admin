import { useState, useEffect } from "react";
import Menu from "./Components/Menu";
import {  Table,  TableBody,  TableCell,  TableContainer,  TableHead,  TableRow,  Paper,  CircularProgress,  Box,  Typography,  Button,  Dialog,  DialogActions,  DialogContent,  DialogTitle,  TextField,  Checkbox,  FormControlLabel,  Select,  MenuItem,  TableFooter} from "@mui/material";
import api from "./services/apiService";

const SolicitacoesPage = () => {
  const [solicitacoes, setSolicitacoes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const [selectedSolicitacao, setSelectedSolicitacao] = useState(null);
  const [solucao, setSolucao] = useState("");
  const [resposta, setResponse] = useState("");
  const [enviarEmail, setEnviarEmail] = useState(false);
  const [filtroResolvida, setFiltroResolvida] = useState(""); // Estado para o filtro

  // Fetch solicitações
  useEffect(() => {
    const fetchSolicitacoes = async () => {
      try {
        const response = await api.get(
          `/api/Admin/solicitacao${
            filtroResolvida ? `?resolvida=${filtroResolvida}` : ""
          }`
        );
        setSolicitacoes(response.data.data);
      } catch (error) {
        console.error("Erro ao buscar solicitações:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSolicitacoes();
  }, [filtroResolvida]);

  // Abrir modal
  const handleOpenModal = (solicitacao) => {
    setSelectedSolicitacao(solicitacao);
    setSolucao("");
    setResponse("");
    setEnviarEmail(false);
    setOpenModal(true);
  };

  // Fechar modal
  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedSolicitacao(null);
  };

  // Confirmar solução
  const handleConfirmSolucao = async () => {
    if (!selectedSolicitacao) return;

    try {
      const response = await api.post(
        `/api/admin/solicitacao/${selectedSolicitacao.id}`,
        {
            resolvido: true,
            solucao,
            resposta,
            EnviarResposta: enviarEmail,
        }
      );

      if (response.status === 200) {
        alert("Denúncia atendida com sucesso!");

        // Atualizar a lista de solicitações para marcar como resolvido
        setSolicitacoes((prevSolicitacoes) =>
          prevSolicitacoes.map((s) =>
            s.id === selectedSolicitacao.id ? { ...s, resolvido: true } : s
          )
        );
      }
    } catch (error) {
      console.error("Erro ao atender denúncia:", error);
      alert("Erro ao atender a denúncia. Tente novamente.");
    } finally {
      handleCloseModal();
    }
  };

  const handleFiltroChange = (event) => {
    setFiltroResolvida(event.target.value);
    setIsLoading(true); // Exibe o carregamento ao mudar o filtro
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
          <Typography variant="h5">Solicitações</Typography>
          <Select
            value={filtroResolvida}
            onChange={handleFiltroChange}
            displayEmpty
            style={{ minWidth: "200px" }}
          >
            <MenuItem value="">Todas</MenuItem>
            <MenuItem value="true">Resolvidas</MenuItem>
            <MenuItem value="false">Não Resolvidas</MenuItem>
          </Select>
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
                <TableCell>Solicitante</TableCell>
                <TableCell>Assunto</TableCell>
                <TableCell>Resolvido</TableCell>
                <TableCell>Data Solução</TableCell>
                <TableCell>Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {solicitacoes && solicitacoes.length > 0 ? (
                solicitacoes.map((solicitacao) => (
                  <TableRow key={solicitacao.id}>
                    <TableCell>{solicitacao.id}</TableCell>
                    <TableCell>{solicitacao.nomeSolicitante}</TableCell>
                    <TableCell>{solicitacao.assunto}</TableCell>
                    <TableCell>
                      {solicitacao.resolvido ? "Sim" : "Não"}
                    </TableCell>
                    <TableCell>
                      {new Date(solicitacao.dataSolucao).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {!solicitacao.resolvido && ( // Exibe o botão apenas se não estiver resolvido
                        <Button
                          variant="contained"
                          color="primary"
                          size="small"
                          onClick={() => handleOpenModal(solicitacao)}
                        >
                          Atender
                        </Button>
                      )}
                    </TableCell>
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
                    {solicitacoes.items ? solicitacoes.items.length : 0}
                  </TableCell>
                </TableRow>
              </TableFooter>
          </Table>
        )}
      </TableContainer>

      <Dialog open={openModal} onClose={handleCloseModal}>
        <DialogTitle>Resolver Solicitação</DialogTitle>
        <DialogContent>
          <TextField
            label="Solução"
            fullWidth
            multiline
            rows={4}
            value={solucao}
            onChange={(e) => setSolucao(e.target.value)}
          />
          <TextField
            label="Responsta para email"
            fullWidth
            multiline
            rows={4}
            value={resposta}
            onChange={(e) => setResponse(e.target.value)}
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={enviarEmail}
                onChange={(e) => setEnviarEmail(e.target.checked)}
              />
            }
            label="Enviar e-mail ao solicitante"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal} color="secondary">
            Cancelar
          </Button>
          <Button onClick={handleConfirmSolucao} color="primary">
            Confirmar
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default SolicitacoesPage;
