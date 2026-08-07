/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import {
  Autocomplete,
  Box,
  Button,
  Chip,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import api from "../../services/apiService";
import ErrorSpan from "../../ErrorSpan";

// Espelha Dtos/DioceseDtos.cs OrigemDioceseEfetiva do backend — serializado
// como número (sem JsonStringEnumConverter), não como nome do enum.
const ORIGEM_NENHUMA = 0;
const ORIGEM_DIRETA = 1;
const ORIGEM_HERDADA = 2;

const ORIGEM_LABEL = {
  [ORIGEM_NENHUMA]: null,
  [ORIGEM_DIRETA]: { label: "Vínculo direto", color: "primary" },
  [ORIGEM_HERDADA]: { label: "Herdada da paróquia-sede", color: "default" },
};

const IgrejaCircunscricaoTab = ({ igrejaId }) => {
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [efetiva, setEfetiva] = useState(null);
  const [capelas, setCapelas] = useState([]);

  const [dioceses, setDioceses] = useState([]);
  const [arquidioceses, setArquidioceses] = useState([]);
  const [tipo, setTipo] = useState("diocese"); // "diocese" | "arquidiocese"
  const [dioceseSelecionada, setDioceseSelecionada] = useState(null);
  const [arquidioceseSelecionada, setArquidioceseSelecionada] = useState(null);

  const carregar = () => {
    if (!igrejaId) return;
    setLoading(true);
    setErro("");

    Promise.all([
      api.get(`/api/v1/admin/igreja/${igrejaId}/diocese`),
      api.get(`/api/v1/admin/dioceses`),
      api.get(`/api/v1/admin/arquidioceses`),
      api.get(`/api/v1/admin/igreja/${igrejaId}/capelas`),
    ])
      .then(([respEfetiva, respDioceses, respArquidioceses, respCapelas]) => {
        const dados = respEfetiva.data?.data;
        setEfetiva(dados);
        setDioceses(respDioceses.data?.data || []);
        setArquidioceses(respArquidioceses.data?.data || []);
        setCapelas(respCapelas.data?.data || []);

        const listaDioceses = respDioceses.data?.data || [];
        const listaArquidioceses = respArquidioceses.data?.data || [];

        if (dados?.dioceseId) {
          setTipo("diocese");
          setDioceseSelecionada(listaDioceses.find((d) => d.id === dados.dioceseId) || null);
          setArquidioceseSelecionada(null);
        } else if (dados?.arquidioceseId) {
          setTipo("arquidiocese");
          setArquidioceseSelecionada(listaArquidioceses.find((a) => a.id === dados.arquidioceseId) || null);
          setDioceseSelecionada(null);
        } else {
          setTipo("diocese");
          setDioceseSelecionada(null);
          setArquidioceseSelecionada(null);
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
      tipo === "diocese"
        ? { dioceseId: dioceseSelecionada?.id ?? null, arquidioceseId: null }
        : { dioceseId: null, arquidioceseId: arquidioceseSelecionada?.id ?? null };

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
      <Box display="flex" justifyContent="center" alignItems="center" sx={{ py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  const origemInfo = efetiva?.origem ? ORIGEM_LABEL[efetiva.origem] : null;

  return (
    <Box>
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
        {efetiva?.origem === ORIGEM_DIRETA && (
          <Button variant="outlined" color="error" size="small" onClick={handleRemover} disabled={salvando}>
            Remover vínculo
          </Button>
        )}
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

      <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap" useFlexGap sx={{ mb: 3 }}>
        {tipo === "diocese" ? (
          <Autocomplete
            sx={{ minWidth: 320 }}
            size="small"
            options={dioceses}
            getOptionLabel={(d) => `${d.nome} (${d.uf})`}
            isOptionEqualToValue={(a, b) => a.id === b.id}
            value={dioceseSelecionada}
            onChange={(e, novoValor) => setDioceseSelecionada(novoValor)}
            renderInput={(params) => <TextField {...params} label="Diocese" placeholder="Digite para buscar" />}
          />
        ) : (
          <Autocomplete
            sx={{ minWidth: 320 }}
            size="small"
            options={arquidioceses}
            getOptionLabel={(a) => `${a.nome} (${a.uf})`}
            isOptionEqualToValue={(a, b) => a.id === b.id}
            value={arquidioceseSelecionada}
            onChange={(e, novoValor) => setArquidioceseSelecionada(novoValor)}
            renderInput={(params) => <TextField {...params} label="Arquidiocese" placeholder="Digite para buscar" />}
          />
        )}

        <Button variant="contained" onClick={handleSalvar} disabled={salvando}>
          Salvar vínculo
        </Button>
      </Stack>

      <Typography variant="subtitle2" sx={{ mb: 1 }}>
        Capelas / comunidades vinculadas
      </Typography>
      {capelas.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          Nenhuma capela/comunidade vinculada a esta paróquia.
        </Typography>
      ) : (
        <List dense disablePadding>
          {capelas.map((c) => (
            <ListItem key={c.id} disableGutters>
              <ListItemText
                primary={c.nome}
                secondary={c.tipoIgreja}
              />
              {c.deletada && <Chip label="Excluída" size="small" color="error" sx={{ mr: 1 }} />}
              {!c.ativo && <Chip label="Inativa" size="small" />}
            </ListItem>
          ))}
        </List>
      )}
    </Box>
  );
};

export default IgrejaCircunscricaoTab;
