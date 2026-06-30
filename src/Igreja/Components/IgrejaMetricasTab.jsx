/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import { Box, Card, CircularProgress, Typography } from "@mui/material";
import Grid from "@mui/material/Grid2";
import api from "../../services/apiService";
import ErrorSpan from "../../ErrorSpan";

// TipoMetricaEnum (backend) é serializado como número: 1=VisualizacaoIgreja, 2=CliqueRota,
// 3=Favorito, 4=Compartilhamento, 5=CliqueTelefone, 6=CliqueInstagram, 7=SugestaoEdicao
const ROTULOS_METRICA = {
  1: "Visualizações",
  3: "Favoritos",
  2: "Rotas",
  5: "Telefone",
  6: "Instagram",
  4: "Compartilhamentos",
  7: "Sugestões de edição",
};

const ORDEM_METRICAS = [1, 3, 2, 5, 6, 4, 7];

const IgrejaMetricasTab = ({ igrejaId }) => {
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");
  const [valores, setValores] = useState({});

  useEffect(() => {
    if (!igrejaId) return;

    setLoading(true);
    setErro("");

    api
      .get(`/api/v1/admin/igreja/${igrejaId}/metricas`)
      .then((response) => {
        const lista = response.data?.data || [];
        const mapa = {};
        lista.forEach((item) => {
          mapa[item.tipoMetrica] = item.quantidade;
        });
        setValores(mapa);
      })
      .catch(() => {
        setErro("Não foi possível carregar as métricas desta igreja.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [igrejaId]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" sx={{ py: 6 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (erro) {
    return (
      <Box sx={{ py: 2 }}>
        <ErrorSpan errorMessage={erro} severity="error" />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        margin: "0 auto",
        padding: 2,
        border: "1px solid #ccc",
        borderRadius: 2,
        width: "100%",
        boxSizing: "border-box",
      }}
    >
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Indicadores dos últimos 30 dias.
      </Typography>

      <Grid container spacing={2}>
        {ORDEM_METRICAS.map((tipo) => (
          <Grid size={3} key={tipo}>
            <Card variant="outlined" sx={{ p: 2, textAlign: "center" }}>
              <Typography variant="h4" fontWeight={700}>
                {valores[tipo] ?? 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {ROTULOS_METRICA[tipo]}
              </Typography>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default IgrejaMetricasTab;
