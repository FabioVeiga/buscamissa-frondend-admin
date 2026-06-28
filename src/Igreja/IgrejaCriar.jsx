import { useState } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  CircularProgress,
  Stack,
} from "@mui/material";
import { ArrowBack } from "@mui/icons-material";
import api from "../services/apiService";
import { apenasNumeros, formatarErroApi } from "../utils";
import ErrorSpan from "../ErrorSpan";
import { useEndereco } from "../Context/EnderecoContext";
import { useNavigate } from "react-router-dom";
import { useGeocode } from "../hooks/useGeocode";
import MissaForm from "./Components/MissaForm";
import ContatoForm from "./Components/ContatoForm";
import EnderecoForm from "./Components/EnderecoForm";
import SectionCard from "./Components/SectionCard";
import RedesSociaisCriarSection from "./Components/RedesSociaisCriarSection";
import IgrejasCepModal from "./Components/IgrejasCepModal";

const IgrejaCriar = () => {
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
  const [cepLoading, setCepLoading] = useState(false);
  const [cepReversoLoading, setCepReversoLoading] = useState(false);
  const [cepReversoError, setCepReversoError] = useState("");
  const [igrejasCepModalOpen, setIgrejasCepModalOpen] = useState(false);
  const [igrejasEncontradasCep, setIgrejasEncontradasCep] = useState([]);

  const { endereco, setEndereco } = useEndereco();
  const enderecoAtual = endereco || {};

  const navigate = useNavigate();
  
  const { geocode, loading: geoLoading, error: geoError } = useGeocode();

  const handleShowError = (mensagem) => {
    setMessage([mensagem]);
  };

  const preencherEndereco = (enderecoResponse, cepFallback = "") => {
    if (!enderecoResponse) return;

    setEndereco((prev) => ({
      ...prev,
      cep: enderecoResponse.cep || cepFallback,
      logradouro: enderecoResponse.logradouro || prev?.logradouro || "",
      complemento: enderecoResponse.complemento || prev?.complemento || "",
      bairro: enderecoResponse.bairro || prev?.bairro || "",
      localidade:
          enderecoResponse.localidade ||
          enderecoResponse.cidade ||
          prev?.localidade ||
          "",
      uf: enderecoResponse.uf || prev?.uf || "",
      estado: enderecoResponse.estado || prev?.estado || "",
      regiao: enderecoResponse.regiao || prev?.regiao || "",
    }));
  };

  const limparFormulario = () => {
    setFormData({
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
    setFormDataRedeSociais({
      tipoRedeSocial: "",
      nomeDoPerfil: "",
    });
    setMissas([]);
    setRedeSociais([]);
    setBase64("");
    setFileName("");
    setUrlInput("");
    setEndereco({});
  };

  const buscarIgrejaCompletaPorNomeUnico = async (nomeUnico) => {
    if (!nomeUnico) {
      throw new Error("Nome único da igreja não informado.");
    }

    const response = await api.get(`/api/v2/Igreja/${nomeUnico}`);
    return response.data?.data || response.data;
  };

  const normalizarIgrejaParaEdicao = (response) => {
    const igreja =
        response?.igreja ||
        response?.item ||
        response?.data ||
        response;

    const endereco =
        igreja?.endereco ||
        igreja?.dadosEndereco ||
        igreja?.dados?.endereco ||
        response?.endereco ||
        response?.dadosEndereco ||
        {};

    return {
      id: igreja?.id,
      nome: igreja?.nome || "",
      nomeUnico: igreja?.nomeUnico || "",
      paroco: igreja?.paroco || "",
      missas: igreja?.missas || [],
      contato: igreja?.contato || {
        emailContato: "",
        ddd: "",
        telefone: "",
        dddWhatsApp: "",
        telefoneWhatsApp: "",
      },
      redesSociais: igreja?.redesSociais || [],
      endereco,
      ativo: igreja?.ativo ?? true,
      imagemUrl: igreja?.imagemUrl || igreja?.imagem || "",
    };
  };
  
  const limparEndereco = () => {
    setEndereco({});
  };

  const handleEditarIgrejaCep = async (igreja) => {
    if (!igreja?.nomeUnico) {
      setMessage(["Nome único da igreja não informado."]);
      return;
    }

    setCepLoading(true);

    try {
      const igrejaCompleta = await buscarIgrejaCompletaPorNomeUnico(
          igreja.nomeUnico
      );

      setIgrejasCepModalOpen(false);

      navigate("/igrejaEditar", {
        state: {
          row: normalizarIgrejaParaEdicao(igrejaCompleta),
        },
      });
    } catch (error) {
      console.error("Erro ao buscar igreja completa:", error);
      setMessage([
        error.response?.data?.data?.messagemAplicacao ||
        error.response?.data?.message ||
        "Não foi possível carregar os dados completos da igreja para edição.",
      ]);
    } finally {
      setCepLoading(false);
    }
  };

  const handleBuscarPorCep = async () => {
    const cep = endereco?.cep;

    if (!cep) {
      setMessage(["Informe o CEP para realizar a busca."]);
      return;
    }

    const cepNumeros = apenasNumeros(cep);

    setCepLoading(true);

    try {
      const response = await api.get(`/api/v2/Igreja/buscar-por-cep/${cepNumeros}`);

      const igrejas = response.data?.data || [];

      if (Array.isArray(igrejas) && igrejas.length > 0) {
        setIgrejasEncontradasCep(igrejas);
        setIgrejasCepModalOpen(true);
        return;
      }

      setMessage(["Nenhuma igreja encontrada para este CEP."]);
      
    } catch (error) {
      const responseData = error.response?.data?.data || {};
      const mensagemAplicacao = responseData.messagemAplicacao || "";
      const enderecoResponse = responseData.endereco;

      if (
          error.response?.status === 404 &&
          mensagemAplicacao === "Preencher campos do endereço!" &&
          enderecoResponse
      ) {
        preencherEndereco(enderecoResponse, cep);
        setMessage(["Endereço encontrado. Preencha os demais campos da igreja."]);
        return;
      }

      setMessage([
        mensagemAplicacao ||
        error.response?.data?.message ||
        "Erro ao buscar informações pelo CEP.",
      ]);
    } finally {
      setCepLoading(false);
    }
  };

  const handleGeocode = async () => {
    const { logradouro, numero, bairro, localidade, uf } = endereco || {};
    const addressParts = [logradouro, numero, bairro, localidade, uf].filter(Boolean);

    if (addressParts.length < 3) {
      setMessage([
        "Por favor, preencha pelo menos Logradouro, Localidade e UF para buscar coordenadas.",
      ]);
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

      setMessage(["Coordenadas encontradas com sucesso!"]);
    } else {
      setMessage(["Erro ao buscar coordenadas. Verifique o endereço."]);
    }
  };

  const handleBuscarCepReverso = async () => {
    const { uf, localidade, logradouro, bairro } = endereco || {};

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
      const response = await api.post(
          "/api/v1/Admin/igreja/endereco/reverso",
          requestData
      );

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

  const handleChangeRedeSociais = (field, value) => {
    setFormDataRedeSociais((prev) => ({ ...prev, [field]: value }));
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
         setMessage([formatarErroApi(data.errors)]);
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
        <Box
            component="form"
            display="flex"
            flexDirection="column"
            gap={2}
            sx={{
              margin: "0 auto",
              padding: 2,
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 3,
              width: "100%",
              boxSizing: "border-box",
              backgroundColor: "background.default",
            }}
        >
          <EnderecoForm
              endereco={enderecoAtual}
              setEndereco={setEndereco}
              onBuscarPorCep={handleBuscarPorCep}
              cepLoading={cepLoading}
              onBuscarCepReverso={handleBuscarCepReverso}
              cepReversoLoading={cepReversoLoading}
              geoLoading={geoLoading}
              onBuscarCoordenadas={handleGeocode}
              geoError={geoError}
              openCepReverso={openCepReverso}
              onCloseCepReverso={() => setOpenCepReverso(false)}
              candidatosCep={candidatosCep}
              onSelectCepCandidato={handleSelectCepCandidato}
              cepReversoError={cepReversoError}
          />


          <SectionCard
              title="Dados da Igreja"
              subtitle="Informe os dados principais da igreja."
          >
            <Box display="flex" flexDirection="column" gap={2}>
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
            </Box>
          </SectionCard>

          <SectionCard
              title="Imagem"
              subtitle="Faça upload, cole uma imagem ou converta por URL."
              sx={{
                maxWidth: 620,
                margin: "0 auto",
              }}
          >
            <Box display="flex" flexDirection="column" gap={2}>
              <Button variant="outlined" component="label">
                Selecionar Imagem
                <input
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={handleFileChange}
                />
              </Button>

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
                            setMessage(["Erro ao processar imagem colada."]);
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
                              setMessage(["Erro ao processar imagem colada do HTML."]);
                            }
                          }
                        });
                      }
                    }
                  }}
                  fullWidth
              />

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
                        setMessage(["Não foi possível converter a URL."]);
                      }
                    }}
                >
                  Converter
                </Button>
              </Box>

              {fileName && (
                  <Typography variant="body2">
                    Arquivo selecionado: {fileName}
                  </Typography>
              )}

              <TextField
                  label="Base64 da Imagem"
                  value={base64}
                  multiline
                  rows={4}
                  InputProps={{ readOnly: true }}
                  fullWidth
                  disabled
              />

              {base64 && (
                  <Box
                      component="img"
                      src={`data:image/png;base64,${base64}`}
                      alt="Preview"
                      sx={{
                        maxWidth: "100%",
                        border: "1px solid #ccc",
                        borderRadius: 2,
                      }}
                  />
              )}
            </Box>
          </SectionCard>

          <MissaForm
              missas={missas}
              setMissas={setMissas}
              onError={handleShowError}
          />

          <ContatoForm
              contato={formData.contato}
              onChange={(contatoAtualizado) =>
                  handleChange("contato", contatoAtualizado)
              }
          />

          <RedesSociaisCriarSection
              redesSociais={redeSociais}
              formDataRedeSociais={formDataRedeSociais}
              onChange={handleChangeRedeSociais}
              onAdd={handleAddRedeSocial}
              onDelete={handleDeleteRedeSocial}
          />

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
              <Box
                  sx={{
                    border: "1px solid",
                    borderColor: "error.light",
                    backgroundColor: "error.lighter",
                    p: 2,
                    borderRadius: 2,
                  }}
              >
                <Typography fontWeight={700} color="error" sx={{ mb: 1 }}>
                  Erros de Validação:
                </Typography>

                {Object.entries(message).map(([field, messages]) => (
                    <ErrorSpan
                        key={field}
                        errorMessage={messages}
                        field={field}
                        severity="error"
                    />
                ))}
              </Box>
          )}
        </Box>

        <IgrejasCepModal
            open={igrejasCepModalOpen}
            igrejas={igrejasEncontradasCep}
            loading={cepLoading}
            onClose={() => setIgrejasCepModalOpen(false)}
            onEditar={handleEditarIgrejaCep}
        />
      </>
  );
};

export default IgrejaCriar;
