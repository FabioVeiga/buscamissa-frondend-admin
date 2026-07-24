import { useState, useEffect } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  Switch,
  FormControlLabel,
  CircularProgress,
  Stack,
  Tabs,
  Tab,
  Alert,
  AlertTitle,
  Link,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
} from "@mui/material";
import { ArrowBack } from "@mui/icons-material";
import api from "../services/apiService";
import { apenasNumeros, formatarErroApi } from "../utils";
import ErrorSpan from "../ErrorSpan";
import { useLocation, useNavigate } from "react-router-dom";
import { useEndereco } from "../Context/EnderecoContext";
import { useGeocode } from "../hooks/useGeocode";
import MissaForm from "./Components/MissaForm";
import ContatoForm from "./Components/ContatoForm";
import EnderecoForm from "./Components/EnderecoForm";
import RedesSociaisSection from "./Components/RedesSociaisSection";
import SectionCard from "./Components/SectionCard";
import IgrejasCepModal from "./Components/IgrejasCepModal";
import ReportarProblemaModal from "./Components/ReportarProblemaModal";
import IgrejaMetricasTab from "./Components/IgrejaMetricasTab";
import AssistenteDivulgacao from "./Components/AssistenteDivulgacao";
import IgrejaContatosHistorico from "./Components/IgrejaContatosHistorico";
import { construirLinkIgreja } from "../services/mensagemDivulgacao";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";


