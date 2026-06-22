import { useState } from "react";
import {
  Box,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  IconButton,
  Checkbox,
  FormGroup,
  FormControlLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Stack,
  List,
  ListItem
} from "@mui/material";
import { Delete, ArrowBack } from "@mui/icons-material";
import api from "../services/apiService";
import { diasDaSemana, formatarHorario, apenasNumeros } from "../utils";
import ErrorSpan from "../ErrorSpan";
import { useEndereco } from "../Context/EnderecoContext";
import { useNavigate } from "react-router-dom";
import { useGeocode } from "../hooks/useGeocode";
import RedeSociaisModel from "../Models/RedeSociaisModel";
import Grid from "@mui/material/Grid2/index.d.ts";


const IgrejaCriar = () => {
  const redesSociaisDisponiveis = RedeSociaisModel.obterLista();

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

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
  const [urlInput, setUrlInput] = useState("");
  const [openCepReverso, setOpenCepReverso] = useState(false);
  const [candidatosCep, setCandidatosCep] = useState([]);
  const [cepReversoLoading, setCepReversoLoading] = useState(false);
  const [cepReversoError, setCepReversoError] = useState("");

  const { endereco, setEndereco } = useEndereco();

  const navigate = useNavigate();
  
  const { geocode, loading: geoLoading, error: geoError } = useGeocode();

  const getDiaLabel = (dia) => {
    if (dia === undefined || dia === null) return "";
    const found = diasDaSemana.find((d) => d.value === dia || d.value === Number(dia));
    if (found) return found.label;
    return diasDaSemana[dia]?.label || String(dia);
  };

  const handleGeocode = async () => {
    const { logradouro, numero, bairro, localidade, uf } = endereco;
    const addressParts = [logradouro, numero, bairro, localidade, uf].filter(Boolean);
    
    if (addressParts.length < 3) {
      setMessage("Por favor, preencha pelo menos Logradouro, Localidade e UF para buscar coordenadas.");
      return;
    }

    const fullAddress = addressParts.join(", ");
    const result = await geocode(fullAddress);

    if (result) {
      setEndereco((prev) => ({
        ...prev,
        latitude: result.lat,
        longitude: result.lon,
      }));
      setMessage("Coordenadas encontradas com sucesso!");
    } else {
      setMessage("Erro ao buscar coordenadas. Verifique o endereço.");
    }
  };

  const handleBuscarCepReverso = async () => {
    const { uf, localidade, logradouro, bairro } = endereco;
    if (!uf || !localidade || !logradouro) {
      setCepReversoError("Preencha UF, Localidade e Logradouro para buscar o CEP.");
      setCandidatosCep([]);
      setOpenCepReverso(true);
      return;
    }

    const requestData = {
      uf,
      cidade: localidade,
      logradouro,
    };

    if (bairro) {
      requestData.bairro = bairro;
    }

    setCepReversoLoading(true);
    setCepReversoError("");

    try {
      const response = await api.post("/api/v1/Admin/igreja/endereco/reverso", requestData);
      const candidatos = response.data?.data?.candidatos || [];
      setCandidatosCep(candidatos);
      if (candidatos.length === 0) {
        setCepReversoError("Nenhum candidato encontrado para este endereço.");
      }
      setOpenCepReverso(true);
    } catch (error) {
      setCepReversoError(
        error.response?.data?.data?.mensagemAplicacao ||
          error.response?.data?.message ||
          "Erro ao buscar candidatos de CEP."
      );
      setCandidatosCep([]);
      setOpenCepReverso(true);
    } finally {
      setCepReversoLoading(false);
    }
  };

  const handleSelectCepCandidato = (item) => {
    setEndereco((prev) => ({
      ...prev,
      cep: item.cep,
      logradouro: item.logradouro || prev.logradouro,
      bairro: item.bairro || prev.bairro,
      localidade: item.localidade || prev.localidade,
      uf: item.uf || prev.uf,
    }));
    setOpenCepReverso(false);
  };

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
    const horarioDigits = apenasNumeros(horario);
    setMissas((prev) => [
      ...prev,
      ...diasSelecionados.map((dia) => ({
        horario: horarioDigits,
        diaSemana: dia,
        observacao,
      })),
    ]);

    // Limpar os campos
    setFormDataMissa({ horario: "", diasSelecionados: [], observacao: "" });
  };

  const handleAddRedeSocial = () => {
    const { tipoRedeSocial, nomeDoPerfil } = formDataRedeSociais;

    if (tipoRedeSocial === "" || nomeDoPerfil.trim() === "") {
      setMessage([
        "Os campos Tipo de Rede Social e Nome do Perfil são obrigatórios!",
      ]);
      return;
    }

    const tipoRedeSocialSelecionado = Number(tipoRedeSocial);

    const redeSocialJaExiste = redeSociais.some(
        (rede) => Number(rede.tipoRedeSocial) === tipoRedeSocialSelecionado
    );

    if (redeSocialJaExiste) {
      setMessage([
        "Essa igreja já possui uma rede social cadastrada com esse tipo.",
      ]);
      return;
    }

    setRedeSociais((prev) => [
      ...prev,
      {
        tipoRedeSocial: tipoRedeSocialSelecionado,
        nomeDoPerfil: nomeDoPerfil.trim(),
      },
    ]);

    setFormDataRedeSociais({
      tipoRedeSocial: "",
      nomeDoPerfil: "",
    });

    setMessage("");
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

  // Utilitário: converte Blob para base64 e atualiza estado
  const blobToBase64 = (blob, name) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const base64String = e.target.result.split(",")[1];
          setBase64(base64String);
          setFileName(name || "image");
          resolve(base64String);
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(blob);
    });
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

    setLoading(true);

    formData.missas = missas;
    formData.imagem = base64;
    formData.endereco = endereco;
    formData.redeSociais = redeSociais;
    
    // Sanitizar contato e endereço
    if (formData.contato) {
      formData.contato = {
        ...formData.contato,
        ddd: apenasNumeros(formData.contato.ddd),
        telefone: apenasNumeros(formData.contato.telefone),
        dddWhatsApp: apenasNumeros(formData.contato.dddWhatsApp),
        telefoneWhatsApp: apenasNumeros(formData.contato.telefoneWhatsApp),
      };
    }
    if (formData.endereco) {
      formData.endereco = {
        ...formData.endereco,
        cep: apenasNumeros(formData.endereco.cep),
      };
    }
    console.log(formData);
    api
     .post("/api/v1/Admin/igreja/criar", formData)
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
     })
     .finally(() => {
       setLoading(false);
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
        {/* Número */}
        <Grid size={4}>
          <TextField
              label="Número"
              value={endereco?.numero || ""}
              onChange={(e) =>
                  setEndereco((prev) => ({ ...prev, numero: e.target.value }))
              }
              fullWidth
          />
        </Grid>

        {/* Complemento */}
        <Grid size={12}>
          <TextField
              label="Complemento"
              value={endereco?.complemento || ""}
              onChange={(e) =>
                  setEndereco((prev) => ({
                    ...prev,
                    complemento: e.target.value,
                  }))
              }
              fullWidth
          />
        </Grid>
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

          {/* Colar imagem do clipboard */}
          <TextField
            label="Cole uma imagem (Ctrl/Cmd+V)"
            placeholder="Cole aqui uma imagem"
            onPaste={async (e) => {
              const items = e.clipboardData && e.clipboardData.items;
              if (!items) return;
              for (let i = 0; i < items.length; i++) {
                const item = items[i];
                if (item.kind === "file" && item.type.startsWith("image/")) {
                  const blob = item.getAsFile();
                  if (blob) {
                    try {
                      await blobToBase64(blob, blob.name || "pasted-image.png");
                    } catch (err) {
                      setMessage("Erro ao processar imagem colada.");
                    }
                    e.preventDefault();
                    return;
                  }
                }
                if (item.kind === "string" && item.type === "text/html") {
                  item.getAsString(async (html) => {
                    const srcMatch = html.match(/src=\"([^\"]+)\"/i);
                    if (srcMatch && srcMatch[1]) {
                      try {
                        const resp = await fetch(srcMatch[1]);
                        const blob = await resp.blob();
                        await blobToBase64(blob, "pasted-from-html.png");
                      } catch (err) {
                        setMessage("Erro ao processar imagem colada do HTML.");
                      }
                    }
                  });
                }
              }
            }}
            fullWidth
          />

          {/* Converter a partir de URL */}
          <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
            <TextField
              label="Converter a partir de URL"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="Cole URL da imagem aqui"
              fullWidth
            />
            <Button
              variant="outlined"
              onClick={async () => {
                if (!urlInput) return;
                try {
                  const resp = await fetch(urlInput);
                  if (!resp.ok) throw new Error("Falha ao buscar a imagem");
                  const blob = await resp.blob();
                  await blobToBase64(blob, urlInput);
                } catch (err) {
                  setMessage("Não foi possível converter a URL.");
                }
              }}
            >
              Converter
            </Button>
          </Box>

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

          {/* Tabela de Missas */}
          {missas.length > 0 && (
            <TableContainer component={Paper} sx={{ mt: 1 }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Horário</TableCell>
                    <TableCell>Dia</TableCell>
                    <TableCell>Observação</TableCell>
                    <TableCell>Ações</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {missas.map((missa, index) => (
                    <TableRow key={index}>
                      <TableCell>{formatarHorario(missa.horario)}</TableCell>
                      <TableCell>{getDiaLabel(missa.diaSemana)}</TableCell>
                      <TableCell>{missa.observacao || "Sem observação"}</TableCell>
                      <TableCell>
                        <IconButton color="error" onClick={() => handleDeleteMissa(index)}>
                          <Delete />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
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
            sx={{
              width: "80%",
              margin: "0 auto",
              padding: 2,
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 2,
            }}
        >
          <Typography variant="h6">Redes Sociais</Typography>

          <FormControl fullWidth>
            <InputLabel id="tipoRedeSocial-label">
              Tipo de Rede Social
            </InputLabel>
            <Select
                labelId="tipoRedeSocial-label"
                label="Tipo de Rede Social"
                value={formDataRedeSociais.tipoRedeSocial}
                onChange={(e) =>
                    handleChangeRedeSociais("tipoRedeSocial", e.target.value)
                }
            >
              {redesSociaisDisponiveis.map((redeSocial) => (
                  <MenuItem key={redeSocial.id} value={redeSocial.id}>
                    {redeSocial.tipo}
                  </MenuItem>
              ))}
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

          <Button
              variant="contained"
              color="primary"
              onClick={handleAddRedeSocial}
          >
            Adicionar Rede Social
          </Button>

          {redeSociais.length > 0 && (
              <List>
                {redeSociais.map((rede, index) => (
                    <ListItem
                        key={`${rede.tipoRedeSocial}-${index}`}
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          border: "1px solid",
                          borderColor: "divider",
                          borderRadius: 1,
                          mb: 1,
                          px: 2,
                        }}
                    >
                      <Typography>
                        <strong>
                          {RedeSociaisModel.obterNomePorId(rede.tipoRedeSocial)}:
                        </strong>{" "}
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

        {/* Botões de Ação */}
        <Box display="flex" gap={2}>
          <Button
            variant="outlined"
            color="inherit"
            startIcon={<ArrowBack />}
            onClick={() => navigate(-1)}
            disabled={loading}
          >
            Voltar
          </Button>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <Stack direction="row" alignItems="center" gap={1}>
                <CircularProgress size={20} />
                Criando...
              </Stack>
            ) : (
              "Criar Igreja"
            )}
          </Button>
        </Box>

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
