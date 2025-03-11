import { useState } from "react";
import { Box, TextField, Button } from "@mui/material";
import Grid from "@mui/material/Grid2";
import api from "../services/apiService";
import ErrorSpan from "../ErrorSpan";
import { useEndereco } from "../Context/EnderecoContext";
import { isCepValid } from "../utils";

const errorMensage = () => ({
  mensagem: "",
  severity: "",
});

const BuscaPorCEP = () => {
  const [cep, setCep] = useState("");
  const [complemento, setComplemento] = useState("");
  const { endereco, setEndereco, resetEndereco } = useEndereco();
  const [message, setMessage] = useState(errorMensage);

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
          //console.log("cepSearch",data.response.endereco);
          setEndereco(data.response.endereco);
          setMessage({
            mensagem: "Tem igreja, redirecionar para editar!",
            severity: "error",
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
        data.endereco.complemento = complemento;
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
        <Grid size={10}>
          <TextField
            disabled
            id="outlined-disabled"
            value={endereco.logradouro}
            fullWidth
          />
        </Grid>

        <Grid size={2}>
          <TextField
            label="Número"
            id="outlined-disabled"
            value={endereco.numero}
            fullWidth
          />
        </Grid>
        
        <Grid size={6}>
          <TextField
            label="Complemento"
            value={complemento}
            onChange={(e) => setComplemento(e.target.value)}
            fullWidth
            id="outlined-disabled"
          />
        </Grid>

        {/* Segunda linha */}
        <Grid size={6}>
          <TextField
            id="outlined-basic"
            variant="outlined"
            value={endereco.bairro}
            fullWidth
            disabled
          />
        </Grid>
        <Grid size={4}>
          <TextField
            value={endereco.localidade}
            fullWidth
            disabled
          />
        </Grid>

        {/* Terceira linha */}
        <Grid size={4}>
          <TextField 
            value={endereco.uf} 
            fullWidth 
            disabled 
          />
        </Grid>
        <Grid size={4}>
          <TextField
            value={endereco.estado}
            fullWidth
            disabled
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
    </Box>
  );
};

export default BuscaPorCEP;
