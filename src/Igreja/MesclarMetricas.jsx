import { useState } from "react";
import { Box, Button, CircularProgress, Paper, Stack, TextField, Typography } from "@mui/material";
import Menu from "../Components/Menu";
import api from "../services/apiService";
import ErrorSpan from "../ErrorSpan";

const MesclarMetricas = () => {
  const [igrejaVencedoraId, setIgrejaVencedoraId] = useState("");
  const [igrejaPerdedoraId, setIgrejaPerdedoraId] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ mensagem: "", severity: "", show: false });

  const handleMesclar = () => {
    setLoading(true);
    setMessage({ mensagem: "", severity: "", show: false });

    api
      .put("/api/v1/Admin/igreja/mesclar-metricas", {
        igrejaVencedoraId: Number(igrejaVencedoraId),
        igrejaPerdedoraId: Number(igrejaPerdedoraId),
      })
      .then(() => {
        setMessage({ mensagem: "Métricas mescladas com sucesso!", severity: "success", show: true });
        setIgrejaVencedoraId("");
        setIgrejaPerdedoraId("");
      })
      .catch((error) => {
        const mensagemAplicacao = error.response?.data?.data?.messagemAplicacao;
        setMessage({
          mensagem: mensagemAplicacao || "Erro ao mesclar métricas.",
          severity: "error",
          show: true,
        });
      })
      .finally(() => setLoading(false));
  };

  return (
    <Menu>
      <Paper sx={{ p: 3, borderRadius: 2, maxWidth: 480 }}>
        <Typography variant="h6" sx={{ mb: 1 }}>
          Mesclar Métricas de Igrejas
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Move as métricas (visualizações, cliques, favoritos etc.) da igreja perdedora
          para a vencedora. Não altera nome, endereço, status ativo ou qualquer outro
          dado das igrejas — só as métricas.
        </Typography>

        <Stack spacing={2}>
          <TextField
            label="ID da igreja vencedora (fica ativa)"
            type="number"
            value={igrejaVencedoraId}
            onChange={(e) => setIgrejaVencedoraId(e.target.value)}
            fullWidth
          />
          <TextField
            label="ID da igreja perdedora (duplicata)"
            type="number"
            value={igrejaPerdedoraId}
            onChange={(e) => setIgrejaPerdedoraId(e.target.value)}
            fullWidth
          />

          <Button
            variant="contained"
            onClick={handleMesclar}
            disabled={loading || !igrejaVencedoraId || !igrejaPerdedoraId}
          >
            {loading ? <CircularProgress size={20} /> : "Mesclar métricas"}
          </Button>

          {message.show && (
            <Box>
              <ErrorSpan errorMessage={message.mensagem} severity={message.severity} />
            </Box>
          )}
        </Stack>
      </Paper>
    </Menu>
  );
};

export default MesclarMetricas;
