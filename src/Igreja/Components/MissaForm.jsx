import React, { useRef, useState } from "react";
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
    FormControlLabel,
    Checkbox,
    Chip,
    Stack,
    Select,
    MenuItem,
    Divider,
    Tooltip,
} from "@mui/material";
import { Delete, Add, DeleteSweep } from "@mui/icons-material";
import { ToggleButton, ToggleButtonGroup } from "@mui/material";
import {
    TIPO_RECORRENCIA,
    EXCECAO_DOMINGO,
    EXCECAO_SABADO,
    SEMANAS_DO_MES,
    alertaConflitoSemanal,
    chaveMissa,
    descrever,
    ehSemanal,
    validarDiaFixo,
    validarOcorrencia,
} from "../../recorrenciaMissa";
import { diasDaSemana, formatarHorario, apenasNumeros } from "../../utils";
import SectionCard from "./SectionCard";

const OBSERVACAO_MAX = 20;

const OBSERVACOES_ATALHO = ["1º do mês", "Última do mês", "Pelos falecidos", "Pelas almas", "Novena"];

const MissaForm = ({ missas = [], setMissas, onError }) => {
    const NOVA_MISSA_VAZIA = {
        horario: "",
        horarios: [],
        diaSemana: [],
        observacao: "",
        tipoRecorrencia: TIPO_RECORRENCIA.Semanal,
        diaDoMes: "",
        excecaoSabado: false,
        excecaoDomingo: false,
        diaOcorrencia: "",
        semanasDoMes: 0,
    };
    const [novaMissa, setNovaMissa] = useState(NOVA_MISSA_VAZIA);
    const ehDiaFixo = novaMissa.tipoRecorrencia === TIPO_RECORRENCIA.DiaDoMes;
    const ehOcorrencia = novaMissa.tipoRecorrencia === TIPO_RECORRENCIA.OcorrenciaNoMes;
    const ehSemanalNova = novaMissa.tipoRecorrencia === TIPO_RECORRENCIA.Semanal;

    // Horários já incluídos como chip + o que está digitado no campo (se houver):
    // um horário só continua sendo um clique em "Adicionar".
    const horariosEfetivos =
        novaMissa.horario && !novaMissa.horarios.includes(novaMissa.horario)
            ? [...novaMissa.horarios, novaMissa.horario]
            : novaMissa.horarios;

    // Aviso (não bloqueia): mesma missa cadastrada como semanal e como "1ª sexta".
    const alertaConflito = (() => {
        if (ehOcorrencia)
            return horariosEfetivos
                .map((horario) =>
                    alertaConflitoSemanal(missas, {
                        tipoRecorrencia: TIPO_RECORRENCIA.OcorrenciaNoMes,
                        diaSemana: novaMissa.diaOcorrencia,
                        horario,
                    })
                )
                .find(Boolean) ?? null;
        if (ehSemanalNova)
            return novaMissa.diaSemana
                .flatMap((dia) => horariosEfetivos.map((horario) => alertaConflitoSemanal(missas, { diaSemana: dia, horario })))
                .find(Boolean) ?? null;
        return null;
    })();
    const excecaoNova = (novaMissa.excecaoSabado ? EXCECAO_SABADO : 0) | (novaMissa.excecaoDomingo ? EXCECAO_DOMINGO : 0);
    const [apoio, setApoio] = useState("");
    const horarioRef = useRef(null);

    // Seleção múltipla para deletar em lote
    const [selecionadas, setSelecionadas] = useState([]);

    const handleChange = (field, value) => {
        setNovaMissa((prev) => ({ ...prev, [field]: value }));
    };

    const handleAdicionarTagObservacao = (tag) => {
        setNovaMissa((prev) => ({
            ...prev,
            observacao: prev.observacao ? `${prev.observacao}, ${tag}` : tag,
        }));
    };

    const ATALHOS_DIAS = [
        { label: "Dias úteis", dias: [1, 2, 3, 4, 5] },
        { label: "Todos os dias", dias: [0, 1, 2, 3, 4, 5, 6] },
        { label: "Fim de semana", dias: [6, 0] },
        { label: "Só domingo", dias: [0] },
    ];

    const handleSelecionarDias = (dias) => {
        setNovaMissa((prev) => ({ ...prev, diaSemana: dias }));
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

    // Passa o horário digitado para a lista de chips (sem duplicar) e mantém o foco no campo.
    const handleIncluirHorario = () => {
        setNovaMissa((prev) => {
            if (!prev.horario) return prev;
            const horarios = prev.horarios.includes(prev.horario) ? prev.horarios : [...prev.horarios, prev.horario];
            return { ...prev, horarios: [...horarios].sort(), horario: "" };
        });
        horarioRef.current?.focus();
    };

    const handleRemoverHorario = (horario) => {
        setNovaMissa((prev) => ({ ...prev, horarios: prev.horarios.filter((h) => h !== horario) }));
    };

    // Enter no campo de horário inclui o chip; Enter com o campo vazio adiciona as missas.
    const handleEnterHorario = (e) => {
        if (e.key !== "Enter") return;
        e.preventDefault();
        if (novaMissa.horario) handleIncluirHorario();
        else if (novaMissa.horarios.length > 0) handleAddMissa();
    };

    const handleEnterAdiciona = (e) => {
        if (e.key !== "Enter") return;
        e.preventDefault();
        handleAddMissa();
    };

    // Ao invés de deixar duplicar (dia, horário) e só barrar no salvar com um
    // erro do backend, já ignora aqui a combinação que já existe — silencioso,
    // sem travar o fluxo do usuário.
    const jaExisteMissa = (lista, diaSemana, horario) =>
        lista.some((m) => ehSemanal(m) && Number(m.diaSemana) === Number(diaSemana) && m.horario === horario);

    const totalMissasNovas = ehSemanalNova
        ? novaMissa.diaSemana.length * horariosEfetivos.length
        : horariosEfetivos.length;

    const validarComum = () => {
        if (horariosEfetivos.length === 0) {
            onError?.("Informe pelo menos um Horário!");
            return false;
        }
        if ((novaMissa.observacao ?? "").length > OBSERVACAO_MAX) {
            onError?.(`A observação da missa excede o limite de ${OBSERVACAO_MAX} caracteres.`);
            return false;
        }
        return true;
    };

    const limparAposAdicionar = () => {
        setNovaMissa({ ...NOVA_MISSA_VAZIA, tipoRecorrencia: novaMissa.tipoRecorrencia });
        horarioRef.current?.focus();
    };

    const handleAddMissa = () => {
        if (ehDiaFixo) {
            handleAddMissaDiaFixo();
            return;
        }
        if (ehOcorrencia) {
            handleAddMissaOcorrencia();
            return;
        }

        if (horariosEfetivos.length === 0 || novaMissa.diaSemana.length === 0) {
            onError?.("Informe pelo menos um Horário e um Dia da Semana!");
            return;
        }
        if (!validarComum()) return;

        const horariosDigits = horariosEfetivos.map((h) => apenasNumeros(h));
        const { observacao } = novaMissa;

        setMissas((prev) => {
            const novasMissas = novaMissa.diaSemana.flatMap((dia) =>
                horariosDigits
                    .filter((horario) => !jaExisteMissa(prev, dia, horario))
                    .map((horario) => ({ horario, diaSemana: dia, observacao }))
            );
            return [...prev, ...novasMissas];
        });
        limparAposAdicionar();
    };

    // Ocorrência no mês ("1ª e 3ª sexta"): uma missa por horário, com dia da semana + semanas.
    const handleAddMissaOcorrencia = () => {
        const { observacao, diaOcorrencia, semanasDoMes } = novaMissa;

        if (!validarComum()) return;
        const erro = validarOcorrencia(diaOcorrencia, semanasDoMes);
        if (erro) {
            onError?.(erro);
            return;
        }

        const novas = horariosEfetivos.map((horario) => ({
            horario: apenasNumeros(horario),
            diaSemana: Number(diaOcorrencia),
            observacao,
            tipoRecorrencia: TIPO_RECORRENCIA.OcorrenciaNoMes,
            semanasDoMes: Number(semanasDoMes),
        }));
        setMissas((prev) => [...prev, ...novas.filter((nova) => !prev.some((m) => chaveMissa(m) === chaveMissa(nova)))]);
        limparAposAdicionar();
    };

    const toggleSemana = (bit) => handleChange("semanasDoMes", (Number(novaMissa.semanasDoMes) || 0) ^ bit);

    // Dia fixo do mês ("todo dia 13"): uma missa por horário, sem dia da semana.
    const handleAddMissaDiaFixo = () => {
        const { observacao, diaDoMes } = novaMissa;

        if (!validarComum()) return;
        const erro = validarDiaFixo(diaDoMes, excecaoNova);
        if (erro) {
            onError?.(erro);
            return;
        }

        const novas = horariosEfetivos.map((horario) => ({
            horario: apenasNumeros(horario),
            diaSemana: 0, // ignorado no dia fixo
            observacao,
            tipoRecorrencia: TIPO_RECORRENCIA.DiaDoMes,
            diaDoMes: Number(diaDoMes),
            diasSemanaExcecao: excecaoNova || null,
        }));
        setMissas((prev) => [...prev, ...novas.filter((nova) => !prev.some((m) => chaveMissa(m) === chaveMissa(nova)))]);
        limparAposAdicionar();
    };

    const handleDeleteMissa = (indexToDelete) => {
        setMissas((prev) => prev.filter((_, index) => index !== indexToDelete));
        setSelecionadas((prev) => prev.filter((i) => i !== indexToDelete));
    };

    const handleDeleteTodas = () => {
        setMissas([]);
        setSelecionadas([]);
    };

    const handleToggleSelecionada = (index) => {
        setSelecionadas((prev) =>
            prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
        );
    };

    const handleToggleSelecionarTodas = () => {
        setSelecionadas((prev) => (prev.length === missas.length ? [] : missas.map((_, i) => i)));
    };

    const handleDeleteSelecionadas = () => {
        setMissas((prev) => prev.filter((_, index) => !selecionadas.includes(index)));
        setSelecionadas([]);
    };

    const resumoMissas =
        totalMissasNovas > 0
            ? ehSemanalNova
                ? `Vai criar ${totalMissasNovas} missa(s): ${novaMissa.diaSemana.length} dia(s) × ${horariosEfetivos.length} horário(s)`
                : `Vai criar ${totalMissasNovas} missa(s)`
            : "Escolha os dias e informe os horários";

    return (
        <SectionCard
            title="Missas"
            subtitle="Escolha a frequência, os dias e os horários. Você pode incluir vários horários de uma vez."
        >
            <Box display="flex" flexDirection="column" gap={2}>
                {/* 1. Frequência */}
                <Box display="flex" flexDirection="column" gap={0.75}>
                    <Typography variant="subtitle2" fontWeight={600}>
                        1. Frequência
                    </Typography>
                    <ToggleButtonGroup
                        exclusive
                        size="small"
                        color="primary"
                        value={novaMissa.tipoRecorrencia}
                        onChange={(_, valor) => valor !== null && handleChange("tipoRecorrencia", valor)}
                    >
                        <ToggleButton value={TIPO_RECORRENCIA.Semanal}>Toda semana</ToggleButton>
                        <ToggleButton value={TIPO_RECORRENCIA.DiaDoMes}>Dia fixo do mês</ToggleButton>
                        <ToggleButton value={TIPO_RECORRENCIA.OcorrenciaNoMes}>Dia da semana no mês</ToggleButton>
                    </ToggleButtonGroup>
                </Box>

                {/* 2. Dias */}
                {ehSemanalNova && (
                    <Box display="flex" flexDirection="column" gap={0.75}>
                        <Typography variant="subtitle2" fontWeight={600}>
                            2. Dias da semana
                        </Typography>
                        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                            {diasDaSemana.map((dia) => {
                                const marcado = novaMissa.diaSemana.includes(dia.value);
                                return (
                                    <Chip
                                        key={dia.value}
                                        label={dia.label.slice(0, 3)}
                                        color={marcado ? "primary" : "default"}
                                        variant={marcado ? "filled" : "outlined"}
                                        onClick={() => handleToggleDiaSemana(dia.value)}
                                    />
                                );
                            })}
                        </Stack>
                        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                            {ATALHOS_DIAS.map((atalho) => (
                                <Chip
                                    key={atalho.label}
                                    label={atalho.label}
                                    size="small"
                                    variant="outlined"
                                    color="primary"
                                    onClick={() => handleSelecionarDias(atalho.dias)}
                                />
                            ))}
                        </Stack>
                    </Box>
                )}

                {ehOcorrencia && (
                    <Box display="flex" flexDirection="column" gap={0.75}>
                        <Typography variant="subtitle2" fontWeight={600}>
                            2. Dia da semana e semanas do mês
                        </Typography>
                        <Box display="flex" alignItems="center" gap={2} flexWrap="wrap">
                            <Select
                                size="small"
                                displayEmpty
                                value={novaMissa.diaOcorrencia}
                                onChange={(e) => handleChange("diaOcorrencia", e.target.value)}
                                sx={{ minWidth: 170 }}
                            >
                                <MenuItem value="" disabled>
                                    Dia da semana
                                </MenuItem>
                                {diasDaSemana.map((dia) => (
                                    <MenuItem key={dia.value} value={dia.value}>
                                        {dia.label}
                                    </MenuItem>
                                ))}
                            </Select>
                            <Typography variant="body2" color="text.secondary">
                                Semanas do mês:
                            </Typography>
                            {SEMANAS_DO_MES.map((s) => (
                                <FormControlLabel
                                    key={s.bit}
                                    control={
                                        <Checkbox
                                            checked={((Number(novaMissa.semanasDoMes) || 0) & s.bit) !== 0}
                                            onChange={() => toggleSemana(s.bit)}
                                        />
                                    }
                                    label={s.label}
                                />
                            ))}
                        </Box>
                        {horariosEfetivos.length > 0 && novaMissa.diaOcorrencia !== "" && Number(novaMissa.semanasDoMes) > 0 && (
                            <Typography variant="body2" color="primary">
                                Prévia: {horariosEfetivos
                                    .map((horario) =>
                                        descrever({
                                            horario,
                                            tipoRecorrencia: TIPO_RECORRENCIA.OcorrenciaNoMes,
                                            diaSemana: novaMissa.diaOcorrencia,
                                            semanasDoMes: novaMissa.semanasDoMes,
                                        })
                                    )
                                    .join(" · ")}
                            </Typography>
                        )}
                        <Typography variant="caption" color="text.secondary">
                            &quot;Última&quot; vale para a última do mês, seja a 4ª ou a 5ª.
                        </Typography>
                    </Box>
                )}

                {ehDiaFixo && (
                    <Box display="flex" flexDirection="column" gap={0.75}>
                        <Typography variant="subtitle2" fontWeight={600}>
                            2. Dia do mês
                        </Typography>
                        <Box display="flex" alignItems="center" gap={2} flexWrap="wrap">
                            <TextField
                                label="Dia do mês"
                                type="number"
                                value={novaMissa.diaDoMes}
                                onChange={(e) => handleChange("diaDoMes", e.target.value)}
                                onKeyDown={handleEnterAdiciona}
                                inputProps={{ min: 1, max: 31 }}
                                sx={{ width: 130 }}
                            />
                            <Typography variant="body2" color="text.secondary">
                                Não ocorre se cair em:
                            </Typography>
                            <FormControlLabel
                                control={<Checkbox checked={novaMissa.excecaoSabado} onChange={(e) => handleChange("excecaoSabado", e.target.checked)} />}
                                label="Sábado"
                            />
                            <FormControlLabel
                                control={<Checkbox checked={novaMissa.excecaoDomingo} onChange={(e) => handleChange("excecaoDomingo", e.target.checked)} />}
                                label="Domingo"
                            />
                        </Box>
                        {horariosEfetivos.length > 0 && novaMissa.diaDoMes && (
                            <Typography variant="body2" color="primary">
                                Prévia: {horariosEfetivos
                                    .map((horario) =>
                                        descrever({
                                            horario,
                                            tipoRecorrencia: TIPO_RECORRENCIA.DiaDoMes,
                                            diaDoMes: novaMissa.diaDoMes,
                                            diasSemanaExcecao: excecaoNova,
                                        })
                                    )
                                    .join(" · ")}
                            </Typography>
                        )}
                        <Typography variant="caption" color="text.secondary">
                            Em meses sem esse dia (ex.: dia 31 em abril) a missa não acontece.
                        </Typography>
                    </Box>
                )}

                {/* 3. Horários */}
                <Box display="flex" flexDirection="column" gap={0.75}>
                    <Typography variant="subtitle2" fontWeight={600}>
                        3. Horários
                    </Typography>
                    <Box display="flex" alignItems="center" gap={1} flexWrap="wrap">
                        {novaMissa.horarios.map((horario) => (
                            <Chip
                                key={horario}
                                label={horario}
                                color="secondary"
                                variant="outlined"
                                onDelete={() => handleRemoverHorario(horario)}
                            />
                        ))}
                        <TextField
                            label="Horário"
                            type="time"
                            size="small"
                            inputRef={horarioRef}
                            value={novaMissa.horario}
                            onChange={(e) => handleChange("horario", e.target.value)}
                            onKeyDown={handleEnterHorario}
                            sx={{ width: 150 }}
                            InputLabelProps={{ shrink: true }}
                            inputProps={{ step: 900 }}
                        />
                        <Tooltip title="Incluir outro horário (Enter)">
                            <span>
                                <IconButton color="primary" onClick={handleIncluirHorario} disabled={!novaMissa.horario}>
                                    <Add />
                                </IconButton>
                            </span>
                        </Tooltip>
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                        Digite o horário e tecle Enter para incluir outro. Com o campo vazio, Enter adiciona as missas.
                    </Typography>
                </Box>

                {alertaConflito && (
                    <Typography variant="body2" color="warning.main">
                        ⚠ {alertaConflito}
                    </Typography>
                )}

                {/* 4. Observação */}
                <Box display="flex" flexDirection="column" gap={0.75}>
                    <Typography variant="subtitle2" fontWeight={600}>
                        4. Observação <Typography component="span" variant="caption" color="text.secondary">(opcional)</Typography>
                    </Typography>
                    <TextField
                        label="Observação"
                        value={novaMissa.observacao}
                        onChange={(e) => handleChange("observacao", e.target.value)}
                        error={novaMissa.observacao.length > OBSERVACAO_MAX}
                        helperText={`${novaMissa.observacao.length}/${OBSERVACAO_MAX}`}
                        fullWidth
                        multiline
                        minRows={2}
                    />

                    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                        {OBSERVACOES_ATALHO.map((tag) => (
                            <Chip
                                key={tag}
                                label={tag}
                                size="small"
                                variant="outlined"
                                onClick={() => handleAdicionarTagObservacao(tag)}
                            />
                        ))}
                    </Stack>
                </Box>

                <Divider />
                <Box display="flex" alignItems="center" justifyContent="space-between" gap={2} flexWrap="wrap">
                    <Typography variant="body2" color="text.secondary">
                        {resumoMissas}
                    </Typography>
                    <Button variant="contained" color="primary" onClick={handleAddMissa} sx={{ whiteSpace: "nowrap" }}>
                        {totalMissasNovas > 0 ? `Adicionar ${totalMissasNovas} missa(s)` : "Adicionar missa"}
                    </Button>
                </Box>

                <TextField
                    label="Apoio"
                    value={apoio}
                    onChange={(e) => setApoio(e.target.value)}
                    fullWidth
                    multiline
                    rows={3}
                    placeholder="Anotações temporárias de apoio (não salvo)..."
                    helperText="Este campo não é salvo."
                />

                {missas.length > 0 && (
                    <>
                        <Box display="flex" alignItems="center" justifyContent="space-between" sx={{ mt: 1 }}>
                            <Typography variant="body2" color="text.secondary">
                                {selecionadas.length > 0
                                    ? `${selecionadas.length} selecionada(s)`
                                    : `${missas.length} missa(s) cadastrada(s)`}
                            </Typography>
                            <Stack direction="row" spacing={1}>
                                {selecionadas.length > 0 && (
                                    <Button
                                        size="small"
                                        color="error"
                                        variant="outlined"
                                        startIcon={<Delete />}
                                        onClick={handleDeleteSelecionadas}
                                    >
                                        Deletar selecionadas ({selecionadas.length})
                                    </Button>
                                )}
                                <Button
                                    size="small"
                                    color="error"
                                    startIcon={<DeleteSweep />}
                                    onClick={handleDeleteTodas}
                                >
                                    Deletar todas
                                </Button>
                            </Stack>
                        </Box>

                        <TableContainer component={Paper} sx={{ mt: 1, borderRadius: 2 }}>
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell padding="checkbox">
                                            <Checkbox
                                                size="small"
                                                indeterminate={selecionadas.length > 0 && selecionadas.length < missas.length}
                                                checked={missas.length > 0 && selecionadas.length === missas.length}
                                                onChange={handleToggleSelecionarTodas}
                                            />
                                        </TableCell>
                                        <TableCell><strong>Horário</strong></TableCell>
                                        <TableCell><strong>Observação</strong></TableCell>
                                        <TableCell align="center"><strong>Ações</strong></TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {diasDaSemana.map((dia) => {
                                        const missasDoDia = missas
                                            .map((missa, index) => ({ missa, index }))
                                            .filter(({ missa }) => ehSemanal(missa) && Number(missa.diaSemana) === dia.value);

                                        if (missasDoDia.length === 0) return null;

                                        return (
                                            <React.Fragment key={`grupo-${dia.value}`}>
                                                <TableRow>
                                                    <TableCell colSpan={4} sx={{ backgroundColor: "action.hover", py: 0.5 }}>
                                                        <Typography variant="caption" fontWeight={700}>
                                                            {dia.label}
                                                        </Typography>
                                                    </TableCell>
                                                </TableRow>
                                                {missasDoDia.map(({ missa, index }) => (
                                                    <TableRow key={`${missa.horario}-${missa.diaSemana}-${index}`} hover selected={selecionadas.includes(index)}>
                                                        <TableCell padding="checkbox">
                                                            <Checkbox
                                                                size="small"
                                                                checked={selecionadas.includes(index)}
                                                                onChange={() => handleToggleSelecionada(index)}
                                                            />
                                                        </TableCell>
                                                        <TableCell>{formatarHorario(missa.horario)}</TableCell>
                                                        <TableCell>{missa.observacao || "Sem observação"}</TableCell>
                                                        <TableCell align="center">
                                                            <IconButton color="error" onClick={() => handleDeleteMissa(index)}>
                                                                <Delete />
                                                            </IconButton>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </React.Fragment>
                                        );
                                    })}
                                    {missas.some((m) => !ehSemanal(m)) && (
                                        <React.Fragment key="grupo-dia-fixo">
                                            <TableRow>
                                                <TableCell colSpan={4} sx={{ backgroundColor: "action.hover", py: 0.5 }}>
                                                    <Typography variant="caption" fontWeight={700}>
                                                        Mensais (dia fixo e dia da semana no mês)
                                                    </Typography>
                                                </TableCell>
                                            </TableRow>
                                            {missas
                                                .map((missa, index) => ({ missa, index }))
                                                .filter(({ missa }) => !ehSemanal(missa))
                                                .sort((a, b) => descrever(a.missa).localeCompare(descrever(b.missa)))
                                                .map(({ missa, index }) => (
                                                    <TableRow key={`fixo-${missa.diaDoMes}-${missa.horario}-${index}`} hover selected={selecionadas.includes(index)}>
                                                        <TableCell padding="checkbox">
                                                            <Checkbox
                                                                size="small"
                                                                checked={selecionadas.includes(index)}
                                                                onChange={() => handleToggleSelecionada(index)}
                                                            />
                                                        </TableCell>
                                                        <TableCell>{descrever(missa)}</TableCell>
                                                        <TableCell>{missa.observacao || "Sem observação"}</TableCell>
                                                        <TableCell align="center">
                                                            <IconButton color="error" onClick={() => handleDeleteMissa(index)}>
                                                                <Delete />
                                                            </IconButton>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                        </React.Fragment>
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </>
                )}
            </Box>
        </SectionCard>
    );
};

export default MissaForm;
