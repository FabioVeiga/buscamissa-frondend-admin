/* eslint-disable react/prop-types */
import { Box, Card, CircularProgress, Grid, Typography } from "@mui/material";

const CARDS = [
  { key: "semContatoEmail",           label: "Sem contato via e-mail",       modo: "SemContatoEmail",           cor: "warning.main" },
  { key: "semEmailAlteracaoPendente", label: "Alteração sem e-mail enviado", modo: "SemEmailAlteracaoPendente", cor: "warning.dark" },
  { key: "semContatoFacebook",        label: "Sem contato via Facebook",     modo: "SemContatoFacebook",        cor: "secondary.main" },
  { key: "semContatoInstagram",       label: "Sem contato via Instagram",    modo: "SemContatoInstagram",       cor: "secondary.dark" },
];

const DashboardDivulgacao = ({ dados, loading, modoAtivo, onCardClick }) => {
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" py={3}>
        <CircularProgress size={24} />
      </Box>
    );
  }

  if (!dados) return null;

  return (
    <Box>
      <Typography variant="body2" color="text.secondary" mb={1}>
        {dados.totalIgrejas ?? 0} igreja(s) ativa(s) no total.
      </Typography>
      <Grid container spacing={1.5}>
        {CARDS.map(({ key, label, modo, cor }) => {
          const ativo = modoAtivo === modo;
          return (
            <Grid size={{ xs: 12, sm: 6, md: 3 }} key={key}>
              <Card
                variant="outlined"
                onClick={() => onCardClick(modo)}
                sx={{
                  p: 1.5,
                  textAlign: "center",
                  cursor: "pointer",
                  borderColor: ativo ? cor : "divider",
                  borderWidth: ativo ? 2 : 1,
                  bgcolor: ativo ? `${cor.split(".")[0]}.50` : "background.paper",
                  transition: "all 0.15s",
                  "&:hover": { borderColor: cor, boxShadow: 2 },
                }}
              >
                <Typography variant="h5" fontWeight={700} color={cor}>
                  {dados[key] ?? 0}
                </Typography>
                <Typography variant="caption" color="text.secondary" lineHeight={1.3} display="block">
                  {label}
                </Typography>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
};

export default DashboardDivulgacao;
