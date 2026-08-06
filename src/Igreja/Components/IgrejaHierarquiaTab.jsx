/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import {
  Autocomplete,
  Box,
  Button,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import api from "../../services/apiService";
import ErrorSpan from "../../ErrorSpan";
import { TIPOS_IGREJA } from "../constants/tiposIgreja";

const IgrejaHierarquiaTab = ({ igrejaId, uf }) => {
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");
  const [mensagem, setMensagem] = useState("");

  const [tipoIgreja, setTipoIgreja] = useState(1);
  const [paroquiaPai, setParoquiaPai] = useState(null);
  const [opcoesParoquia, setOpcoesParoquia] = useState([]);
  const [buscandoParoquia, setBuscandoParoquia] = useState(false);

  const carregar = () => {
    if (!igrejaId) return;
    setLoading(true);
    setErro("");
    api
      .get(`/api/v1/admin/igreja/${igrejaId}/hierarquia`)
      .then((response) => {
        const dados = response.data?.data;
        setTipoIgreja(dados?.tipoIgreja ?? 1);
        setParoquiaPai(
          dados?.igrejaPaiId ? { id: dados.igrejaPaiId, nome: dados.igrejaPaiNome } : null
        );
      })
      .catch(() => setErro("Não foi possível carregar a hierarquia desta igreja."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    carregar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [igrejaId]);

  const buscarParoquias = (nome) => {
    if (!nome || nome.trim().length < 3) {
      setOpcoesParoquia([]);
      return;
    }
    setBuscandoParoquia(true);
    const params = { nome: nome.trim(), ativo: true, "Paginacao.PageIndex": 1, "Paginacao.PageSize": 20 };
    if (uf) params.uf = uf;
    api
      .get(`/api/v1/admin/igreja/buscar-por-filtro`, { params })
      .then((response) => {
        const itens = response.data?.data?.items || [];
        setOpcoesParoquia(
          itens
            .filter((i) => i.id !== igrejaId)
            .map((i) => ({ id: i.id, nome: i.nome, uf: i.endereco?.uf, cidade: i.endereco?.localidade }))
        );
      })
      .catch(() => setOpcoesParoquia([]))
      .finally(() => setBuscandoParoquia(false));
  };

  const handleSalvar = () => {
    setSalvando(true);
    setErro("");
    setMensagem("");
    api
      .put(`/api/v1/admin/igreja/${igrejaId}/hierarquia`, {
        tipoIgreja,
        igrejaPaiId: tipoIgreja === 1 ? null : paroquiaPai?.id ?? null,
      })
      .then(() => {
        setMensagem("Hierarquia atualizada com sucesso!");
        carregar();
      })
      .catch((error) => {
        setErro(error.response?.data?.data || "Não foi possível salvar.");
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

      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Corrige o tipo da unidade e, opcionalmente, a paróquia-sede. Útil pra registros
        antigos importados como Paróquia por padrão. A paróquia-sede não é obrigatória —
        deixe em branco se a unidade não depende de nenhuma paróquia.
      </Typography>

      <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap" useFlexGap>
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel id="tipo-igreja-label">Tipo</InputLabel>
          <Select
            labelId="tipo-igreja-label"
            label="Tipo"
            value={tipoIgreja}
            onChange={(e) => {
              setTipoIgreja(e.target.value);
              if (e.target.value === 1) setParoquiaPai(null);
            }}
          >
            {TIPOS_IGREJA.map((t) => (
              <MenuItem key={t.valor} value={t.valor}>
                {t.nome}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {tipoIgreja !== 1 && (
          <Autocomplete
            sx={{ minWidth: 380 }}
            size="small"
            options={opcoesParoquia}
            loading={buscandoParoquia}
            getOptionLabel={(p) => `${p.nome}${p.cidade ? ` — ${p.cidade}/${p.uf}` : ""} (#${p.id})`}
            renderOption={(props, p) => (
              <li {...props} key={p.id}>
                {p.nome} — {p.cidade}/{p.uf}{" "}
                <Typography component="span" variant="caption" color="text.secondary" sx={{ ml: 0.5 }}>
                  (ID {p.id})
                </Typography>
              </li>
            )}
            isOptionEqualToValue={(a, b) => a.id === b.id}
            value={paroquiaPai}
            onChange={(e, novoValor) => setParoquiaPai(novoValor)}
            onInputChange={(e, novoTexto) => buscarParoquias(novoTexto)}
            renderInput={(params) => (
              <TextField {...params} label="Paróquia-sede" placeholder="Digite o nome (mín. 3 letras)" />
            )}
          />
        )}

        <Button variant="contained" onClick={handleSalvar} disabled={salvando}>
          Salvar hierarquia
        </Button>
      </Stack>
    </Box>
  );
};

export default IgrejaHierarquiaTab;
