import { useState } from "react";
import {
    TextField,
    InputAdornment,
    IconButton,
    Tooltip,
    CircularProgress,
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import { OpenInNew, CheckCircle, Cancel, TravelExplore, Clear } from "@mui/icons-material";
import SectionCard from "./SectionCard";
import { apenasNumeros } from "../../utils";
import api from "../../services/apiService";

const normalizarUrlWebsite = (valor) => {
    const texto = (valor || "").trim();
    if (!texto) return "";
    return texto.includes("://") ? texto : `https://${texto}`;
};

const ContatoForm = ({ contato = {}, onChange }) => {
    const [verificando, setVerificando] = useState(false);
    const [resultadoVerificacao, setResultadoVerificacao] = useState(null);

    const handleChange = (field, value) => {
        onChange({
            ...contato,
            [field]: value,
        });
        if (field === "website") setResultadoVerificacao(null);
    };

    const handleTelefoneChange = (dddField, telefoneField) => (e) => {
        const digitos = apenasNumeros(e.target.value);
        onChange({
            ...contato,
            [dddField]: digitos.slice(0, 2),
            [telefoneField]: digitos.slice(2),
        });
    };

    const handleLimparCampo = (...campos) => () => {
        const limpo = { ...contato };
        campos.forEach((campo) => { limpo[campo] = ""; });
        onChange(limpo);
        if (campos.includes("website")) setResultadoVerificacao(null);
    };

    const botaoLimpar = (visivel, onClick) =>
        visivel && (
            <InputAdornment position="end">
                <Tooltip title="Limpar campo">
                    <IconButton onClick={onClick} edge="end" size="small">
                        <Clear fontSize="small" />
                    </IconButton>
                </Tooltip>
            </InputAdornment>
        );

    const handleVerificarSite = async () => {
        if (!contato.website?.trim()) return;

        setVerificando(true);
        setResultadoVerificacao(null);

        try {
            const response = await api.get("/api/v1/admin/igreja/verificar-site", {
                params: { url: contato.website },
            });
            const { online, mensagem } = response.data?.data || {};
            setResultadoVerificacao({ online, mensagem });
        } catch {
            setResultadoVerificacao({
                online: false,
                mensagem: "Não foi possível verificar o site agora.",
            });
        } finally {
            setVerificando(false);
        }
    };

    const renderIconeResultado = () => {
        if (verificando) return <CircularProgress size={20} />;
        if (!resultadoVerificacao) return null;

        return (
            <Tooltip title={resultadoVerificacao.mensagem}>
                {resultadoVerificacao.online ? (
                    <CheckCircle color="success" fontSize="small" />
                ) : (
                    <Cancel color="error" fontSize="small" />
                )}
            </Tooltip>
        );
    };

    return (
        <SectionCard
            title="Contato"
            subtitle="Informe os dados de contato da igreja."
        >
            <Grid container spacing={2}>
                <Grid size={12}>
                    <TextField
                        label="Email de Contato"
                        value={contato.emailContato || ""}
                        onChange={(e) => handleChange("emailContato", e.target.value.replace(/\s/g, ""))}
                        fullWidth
                        slotProps={{
                            input: {
                                endAdornment: botaoLimpar(
                                    !!contato.emailContato,
                                    handleLimparCampo("emailContato")
                                ),
                            },
                        }}
                    />
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                        label="Telefone"
                        value={`${contato.ddd || ""}${contato.telefone || ""}`}
                        onChange={handleTelefoneChange("ddd", "telefone")}
                        fullWidth
                        slotProps={{
                            input: {
                                endAdornment: botaoLimpar(
                                    !!(contato.ddd || contato.telefone),
                                    handleLimparCampo("ddd", "telefone")
                                ),
                            },
                        }}
                    />
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                        label="Telefone WhatsApp"
                        value={`${contato.dddWhatsApp || ""}${contato.telefoneWhatsApp || ""}`}
                        onChange={handleTelefoneChange("dddWhatsApp", "telefoneWhatsApp")}
                        fullWidth
                        slotProps={{
                            input: {
                                endAdornment: botaoLimpar(
                                    !!(contato.dddWhatsApp || contato.telefoneWhatsApp),
                                    handleLimparCampo("dddWhatsApp", "telefoneWhatsApp")
                                ),
                            },
                        }}
                    />
                </Grid>

                <Grid size={12}>
                    <TextField
                        label="Website"
                        value={contato.website || ""}
                        onChange={(e) => handleChange("website", e.target.value.trim())}
                        fullWidth
                        slotProps={{
                            input: {
                                endAdornment: contato.website?.trim() && (
                                    <InputAdornment position="end">
                                        {renderIconeResultado()}

                                        <Tooltip title="Verificar se o site responde">
                                            <span>
                                                <IconButton
                                                    onClick={handleVerificarSite}
                                                    disabled={verificando}
                                                    edge="end"
                                                    size="small"
                                                >
                                                    <TravelExplore fontSize="small" />
                                                </IconButton>
                                            </span>
                                        </Tooltip>

                                        <Tooltip title="Abrir em nova aba para conferir manualmente">
                                            <IconButton
                                                component="a"
                                                href={normalizarUrlWebsite(contato.website)}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                edge="end"
                                                size="small"
                                            >
                                                <OpenInNew fontSize="small" />
                                            </IconButton>
                                        </Tooltip>

                                        <Tooltip title="Limpar campo">
                                            <IconButton
                                                onClick={handleLimparCampo("website")}
                                                edge="end"
                                                size="small"
                                            >
                                                <Clear fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                    </InputAdornment>
                                ),
                            },
                        }}
                    />
                </Grid>
            </Grid>
        </SectionCard>
    );
};

export default ContatoForm;
