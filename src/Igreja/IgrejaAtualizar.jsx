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
  Paper,
  IconButton,
  Tooltip,
} from "@mui/material";
import { ArrowBack, ContentCopy } from "@mui/icons-material";
import api from "../services/apiService";
import { apenasNumeros, formatarErroApi, removerMissasDuplicadas } from "../utils";
import ErrorSpan from "../ErrorSpan";
import { useLocation, useNavigate } from "react-router-dom";
import { useEndereco } from "../Context/EnderecoContext";
import { useGeocode } from "../hooks/useGeocode";
import MissaForm from "./Components/MissaForm";
import SessaoForm from "./Components/SessaoForm";
import ContatoForm from "./Components/ContatoForm";
import EnderecoForm from "./Components/EnderecoForm";
import RedesSociaisSection from "./Components/RedesSociaisSection";
import SectionCard from "./Components/SectionCard";
import Grid from "@mui/material/Grid2";
import ImagemSection from "./Components/ImagemSection";
import useImagemIgreja from "../hooks/useImagemIgreja";
import { useAlteracoesNaoSalvas, useNavegacaoProtegida } from "../Context/UnsavedChangesContext";
import StatusChip from "../Components/StatusChip";
import IgrejasCepModal from "./Components/IgrejasCepModal";
import ReportarProblemaModal from "./Components/ReportarProblemaModal";
import IgrejaMetricasTab from "./Components/IgrejaMetricasTab";
import IgrejaCircunscricaoTab from "./Components/IgrejaCircunscricaoTab";
import IgrejaHierarquiaTab from "./Components/IgrejaHierarquiaTab";
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
    sessoes: row?.sessoes || [],
    contato: row?.contato || criarContatoVazio(),
    redesSociais: row?.redesSociais || [],
    endereco: row?.endereco || row?.dadosEndereco || {},
    ativo: row?.ativo ?? true,
    imagemUrl: row?.imagemUrl || row?.imagem || "",
    emailCriacaoEnviado: row?.emailCriacaoEnviado ?? false,
    temResponsavelAprovado: row?.temResponsavelAprovado ?? false,
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
  const [formDataSessoes, setFormDataSessoes] = useState(state?.row?.sessoes || []);
  const {
    base64, fileName, urlInput, setUrlInput, imagemAlterada, imagemMimeType,
    handleFileChange, blobToBase64, limparImagem, removerImagem,
  } = useImagemIgreja();
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
  const emailContatado = canaisContatados.has(1);
  const instagramContatado = canaisContatados.has(2);
  const facebookContatado = canaisContatados.has(3);


  // Carregar endereço do formData quando o componente monta
  useEffect(() => {
    const igrejaNormalizada = normalizarIgrejaRecebida(state?.row);

    setFormData(igrejaNormalizada);
    setFormDataRedeSociais(igrejaNormalizada.redesSociais || []);
    setformDataMissas(igrejaNormalizada.missas || []);
    setFormDataSessoes(igrejaNormalizada.sessoes || []);
    setEndereco(igrejaNormalizada.endereco || {});
    limparImagem();
    setMessage(errorMensage());
  }, [state?.row]);

  const navegarProtegido = useNavegacaoProtegida();
  const { sujo, marcarSalvo } = useAlteracoesNaoSalvas(
    JSON.stringify({ formData, endereco, formDatamissas, formDataSessoes, formDataRedeSociais, base64 }),
    state?.row
  );

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
      sessoes: igreja?.sessoes || [],
      contato: igreja?.contato || criarContatoVazio(),
      redesSociais: igreja?.redesSociais || [],
      endereco,
      ativo: igreja?.ativo ?? true,
      imagemUrl: igreja?.imagemUrl || igreja?.imagem || "",
      temResponsavelAprovado: igreja?.temResponsavelAprovado ?? false,
    };
  };
  


  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
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
    removerImagem();
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
          latitude: endereco.latitude === "" ? null : endereco.latitude,
          longitude: endereco.longitude === "" ? null : endereco.longitude,
        }
        : null;

    const req = {
      id: formData.id,
      nome: formData.nome,
      paroco: formData.paroco,
      missas: removerMissasDuplicadas(formDatamissas),
      contato,
      redeSociais: formDataRedeSociais,
      endereco: enderecoSanitizado,
      ativo: formData?.ativo ?? false,
    };

    // Só envia sessões quando a seção está habilitada (igreja com responsável
    // aprovado) — o backend também valida isso, mas evitamos mandar um campo
    // que nem apareceu na tela.
    if (formData?.temResponsavelAprovado) {
      req.sessoes = formDataSessoes;
    }

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
          marcarSalvo();
          // O backend recalcula o cidadeSlug (e, na primeira vez, slug/nomeUnico)
          // a cada edição — sem sincronizar aqui, o link exibido para compartilhar
          // ficava com o cidadeSlug antigo até a tela ser recarregada.
          // Marca o e-mail como já contatado nesta sessão — sem isso, o modal
          // reaparecia a cada "Salvar" seguinte (IgrejaContatosHistorico só
          // recarrega no mount, não depois de um novo evento registrado agora).
          if (tipoEmailContato) {
            setCanaisContatados((prev) => new Set(prev).add(1));
          }

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
      (emailContato && !emailContatado) ||
      (urlInstagram && !instagramContatado) ||
      (urlFacebook && !facebookContatado);

    if (temCanalPendente && formData?.ativo) {
      setDivulgacaoOpcaoEmail("");
      setEmailContatoModalOpen(true);
      return;
    }

    atualizarIgreja();
  };

  const handleCopiarLink = () => {
    const link = construirLinkIgreja({ ...formData, endereco });
    navigator.clipboard
      .writeText(link)
      .then(() => {
        setMessage({ mensagem: "Link copiado!", severity: "success", show: true });
      })
      .catch(() => {
        setMessage({ mensagem: "Não foi possível copiar o link.", severity: "error", show: true });
      });
  };

  return (
    <>
      <Paper
        variant="outlined"
        sx={{ p: 2, mb: 2, borderRadius: 2, position: "sticky", top: 0, zIndex: 10 }}
      >
        <Stack direction="row" alignItems="center" spacing={1.5} flexWrap="wrap" useFlexGap>
          <Typography variant="h5" fontWeight={700}>
            {formData.nome || "Editar Igreja"}
          </Typography>
          {formData.id && (
            <Chip label={`#${formData.id}`} size="small" variant="outlined" />
          )}
        </Stack>

        {formData.nomeUnico && (
          <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mt: 1 }}>
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
            <Tooltip title="Copiar link">
              <IconButton aria-label="Copiar link" size="small" onClick={handleCopiarLink}>
                <ContentCopy fontSize="inherit" />
              </IconButton>
            </Tooltip>
          </Stack>
        )}
      </Paper>

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
      <Box component="form" display="flex" flexDirection="column" gap={2} sx={{ width: "100%" }}>
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

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 8 }}>
                <TextField
                    label="Nome da Igreja"
                    value={formData.nome}
                    onChange={(e) => handleChange("nome", e.target.value)}
                    fullWidth
                    required
                />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                    label="Pároco"
                    value={formData.paroco}
                    onChange={(e) => handleChange("paroco", e.target.value)}
                    fullWidth
                />
              </Grid>
            </Grid>
          </Box>
        </SectionCard>
        <SectionCard
            title="Hierarquia"
            subtitle="Tipo da unidade (Paróquia/Capela/Comunidade/Santuário/Outro) e paróquia-sede."
        >
          <IgrejaHierarquiaTab igrejaId={formData.id} uf={endereco?.uf} />
        </SectionCard>
        <SectionCard
            title="Diocese / Arquidiocese"
            subtitle="Circunscrição eclesiástica desta igreja, e capelas/comunidades vinculadas."
        >
          <IgrejaCircunscricaoTab igrejaId={formData.id} />
        </SectionCard>
        <ImagemSection
            base64={base64}
            fileName={fileName}
            imagemMimeType={imagemMimeType}
            imagemUrl={formData.imagemUrl}
            urlInput={urlInput}
            setUrlInput={setUrlInput}
            onFileChange={handleFileChange}
            blobToBase64={blobToBase64}
            onError={(msg) => setMessage({ mensagem: [msg], severity: "error", show: true })}
            onRemove={handleRemoverImagem}
        />

        {/* Sessão de Missas */}
        <MissaForm
            missas={formDatamissas}
            setMissas={setformDataMissas}
            onError={handleShowError}
        />

        {/* Secretaria/confissão — só quando a igreja já tem responsável aprovado */}
        {formData?.temResponsavelAprovado && (
          <SessaoForm
              sessoes={formDataSessoes}
              setSessoes={setFormDataSessoes}
              onError={handleShowError}
          />
        )}

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
        <Box display="flex" gap={2} sx={{
            position: "sticky",
            bottom: 0,
            zIndex: 5,
            py: 1.5,
            px: 2,
            bgcolor: "background.paper",
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 2,
          }}>
          <Button
            variant="outlined"
            color="inherit"
            startIcon={<ArrowBack />}
            onClick={() => navegarProtegido(-1)}
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
          {sujo && <StatusChip label="Alterações não salvas" color="warning" sx={{ alignSelf: "center" }} />}
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
        emailCriacaoEnviado={emailContatado}
        urlInstagram={urlInstagram}
        urlFacebook={urlFacebook}
        instagramContatado={instagramContatado}
        facebookContatado={facebookContatado}
        loading={loading}
        opcaoEmail={divulgacaoOpcaoEmail}
        onOpcaoEmailChange={setDivulgacaoOpcaoEmail}
        onConfirmar={() => atualizarIgreja(divulgacaoOpcaoEmail || null)}
        onContatoRegistrado={(canal) => setCanaisContatados((prev) => new Set(prev).add(canal))}
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
