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
} from "@mui/material";
import { Delete } from "@mui/icons-material";
import { diasDaSemana, formatarHorario, apenasNumeros } from "../../utils";
import SectionCard from "./SectionCard";

const MissaForm = ({ missas = [], setMissas, onError }) => {
    const [novaMissa, setNovaMissa] = useState({ horario: "", diaSemana: [], observacao: "" });

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

    return (
        <SectionCard
            title="Missas"
            subtitle="Cadastre os horários das missas. Você pode selecionar vários dias para o mesmo horário."
        >
            <Box display="flex" flexDirection="column" gap={2}>
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
                </Box>

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
            </Box>
        </SectionCard>
    );
};

export default MissaForm;