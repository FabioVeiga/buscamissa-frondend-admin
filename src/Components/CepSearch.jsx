import { useState } from "react";
import { Box, TextField, Button } from "@mui/material";
import Grid from "@mui/material/Grid2";
import api from "../services/apiService";
import ErrorSpan from "../ErrorSpan";
import { useEndereco } from "../Context/EnderecoContext";
import { isCepValid } from "../utils";
//import { useNavigate } from "react-router-dom";
import RedirectModal from "../Components/RedirectModal";

const errorMensage = () => ({
  mensagem: "",
  severity: "",
});

const BuscaPorCEP = () => {
  const [cep, setCep] = useState("");
  const [row, setRow] = useState({});
  const { endereco, setEndereco, resetEndereco } = useEndereco();

  const [message, setMessage] = useState(errorMensage);
  const [showModal, setShowModal] = useState(false);
  //const navigate = useNavigate()

  const handleBuscaCEP = () => {
    if (!cep || !isCepValid(cep)) {
      setMessage({
        mensagem: "CEP invalido ou vazio",
        severity: "error",
      });
      resetEndereco();
      return;
    }

    api
      .get(`/api/Igreja/buscar-por-cep?cep=${cep}`)
      .then((response) => {
        const data = response.data?.data;
        if (data) {
          setRow(data.response);
          setEndereco(data.response.endereco);
          setShowModal(true);

          setMessage({
            mensagem: "Tem igreja, redirecionar para editar!",
            severity: "info",
          });
        } else {
          setMessage({
            mensagem: "Nenhum endereço encontrado para este CEP.",
            severity: "error",
          });
        }
      })
      .catch((error) => {
        const data = error.response.data?.data;
        setEndereco(data.endereco);
        setMessage({
          mensagem:
            "Não há igreja para este CEP, preencher os dados da igreja!",
          severity: "success",
        });
      });
  };

  return (
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
      {/* Campo para inserir o CEP */}
      <TextField
        label="CEP"
        value={cep}
        onChange={(e) => setCep(e.target.value)}
        fullWidth
        placeholder="Digite o CEP"
      />

      {/* Botão para buscar */}
      <Button variant="contained" color="primary" onClick={handleBuscaCEP}>
        Buscar CEP
      </Button>

      {/* Grid para os campos do endereço */}
      <Grid container spacing={2}>
        {/* Primeira linha */}
        <Grid size={12}>
          <TextField
            disabled={!endereco.logradouro}
            id="outlined-disabled"
            value={endereco.logradouro || ""}
            onChange={(e) =>
              setEndereco((prev) => ({ ...prev, logradouro: e.target.value }))
            }
            fullWidth
          />
        </Grid>

        {/* Segunda linha */}
        <Grid size={7}>
          <TextField
            id="outlined-basic"
            variant="outlined"
            value={endereco.bairro || ""}
            fullWidth
            disabled={!endereco.bairro}
          />
        </Grid>
        <Grid size={5}>
          <TextField 
            value={endereco.localidade || ""} 
            fullWidth 
            disabled={!endereco.localidade}
          />
        </Grid>

        {/* Terceira linha */}
        <Grid size={2}>
          <TextField 
            value={endereco.uf || ""} 
            fullWidth 
            disabled ={!endereco.uf} 
          />
        </Grid>
        <Grid size={10}>
          <TextField 
            value={endereco.estado || ""} 
            fullWidth 
            disabled ={!endereco.estado}
          />
        </Grid>
      </Grid>

      {/* Mensagem da API */}
      {message && (
        <ErrorSpan
          errorMessage={message.mensagem}
          severity={message.severity}
        />
      )}
      {showModal && (
        <RedirectModal
          targetPage="/IgrejaEditar"
          state={row ? { row } : undefined}
        />
      )}
    </Box>
  );
};

export default BuscaPorCEP;
