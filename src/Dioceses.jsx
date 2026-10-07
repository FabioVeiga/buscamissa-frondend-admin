import { useState, useEffect, useCallback } from "react";
import Menu from "./Components/Menu";
import PageHeader from "./Components/PageHeader";
import PageContainer from "./Components/PageContainer";
import DataTable from "./Components/DataTable";
import RowActions from "./Components/RowActions";
import StatusChip from "./Components/StatusChip";
import {
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
  Alert } from "@mui/material";
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
  const [filtroNome, setFiltroNome] = useState("");

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

  const registrosDaAba = ehAbaArquidiocese ? arquidioceses : dioceses;
  const registros = filtroNome.trim()
    ? registrosDaAba.filter((r) =>
        r.nome?.toLowerCase().includes(filtroNome.trim().toLowerCase())
      )
    : registrosDaAba;
  const tituloRecurso = ehAbaArquidiocese ? "Arquidiocese" : "Diocese";

  return (
    <Menu>
      <PageContainer>
      <PageHeader
        title="Arquidioceses e Dioceses"
        subtitle={`Estrutura eclesiástica que será relacionada às paróquias. Exclusão é sempre lógica (inativar), nunca física.`}
        actions={
          <Button variant="contained" startIcon={<AddIcon />} onClick={abrirNovo}>
            Nova {tituloRecurso}
          </Button>
        }
      />
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 1, mb: 1.5 }}>
        <Tabs value={aba} onChange={(_, v) => setAba(v)}>
          <Tab label={`Arquidioceses (${arquidioceses.length})`} />
          <Tab label={`Dioceses (${dioceses.length})`} />
        </Tabs>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <TextField
            label="Buscar por nome"
            size="small"
            value={filtroNome}
            onChange={(e) => setFiltroNome(e.target.value)}
          />
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
      </Box>

      <DataTable
        loading={isLoading}
        rows={registros}
        getRowKey={(r) => r.id}
        pageSize={25}
        rowSx={(r) => ({ opacity: r.ativo ? 1 : 0.55 })}
        emptyTitle={`Nenhuma ${tituloRecurso.toLowerCase()} cadastrada`}
        columns={[
          { key: "id", header: "ID", align: "center", sortable: true },
          {
            key: "nome",
            header: "Nome",
            sortable: true,
            render: (r) => (
              <>
                {r.nome}
                {r.site && (
                  <Typography variant="caption" display="block" color="text.secondary">
                    {r.site}
                  </Typography>
                )}
              </>
            ),
          },
          { key: "uf", header: "UF", align: "center", sortable: true },
          { key: "cidade", header: "Cidade", sortable: true, render: (r) => r.cidade || "—" },
          ehAbaArquidiocese
            ? { key: "quantidadeDioceses", header: "Dioceses", align: "center", sortable: true }
            : { key: "arquidioceseNome", header: "Arquidiocese", sortable: true, render: (r) => r.arquidioceseNome || "—" },
          {
            key: "status",
            header: "Status",
            align: "center",
            sortable: true,
            sortValue: (r) => (r.ativo ? 1 : 0),
            render: (r) => <StatusChip label={r.ativo ? "Ativa" : "Inativa"} color={r.ativo ? "success" : "default"} />,
          },
          {
            key: "acoes",
            header: "Ações",
            align: "center",
            render: (r) => <RowActions actions={[{ label: "Editar", icon: <EditIcon fontSize="small" />, onClick: () => abrirEdicao(r) }]} />,
          },
        ]}
      />

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
            slotProps={{ htmlInput: { maxLength: 150 } }}
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
              slotProps={{ htmlInput: { maxLength: 100 } }}
            />
          </Box>
          <TextField
            label="Site"
            value={form.site}
            onChange={(e) => setForm({ ...form, site: e.target.value })}
            fullWidth
            placeholder="https://..."
            slotProps={{ htmlInput: { inputMode: "url", maxLength: 255 } }}
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
      </PageContainer>
    </Menu>
  );
};

export default DiocesesPage;
