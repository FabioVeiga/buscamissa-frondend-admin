/* eslint-disable react/prop-types */
import {
  Modal,
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";
import { diaDaSemana, formatarHorario } from "../utils";

const IgrejaDetalheModal = ({ open, handleClose, igreja }) => {
  // Agrupa as missas por dia da semana
  const missasPorDia = {};
  if (igreja?.missas?.length > 0) {
    igreja.missas.forEach((missa) => {
      if (!missasPorDia[missa.diaSemana]) {
        missasPorDia[missa.diaSemana] = [];
      }
      missasPorDia[missa.diaSemana].push(missa);
    });
  }

  // Dias da semana de 1 (segunda) a 7 (domingo)
  const diasSemana = [1, 2, 3, 4, 5, 6, 0]; // 0 = domingo

  return (
    <Modal open={open} onClose={handleClose}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 500,
          bgcolor: "background.paper",
          boxShadow: 24,
          p: 4,
          borderRadius: 2,
        }}
      >
        <Typography variant="h6" component="h2" gutterBottom>
          {igreja?.nome || "Detalhes da Igreja"}
        </Typography>

        {igreja?.imagemUrl && (
          <img
            src={igreja.imagemUrl}
            alt={igreja.nome}
            style={{ width: 30, height: 30, marginBottom: 16 }}
          />
        )}

        <Typography variant="body1" gutterBottom>
          <strong>Paróco:</strong> {igreja?.paroco || "Não informado"}
        </Typography>

        <Typography variant="body1" gutterBottom>
          <strong>Status:</strong> {igreja?.ativo ? "Ativo" : "Inativo"}
        </Typography>

        <Typography variant="body1" gutterBottom>
          <strong>Missas:</strong>
        </Typography>

        <TableContainer component={Paper} sx={{ mb: 2 }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell><strong>Dia da Semana</strong></TableCell>
                <TableCell><strong>Horários</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {diasSemana.map((dia) =>
                missasPorDia[dia] ? (
                  <TableRow key={dia}>
                    <TableCell>{diaDaSemana(dia)}</TableCell>
                    <TableCell>
                      {missasPorDia[dia]
                        .map(
                          (missa) =>
                            `${formatarHorario(missa.horario)}${missa.observacao ? ` (${missa.observacao})` : ""}`
                        )
                        .join(" | ")}
                    </TableCell>
                  </TableRow>
                ) : null
              )}
              {igreja?.missas?.length === 0 && (
                <TableRow>
                  <TableCell colSpan={2}>
                    <Typography variant="body2">Nenhuma missa cadastrada.</Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <Button
          variant="contained"
          onClick={handleClose}
          sx={{ mt: 2, display: "block", marginLeft: "auto", marginRight: "auto" }}
        >
          Fechar
        </Button>
      </Box>
    </Modal>
  );
};

export default IgrejaDetalheModal;