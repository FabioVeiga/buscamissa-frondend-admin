import { useState, useEffect, useCallback } from "react";
import Menu from "./Components/Menu";
import PageHeader from "./Components/PageHeader";
import PageContainer from "./Components/PageContainer";
import DataTable from "./Components/DataTable";
import StatusChip from "./Components/StatusChip";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import api from "./services/apiService";

const TIPOS = [
  { valor: 1, label: "Própria", selo: "BuscaMissa" },
  { valor: 2, label: "Patrocinada", selo: "Patrocinado" },
];

const STATUS = {
  1: { label: "Rascunho", cor: "default" },
  2: { label: "Aprovada", cor: "success" },
  3: { label: "Pausada", cor: "warning" },
  4: { label: "Encerrada", cor: "info" },
};

const POSICOES = [
  { valor: "fim_resultados", label: "Resultados (meio da lista na home/cidade; fim no estado)" },
  { valor: "detalhe_igreja", label: "Página da paróquia (com aviso de conteúdo patrocinado)" },
  { valor: "home", label: "Home (sem busca)" },
];

const CATEGORIAS = [
  ["livraria_papelaria", "Livraria / papelaria"],
  ["artigos_religiosos", "Artigos religiosos"],
  ["varejo_geral", "Varejo geral"],
  ["alimentacao_gastronomia", "Alimentação / gastronomia"],
  ["educacao_cursos", "Educação / cursos"],
  ["saude_bem_estar", "Saúde / bem-estar"],
  ["servicos_profissionais", "Serviços profissionais"],
  ["imobiliario", "Imobiliário"],
  ["financeiro_seguros", "Financeiro / seguros"],
  ["turismo_hospedagem", "Turismo / hospedagem"],
  ["turismo_religioso_peregrinacao", "Turismo religioso / peregrinação"],
  ["eventos_shows_retiros", "Eventos / shows / retiros"],
  ["midia_editorial", "Mídia / editorial"],
  ["musica_audiovisual", "Música / audiovisual"],
  ["instituicao_ong_causa_social", "Instituição / ONG / causa social"],
  ["comunidade_pastoral_movimento", "Comunidade / pastoral / movimento"],
  ["outros", "Outros (aprovação reforçada)"],
];

const LIMITE_IMAGEM = 300 * 1024;

const FORM_VAZIO = {
  tipo: 1,
  nomeInterno: "",
  titulo: "",
  textoCurto: "",
  linkDestino: "https://",
  categoria: "outros",
  posicoes: ["fim_resultados"],
  dataInicio: "",
  dataFim: "",
  limiteImpressoes: "",
  limiteCliques: "",
};

const pad = (n) => String(n).padStart(2, "0");
const iso = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

// Atalho "mês inteiro": dia 1 ao último dia do mês (preço é mensal, sem proporcional).
const mesInteiro = (mesOffset) => {
  const hoje = new Date();
  const inicio = new Date(hoje.getFullYear(), hoje.getMonth() + mesOffset, 1);
  const fim = new Date(hoje.getFullYear(), hoje.getMonth() + mesOffset + 1, 0);
  return { dataInicio: iso(inicio), dataFim: iso(fim) };
};

const paraNumero = (v) => (v === "" || v === null ? null : Number(v));

const lerBase64 = (arquivo) =>
  new Promise((resolve, reject) => {
    const leitor = new FileReader();
    leitor.onload = () => resolve(String(leitor.result).split(",")[1]);
    leitor.onerror = reject;
    leitor.readAsDataURL(arquivo);
  });

