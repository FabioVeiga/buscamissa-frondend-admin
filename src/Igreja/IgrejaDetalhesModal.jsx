/* eslint-disable react/prop-types */
import { TIPO_RECORRENCIA, descrever, ehSemanal } from "../recorrenciaMissa";
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
  Divider,
  Link as MUILink,
  Alert,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import LanguageIcon from "@mui/icons-material/Language";
import { useNavigate } from "react-router-dom";
import { diaDaSemana, formatarHorario } from "../utils";
import ContentPasteIcon from "@mui/icons-material/ContentPaste";
import { buscarIgrejaCompletaPorId, normalizarIgrejaParaEdicao } from "../services/igrejaHelpers";
import api from "../services/apiService";
import { formatarErroApi, removerMissasDuplicadas } from "../utils";
import ColarHorariosModal from "./Components/ColarHorariosModal";

// Modal de detalhes da igreja, reutilizável em qualquer tela que só tenha o
// Id da igreja à mão (Igrejas, Divulgação, Indicadores, Aprovações...).
// Busca os dados completos sozinho e oferece um atalho direto para a edição.
const IgrejaDetalheModal = ({ open, handleClose, igrejaId }) => {
  const navigate = useNavigate();
  const [igreja, setIgreja] = useState(null);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");
  const [colarAberto, setColarAberto] = useState(false);
  const [salvandoHorarios, setSalvandoHorarios] = useState(false);
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    if (!open || !igrejaId) return;

    setLoading(true);
    setErro("");
    setIgreja(null);
    setFeedback(null);

    buscarIgrejaCompletaPorId(igrejaId)
      .then((response) => {
        const dados = response?.igreja || response?.item || response?.data || response;
        setIgreja(dados);
      })
      .catch(() => setErro("Não foi possível carregar os detalhes da igreja."))
      .finally(() => setLoading(false));
  }, [open, igrejaId]);

  // Salva só as missas: o backend mantém nome, endereço, contato etc. quando o campo não vem no payload.
  const handleSalvarHorarios = async (missas) => {
    setSalvandoHorarios(true);
    setFeedback(null);
    try {
      const lista = removerMissasDuplicadas(missas);
      await api.put("/api/v1/Admin/igreja/atualizar", { id: igreja.id, missas: lista });
      setIgreja((prev) => ({ ...prev, missas: lista }));
      setFeedback({ severity: "success", texto: "Horários salvos." });
      return true;
    } catch (e) {
      setFeedback({ severity: "error", texto: (e?.response?.data?.errors && formatarErroApi(e.response.data.errors)) || "Não foi possível salvar os horários." });
      return false;
    } finally {
      setSalvandoHorarios(false);
    }
  };

  const handleEditar = () => {
    handleClose();
    navigate("/igrejaEditar", { state: { row: normalizarIgrejaParaEdicao(igreja) } });
  };

  // Agrupa as missas por dia da semana
  const missasPorDia = {};
  if (igreja?.missas?.length > 0) {
    igreja.missas.filter((missa) => ehSemanal(missa)).forEach((missa) => {
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
              <strong>Id:</strong> {igreja?.id}
            </Typography>

            <Typography variant="body1" gutterBottom>
              <strong>Pároco:</strong> {igreja?.paroco || "Não informado"}
            </Typography>

            <Typography variant="body1" gutterBottom>
              <strong>Status:</strong> {igreja?.ativo ? "Ativo" : "Inativo"}
            </Typography>

            <Box display="flex" alignItems="center" justifyContent="space-between" gap={1} mb={1}>
              <Typography variant="body1">
                <strong>Missas:</strong>
              </Typography>
              <Button size="small" variant="outlined" startIcon={<ContentPasteIcon />} onClick={() => setColarAberto(true)}>
                Colar horários
              </Button>
            </Box>

            {feedback && (
              <Alert severity={feedback.severity} sx={{ mb: 1 }} onClose={() => setFeedback(null)}>
                {feedback.texto}
              </Alert>
            )}

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
                  {(igreja?.missas || []).filter((missa) => !ehSemanal(missa)).map((missa, i) => (
                    <TableRow key={`fixo-${i}`}>
                      <TableCell>{Number(missa.tipoRecorrencia) === TIPO_RECORRENCIA.DataEspecifica ? "Data" : "Mensal"}</TableCell>
                      <TableCell>
                        {missa.nome ? <strong>{missa.nome} · </strong> : null}
                        {descrever(missa)}
                        {missa.substituiMissasDoDia ? " (substitui as normais)" : ""}
                        {missa.observacao ? ` (${missa.observacao})` : ""}
                      </TableCell>
                    </TableRow>
                  ))}
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

            <Divider sx={{ my: 2 }} />

            <Typography variant="body1" gutterBottom>
              <strong>Contatos:</strong>
            </Typography>

            {igreja?.contato && (Object.values(igreja.contato).some(v => v)) ? (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                {igreja.contato.emailContato && (
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <EmailIcon fontSize="small" color="action" />
                    <MUILink href={`mailto:${igreja.contato.emailContato}`} target="_blank">
                      {igreja.contato.emailContato}
                    </MUILink>
                  </Box>
                )}
                {(igreja.contato.ddd || igreja.contato.telefone) && (
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <PhoneIcon fontSize="small" color="action" />
                    <Typography variant="body2">
                      ({igreja.contato.ddd}) {igreja.contato.telefone}
                    </Typography>
                  </Box>
                )}
                {(igreja.contato.dddWhatsApp || igreja.contato.telefoneWhatsApp) && (
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <WhatsAppIcon fontSize="small" color="action" />
                    <MUILink
                      href={`https://wa.me/${igreja.contato.dddWhatsApp}${igreja.contato.telefoneWhatsApp}`}
                      target="_blank"
                    >
                      ({igreja.contato.dddWhatsApp}) {igreja.contato.telefoneWhatsApp}
                    </MUILink>
                  </Box>
                )}
                {igreja.contato.website && (
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <LanguageIcon fontSize="small" color="action" />
                    <MUILink href={igreja.contato.website} target="_blank">
                      {igreja.contato.website}
                    </MUILink>
                  </Box>
                )}
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary">
                Nenhum contato cadastrado.
              </Typography>
            )}

            <Stack direction="row" spacing={1} justifyContent="center" sx={{ mt: 3 }}>
              <Button variant="outlined" onClick={handleClose}>
                Fechar
              </Button>
              <Button variant="contained" startIcon={<EditIcon />} onClick={handleEditar}>
                Editar
              </Button>
            </Stack>
            <ColarHorariosModal
              open={colarAberto}
              onClose={() => setColarAberto(false)}
              missasAtuais={igreja?.missas || []}
              onAplicar={handleSalvarHorarios}
              salvando={salvandoHorarios}
              textoConfirmar="Salvar horários"
            />
          </>
        )}
      </Box>
    </Modal>
  );
};

export default IgrejaDetalheModal;
