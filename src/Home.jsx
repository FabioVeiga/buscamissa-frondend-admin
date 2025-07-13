import { Navigate } from "react-router-dom";
import { useAuth } from "./Context/AuthContext";
import Menu from "./Components/Menu";
import { Card, CardContent, Typography, Grid, Button } from "@mui/material";
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
    <div style={{ display: "flex" }}>
      <Menu />
      <div style={{ flex: 1, overflow: "auto" }}>
        <Grid container spacing={2} style={{ padding: 20, margin: 0, width: "100%" }}>
        <Grid item xs={12}>
          <Button variant="contained" color="primary" onClick={fetchData}>
            Atualizar dados
          </Button>
        </Grid>
        {/* Card for Quantidade de Igrejas */}
        <Grid item xs={12} sm={6}>
          <Card elevation={3}>
            <CardContent>
              <Typography variant="h5" gutterBottom>
                Quantidade de Igrejas
              </Typography>
              <Typography variant="h4" color="primary">
                {data.quantidadesIgrejas}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Card for Quantidade de Missas */}
        <Grid item xs={12} sm={6}>
          <Card elevation={3}>
            <CardContent>
              <Typography variant="h5" gutterBottom>
                Quantidade de Missas
              </Typography>
              <Typography variant="h4" color="secondary">
                {data.quantidadeMissas}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6}>
          <Card elevation={3}>
            <CardContent>
              <Typography variant="h5" gutterBottom>
                Quandidade de Denuncias não atendida
              </Typography>
              <Typography variant="h4" color="primary">
                {data.quantidadeIgrejaDenunciaNaoAtendida}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6}>
          <Card elevation={3}>
            <CardContent>
              <Typography variant="h5" gutterBottom>
                Quandidade de Solicitações não atendida
              </Typography>
              <Typography variant="h4" color="primary">
                {data.quantidadeSolicitacoesNaoAtendida}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6}>
          <Card elevation={3}>
            <CardContent>
              <Typography variant="h5" gutterBottom>
                Quandidade de Usuários
              </Typography>
              <Typography variant="h4" color="primary">
                {data.quantidadeDeUsuarios}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={8}>
          <Card elevation={3}>
            <CardContent>
              <Typography variant="h5" gutterBottom>
                Texto para divulgar o Busca Missa
              </Typography>
              <MissaCardHome
                  churchesCount={data.quantidadesIgrejas}
                  massesCount={data.quantidadeMissas}
                />
            </CardContent>
          </Card>
        </Grid>
      </Grid>   
      </div>
         
    </div>
  );
};

export default Home;
