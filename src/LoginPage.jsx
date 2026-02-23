import { useState } from "react";
import {
  TextField,
  Button,
  Box,
  Typography,
  Paper,
  InputAdornment,
  IconButton,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import ErrorSpan from "./ErrorSpan";
import ErrorBoundary from "./ErrorBoundary";
import { useAuth } from "./Context/AuthContext";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { login, isAuthenticated, error } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    await login(email, senha);
    if (isAuthenticated) {
      navigate("/home");
    }
  };

  return (
    <ErrorBoundary>
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 50%, #f8fafc 100%)",
          p: 2,
        }}
      >
        <Paper
          elevation={0}
          sx={{
            maxWidth: 420,
            width: "100%",
            p: { xs: 3, sm: 4 },
            borderRadius: 3,
            boxShadow: "0 8px 40px rgba(0,0,0,0.08)",
            border: "1px solid",
            borderColor: "divider",
          }}
        >
          <Box sx={{ textAlign: "center", mb: 3 }}>
            <Typography variant="h5" fontWeight={700} color="primary.main" gutterBottom>
              Busca Missa
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Painel de administração
            </Typography>
          </Box>

          <Box component="form" onSubmit={handleLogin} noValidate>
            <TextField
              label="Email"
              type="email"
              variant="outlined"
              fullWidth
              margin="normal"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailOutlinedIcon color="action" />
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 1.5 }}
            />
            <TextField
              label="Senha"
              type={showPassword ? "text" : "password"}
              variant="outlined"
              fullWidth
              margin="normal"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
              autoComplete="current-password"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockOutlinedIcon color="action" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                      size="small"
                    >
                      {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 2 }}
            />

            {error && <ErrorSpan errorMessage={error?.mensagemTela} severity="error" />}
            {error &&
              error?.Email?.map((item, i) => (
                <ErrorSpan key={`email-${i}`} errorMessage={item} severity="error" />
              ))}
            {error &&
              error?.Senha?.map((item, i) => (
                <ErrorSpan key={`senha-${i}`} errorMessage={item} severity="error" />
              ))}

            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              size="large"
              sx={{ mt: 2, py: 1.5, fontWeight: 600 }}
            >
              Entrar
            </Button>
          </Box>
        </Paper>
      </Box>
    </ErrorBoundary>
  );
};

export default LoginPage;
