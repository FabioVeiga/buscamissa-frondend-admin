/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import {
  Modal,
  Box,
  Typography,
  Button,
  Stack,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import { useNavigate } from "react-router-dom";
import { diaDaSemana, formatarHorario } from "../utils";
import { buscarIgrejaCompletaPorId, normalizarIgrejaParaEdicao } from "../services/igrejaHelpers";

// Modal de detalhes da igreja, reutilizável em qualquer tela que só tenha o
// Id da igreja à mão (Igrejas, Divulgação, Indicadores, Aprovações...).
// Busca os dados completos sozinho e oferece um atalho direto para a edição.
const IgrejaDetalheModal = ({ open, handleClose, igrejaId }) => {
  const navigate = useNavigate();
  const [igreja, setIgreja] = useState(null);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

  useEffect(() => {
    if (!open || !igrejaId) return;

    setLoading(true);
    setErro("");
    setIgreja(null);

    buscarIgrejaCompletaPorId(igrejaId)
      .then((response) => {
        const dados = response?.igreja || response?.item || response?.data || response;
        setIgreja(dados);
      })
      .catch(() => setErro("Não foi possível carregar os detalhes da igreja."))
      .finally(() => setLoading(false));
  }, [open, igrejaId]);

  const handleEditar = () => {
    handleClose();
    navigate("/igrejaEditar", { state: { row: normalizarIgrejaParaEdicao(igreja) } });
  };

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
          width: "min(500px, 92vw)",
          maxHeight: "85vh",
          overflowY: "auto",
          bgcolor: "background.paper",
          boxShadow: 24,
          p: 4,
          borderRadius: 2,
        }}
      >
        {loading ? (
          <Box display="flex" justifyContent="center" py={4}>
            <CircularProgress />
          </Box>
        ) : erro ? (
          <Typography color="error">{erro}</Typography>
        ) : (
          <>
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
              <strong>Pároco:</strong> {igreja?.paroco || "Não informado"}
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
                  {(!igreja?.missas || igreja.missas.length === 0) && (
                    <TableRow>
                      <TableCell colSpan={2}>
                        <Typography variant="body2">Nenhuma missa cadastrada.</Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            <Stack direction="row" spacing={1} justifyContent="center" sx={{ mt: 2 }}>
              <Button variant="outlined" onClick={handleClose}>
                Fechar
              </Button>
              <Button variant="contained" startIcon={<EditIcon />} onClick={handleEditar}>
                Editar
              </Button>
            </Stack>
          </>
        )}
      </Box>
    </Modal>
  );
};

export default IgrejaDetalheModal;
