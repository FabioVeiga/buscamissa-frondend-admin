import { useState } from "react";
import { TextField, Button, Box, Typography, Container } from "@mui/material";
import { useNavigate } from "react-router-dom";
import ErrorSpan from "./ErrorSpan";
import ErrorBoundary from "./ErrorBoundary";
import { useAuth } from "./Context/AuthContext";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const navigate = useNavigate();
  const { login, isAuthenticated, error } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    
    await login(email, senha)
      if(isAuthenticated){
        navigate("/Home")
      }
  };

  return (
    <ErrorBoundary>
      <Container maxWidth="sm">
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          minHeight="100vh"
        >
          <Typography variant="h4" component="h1" gutterBottom>
            Login
          </Typography>
          <Box component="form" width="100%" noValidate>
            <TextField
              label="Email"
              variant="outlined"
              fullWidth
              margin="normal"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <TextField
              label="Senha"
              type="password"
              variant="outlined"
              fullWidth
              margin="normal"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
            />
            {error && <ErrorSpan errorMessage={error?.mensagemTela} severity={"error"} />}

            {error &&
              error?.Email?.map((item) => {
                // eslint-disable-next-line react/jsx-key
                return <ErrorSpan errorMessage={item} severity={"error"} />;
              })
            }

            {error &&
              error?.Senha?.map((item) => {
                // eslint-disable-next-line react/jsx-key
                return <ErrorSpan errorMessage={item} severity={"error"} />;
              })
            }
            
            <Button
              variant="contained"
              color="primary"
              fullWidth
              onClick={handleLogin}
              style={{ marginTop: "16px" }}
            >
              Logar
            </Button>
          </Box>
        </Box>
      </Container>
    </ErrorBoundary>
  );
};

export default LoginPage;
