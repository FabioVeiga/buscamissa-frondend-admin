import { useState, useEffect, useCallback } from "react";
import Menu from "./Components/Menu";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Chip,
  Alert,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import api from "./services/apiService";

const UFS = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS",
  "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC",
  "SP", "SE", "TO",
];

const TIPOS = [
  { valor: 1, label: "Geral", cor: "default" },
  { valor: 2, label: "Aviso", cor: "warning" },
  { valor: 3, label: "Urgente", cor: "error" },
];

const FORM_VAZIO = { titulo: "", mensagem: "", tipo: 2, uf: "" };

const NotificacoesPage = () => {
  const [notificacoes, setNotificacoes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [dialogAberto, setDialogAberto] = useState(false);
  const [form, setForm] = useState(FORM_VAZIO);
  const [preview, setPreview] = useState(null);
  const [carregandoPreview, setCarregandoPreview] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [erroDialog, setErroDialog] = useState(null);

  const carregar = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await api.get("/api/v1/admin/notificacoes");
      setNotificacoes(response.data?.data || []);
    } catch (error) {
      console.error("Erro ao buscar notificações:", error);
      setNotificacoes([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const abrirNova = () => {
    setForm(FORM_VAZIO);
    setPreview(null);
    setErroDialog(null);
    setDialogAberto(true);
  };

  const buscarPreview = async () => {
    if (!form.uf) {
      setPreview(null);
      return;
    }
    setCarregandoPreview(true);
    setErroDialog(null);
    try {
      const response = await api.get("/api/v1/admin/notificacoes/preview", {
        params: { uf: form.uf },
      });
      setPreview(response.data?.data || null);
    } catch (error) {
      console.error("Erro ao pré-visualizar destinatários:", error);
      setPreview(null);
    } finally {
      setCarregandoPreview(false);
    }
  };

  const enviar = async () => {
    if (!form.titulo.trim() || !form.mensagem.trim() || !form.uf) {
      setErroDialog("Preencha título, mensagem e a UF de destino.");
      return;
    }
    setEnviando(true);
    setErroDialog(null);
    try {
      await api.post("/api/v1/admin/notificacoes", {
        titulo: form.titulo.trim(),
        mensagem: form.mensagem.trim(),
        tipo: form.tipo,
        uf: form.uf,
      });
      setDialogAberto(false);
      carregar();
    } catch (error) {
      const mensagem =
        error.response?.status === 409
          ? error.response?.data?.data || "Nenhuma igreja com responsável verificado foi encontrada."
          : "Erro ao enviar. Tente novamente.";
      setErroDialog(mensagem);
    } finally {
      setEnviando(false);
    }
  };

  const corTipo = (tipo) => TIPOS.find((t) => t.label === tipo)?.cor || "default";

  return (
    <Menu>
      <TableContainer component={Paper} sx={{ p: 2, borderRadius: 2, overflow: "auto" }}>
        <Box sx={{ mb: 2, display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 1 }}>
          <Box>
            <Typography variant="h5" fontWeight={600}>
              Notificações
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Avisos in-app para responsáveis verificados — só chegam a igrejas
              que já têm um responsável aprovado.
            </Typography>
          </Box>
          <Button variant="contained" startIcon={<AddIcon />} onClick={abrirNova}>
            Nova notificação
          </Button>
        </Box>

        {isLoading ? (
          <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" py={4}>
            <CircularProgress size={60} />
            <Typography variant="h6" mt={2}>
              Carregando...
            </Typography>
          </Box>
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Título</TableCell>
                <TableCell>Tipo</TableCell>
                <TableCell>Enviada por</TableCell>
                <TableCell>Data</TableCell>
                <TableCell align="center">Destinatários</TableCell>
                <TableCell align="center">Lidas</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {notificacoes.length > 0 ? (
                notificacoes.map((n) => (
                  <TableRow key={n.id}>
                    <TableCell>
                      {n.titulo}
                      <Typography variant="caption" display="block" color="text.secondary">
                        {n.mensagem}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip size="small" label={n.tipo} color={corTipo(n.tipo)} />
                    </TableCell>
                    <TableCell>{n.criadaPor}</TableCell>
                    <TableCell>{new Date(n.criadaEm).toLocaleString("pt-BR")}</TableCell>
                    <TableCell align="center">{n.totalDestinos}</TableCell>
                    <TableCell align="center">
                      {n.totalLidos}/{n.totalDestinos}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    Nenhuma notificação enviada ainda.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </TableContainer>

      <Dialog open={dialogAberto} onClose={() => !enviando && setDialogAberto(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Nova notificação</DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: "8px !important" }}>
          {erroDialog && <Alert severity="error">{erroDialog}</Alert>}
          <TextField
            label="Título"
            value={form.titulo}
            onChange={(e) => setForm({ ...form, titulo: e.target.value })}
            required
            fullWidth
            inputProps={{ maxLength: 150 }}
          />
          <TextField
            label="Mensagem"
            value={form.mensagem}
            onChange={(e) => setForm({ ...form, mensagem: e.target.value })}
            required
            fullWidth
            multiline
            minRows={3}
            inputProps={{ maxLength: 1000 }}
          />
          <TextField
            label="Tipo"
            value={form.tipo}
            onChange={(e) => setForm({ ...form, tipo: e.target.value })}
            select
            fullWidth
          >
            {TIPOS.map((t) => (
              <MenuItem key={t.valor} value={t.valor}>
                {t.label}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label="Enviar para UF"
            value={form.uf}
            onChange={(e) => {
              setForm({ ...form, uf: e.target.value });
              setPreview(null);
            }}
            select
            fullWidth
            helperText="Só chega a igrejas com responsável verificado aprovado nessa UF."
          >
            <MenuItem value="">
              <em>Selecione</em>
            </MenuItem>
            {UFS.map((uf) => (
              <MenuItem key={uf} value={uf}>
                {uf}
              </MenuItem>
            ))}
          </TextField>

          {form.uf && (
            <Box>
              <Button size="small" onClick={buscarPreview} disabled={carregandoPreview}>
                {carregandoPreview ? "Verificando..." : "Ver quantas igrejas serão atingidas"}
              </Button>
              {preview && (
                <Alert severity={preview.totalIgrejas === 0 ? "warning" : "info"} sx={{ mt: 1 }}>
                  {preview.totalIgrejas === 0
                    ? "Nenhuma igreja com responsável verificado nessa UF."
                    : `${preview.totalIgrejas} igreja(s) receberão: ${preview.amostra.join(", ")}${
                        preview.totalIgrejas > preview.amostra.length ? "..." : ""
                      }`}
                </Alert>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogAberto(false)} disabled={enviando}>
            Cancelar
          </Button>
          <Button variant="contained" onClick={enviar} disabled={enviando}>
            {enviando ? "Enviando..." : "Enviar notificação"}
          </Button>
        </DialogActions>
      </Dialog>
    </Menu>
  );
};

export default NotificacoesPage;
