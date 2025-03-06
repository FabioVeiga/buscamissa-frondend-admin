import { Navigate } from "react-router-dom";
import { useAuth } from "./Context/AuthContext";
import Menu from "./Components/Menu";
import { Card, CardContent, Typography, Grid } from "@mui/material";
import { useState, useEffect } from "react";
import api from "./services/apiService";

const Home = () => {
  const { isAuthenticated } = useAuth();
  const [data, setData] = useState({ quantidadesIgrejas: 0, quantidadeMissas: 0 });

  useEffect(() => {
    api.get('/api/admin/igreja/infos')
      .then(response => {
        setData(response.data.data);
      })
      .catch(error => {
        console.error('Error fetching data:', error);
      });
    
  }, []);

  // Se não estiver autenticado, redireciona para a página de login
  if (!isAuthenticated) {
    return <Navigate to="/" />;
  }

  return (
    <div style={{ display: "flex" }}>
      <Menu />
      <Grid container spacing={2} style={{ padding: "20px" }}>
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
        </Grid>
    </div>
  );
};

export default Home;
