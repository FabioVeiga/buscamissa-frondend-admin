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
    FormGroup,
    FormControlLabel,
    Checkbox,
    Chip,
    Stack,
    Collapse,
    Select,
    MenuItem,
    Divider,
    Tooltip,
} from "@mui/material";
import { Delete, Add, ExpandMore, ExpandLess } from "@mui/icons-material";
import { diasDaSemana, formatarHorario, apenasNumeros } from "../../utils";
import SectionCard from "./SectionCard";

const MissaForm = ({ missas = [], setMissas, onError }) => {
    const [novaMissa, setNovaMissa] = useState({ horario: "", diaSemana: [], observacao: "" });
    const [apoio, setApoio] = useState("");

    // Múltiplos horários
    const [multiOpen, setMultiOpen] = useState(false);
    const [multiDia, setMultiDia] = useState(0); // Domingo
    const [multiHorario, setMultiHorario] = useState("");
    const [multiHorarios, setMultiHorarios] = useState([]);

    const handleChange = (field, value) => {
        setNovaMissa((prev) => ({ ...prev, [field]: value }));
    };

    const handleToggleDiaSemana = (dia) => {
        setNovaMissa((prev) => {
            const { diaSemana } = prev;
            if (diaSemana.includes(dia)) {
                return { ...prev, diaSemana: diaSemana.filter((d) => d !== dia) };
            }
            return { ...prev, diaSemana: [...diaSemana, dia] };
        });
    };

    const getDiaLabel = (diaValue) => {
        return diasDaSemana.find((dia) => dia.value === diaValue || dia.value === Number(diaValue))?.label || "";
    };

    const handleAddMissa = () => {
        const { horario, diaSemana, observacao } = novaMissa;

        if (!horario || diaSemana.length === 0) {
            onError?.("Os campos Horário e pelo menos um Dia da Semana são obrigatórios!");
            return;
        }

        const horarioDigits = apenasNumeros(horario);
        const novasMissas = diaSemana.map((dia) => ({
            horario: horarioDigits,
            diaSemana: dia,
            observacao,
        }));

        setMissas((prev) => [...prev, ...novasMissas]);
        setNovaMissa({ horario: "", diaSemana: [], observacao: "" });
    };

    const handleDeleteMissa = (indexToDelete) => {
        setMissas((prev) => prev.filter((_, index) => index !== indexToDelete));
    };

    const handleAdicionarMultiHorario = () => {
        if (!multiHorario) return;
        if (multiHorarios.includes(multiHorario)) return;
        setMultiHorarios((prev) => [...prev, multiHorario]);
        setMultiHorario("");
    };

    const handleConfirmarMultiHorarios = () => {
        if (multiHorarios.length === 0) {
            onError?.("Adicione ao menos um horário.");
            return;
        }
        const novasMissas = multiHorarios.map((h) => ({
            horario: apenasNumeros(h),
            diaSemana: multiDia,
            observacao: "",
        }));
        setMissas((prev) => [...prev, ...novasMissas]);
        setMultiHorarios([]);
        setMultiHorario("");
        setMultiOpen(false);
    };

    const handleCancelarMulti = () => {
        setMultiHorarios([]);
        setMultiHorario("");
        setMultiOpen(false);
    };

    return (
        <SectionCard
            title="Missas"
            subtitle="Cadastre os horários das missas. Você pode selecionar vários dias para o mesmo horário."
        >
            <Box display="flex" flexDirection="column" gap={2}>
                {/* Formulário padrão */}
                <Box display="flex" alignItems="center" gap={2}>
                    <TextField
                        label="Horário"
                        type="time"
                        value={novaMissa.horario}
                        onChange={(e) => handleChange("horario", e.target.value)}
                        sx={{ width: 150 }}
                        InputLabelProps={{ shrink: true }}
                        inputProps={{ step: 900 }}
                    />
                    <Button variant="contained" color="primary" onClick={handleAddMissa} sx={{ whiteSpace: "nowrap" }}>
                        Adicionar Missa
                    </Button>
                    <Tooltip title="Adicionar múltiplos horários para um dia">
                        <Button
                            variant="outlined"
                            color="secondary"
                            onClick={() => setMultiOpen((prev) => !prev)}
                            endIcon={multiOpen ? <ExpandLess /> : <ExpandMore />}
                            sx={{ whiteSpace: "nowrap" }}
                        >
                            Múltiplos horários
                        </Button>
                    </Tooltip>
                </Box>

                {/* Painel de múltiplos horários */}
                <Collapse in={multiOpen}>
                    <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                        <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1.5 }}>
                            Adicionar vários horários para um dia
                        </Typography>

                        <Box display="flex" alignItems="center" gap={2} flexWrap="wrap">
                            <Select
                                value={multiDia}
                                onChange={(e) => setMultiDia(e.target.value)}
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
                                label="Horário"
                                type="time"
                                value={multiHorario}
                                onChange={(e) => setMultiHorario(e.target.value)}
                                sx={{ width: 150 }}
                                InputLabelProps={{ shrink: true }}
                                inputProps={{ step: 900 }}
                                onKeyDown={(e) => e.key === "Enter" && handleAdicionarMultiHorario()}
                            />

                            <IconButton color="primary" onClick={handleAdicionarMultiHorario} disabled={!multiHorario}>
                                <Add />
                            </IconButton>
                        </Box>

                        {multiHorarios.length > 0 && (
                            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mt: 1.5 }}>
                                {multiHorarios.map((h) => (
                                    <Chip
                                        key={h}
                                        label={h}
                                        color="secondary"
                                        variant="outlined"
                                        onDelete={() => setMultiHorarios((prev) => prev.filter((x) => x !== h))}
                                    />
                                ))}
                            </Stack>
                        )}

                        <Box display="flex" gap={1} sx={{ mt: 2 }}>
                            <Button variant="outlined" color="inherit" size="small" onClick={handleCancelarMulti}>
                                Cancelar
                            </Button>
                            <Button
                                variant="contained"
                                color="secondary"
                                size="small"
                                onClick={handleConfirmarMultiHorarios}
                                disabled={multiHorarios.length === 0}
                            >
                                Adicionar {multiHorarios.length > 0 ? `${multiHorarios.length} horário(s)` : ""}
                            </Button>
                        </Box>
                    </Paper>
                </Collapse>

                <Box>
                    <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
                        Dias da Semana
                    </Typography>

                    <FormGroup row sx={{ gap: 0.5 }}>
                        {diasDaSemana.map((dia) => (
                            <FormControlLabel
                                key={dia.value}
                                control={
                                    <Checkbox
                                        checked={novaMissa.diaSemana.includes(dia.value)}
                                        onChange={() => handleToggleDiaSemana(dia.value)}
                                    />
                                }
                                label={dia.label}
                            />
                        ))}
                    </FormGroup>
                </Box>

                {novaMissa.diaSemana.length > 0 && (
                    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                        {novaMissa.diaSemana.map((dia) => (
                            <Chip
                                key={dia}
                                label={getDiaLabel(dia)}
                                color="primary"
                                variant="outlined"
                                onDelete={() => handleToggleDiaSemana(dia)}
                            />
                        ))}
                    </Stack>
                )}

                <TextField
                    label="Observação"
                    value={novaMissa.observacao}
                    onChange={(e) => handleChange("observacao", e.target.value)}
                    fullWidth
                    multiline
                    minRows={2}
                />

                {missas.length > 0 && (
                    <TableContainer component={Paper} sx={{ mt: 1, borderRadius: 2 }}>
                        <Table size="small">
                            <TableHead>
                                <TableRow sx={{ backgroundColor: "grey.100" }}>
                                    <TableCell><strong>Horário</strong></TableCell>
                                    <TableCell><strong>Dia</strong></TableCell>
                                    <TableCell><strong>Observação</strong></TableCell>
                                    <TableCell align="center"><strong>Ações</strong></TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {missas.map((missa, index) => (
                                    <TableRow key={`${missa.horario}-${missa.diaSemana}-${index}`} hover>
                                        <TableCell>{formatarHorario(missa.horario)}</TableCell>
                                        <TableCell>{getDiaLabel(missa.diaSemana)}</TableCell>
                                        <TableCell>{missa.observacao || "Sem observação"}</TableCell>
                                        <TableCell align="center">
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

                <TextField
                    label="Apoio"
                    value={apoio}
                    onChange={(e) => setApoio(e.target.value)}
                    fullWidth
                    multiline
                    rows={3}
                    placeholder="Anotações temporárias de apoio (não salvo)..."
                    helperText="Este campo não é salvo."
                    sx={{ mt: 1 }}
                />
            </Box>
        </SectionCard>
    );
};

export default MissaForm;
