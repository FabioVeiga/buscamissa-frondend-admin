import { useState, useEffect } from "react";
import { Box, TextField, Button, FormControl, InputLabel, MenuItem, Typography, IconButton, Switch, FormControlLabel, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from "@mui/material";
import { Delete, ArrowBack } from "@mui/icons-material";
import api from "../services/apiService";
import { diasDaSemana, formatarHorario, apenasNumeros } from "../utils";
import ErrorSpan from "../ErrorSpan";
import  RedirectModal  from "../Components/RedirectModal"
import RedeSocialForm from "./Components/RedeSocialForm";
import { useLocation, useNavigate } from "react-router-dom";
import { useEndereco } from "../Context/EnderecoContext";
import Grid from "@mui/material/Grid2";

const IgrejaAtualizar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { state } = location || {};
  const { endereco, setEndereco } = useEndereco();
  const [formData, setFormData] = useState(state?.row);
  const [formDataRedeSociais, setFormDataRedeSociais] = useState(
    formData.redesSociais || []
  );
  //console.log(formData)
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
  const [urlInput, setUrlInput] = useState("");
  const [showModal, setShowModal] = useState(false);

  // Carregar endereço do formData quando o componente monta
  useEffect(() => {
    if (formData?.endereco) {
      setEndereco(formData.endereco);
    }
  }, []);


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

    const horarioDigits = apenasNumeros(horario);
    setformDataMissas((prev) => [
      ...prev,
      { horario: horarioDigits, diaSemana: diasDaSemana[diaSemana].value, observacao },
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

  const getDiaLabel = (dia) => {
    if (dia === undefined || dia === null) return "";
    const found = diasDaSemana.find((d) => d.value === dia || d.value === Number(dia));
    if (found) return found.label;
    // fallback: if dia is an index
    return diasDaSemana[dia]?.label || String(dia);
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
      endereco: endereco,
      ativo: formData?.ativo ?? false,
    }
    
    // Sanitizar contato e endereço
    if (req.contato) {
      req.contato = {
        ...req.contato,
        ddd: apenasNumeros(req.contato.ddd),
        telefone: apenasNumeros(req.contato.telefone),
        dddWhatsApp: apenasNumeros(req.contato.dddWhatsApp),
        telefoneWhatsApp: apenasNumeros(req.contato.telefoneWhatsApp),
      };
    }
    if (req.endereco) {
      req.endereco = {
        ...req.endereco,
        cep: apenasNumeros(req.endereco.cep),
      };
    }
    //console.log(req);
    api
      .put("/api/v1/Admin/igreja/atualizar", req)
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
        {/* Seção de Endereço */}
        <Box
          sx={{
            padding: 2,
            border: "1px solid #ddd",
            borderRadius: 2,
            backgroundColor: "#f9f9f9",
          }}
        >
          <Typography variant="h6" sx={{ marginBottom: 2 }}>
            Endereço
          </Typography>
          <Grid container spacing={2}>
            {/* CEP */}
            <Grid size={12}>
              <TextField
                label="CEP"
                value={endereco?.cep || ""}
                onChange={(e) =>
                  setEndereco((prev) => ({ ...prev, cep: e.target.value }))
                }
                fullWidth
              />
            </Grid>

            {/* Logradouro */}
            <Grid size={8}>
              <TextField
                label="Logradouro"
                value={endereco?.logradouro || ""}
                onChange={(e) =>
                  setEndereco((prev) => ({
                    ...prev,
                    logradouro: e.target.value,
                  }))
                }
                fullWidth
              />
            </Grid>

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

            {/* Bairro */}
            <Grid size={6}>
              <TextField
                label="Bairro"
                value={endereco?.bairro || ""}
                onChange={(e) =>
                  setEndereco((prev) => ({ ...prev, bairro: e.target.value }))
                }
                fullWidth
              />
            </Grid>

            {/* Localidade */}
            <Grid size={6}>
              <TextField
                label="Localidade"
                value={endereco?.localidade || ""}
                onChange={(e) =>
                  setEndereco((prev) => ({
                    ...prev,
                    localidade: e.target.value,
                  }))
                }
                fullWidth
              />
            </Grid>

            {/* UF */}
            <Grid size={3}>
              <TextField
                label="UF"
                value={endereco?.uf || ""}
                onChange={(e) =>
                  setEndereco((prev) => ({ ...prev, uf: e.target.value }))
                }
                fullWidth
              />
            </Grid>

            {/* Região */}
            <Grid size={3}>
              <TextField
                label="Região"
                value={endereco?.regiao || ""}
                onChange={(e) =>
                  setEndereco((prev) => ({ ...prev, regiao: e.target.value }))
                }
                fullWidth
              />
            </Grid>

            {/* Estado */}
            <Grid size={6}>
              <TextField
                label="Estado"
                value={endereco?.estado || ""}
                onChange={(e) =>
                  setEndereco((prev) => ({ ...prev, estado: e.target.value }))
                }
                fullWidth
              />
            </Grid>
          </Grid>
        </Box>

        {/* Dados da Igreja */}
        <FormControlLabel
          control={
            <Switch
              checked={formData?.ativo ?? false}
              onChange={(e) => handleChange("ativo", e.target.checked)}
              color="primary"
            />
          }
          label="Ativo"
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
                        setMessage({ mensagem: ["Erro ao processar imagem colada."], severity: "error", show: true });
                      }
                      e.preventDefault();
                      return;
                    }
                  }
                  // Alguns navegadores podem fornecer imagens como string via clipboard
                  if (item.kind === "string" && item.type === "text/html") {
                    item.getAsString(async (html) => {
                      const srcMatch = html.match(/src=\"([^\"]+)\"/i);
                      if (srcMatch && srcMatch[1]) {
                        try {
                          const resp = await fetch(srcMatch[1]);
                          const blob = await resp.blob();
                          await blobToBase64(blob, "pasted-from-html.png");
                        } catch (err) {
                          setMessage({ mensagem: ["Erro ao processar imagem colada do HTML."], severity: "error", show: true });
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
                    const reader = new FileReader();
                    reader.onload = (ev) => {
                      const base64String = ev.target.result.split(",")[1];
                      setBase64(base64String);
                      setFileName(urlInput);
                    };
                    reader.readAsDataURL(blob);
                  } catch (err) {
                    setMessage({ mensagem: ["Não foi possível converter a URL."], severity: "error", show: true });
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

            {/* Tabela de Missas */}
            {formDatamissas.length > 0 && (
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
                    {formDatamissas.map((missa, index) => (
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

        {/* Botões de Ação */}
        <Box display="flex" gap={2}>
          <Button
            variant="outlined"
            color="inherit"
            startIcon={<ArrowBack />}
            onClick={() => navigate(-1)}
          >
            Voltar
          </Button>
          <Button variant="contained" color="primary" onClick={handleSubmit}>
            Editar Igreja
          </Button>
        </Box>
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
