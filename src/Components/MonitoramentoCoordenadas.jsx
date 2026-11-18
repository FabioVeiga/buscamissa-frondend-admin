/* eslint-disable react/prop-types */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Accordion, AccordionDetails, AccordionSummary, Button, Chip, CircularProgress, Stack, Table, TableBody, TableCell,
  TableHead, TableRow, Typography,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import api from "../services/apiService";
import { buscarIgrejaCompletaPorId, normalizarIgrejaParaEdicao } from "../services/igrejaHelpers";
import { useNotificar } from "../Context/NotificationContext";

/**
 * Monitoramento semanal das coordenadas (PR 13): reportes "Localização no mapa" dos usuários,
 * endereço alterado sem reconfirmar, confiança baixa e pontos compartilhados.
 * "Corrigir" abre a edição da igreja, que tem o mapa de confirmação.
 */
const MonitoramentoCoordenadas = () => {
  const notificar = useNotificar();
  const navigate = useNavigate();
  const [dados, setDados] = useState(null);
  const [carregando, setCarregando] = useState(false);
  const [abrindoId, setAbrindoId] = useState(null);

  const carregar = (_, aberto) => {
    if (!aberto || dados || carregando) return;
    setCarregando(true);
    api.get("/api/v1/admin/geo/monitoramento")
      .then((r) => setDados(r.data?.data))
      .catch(() => notificar.erro("Não foi possível carregar o monitoramento."))
      .finally(() => setCarregando(false));
  };

  const corrigir = async (igrejaId) => {
    setAbrindoId(igrejaId);
    try {
      const igreja = await buscarIgrejaCompletaPorId(igrejaId);
      navigate("/igrejaEditar", { state: { row: normalizarIgrejaParaEdicao(igreja) } });
    } catch {
      notificar.erro("Não foi possível abrir a igreja.");
    } finally {
      setAbrindoId(null);
    }
  };

  const Lista = ({ titulo, itens, rotuloDetalhe }) => (
    <Stack spacing={0.5} sx={{ mt: 2 }}>
      <Typography variant="subtitle2">{titulo} <Chip size="small" label={itens.length} /></Typography>
      {itens.length > 0 && (
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Igreja</TableCell>
              <TableCell>Cidade</TableCell>
              {rotuloDetalhe && <TableCell>{rotuloDetalhe}</TableCell>}
              <TableCell />
            </TableRow>
          </TableHead>
          <TableBody>
            {itens.map((i) => (
              <TableRow key={`${titulo}-${i.igrejaId}`}>
                <TableCell>#{i.igrejaId} · {i.nome}</TableCell>
                <TableCell>{i.localidade}/{i.uf}</TableCell>
                {rotuloDetalhe && <TableCell sx={{ maxWidth: 420, whiteSpace: "pre-wrap" }}>{i.detalhe}</TableCell>}
                <TableCell align="right">
                  <Button size="small" disabled={abrindoId === i.igrejaId} onClick={() => corrigir(i.igrejaId)}>
                    Corrigir
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </Stack>
  );

  const resumo = (obj) => Object.entries(obj || {}).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k} ${v}`).join(" · ");

  return (
    <Accordion variant="outlined" sx={{ mb: 2 }} onChange={carregar}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography>Monitoramento semanal</Typography>
        {dados && (
          <Typography variant="body2" color="text.secondary" sx={{ ml: 2 }}>
            {dados.localizacaoErradaReportada.length} reporte(s) de localização errada
          </Typography>
        )}
      </AccordionSummary>
      <AccordionDetails>
        {carregando && <CircularProgress size={24} />}
        {dados && (
          <>
            <Typography variant="body2">
              Ativas: {dados.ativas} · com coordenada: {dados.comCoordenada} · sem: {dados.semCoordenada}
            </Typography>
            <Typography variant="body2" color="text.secondary">Por fonte: {resumo(dados.porFonte)}</Typography>
            <Typography variant="body2" color="text.secondary">Por confiança: {resumo(dados.porConfianca)}</Typography>
            <Lista titulo="Localização errada reportada pelos usuários" itens={dados.localizacaoErradaReportada} rotuloDetalhe="O que a pessoa disse" />
            <Lista titulo="Endereço alterado sem reconfirmar a coordenada" itens={dados.enderecoAlteradoSemReconfirmar} rotuloDetalhe="Fonte" />
            <Lista titulo="Confiança baixa" itens={dados.confiancaBaixa} rotuloDetalhe="Fonte" />
            <Stack spacing={0.5} sx={{ mt: 2 }}>
              <Typography variant="subtitle2">
                Pontos compartilhados por ruas diferentes <Chip size="small" label={dados.pontosCompartilhados.length} />
              </Typography>
              {dados.pontosCompartilhados.slice(0, 30).map((p) => (
                <Typography key={`${p.latitude},${p.longitude}`} variant="body2" color="text.secondary">
                  {p.latitude}, {p.longitude} — {p.igrejas} igrejas: {p.ids}
                </Typography>
              ))}
            </Stack>
          </>
        )}
      </AccordionDetails>
    </Accordion>
  );
};

export default MonitoramentoCoordenadas;
