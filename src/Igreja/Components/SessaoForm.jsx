import React, { useState } from "react";
import {
    Box,
    TextField,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Typography,
    IconButton,
    Select,
    MenuItem,
    Alert,
} from "@mui/material";
import { Delete } from "@mui/icons-material";
import { diasDaSemana, formatarHorario } from "../../utils";
import SectionCard from "./SectionCard";

const tiposSessao = [
    { value: 1, label: "Secretaria" },
    { value: 2, label: "Confissão" },
];

const getTipoLabel = (tipo) => tiposSessao.find((t) => t.value === Number(tipo))?.label || "";
const getDiaLabel = (dia) => diasDaSemana.find((d) => d.value === Number(dia))?.label || "";

// Só renderizado quando a igreja já tem responsável verificado aprovado — o
// admin não deve criar horário de secretaria/confissão "no escuro" para
// igrejas sem gestão ativa; isso é papel do próprio responsável.
const SessaoForm = ({ sessoes = [], setSessoes, onError }) => {
    const [novaSessao, setNovaSessao] = useState({
        tipo: 1,
        diaSemana: 0,
        horarioInicio: "",
        horarioFim: "",
        observacao: "",
    });

    const handleChange = (field, value) => {
        setNovaSessao((prev) => ({ ...prev, [field]: value }));
    };

    const handleAddSessao = () => {
        const { tipo, diaSemana, horarioInicio, horarioFim, observacao } = novaSessao;

        if (!horarioInicio || !horarioFim) {
            onError?.("Os campos Horário de início e Horário de fim são obrigatórios!");
            return;
        }

        setSessoes((prev) => [
            ...prev,
            { tipo, diaSemana, horarioInicio, horarioFim, observacao },
        ]);
        setNovaSessao({ tipo: 1, diaSemana: 0, horarioInicio: "", horarioFim: "", observacao: "" });
    };

    const handleDeleteSessao = (indexToDelete) => {
        setSessoes((prev) => prev.filter((_, index) => index !== indexToDelete));
    };

    return (
        <SectionCard
            title="Secretaria e confissão"
            subtitle="Horários de atendimento da secretaria e de confissão — aparecem na página da igreja."
        >
            <Box display="flex" flexDirection="column" gap={1.5}>
                <Alert severity="info" sx={{ mb: 0.5 }}>
                    Esta seção só é editável porque a igreja já tem um responsável verificado aprovado.
                </Alert>

                <Box display="flex" alignItems="center" gap={2} flexWrap="wrap">
                    <Select
                        value={novaSessao.tipo}
                        onChange={(e) => handleChange("tipo", e.target.value)}
                        size="small"
                        sx={{ minWidth: 140 }}
                    >
                        {tiposSessao.map((t) => (
                            <MenuItem key={t.value} value={t.value}>
                                {t.label}
                            </MenuItem>
                        ))}
                    </Select>

                    <Select
                        value={novaSessao.diaSemana}
                        onChange={(e) => handleChange("diaSemana", e.target.value)}
                        size="small"
                        sx={{ minWidth: 160 }}
                    >
                        {diasDaSemana.map((dia) => (
                            <MenuItem key={dia.value} value={dia.value}>
                                {dia.label}
                            </MenuItem>
                        ))}
                    </Select>

                    <TextField
                        label="Início"
                        type="time"
                        value={novaSessao.horarioInicio}
                        onChange={(e) => handleChange("horarioInicio", e.target.value)}
                        sx={{ width: 130 }}
                        InputLabelProps={{ shrink: true }}
                        inputProps={{ step: 900 }}
                    />

                    <TextField
                        label="Fim"
                        type="time"
                        value={novaSessao.horarioFim}
                        onChange={(e) => handleChange("horarioFim", e.target.value)}
                        sx={{ width: 130 }}
                        InputLabelProps={{ shrink: true }}
                        inputProps={{ step: 900 }}
                    />

                    <Button variant="contained" color="primary" onClick={handleAddSessao} sx={{ whiteSpace: "nowrap" }}>
                        Adicionar horário
                    </Button>
                </Box>

                <TextField
                    label="Observação (opcional, até 50 caracteres)"
                    value={novaSessao.observacao}
                    onChange={(e) => handleChange("observacao", e.target.value.slice(0, 50))}
                    fullWidth
                />

                {sessoes.length > 0 && (
                    <TableContainer component={Paper} sx={{ mt: 1, borderRadius: 2 }}>
                        <Table size="small">
                            <TableHead>
                                <TableRow sx={{ backgroundColor: "grey.100" }}>
                                    <TableCell><strong>Tipo</strong></TableCell>
                                    <TableCell><strong>Dia</strong></TableCell>
                                    <TableCell><strong>Horário</strong></TableCell>
                                    <TableCell><strong>Observação</strong></TableCell>
                                    <TableCell align="center"><strong>Ações</strong></TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {sessoes.map((sessao, index) => (
                                    <TableRow key={`${sessao.tipo}-${sessao.diaSemana}-${sessao.horarioInicio}-${index}`} hover>
                                        <TableCell>{getTipoLabel(sessao.tipo)}</TableCell>
                                        <TableCell>{getDiaLabel(sessao.diaSemana)}</TableCell>
                                        <TableCell>
                                            {formatarHorario(sessao.horarioInicio)} às {formatarHorario(sessao.horarioFim)}
                                        </TableCell>
                                        <TableCell>{sessao.observacao || "Sem observação"}</TableCell>
                                        <TableCell align="center">
                                            <IconButton color="error" onClick={() => handleDeleteSessao(index)}>
                                                <Delete />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}

                {sessoes.length === 0 && (
                    <Typography variant="body2" color="text.secondary">
                        Nenhum horário de secretaria/confissão cadastrado.
                    </Typography>
                )}
            </Box>
        </SectionCard>
    );
};

export default SessaoForm;
