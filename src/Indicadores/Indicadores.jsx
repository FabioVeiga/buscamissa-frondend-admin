/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import {
  Box,
  Card,
  CircularProgress,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import Menu from "../Components/Menu";
import api from "../services/apiService";
import ErrorSpan from "../ErrorSpan";

const RankingTable = ({ titulo, itens }) => (
  <Paper sx={{ p: 2, borderRadius: 2, height: "100%" }}>
    <Typography variant="h6" mb={2}>
      {titulo}
    </Typography>
    <TableContainer>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Igreja</TableCell>
            <TableCell align="right">Quantidade</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {itens.length === 0 && (
            <TableRow>
              <TableCell colSpan={2} align="center">
                Sem dados nos últimos 30 dias.
              </TableCell>
            </TableRow>
          )}
          {itens.map((item) => (
            <TableRow key={item.igrejaId} hover>
              <TableCell>{item.nome}</TableCell>
              <TableCell align="right">{item.quantidade}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  </Paper>
);

const Indicadores = () => {
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");
  const [dados, setDados] = useState(null);

  useEffect(() => {
    setLoading(true);
    setErro("");

    api
      .get(`/api/v1/admin/metricas/dashboard`)
      .then((response) => {
        setDados(response.data?.data || null);
      })
      .catch(() => {
        setErro("Não foi possível carregar os indicadores.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <Menu>
        <Box display="flex" justifyContent="center" alignItems="center" py={6}>
          <CircularProgress />
        </Box>
      </Menu>
    );
  }

  if (erro || !dados) {
    return (
      <Menu>
        <ErrorSpan errorMessage={erro || "Sem dados."} severity="error" />
      </Menu>
    );
  }

  const totais = dados.totais || {};

  return (
    <Menu>
      <Stack spacing={2}>
        <Typography variant="body2" color="text.secondary">
          Indicadores gerais do sistema (últimos 30 dias).
        </Typography>

        <Grid container spacing={2}>
          <Grid size={4}>
            <Card variant="outlined" sx={{ p: 2, textAlign: "center" }}>
              <Typography variant="h4" fontWeight={700}>
                {totais.visualizacoes ?? 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Visualizações do sistema
              </Typography>
            </Card>
          </Grid>
          <Grid size={4}>
            <Card variant="outlined" sx={{ p: 2, textAlign: "center" }}>
              <Typography variant="h4" fontWeight={700}>
                {totais.favoritos ?? 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total de Favoritos
              </Typography>
            </Card>
          </Grid>
          <Grid size={4}>
            <Card variant="outlined" sx={{ p: 2, textAlign: "center" }}>
              <Typography variant="h4" fontWeight={700}>
                {totais.compartilhamentos ?? 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total de Compartilhamentos
              </Typography>
            </Card>
          </Grid>
        </Grid>

        <Grid container spacing={2}>
          <Grid size={6}>
            <RankingTable titulo="Igrejas mais visualizadas" itens={dados.maisVisualizadas || []} />
          </Grid>
          <Grid size={6}>
            <RankingTable titulo="Igrejas mais favoritadas" itens={dados.maisFavoritadas || []} />
          </Grid>
          <Grid size={6}>
            <RankingTable titulo="Igrejas mais compartilhadas" itens={dados.maisCompartilhadas || []} />
          </Grid>
          <Grid size={6}>
            <RankingTable titulo="Igrejas com mais rotas abertas" itens={dados.maisRotasAbertas || []} />
          </Grid>
        </Grid>
      </Stack>
    </Menu>
  );
};

export default Indicadores;
