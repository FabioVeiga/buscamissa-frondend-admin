import { Navigate } from "react-router-dom";
import { useAuth } from "./Context/AuthContext";
import Menu from "./Components/Menu";
import { Card, CardContent, Typography, Button, Stack, Grid, Box } from "@mui/material";
import { useState, useEffect } from "react";
import api from "./services/apiService";
import MissaCardHome from "./Components/MissaCardHome";

const Home = () => {
  const { isAuthenticated } = useAuth();
  const [data, setData] = useState({
    quantidadesIgrejas: 0,
    quantidadeMissas: 0,
  });

  const fetchData = () => {
    api
      .get("/api/admin/igreja/infos")
      .then((response) => {
        setData(response.data.data);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    api
      .get("/api/admin/igreja/infos")
      .then((response) => {
        setData(response.data.data);
        //console.log(response.data.data);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  }, []);

  // Se não estiver autenticado, redireciona para a página de login
  if (!isAuthenticated) {
    return <Navigate to="/" />;
  }

  return (
    <Menu>
      <Stack spacing={3} sx={{ width: "100%" }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 2 }}>
          <Typography variant="h5" fontWeight={700} color="text.primary">
            Dashboard
          </Typography>
          <Button variant="contained" color="primary" onClick={fetchData} size="medium">
            Atualizar dados
          </Button>
        </Box>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={4}>
            <Card sx={{ height: "100%" }}>
              <CardContent sx={{ "&:last-child": { pb: 2 } }}>
                <Typography variant="body2" color="text.secondary" gutterBottom fontWeight={500}>
                  Igrejas
                </Typography>
                <Typography variant="h4" fontWeight={700} color="primary.main">
                  {data.quantidadesIgrejas ?? "—"}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Card sx={{ height: "100%" }}>
              <CardContent sx={{ "&:last-child": { pb: 2 } }}>
                <Typography variant="body2" color="text.secondary" gutterBottom fontWeight={500}>
                  Missas
                </Typography>
                <Typography variant="h4" fontWeight={700} color="secondary.main">
                  {data.quantidadeMissas ?? "—"}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Card sx={{ height: "100%" }}>
              <CardContent sx={{ "&:last-child": { pb: 2 } }}>
                <Typography variant="body2" color="text.secondary" gutterBottom fontWeight={500}>
                  Denúncias não atendidas
                </Typography>
                <Typography variant="h4" fontWeight={700} color="primary.main">
                  {data.quantidadeIgrejaDenunciaNaoAtendida ?? "—"}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Card sx={{ height: "100%" }}>
              <CardContent sx={{ "&:last-child": { pb: 2 } }}>
                <Typography variant="body2" color="text.secondary" gutterBottom fontWeight={500}>
                  Solicitações não atendidas
                </Typography>
                <Typography variant="h4" fontWeight={700} color="primary.main">
                  {data.quantidadeSolicitacoesNaoAtendida ?? "—"}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Card sx={{ height: "100%" }}>
              <CardContent sx={{ "&:last-child": { pb: 2 } }}>
                <Typography variant="body2" color="text.secondary" gutterBottom fontWeight={500}>
                  Usuários
                </Typography>
                <Typography variant="h4" fontWeight={700} color="primary.main">
                  {data.quantidadeDeUsuarios ?? "—"}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom fontWeight={600}>
              Texto para divulgar o Busca Missa
            </Typography>
            <MissaCardHome
              churchesCount={data.quantidadesIgrejas}
              massesCount={data.quantidadeMissas}
            />
          </CardContent>
        </Card>
      </Stack>
    </Menu>
  );
};

export default Home;
