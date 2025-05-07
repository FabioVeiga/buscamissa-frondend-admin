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
        Logradouro
        <TextField
          disabled={!endereco && endereco.logradouro} // Desabilita se endereco for null ou logradouro estiver vazio
          id="outlined-disabled"
          value={endereco?.logradouro || ""} // Usa optional chaining para evitar erros se endereco for null
          onChange={(e) =>
            setEndereco((prev) => ({ ...prev, logradouro: e.target.value }))
          }
          fullWidth
        />
        </Grid>

        {/* Segunda linha */}
        <Grid size={7}>
          Bairro
          <TextField
            id="outlined-basic"
            variant="outlined"
            value={endereco.bairro || ""}
            fullWidth
            disabled={!endereco && endereco.bairro}
            onChange={(e) =>
              setEndereco((prev) => ({ ...prev, bairro: e.target.value }))
            }
          />
        </Grid>
        <Grid size={5}>
        Localidade
          <TextField 
            value={endereco.localidade || ""} 
            fullWidth 
            disabled={!endereco.localidade && endereco.localidade}
            onChange={(e) =>
              setEndereco((prev) => ({ ...prev, localidade: e.target.value }))
            }
          />
        </Grid>

        {/* Terceira linha */}
        <Grid size={2}>
          <TextField 
            value={endereco.uf || ""} 
            fullWidth 
            disabled ={!endereco.uf && endereco.uf}
            onChange={(e) =>
              setEndereco((prev) => ({ ...prev, uf: e.target.value }))
            }
          />
        </Grid>
        <Grid size={10}>
          <TextField 
            value={endereco.estado || ""} 
            fullWidth 
            disabled ={!endereco.estado && endereco.estado}
            onChange={(e) =>
              setEndereco((prev) => ({ ...prev, estado: e.target.value }))
            }
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
