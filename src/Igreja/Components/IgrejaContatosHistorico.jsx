/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import {
  Box,
  CircularProgress,
  Divider,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import api from "../../services/apiService";

// CanalContatoEnum: Email=1, Instagram=2, Facebook=3
// TipoEmailEventoIgrejaEnum: Criacao=1, Alteracao=2, Notificacao=3, Validacao=4, Outro=99
const CANAL_ICONE = { 1: "📧", 2: "📸", 3: "📘" };
const CANAL_LABEL = { 1: "E-mail", 2: "Instagram", 3: "Facebook" };
const TIPO_LABEL = {
  1: "Criação",
  2: "Alteração",
  3: "Notificação",
  4: "Validação",
  99: "Contato manual",
};

const formatarData = (valor) => {
  if (!valor) return "-";
  return new Date(valor).toLocaleDateString("pt-BR");
};

const IgrejaContatosHistorico = ({ igrejaId }) => {
  const [loading, setLoading] = useState(true);
  const [contatos, setContatos] = useState([]);

  useEffect(() => {
    if (!igrejaId) return;

    api
      .get(`/api/v1/Admin/email-evento/igreja/${igrejaId}`)
      .then((res) => {
        const lista = res.data?.data || res.data || [];
        setContatos(lista.slice(0, 10));
      })
      .catch(() => setContatos([]))
      .finally(() => setLoading(false));
  }, [igrejaId]);

  return (
    <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
      <Typography variant="subtitle2" fontWeight={700} mb={1.5}>
        Últimos contatos
      </Typography>

      {loading && (
        <Box display="flex" justifyContent="center" py={2}>
          <CircularProgress size={20} />
        </Box>
      )}

      {!loading && contatos.length === 0 && (
        <Typography variant="body2" color="text.secondary">
          Nenhum contato registrado.
        </Typography>
      )}

      {!loading && contatos.length > 0 && (
        <Stack divider={<Divider />} spacing={1}>
          {contatos.map((c) => (
            <Box key={c.id} sx={{ py: 0.5 }}>
              <Typography variant="body2" fontWeight={500}>
                {CANAL_ICONE[c.canal] ?? "📄"}{" "}
                {CANAL_LABEL[c.canal] ?? "Contato"} de {TIPO_LABEL[c.tipo] ?? c.tipo}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {formatarData(c.dataEnvio || c.dataCriacao)}
              </Typography>
            </Box>
          ))}
        </Stack>
      )}
    </Paper>
  );
};

export default IgrejaContatosHistorico;
