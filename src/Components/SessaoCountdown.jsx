/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import { Typography } from "@mui/material";
import { useAuth } from "../Context/AuthContext";

const formatarRestante = (ms) => {
  if (ms <= 0) return "00:00";
  const totalSegundos = Math.floor(ms / 1000);
  const horas = Math.floor(totalSegundos / 3600);
  const minutos = Math.floor((totalSegundos % 3600) / 60);
  const segundos = totalSegundos % 60;
  const mm = String(minutos).padStart(2, "0");
  const ss = String(segundos).padStart(2, "0");
  return horas > 0 ? `${horas}:${mm}:${ss}` : `${mm}:${ss}`;
};

// Contador regressivo até a expiração do token (localStorage.user.acessToken.expira),
// já preenchido pelo backend no login. Desloga automaticamente ao zerar.
const SessaoCountdown = ({ compacto = false }) => {
  const { user, logout } = useAuth();
  const [restante, setRestante] = useState(null);

  const expiraEm = user?.acessToken?.expira;

  useEffect(() => {
    if (!expiraEm) {
      setRestante(null);
      return;
    }

    const expiraTimestamp = new Date(expiraEm).getTime();

    const atualizar = () => {
      const diff = expiraTimestamp - Date.now();
      setRestante(diff);
      if (diff <= 0) {
        logout();
      }
    };

    atualizar();
    const intervalo = setInterval(atualizar, 1000);
    return () => clearInterval(intervalo);
  }, [expiraEm, logout]);

  if (restante === null) return null;

  const critico = restante <= 5 * 60 * 1000; // últimos 5 minutos

  return (
    <Typography
      variant="caption"
      sx={{
        color: critico ? "#fca5a5" : "rgba(255,255,255,0.7)",
        display: "block",
        textAlign: compacto ? "left" : "center",
      }}
    >
      {compacto ? formatarRestante(restante) : `Sessão expira em ${formatarRestante(restante)}`}
    </Typography>
  );
};

export default SessaoCountdown;
