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
import { apenasNumeros, formatarTelefone } from "../../utils";
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
            [telefoneField]: digitos.slice(2, 11),
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
                    <IconButton aria-label="Limpar campo" onClick={onClick} edge="end" size="small">
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
            <Grid container spacing={1.5}>
                <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                        label="Email de Contato"
                        value={contato.emailContato || ""}
                        onChange={(e) => handleChange("emailContato", e.target.value.replace(/\s/g, ""))}
                        fullWidth
                        size="small"
                        slotProps={{
                            htmlInput: { inputMode: "email" },
                            input: {
                                endAdornment: botaoLimpar(
                                    !!contato.emailContato,
                                    handleLimparCampo("emailContato")
                                ),
                            },
                        }}
                    />
                </Grid>

                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <TextField
                        label="Telefone"
                        placeholder="(00) 00000-0000"
                        value={formatarTelefone(`${contato.ddd || ""}${contato.telefone || ""}`)}
                        onChange={handleTelefoneChange("ddd", "telefone")}
                        fullWidth
                        size="small"
                        slotProps={{
                            htmlInput: { inputMode: "tel" },
                            input: {
                                endAdornment: botaoLimpar(
                                    !!(contato.ddd || contato.telefone),
                                    handleLimparCampo("ddd", "telefone")
                                ),
                            },
                        }}
                    />
                </Grid>

                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <TextField
                        label="Telefone WhatsApp"
                        placeholder="(00) 00000-0000"
                        value={formatarTelefone(`${contato.dddWhatsApp || ""}${contato.telefoneWhatsApp || ""}`)}
                        onChange={handleTelefoneChange("dddWhatsApp", "telefoneWhatsApp")}
                        fullWidth
                        size="small"
                        slotProps={{
                            htmlInput: { inputMode: "tel" },
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
                        size="small"
                        slotProps={{
                            input: {
                                endAdornment: contato.website?.trim() && (
                                    <InputAdornment position="end">
                                        {renderIconeResultado()}

                                        <Tooltip title="Verificar se o site responde">
                                            <span>
                                                <IconButton aria-label="Verificar se o site responde"
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
                                            <IconButton aria-label="Abrir site em nova aba"
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
                                            <IconButton aria-label="Limpar campo"
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
