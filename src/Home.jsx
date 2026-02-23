import { Navigate } from "react-router-dom";
import { useAuth } from "./Context/AuthContext";
import Menu from "./Components/Menu";
import {
  Card,
  CardContent,
  Typography,
  Button,
  Stack,
  Grid,
  Box,
} from "@mui/material";
import { useState, useEffect } from "react";
import api from "./services/apiService";
import MissaCardHome from "./Components/MissaCardHome";
import ChurchIcon from "@mui/icons-material/Church";
import ScheduleIcon from "@mui/icons-material/Schedule";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import AssignmentIcon from "@mui/icons-material/Assignment";
import PeopleIcon from "@mui/icons-material/People";
import RefreshIcon from "@mui/icons-material/Refresh";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";

const statCards = [
  {
    key: "quantidadesIgrejas",
    label: "Igrejas",
    icon: ChurchIcon,
    color: "#3b82f6",
    bgLight: "rgba(59, 130, 246, 0.1)",
  },
  {
    key: "quantidadeMissas",
    label: "Missas",
    icon: ScheduleIcon,
    color: "#0ea5e9",
    bgLight: "rgba(14, 165, 233, 0.1)",
  },
  {
    key: "quantidadeIgrejaDenunciaNaoAtendida",
    label: "Denúncias pendentes",
    icon: WarningAmberIcon,
    color: "#f59e0b",
    bgLight: "rgba(245, 158, 11, 0.1)",
  },
  {
    key: "quantidadeSolicitacoesNaoAtendida",
    label: "Solicitações pendentes",
    icon: AssignmentIcon,
    color: "#8b5cf6",
    bgLight: "rgba(139, 92, 246, 0.1)",
  },
  {
    key: "quantidadeDeUsuarios",
    label: "Usuários",
    icon: PeopleIcon,
    color: "#22c55e",
    bgLight: "rgba(34, 197, 94, 0.1)",
  },
];

const Home = () => {
  const { isAuthenticated } = useAuth();
  const [data, setData] = useState({
    quantidadesIgrejas: 0,
    quantidadeMissas: 0,
  });

  const fetchData = () => {
    api
      .get("/api/admin/igreja/infos")
      .then((response) => setData(response.data.data))
      .catch((error) => console.error("Error fetching data:", error));
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (!isAuthenticated) {
    return <Navigate to="/" />;
  }

  return (
    <Menu>
      <Stack spacing={3} sx={{ width: "100%", maxWidth: 1200 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 2,
          }}
        >
          <Typography variant="body1" color="text.secondary">
            Visão geral do painel
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<RefreshIcon />}
            onClick={fetchData}
            size="medium"
          >
            Atualizar
          </Button>
        </Box>

        <Grid container spacing={2}>
          {statCards.map(({ key, label, icon: Icon, color, bgLight }) => (
            <Grid item xs={12} sm={6} md={4} key={key}>
              <Card
                sx={{
                  height: "100%",
                  borderRadius: 2,
                  boxShadow: "0 1px 3px 0 rgba(0,0,0,0.06)",
                  border: "1px solid rgba(0,0,0,0.04)",
                  transition: "box-shadow 0.2s, transform 0.2s",
                  "&:hover": {
                    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                  },
                }}
              >
                <CardContent sx={{ p: 2.5, "&:last-child": { pb: 2.5 } }}>
                  <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2 }}>
                    <Box
                      sx={{
                        width: 48,
                        height: 48,
                        borderRadius: 2,
                        bgcolor: bgLight,
                        color,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <Icon sx={{ fontSize: 26 }} />
                    </Box>
                    <Box sx={{ minWidth: 0 }}>
                      <Typography variant="body2" color="text.secondary" fontWeight={500}>
                        {label}
                      </Typography>
                      <Typography variant="h4" fontWeight={700} sx={{ color, mt: 0.25 }}>
                        {data[key] ?? "—"}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Card
          sx={{
            borderRadius: 2,
            boxShadow: "0 1px 3px 0 rgba(0,0,0,0.06)",
            border: "1px solid rgba(0,0,0,0.04)",
          }}
        >
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
              <ContentCopyIcon color="action" fontSize="small" />
              <Typography variant="h6" fontWeight={600}>
                Texto para divulgar o Busca Missa
              </Typography>
            </Box>
            <Box
              sx={{
                p: 2,
                borderRadius: 2,
                bgcolor: "grey.50",
                border: "1px solid",
                borderColor: "divider",
              }}
            >
              <MissaCardHome
                churchesCount={data.quantidadesIgrejas}
                massesCount={data.quantidadeMissas}
              />
            </Box>
          </CardContent>
        </Card>
      </Stack>
    </Menu>
  );
};

export default Home;
