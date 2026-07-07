/* eslint-disable react/prop-types */
import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
} from "@mui/material";

const IgrejasCepModal = ({
                             open,
                             igrejas = [],
                             endereco = null,
                             onClose,
                             onEditar,
                             onUsarEndereco,
                             loading = false,
                             igrejaAtualId,
                         }) => {
    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle>Igrejas encontradas para este CEP</DialogTitle>

            <DialogContent>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Selecione uma igreja abaixo para abrir a tela de edição.
                </Typography>

                {endereco && onUsarEndereco && (
                    <Paper
                        variant="outlined"
                        sx={{ p: 2, borderRadius: 2, mb: 2, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2, flexWrap: "wrap" }}
                    >
                        <Box>
                            <Typography variant="subtitle2" fontWeight={700}>
                                Endereço encontrado para este CEP
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {[endereco.logradouro, endereco.bairro, endereco.localidade, endereco.uf]
                                    .filter(Boolean)
                                    .join(", ") || "Endereço sem logradouro específico (CEP genérico)."}
                            </Typography>
                        </Box>
                        <Button
                            variant="contained"
                            size="small"
                            disabled={loading}
                            onClick={() => onUsarEndereco(endereco)}
                        >
                            Usar este endereço
                        </Button>
                    </Paper>
                )}

                <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
                    <Table size="small">
                        <TableHead>
                            <TableRow sx={{ backgroundColor: "grey.100" }}>
                                <TableCell>
                                    <strong>ID</strong>
                                </TableCell>
                                <TableCell>
                                    <strong>Nome da igreja</strong>
                                </TableCell>
                                <TableCell>
                                    <strong>UF</strong>
                                </TableCell>
                                <TableCell>
                                    <strong>Estado</strong>
                                </TableCell>
                                <TableCell>
                                    <strong>Cidade</strong>
                                </TableCell>
                                <TableCell align="center">
                                    <strong>Ações</strong>
                                </TableCell>
                            </TableRow>
                        </TableHead>

                        <TableBody>
                            {igrejas.map((igreja) => {
                                const endereco = igreja.dadosEndereco || igreja.endereco || {};
                                const ehIgrejaAtual =
                                    igrejaAtualId != null && igreja.id === igrejaAtualId;

                                return (
                                    <TableRow key={igreja.id} hover>
                                        <TableCell>{igreja.id}</TableCell>
                                        <TableCell>
                                            {igreja.nome}
                                            {ehIgrejaAtual && " (igreja atual)"}
                                        </TableCell>
                                        <TableCell>{endereco.uf || "-"}</TableCell>
                                        <TableCell>{endereco.estado || "-"}</TableCell>
                                        <TableCell>{endereco.localidade || "-"}</TableCell>
                                        <TableCell align="center">
                                            <Button
                                                variant="contained"
                                                size="small"
                                                disabled={loading || ehIgrejaAtual}
                                                onClick={() => onEditar(igreja)}
                                            >
                                                Editar
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}

                            {igrejas.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={6} align="center">
                                        Nenhuma igreja encontrada.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </DialogContent>

            <DialogActions>
                <Button onClick={onClose} disabled={loading}>
                    Fechar
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default IgrejasCepModal;