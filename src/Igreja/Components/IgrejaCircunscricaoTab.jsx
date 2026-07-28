/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import api from "../../services/apiService";
import ErrorSpan from "../../ErrorSpan";

const ORIGEM_LABEL = {
  Nenhuma: null,
  Direta: { label: "Vínculo direto", color: "primary" },
  Herdada: { label: "Herdada da paróquia-sede", color: "default" },
};

const IgrejaCircunscricaoTab = ({ igrejaId }) => {
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [efetiva, setEfetiva] = useState(null);

  const [dioceses, setDioceses] = useState([]);
  const [arquidioceses, setArquidioceses] = useState([]);
  const [tipo, setTipo] = useState("diocese"); // "diocese" | "arquidiocese"
  const [dioceseId, setDioceseId] = useState("");
  const [arquidioceseId, setArquidioceseId] = useState("");

  const carregar = () => {
    if (!igrejaId) return;
    setLoading(true);
    setErro("");

    Promise.all([
      api.get(`/api/v1/admin/igreja/${igrejaId}/diocese`),
      api.get(`/api/v1/admin/dioceses`),
      api.get(`/api/v1/admin/arquidioceses`),
    ])
      .then(([respEfetiva, respDioceses, respArquidioceses]) => {
        const dados = respEfetiva.data?.data;
        setEfetiva(dados);
        setDioceses(respDioceses.data?.data || []);
        setArquidioceses(respArquidioceses.data?.data || []);

        if (dados?.dioceseId) {
          setTipo("diocese");
          setDioceseId(dados.dioceseId);
          setArquidioceseId("");
        } else if (dados?.arquidioceseId) {
          setTipo("arquidiocese");
          setArquidioceseId(dados.arquidioceseId);
          setDioceseId("");
        } else {
          setTipo("diocese");
          setDioceseId("");
          setArquidioceseId("");
        }
      })
      .catch(() => {
        setErro("Não foi possível carregar a circunscrição desta igreja.");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    carregar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [igrejaId]);

  const handleSalvar = () => {
    const body =
      tipo === "diocese" ? { dioceseId, arquidioceseId: null } : { dioceseId: null, arquidioceseId };

    if (!body.dioceseId && !body.arquidioceseId) {
      setErro("Selecione uma diocese ou uma arquidiocese.");
      return;
    }

    setSalvando(true);
    setErro("");
    setMensagem("");
    api
      .put(`/api/v1/admin/igreja/${igrejaId}/diocese`, body)
      .then(() => {
        setMensagem("Circunscrição vinculada com sucesso!");
        carregar();
      })
      .catch((error) => {
        setErro(error.response?.data?.data || "Não foi possível vincular.");
      })
      .finally(() => setSalvando(false));
  };

  const handleRemover = () => {
    setSalvando(true);
    setErro("");
    setMensagem("");
    api
      .delete(`/api/v1/admin/igreja/${igrejaId}/diocese`)
      .then(() => {
        setMensagem("Vínculo removido com sucesso!");
        carregar();
      })
      .catch(() => {
        setErro("Não foi possível remover o vínculo.");
      })
      .finally(() => setSalvando(false));
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" sx={{ py: 6 }}>
        <CircularProgress />
      </Box>
    );
  }

  const origemInfo = efetiva?.origem ? ORIGEM_LABEL[efetiva.origem] : null;

  return (
    <Box
      sx={{
        margin: "0 auto",
        padding: 2,
        border: "1px solid #ccc",
        borderRadius: 2,
        width: "100%",
        boxSizing: "border-box",
      }}
    >
      {erro && (
        <Box sx={{ mb: 2 }}>
          <ErrorSpan errorMessage={erro} severity="error" />
        </Box>
      )}
      {mensagem && (
        <Box sx={{ mb: 2 }}>
          <ErrorSpan errorMessage={mensagem} severity="success" />
        </Box>
      )}

      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="body2" color="text.secondary">
          Circunscrição atual:
        </Typography>
        {efetiva?.dioceseNome ? (
          <Typography variant="body2" fontWeight={600}>
            {efetiva.dioceseNome}
            {efetiva.arquidioceseNome ? ` (Arquidiocese: ${efetiva.arquidioceseNome})` : ""}
          </Typography>
        ) : efetiva?.arquidioceseNome ? (
          <Typography variant="body2" fontWeight={600}>
            {efetiva.arquidioceseNome} (direto)
          </Typography>
        ) : (
          <Typography variant="body2" color="text.secondary">
            Nenhuma
          </Typography>
        )}
        {origemInfo && <Chip label={origemInfo.label} size="small" color={origemInfo.color} />}
      </Stack>

      <ToggleButtonGroup
        value={tipo}
        exclusive
        size="small"
        onChange={(e, novoTipo) => novoTipo && setTipo(novoTipo)}
        sx={{ mb: 2 }}
      >
        <ToggleButton value="diocese">Diocese</ToggleButton>
        <ToggleButton value="arquidiocese">Direto na Arquidiocese</ToggleButton>
      </ToggleButtonGroup>

      <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap" useFlexGap>
        {tipo === "diocese" ? (
          <FormControl size="small" sx={{ minWidth: 280 }}>
            <InputLabel id="diocese-label">Diocese</InputLabel>
            <Select
              labelId="diocese-label"
              label="Diocese"
              value={dioceseId}
              onChange={(e) => setDioceseId(e.target.value)}
            >
              {dioceses.map((d) => (
                <MenuItem key={d.id} value={d.id}>
                  {d.nome} ({d.uf})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        ) : (
          <FormControl size="small" sx={{ minWidth: 280 }}>
            <InputLabel id="arquidiocese-label">Arquidiocese</InputLabel>
            <Select
              labelId="arquidiocese-label"
              label="Arquidiocese"
              value={arquidioceseId}
              onChange={(e) => setArquidioceseId(e.target.value)}
            >
              {arquidioceses.map((a) => (
                <MenuItem key={a.id} value={a.id}>
                  {a.nome} ({a.uf})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}

        <Button variant="contained" onClick={handleSalvar} disabled={salvando}>
          Salvar vínculo
        </Button>
        {efetiva?.origem === "Direta" && (
          <Button variant="outlined" color="error" onClick={handleRemover} disabled={salvando}>
            Remover vínculo
          </Button>
        )}
      </Stack>
    </Box>
  );
};

export default IgrejaCircunscricaoTab;
