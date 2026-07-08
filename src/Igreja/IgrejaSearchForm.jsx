/* eslint-disable react/prop-types */
import { useState, useEffect } from "react";
import { Box, TextField, MenuItem, FormControl, InputLabel, Select, Switch, FormControlLabel, Button, Autocomplete, CircularProgress } from "@mui/material";
import Grid from "@mui/material/Grid2";
import api from "../services/apiService";
import { IconButton, Tooltip } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import { useNavigate } from "react-router-dom";
import { diaDaSemana, ufs } from "../utils";
import ErrorSpan from "../ErrorSpan";

const FILTROS_PADRAO = {
  id: "",
  uf: "",
  localidade: "",
  bairro: "",
  cep: "",
  nome: "",
  paroco: "",
  diaSemana: "",
  horario: "",
  ativo: true,
  reportarProblema: false,
  semCoordenadas: false,
};

const IgrejaSearchForm = ({
  onDataChange,
  onLoadingChange,
  onPaginationChange,
  onFiltersChange,
}) => {
  const navigate = useNavigate();

  const handleNavigate = (path) => {
    navigate(path);
  };

  const errorMensage = () => ({
    mensagem: "",
    severity: "",
    show: false,
  });

  const [message, setMessage] = useState(errorMensage);
  const [autoLoadEnabled, setAutoLoadEnabled] = useState(true);
  const [hasAutoLoaded, setHasAutoLoaded] = useState(false);
  const [geoLoading, setGeoLoading] = useState(false);
  const [formData, setFormData] = useState({ ...FILTROS_PADRAO });

  const [localidades, setLocalidades] = useState([]);
  const [enderecosMap, setEnderecosMap] = useState({});
  const [ufsOptions, setUfsOptions] = useState([]);
  const resetLocalidades = () => setLocalidades([]);
  const adicionarLocalidade = (novaLocalidade) => {
    setLocalidades((prevLocalidades) => {
      if (!prevLocalidades.includes(novaLocalidade)) {
        return [...prevLocalidades, novaLocalidade];
      }
      return prevLocalidades;
    });
  };

  useEffect(() => {
    // Busca o mapa de endereços (UF -> Cidades -> Bairros)
    // ignorarCache: no admin precisamos ver imediatamente cidades/bairros recém
    // ajustados, sem esperar o TTL de 10 minutos do cache do backend.
    api
      .get(`/api/v1/Igreja/v2/obter-enderecos`, { params: { ignorarCache: true } })
      .then((response) => {
        const data = response.data?.data || {};
        setEnderecosMap(data);
        setUfsOptions(Object.keys(data));
      })
      .catch((err) => {
        console.warn("Não foi possível carregar endereços:", err);
      });
  }, []);

  // Restaurar filtros do localStorage e disparar busca automática quando aplicável.
  // Tudo num único efeito para evitar a condição de corrida em que handleSearch
  // capturava o formData antigo (antes do restore ser aplicado ao estado).
  useEffect(() => {
    if (ufsOptions.length === 0 || hasAutoLoaded) return;

    const savedAutoLoad = localStorage.getItem("igrejaAutoLoadEnabled");
    const autoLoad = savedAutoLoad !== null ? JSON.parse(savedAutoLoad) : true;
    setAutoLoadEnabled(autoLoad);

    const savedFilters = localStorage.getItem("igrejaSearchFilters");
    if (!savedFilters) {
      setHasAutoLoaded(true);
      return;
    }

    let parsed;
    try {
      parsed = JSON.parse(savedFilters);
    } catch (err) {
      console.warn("Erro ao restaurar filtros:", err);
      setHasAutoLoaded(true);
      return;
    }

    const filtrosCompletos = { ...FILTROS_PADRAO, ...parsed };
    setFormData(filtrosCompletos);

    if (filtrosCompletos.uf && enderecosMap[filtrosCompletos.uf]) {
      setLocalidades(Object.keys(enderecosMap[filtrosCompletos.uf]));
    }

    setHasAutoLoaded(true);

    if (
      autoLoad &&
      (filtrosCompletos.uf ||
        filtrosCompletos.nome ||
        filtrosCompletos.diaSemana ||
        filtrosCompletos.cep ||
        filtrosCompletos.id)
    ) {
      // Passa os filtros restaurados diretamente, sem depender do estado
      // (que ainda não foi re-renderizado neste mesmo ciclo de efeitos).
      handleSearch(filtrosCompletos);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ufsOptions, enderecosMap, hasAutoLoaded]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (field === "uf") {
      // Atualiza as localidades (cidades) baseado no mapa de endereços
      const cidades = enderecosMap[value]
        ? Object.keys(enderecosMap[value])
        : [];
      setLocalidades(cidades);
      // limpa localidade selecionada quando UF muda
      setFormData((prev) => ({ ...prev, localidade: "" }));
    }
  };

  const handleSearch = (filtrosOverride) => {
    const filtros = filtrosOverride || formData;

    onLoadingChange && onLoadingChange(true);

    let endPoint = `/api/v1/admin/igreja/buscar-por-filtro?`;

    if (filtros.id !== "") endPoint += `id=${filtros.id}`;
    if (filtros.ativo !== "")
      endPoint += `&ativo=${filtros.ativo}`;
    if (filtros.uf !== "")
      endPoint += `&uf=${filtros.uf}`;
    if (filtros.localidade !== "")
      endPoint += `&localidade=${filtros.localidade}`;
    if (filtros.bairro !== "")
      endPoint += `&bairro=${filtros.bairro}`;
    if (filtros.cep !== "")
      endPoint += `&cep=${filtros.cep}`;
    if (filtros.nome !== "")
      endPoint += `&nome=${filtros.nome}`;
    if (filtros.paroco !== "")
      endPoint += `&paroco=${filtros.paroco}`;
    if (filtros.diaSemana !== "")
      endPoint += `&diadasemana=${filtros.diaSemana}`;
    if (filtros.horario !== "") endPoint += `&horario=${filtros.horario}`;
    if (filtros.reportarProblema !== "") endPoint += `&reportarProblema=${filtros.reportarProblema}`;
    if (filtros.semCoordenadas) endPoint += `&semCoordenadas=true`;

    let paginacao = `&Paginacao.PageIndex=1&Paginacao.PageSize=10`;
    endPoint += paginacao;

    if (onFiltersChange) {
      onFiltersChange(filtros);
    }

    if (filtros.localidade === "")
      resetLocalidades();

    api
      .get(endPoint)
      .then((response) => {
        const fetchedData = response.data.data;
        onDataChange && onDataChange(fetchedData);

        fetchedData.items.forEach(item => {
          adicionarLocalidade(item.endereco.localidade)
        });

        const paginationInfo = {
          pageIndex: fetchedData.pageIndex,
          pageSize: fetchedData.pageSize,
          totalItems: fetchedData.totalItems,
          hasPreviousPage: fetchedData.hasPreviousPage,
          hasNextPage: fetchedData.hasNextPage,
          nextPage: fetchedData.nextPage,
          previousPage: fetchedData.previousPage,
          totalPages: fetchedData.totalPages,
        };

        onPaginationChange && onPaginationChange(paginationInfo);
        // Salvar filtros e preferência de autoLoad no localStorage
        localStorage.setItem("igrejaSearchFilters", JSON.stringify(filtros));
        localStorage.setItem("igrejaAutoLoadEnabled", JSON.stringify(autoLoadEnabled));
        setMessage({});
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        if (error.status === 400) {
          setMessage({
            mensagem: error.response?.data?.errors["Uf"],
            severity: "error",
            show: true,
          });
        }
        onDataChange && onDataChange([]);
      })
      .finally(() => {
        onLoadingChange && onLoadingChange(false);
      });
  };

  const handleClearFilters = () => {
    const defaultFilters = { ...FILTROS_PADRAO };
    setFormData(defaultFilters);
    if (onFiltersChange) {
      onFiltersChange(defaultFilters);
    }
    localStorage.removeItem("igrejaSearchFilters");
    resetLocalidades();
  };

  const handleGeocodificarPendentes = () => {
    setGeoLoading(true);
    api
      .post(`/api/v2/Igreja/geocodificar-pendentes`)
      .then((response) => {
        setMessage({
          mensagem: response.data?.data?.mensagemAplicacao || "Geocodificação concluída com sucesso!",
          severity: "success",
          show: true,
        });
        // Recarregar a busca após geocodificar
        setTimeout(() => handleSearch(), 500);
      })
      .catch((error) => {
        console.error("Erro ao geocodificar igrejas pendentes:", error);
        setMessage({
          mensagem: error.response?.data?.data?.mensagemAplicacao || "Erro ao geocodificar igrejas pendentes.",
          severity: "error",
          show: true,
        });
      })
      .finally(() => {
        setGeoLoading(false);
      });
  };

  return (
    <>
      <Box
        component="form"
        display="flex"
        flexDirection="column"
        gap={2}
        sx={{
          margin: "0 auto",
          padding: 2,
          border: "1px solid #ccc",
          borderRadius: 2,
          width: "100%",
          boxSizing: "border-box", // Garantir que padding e border sejam incluídos nas dimensões
        }}
      >
        <Grid container spacing={2}>
          <Grid size={1}>
            {/* Autocomplete UF */}
            <Autocomplete
              freeSolo
              options={ufsOptions.length > 0 ? ufsOptions : ufs}
              value={formData.uf}
              onChange={(event, newValue) => handleChange("uf", newValue || "")}
              onInputChange={(event, newInputValue) => handleChange("uf", newInputValue)}
              renderInput={(params) => (
                <TextField {...params} label="UF" placeholder="Digite ou selecione" />
              )}
            />
          </Grid>
          <Grid size={4}>
            {/* Autocomplete Localidade */}
            <Autocomplete
              freeSolo
              options={localidades || []}
              value={formData.localidade}
              onChange={(event, newValue) => handleChange("localidade", newValue || "")}
              onInputChange={(event, newInputValue) => handleChange("localidade", newInputValue)}
              renderInput={(params) => (
                <TextField {...params} label="Localidade" placeholder="Digite ou selecione" />
              )}
            />
          </Grid>
          <Grid size={3}>
            <TextField
              label="Bairro"
              value={formData.bairro}
              onChange={(e) => handleChange("bairro", e.target.value)}
              fullWidth
            />
          </Grid>
          <Grid size={4}>
            <TextField
              label="Nome"
              value={formData.nome}
              onChange={(e) => handleChange("nome", e.target.value)}
              fullWidth
            />
          </Grid>
          <Grid size={2}>
            <TextField
              label="Id"
              value={formData.id}
              onChange={(e) => handleChange("id", e.target.value.replace(/\D/g, ""))}
              fullWidth
            />
          </Grid>
          <Grid size={3}>
            <TextField
              label="CEP"
              value={formData.cep}
              onChange={(e) => handleChange("cep", e.target.value)}
              fullWidth
            />
          </Grid>
          <Grid size={3}>
            <TextField
              label="Pároco"
              value={formData.paroco}
              onChange={(e) => handleChange("paroco", e.target.value)}
              fullWidth
            />
          </Grid>
          <Grid size={4}>
            {/* Dia da semana */}
            <FormControl fullWidth>
              <InputLabel id="diaSemana-label">Dia da Semana</InputLabel>
              <Select
                labelId="diaSemana-label"
                value={formData.diaSemana}
                onChange={(e) => handleChange("diaSemana", e.target.value)}
              >
                {/* Opção vazia */}
                <MenuItem value="">
                  <em>Selecione</em>
                </MenuItem>
                {/* Dias da semana */}
                {[0, 1, 2, 3, 4, 5, 6].map((dia) => (
                  <MenuItem key={dia} value={dia}>
                    {diaDaSemana(dia)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid size={4}>
            <TextField
              label="Horário"
              type="time"
              value={formData.horario}
              onChange={(e) => handleChange("horario", e.target.value)}
              fullWidth
              InputLabelProps={{ shrink: true }}
              inputProps={{
                step: 300, // Opcional: Incremento em segundos (300 = 5 minutos)
              }}
            />
          </Grid>
        </Grid>

        <Box
          display="flex"
          flexWrap="wrap"
          alignItems="center"
          justifyContent="space-between"
          gap={2}
          sx={{
            pt: 1.5,
            mt: 0.5,
            borderTop: "1px solid",
            borderColor: "divider",
          }}
        >
          <Box display="flex" flexWrap="wrap" alignItems="center" gap={2}>
            <FormControlLabel
              control={
                <Switch
                  checked={formData.ativo}
                  onChange={(e) => handleChange("ativo", e.target.checked)}
                />
              }
              label="Ativo"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={formData.reportarProblema}
                  onChange={(e) => handleChange("reportarProblema", e.target.checked)}
                />
              }
              label="Problema reportado"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={formData.semCoordenadas}
                  onChange={(e) => handleChange("semCoordenadas", e.target.checked)}
                />
              }
              label="Sem coordenadas"
            />
          </Box>

          <Box display="flex" flexWrap="wrap" alignItems="center" gap={1.5}>
            <FormControlLabel
              control={
                <Switch
                  size="small"
                  checked={autoLoadEnabled}
                  onChange={(e) => {
                    setAutoLoadEnabled(e.target.checked);
                    localStorage.setItem("igrejaAutoLoadEnabled", JSON.stringify(e.target.checked));
                  }}
                />
              }
              label="Auto-carregar"
            />

            <Tooltip title="Limpar Filtros">
              <IconButton color="error" onClick={handleClearFilters}>
                <ClearIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Geocodificar Pendentes">
              <IconButton
                color="success"
                onClick={handleGeocodificarPendentes}
                disabled={geoLoading}
              >
                {geoLoading ? <CircularProgress size={24} /> : <LocationOnIcon />}
              </IconButton>
            </Tooltip>
            <Tooltip title="Nova Igreja">
              <IconButton
                color="primary"
                onClick={() => handleNavigate("/igrejaNovo")}
              >
                <AddIcon />
              </IconButton>
            </Tooltip>

            <Button
              variant="contained"
              color="primary"
              size="large"
              startIcon={<SearchIcon />}
              onClick={() => handleSearch()}
              sx={{ ml: 0.5 }}
            >
              Buscar
            </Button>
          </Box>
        </Box>
      </Box>
      <Box display="flex">
        {message.show && (
          <ErrorSpan
            errorMessage={message.mensagem}
            severity={message.severity}
          />
        )}
      </Box>
    </>
  );
};

export default IgrejaSearchForm;
