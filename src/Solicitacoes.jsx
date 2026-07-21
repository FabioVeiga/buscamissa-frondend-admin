import { useState, useEffect, useRef } from "react";
import Menu from "./Components/Menu";
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, CircularProgress, Box, Typography, Button, Dialog,
  DialogActions, DialogContent, DialogTitle, TextField, Checkbox,
  FormControlLabel, Select, MenuItem, TableFooter, Chip, Divider,
  Tooltip, IconButton, Snackbar, Alert,
} from "@mui/material";
import { Link, CheckCircle, Cancel, OpenInNew, Search } from "@mui/icons-material";
import api from "./services/apiService";
import IgrejaDetalheModal from "./Igreja/IgrejaDetalhesModal";

const SolicitacoesPage = () => {
  const [solicitacoes, setSolicitacoes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const [selectedSolicitacao, setSelectedSolicitacao] = useState(null);
  const [solucao, setSolucao] = useState("");
  const [resposta, setResponse] = useState("");
  const [enviarEmail, setEnviarEmail] = useState(false);
  const [filtroResolvida, setFiltroResolvida] = useState("false");
  const [linkModalOpen, setLinkModalOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [linkTexto, setLinkTexto] = useState("");
  const [toast, setToast] = useState({ open: false, message: "", severity: "success" });
  const [igrejaModalOpen, setIgrejaModalOpen] = useState(false);
  const [selectedIgrejaId, setSelectedIgrejaId] = useState(null);
  const respostaRef = useRef(null);

  const showToast = (message, severity = "success") =>
    setToast({ open: true, message, severity });

  const handleCloseToast = () =>
    setToast((prev) => ({ ...prev, open: false }));

  const buscarSolicitacoes = async () => {
    setIsLoading(true);
    try {
      const response = await api.get(
        `/api/v1/Admin/solicitacao${filtroResolvida ? `?resolvida=${filtroResolvida}` : ""}`
      );
      setSolicitacoes(response.data.data);
    } catch {
      setSolicitacoes([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    buscarSolicitacoes();
  }, []);

  const handleOpenModal = (solicitacao) => {
    setSelectedSolicitacao(solicitacao);
    setSolucao("");
    setResponse("");
    setEnviarEmail(false);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedSolicitacao(null);
  };

  const handleConfirmSolucao = async () => {
    if (!selectedSolicitacao) return;

    try {
      const response = await api.post(
        `/api/v1/admin/solicitacao/${selectedSolicitacao.id}`,
        { resolvido: true, solucao, resposta, EnviarResposta: enviarEmail }
      );

      if (response.status === 200) {
        showToast("Solicitação atendida com sucesso!");
        setSolicitacoes((prev) =>
          prev.map((s) =>
            s.id === selectedSolicitacao.id ? { ...s, resolvido: true } : s
          )
        );
      }
    } catch (error) {
      console.error("Erro ao atender solicitação:", error);
      showToast("Erro ao atender a solicitação. Tente novamente.", "error");
    } finally {
      handleCloseModal();
    }
  };

  const handleFiltroChange = (event) => {
    setFiltroResolvida(event.target.value);
  };

  const formatarData = (data) => {
    if (!data) return "—";
    const d = new Date(data);
    if (isNaN(d.getTime())) return "—";
    return d.toLocaleDateString("pt-BR");
  };

  const handleOpenIgrejaModal = (igrejaId) => {
    if (!igrejaId) return;
    setSelectedIgrejaId(igrejaId);
    setIgrejaModalOpen(true);
  };

  const handleCloseIgrejaModal = () => {
    setIgrejaModalOpen(false);
    setSelectedIgrejaId(null);
  };

  const handleInserirLink = () => {
    const textarea = respostaRef.current?.querySelector("textarea");
    const linkFormatado = linkTexto
      ? `<a href="${linkUrl}">${linkTexto}</a>`
      : linkUrl;

    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      setResponse((prev) => prev.slice(0, start) + linkFormatado + prev.slice(end));
    } else {
      setResponse((prev) => prev + linkFormatado);
    }

    setLinkModalOpen(false);
    setLinkUrl("");
    setLinkTexto("");
  };

  return (
    <Menu>
      <Box sx={{ p: { xs: 1, sm: 2 } }}>
        {/* Cabeçalho */}
        <Box
          display="flex"
          flexDirection={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "stretch", sm: "center" }}
          gap={2}
          sx={{ mb: 3 }}
        >
          <Box>
            <Typography variant="h5" fontWeight={700}>Solicitações</Typography>
            <Typography variant="body2" color="text.secondary">
              Gerencie e responda as solicitações recebidas
            </Typography>
          </Box>

          <Box display="flex" flexDirection={{ xs: "column", sm: "row" }} gap={1} alignItems={{ xs: "stretch", sm: "center" }}>
            <Select
              value={filtroResolvida}
              onChange={handleFiltroChange}
              displayEmpty
              size="small"
              sx={{ minWidth: { xs: "100%", sm: 180 } }}
            >
              <MenuItem value="">Todas</MenuItem>
              <MenuItem value="true">Resolvidas</MenuItem>
              <MenuItem value="false">Não Resolvidas</MenuItem>
            </Select>
            <Button
              variant="contained"
              startIcon={<Search />}
              onClick={buscarSolicitacoes}
              disabled={isLoading}
            >
              Pesquisar
            </Button>
          </Box>
        </Box>

        {/* Tabela */}
        <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: 2 }}>
          {isLoading ? (
            <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" py={8}>
              <CircularProgress size={48} />
              <Typography variant="body1" mt={2} color="text.secondary">Carregando...</Typography>
            </Box>
          ) : (
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: "grey.100" }}>
                  <TableCell><strong>ID</strong></TableCell>
                  <TableCell><strong>Solicitante</strong></TableCell>
                  <TableCell><strong>Igreja</strong></TableCell>
                  <TableCell><strong>Assunto</strong></TableCell>
                  <TableCell><strong>Mensagem</strong></TableCell>
                  <TableCell><strong>Status</strong></TableCell>
                  <TableCell><strong>Data Solução</strong></TableCell>
                  <TableCell align="center"><strong>Ações</strong></TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {solicitacoes && solicitacoes.length > 0 ? (
                  solicitacoes.map((s) => (
                    <TableRow
                      key={s.id}
                      hover
                      sx={{ opacity: s.resolvido ? 0.6 : 1 }}
                    >
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">#{s.id}</Typography>
                      </TableCell>
                      <TableCell>{s.nomeSolicitante || "—"}</TableCell>
                      <TableCell>
                        {s.igrejaId ? (
                          <Typography
                            component="button"
                            variant="body2"
                            onClick={() => handleOpenIgrejaModal(s.igrejaId)}
                            sx={{
                              background: "none",
                              border: "none",
                              padding: 0,
                              cursor: "pointer",
                              color: "primary.main",
                              textDecoration: "underline",
                              "&:hover": { textDecoration: "none", fontWeight: 600 },
                            }}
                          >
                            #{s.igrejaId}
                          </Typography>
                        ) : (
                          "—"
                        )}
                      </TableCell>
                      <TableCell>{s.assunto || "—"}</TableCell>
                      <TableCell sx={{ maxWidth: 260 }}>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
                          title={s.mensagem}
                        >
                          {s.mensagem || "—"}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          icon={s.resolvido ? <CheckCircle fontSize="small" /> : <Cancel fontSize="small" />}
                          label={s.resolvido ? "Resolvida" : "Pendente"}
                          color={s.resolvido ? "success" : "warning"}
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>{formatarData(s.dataSolucao)}</TableCell>
                      <TableCell align="center">
                        {!s.resolvido && (
                          <Button
                            variant="contained"
                            color="primary"
                            size="small"
                            onClick={() => handleOpenModal(s)}
                          >
                            Atender
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} align="center" sx={{ py: 6 }}>
                      <Typography color="text.secondary">Nenhuma solicitação encontrada.</Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>

              <TableFooter>
                <TableRow>
                  <TableCell colSpan={8} align="right">
                    <Typography variant="body2" color="text.secondary">
                      Total: {solicitacoes?.length ?? 0} registro(s)
                    </Typography>
                  </TableCell>
                </TableRow>
              </TableFooter>
            </Table>
          )}
        </TableContainer>
      </Box>

      {/* Modal de detalhes da Igreja */}
      <IgrejaDetalheModal
        open={igrejaModalOpen}
        handleClose={handleCloseIgrejaModal}
        igrejaId={selectedIgrejaId}
      />

      {/* Modal de atendimento */}
      <Dialog open={openModal} onClose={handleCloseModal} fullWidth maxWidth="sm">
        <DialogTitle sx={{ fontWeight: 700 }}>Atender Solicitação</DialogTitle>
        <Divider />

        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 2 }}>
          {/* Dados da solicitação */}
          <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, backgroundColor: "grey.50" }}>
            <Typography variant="caption" color="text.secondary" fontWeight={600}>
              ID #{selectedSolicitacao?.id}
            </Typography>
            {selectedSolicitacao?.assunto && (
              <Typography variant="subtitle2" fontWeight={700} mt={0.5}>
                {selectedSolicitacao.assunto}
              </Typography>
            )}
            {selectedSolicitacao?.nomeSolicitante && (
              <Typography variant="body2" color="text.secondary">
                Solicitante: {selectedSolicitacao.nomeSolicitante}
              </Typography>
            )}
            {selectedSolicitacao?.mensagem && (
              <>
                <Divider sx={{ my: 1 }} />
                <Typography variant="body2">{selectedSolicitacao.mensagem}</Typography>
              </>
            )}
          </Paper>

          {/* Solução interna */}
          <TextField
            label="Solução (uso interno)"
            fullWidth
            multiline
            rows={3}
            value={solucao}
            onChange={(e) => setSolucao(e.target.value)}
          />

          {/* Resposta para e-mail */}
          <Box>
            <Box display="flex" alignItems="center" justifyContent="space-between" sx={{ mb: 0.5 }}>
              <Typography variant="body2" fontWeight={600} color="text.secondary">
                Resposta para e-mail
              </Typography>
              <Tooltip title="Inserir link">
                <IconButton size="small" onClick={() => setLinkModalOpen(true)} color="primary">
                  <Link fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
            <TextField
              ref={respostaRef}
              fullWidth
              multiline
              rows={4}
              value={resposta}
              onChange={(e) => setResponse(e.target.value)}
              placeholder="Texto da resposta que será enviado por e-mail..."
            />
            <Typography variant="caption" color="text.secondary">
              Use o botão <strong>link</strong> para inserir links clicáveis no e-mail.
            </Typography>
          </Box>

          <FormControlLabel
            control={
              <Checkbox
                checked={enviarEmail}
                onChange={(e) => setEnviarEmail(e.target.checked)}
              />
            }
            label="Enviar e-mail ao solicitante"
          />
        </DialogContent>

        <Divider />
        <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
          <Button onClick={handleCloseModal} color="inherit" variant="outlined">
            Cancelar
          </Button>
          <Button onClick={handleConfirmSolucao} color="primary" variant="contained">
            Confirmar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal de inserção de link */}
      <Dialog open={linkModalOpen} onClose={() => setLinkModalOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle sx={{ fontWeight: 700, display: "flex", alignItems: "center", gap: 1 }}>
          <OpenInNew fontSize="small" /> Inserir Link
        </DialogTitle>
        <Divider />

        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 2 }}>
          <TextField
            label="URL"
            fullWidth
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            placeholder="https://exemplo.com"
            autoFocus
          />
          <TextField
            label="Texto do link (opcional)"
            fullWidth
            value={linkTexto}
            onChange={(e) => setLinkTexto(e.target.value)}
            placeholder="Clique aqui"
            helperText="Se vazio, a URL será usada como texto."
          />
        </DialogContent>

        <Divider />
        <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
          <Button onClick={() => setLinkModalOpen(false)} color="inherit" variant="outlined">
            Cancelar
          </Button>
          <Button
            onClick={handleInserirLink}
            color="primary"
            variant="contained"
            disabled={!linkUrl.trim()}
          >
            Inserir
          </Button>
        </DialogActions>
      </Dialog>
      <Snackbar
        open={toast.open}
        autoHideDuration={4000}
        onClose={handleCloseToast}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert onClose={handleCloseToast} severity={toast.severity} variant="filled" sx={{ width: "100%" }}>
          {toast.message}
        </Alert>
      </Snackbar>
    </Menu>
  );
};

export default SolicitacoesPage;
