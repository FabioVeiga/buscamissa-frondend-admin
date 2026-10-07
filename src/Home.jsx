import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "./Context/AuthContext";
import Menu from "./Components/Menu";
import {
  Card,
  CardContent,
  Typography,
  Button,
  Stack,
  Box,
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import PageHeader from "./Components/PageHeader";
import PageContainer from "./Components/PageContainer";
import KpiCard from "./Components/dashboard/KpiCard";
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
import FactCheckIcon from "@mui/icons-material/FactCheck";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import VisibilityIcon from "@mui/icons-material/Visibility";

const statCards = [
  {
    key: "quantidadesIgrejas",
    label: "Igrejas",
    icon: ChurchIcon,
    color: "#3b82f6",
    path: "/igreja",
  },
  {
    key: "quantidadeMissas",
    label: "Missas",
    icon: ScheduleIcon,
    color: "#0ea5e9",
  },
  {
    key: "quantidadeIgrejaReportarProblemaNaoAtendida",
    label: "Problemas reportados pendentes",
    icon: WarningAmberIcon,
    color: "#f59e0b",
    path: "/reportar-problema",
  },
  {
    key: "quantidadeSolicitacoesNaoAtendida",
    label: "Solicitações pendentes",
    icon: AssignmentIcon,
    color: "#8b5cf6",
    path: "/solicitacoes",
  },
  {
    key: "quantidadeDeUsuarios",
    label: "Usuários",
    icon: PeopleIcon,
    color: "#22c55e",
    path: "/usuario",
  },
  {
    key: "quantidadeAprovacoesPendentes",
    label: "Aprovações Pendentes",
    icon: FactCheckIcon,
    color: "#06b6d4",
    path: "/aprovacoes",
    badge: "aprovacoes",
  },
  {
    key: "quantidadeResponsaveisPendentes",
    label: "Responsáveis Verificados",
    icon: VerifiedUserIcon,
    color: "#ec4899",
    path: "/responsaveis",
    badge: "responsaveis",
  },
  {
    key: "visualizacoesHome",
    label: "Visualizações da Home",
    icon: VisibilityIcon,
    color: "#10b981",
    path: "/indicadores",
  },
];

const Home = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState({
    quantidadesIgrejas: 0,
    quantidadeMissas: 0,
    quantidadeAprovacoesPendentes: 0,
    quantidadeResponsaveisPendentes: 0,
    visualizacoesHome: 0,
  });

  const [carregando, setCarregando] = useState(true);

  const fetchData = () => {
    setCarregando(true);
    api
      .get("/api/v1/admin/igreja/infos")
      .then((response) => setData(prev => ({ ...prev, ...response.data.data })))
      .catch((error) => console.error("Error fetching data:", error))
      .finally(() => setCarregando(false));

    const paginacao = { "Paginacao.PageIndex": 1, "Paginacao.PageSize": 1 };
    api
      .get("/api/v1/Aprovacao/pendentes", { params: paginacao })
      .then((response) => {
        const total = response.data?.data?.totalItems ?? 0;
        setData(prev => ({ ...prev, quantidadeAprovacoesPendentes: total }));
      })
      .catch(() => {});

    api
      .get("/api/v1/admin/responsaveis/pendentes")
      .then((response) => {
        const total = Array.isArray(response.data?.data) ? response.data.data.length : 0;
        setData(prev => ({ ...prev, quantidadeResponsaveisPendentes: total }));
      })
      .catch(() => {});

    // Sem período informado, /indicadores considera todo o histórico —
    // mesma fonte já usada na tela de Indicadores.
    api
      .get("/api/v1/admin/indicadores")
      .then((response) => {
        const visualizacoesHome = response.data?.data?.cards?.visualizacoesHome ?? 0;
        setData(prev => ({ ...prev, visualizacoesHome }));
      })
      .catch(() => {});
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (!isAuthenticated) {
    return <Navigate to="/" />;
  }

  return (
    <Menu>
      <PageContainer>
      <Stack spacing={3}>
        <PageHeader
          title="Visão geral"
          subtitle="Resumo do sistema e pendências que precisam de atenção"
          actions={
            <Button variant="contained" color="primary" startIcon={<RefreshIcon />} onClick={fetchData}>
              Atualizar
            </Button>
          }
        />

        <Grid container spacing={2}>
          {statCards.map(({ key, label, icon, color, path }) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={key}>
              <KpiCard
                label={label}
                value={data[key]}
                icon={icon}
                color={color}
                loading={carregando}
                onClick={path ? () => navigate(path) : undefined}
              />
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
                bgcolor: "action.hover",
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
      </PageContainer>
    </Menu>
  );
};

export default Home;
