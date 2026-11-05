/* eslint-disable react/prop-types */
import { useMemo, useState } from "react";
import {
    Alert,
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControlLabel,
    Switch,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    TextField,
    Typography,
} from "@mui/material";
import { ehSemanal } from "../../recorrenciaMissa";
import { diaDaSemana, formatarHorario } from "../../utils";
import { aplicarMissasParseadas, parseHorariosMissa } from "../../services/parseHorariosMissa";

const EXEMPLO = "Terça a sexta-feira: 19h30\nSábado: 16h\nDomingo: 08h - 10h - 18h";
const ORDEM_SEMANA = [1, 2, 3, 4, 5, 6, 0];

/**
 * Cola um texto de horários, mostra o que foi entendido e devolve a lista de missas atualizada
 * via `onAplicar(missas)`. Quem chama decide o que fazer (só preencher o formulário ou salvar).
 */
const ColarHorariosModal = ({
    open,
    onClose,
    missasAtuais = [],
    onAplicar,
    salvando = false,
    textoConfirmar = "Aplicar horários",
}) => {
    const [texto, setTexto] = useState("");
    const [substituir, setSubstituir] = useState(true);

    const { missas, ignoradas } = useMemo(() => parseHorariosMissa(texto), [texto]);
    const semanaisAtuais = missasAtuais.filter(ehSemanal).length;

    const porDia = ORDEM_SEMANA.map((dia) => ({
        dia,
        horarios: missas.filter((m) => m.diaSemana === dia).map((m) => formatarHorario(m.horario)),
    })).filter((l) => l.horarios.length > 0);

    const handleFechar = () => {
        if (salvando) return;
        setTexto("");
        onClose();
    };

    const handleAplicar = async () => {
        const resultado = aplicarMissasParseadas(missasAtuais, missas, substituir);
        const ok = await onAplicar(resultado);
        if (ok !== false) {
            setTexto("");
            onClose();
        }
    };

    return (
        <Dialog open={open} onClose={handleFechar} fullWidth maxWidth="sm">
            <DialogTitle>Colar horários das missas</DialogTitle>
            <DialogContent>
                <Box display="flex" flexDirection="column" gap={2} pt={1}>
                    <TextField
                        autoFocus
                        multiline
                        minRows={4}
                        maxRows={10}
                        fullWidth
                        label="Texto com os horários"
                        placeholder={EXEMPLO}
                        value={texto}
                        onChange={(e) => setTexto(e.target.value)}
                        helperText="Um dia (ou intervalo de dias) por linha. Ex.: “Terça a sexta: 19h30”, “Domingo: 8h - 10h - 18h”."
                    />

                    {texto.trim() && porDia.length > 0 && (
                        <Box>
                            <Typography variant="subtitle2" gutterBottom>
                                O que foi entendido ({missas.length} missa{missas.length === 1 ? "" : "s"})
                            </Typography>
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Dia da semana</TableCell>
                                        <TableCell>Horários</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {porDia.map((l) => (
                                        <TableRow key={l.dia}>
                                            <TableCell>{diaDaSemana(l.dia)}</TableCell>
                                            <TableCell>{l.horarios.join(" | ")}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </Box>
                    )}

                    {ignoradas.length > 0 && (
                        <Alert severity="warning">
                            Não consegui entender {ignoradas.length === 1 ? "esta linha" : "estas linhas"}:
                            {ignoradas.map((l, i) => (
                                <Box key={i} component="div" sx={{ fontFamily: "monospace" }}>
                                    {l}
                                </Box>
                            ))}
                        </Alert>
                    )}

                    <FormControlLabel
                        control={<Switch checked={substituir} onChange={(e) => setSubstituir(e.target.checked)} />}
                        label={
                            substituir
                                ? `Substituir os horários semanais atuais${semanaisAtuais ? ` (${semanaisAtuais})` : ""}`
                                : "Somar aos horários atuais (ignora os repetidos)"
                        }
                    />
                    {substituir && (
                        <Typography variant="caption" color="text.secondary" sx={{ mt: -1.5 }}>
                            Missas mensais (dia fixo, 1ª sexta etc.) são mantidas.
                        </Typography>
                    )}
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleFechar} disabled={salvando}>
                    Cancelar
                </Button>
                <Button variant="contained" onClick={handleAplicar} disabled={missas.length === 0 || salvando}>
                    {salvando ? "Salvando..." : textoConfirmar}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ColarHorariosModal;