const CampanhasPage = () => {
  const [campanhas, setCampanhas] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogAberto, setDialogAberto] = useState(false);
  const [editando, setEditando] = useState(null);
  const [form, setForm] = useState(FORM_VAZIO);
  const [imagemAtual, setImagemAtual] = useState(null);
  const [arquivo, setArquivo] = useState(null);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState(null);
  const [aviso, setAviso] = useState(null);

  const carregar = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await api.get("/api/v1/admin/campanhas");
      setCampanhas(response.data?.data || []);
    } catch (error) {
      console.error("Erro ao buscar campanhas:", error);
      setCampanhas([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const abrirNova = () => {
    setEditando(null);
    setForm({ ...FORM_VAZIO, ...mesInteiro(0) });
    setImagemAtual(null);
    setArquivo(null);
    setErro(null);
    setDialogAberto(true);
  };

  const abrirEdicao = (c) => {
    setEditando(c);
    setForm({
      tipo: c.tipo,
      nomeInterno: c.nomeInterno,
      titulo: c.titulo,
      textoCurto: c.textoCurto || "",
      linkDestino: c.linkDestino,
      categoria: c.categoria,
      posicoes: c.posicoes,
      dataInicio: c.dataInicio,
      dataFim: c.dataFim,
      limiteImpressoes: c.limiteImpressoes ?? "",
      limiteCliques: c.limiteCliques ?? "",
    });
    setImagemAtual(c.imagemUrl);
    setArquivo(null);
    setErro(null);
    setDialogAberto(true);
  };

  const alterar = (campo) => (e) => setForm((f) => ({ ...f, [campo]: e.target.value }));

  const alternarPosicao = (valor) =>
    setForm((f) => ({
      ...f,
      posicoes: f.posicoes.includes(valor) ? f.posicoes.filter((p) => p !== valor) : [...f.posicoes, valor],
    }));

  const escolherArquivo = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(f.type)) {
      setErro("Use uma imagem JPG, PNG ou WebP.");
      return;
    }
    if (f.size > LIMITE_IMAGEM) {
      setErro("A imagem deve ter até 300 KB.");
      return;
    }
    setErro(null);
    setArquivo(f);
  };

  const salvar = async () => {
    setSalvando(true);
    setErro(null);
    try {
      const corpo = {
        tipo: form.tipo,
        nomeInterno: form.nomeInterno,
        titulo: form.titulo,
        textoCurto: form.textoCurto || null,
        linkDestino: form.linkDestino,
        categoria: form.categoria,
        posicoes: form.posicoes,
        escopo: "nacional",
        dataInicio: form.dataInicio,
        dataFim: form.dataFim,
        limiteImpressoes: paraNumero(form.limiteImpressoes),
        limiteCliques: paraNumero(form.limiteCliques),
      };
      const resposta = editando
        ? await api.put(`/api/v1/admin/campanhas/${editando.id}`, corpo)
        : await api.post("/api/v1/admin/campanhas", corpo);
      const id = resposta.data?.data?.id;
      if (arquivo && id) {
        await api.post(`/api/v1/admin/campanhas/${id}/imagem`, { base64: await lerBase64(arquivo) });
      }
      setDialogAberto(false);
      carregar();
    } catch (e) {
      setErro(e.response?.data?.data || "Erro ao salvar. Tente novamente.");
    } finally {
      setSalvando(false);
    }
  };

  const acao = async (c, rota) => {
    setAviso(null);
    try {
      await api.post(`/api/v1/admin/campanhas/${c.id}/${rota}`);
      carregar();
    } catch (e) {
      setAviso(e.response?.data?.data || "Não foi possível concluir a ação.");
    }
  };

  const selo = TIPOS.find((t) => t.valor === form.tipo)?.selo;
  const urlPreview = arquivo ? URL.createObjectURL(arquivo) : imagemAtual;

  return (
    <Menu>
      <PageContainer>
        <PageHeader
          title="Campanhas"
          subtitle="Anúncios próprios e patrocinados. Só vão ao ar depois de aprovados; sem campanha ativa, nada é exibido no site."
          actions={
            <Button variant="contained" startIcon={<AddIcon />} onClick={abrirNova}>
              Nova campanha
            </Button>
          }
        />
        {aviso && (
          <Alert severity="warning" sx={{ mb: 2 }} onClose={() => setAviso(null)}>
            {aviso}
          </Alert>
        )}
        <DataTable
          loading={isLoading}
          rows={campanhas}
          getRowKey={(c) => c.id}
          pageSize={25}
          emptyTitle="Nenhuma campanha cadastrada"
          columns={[
            {
              key: "titulo",
              header: "Campanha",
              sortable: true,
              render: (c) => (
                <>
                  {c.titulo}
                  <Typography variant="caption" display="block" color="text.secondary">
                    {c.nomeInterno}
                  </Typography>
                </>
              ),
            },
            { key: "tipo", header: "Tipo", sortable: true, sortValue: (c) => c.tipo, render: (c) => TIPOS.find((t) => t.valor === c.tipo)?.label },
            {
              key: "periodo",
              header: "Período",
              sortable: true,
              sortValue: (c) => c.dataInicio,
              render: (c) => `${new Date(`${c.dataInicio}T00:00`).toLocaleDateString("pt-BR")} a ${new Date(`${c.dataFim}T00:00`).toLocaleDateString("pt-BR")}`,
            },
            { key: "posicoes", header: "Posições", render: (c) => c.posicoes.join(", ") },
            {
              key: "status",
              header: "Status",
              sortable: true,
              sortValue: (c) => c.status,
              render: (c) => <StatusChip label={STATUS[c.status]?.label} color={STATUS[c.status]?.cor || "default"} />,
            },
            {
              key: "acoes",
              header: "Ações",
              render: (c) => (
                <Stack direction="row" spacing={1}>
                  <Button size="small" onClick={() => abrirEdicao(c)}>Editar</Button>
                  {(c.status === 1 || c.status === 3) && <Button size="small" onClick={() => acao(c, "aprovar")}>Aprovar</Button>}
                  {c.status === 2 && <Button size="small" onClick={() => acao(c, "pausar")}>Pausar</Button>}
                  {c.status !== 4 && <Button size="small" color="error" onClick={() => acao(c, "encerrar")}>Encerrar</Button>}
                </Stack>
              ),
            },
          ]}
        />

        <Dialog open={dialogAberto} onClose={() => !salvando && setDialogAberto(false)} maxWidth="sm" fullWidth>
          <DialogTitle>{editando ? "Editar campanha" : "Nova campanha"}</DialogTitle>
          <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: "8px !important" }}>
            {erro && <Alert severity="error">{erro}</Alert>}
            {editando?.status === 2 && (
              <Alert severity="info">Alterar uma campanha aprovada a devolve para rascunho (nova aprovação).</Alert>
            )}
            <TextField select label="Tipo (define o selo)" value={form.tipo} onChange={alterar("tipo")}>
              {TIPOS.map((t) => (
                <MenuItem key={t.valor} value={t.valor}>{t.label} — selo &quot;{t.selo}&quot;</MenuItem>
              ))}
            </TextField>
            <TextField label="Nome interno (anunciante)" value={form.nomeInterno} onChange={alterar("nomeInterno")} />
            <TextField label="Título do anúncio" value={form.titulo} onChange={alterar("titulo")} inputProps={{ maxLength: 120 }} />
            <TextField label="Texto curto (opcional)" value={form.textoCurto} onChange={alterar("textoCurto")} inputProps={{ maxLength: 255 }} />
            <TextField label="Link de destino (https)" value={form.linkDestino} onChange={alterar("linkDestino")} helperText="O UTM é acrescentado automaticamente." />
            <TextField select label="Categoria" value={form.categoria} onChange={alterar("categoria")}>
              {CATEGORIAS.map(([v, l]) => (
                <MenuItem key={v} value={v}>{l}</MenuItem>
              ))}
            </TextField>
            <Box>
              <Typography variant="body2" color="text.secondary">Posições</Typography>
              {POSICOES.map((p) => (
                <FormControlLabel
                  key={p.valor}
                  control={<Checkbox checked={form.posicoes.includes(p.valor)} onChange={() => alternarPosicao(p.valor)} />}
                  label={p.label}
                />
              ))}
            </Box>
            <TextField label="Escopo" value="Nacional" disabled helperText="UF e regional serão habilitados em fase futura." />
            <Stack direction="row" spacing={2}>
              <TextField type="date" label="Início" value={form.dataInicio} onChange={alterar("dataInicio")} InputLabelProps={{ shrink: true }} fullWidth />
              <TextField type="date" label="Fim" value={form.dataFim} onChange={alterar("dataFim")} InputLabelProps={{ shrink: true }} fullWidth />
            </Stack>
            <Stack direction="row" spacing={1}>
              <Button size="small" onClick={() => setForm((f) => ({ ...f, ...mesInteiro(0) }))}>Mês atual inteiro</Button>
              <Button size="small" onClick={() => setForm((f) => ({ ...f, ...mesInteiro(1) }))}>Próximo mês inteiro</Button>
            </Stack>
            <Stack direction="row" spacing={2}>
              <TextField type="number" label="Limite de impressões (opcional)" value={form.limiteImpressoes} onChange={alterar("limiteImpressoes")} fullWidth />
              <TextField type="number" label="Limite de cliques (opcional)" value={form.limiteCliques} onChange={alterar("limiteCliques")} fullWidth />
            </Stack>
            <Box>
              <Button variant="outlined" component="label">
                {urlPreview ? "Trocar imagem" : "Enviar imagem"}
                <input hidden type="file" accept="image/jpeg,image/png,image/webp" onChange={escolherArquivo} />
              </Button>
              <Typography variant="caption" display="block" color="text.secondary">
                Imagem única, até 300 KB (JPG/PNG/WebP). Topo/home 1200×300; card 600×600.
              </Typography>
            </Box>
            <Box sx={{ border: "1px dashed", borderColor: "divider", borderRadius: 1, p: 1.5 }}>
              <Typography variant="caption" color="text.secondary">Pré-visualização</Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5, mt: 0.5 }}>
                <Box component="span" sx={{ alignSelf: "flex-start", fontSize: 11, fontWeight: 600, px: 0.75, borderRadius: 0.5, bgcolor: "action.selected" }}>
                  {selo}
                </Box>
                {urlPreview && <Box component="img" src={urlPreview} alt="" sx={{ maxWidth: "100%", borderRadius: 1 }} />}
                <Typography variant="subtitle2">{form.titulo || "Título do anúncio"}</Typography>
                {form.textoCurto && <Typography variant="body2" color="text.secondary">{form.textoCurto}</Typography>}
              </Box>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDialogAberto(false)} disabled={salvando}>Cancelar</Button>
            <Button variant="contained" onClick={salvar} disabled={salvando}>Salvar</Button>
          </DialogActions>
        </Dialog>
      </PageContainer>
    </Menu>
  );
};

export default CampanhasPage;
