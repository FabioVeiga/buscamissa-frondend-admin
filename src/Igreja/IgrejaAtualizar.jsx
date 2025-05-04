import { useState } from "react";
import { Box, TextField, Button, FormControl, InputLabel, MenuItem, List, ListItem, Typography, IconButton } from "@mui/material";
import { Delete } from "@mui/icons-material";
import api from "../services/apiService";
import { diasDaSemana } from "../utils";
import ErrorSpan from "../ErrorSpan";
import  RedirectModal  from "../Components/RedirectModal"
import RedeSocialForm from "./Components/RedeSocialForm";
import { useLocation } from "react-router-dom";

const IgrejaAtualizar = () => {
  const location = useLocation();
  const { state } = location || {};
  const [formData, setFormData] = useState(state?.row);
  const [formDataRedeSociais, setFormDataRedeSociais] = useState(
    formData.redesSociais || []
  );
  console.log(formData)
  const errorMensage = () => ({
    mensagem: "",
    severity: "",
    show: false,
  });
  const [message, setMessage] = useState(errorMensage);
  const [formDatamissas, setformDataMissas] = useState(formData.missas);
  const [missas, setMissas] = useState([]);
  const [base64, setBase64] = useState("");
  const [fileName, setFileName] = useState("");
  const [showModal, setShowModal] = useState(false);


  const handleAddMissa = () => {
    const { horario, diaSemana, observacao } = missas;
    // Validação
    if (!horario || diaSemana === "") {
      setMessage({
        mensagem:
          "Os campos Horário e Dia da Semana são obrigatórios!",
        severity: "error",
        show: true,
      });
      return;
    }

    setformDataMissas((prev) => [
      ...prev,
      { horario, diaSemana: diasDaSemana[diaSemana].value, observacao },
    ]);

    // Limpar os campos
    setMissas({ horario: "", diaSemana: "", observacao: "" });
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleChangeMissa = (field, value) => {
    setMissas((prev) => ({ ...prev, [field]: value }));
  };


  const handleDeleteMissa = (indexToDelete) => {
    setformDataMissas((prev) => prev.filter((_, index) => index !== indexToDelete));
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();

      reader.onload = (e) => {
        // O resultado contém a base64 da imagem
        const base64String = e.target.result.split(",")[1]; // Remove o cabeçalho 'data:image/jpeg;base64,'
        setBase64(base64String);
        setFileName(file.name);
      };

      reader.readAsDataURL(file); // Lê o arquivo como uma DataURL
    }
  };

  const obterPrimeiroErro = (erros) => {
    const chaves = Object.keys(erros);
    if (chaves.length > 0) {
      return erros[chaves[0]][0];
    }
  
    return null; // Retorna null se não houver erros
  };

  const handleSubmit = () => {
    var arrayAux = [];
    if (formData.nome === "") {
      arrayAux.push("O campo Nome é obrigatório!");
    }

    if (formDatamissas.length === 0) {
      arrayAux.push("É necessário adicionar ao menos uma missa!");
    }

    if (arrayAux.length > 0) {
      setMessage(arrayAux);
      return;
    }

    formData.missas = formDatamissas;
    formData.imagem = base64;
    formData.RedeSociais = formDataRedeSociais;
    let req  ={
      id: formData.id,
      nome: formData.nome,
      paroco: formData.paroco,
      missas: formData.missas,
      contato: formData.contato ? formData.contato : null,
      imagem: base64,
      redeSociais: formDataRedeSociais,
    }
    //console.log(req);
    api
      .put("/api/Admin/igreja/atualizar", req)
      .then(() => {
        setShowModal(true);
        setMessage({
          mensagem: obterPrimeiroErro("Igreja atualizada com sucesso!"),
          severity: "success",
          show: true,
        });
      })
      .catch((error) => {
        console.log(error)
        var data = error.response.data.errors;
        if (data) {
          setMessage({
            mensagem: obterPrimeiroErro(data),
            severity: "error",
            show: true,
          });
        } else {
          var arrayAux = [error.response.data.data?.messagemAplicacao];
          setMessage({
            mensagem: arrayAux,
            severity: "error",
            show: true,
          });
        }
      });
  };

  return (
    <>
      <h2>Editar Igreja</h2>
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
        {/* Dados da Igreja */}
        <TextField
          label="Nome da Igreja"
          value={formData.nome}
          onChange={(e) => handleChange("nome", e.target.value)}
          fullWidth
          required
        />
        <TextField
          label="Pároco"
          value={formData.paroco}
          onChange={(e) => handleChange("paroco", e.target.value)}
          fullWidth
        />
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 2,
            maxWidth: 500,
            margin: "0 auto",
            padding: 2,
            border: "1px solid #ccc",
            borderRadius: 2,
          }}
        >
          <Typography variant="h6">
            Upload de Imagem e Conversão para Base64
          </Typography>

          {/* Input oculto para upload */}
          <Button variant="outlined" component="label">
            Selecionar Imagem
            <input
              type="file"
              hidden
              accept="image/*"
              onChange={handleFileChange}
            />
          </Button>

          {/* Mostra o nome do arquivo */}
          {fileName && <Typography>Arquivo selecionado: {fileName}</Typography>}

          {/* Campo Base64 (somente leitura) */}
          <TextField
            label="Base64 da Imagem"
            value={base64}
            multiline
            rows={4}
            InputProps={{ readOnly: true }}
            fullWidth
            disabled
          />

          {/* Imagem preview (opcional) */}
          {(base64 || formData.imagemUrl) && (
            <Box
              component="img"
              src={
                base64 ? `data:image/png;base64,${base64}` : formData.imagemUrl
              }
              alt="Preview"
              sx={{
                maxWidth: "100%",
                border: "1px solid #ccc",
                borderRadius: 1,
              }}
            />
          )}
        </Box>

        {/* Missas */}
        <Box
          display="flex"
          gap={2}
          flexDirection="column"
          sx={{ width: "80%", margin: "0 auto", padding: 2 }}
        >
          <Typography>Adicionar Missa</Typography>

          {/* Horário */}
          <TextField
            label="Horário"
            type="time"
            value={missas.horario}
            onChange={(e) => handleChangeMissa("horario", e.target.value)}
            fullWidth
            InputLabelProps={{ shrink: true }}
            inputProps={{
              step: 900,
            }}
          />

          {/* Dia da Semana */}
          <TextField
            label="Dia da Semana"
            select
            value={missas.diaSemana}
            onChange={(e) => handleChangeMissa("diaSemana", e.target.value)}
            fullWidth
          >
            {diasDaSemana.map((dia) => (
              <MenuItem key={dia.value} value={dia.value}>
                {dia.label}
              </MenuItem>
            ))}
          </TextField>

          {/* Observação */}
          <TextField
            label="Observação"
            value={missas.observacao}
            onChange={(e) => handleChangeMissa("observacao", e.target.value)}
            fullWidth
          />

          {/* Botão Adicionar */}
          <Button variant="text" color="primary" onClick={handleAddMissa}>
            Adicionar Missa
          </Button>

          {/* Lista de Missas */}
          {formDatamissas.length > 0 && (
            <List>
              {formDatamissas.map((missa, index) => (
                <ListItem
                  key={index}
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Typography>
                    {missa.horario} - {diasDaSemana[missa.diaSemana].label} (
                    {missa.observacao || "Sem observação"})
                  </Typography>
                  <IconButton
                    color="error"
                    onClick={() => handleDeleteMissa(index)}
                  >
                    <Delete />
                  </IconButton>
                </ListItem>
              ))}
            </List>
          )}
        </Box>

        {/* Contato */}
        <TextField
          label="Email de Contato"
          value={formData.contato.emailContato}
          onChange={(e) =>
            handleChange("contato", {
              ...formData.contato,
              emailContato: e.target.value,
            })
          }
          fullWidth
        />
        <TextField
          label="DDD"
          value={formData.contato.ddd}
          onChange={(e) =>
            handleChange("contato", {
              ...formData.contato,
              ddd: e.target.value,
            })
          }
          fullWidth
        />
        <TextField
          label="Telefone"
          value={formData.contato.telefone}
          onChange={(e) =>
            handleChange("contato", {
              ...formData.contato,
              telefone: e.target.value,
            })
          }
          fullWidth
        />
        <TextField
          label="DDD WhatsApp"
          value={formData.contato.dddWhatsApp}
          onChange={(e) =>
            handleChange("contato", {
              ...formData.contato,
              dddWhatsApp: e.target.value,
            })
          }
          fullWidth
        />
        <TextField
          label="Telefone WhatsApp"
          value={formData.contato.telefoneWhatsApp}
          onChange={(e) =>
            handleChange("contato", {
              ...formData.contato,
              telefoneWhatsApp: e.target.value,
            })
          }
          fullWidth
        />

        {/* Redes Sociais */}
        <Box
          display="flex"
          gap={2}
          flexDirection="column"
          sx={{ width: "80%", margin: "0 auto", padding: 2 }}
        >
          <FormControl fullWidth>
            <InputLabel id="tipoRedeSocial-label">
              Tipo de Rede Social
            </InputLabel>
            <RedeSocialForm
              redesSociaisExistentes={formDataRedeSociais}
              igrejaId={formData.id} // Passando o formData.id como prop
              onAddRedeSocial={(novaRede) =>
                setFormDataRedeSociais((prev) => [...prev, novaRede])
              }
              onDeleteRedeSocial={(tipoRedeSocial) =>
                setFormDataRedeSociais((prev) =>
                  prev.filter((rede) => rede.tipoRedeSocial !== tipoRedeSocial)
                )
              }
            />
          </FormControl>
        </Box>

        {/* Botão de Submissão */}
        <Button variant="contained" color="primary" onClick={handleSubmit}>
          Editar Igreja
        </Button>
        <Box display="flex">
          {message.show && (
            <ErrorSpan
              errorMessage={message.mensagem}
              severity={message.severity}
            />
          )}
        </Box>
      </Box>
      {/* Modal de redirecionamento */}
      {showModal && <RedirectModal targetPage="/igreja" />}
    </>
  );
};

export default IgrejaAtualizar;
