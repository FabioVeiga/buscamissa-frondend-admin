import { useEffect, useMemo, useState } from "react";
import {
    Autocomplete,
    Box,
    Button,
    CircularProgress,
    TextField,
    Typography,
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import CepReversoModal from "../../Components/CepReversoModal";
import SectionCard from "./SectionCard";
import api from "../../services/apiService";

const EnderecoForm = ({
                          endereco,
                          setEndereco,
                          onBuscarPorCep = () => {},
                          cepLoading = false,
                          onBuscarCepReverso = () => {},
                          cepReversoLoading = false,
                          geoLoading = false,
                          onBuscarCoordenadas = () => {},
                          geoError,
                          openCepReverso = false,
                          onCloseCepReverso = () => {},
                          candidatosCep = [],
                          onSelectCepCandidato = () => {},
                          cepReversoError = "",
                      }) => {
    const [enderecosMap, setEnderecosMap] = useState({});
    const [enderecosLoading, setEnderecosLoading] = useState(false);

    const handleChange = (field, value) => {
        setEndereco((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    useEffect(() => {
        const carregarEnderecos = async () => {
            setEnderecosLoading(true);

            try {
                const response = await api.get("/api/v1/Igreja/v2/obter-enderecos");
                const data = response.data?.data || response.data || {};

                setEnderecosMap(data && typeof data === "object" ? data : {});
            } catch (error) {
                console.error("Erro ao carregar opções de endereço:", error);
                setEnderecosMap({});
            } finally {
                setEnderecosLoading(false);
            }
        };

        carregarEnderecos();
    }, []);

    const ufOptions = useMemo(() => {
        return Object.keys(enderecosMap || {}).sort();
    }, [enderecosMap]);

    const localidadeOptions = useMemo(() => {
        const ufSelecionada = endereco?.uf;

        if (ufSelecionada && enderecosMap?.[ufSelecionada]) {
            return Object.keys(enderecosMap[ufSelecionada]).sort();
        }

        const todasLocalidades = Object.values(enderecosMap || {}).flatMap((localidadesPorUf) =>
            Object.keys(localidadesPorUf || {})
        );

        return [...new Set(todasLocalidades)].sort();
    }, [enderecosMap, endereco?.uf]);

    const handleUfChange = (value) => {
        handleChange("uf", value || "");

        if (value && enderecosMap?.[value]) {
            const localidadeAtualExiste = Object.keys(enderecosMap[value]).includes(
                endereco?.localidade || ""
            );

            if (!localidadeAtualExiste) {
                handleChange("localidade", "");
            }
        }
    };

    return (
        <SectionCard
            title="Endereço"
            subtitle="Complete o endereço manualmente ou utilize as buscas automáticas."
            sx={{
                backgroundColor: "#fafafa",
            }}
        >
            <Grid container spacing={2}>
                {/* 1ª linha: CEP, Logradouro, Número */}
                <Grid size={{ xs: 12, md: 2 }}>
                    <TextField
                        label="CEP"
                        value={endereco?.cep || ""}
                        onChange={(e) => handleChange("cep", e.target.value)}
                        fullWidth
                    />
                </Grid>

                <Grid size={{ xs: 12, md: 8 }}>
                    <TextField
                        label="Logradouro"
                        value={endereco?.logradouro || ""}
                        onChange={(e) => handleChange("logradouro", e.target.value)}
                        fullWidth
                    />
                </Grid>

                <Grid size={{ xs: 12, md: 2 }}>
                    <TextField
                        label="Número"
                        value={endereco?.numero || ""}
                        onChange={(e) => handleChange("numero", e.target.value)}
                        fullWidth
                    />
                </Grid>

                {/* 2ª linha: Bairro, Complemento */}
                <Grid size={{ xs: 12, md: 5 }}>
                    <TextField
                        label="Bairro"
                        value={endereco?.bairro || ""}
                        onChange={(e) => handleChange("bairro", e.target.value)}
                        fullWidth
                    />
                </Grid>

                <Grid size={{ xs: 12, md: 7 }}>
                    <TextField
                        label="Complemento"
                        value={endereco?.complemento || ""}
                        onChange={(e) => handleChange("complemento", e.target.value)}
                        fullWidth
                    />
                </Grid>

                {/* 3ª linha: UF, Estado, Localidade, Região */}
                <Grid size={{ xs: 12, md: 2 }}>
                    <Autocomplete
                        freeSolo
                        options={ufOptions}
                        value={endereco?.uf || ""}
                        inputValue={endereco?.uf || ""}
                        loading={enderecosLoading}
                        onChange={(_, value) => handleUfChange(value || "")}
                        onInputChange={(_, value) => handleUfChange(value || "")}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                label="UF"
                                fullWidth
                                placeholder="Digite ou selecione"
                                InputProps={{
                                    ...params.InputProps,
                                    endAdornment: (
                                        <>
                                            {enderecosLoading && (
                                                <CircularProgress color="inherit" size={18} />
                                            )}
                                            {params.InputProps.endAdornment}
                                        </>
                                    ),
                                }}
                            />
                        )}
                    />
                </Grid>

                <Grid size={{ xs: 12, md: 3 }}>
                    <TextField
                        label="Estado"
                        value={endereco?.estado || ""}
                        onChange={(e) => handleChange("estado", e.target.value)}
                        fullWidth
                    />
                </Grid>

                <Grid size={{ xs: 12, md: 5 }}>
                    <Autocomplete
                        freeSolo
                        options={localidadeOptions}
                        value={endereco?.localidade || ""}
                        inputValue={endereco?.localidade || ""}
                        loading={enderecosLoading}
                        onChange={(_, value) => handleChange("localidade", value || "")}
                        onInputChange={(_, value) => handleChange("localidade", value || "")}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                label="Localidade"
                                fullWidth
                                placeholder="Digite ou selecione"
                                InputProps={{
                                    ...params.InputProps,
                                    endAdornment: (
                                        <>
                                            {enderecosLoading && (
                                                <CircularProgress color="inherit" size={18} />
                                            )}
                                            {params.InputProps.endAdornment}
                                        </>
                                    ),
                                }}
                            />
                        )}
                    />
                </Grid>

                <Grid size={{ xs: 12, md: 2 }}>
                    <TextField
                        label="Região"
                        value={endereco?.regiao || ""}
                        onChange={(e) => handleChange("regiao", e.target.value)}
                        fullWidth
                    />
                </Grid>

                {/* 4ª linha: Botões */}
                <Grid size={12}>
                    <Box
                        sx={{
                            display: "flex",
                            gap: 1.5,
                            flexWrap: "wrap",
                            mt: 1,
                        }}
                    >
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={onBuscarPorCep}
                            disabled={cepLoading}
                            sx={{ minWidth: 180 }}
                        >
                            {cepLoading ? "Buscando CEP..." : "Buscar por CEP"}
                        </Button>

                        <Button
                            variant="outlined"
                            color="secondary"
                            onClick={onBuscarCepReverso}
                            disabled={cepReversoLoading}
                            sx={{ minWidth: 180 }}
                        >
                            {cepReversoLoading ? "Buscando endereço..." : "Buscar endereço"}
                        </Button>

                        <Button
                            variant="outlined"
                            color="primary"
                            onClick={onBuscarCoordenadas}
                            disabled={geoLoading}
                            sx={{ minWidth: 200 }}
                        >
                            {geoLoading ? "Buscando..." : "Buscar Coordenadas"}
                        </Button>
                    </Box>

                    {geoError && (
                        <Typography color="error" variant="body2" sx={{ mt: 1 }}>
                            {geoError}
                        </Typography>
                    )}
                </Grid>

                {/* 5ª linha: Latitude, Longitude */}
                <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                        label="Latitude"
                        value={endereco?.latitude || ""}
                        onChange={(e) => handleChange("latitude", e.target.value)}
                        fullWidth
                        type="number"
                        inputProps={{ step: "0.000001" }}
                    />
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                        label="Longitude"
                        value={endereco?.longitude || ""}
                        onChange={(e) => handleChange("longitude", e.target.value)}
                        fullWidth
                        type="number"
                        inputProps={{ step: "0.000001" }}
                    />
                </Grid>
            </Grid>

            <CepReversoModal
                open={openCepReverso}
                onClose={onCloseCepReverso}
                candidatos={candidatosCep}
                onSelect={onSelectCepCandidato}
                loading={cepReversoLoading}
                error={cepReversoError}
            />
        </SectionCard>
    );
};

export default EnderecoForm;