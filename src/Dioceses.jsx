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
  Tabs,
  Tab,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  FormControlLabel,
  Switch,
  Chip,
  IconButton,
  Tooltip,
  Alert,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import api from "./services/apiService";

const UFS = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS",
  "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC",
  "SP", "SE", "TO",
];

const FORM_VAZIO = { nome: "", uf: "", cidade: "", site: "", arquidioceseId: "", ativo: true };

const DiocesesPage = () => {
  const [aba, setAba] = useState(0); // 0 = Arquidioceses, 1 = Dioceses
  const [arquidioceses, setArquidioceses] = useState([]);
  const [dioceses, setDioceses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [incluirInativas, setIncluirInativas] = useState(false);

  // Dialog de criação/edição
  const [dialogAberto, setDialogAberto] = useState(false);
  const [editando, setEditando] = useState(null); // registro em edição ou null (novo)
  const [form, setForm] = useState(FORM_VAZIO);
  const [salvando, setSalvando] = useState(false);
  const [erroDialog, setErroDialog] = useState(null);

  const ehAbaArquidiocese = aba === 0;

  const carregar = useCallback(async () => {
    setIsLoading(true);
    try {
      const query = incluirInativas ? "?incluirInativas=true" : "";
      const [respArqui, respDio] = await Promise.all([
        api.get(`/api/v1/admin/arquidioceses${query}`),
        api.get(`/api/v1/admin/dioceses${query}`),
      ]);
      setArquidioceses(respArqui.data?.data || []);
      setDioceses(respDio.data?.data || []);
    } catch (error) {
      console.error("Erro ao buscar arquidioceses/dioceses:", error);
      setArquidioceses([]);
      setDioceses([]);
    } finally {
      setIsLoading(false);
    }
  }, [incluirInativas]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const abrirNovo = () => {
    setEditando(null);
    setForm(FORM_VAZIO);
    setErroDialog(null);
    setDialogAberto(true);
  };

  const abrirEdicao = (registro) => {
    setEditando(registro);
    setForm({
      nome: registro.nome,
      uf: registro.uf,
      cidade: registro.cidade || "",
      site: registro.site || "",
      arquidioceseId: registro.arquidioceseId ?? "",
      ativo: registro.ativo,
    });
    setErroDialog(null);
    setDialogAberto(true);
  };

  const salvar = async () => {
    if (!form.nome.trim() || !form.uf) {
      setErroDialog("Nome e UF são obrigatórios.");
      return;
    }
    setSalvando(true);
    setErroDialog(null);

    const payload = {
      nome: form.nome.trim(),
      uf: form.uf,
      cidade: form.cidade.trim() || null,
      site: form.site.trim() || null,
    };
    if (!ehAbaArquidiocese) {
      payload.arquidioceseId = form.arquidioceseId === "" ? null : form.arquidioceseId;
    }
    if (editando) {
      payload.ativo = form.ativo;
    }

    const recurso = ehAbaArquidiocese ? "arquidioceses" : "dioceses";
    try {
      if (editando) {
        await api.put(`/api/v1/admin/${recurso}/${editando.id}`, payload);
      } else {
        await api.post(`/api/v1/admin/${recurso}`, payload);
      }
      setDialogAberto(false);
      carregar();
    } catch (error) {
      const mensagem =
        error.response?.status === 409
          ? error.response?.data?.data || "Registro duplicado."
          : "Erro ao salvar. Tente novamente.";
      setErroDialog(mensagem);
    } finally {
      setSalvando(false);
    }
  };

  const registros = ehAbaArquidiocese ? arquidioceses : dioceses;
  const tituloRecurso = ehAbaArquidiocese ? "Arquidiocese" : "Diocese";

  return (
    <Menu>
      <TableContainer component={Paper} sx={{ p: 2, borderRadius: 2, overflow: "auto" }}>
        <Box sx={{ mb: 2, display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 1 }}>
          <Box>
            <Typography variant="h5" fontWeight={600}>
              Arquidioceses e Dioceses
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Estrutura eclesiástica que será relacionada às paróquias. Exclusão é
              sempre lógica (inativar), nunca física.
            </Typography>
          </Box>
          <Button variant="contained" startIcon={<AddIcon />} onClick={abrirNovo}>
            Nova {tituloRecurso}
          </Button>
        </Box>

        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap" }}>
          <Tabs value={aba} onChange={(_, v) => setAba(v)} sx={{ mb: 1 }}>
            <Tab label={`Arquidioceses (${arquidioceses.length})`} />
            <Tab label={`Dioceses (${dioceses.length})`} />
          </Tabs>
          <FormControlLabel
            control={
              <Switch
                checked={incluirInativas}
                onChange={(e) => setIncluirInativas(e.target.checked)}
              />
            }
            label="Mostrar inativas"
          />
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
                <TableCell>Nome</TableCell>
                <TableCell align="center">UF</TableCell>
                <TableCell>Cidade</TableCell>
                {ehAbaArquidiocese ? (
                  <TableCell align="center">Dioceses</TableCell>
                ) : (
                  <TableCell>Arquidiocese</TableCell>
                )}
                <TableCell align="center">Status</TableCell>
                <TableCell align="center">Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {registros.length > 0 ? (
                registros.map((r) => (
                  <TableRow key={r.id} sx={{ opacity: r.ativo ? 1 : 0.55 }}>
                    <TableCell>
                      {r.nome}
                      {r.site && (
                        <Typography variant="caption" display="block" color="text.secondary">
                          {r.site}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell align="center">{r.uf}</TableCell>
                    <TableCell>{r.cidade || "—"}</TableCell>
                    {ehAbaArquidiocese ? (
                      <TableCell align="center">{r.quantidadeDioceses}</TableCell>
                    ) : (
                      <TableCell>{r.arquidioceseNome || "—"}</TableCell>
                    )}
                    <TableCell align="center">
                      <Chip
                        size="small"
                        label={r.ativo ? "Ativa" : "Inativa"}
                        color={r.ativo ? "success" : "default"}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title="Editar">
                        <IconButton size="small" onClick={() => abrirEdicao(r)}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    Nenhuma {tituloRecurso.toLowerCase()} cadastrada.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </TableContainer>

      <Dialog open={dialogAberto} onClose={() => !salvando && setDialogAberto(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editando ? `Editar ${tituloRecurso}` : `Nova ${tituloRecurso}`}
        </DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: "8px !important" }}>
          {erroDialog && <Alert severity="error">{erroDialog}</Alert>}
          <TextField
            label="Nome"
            value={form.nome}
            onChange={(e) => setForm({ ...form, nome: e.target.value })}
            required
            fullWidth
            inputProps={{ maxLength: 150 }}
          />
          <Box sx={{ display: "flex", gap: 2 }}>
            <TextField
              label="UF"
              value={form.uf}
              onChange={(e) => setForm({ ...form, uf: e.target.value })}
              required
              select
              sx={{ minWidth: 100 }}
            >
              {UFS.map((uf) => (
                <MenuItem key={uf} value={uf}>
                  {uf}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="Cidade da sede"
              value={form.cidade}
              onChange={(e) => setForm({ ...form, cidade: e.target.value })}
              fullWidth
              inputProps={{ maxLength: 100 }}
            />
          </Box>
          <TextField
            label="Site"
            value={form.site}
            onChange={(e) => setForm({ ...form, site: e.target.value })}
            fullWidth
            placeholder="https://..."
            inputProps={{ maxLength: 255 }}
          />
          {!ehAbaArquidiocese && (
            <TextField
              label="Arquidiocese (província eclesiástica)"
              value={form.arquidioceseId}
              onChange={(e) => setForm({ ...form, arquidioceseId: e.target.value })}
              select
              fullWidth
              helperText="Opcional — pode ser vinculada depois."
            >
              <MenuItem value="">
                <em>Sem vínculo</em>
              </MenuItem>
              {arquidioceses
                .filter((a) => a.ativo)
                .map((a) => (
                  <MenuItem key={a.id} value={a.id}>
                    {a.nome} ({a.uf})
                  </MenuItem>
                ))}
            </TextField>
          )}
          {editando && (
            <FormControlLabel
              control={
                <Switch
                  checked={form.ativo}
                  onChange={(e) => setForm({ ...form, ativo: e.target.checked })}
                />
              }
              label={form.ativo ? "Ativa" : "Inativa"}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogAberto(false)} disabled={salvando}>
            Cancelar
          </Button>
          <Button variant="contained" onClick={salvar} disabled={salvando}>
            {salvando ? "Salvando..." : "Salvar"}
          </Button>
        </DialogActions>
      </Dialog>
    </Menu>
  );
};

export default DiocesesPage;
