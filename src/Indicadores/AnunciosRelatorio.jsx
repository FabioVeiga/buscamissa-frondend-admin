/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import api from "../services/apiService";

const formatarData = (iso) => new Date(`${iso}T00:00`).toLocaleDateString("pt-BR");
const formatarCtr = (v) => `${Number(v).toFixed(2).replace(".", ",")}%`;

// Escapa para CSV (separador ";" e aspas), pensando em abrir direto no Excel pt-BR.
const celula = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;

const baixarCsv = (linhas, periodo) => {
  const cab = ["Data", "Campanha", "Posição", "Impressões", "Cliques", "CTR (%)"];
  const corpo = linhas.map((l) => [l.data, l.campanha, l.posicao, l.impressoes, l.cliques, String(l.ctr).replace(".", ",")]);
  const csv = [cab, ...corpo].map((r) => r.map(celula).join(";")).join("\r\n");
  const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `campanhas-${periodo || "todo-periodo"}.csv`;
  a.click();
  URL.revokeObjectURL(url);
};

/** Aba "Anúncios" de Indicadores: cliques em Anuncie por origem e desempenho por campanha. */
const AnunciosRelatorio = ({ dataInicial, dataFinal }) => {
  const [dados, setDados] = useState(null);
  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    setErro("");
    const params = {};
    if (dataInicial) params.dataInicial = dataInicial;
    if (dataFinal) params.dataFinal = dataFinal;
    api
      .get("/api/v1/admin/campanhas/relatorio", { params })
      .then((r) => setDados(r.data?.data || null))
      .catch(() => setErro("Não foi possível carregar o relatório de anúncios."))
      .finally(() => setLoading(false));
  }, [dataInicial, dataFinal]);

  if (loading) return <Typography variant="body2">Carregando anúncios...</Typography>;
  if (erro) return <Alert severity="error">{erro}</Alert>;

  const cliques = dados?.cliquesAnuncie || [];
  const desempenho = dados?.desempenho || [];
  const periodo = [dataInicial, dataFinal].filter(Boolean).join("_");

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <Paper sx={{ p: 2, borderRadius: 2 }}>
        <Typography variant="subtitle1" fontWeight={700}>Cliques em &quot;Anuncie no BuscaMissa&quot;</Typography>
        <Typography variant="caption" color="text.secondary">
          Por ponto de origem do convite. Cliques não são deduplicados.
        </Typography>
        <Table size="small" sx={{ mt: 1 }}>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 700 }}>Origem</TableCell>
              <TableCell sx={{ fontWeight: 700 }} align="right">Cliques</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {cliques.length === 0 && (
              <TableRow><TableCell colSpan={2} align="center">Sem cliques no período.</TableCell></TableRow>
            )}
            {cliques.map((c) => (
              <TableRow key={c.origem} hover>
                <TableCell>{c.nome}</TableCell>
                <TableCell align="right">{c.cliques}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>

      <Paper sx={{ p: 2, borderRadius: 2 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
          <Box>
            <Typography variant="subtitle1" fontWeight={700}>Desempenho das campanhas</Typography>
            <Typography variant="caption" color="text.secondary">
              Impressões, cliques e CTR por campanha, posição e dia.
            </Typography>
          </Box>
          <Button size="small" startIcon={<DownloadIcon />} disabled={desempenho.length === 0} onClick={() => baixarCsv(desempenho, periodo)}>
            Exportar CSV
          </Button>
        </Box>
        <TableContainer sx={{ maxHeight: 420, mt: 1 }}>
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>Data</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Campanha</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Posição</TableCell>
                <TableCell sx={{ fontWeight: 700 }} align="right">Impressões</TableCell>
                <TableCell sx={{ fontWeight: 700 }} align="right">Cliques</TableCell>
                <TableCell sx={{ fontWeight: 700 }} align="right">CTR</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {desempenho.length === 0 && (
                <TableRow><TableCell colSpan={6} align="center">Sem eventos de campanha no período.</TableCell></TableRow>
              )}
              {desempenho.map((d) => (
                <TableRow key={`${d.data}-${d.campanhaId}-${d.posicao}`} hover>
                  <TableCell>{formatarData(d.data)}</TableCell>
                  <TableCell>{d.campanha}</TableCell>
                  <TableCell>{d.posicao}</TableCell>
                  <TableCell align="right">{d.impressoes}</TableCell>
                  <TableCell align="right">{d.cliques}</TableCell>
                  <TableCell align="right">{formatarCtr(d.ctr)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};

export default AnunciosRelatorio;
