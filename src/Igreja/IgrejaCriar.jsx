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
  Checkbox,
  FormGroup,
  FormControlLabel
} from "@mui/material";
import { Delete } from "@mui/icons-material";
import api from "../services/apiService";
import { diasDaSemana } from "../utils";
import ErrorSpan from "../ErrorSpan";
import { useEndereco } from "../Context/EnderecoContext";
import { useNavigate } from "react-router-dom";
import { formatarHorario } from "../utils";

const IgrejaCriar = () => {
  const [message, setMessage] = useState("");

  const [formData, setFormData] = useState({
    nome: "",
    paroco: "",
    imagem: "",
    contato: {
      emailContato: "",
      ddd: "",
      telefone: "",
      dddWhatsApp: "",
      telefoneWhatsApp: "",
    },
  });

  const [formDataMissa, setFormDataMissa] = useState({
    horario: "",
    diasSelecionados: [], // Corrigido: inicialize como array vazio
    observacao: "",
  });

  const [formDataRedeSociais, setFormDataRedeSociais] = useState({
    tipoRedeSocial: "",
    nomeDoPerfil: "",
  });

  const [missas, setMissas] = useState([]);
  const [redeSociais, setRedeSociais] = useState([]);
  const [base64, setBase64] = useState("");
  const [fileName, setFileName] = useState("");

  const { endereco, setEndereco } = useEndereco();

  

  const navigate = useNavigate();

  const handleToggleDiaSemana = (diaValue) => {
    setFormDataMissa((prev) => {
      const { diasSelecionados } = prev;
      if (diasSelecionados.includes(diaValue)) {
        return {
          ...prev,
          diasSelecionados: diasSelecionados.filter((d) => d !== diaValue),
        };
      } else {
        return {
          ...prev,
          diasSelecionados: [...diasSelecionados, diaValue],
        };
      }
    });
  };

  const handleAddMissa = () => {
    const { horario, diasSelecionados, observacao } = formDataMissa;
    // Validação
    if (!horario || diasSelecionados.length === 0) {
      setMessage("Os campos Horário e pelo menos um Dia da Semana são obrigatórios!");
      return;
    }

    // Adiciona uma missa para cada dia selecionado
    setMissas((prev) => [
      ...prev,
      ...diasSelecionados.map((dia) => ({
        horario,
        diaSemana: dia,
        observacao,
      })),
    ]);

    // Limpar os campos
    setFormDataMissa({ horario: "", diasSelecionados: [], observacao: "" });
  };

  const handleAddRedeSocial = () => {
    const { tipoRedeSocial, nomeDoPerfil } = formDataRedeSociais;
    console.log(tipoRedeSocial, nomeDoPerfil);
    // Validação
    if (tipoRedeSocial === "" || nomeDoPerfil === "") {
      setMessage(
        "Os campos Tipo de Rede Social e Nome do Perfil são obrigatórios!"
      );
      return;
    }

    setRedeSociais((prev) => [...prev, { tipoRedeSocial, nomeDoPerfil }]);

    // Limpar os campos
    setFormDataRedeSociais({ tipoRedeSocial: "", nomeDoPerfil: "" });
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleChangeMissa = (field, value) => {
    setFormDataMissa((prev) => ({ ...prev, [field]: value }));
  };

  const handleChangeRedeSociais = (field, value) => {
    setFormDataRedeSociais((prev) => ({ ...prev, [field]: value }));
  };

  const handleDeleteMissa = (indexToDelete) => {
    setMissas((prev) => prev.filter((_, index) => index !== indexToDelete));
  };

  const handleDeleteRedeSocial = (indexToDelete) => {
    setRedeSociais((prev) =>
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

  const handlaComplementoEndereco = (field, value) => {
    setEndereco((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    //Validação
    var arrayAux = []
    if (formData.nome === "") {
      arrayAux.push("O campo Nome é obrigatório!")
    }

    if (missas.length === 0) {
      arrayAux.push("É necessário adicionar ao menos uma missa!")
    }

    if (endereco === undefined) {
      arrayAux.push("É necessário ter o endereço preenchido!")

    }

    if(arrayAux.length > 0)
    {
      setMessage(arrayAux);
      return;
    }

    formData.missas = missas;
    formData.imagem = base64;
    formData.endereco = endereco;
    formData.redeSociais = redeSociais;
    console.log(formData);
    api
     .post("/api/Admin/igreja/criar", formData)
     .then((response) => {
       //console.log(response);
       setMessage("Igreja criada com sucesso!");
       handleNavigate("/igreja");
     })
     .catch((error) => {
       //console.error("Erro ao criar a igreja:", error);
       var data = error.response.data;
       console.error("Erro ao criar a igreja:", error);
       if (data.errors) {
         setMessage(data.errors);
       } else {
         var arrayAux = [error.response.data.data?.messagemAplicacao]
         setMessage(arrayAux);
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
          label="Endereço - Complemento"
          value={endereco.complemento}
          onChange={(e) => handlaComplementoEndereco("complemento",e.target.value)}
          fullWidth
          id="outlined-disabled"
          />
        <TextField
          label="Endereço - Número"
          id="outlined-disabled"
          value={endereco.numero}
          onChange={(e) => handlaComplementoEndereco("numero",e.target.value)}
          fullWidth
        />
        
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
          {base64 && (
            <Box
              component="img"
              src={`data:image/png;base64,${base64}`}
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
            value={formDataMissa.horario}
            onChange={(e) => handleChangeMissa("horario", e.target.value)}
            fullWidth
            InputLabelProps={{ shrink: true }}
            inputProps={{
              step: 900,
            }}
          />

          {/* Seleção de Dias da Semana */}
          <FormGroup row>
            {diasDaSemana.map((dia) => (
              <FormControlLabel
                key={dia.value}
                control={
                  <Checkbox
                    checked={formDataMissa.diasSelecionados.includes(dia.value)}
                    onChange={() => handleToggleDiaSemana(dia.value)}
                  />
                }
                label={dia.label}
              />
            ))}
          </FormGroup>

          {/* Observação */}
          <TextField
            label="Observação"
            value={formDataMissa.observacao}
            onChange={(e) => handleChangeMissa("observacao", e.target.value)}
            fullWidth
          />

          {/* Botão Adicionar */}
          <Button variant="text" color="primary" onClick={handleAddMissa}>
            Adicionar Missa
          </Button>

          {/* Lista de Missas */}
          {missas.length > 0 && (
            <List>
              {missas.map((missa, index) => (
                <ListItem
                  key={index}
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Typography>
                    {formatarHorario(missa.horario)} - {diasDaSemana.find(d => d.value === missa.diaSemana)?.label} (
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
              value={formDataRedeSociais.tipoRedeSocial}
              onChange={(e) =>
                handleChangeRedeSociais("tipoRedeSocial", e.target.value)
              }
            >
              <MenuItem value={1}>Facebook</MenuItem>
              <MenuItem value={2}>Instagram</MenuItem>
              <MenuItem value={3}>Youtube</MenuItem>
              <MenuItem value={4}>Tiktok</MenuItem>
            </Select>
          </FormControl>
          <TextField
            label="Nome do Perfil"
            value={formDataRedeSociais.nomeDoPerfil}
            onChange={(e) =>
              handleChangeRedeSociais("nomeDoPerfil", e.target.value)
            }
            fullWidth
          />
          <Button variant="text" color="primary" onClick={handleAddRedeSocial}>
            Adicionar Rede Social
          </Button>
          {/* Lista de Rede Social */}
          {redeSociais.length > 0 && (
            <List>
              {redeSociais.map((rede, index) => (
                <ListItem
                  key={index}
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Typography>
                    {rede.tipoRedeSocial} - {rede.nomeDoPerfil}
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
          Criar Igreja
        </Button>

        {Object.keys(message).length > 0 && (
          <div className="bg-red-100 text-red-700 p-4 rounded">
            <h3 className="font-bold mb-2">Erros de Validação:</h3>
            <ul className="list-disc ml-5">
              {Object.entries(message).map(([field, messages]) => (
                <ErrorSpan errorMessage={messages} field={field} severity="error" />
              ))}
            </ul>
          </div>
        )}
      </Box>
    </>
  );
};

export default IgrejaCriar;