const IgrejaAtualizar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { state } = location || {};
  const { endereco, setEndereco } = useEndereco();
  const { geocode, loading: geoLoading, error: geoError } = useGeocode();

  const criarContatoVazio = () => ({
    emailContato: "",
    ddd: "",
    telefone: "",
    dddWhatsApp: "",
    telefoneWhatsApp: "",
  });

  const normalizarIgrejaRecebida = (row) => ({
    id: row?.id,
    nome: row?.nome || "",
    nomeUnico: row?.nomeUnico || "",
    slug: row?.slug || "",
    paroco: row?.paroco || "",
    missas: row?.missas || [],
    contato: row?.contato || criarContatoVazio(),
    redesSociais: row?.redesSociais || [],
    endereco: row?.endereco || row?.dadosEndereco || {},
    ativo: row?.ativo ?? true,
    imagemUrl: row?.imagemUrl || row?.imagem || "",
    emailCriacaoEnviado: row?.emailCriacaoEnviado ?? false,
  });

  const [formData, setFormData] = useState(() =>
      normalizarIgrejaRecebida(state?.row)
  );
  const [formDataRedeSociais, setFormDataRedeSociais] = useState(
      state?.row?.redesSociais || []
  );
  
  const errorMensage = () => ({
    mensagem: "",
    severity: "",
    show: false,
  });

  const [message, setMessage] = useState(errorMensage);
  const [confirmarSemMissaAberto, setConfirmarSemMissaAberto] = useState(false);
  const [formDatamissas, setformDataMissas] = useState(state?.row?.missas || []);
  const [missas, setMissas] = useState([]);
  const [base64, setBase64] = useState("");
  const [fileName, setFileName] = useState("");
  const [urlInput, setUrlInput] = useState("");
  const [imagemAlterada, setImagemAlterada] = useState(false);
  const [imagemMimeType, setImagemMimeType] = useState("image/png");
  const [loading, setLoading] = useState(false);
  const [openCepReverso, setOpenCepReverso] = useState(false);
  const [candidatosCep, setCandidatosCep] = useState([]);
  const [cepReversoLoading, setCepReversoLoading] = useState(false);
  const [cepReversoError, setCepReversoError] = useState("");
  const [cepLoading, setCepLoading] = useState(false);
  const [igrejasCepModalOpen, setIgrejasCepModalOpen] = useState(false);
  const [modalReportarProblemaOpen, setModalReportarProblemaOpen] = useState(false);
  const [igrejasEncontradasCep, setIgrejasEncontradasCep] = useState([]);
  const [enderecoResolvidoCep, setEnderecoResolvidoCep] = useState(null);
  const [emailContatoModalOpen, setEmailContatoModalOpen] = useState(false);
  const [abaAtiva, setAbaAtiva] = useState(0);

  // Assistente de Divulgação
  const [divulgacaoOpcaoEmail, setDivulgacaoOpcaoEmail] = useState("");
  const [canaisContatados, setCanaisContatados] = useState(new Set());
  const instagramContatado = canaisContatados.has(2);
  const facebookContatado = canaisContatados.has(3);


  // Carregar endereço do formData quando o componente monta
  useEffect(() => {
    const igrejaNormalizada = normalizarIgrejaRecebida(state?.row);

    setFormData(igrejaNormalizada);
    setFormDataRedeSociais(igrejaNormalizada.redesSociais || []);
    setformDataMissas(igrejaNormalizada.missas || []);
    setEndereco(igrejaNormalizada.endereco || {});
    setBase64("");
    setFileName("");
    setUrlInput("");
    setImagemAlterada(false);
    setMessage(errorMensage());
  }, [state?.row]);

  const handleShowError = (mensagem) => {
    setMessage({
      mensagem,
      severity: "error",
      show: true,
    });
  };

  const handleEditarIgrejaCep = async (igreja) => {
    if (!igreja?.id) {
      setMessage({
        mensagem: "Id da igreja não informado.",
        severity: "error",
        show: true,
      });
      return;
    }

    setCepLoading(true);

    try {
      const igrejaCompleta = await buscarIgrejaCompletaPorId(igreja.id);

      setIgrejasCepModalOpen(false);

      navigate("/igrejaEditar", {
        replace: true,
        state: {
          row: normalizarIgrejaParaEdicao(igrejaCompleta),
        },
      });
    } catch (error) {
      console.error("Erro ao buscar igreja completa:", error);
      setMessage({
        mensagem:
            error.response?.data?.data?.messagemAplicacao ||
            error.response?.data?.message ||
            "Não foi possível carregar os dados completos da igreja para edição.",
        severity: "error",
        show: true,
      });
    } finally {
      setCepLoading(false);
    }
  };

  const handleBuscarPorCep = async () => {
    const cep = endereco?.cep;

    if (!cep) {
      setMessage({
        mensagem: "Informe o CEP para realizar a busca.",
        severity: "error",
        show: true,
      });
      return;
    }

    const cepNumeros = apenasNumeros(cep);

    setCepLoading(true);

    try {
      const response = await api.get(`/api/v2/Igreja/buscar-por-cep/${cepNumeros}`);

      const igrejas = response.data?.data || [];

      if (Array.isArray(igrejas) && igrejas.length > 0) {
        setIgrejasEncontradasCep(igrejas);
        setEnderecoResolvidoCep(igrejas[0]?.dadosEndereco || null);
        setIgrejasCepModalOpen(true);
        return;
      }

      setMessage({
        mensagem: "Nenhuma igreja encontrada para este CEP.",
        severity: "error",
        show: true,
      });

      setMessage({
        mensagem: "Nenhuma igreja encontrada para este CEP.",
        severity: "error",
        show: true,
      });
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
        setMessage({
          mensagem: "Endereço encontrado. Preencha os demais campos da igreja.",
          severity: "success",
          show: true,
        });
        return;
      }

      setMessage({
        mensagem:
            mensagemAplicacao ||
            error.response?.data?.message ||
            "Erro ao buscar informações pelo CEP.",
        severity: "error",
        show: true,
      });
    } finally {
      setCepLoading(false);
    }
  };

  // Aplica o endereço real (resolvido via ViaCEP) direto no formulário da igreja
  // atual, sem precisar navegar para nenhuma das igrejas listadas no modal.
  const handleUsarEnderecoCep = (enderecoResponse) => {
    preencherEndereco(enderecoResponse);
    setIgrejasCepModalOpen(false);
    setMessage({
      mensagem: "Endereço aplicado. Confira os campos antes de salvar.",
      severity: "success",
      show: true,
    });
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

  const limparEndereco = () => {
    setEndereco({});
  };

  const buscarIgrejaCompletaPorId = async (id) => {
    if (!id) {
      throw new Error("Id da igreja não informado.");
    }

    const response = await api.get(`/api/v2/Igreja/admin/${id}`);
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
      slug: igreja?.slug || "",
      paroco: igreja?.paroco || "",
      missas: igreja?.missas || [],
      contato: igreja?.contato || criarContatoVazio(),
      redesSociais: igreja?.redesSociais || [],
      endereco,
      ativo: igreja?.ativo ?? true,
      imagemUrl: igreja?.imagemUrl || igreja?.imagem || "",
    };
  };
  
  const selecionarIgrejaPorCep = (igrejas) => {
    if (!Array.isArray(igrejas) || igrejas.length === 0) return null;

    if (igrejas.length === 1) {
      const desejaEditar = window.confirm(
          `Já existe uma igreja cadastrada para este CEP:\n\n${igrejas[0].nome}\n\nDeseja ser redirecionado para a edição?`
      );

      return desejaEditar ? igrejas[0] : null;
    }

    const opcoes = igrejas
        .map((igreja, index) => `${index + 1} - ${igreja.nome}`)
        .join("\n");

    const escolha = window.prompt(
        `Foram encontradas ${igrejas.length} igrejas para este CEP.\n\nDigite o número da igreja que deseja editar:\n\n${opcoes}`
    );

    if (!escolha) return null;

    const indexSelecionado = Number(escolha) - 1;

    if (Number.isNaN(indexSelecionado) || !igrejas[indexSelecionado]) {
      setMessage({
        mensagem: "Opção inválida.",
        severity: "error",
        show: true,
      });
      return null;
    }

    return igrejas[indexSelecionado];
  };



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
        const fullBase64 = e.target.result;
        const base64String = fullBase64.split(",")[1]; // Remove o cabeçalho 'data:image/jpeg;base64,'
        setBase64(base64String);
        setFileName(file.name);
        setImagemMimeType(file.type || "image/png");
        setImagemAlterada(true);
        console.log("Imagem alterada:", { fileName: file.name, mimeType: file.type, base64Length: base64String.length });
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
          setImagemMimeType(blob.type || "image/png");
          setImagemAlterada(true);
          console.log("Blob convertido:", { name, mimeType: blob.type, base64Length: base64String.length });
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

  const handleGeocode = async () => {
    const { logradouro, numero, bairro, localidade, uf } = endereco;
    const addressParts = [logradouro, numero, bairro, localidade, uf].filter(Boolean);
    
    if (addressParts.length < 3) {
      setMessage({
        mensagem: "Por favor, preencha pelo menos Logradouro, Localidade e UF para buscar coordenadas.",
        severity: "error",
        show: true,
      });
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
      setMessage({
        mensagem: "Coordenadas encontradas com sucesso!",
        severity: "success",
        show: true,
      });
    } else {
      setMessage({
        mensagem: "Erro ao buscar coordenadas. Verifique o endereço.",
        severity: "error",
        show: true,
      });
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

  const handleRemoverImagem = () => {
    console.log("Removendo imagem");
    setBase64("");
    setFileName("");
    setUrlInput("");
    setImagemMimeType("image/png");
    setImagemAlterada(true);
    setFormData((prev) => ({ ...prev, imagemUrl: "" }));
  };


  const montarPayloadAtualizacao = (tipoEmailContato = null) => {
    const contato = formData.contato
        ? {
          ...formData.contato,
          ddd: apenasNumeros(formData.contato.ddd),
          telefone: apenasNumeros(formData.contato.telefone),
          dddWhatsApp: apenasNumeros(formData.contato.dddWhatsApp),
          telefoneWhatsApp: apenasNumeros(formData.contato.telefoneWhatsApp),
        }
        : null;

    const enderecoSanitizado = endereco
        ? {
          ...endereco,
          cep: apenasNumeros(endereco.cep),
        }
        : null;

    const req = {
      id: formData.id,
      nome: formData.nome,
      paroco: formData.paroco,
      missas: formDatamissas,
      contato,
      redeSociais: formDataRedeSociais,
      endereco: enderecoSanitizado,
      ativo: formData?.ativo ?? false,
    };

    // Apenas incluir imagem se foi alterada
    if (imagemAlterada) {
      req.imagem = base64;
      console.log("Payload de atualização com imagem:", {
        imagemAlterada,
        base64Length: base64?.length || 0,
        imagemUrl: formData.imagemUrl
      });
    } else {
      console.log("Payload de atualização SEM imagem (não foi alterada)");
    }

    if (tipoEmailContato) {
      req.tipoEmailContato = tipoEmailContato;
    }

    return req;
  };

  const atualizarIgreja = (tipoEmailContato = null) => {
    setLoading(true);

    const req = montarPayloadAtualizacao(tipoEmailContato);

    api
        .put("/api/v1/Admin/igreja/atualizar", req)
        .then((response) => {
          // O backend recalcula o cidadeSlug (e, na primeira vez, slug/nomeUnico)
          // a cada edição — sem sincronizar aqui, o link exibido para compartilhar
          // ficava com o cidadeSlug antigo até a tela ser recarregada.
          const igrejaAtualizada = response.data?.data?.response;
          if (igrejaAtualizada) {
            setFormData((prev) => ({
              ...prev,
              slug: igrejaAtualizada.slug ?? prev.slug,
              nomeUnico: igrejaAtualizada.nomeUnico ?? prev.nomeUnico,
              emailCriacaoEnviado: igrejaAtualizada.emailCriacaoEnviado ?? prev.emailCriacaoEnviado,
            }));
            if (igrejaAtualizada.endereco) {
              setEndereco((prev) => ({
                ...prev,
                cidadeSlug: igrejaAtualizada.endereco.cidadeSlug,
              }));
            }
          }

          setMessage({
            mensagem: "Igreja atualizada com sucesso!",
            severity: "success",
            show: true,
          });
        })
        .catch((error) => {
          console.log(error);
          var data = error.response.data.errors;
          if (data) {
            setMessage({
              mensagem: formatarErroApi(data),
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
        })
        .finally(() => {
          setLoading(false);
          setEmailContatoModalOpen(false);
        });
  };

  const _redeSocialVal = (r) => r?.url || r?.nomeDoPerfil || "";
  const urlInstagram = _redeSocialVal(formDataRedeSociais.find((r) => Number(r.tipoRedeSocial) === 2));
  const urlFacebook = _redeSocialVal(formDataRedeSociais.find((r) => Number(r.tipoRedeSocial) === 1));

  const handleSubmit = () => {
    if (!formDatamissas || formDatamissas.length === 0) {
      setConfirmarSemMissaAberto(true);
      return;
    }

    prosseguirAposValidarMissas();
  };

  const prosseguirAposValidarMissas = () => {
    setConfirmarSemMissaAberto(false);

    const emailContato = formData?.contato?.emailContato?.trim();
    const temCanalPendente =
      emailContato ||
      (urlInstagram && !instagramContatado) ||
      (urlFacebook && !facebookContatado);

    if (temCanalPendente && formData?.ativo) {
      setDivulgacaoOpcaoEmail("");
      setEmailContatoModalOpen(true);
      return;
    }

    atualizarIgreja();
  };
  
  return (
    <>
      {state?.row?.reportarProblema && (
        <Alert
          severity="warning"
          sx={{ mb: 2, whiteSpace: "pre-wrap" }}
          action={
            <Button
              color="warning"
              variant="outlined"
              size="small"
              onClick={() => setModalReportarProblemaOpen(true)}
              sx={{ whiteSpace: "nowrap" }}
            >
              Resolver problema
            </Button>
          }
        >
          <AlertTitle>
            Problema reportado por {state.row.reportarProblema.nome || "—"}
            {state.row.reportarProblema.email && ` (${state.row.reportarProblema.email})`}
          </AlertTitle>
          {state.row.reportarProblema.descricao}
        </Alert>
      )}

      {formData.nomeUnico && (
        <Box sx={{ mb: 2, display: "flex", alignItems: "center", gap: 0.5 }}>
          <Typography variant="body2" color="text.secondary">
            Página no site:
          </Typography>
          <Link
            href={construirLinkIgreja({ ...formData, endereco })}
            target="_blank"
            rel="noopener noreferrer"
            variant="body2"
            sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
          >
            {construirLinkIgreja({ ...formData, endereco })}
            <OpenInNewIcon fontSize="inherit" />
          </Link>
        </Box>
      )}

      <Tabs
        value={abaAtiva}
        onChange={(event, novaAba) => setAbaAtiva(novaAba)}
        sx={{ mb: 2 }}
      >
        <Tab label="Dados" />
        <Tab label="Métricas" />
      </Tabs>

      {abaAtiva === 1 ? (
        <IgrejaMetricasTab igrejaId={formData.id} />
      ) : (
      <SectionCard
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
        <EnderecoForm
            endereco={endereco}
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

        {/* Dados da Igreja */}
        <SectionCard
            title="Dados da Igreja"
            subtitle="Dados principais da igreja."
        >
          <Box display="flex" flexDirection="column" gap={2}>
            <Stack direction="row" spacing={1} alignItems="center">
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
              {state?.row?.temResponsavelAprovado && (
                <Chip
                    label="Tem responsável"
                    size="small"
                    color="primary"
                    variant="outlined"
                />
              )}
            </Stack>

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
                      setImagemMimeType(blob.type || "image/png");
                      setImagemAlterada(true);
                      console.log("URL convertida:", { urlInput, mimeType: blob.type, base64Length: base64String.length });
                    };
                    reader.readAsDataURL(blob);
                  } catch (err) {
                    console.error("Erro ao converter URL:", err);
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
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1, alignItems: "center" }}>
              <Box
                component="img"
                src={
                  base64 ? `data:${imagemMimeType};base64,${base64}` : formData.imagemUrl
                }
                alt="Preview"
                sx={{
                  maxWidth: "100%",
                  maxHeight: "200px",
                  objectFit: "contain",
                  border: "1px solid #ccc",
                  borderRadius: 1,
                }}
              />
              <Button
                variant="outlined"
                color="error"
                onClick={handleRemoverImagem}
              >
                Remover Imagem
              </Button>
            </Box>
          )}
        </SectionCard>

        {/* Sessão de Missas */}
        <MissaForm
            missas={formDatamissas}
            setMissas={setformDataMissas}
            onError={handleShowError}
        />

        <ContatoForm
            contato={formData.contato}
            onChange={(contatoAtualizado) => handleChange("contato", contatoAtualizado)}
        />

        {/* Redes Sociais */}
        <RedesSociaisSection
            redesSociais={formDataRedeSociais}
            igrejaId={formData.id}
            onAddRedeSocial={(novaRede) =>
                setFormDataRedeSociais((prev) => [...prev, novaRede])
            }
            onDeleteRedeSocial={(tipoRedeSocial) =>
                setFormDataRedeSociais((prev) =>
                    prev.filter((rede) => rede.tipoRedeSocial !== tipoRedeSocial)
                )
            }
        />

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
                Atualizando...
              </Stack>
            ) : (
              "Editar Igreja"
            )}
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
      </SectionCard>
      )}

      {abaAtiva === 0 && formData.id && (
        <Box sx={{ mt: 2 }}>
          <IgrejaContatosHistorico igrejaId={formData.id} onLoad={(_total, canais) => setCanaisContatados(canais)} />
        </Box>
      )}

      <IgrejasCepModal
          open={igrejasCepModalOpen}
          igrejas={igrejasEncontradasCep}
          endereco={enderecoResolvidoCep}
          loading={cepLoading}
          igrejaAtualId={formData.id}
          onClose={() => setIgrejasCepModalOpen(false)}
          onEditar={handleEditarIgrejaCep}
          onUsarEndereco={handleUsarEnderecoCep}
      />
      <AssistenteDivulgacao
        open={emailContatoModalOpen}
        onClose={() => setEmailContatoModalOpen(false)}
        igreja={{ ...formData, endereco }}
        emailCriacaoEnviado={formData?.emailCriacaoEnviado}
        urlInstagram={urlInstagram}
        urlFacebook={urlFacebook}
        instagramContatado={instagramContatado}
        facebookContatado={facebookContatado}
        loading={loading}
        opcaoEmail={divulgacaoOpcaoEmail}
        onOpcaoEmailChange={setDivulgacaoOpcaoEmail}
        onConfirmar={() => atualizarIgreja(divulgacaoOpcaoEmail || null)}
      />
      {state?.row?.reportarProblema && (
        <ReportarProblemaModal
          open={modalReportarProblemaOpen}
          onClose={() => setModalReportarProblemaOpen(false)}
          problemaId={state.row.reportarProblema.id}
          nome={state.row.reportarProblema.nome}
          email={state.row.reportarProblema.email}
          descricao={state.row.reportarProblema.descricao}
          onSuccess={() => setModalReportarProblemaOpen(false)}
        />
      )}

      <Dialog open={confirmarSemMissaAberto} onClose={() => setConfirmarSemMissaAberto(false)}>
        <DialogTitle>Salvar sem missa?</DialogTitle>
        <DialogContent>
          <Typography variant="body2">
            Nenhuma missa está cadastrada para esta igreja. Deseja continuar e salvar mesmo assim?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmarSemMissaAberto(false)}>Cancelar</Button>
          <Button variant="contained" onClick={prosseguirAposValidarMissas}>Continuar sem missa</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default IgrejaAtualizar;
