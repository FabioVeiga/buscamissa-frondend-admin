/* eslint-disable react/prop-types */
import { useState } from "react";
import { Box, TextField, MenuItem, FormControl, InputLabel, Select, Switch, FormControlLabel } from "@mui/material";
import Grid from "@mui/material/Grid2";
import api from "../services/apiService";
import { IconButton, Tooltip } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
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
  const resetLocalidades = () => setLocalidades([]);
  const adicionarLocalidade = (novaLocalidade) => {
    setLocalidades((prevLocalidades) => {
      if (!prevLocalidades.includes(novaLocalidade)) {
        return [...prevLocalidades, novaLocalidade];
      }
      return prevLocalidades;
    });
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSearch = () => {

    onLoadingChange && onLoadingChange(true);

    let endPoint = `/api/admin/igreja/buscar-por-filtro?`;

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
            {/* Dropdown UF */}
            <FormControl fullWidth>
              <InputLabel id="uf-label">UF</InputLabel>
              <Select
                labelId="uf-label"
                value={formData.uf}
                onChange={(e) => handleChange("uf", e.target.value)}
              >
                {ufs.map((uf) => (
                  <MenuItem key={uf} value={uf}>
                    {uf.toUpperCase()}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid size={5}>
            <FormControl fullWidth>
              <InputLabel id="localidade-label">Localidade</InputLabel>
              <Select
                labelId="localidade-label"
                value={formData.localidade}
                onChange={(e) => handleChange("localidade", e.target.value)}
              >
                 <MenuItem value="">
                  <em>Selecione uma localidade</em>
                </MenuItem>
                {localidades?.length > 0 && localidades.map((item) => (
                  <MenuItem key={item} value={item}>
                    {item}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
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
            <Box display="flex" justifyContent="space-between">
              <Tooltip title="Buscar">
                <IconButton color="default" onClick={handleSearch}>
                  <SearchIcon />
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
