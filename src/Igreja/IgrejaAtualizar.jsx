import { useState } from "react";
import {
  Box,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  List,
  ListItem,
  Typography,
  IconButton,
} from "@mui/material";
import { Delete } from "@mui/icons-material";
import api from "../services/apiService";
import { diasDaSemana } from "../utils";
import ErrorSpan from "../ErrorSpan";
import { useNavigate, useLocation } from "react-router-dom";
import { useEndereco } from "../Context/EnderecoContext";

const IgrejaAtualizar = () => {
  const { endereco, setEndereco } = useEndereco();
  const location = useLocation();
  const { state } = location || {};
  const [formData, setFormData] = useState(state?.row);
  const [redeSociais, setRedeSociais] = useState({
    tipoRedeSocial: "",
    nomeDoPerfil: "",
  });
  const [formDataRedeSociais, setFormDataRedeSociais] = useState(
    formData.redesSociais
  );
  //const [formDataContato, setFormDataContato] = useState(formData.contato);
  //const [formDataEndereco, setFormDataEndereco] = useState(formData.endereco);

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
  const navigate = useNavigate();

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

  const verificarTipoRedeSocial = (tipo) => {
    return formDataRedeSociais.some((rede) => rede.tipoRedeSocial === tipo);
  };

  const handleAddRedeSocial = () => {
    const { tipoRedeSocial, nomeDoPerfil } = redeSociais;
    // Validação
    if (tipoRedeSocial === "" || nomeDoPerfil === "") {
      setMessage({
        mensagem: "Os campos Tipo de Rede Social e Nome do Perfil são obrigatórios!",
        severity: "error",
        show: true,
      });
    } else {
      if (verificarTipoRedeSocial(tipoRedeSocial)) {
        setMessage({
          mensagem: "Já existe uma rede social com o tipo selecionado!",
          severity: "error",
          show: true,
        });
      } else {
        setFormDataRedeSociais((prev) => [
          ...prev,
          { tipoRedeSocial, nomeDoPerfil },
        ]);
      }
    }
    // Limpar os campos
    setRedeSociais({ tipoRedeSocial: "", nomeDoPerfil: "" });
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleChangeMissa = (field, value) => {
    setMissas((prev) => ({ ...prev, [field]: value }));
  };

  const handleChangeRedeSociais = (field, value) => {
    setRedeSociais((prev) => ({ ...prev, [field]: value }));
  };

  const handleDeleteMissa = (indexToDelete) => {
    setformDataMissas((prev) => prev.filter((_, index) => index !== indexToDelete));
  };

  setEndereco(formData.endereco);

  const handleDeleteRedeSocial = (indexToDelete) => {
    setFormDataRedeSociais((prev) =>
      prev.filter((_, index) => index !== indexToDelete)
    );
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

  const handleNavigate = (path) => {
    navigate(path);
  };

  const obterPrimeiroErro = (erros) => {
    // Obtem todas as chaves do objeto
    const chaves = Object.keys(erros);
  
    // Verifica se existem erros
    if (chaves.length > 0) {
      // Retorna o primeiro erro encontrado
      return erros[chaves[0]][0];
    }
  
    return null; // Retorna null se não houver erros
  };

  const handleSubmit = () => {
    //Validação
    var arrayAux = [];
    if (formData.nome === "") {
      arrayAux.push("O campo Nome é obrigatório!");
    }

    if (formDatamissas.length === 0) {
      arrayAux.push("É necessário adicionar ao menos uma missa!");
    }

    if (endereco === undefined) {
      arrayAux.push("É necessário ter o endereço preenchido!");
    }

    if (arrayAux.length > 0) {
      setMessage(arrayAux);
      return;
    }

    formData.missas = formDatamissas;
    formData.imagem = base64;
    formData.endereco = endereco;
    formData.RedeSociais = formDataRedeSociais;
    //console.log(formData);
    api
      .put("/api/Admin/igreja/atualizar", formData)
      .then((response) => {
        console.log(response);
        setMessage({
          mensagem: obterPrimeiroErro("Igreja atualizada com sucesso!"),
          severity: "success",
          show: true,
        });
        handleNavigate("/igreja");
      })
      .catch((error) => {
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
      <h4>Igreja</h4>
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
            <Select
              labelId="tipoRedeSocial-label"
              value={redeSociais.tipoRedeSocial}
              onChange={(e) =>
                handleChangeRedeSociais("tipoRedeSocial", e.target.value)
              }
            >
              <MenuItem value={1}>Facebook</MenuItem>
              <MenuItem value={2}>Instagram</MenuItem>
              <MenuItem value={3}>Twitter</MenuItem>
              <MenuItem value={4}>LinkedIn</MenuItem>
            </Select>
          </FormControl>
          <TextField
            label="Nome do Perfil"
            value={redeSociais.nomeDoPerfil}
            onChange={(e) =>
              handleChangeRedeSociais("nomeDoPerfil", e.target.value)
            }
            fullWidth
          />
          <Button variant="text" color="primary" onClick={handleAddRedeSocial}>
            Adicionar Rede Social
          </Button>
          {/* Lista de Rede Social */}
          {formDataRedeSociais.length > 0 && (
            <List>
              {formDataRedeSociais.map((rede, index) => (
                <ListItem
                  key={index}
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Typography>
                    {`[${rede.tipoRedeSocial}] ${rede.nomeRedeSocial}`} -{" "}
                    {rede.nomeDoPerfil}
                  </Typography>
                  <IconButton
                    color="error"
                    onClick={() => handleDeleteRedeSocial(index)}
                  >
                    <Delete />
                  </IconButton>
                </ListItem>
              ))}
            </List>
          )}
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
    </>
  );
};

export default IgrejaAtualizar;
