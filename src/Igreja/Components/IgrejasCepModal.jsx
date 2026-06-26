import {
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
                             onClose,
                             onEditar,
                             loading = false,
                         }) => {
    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle>Igrejas encontradas para este CEP</DialogTitle>

            <DialogContent>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Selecione uma igreja abaixo para abrir a tela de edição.
                </Typography>

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

                                return (
                                    <TableRow key={igreja.id} hover>
                                        <TableCell>{igreja.id}</TableCell>
                                        <TableCell>{igreja.nome}</TableCell>
                                        <TableCell>{endereco.uf || "-"}</TableCell>
                                        <TableCell>{endereco.estado || "-"}</TableCell>
                                        <TableCell>{endereco.localidade || "-"}</TableCell>
                                        <TableCell align="center">
                                            <Button
                                                variant="contained"
                                                size="small"
                                                disabled={loading}
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