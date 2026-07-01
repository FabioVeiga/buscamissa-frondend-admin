/* eslint-disable react/prop-types */
import { Box, Card, CircularProgress, Grid, Typography } from "@mui/material";

const CARDS = [
  { key: "totalIgrejas",          label: "Total de igrejas",              modo: "total",           cor: "primary.main" },
  { key: "comEmail",              label: "Com e-mail",                    modo: "com-email",        cor: "info.main" },
  { key: "comInstagram",          label: "Com Instagram",                 modo: "com-instagram",    cor: "secondary.main" },
  { key: "nuncaReceberamEmail",   label: "Nunca receberam e-mail",        modo: "nunca-email",      cor: "warning.main" },
  { key: "nuncaReceberamInstagram", label: "Nunca receberam Instagram",   modo: "nunca-instagram",  cor: "warning.dark" },
  { key: "criadasRecentemente",   label: "Criadas recentemente",          modo: "criadas",          cor: "success.main" },
  { key: "alteradasRecentemente", label: "Alteradas recentemente",        modo: "alteradas",        cor: "success.dark" },
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
    <Grid container spacing={1.5}>
      {CARDS.map(({ key, label, modo, cor }) => {
        const ativo = modoAtivo === modo;
        return (
          <Grid size={{ xs: 6, sm: 4, md: 3, lg: "auto" }} key={key} sx={{ flexGrow: 1 }}>
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
  );
};

export default DashboardDivulgacao;
