/* eslint-disable react/prop-types */
import { useState, useEffect } from "react";
import { Box, TextField, MenuItem, FormControl, InputLabel, Select, Switch, FormControlLabel, Button, Autocomplete } from "@mui/material";
import Grid from "@mui/material/Grid2";
import api from "../services/apiService";
import { IconButton, Tooltip } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import { useNavigate } from "react-router-dom";
import { diaDaSemana, ufs } from "../utils";
import ErrorSpan from "../ErrorSpan";

const IgrejaSearchForm = ({
  onDataChange,
  onLoadingChange,
  onPaginationChange,
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
  const [formData, setFormData] = useState({
    uf: "",
    localidade: "",
    nome: "",
    diaSemana: "",
    horario: "",
    ativo: true,
    denuncia: false,
  });

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
    // Restaurar filtros e preferências do localStorage ao montar
    const savedFilters = localStorage.getItem("igrejaSearchFilters");
    const savedAutoLoad = localStorage.getItem("igrejaAutoLoadEnabled");
    
    if (savedAutoLoad !== null) {
      setAutoLoadEnabled(JSON.parse(savedAutoLoad));
    }
    
    if (savedFilters) {
      try {
        const parsed = JSON.parse(savedFilters);
        setFormData(parsed);
        // Se houver um UF salvo, atualizar localidades também
        if (parsed.uf && enderecosMap[parsed.uf]) {
          const cidades = Object.keys(enderecosMap[parsed.uf]);
          setLocalidades(cidades);
        }
      } catch (err) {
        console.warn("Erro ao restaurar filtros:", err);
      }
    }
  }, [enderecosMap]);

  // Executar busca automaticamente se autoLoad estiver ativado
  useEffect(() => {
    if (autoLoadEnabled && !hasAutoLoaded && ufsOptions.length > 0) {
      const savedFilters = localStorage.getItem("igrejaSearchFilters");
      if (savedFilters) {
        try {
          const parsed = JSON.parse(savedFilters);
          // Se houver algum filtro significativo, executar busca
          if (parsed.uf || parsed.nome || parsed.diaSemana) {
            setHasAutoLoaded(true);
            setTimeout(() => handleSearch(), 300);
          }
        } catch (err) {
          console.warn("Erro ao executar busca automática:", err);
        }
      }
    }
  }, [autoLoadEnabled, ufsOptions]);

  useEffect(() => {
    // Busca o mapa de endereços (UF -> Cidades -> Bairros)
    api
      .get(`/api/v1/Igreja/v2/obter-enderecos`)
      .then((response) => {
        const data = response.data?.data || {};
        setEnderecosMap(data);
        setUfsOptions(Object.keys(data));
      })
      .catch((err) => {
        console.warn("Não foi possível carregar endereços:", err);
      });
  }, []);

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

  const handleSearch = () => {

    onLoadingChange && onLoadingChange(true);

    let endPoint = `/api/v1/admin/igreja/buscar-por-filtro?`;

    if (formData.ativo !== "") 
      endPoint += `ativo=${formData.ativo}`;
    if (formData.uf !== "")
      endPoint += `&uf=${formData.uf}`;
    if (formData.localidade !== "")
      endPoint += `&localidade=${formData.localidade}`;
    if (formData.nome !== "") 
      endPoint += `&nome=${formData.nome}`;
    if (formData.diaSemana !== "")
      endPoint += `&diadasemana=${formData.diaSemana}`;
    if (formData.horario !== "") endPoint += `&horario=${formData.horario}`;
    if (formData.denuncia !== "") endPoint += `&denuncia=${formData.denuncia}`;

    let paginacao = `&Paginacao.PageIndex=1&Paginacao.PageSize=10`;
    endPoint += paginacao;

    if (formData.localidade === "")
      resetLocalidades();

    api
      .get(endPoint)
      .then((response) => {
        //console.log(response.data.data)
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
        localStorage.setItem("igrejaSearchFilters", JSON.stringify(formData));
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
    const defaultFilters = {
      uf: "",
      localidade: "",
      nome: "",
      diaSemana: "",
      horario: "",
      ativo: true,
      denuncia: false,
    };
    setFormData(defaultFilters);
    localStorage.removeItem("igrejaSearchFilters");
    resetLocalidades();
    setHasAutoLoaded(false);
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
          <Grid size={5}>
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
          <Grid size={6}>
            <TextField
              label="Nome"
              value={formData.nome}
              onChange={(e) => handleChange("nome", e.target.value)}
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
          <Grid>
            <FormControlLabel
              control={
                <Switch
                  checked={formData.ativo}
                  onChange={(e) => handleChange("ativo", e.target.checked)}
                />
              }
              label="Ativo"
            />
          </Grid>
          <Grid>
            <FormControlLabel
              control={
                <Switch
                  checked={formData.denuncia}
                  onChange={(e) => handleChange("denuncia", e.target.checked)}
                />
              }
              label="Denuncia"
            />
          </Grid>
          <Grid>
            <Box display="flex" gap={1} alignItems="center">
              <Tooltip title="Buscar">
                <IconButton color="default" onClick={handleSearch}>
                  <SearchIcon />
                </IconButton>
              </Tooltip>
              <FormControlLabel
                control={
                  <Switch
                    size="small"
                    checked={autoLoadEnabled}
                    onChange={(e) => setAutoLoadEnabled(e.target.checked)}
                  />
                }
                label="Auto-carregar"
              />
              <Tooltip title="Limpar Filtros">
                <IconButton color="error" onClick={handleClearFilters}>
                  <ClearIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Novo">
                <IconButton
                  color="primary"
                  onClick={() => handleNavigate("/igrejaNovo")}
                >
                  <AddIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </Grid>
        </Grid>
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
